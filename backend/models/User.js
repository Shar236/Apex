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
    pendingEmail: { type: String, select: false, default: null },
    pendingEmailToken: { type: String, select: false, default: null },
    pendingEmailExpires: { type: Date, select: false, default: null },
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
        delete ret.pendingEmailToken;
        delete ret.pendingEmailExpires;
        delete ret.__v;
        return ret;
      },
    },
  }
);

userSchema.index({ email: 1, role: 1 });

export const User = mongoose.model('User', userSchema);
