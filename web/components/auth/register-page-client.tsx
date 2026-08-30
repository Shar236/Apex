'use client';

import { Fragment, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { Mail, Lock, User, Phone, CheckCircle2, Loader2, RotateCcw } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { PageShell, LabeledInput } from '@/components/auth/page-shell';
import { PhoneInput } from '@/components/auth/phone-input';
import { OtpInput } from '@/components/auth/otp-input';
import { PasswordStrengthChecklist } from '@/components/auth/password-strength-checklist';
import { validatePasswordStrength } from '@/lib/password-rules';
import { useResendCountdown } from '@/lib/use-resend-countdown';

const maskEmailForDisplay = (email: string) => {
  const value = String(email || '');
  const at = value.indexOf('@');
  if (at <= 1) return value;
  return `${value[0]}***${value.slice(at - 1)}`;
};

const REGISTER_STEPS = ['Details', 'Verify Email', 'Done'];

function StepProgress({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {REGISTER_STEPS.map((label, idx) => {
        const stepNum = idx + 1;
        const isDone = stepNum < step;
        const isActive = stepNum === step;
        return (
          <Fragment key={label}>
            <div className="flex items-center gap-1.5">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium shrink-0 transition-colors ${
                  isDone ? 'bg-emerald-500 text-white' : isActive ? 'bg-accent text-white' : 'bg-neutral-100 text-neutral-400'
                }`}
              >
                {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : stepNum}
              </div>
              <span className={`text-[11px] font-bold hidden sm:inline ${isActive ? 'text-neutral-900 dark:text-white' : 'text-neutral-400'}`}>{label}</span>
            </div>
            {idx < REGISTER_STEPS.length - 1 && <div className={`flex-1 h-0.5 rounded-full ${isDone ? 'bg-emerald-500' : 'bg-neutral-100'}`} />}
          </Fragment>
        );
      })}
    </div>
  );
}

export function RegisterPageClient() {
  const { register, verifyRegistrationOtp, resendRegistrationOtp } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pendingEmail = searchParams.get('pendingEmail') || '';

  const [step, setStep] = useState(pendingEmail ? 2 : 1);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: pendingEmail,
    phone: '',
    phoneCountry: 'IN',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resendKey, setResendKey] = useState(0);
  const [resending, setResending] = useState(false);
  const resendSeconds = useResendCountdown(step === 2, 30, resendKey);
  const canResend = step === 2 && resendSeconds === 0 && !resending;
  const passwordError = form.password ? validatePasswordStrength(form.password) : null;
  const [resendNotice, setResendNotice] = useState('');

  const onSubmitDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError('Please enter your first and last name');
      return;
    }
    if (!form.phone) {
      setError('Phone number is required');
      return;
    }
    let parsedPhone;
    try {
      parsedPhone = parsePhoneNumberFromString(form.phone, form.phoneCountry as never);
    } catch {
      parsedPhone = null;
    }
    if (!parsedPhone || !parsedPhone.isValid()) {
      setError('Please enter a valid phone number for the selected country');
      return;
    }
    if (passwordError) {
      setError(passwordError);
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    const res = await register({
      name: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
      email: form.email,
      phone: form.phone,
      phoneCountry: form.phoneCountry,
      password: form.password,
    });
    setLoading(false);
    if (res.success) {
      setStep(2);
      setResendKey((k) => k + 1);
    } else {
      setError(res.message || 'Registration failed');
    }
  };

  const onVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');
    if (otp.length !== 6) {
      setOtpError('Enter the 6-digit code');
      return;
    }
    setVerifying(true);
    const res = await verifyRegistrationOtp(form.email, otp);
    setVerifying(false);
    if (res.success) {
      setStep(3);
      setTimeout(() => router.replace('/account'), 1400);
    } else {
      setOtpError(res.message || 'Incorrect verification code. Please try again.');
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setResending(true);
    setOtpError('');
    setResendNotice('');
    const res = await resendRegistrationOtp(form.email);
    setResending(false);
    if (res.success) {
      setOtp('');
      setResendNotice(res.message || 'A new code has been sent. Check your inbox and spam folder.');
      setResendKey((k) => k + 1);
    } else {
      setOtpError(res.message || "We couldn't resend the code. Please try again.");
    }
  };

  return (
    <PageShell
      title={step === 3 ? 'Account Created' : 'Create Your Apex Voucher Account'}
      subtitle={step === 1 ? 'Sign up in under a minute. Manage your voucher codes for life.' : step === 2 ? 'One last step to secure your account.' : 'Welcome aboard — redirecting you to your account…'}
    >
      {step < 3 && <StepProgress step={step} />}

      {step === 1 && (
        <form onSubmit={onSubmitDetails} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <LabeledInput icon={<User className="w-4 h-4" />} label="First Name" placeholder="e.g. Aarav" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
            <LabeledInput icon={<User className="w-4 h-4" />} label="Last Name" placeholder="e.g. Sharma" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
          </div>
          <LabeledInput icon={<Mail className="w-4 h-4" />} label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-ink-muted mb-2 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" /> Phone Number
            </span>
            <PhoneInput
              value={form.phone}
              country={form.phoneCountry}
              onChange={(phone, phoneCountry) => setForm({ ...form, phone, phoneCountry })}
              onCountryChange={(phoneCountry) => setForm((current) => ({ ...current, phoneCountry }))}
            />
          </div>
          <div>
            <LabeledInput icon={<Lock className="w-4 h-4" />} label="Password" type="password" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            <PasswordStrengthChecklist password={form.password} />
          </div>
          <LabeledInput
            icon={<Lock className="w-4 h-4" />}
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            required
          />
          {error && <div className="text-xs font-medium text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 rounded-xl px-3 py-2">{error}</div>}
          <button disabled={loading} className="w-full py-3.5 rounded-2xl bg-accent hover:bg-accent-hover text-white font-medium shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Creating account…' : 'Continue'}
          </button>
          <p className="text-xs text-center font-semibold text-ink-muted">
            Already have an account?{' '}
            <Link className="text-accent" href="/login">
              Log in
            </Link>
          </p>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={onVerifyOtp} className="space-y-5">
          <p className="text-xs text-center text-ink-muted font-semibold">
            We&apos;ve sent a 6-digit verification code to <strong className="text-neutral-900 dark:text-white">{maskEmailForDisplay(form.email)}</strong>.
            <br />
            It expires in 10 minutes — check your inbox <strong>and spam / junk folder</strong>.
          </p>
          <OtpInput value={otp} onChange={setOtp} error={otpError} disabled={verifying} />
          {resendNotice && !otpError && <p className="text-xs text-center font-semibold text-emerald-600 dark:text-emerald-400">{resendNotice}</p>}
          <button disabled={verifying} className="w-full py-3.5 rounded-2xl bg-accent hover:bg-accent-hover text-white font-medium shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer">
            {verifying && <Loader2 className="w-4 h-4 animate-spin" />}
            {verifying ? 'Verifying…' : 'Verify OTP'}
          </button>
          <div className="text-center text-xs font-bold">
            {canResend ? (
              <button type="button" onClick={handleResend} className="text-accent hover:underline flex items-center gap-1 justify-center mx-auto cursor-pointer">
                <RotateCcw className="w-3 h-3" /> Resend Code
              </button>
            ) : resending ? (
              <span className="text-neutral-400 inline-flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Sending…
              </span>
            ) : (
              <span className="text-neutral-400">Resend code in {resendSeconds}s</span>
            )}
          </div>
        </form>
      )}

      {step === 3 && (
        <div className="text-center py-4">
          <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <p className="font-medium text-neutral-900 dark:text-white">Email verified — your account is ready!</p>
        </div>
      )}
    </PageShell>
  );
}
