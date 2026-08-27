import crypto from 'crypto';
import { config } from '../config/index.js';

export const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
export const OTP_RESEND_COOLDOWN_MS = 30 * 1000; // 30 seconds
export const OTP_MAX_SENDS_PER_WINDOW = 3;
export const OTP_SEND_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
export const OTP_MAX_VERIFY_ATTEMPTS = 5;

export const generateOtp = () => String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');

export const hashOtp = (otp) =>
  crypto.createHmac('sha256', config.otpSecret).update(String(otp)).digest('hex');

export const verifyOtpHash = (otp, hash) => {
  if (!otp || !hash) return false;
  const candidate = hashOtp(otp);
  const a = Buffer.from(candidate, 'hex');
  const b = Buffer.from(hash, 'hex');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
};

/**
 * Enforces the resend cooldown (against the LAST send) and the rolling send-window
 * cap (against the window's anchor timestamp) for an OTP channel. These are two
 * distinct timestamps — the cooldown must reset on every send, but the window
 * anchor must NOT, or the rate-limit cap never actually triggers.
 *
 * Returns { allowed: true, nextSendCount, nextRequestedAt, nextWindowStart }
 * or { allowed: false, reason, retryAfterMs }.
 */
export const checkOtpSendWindow = (lastRequestedAt, sendCount, windowStart) => {
  const now = Date.now();

  if (lastRequestedAt) {
    const elapsed = now - new Date(lastRequestedAt).getTime();
    if (elapsed < OTP_RESEND_COOLDOWN_MS) {
      return {
        allowed: false,
        reason: 'COOLDOWN',
        retryAfterMs: OTP_RESEND_COOLDOWN_MS - elapsed,
      };
    }
  }

  const windowIsActive = windowStart && now - new Date(windowStart).getTime() < OTP_SEND_WINDOW_MS;
  const effectiveWindowStart = windowIsActive ? new Date(windowStart) : new Date(now);
  const effectiveCount = windowIsActive ? sendCount || 0 : 0;

  if (effectiveCount >= OTP_MAX_SENDS_PER_WINDOW) {
    const retryAfterMs = OTP_SEND_WINDOW_MS - (now - effectiveWindowStart.getTime());
    return { allowed: false, reason: 'RATE_LIMITED', retryAfterMs: Math.max(retryAfterMs, 0) };
  }

  return {
    allowed: true,
    nextSendCount: effectiveCount + 1,
    nextRequestedAt: new Date(now),
    nextWindowStart: effectiveWindowStart,
  };
};

export const maskEmail = (email) => {
  const value = String(email || '');
  const at = value.indexOf('@');
  if (at <= 1) return value ? '[redacted]' : '[missing]';
  return `${value[0]}***${value.slice(at - 1)}`;
};

export const maskPhone = (phone) => {
  const value = String(phone || '');
  if (value.length < 4) return '[missing]';
  return `${value.slice(0, value.length - 4).replace(/\d/g, '*')}${value.slice(-4)}`;
};
