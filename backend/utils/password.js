export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 64;

/**
 * Shared password-strength rule used by registration, password change, and password reset.
 * Returns a friendly error message string, or null if the password is strong enough.
 */
export const validatePasswordStrength = (password) => {
  if (typeof password !== 'string' || !password) return 'Password is required';
  if (password.length < PASSWORD_MIN_LENGTH) return `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
  if (password.length > PASSWORD_MAX_LENGTH) return `Password must be at most ${PASSWORD_MAX_LENGTH} characters`;
  if (!/[a-z]/.test(password)) return 'Password must include at least one lowercase letter';
  if (!/[A-Z]/.test(password)) return 'Password must include at least one uppercase letter';
  if (!/[0-9]/.test(password)) return 'Password must include at least one number';
  if (!/[^A-Za-z0-9]/.test(password)) return 'Password must include at least one special character';
  return null;
};
