import crypto from 'crypto';

export const generateOrderNo = () => {
  const ts = Date.now().toString().slice(-8);
  const rnd = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `APX-${ts}-${rnd}`;
};

export const generateResetToken = () =>
  crypto.randomBytes(32).toString('hex');

export const hashResetToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

export const escapeRegex = (value) =>
  String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const safeUser = (user) => {
  if (!user) return null;
  const u = user.toObject ? user.toObject() : user;
  delete u.passwordHash;
  delete u.resetToken;
  delete u.resetExpires;
  delete u.__v;
  return u;
};
