import { Order } from '../models/Order.js';
import { VoucherCode } from '../models/VoucherCode.js';
import { User } from '../models/User.js';
import { AppError } from '../middleware/errorHandler.js';
import { safeUser, generateResetToken, hashResetToken } from '../utils/index.js';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { sendEmailChangeVerification } from '../services/email.js';
import { comparePassword, hashPassword } from '../middleware/auth.js';
import { config } from '../config/index.js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const avatarsDir = path.join(__dirname, '../public/uploads/avatars');

// ── Helpers ───────────────────────────────────────────────────────────────────

const NAME_REGEX = /^[\p{L}\p{M}' \-\.]+$/u;
const MAX_NAME_LENGTH = 80;
const MIN_NAME_LENGTH = 2;

const validateName = (name) => {
  if (typeof name !== 'string') return 'Name is required';
  const trimmed = name.trim();
  if (trimmed.length < MIN_NAME_LENGTH) return `Name must be at least ${MIN_NAME_LENGTH} characters`;
  if (trimmed.length > MAX_NAME_LENGTH) return `Name must be at most ${MAX_NAME_LENGTH} characters`;
  if (!NAME_REGEX.test(trimmed)) return 'Name contains invalid characters';
  return null;
};

const validatePhone = (phone, country) => {
  if (!phone || phone.trim() === '') return { error: null, formatted: null, countryCode: null };
  try {
    const parsed = parsePhoneNumberFromString(phone, country || undefined);
    if (!parsed || !parsed.isValid()) {
      return { error: 'Invalid phone number for the selected country' };
    }
    return {
      error: null,
      formatted: parsed.format('E.164'),
      countryCode: parsed.country || country || null,
    };
  } catch {
    return { error: 'Could not parse phone number' };
  }
};

// ── Get Account ───────────────────────────────────────────────────────────────

export const getAccount = async (req, res, next) => {
  try {
    res.json({ success: true, user: safeUser(req.user) });
  } catch (err) {
    next(err);
  }
};

// ── Update Profile ────────────────────────────────────────────────────────────

export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, phoneCountry } = req.body;
    const user = req.user;
    const errors = {};

    // Validate & set name
    if (name !== undefined) {
      const nameError = validateName(name);
      if (nameError) {
        errors.name = nameError;
      } else {
        user.name = name.trim();
      }
    }

    // Validate & set phone
    if (phone !== undefined) {
      if (phone === '' || phone === null) {
        // Allow clearing phone
        user.phone = null;
        user.phoneCountry = null;
        user.phoneVerified = false;
      } else {
        const { error, formatted, countryCode } = validatePhone(phone, phoneCountry);
        if (error) {
          errors.phone = error;
        } else if (formatted) {
          const phoneChanged = user.phone !== formatted;
          user.phone = formatted;
          user.phoneCountry = countryCode || phoneCountry || null;
          if (phoneChanged) {
            user.phoneVerified = false;
          }
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }

    await user.save();
    res.json({ success: true, user: safeUser(user), message: 'Profile updated successfully' });
  } catch (err) {
    next(err);
  }
};

// ── Upload Profile Image ──────────────────────────────────────────────────────

export const uploadProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('No image file provided', 400, 'NO_FILE'));
    }

    const user = req.user;
    const uploadedPath = req.file.path;
    const ext = path.extname(req.file.filename).toLowerCase();

    // Compress/resize with sharp (max 512x512, quality 80)
    const optimizedFilename = `avatar_${user._id}_${Date.now()}.webp`;
    const optimizedPath = path.join(avatarsDir, optimizedFilename);

    try {
      await sharp(uploadedPath)
        .resize(512, 512, { fit: 'cover', position: 'centre' })
        .webp({ quality: 80 })
        .toFile(optimizedPath);

      // Remove the original unoptimized upload
      fs.unlink(uploadedPath, () => {});
    } catch (sharpErr) {
      // If sharp fails, fall back to using the original file
      console.error('[avatar] Sharp processing failed, using original:', sharpErr.message);
      // Keep original file as-is
      const fallbackUrl = `/uploads/avatars/${req.file.filename}`;
      // Delete old avatar if exists
      if (user.profileImageUrl) {
        const oldPath = path.join(__dirname, '../public', user.profileImageUrl);
        fs.unlink(oldPath, () => {});
      }
      user.profileImageUrl = fallbackUrl;
      await user.save();
      return res.json({ success: true, user: safeUser(user), message: 'Profile picture updated' });
    }

    // Delete old avatar if exists
    if (user.profileImageUrl) {
      const oldPath = path.join(__dirname, '../public', user.profileImageUrl);
      fs.unlink(oldPath, () => {});
    }

    user.profileImageUrl = `/uploads/avatars/${optimizedFilename}`;
    await user.save();

    res.json({ success: true, user: safeUser(user), message: 'Profile picture updated' });
  } catch (err) {
    // Clean up uploaded file on error
    if (req.file?.path) fs.unlink(req.file.path, () => {});
    next(err);
  }
};

// ── Remove Profile Image ─────────────────────────────────────────────────────

export const removeProfileImage = async (req, res, next) => {
  try {
    const user = req.user;
    if (user.profileImageUrl) {
      const oldPath = path.join(__dirname, '../public', user.profileImageUrl);
      fs.unlink(oldPath, () => {});
    }
    user.profileImageUrl = null;
    await user.save();
    res.json({ success: true, user: safeUser(user), message: 'Profile picture removed' });
  } catch (err) {
    next(err);
  }
};

// ── Request Email Change ──────────────────────────────────────────────────────

export const requestEmailChange = async (req, res, next) => {
  try {
    const { newEmail } = req.body;
    if (!newEmail || !/^\S+@\S+\.\S+$/.test(newEmail)) {
      return next(new AppError('Valid email address required', 400, 'INVALID_EMAIL'));
    }

    const normalizedEmail = newEmail.trim().toLowerCase();
    if (normalizedEmail === req.user.email) {
      return next(new AppError('New email is the same as current email', 400, 'SAME_EMAIL'));
    }

    // Check if email is already in use
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return next(new AppError('This email is already associated with another account', 409, 'EMAIL_IN_USE'));
    }

    // Generate verification token
    const token = generateResetToken();
    const hashedToken = hashResetToken(token);

    // Store pending change (select: false fields need explicit update)
    await User.findByIdAndUpdate(req.user._id, {
      pendingEmail: normalizedEmail,
      pendingEmailToken: hashedToken,
      pendingEmailExpires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

    // Send verification email to the NEW address
    try {
      await sendEmailChangeVerification(req.user, normalizedEmail, token);
    } catch (emailErr) {
      console.error('[email-change] Failed to send verification email:', emailErr.message);
      return next(new AppError('Failed to send verification email. Please try again.', 500, 'EMAIL_SEND_FAILED'));
    }

    res.json({
      success: true,
      message: `Verification email sent to ${normalizedEmail}. Please check your inbox.`,
    });
  } catch (err) {
    next(err);
  }
};

// ── Verify Email Change ───────────────────────────────────────────────────────

export const verifyEmailChange = async (req, res, next) => {
  try {
    const { token } = req.body || {};
    const queryToken = req.query?.token;
    const verifyToken = token || queryToken;

    if (!verifyToken) {
      return next(new AppError('Verification token required', 400, 'NO_TOKEN'));
    }

    const hashedToken = hashResetToken(verifyToken);
    const user = await User.findOne({
      pendingEmailToken: hashedToken,
      pendingEmailExpires: { $gt: new Date() },
    }).select('+pendingEmail +pendingEmailToken +pendingEmailExpires');

    if (!user) {
      return next(new AppError('Invalid or expired verification token', 400, 'INVALID_TOKEN'));
    }

    // Check that the pending email isn't taken in the meantime
    const existing = await User.findOne({ email: user.pendingEmail, _id: { $ne: user._id } });
    if (existing) {
      user.pendingEmail = undefined;
      user.pendingEmailToken = undefined;
      user.pendingEmailExpires = undefined;
      await user.save();
      return next(new AppError('This email has been claimed by another account', 409, 'EMAIL_IN_USE'));
    }

    // Perform the email change
    user.email = user.pendingEmail;
    user.emailVerified = true;
    user.pendingEmail = undefined;
    user.pendingEmailToken = undefined;
    user.pendingEmailExpires = undefined;
    await user.save();

    // If it's a GET request (from email link), redirect to frontend
    if (req.method === 'GET') {
      const clientUrl = config.clientUrl || 'http://localhost:3000';
      return res.redirect(`${clientUrl}/account?emailChanged=true`);
    }

    res.json({ success: true, user: safeUser(user), message: 'Email updated successfully' });
  } catch (err) {
    next(err);
  }
};

// ── Change Password ───────────────────────────────────────────────────────────

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return next(new AppError('Current and new password required', 400, 'MISSING_FIELDS'));
    }
    if (newPassword.length < 6) {
      return next(new AppError('New password must be at least 6 characters', 400, 'PASSWORD_TOO_SHORT'));
    }
    if (newPassword.length > 64) {
      return next(new AppError('New password must be at most 64 characters', 400, 'PASSWORD_TOO_LONG'));
    }

    // Fetch user with password hash
    const user = await User.findById(req.user._id).select('+passwordHash');
    if (!user) {
      return next(new AppError('User not found', 404, 'USER_NOT_FOUND'));
    }

    const isMatch = await comparePassword(currentPassword, user.passwordHash);
    if (!isMatch) {
      return next(new AppError('Current password is incorrect', 401, 'WRONG_PASSWORD'));
    }

    user.passwordHash = await hashPassword(newPassword);
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
};

// ── Dashboard Stats ───────────────────────────────────────────────────────────

export const dashboardStats = async (req, res, next) => {
  try {
    const uid = req.user._id;
    const totalOrders = await Order.countDocuments({ userId: uid, orderStatus: { $nin: ['CANCELLED', 'FAILED'] } });
    const myVouchersAgg = await VoucherCode.aggregate([
      { $match: { userId: uid } },
      {
        $group: {
          _id: null,
          active: { $sum: { $cond: [{ $in: ['$status', ['ASSIGNED', 'SOLD']] }, 1, 0] } },
          used: { $sum: { $cond: [{ $eq: ['$status', 'USED'] }, 1, 0] } },
          expiring: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $in: ['$status', ['ASSIGNED', 'SOLD']] },
                    { $lte: ['$expiryDate', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);
    const savingsArr = await Order.aggregate([
      { $match: { userId: uid, orderStatus: { $in: ['PAID', 'FULFILLED'] } } },
      {
        $group: {
          _id: null,
          totalPaid: { $sum: '$total' },
          totalOriginal: {
            $sum: { $sum: { $map: { input: '$items', in: { $multiply: ['$$this.originalPrice', '$$this.quantity'] } } } },
          },
        },
      },
    ]);
    const v = myVouchersAgg[0] || { active: 0, used: 0, expiring: 0 };
    const s = savingsArr[0] || { totalPaid: 0, totalOriginal: 0 };
    res.json({
      success: true,
      data: {
        totalOrders,
        activeVouchers: v.active,
        usedVouchers: v.used,
        expiringSoon: v.expiring,
        totalSaved: Math.max(0, Math.round((s.totalOriginal || 0) - (s.totalPaid || 0))),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── My Orders ─────────────────────────────────────────────────────────────────

export const myOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
};

// ── My Vouchers ───────────────────────────────────────────────────────────────

export const myVouchers = async (req, res, next) => {
  try {
    const vouchers = await VoucherCode.find({ userId: req.user.id })
      .populate('productId', 'name brand category validityMonths')
      .populate('orderId', 'orderNo total orderStatus')
      .sort({ assignedAt: -1 })
      .lean();

    const sanitized = vouchers.map((v) => {
      const productName = v.productId?.name || '';
      const brand = v.productId?.brand || '';
      const validity = v.productId?.validityMonths || 6;
      const orderNo = v.orderId?.orderNo || null;
      const orderStatus = v.orderId?.orderStatus || null;
      const daysLeft = Math.max(
        0,
        Math.ceil((new Date(v.expiryDate) - Date.now()) / (1000 * 60 * 60 * 24))
      );
      let status = v.status;
      if (status === 'ASSIGNED' && daysLeft <= 0) status = 'EXPIRED';
      return {
        id: v._id,
        code: v.code,
        status,
        expiryDate: v.expiryDate,
        assignedAt: v.assignedAt,
        usedAt: v.usedAt || null,
        transferredTo: v.transferredTo || null,
        productName,
        brand,
        validity,
        daysRemaining: daysLeft,
        orderNo,
        orderStatus,
      };
    });
    res.json({ success: true, data: sanitized });
  } catch (err) {
    next(err);
  }
};

// ── Transfer Voucher ──────────────────────────────────────────────────────────

export const transferVoucher = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { targetEmail } = req.body;
    if (!targetEmail || !/^\S+@\S+\.\S+$/.test(targetEmail)) {
      return next(new AppError('Valid target email required', 400));
    }
    const voucher = await VoucherCode.findOne({ _id: id, userId: req.user.id });
    if (!voucher) return next(new AppError('Voucher not found', 404));
    if (!['ASSIGNED', 'SOLD'].includes(voucher.status)) {
      return next(new AppError('Voucher not transferable', 400, 'NOT_TRANSFERABLE'));
    }
    voucher.transferredTo = targetEmail.trim();
    voucher.transferredAt = new Date();
    await voucher.save();
    res.json({ success: true, data: voucher });
  } catch (err) {
    next(err);
  }
};

// ── Mark Voucher Used ─────────────────────────────────────────────────────────

export const markVoucherUsed = async (req, res, next) => {
  try {
    const { id } = req.params;
    const voucher = await VoucherCode.findOne({ _id: id, userId: req.user.id });
    if (!voucher) return next(new AppError('Voucher not found', 404));
    if (!['ASSIGNED', 'SOLD'].includes(voucher.status)) {
      return next(new AppError('Voucher not markable as used', 400));
    }
    voucher.status = 'USED';
    voucher.usedAt = new Date();
    await voucher.save();
    res.json({ success: true, data: voucher });
  } catch (err) {
    next(err);
  }
};
