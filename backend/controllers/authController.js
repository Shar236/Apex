import { User } from '../models/User.js';
import { AppError } from '../middleware/errorHandler.js';
import { comparePassword, hashPassword, signToken } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { sendRegistrationWelcome, sendPasswordReset, sendRegistrationOtp } from '../services/email.js';
import { generateResetToken, hashResetToken, safeUser } from '../utils/index.js';
import {
  generateOtp,
  hashOtp,
  verifyOtpHash,
  checkOtpSendWindow,
  OTP_EXPIRY_MS,
  OTP_MAX_VERIFY_ATTEMPTS,
} from '../utils/otp.js';
import { validatePasswordStrength } from '../utils/password.js';

export const validateRegister = [
  body('name').trim().isLength({ min: 2, max: 80 }),
  body('email').isEmail().normalizeEmail(),
  body('password').custom((value) => {
    const err = validatePasswordStrength(value);
    if (err) throw new Error(err);
    return true;
  }),
];

export const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError(errors.array()[0].msg || 'Invalid input', 400, 'VALIDATION'));
    }
    const { name, email, password, phone, phoneCountry } = req.body;

    if (!phone || !String(phone).trim()) {
      return next(new AppError('Phone number is required', 400, 'PHONE_REQUIRED'));
    }

    const existing = await User.findOne({ email }).select(
      '+emailVerifyRequestedAt +emailVerifySendCount +emailVerifyWindowStart'
    );

    const parsedPhone = parsePhoneNumberFromString(String(phone), phoneCountry || undefined);
    if (!parsedPhone || !parsedPhone.isValid()) {
      return next(new AppError('Invalid phone number for the selected country', 400, 'INVALID_PHONE'));
    }
    const normalizedPhone = parsedPhone.format('E.164');
    const normalizedPhoneCountry = parsedPhone.country || phoneCountry || null;
    const phoneTaken = await User.findOne({
      phone: normalizedPhone,
      _id: { $ne: existing?._id },
    });
    if (phoneTaken) {
      return next(new AppError('This phone number is already associated with another account.', 409, 'PHONE_IN_USE'));
    }

    const passwordHash = await hashPassword(password);

    let user;
    let otp;
    if (existing && existing.emailVerified) {
      return next(new AppError('Email already registered', 409, 'DUPLICATE_EMAIL'));
    } else if (existing && !existing.emailVerified) {
      // Resume an abandoned registration: refresh the details/password and resend a code
      // instead of permanently blocking this email because a prior signup was never completed.
      const window = checkOtpSendWindow(
        existing.emailVerifyRequestedAt,
        existing.emailVerifySendCount,
        existing.emailVerifyWindowStart
      );
      if (!window.allowed) {
        const message =
          window.reason === 'COOLDOWN'
            ? `Please wait ${Math.ceil(window.retryAfterMs / 1000)} seconds before requesting another code.`
            : 'Too many verification codes requested. Please try again later.';
        return next(new AppError(message, 429, window.reason));
      }
      existing.name = name;
      existing.passwordHash = passwordHash;
      existing.phone = normalizedPhone;
      existing.phoneCountry = normalizedPhoneCountry;
      user = existing;
      otp = applyOtp(user, window);
    } else {
      user = new User({
        name,
        email,
        passwordHash,
        phone: normalizedPhone,
        phoneCountry: normalizedPhoneCountry,
        role: 'user',
        emailVerified: false,
      });
      const freshWindow = checkOtpSendWindow(null, 0, null);
      otp = applyOtp(user, freshWindow);
    }

    await user.save();

    try {
      await sendRegistrationOtp(user, otp);
    } catch (emailErr) {
      console.error('[register] Failed to send verification email:', emailErr.message);
      return next(new AppError("We couldn't send the verification code. Please try again in a moment.", 500, 'EMAIL_SEND_FAILED'));
    }

    res.status(201).json({
      success: true,
      pendingVerification: true,
      email: user.email,
      message: `Verification code sent to ${user.email}.`,
    });
  } catch (err) {
    if (err?.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0];
      if (field === 'phone') {
        return next(new AppError('This phone number is already associated with another account.', 409, 'PHONE_IN_USE'));
      }
      return next(new AppError('This email is already associated with another account.', 409, 'DUPLICATE_EMAIL'));
    }
    next(err);
  }
};

function applyOtp(user, window) {
  const otp = generateOtp();
  user.emailVerifyOtpHash = hashOtp(otp);
  user.emailVerifyOtpExpires = new Date(Date.now() + OTP_EXPIRY_MS);
  user.emailVerifyOtpAttempts = 0;
  user.emailVerifyRequestedAt = window.nextRequestedAt;
  user.emailVerifySendCount = window.nextSendCount;
  user.emailVerifyWindowStart = window.nextWindowStart;
  return otp;
}

export const verifyRegistrationOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body || {};
    if (!email || !otp) {
      return next(new AppError('Email and verification code required', 400, 'MISSING_FIELDS'));
    }

    const user = await User.findOne({ email: String(email).trim().toLowerCase() }).select(
      '+emailVerifyOtpHash +emailVerifyOtpExpires +emailVerifyOtpAttempts'
    );
    if (!user || user.emailVerified) {
      return next(new AppError('Invalid or already-verified account', 400, 'INVALID_REQUEST'));
    }

    if (!user.emailVerifyOtpExpires || user.emailVerifyOtpExpires < new Date()) {
      return next(new AppError('The verification code has expired. Please request a new code.', 400, 'OTP_EXPIRED'));
    }
    if (user.emailVerifyOtpAttempts >= OTP_MAX_VERIFY_ATTEMPTS) {
      return next(new AppError('Too many verification attempts. Please request a new code.', 429, 'OTP_MAX_ATTEMPTS'));
    }
    if (!verifyOtpHash(otp, user.emailVerifyOtpHash)) {
      user.emailVerifyOtpAttempts += 1;
      await user.save();
      return next(new AppError('Incorrect verification code. Please try again.', 400, 'OTP_INVALID'));
    }

    user.emailVerified = true;
    user.emailVerifyOtpHash = undefined;
    user.emailVerifyOtpExpires = undefined;
    user.emailVerifyOtpAttempts = 0;
    user.emailVerifyRequestedAt = undefined;
    user.emailVerifySendCount = 0;
    user.lastLoginAt = new Date();
    await user.save();

    sendRegistrationWelcome(safeUser(user)).catch((err) =>
      console.error('[register] Failed to send welcome email:', err.message)
    );

    const token = signToken({ id: user.id, role: user.role });
    res.json({ success: true, token, user: safeUser(user) });
  } catch (err) {
    next(err);
  }
};

export const resendRegistrationOtp = async (req, res, next) => {
  try {
    const { email } = req.body || {};
    if (!email) return next(new AppError('Email required', 400, 'MISSING_FIELDS'));

    const user = await User.findOne({ email: String(email).trim().toLowerCase() }).select(
      '+emailVerifyRequestedAt +emailVerifySendCount +emailVerifyWindowStart'
    );
    // Avoid confirming/denying account existence in the response wording.
    if (!user || user.emailVerified) {
      return res.json({ success: true, message: 'If a pending registration exists for this email, a new code has been sent.' });
    }

    const window = checkOtpSendWindow(user.emailVerifyRequestedAt, user.emailVerifySendCount, user.emailVerifyWindowStart);
    if (!window.allowed) {
      const message =
        window.reason === 'COOLDOWN'
          ? `Please wait ${Math.ceil(window.retryAfterMs / 1000)} seconds before requesting another code.`
          : 'Too many verification codes requested. Please try again later.';
      return next(new AppError(message, 429, window.reason));
    }

    const otp = applyOtp(user, window);
    await user.save();

    await sendRegistrationOtp(user, otp);
    res.json({ success: true, message: `Verification code sent to ${user.email}.` });
  } catch (err) {
    next(err);
  }
};

export const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 1 }),
];

export const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(new AppError('Invalid input', 400));
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) return next(new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS'));
    if (user.status !== 'active') return next(new AppError('Account disabled', 403, 'ACCOUNT_DISABLED'));
    const ok = await comparePassword(password, user.passwordHash);
    if (!ok) return next(new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS'));
    if (!user.emailVerified) {
      return next(new AppError('Please verify your email address to continue.', 403, 'EMAIL_NOT_VERIFIED'));
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = signToken({ id: user.id, role: user.role });
    res.json({
      success: true,
      token,
      user: safeUser(user),
    });
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return next(new AppError('Email required', 400));
    const user = await User.findOne({ email });
    if (!user) return res.json({ success: true, sent: true });
    const token = generateResetToken();
    user.resetToken = hashResetToken(token);
    user.resetExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();
    await sendPasswordReset(safeUser(user), token);
    res.json({ success: true, sent: true });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token) {
      return next(new AppError('Invalid or expired token', 400, 'EXPIRED_TOKEN'));
    }
    const strengthError = validatePasswordStrength(password);
    if (strengthError) {
      return next(new AppError(strengthError, 400, 'WEAK_PASSWORD'));
    }
    const hashed = hashResetToken(token);
    const user = await User.findOne({
      resetToken: hashed,
      resetExpires: { $gt: new Date() },
    });
    if (!user) return next(new AppError('Invalid or expired token', 400, 'EXPIRED_TOKEN'));
    user.passwordHash = await hashPassword(password);
    user.resetToken = undefined;
    user.resetExpires = undefined;
    await user.save();
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

export const me = async (req, res, next) => {
  try {
    res.json({ success: true, user: safeUser(req.user) });
  } catch (err) {
    next(err);
  }
};
