import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../config/index.js';
import { AppError } from './errorHandler.js';
import { User } from '../models/User.js';

export const hashPassword = (plain) => bcrypt.hash(plain, 12);
export const comparePassword = (plain, hash) => bcrypt.compare(plain, hash);

export const signToken = (payload, options = {}) =>
  jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn, ...options });

export const verifyToken = (token) => jwt.verify(token, config.jwtSecret);

const extractToken = (req) => {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.split(' ')[1];
  return req.cookies?.token || null;
};

export const protect = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) {
      return next(new AppError('Not authenticated', 401, 'NO_TOKEN'));
    }
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select('-passwordHash -resetToken -resetExpires');
    if (!user || user.status !== 'active') {
      return next(new AppError('User not found or inactive', 401, 'USER_INACTIVE'));
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) return next();
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select('-passwordHash -resetToken -resetExpires');
    if (user && user.status === 'active') {
      req.user = user;
    }
    next();
  } catch {
    next();
  }
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Not authenticated', 401, 'NO_AUTH'));
  }
  if (!roles.includes(req.user.role)) {
    return next(new AppError('Access denied', 403, 'FORBIDDEN'));
  }
  next();
};

export const protectAdmin = [protect, requireRole('admin')];
