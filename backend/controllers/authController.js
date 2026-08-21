import { User } from '../models/User.js';
import { AppError } from '../middleware/errorHandler.js';
import { comparePassword, hashPassword, signToken } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { sendRegistrationWelcome, sendPasswordReset } from '../services/email.js';
import { generateResetToken, hashResetToken, safeUser } from '../utils/index.js';
import { config } from '../config/index.js';

export const validateRegister = [
  body('name').trim().isLength({ min: 2, max: 80 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6, max: 64 }),
];

export const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError(errors.array()[0].msg || 'Invalid input', 400, 'VALIDATION'));
    }
    const { name, email, password, phone, phoneCountry } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return next(new AppError('Email already registered', 409, 'DUPLICATE_EMAIL'));
    }
    let normalizedPhone = null;
    let normalizedPhoneCountry = null;
    if (phone && String(phone).trim()) {
      const parsedPhone = parsePhoneNumberFromString(String(phone), phoneCountry || undefined);
      if (!parsedPhone || !parsedPhone.isValid()) {
        return next(new AppError('Invalid phone number for the selected country', 400, 'INVALID_PHONE'));
      }
      normalizedPhone = parsedPhone.format('E.164');
      normalizedPhoneCountry = parsedPhone.country || phoneCountry || null;
    }
    const passwordHash = await hashPassword(password);
    const user = new User({
      name,
      email,
      passwordHash,
      phone: normalizedPhone,
      phoneCountry: normalizedPhoneCountry,
      role: 'user',
    });
    await user.save();

    await sendRegistrationWelcome(safeUser(user));
    const token = signToken({ id: user.id, role: user.role });
    res.status(201).json({
      success: true,
      token,
      user: safeUser(user),
    });
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
    if (!token || !password || password.length < 6) {
      return next(new AppError('Invalid token or password (min 6 chars)', 400));
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
