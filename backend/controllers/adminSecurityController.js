import { User } from '../models/User.js';
import { AppError } from '../middleware/errorHandler.js';
import { safeUser } from '../utils/index.js';
import { AuditLog } from '../models/AuditLog.js';
import { sendEmailOtpCode, sendEmailChangedSecurityNotice } from '../services/email.js';
import {
  generateOtp,
  hashOtp,
  verifyOtpHash,
  checkOtpSendWindow,
  maskEmail,
  OTP_EXPIRY_MS,
  OTP_MAX_VERIFY_ATTEMPTS,
} from '../utils/otp.js';
import { comparePassword, hashPassword } from '../middleware/auth.js';
import { validatePasswordStrength } from '../utils/password.js';

const recordAudit = async (req, action, details) => {
  try {
    if (req?.user) {
      await AuditLog.create({
        adminId: req.user._id,
        adminEmail: req.user.email,
        action,
        resourceType: 'User',
        resourceId: String(req.user._id),
        details: details || {},
        ipAddress: req.ip || req.headers['x-forwarded-for'] || null,
      });
    }
  } catch (err) {
    console.error('[audit] admin security log error:', err.message);
  }
};

export const getAdminSecurityInfo = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select(
      '+emailVerified +pendingEmail +pendingEmailRequestedAt +pendingEmailSendCount +pendingEmailWindowStart'
    );
    res.json({
      success: true,
      data: {
        email: user.email,
        emailVerified: user.emailVerified,
        pendingEmail: user.pendingEmail || null,
        name: user.name,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const sendAdminEmailOtp = async (req, res, next) => {
  try {
    const { newEmail } = req.body;
    if (!newEmail || !/^\S+@\S+\.\S+$/.test(newEmail)) {
      return next(new AppError('Valid email address required', 400, 'INVALID_EMAIL'));
    }

    const normalizedEmail = newEmail.trim().toLowerCase();
    if (normalizedEmail === req.user.email) {
      return next(new AppError('New email is the same as current email', 400, 'SAME_EMAIL'));
    }

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return next(new AppError('This email address is already associated with another account.', 409, 'EMAIL_IN_USE'));
    }

    const user = await User.findById(req.user._id).select(
      '+pendingEmailRequestedAt +pendingEmailSendCount +pendingEmailWindowStart'
    );
    const window = checkOtpSendWindow(user.pendingEmailRequestedAt, user.pendingEmailSendCount, user.pendingEmailWindowStart);
    if (!window.allowed) {
      const message =
        window.reason === 'COOLDOWN'
          ? `Please wait ${Math.ceil(window.retryAfterMs / 1000)} seconds before requesting another code.`
          : 'Too many verification codes requested. Please try again later.';
      return next(new AppError(message, 429, window.reason));
    }

    const prevWindowState = {
      pendingEmailRequestedAt: user.pendingEmailRequestedAt,
      pendingEmailSendCount: user.pendingEmailSendCount,
      pendingEmailWindowStart: user.pendingEmailWindowStart,
    };
    const otp = generateOtp();
    user.pendingEmail = normalizedEmail;
    user.pendingEmailOtpHash = hashOtp(otp);
    user.pendingEmailOtpExpires = new Date(Date.now() + OTP_EXPIRY_MS);
    user.pendingEmailOtpAttempts = 0;
    user.pendingEmailRequestedAt = window.nextRequestedAt;
    user.pendingEmailSendCount = window.nextSendCount;
    user.pendingEmailWindowStart = window.nextWindowStart;
    await user.save();

    const mail = await sendEmailOtpCode(req.user, normalizedEmail, otp);
    if (!mail.sent) {
      console.error(`[email:otp] flow=admin-change-email userId=${user._id} recipient=${maskEmail(normalizedEmail)} status=failed providerError=${mail.error || 'unknown'}`);
      user.pendingEmailRequestedAt = prevWindowState.pendingEmailRequestedAt;
      user.pendingEmailSendCount = prevWindowState.pendingEmailSendCount;
      user.pendingEmailWindowStart = prevWindowState.pendingEmailWindowStart;
      await user.save().catch(() => {});
      return next(new AppError('Unable to send verification email. Please try again.', 502, 'EMAIL_SEND_FAILED'));
    }
    console.log(`[email:otp] flow=admin-change-email userId=${user._id} recipient=${maskEmail(normalizedEmail)} status=accepted messageId=${mail.messageId || 'n/a'}`);

    await recordAudit(req, 'ADMIN_EMAIL_OTP_SENT', {
      maskedDestination: maskEmail(normalizedEmail),
    });

    res.json({
      success: true,
      message: `Verification code sent to ${maskEmail(normalizedEmail)}.`,
      maskedDestination: maskEmail(normalizedEmail),
    });
  } catch (err) {
    next(err);
  }
};

export const verifyAdminEmailOtp = async (req, res, next) => {
  try {
    const { otp } = req.body || {};
    if (!otp) {
      return next(new AppError('Verification code required', 400, 'NO_OTP'));
    }

    const user = await User.findById(req.user._id).select(
      '+pendingEmail +pendingEmailOtpHash +pendingEmailOtpExpires +pendingEmailOtpAttempts'
    );

    if (!user.pendingEmail || !user.pendingEmailOtpHash) {
      return next(new AppError('No pending email change found. Please start again.', 400, 'NO_PENDING_CHANGE'));
    }

    if (!user.pendingEmailOtpExpires || user.pendingEmailOtpExpires < new Date()) {
      return next(new AppError('The verification code has expired. Please request a new code.', 400, 'OTP_EXPIRED'));
    }

    if (user.pendingEmailOtpAttempts >= OTP_MAX_VERIFY_ATTEMPTS) {
      return next(new AppError('Too many verification attempts. Please request a new code.', 429, 'OTP_MAX_ATTEMPTS'));
    }

    if (!verifyOtpHash(otp, user.pendingEmailOtpHash)) {
      user.pendingEmailOtpAttempts += 1;
      await user.save();
      return next(new AppError('Incorrect verification code. Please try again.', 400, 'OTP_INVALID'));
    }

    const existing = await User.findOne({ email: user.pendingEmail, _id: { $ne: user._id } });
    if (existing) {
      user.pendingEmail = undefined;
      user.pendingEmailOtpHash = undefined;
      user.pendingEmailOtpExpires = undefined;
      user.pendingEmailOtpAttempts = 0;
      await user.save();
      return next(new AppError('This email address is already associated with another account.', 409, 'EMAIL_IN_USE'));
    }

    const oldEmail = user.email;
    const newEmail = user.pendingEmail;
    user.email = newEmail;
    user.emailVerified = true;
    user.pendingEmail = undefined;
    user.pendingEmailOtpHash = undefined;
    user.pendingEmailOtpExpires = undefined;
    user.pendingEmailOtpAttempts = 0;
    user.pendingEmailRequestedAt = undefined;
    user.pendingEmailSendCount = 0;
    await user.save();

    sendEmailChangedSecurityNotice(user, oldEmail, newEmail).catch((err) =>
      console.error('[admin-email-otp] Failed to send security notice:', err.message)
    );

    await recordAudit(req, 'ADMIN_EMAIL_CHANGED', {
      from: maskEmail(oldEmail),
      to: maskEmail(newEmail),
    });

    res.json({ success: true, user: safeUser(user), message: 'Admin email updated successfully' });
  } catch (err) {
    next(err);
  }
};

export const adminChangePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return next(new AppError('Current and new password required', 400, 'MISSING_FIELDS'));
    }
    if (confirmNewPassword !== undefined && newPassword !== confirmNewPassword) {
      return next(new AppError('New password and confirmation do not match', 400, 'PASSWORD_MISMATCH'));
    }

    const strengthError = validatePasswordStrength(newPassword);
    if (strengthError) {
      return next(new AppError(strengthError, 400, 'WEAK_PASSWORD'));
    }

    const user = await User.findById(req.user._id).select('+passwordHash');
    if (!user) {
      return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
    }

    const isMatch = await comparePassword(currentPassword, user.passwordHash);
    if (!isMatch) {
      return next(new AppError('Current password is incorrect', 401, 'WRONG_PASSWORD'));
    }

    const sameAsOld = await comparePassword(newPassword, user.passwordHash);
    if (sameAsOld) {
      return next(new AppError('New password must be different from the current password', 400, 'SAME_PASSWORD'));
    }

    user.passwordHash = await hashPassword(newPassword);
    await user.save();

    await recordAudit(req, 'ADMIN_PASSWORD_CHANGED', {});

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
};