import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name too short'],
      maxlength: [80, 'Name too long'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email address'],
    },
    phone: {
      type: String,
      trim: true,
      default: null,
      // NOTE: uniqueness is enforced in authController.register / accountController
      // (findOne + 409). A DB-level unique index was removed because a sparse unique
      // index fails to build over legacy docs where `phone: null` duplicates exist.
    },
    phoneCountry: {
      type: String,
      trim: true,
      default: null,
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    profileImageUrl: {
      type: String,
      default: null,
    },
    lastLoginAt: { type: Date, default: null },

    // Registration email verification (operates on the user's own `email`)
    emailVerifyOtpHash: { type: String, select: false, default: null },
    emailVerifyOtpExpires: { type: Date, select: false, default: null },
    emailVerifyOtpAttempts: { type: Number, select: false, default: 0 },
    emailVerifyRequestedAt: { type: Date, select: false, default: null },
    emailVerifySendCount: { type: Number, select: false, default: 0 },
    emailVerifyWindowStart: { type: Date, select: false, default: null },

    // Change email (swap to a new address)
    pendingEmail: { type: String, select: false, default: null },
    pendingEmailOtpHash: { type: String, select: false, default: null },
    pendingEmailOtpExpires: { type: Date, select: false, default: null },
    pendingEmailOtpAttempts: { type: Number, select: false, default: 0 },
    pendingEmailRequestedAt: { type: Date, select: false, default: null },
    pendingEmailSendCount: { type: Number, select: false, default: 0 },
    pendingEmailWindowStart: { type: Date, select: false, default: null },

    // Change / add phone
    pendingPhone: { type: String, select: false, default: null },
    pendingPhoneCountry: { type: String, select: false, default: null },
    pendingPhoneOtpHash: { type: String, select: false, default: null },
    pendingPhoneOtpExpires: { type: Date, select: false, default: null },
    pendingPhoneOtpAttempts: { type: Number, select: false, default: 0 },
    pendingPhoneRequestedAt: { type: Date, select: false, default: null },
    pendingPhoneSendCount: { type: Number, select: false, default: 0 },
    pendingPhoneWindowStart: { type: Date, select: false, default: null },

    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'disabled'],
      default: 'active',
      index: true,
    },
    resetToken: { type: String, select: false },
    resetExpires: { type: Date, select: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete ret.passwordHash;
        delete ret.resetToken;
        delete ret.resetExpires;
        delete ret.pendingEmail;
        delete ret.pendingEmailOtpHash;
        delete ret.pendingEmailOtpExpires;
        delete ret.pendingEmailOtpAttempts;
        delete ret.pendingEmailRequestedAt;
        delete ret.pendingEmailSendCount;
        delete ret.pendingEmailWindowStart;
        delete ret.pendingPhone;
        delete ret.pendingPhoneCountry;
        delete ret.pendingPhoneOtpHash;
        delete ret.pendingPhoneOtpExpires;
        delete ret.pendingPhoneOtpAttempts;
        delete ret.pendingPhoneRequestedAt;
        delete ret.pendingPhoneSendCount;
        delete ret.pendingPhoneWindowStart;
        delete ret.emailVerifyOtpHash;
        delete ret.emailVerifyOtpExpires;
        delete ret.emailVerifyOtpAttempts;
        delete ret.emailVerifyRequestedAt;
        delete ret.emailVerifySendCount;
        delete ret.emailVerifyWindowStart;
        delete ret.__v;
        return ret;
      },
    },
  }
);

userSchema.index({ email: 1, role: 1 });

export const User = mongoose.model('User', userSchema);
