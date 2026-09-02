'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Loader2,
  Mail,
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Send,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { adminApi } from '@/lib/api';
import { OtpInput } from '@/components/auth/otp-input';
import { PasswordStrengthChecklist } from '@/components/auth/password-strength-checklist';
import { validatePasswordStrength } from '@/lib/password-rules';
import { VerifiedBadge } from '@/components/account/helpers';
import { Label } from '@/components/admin/admin-ui';

interface AdminSecurityInfo {
  email: string;
  emailVerified: boolean;
  pendingEmail?: string | null;
  name?: string;
}

export function AdminSecurity() {
  const { user, updateAuthenticatedUser, refreshUser } = useAuth();

  const [info, setInfo] = useState<AdminSecurityInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Change email ─────────────────────────────────────────────────────────
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newEmailError, setNewEmailError] = useState<string | null>(null);
  const [emailSending, setEmailSending] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);
  const [maskedDestination, setMaskedDestination] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // ── Change password ──────────────────────────────────────────────────────
  const [passwordForm, setPasswordForm] = useState({ current: '', newPwd: '', confirm: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string | null>>({});
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const loadInfo = useCallback(async () => {
    setLoading(true);
    const res = await adminApi.security.me();
    if (res.success) setInfo(res.data as AdminSecurityInfo);
    setLoading(false);
  }, []);

  useEffect(() => {
    // Load admin security info once on mount — accepted data-fetching-in-effect
    // pattern (this app has no server loader / React Compiler).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadInfo();
  }, [loadInfo]);

  // Resend cooldown countdown (30s, mirrors backend OTP_RESEND_COOLDOWN_MS).
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const currentEmail = info?.email || user?.email || '';

  const validateEmail = (value: string): string | null => {
    const v = (value || '').trim().toLowerCase();
    if (!v) return 'Email is required';
    if (!/^\S+@\S+\.\S+$/.test(v)) return 'Enter a valid email address';
    if (v === currentEmail.toLowerCase()) return 'New email must be different from your current email';
    return null;
  };

  const submitSendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const err = validateEmail(newEmail);
    setNewEmailError(err);
    setEmailSuccess(null);
    setOtpError(null);
    if (err) return;
    setEmailSending(true);
    const res = await adminApi.security.sendEmailOtp(newEmail.trim().toLowerCase());
    setEmailSending(false);
    if (res.success) {
      setMaskedDestination(res.maskedDestination as string | null);
      setOtpStep(true);
      setOtp('');
      setResendCooldown(30);
    } else {
      setNewEmailError(res.message || 'Failed to send verification code');
    }
  };

  const submitVerifyOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!otp || otp.length < 6) {
      setOtpError('Enter the 6-digit code');
      return;
    }
    setOtpVerifying(true);
    setOtpError(null);
    const res = await adminApi.security.verifyEmailOtp(otp);
    setOtpVerifying(false);
    if (res.success) {
      setEmailSuccess('Admin email updated successfully. Verification code confirmed.');
      setShowEmailForm(false);
      setOtpStep(false);
      setNewEmail('');
      setOtp('');
      setMaskedDestination(null);
      await loadInfo();
      if (res.user) updateAuthenticatedUser(res.user);
      else refreshUser();
    } else {
      setOtpError(res.message || 'Verification failed');
    }
  };

  const cancelEmailChange = () => {
    setShowEmailForm(false);
    setOtpStep(false);
    setNewEmail('');
    setOtp('');
    setNewEmailError(null);
    setOtpError(null);
    setEmailSuccess(null);
    setMaskedDestination(null);
  };

  const resendOtp = async () => {
    if (resendCooldown > 0) return;
    setEmailSending(true);
    const res = await adminApi.security.sendEmailOtp(newEmail.trim().toLowerCase());
    setEmailSending(false);
    if (res.success) {
      setOtpError(null);
      setOtp('');
      setResendCooldown(30);
    } else {
      setOtpError(res.message || 'Failed to resend code');
    }
  };

  const submitPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string | null> = {};
    if (!passwordForm.current) errors.current = 'Current password is required';
    if (!passwordForm.newPwd) errors.newPwd = 'New password is required';
    else {
      const strengthError = validatePasswordStrength(passwordForm.newPwd);
      if (strengthError) errors.newPwd = strengthError;
    }
    if (!passwordForm.confirm) errors.confirm = 'Please confirm your new password';
    else if (passwordForm.newPwd !== passwordForm.confirm) errors.confirm = 'Passwords do not match';
    setPasswordErrors(errors);
    setPasswordSuccess(false);
    if (Object.keys(errors).length > 0) return;

    setPasswordLoading(true);
    const res = await adminApi.security.changePassword(
      passwordForm.current,
      passwordForm.newPwd,
      passwordForm.confirm
    );
    setPasswordLoading(false);

    if (res.success) {
      setPasswordSuccess(true);
      setPasswordForm({ current: '', newPwd: '', confirm: '' });
      setPasswordErrors({});
    } else {
      setPasswordErrors({ form: res.message || 'Password update failed' });
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl tracking-tight">Security &amp; Account Settings</h1>
          <p className="text-xs font-bold text-neutral-500 dark:text-[#B5B5B5]">
            Manage the admin email address and password for this dashboard.
          </p>
        </div>
        <button onClick={loadInfo} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] font-black text-xs shadow-sm hover:border-brand-pink">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {loading && !info ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-brand-pink animate-spin" />
        </div>
      ) : (
        <>
          {/* ── Admin Account ─────────────────────────────────────────────── */}
          <div className="rounded-3xl p-5 sm:p-7 bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm">
            <h3 className="font-black text-lg mb-5 text-neutral-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-brand-pink" /> Admin Account
            </h3>

            <div className="space-y-4">
              <div>
                <Label>Admin Email</Label>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="email"
                    value={currentEmail}
                    readOnly
                    className="flex-1 min-w-0 px-4 py-3 bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] rounded-2xl text-neutral-900 dark:text-white text-sm font-bold opacity-70 cursor-not-allowed"
                  />
                  <VerifiedBadge verified={!!info?.emailVerified} verifiedLabel="Verified" unverifiedLabel="Not Verified" />
                </div>
              </div>

              {!showEmailForm ? (
                <button
                  type="button"
                  onClick={() => { setShowEmailForm(true); setEmailSuccess(null); }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-xs font-black text-neutral-700 dark:text-neutral-200 hover:border-brand-pink transition"
                >
                  <Mail className="w-4 h-4" /> Change Email
                </button>
              ) : (
                <div className="rounded-2xl p-4 sm:p-5 bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929]">
                  {!otpStep ? (
                    <form onSubmit={submitSendOtp} className="space-y-4">
                      <div>
                        <Label>New Email Address</Label>
                        <input
                          type="email"
                          value={newEmail}
                          onChange={(e) => { setNewEmail(e.target.value); setNewEmailError(null); }}
                          placeholder="Enter the new admin email"
                          className={`w-full px-4 py-3 bg-white dark:bg-[#161616] border rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-pink/20 ${
                            newEmailError ? 'border-rose-400 dark:border-rose-500' : 'border-[#EAEAEA] dark:border-[#292929] focus:border-brand-pink'
                          }`}
                        />
                        {newEmailError && <p className="mt-1.5 text-xs font-bold text-rose-500">{newEmailError}</p>}
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="submit"
                          disabled={emailSending}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl btn-pink text-white font-black text-xs shadow disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {emailSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                          Send Verification Code
                        </button>
                        <button
                          type="button"
                          onClick={cancelEmailChange}
                          className="px-4 py-2.5 rounded-xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] text-xs font-black text-neutral-600 dark:text-neutral-300"
                        >
                          Cancel
                        </button>
                      </div>
                      <p className="text-[11px] font-bold text-neutral-500 dark:text-[#B5B5B5]">
                        A 6-digit verification code will be emailed to the new address. The change only takes effect after you enter the code.
                      </p>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-start gap-2">
                        <Mail className="w-4 h-4 text-brand-pink mt-0.5 shrink-0" />
                        <p className="text-xs font-bold text-neutral-600 dark:text-neutral-300">
                          Enter the 6-digit code sent to{' '}
                          <span className="text-brand-pink font-black">{maskedDestination || newEmail}</span>. It expires in 10 minutes.
                        </p>
                      </div>

                      <OtpInput value={otp} onChange={(v) => { setOtp(v); setOtpError(null); }} error={otpError} disabled={otpVerifying} autoFocus />

                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={submitVerifyOtp}
                          disabled={otpVerifying || otp.length < 6}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl btn-pink text-white font-black text-xs shadow disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {otpVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                          Verify &amp; Update Email
                        </button>
                        <button
                          type="button"
                          onClick={resendOtp}
                          disabled={emailSending || resendCooldown > 0}
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] text-xs font-black text-neutral-600 dark:text-neutral-300 disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${emailSending ? 'animate-spin' : ''}`} />
                          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                        </button>
                        <button
                          type="button"
                          onClick={cancelEmailChange}
                          disabled={otpVerifying}
                          className="px-4 py-2.5 rounded-xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] text-xs font-black text-neutral-600 dark:text-neutral-300 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {emailSuccess && (
                <div className="flex items-start gap-2 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-xs font-black text-emerald-700 dark:text-emerald-300">{emailSuccess}</span>
                </div>
              )}

              {info?.pendingEmail && !showEmailForm && (
                <div className="flex items-start gap-2 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-xs font-black text-amber-800 dark:text-amber-300">
                    A pending email change to <span className="font-black">{info.pendingEmail}</span> is awaiting verification. Re-enter the code or start over.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ── Change Password ───────────────────────────────────────────── */}
          <div className="rounded-3xl p-5 sm:p-7 bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm">
            <h3 className="font-black text-lg mb-5 text-neutral-900 dark:text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-brand-pink" /> Change Password
            </h3>

            <form onSubmit={submitPasswordChange} className="space-y-4">
              <div>
                <Label>Current Password</Label>
                <input
                  type="password"
                  value={passwordForm.current}
                  onChange={(e) => { setPasswordForm({ ...passwordForm, current: e.target.value }); setPasswordErrors({ ...passwordErrors, current: null, form: null }); }}
                  placeholder="Enter your current password"
                  className={`w-full px-4 py-3 bg-neutral-50 dark:bg-[#0E0E0E] border rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-pink/20 ${
                    passwordErrors.current ? 'border-rose-400 dark:border-rose-500' : 'border-[#EAEAEA] dark:border-[#292929] focus:border-brand-pink'
                  }`}
                />
                {passwordErrors.current && <p className="mt-1.5 text-xs font-bold text-rose-500">{passwordErrors.current}</p>}
              </div>

              <div>
                <Label>New Password</Label>
                <input
                  type="password"
                  value={passwordForm.newPwd}
                  onChange={(e) => { setPasswordForm({ ...passwordForm, newPwd: e.target.value }); setPasswordErrors({ ...passwordErrors, newPwd: null, form: null }); }}
                  placeholder="Choose a strong new password"
                  className={`w-full px-4 py-3 bg-neutral-50 dark:bg-[#0E0E0E] border rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-pink/20 ${
                    passwordErrors.newPwd ? 'border-rose-400 dark:border-rose-500' : 'border-[#EAEAEA] dark:border-[#292929] focus:border-brand-pink'
                  }`}
                />
                <PasswordStrengthChecklist password={passwordForm.newPwd} />
                {passwordErrors.newPwd && <p className="mt-1.5 text-xs font-bold text-rose-500">{passwordErrors.newPwd}</p>}
              </div>

              <div>
                <Label>Confirm New Password</Label>
                <input
                  type="password"
                  value={passwordForm.confirm}
                  onChange={(e) => { setPasswordForm({ ...passwordForm, confirm: e.target.value }); setPasswordErrors({ ...passwordErrors, confirm: null, form: null }); }}
                  placeholder="Re-enter your new password"
                  className={`w-full px-4 py-3 bg-neutral-50 dark:bg-[#0E0E0E] border rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-pink/20 ${
                    passwordErrors.confirm ? 'border-rose-400 dark:border-rose-500' : 'border-[#EAEAEA] dark:border-[#292929] focus:border-brand-pink'
                  }`}
                />
                {passwordErrors.confirm && <p className="mt-1.5 text-xs font-bold text-rose-500">{passwordErrors.confirm}</p>}
              </div>

              {passwordErrors.form && (
                <div className="flex items-start gap-2 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40">
                  <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <span className="text-xs font-black text-rose-700 dark:text-rose-300">{passwordErrors.form}</span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="submit"
                  disabled={passwordLoading || (!passwordForm.current && !passwordForm.newPwd)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl btn-pink text-white font-black shadow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {passwordLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Updating…</>
                  ) : (
                    <><Lock className="w-4 h-4" /> Update Password</>
                  )}
                </button>
                {passwordSuccess && (
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" /> Password changed successfully
                  </span>
                )}
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}