import crypto from 'crypto';

export const generateOrderNo = () => {
  const ts = Date.now().toString().slice(-8);
  const rnd = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `APX-${ts}-${rnd}`;
};

export const generatePTEBookingRequestId = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rnd = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `PTE-${y}${m}${d}-${rnd}`;
};

export const generateVoucherRequestId = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rnd = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `VR-${y}${m}${d}-${rnd}`;
};

export const generateFulfillmentRequestId = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rnd = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `FR-${y}${m}${d}-${rnd}`;
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
  delete u.pendingEmail;
  delete u.pendingEmailOtpHash;
  delete u.pendingEmailOtpExpires;
  delete u.pendingEmailOtpAttempts;
  delete u.pendingEmailRequestedAt;
  delete u.pendingEmailSendCount;
  delete u.pendingEmailWindowStart;
  delete u.pendingPhone;
  delete u.pendingPhoneCountry;
  delete u.pendingPhoneOtpHash;
  delete u.pendingPhoneOtpExpires;
  delete u.pendingPhoneOtpAttempts;
  delete u.pendingPhoneRequestedAt;
  delete u.pendingPhoneSendCount;
  delete u.pendingPhoneWindowStart;
  delete u.emailVerifyOtpHash;
  delete u.emailVerifyOtpExpires;
  delete u.emailVerifyOtpAttempts;
  delete u.emailVerifyRequestedAt;
  delete u.emailVerifySendCount;
  delete u.emailVerifyWindowStart;
  delete u.__v;
  return u;
};

export { analyzeSEO, sanitizeRichText, slugify, detectDuplicates, countWords, stripHtml } from './seo.js';
