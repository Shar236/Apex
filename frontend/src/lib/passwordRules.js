export const PASSWORD_MIN_LENGTH = 8;

export const PASSWORD_REQUIREMENTS = [
  { key: 'length', label: `At least ${PASSWORD_MIN_LENGTH} characters`, test: (p) => p.length >= PASSWORD_MIN_LENGTH },
  { key: 'lower', label: 'One lowercase letter', test: (p) => /[a-z]/.test(p) },
  { key: 'upper', label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { key: 'number', label: 'One number', test: (p) => /[0-9]/.test(p) },
  { key: 'special', label: 'One special character', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

/** Mirrors backend/utils/password.js — client-side check to fail fast before hitting the API. */
export const validatePasswordStrength = (password) => {
  const value = password || '';
  const failed = PASSWORD_REQUIREMENTS.find((r) => !r.test(value));
  return failed ? `Password must include: ${failed.label.toLowerCase()}` : null;
};

export const isPasswordStrong = (password) => PASSWORD_REQUIREMENTS.every((r) => r.test(password || ''));
