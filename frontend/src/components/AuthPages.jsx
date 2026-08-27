import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ApexLogo } from './ApexLogo';
import { PhoneInput } from './PhoneInput';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { OtpInput } from './OtpInput';
import { PasswordStrengthChecklist } from './PasswordStrengthChecklist';
import { validatePasswordStrength } from '../lib/passwordRules';
import { useResendCountdown } from '../lib/useResendCountdown';
import {
  Mail, Lock, User, ArrowRight, Phone, ShieldCheck, ShieldAlert, Crown,
  CheckCircle2, Loader2, RotateCcw,
} from 'lucide-react';

const maskEmailForDisplay = (email) => {
  const value = String(email || '');
  const at = value.indexOf('@');
  if (at <= 1) return value;
  return `${value[0]}***${value.slice(at - 1)}`;
};

const PageShell = ({ title, subtitle, children, badge = null }) => (
  <section className="min-h-screen bg-white dark:bg-[#0A0A0A] flex items-center justify-center py-16 px-4 transition-colors duration-300">
    <div className="w-full max-w-md">
      <div className="flex flex-col items-center justify-center mb-6">
        <ApexLogo />
        {badge && (
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-pink/10 text-brand-pink border border-brand-pink/20 text-[11px] font-black uppercase tracking-wider">
            {badge}
          </div>
        )}
      </div>
      <div className="bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] rounded-3xl shadow-2xl p-7 text-neutral-900 dark:text-white">
        <h1 className="font-heading text-2xl font-black mb-1 tracking-tight">{title}</h1>
        <p className="text-sm text-neutral-500 dark:text-[#B5B5B5] mb-6">{subtitle}</p>
        {children}
      </div>
    </div>
  </section>
);

export const LoginPage = () => {
  const { login, resendRegistrationOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/account';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [resendState, setResendState] = useState('idle'); // idle | sending | sent

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrorCode('');
    setResendState('idle');
    setLoading(true);
    const res = await login({ email, password });
    setLoading(false);
    if (res.success) {
      navigate(res.user?.role === 'admin' ? '/admin' : from, { replace: true });
    } else {
      setError(res.message || 'Login failed');
      setErrorCode(res.code || '');
    }
  };

  const handleResendVerification = async () => {
    setResendState('sending');
    await resendRegistrationOtp(email);
    setResendState('sent');
  };

  return (
    <PageShell title="Welcome Back" subtitle="Log in to your Apex Vouchers account to manage vouchers.">
      <form onSubmit={onSubmit} className="space-y-4">
        <LabeledInput
          icon={<Mail className="w-4 h-4" />}
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <LabeledInput
          icon={<Lock className="w-4 h-4" />}
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && (
          <div className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 rounded-xl px-3 py-2.5 space-y-2">
            <p>{error}</p>
            {errorCode === 'EMAIL_NOT_VERIFIED' && (
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resendState !== 'idle'}
                className="text-brand-pink hover:underline font-black disabled:opacity-60"
              >
                {resendState === 'sending' && 'Sending…'}
                {resendState === 'sent' && 'Verification code sent — check your inbox'}
                {resendState === 'idle' && 'Resend verification email'}
              </button>
            )}
            {resendState === 'sent' && (
              <Link
                to="/register"
                state={{ pendingEmail: email }}
                className="block text-brand-pink hover:underline font-black"
              >
                Enter verification code →
              </Link>
            )}
          </div>
        )}
        <button
          disabled={loading}
          className="w-full py-3.5 rounded-2xl btn-pink text-white font-black shadow-lg flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {loading ? 'Signing in…' : 'Log in'}
          {!loading && <ArrowRight className="w-4 h-4" />}
        </button>
        <div className="flex justify-between text-xs font-semibold text-neutral-500 dark:text-[#B5B5B5] pt-1">
          <Link className="hover:text-brand-pink transition-colors" to="/forgot-password">Forgot password?</Link>
          <Link className="hover:text-brand-pink transition-colors" to="/register">Create Account →</Link>
        </div>
        <div className="mt-4 pt-4 border-t border-[#EAEAEA] dark:border-[#292929] flex items-center justify-between text-[11px] font-bold text-neutral-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> 256-bit Encrypted
          </span>
          <Link to="/admin/login" className="text-neutral-500 hover:text-brand-pink transition-colors flex items-center gap-1 font-extrabold">
            <Crown className="w-3 h-3 text-brand-pink" /> Admin Login
          </Link>
        </div>
      </form>
    </PageShell>
  );
};

export const AdminLoginPage = () => {
  const { login, logout } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await login({ email, password });
    setLoading(false);
    if (res.success) {
      if (res.user?.role !== 'admin') {
        logout();
        setError('Access denied: Admin credentials required.');
        return;
      }
      navigate('/admin', { replace: true });
    } else {
      setError(res.message || 'Invalid admin credentials');
    }
  };

  return (
    <PageShell
      title="Administration Portal"
      subtitle="Secure sign-in for Apex Vouchers administrators."
      badge="⚡ Secure Admin Gateway"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <LabeledInput
          icon={<Mail className="w-4 h-4" />}
          label="Admin Email"
          type="email"
          placeholder="admin@apexvouchers.in"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <LabeledInput
          icon={<Lock className="w-4 h-4" />}
          label="Admin Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && (
          <div className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 rounded-xl px-4 py-3 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        <button
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-black text-sm shadow-xl flex items-center justify-center gap-2.5 hover:bg-brand-pink dark:hover:bg-brand-pink dark:hover:text-white transition-all disabled:opacity-60"
        >
          <Crown className="w-4 h-4 text-brand-pink" />
          <span>{loading ? 'Authenticating…' : 'Secure Admin Login'}</span>
        </button>

        <div className="pt-2 text-center">
          <Link to="/login" className="text-xs font-bold text-neutral-500 hover:text-brand-pink transition-colors">
            ← Return to Candidate Login
          </Link>
        </div>
      </form>
    </PageShell>
  );
};

const REGISTER_STEPS = ['Details', 'Verify Email', 'Done'];

function StepProgress({ step }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {REGISTER_STEPS.map((label, idx) => {
        const stepNum = idx + 1;
        const isDone = stepNum < step;
        const isActive = stepNum === step;
        return (
          <React.Fragment key={label}>
            <div className="flex items-center gap-1.5">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 transition-colors ${
                  isDone
                    ? 'bg-emerald-500 text-white'
                    : isActive
                    ? 'bg-brand-pink text-white'
                    : 'bg-neutral-100 dark:bg-[#222] text-neutral-400'
                }`}
              >
                {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : stepNum}
              </div>
              <span className={`text-[11px] font-bold hidden sm:inline ${isActive ? 'text-neutral-900 dark:text-white' : 'text-neutral-400'}`}>
                {label}
              </span>
            </div>
            {idx < REGISTER_STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 rounded-full ${isDone ? 'bg-emerald-500' : 'bg-neutral-100 dark:bg-[#222]'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export const RegisterPage = () => {
  const { register, verifyRegistrationOtp, resendRegistrationOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState(location.state?.pendingEmail ? 2 : 1);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: location.state?.pendingEmail || '',
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
  const [resendActive, setResendActive] = useState(true);
  const resendSeconds = useResendCountdown(resendActive);
  const passwordError = form.password ? validatePasswordStrength(form.password) : null;

  const onSubmitDetails = async (e) => {
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
      parsedPhone = parsePhoneNumberFromString(form.phone, form.phoneCountry);
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
      setResendActive(true);
    } else {
      setError(res.message || 'Registration failed');
    }
  };

  const onVerifyOtp = async (e) => {
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
      setTimeout(() => navigate('/account', { replace: true }), 1400);
    } else {
      setOtpError(res.message || 'Incorrect verification code. Please try again.');
    }
  };

  const handleResend = async () => {
    setResendActive(false);
    setOtpError('');
    const res = await resendRegistrationOtp(form.email);
    if (!res.success) setOtpError(res.message || "We couldn't resend the code. Please try again.");
    setTimeout(() => setResendActive(true), 0);
  };

  return (
    <PageShell
      title={step === 3 ? 'Account Created' : 'Create Your Apex Voucher Account'}
      subtitle={
        step === 1
          ? 'Sign up in under a minute. Manage your voucher codes for life.'
          : step === 2
          ? 'One last step to secure your account.'
          : 'Welcome aboard — redirecting you to your account…'
      }
    >
      {step < 3 && <StepProgress step={step} />}

      {step === 1 && (
        <form onSubmit={onSubmitDetails} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <LabeledInput
              icon={<User className="w-4 h-4" />}
              label="First Name"
              placeholder="e.g. Aarav"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              required
            />
            <LabeledInput
              icon={<User className="w-4 h-4" />}
              label="Last Name"
              placeholder="e.g. Sharma"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              required
            />
          </div>
          <LabeledInput
            icon={<Mail className="w-4 h-4" />}
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-500 dark:text-[#B5B5B5] mb-2 flex items-center gap-1.5">
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
            <LabeledInput
              icon={<Lock className="w-4 h-4" />}
              label="Password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
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
          {error && (
            <div className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 rounded-xl px-3 py-2">
              {error}
            </div>
          )}
          <button
            disabled={loading}
            className="w-full py-3.5 rounded-2xl btn-pink text-white font-black shadow-lg flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Creating account…' : 'Continue'}
          </button>
          <p className="text-xs text-center font-semibold text-neutral-500 dark:text-[#B5B5B5]">
            Already have an account?{' '}
            <Link className="text-brand-pink" to="/login">Log in</Link>
          </p>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={onVerifyOtp} className="space-y-5">
          <p className="text-xs text-center text-neutral-500 dark:text-[#B5B5B5] font-semibold">
            We've sent a 6-digit verification code to{' '}
            <strong className="text-neutral-900 dark:text-white">{maskEmailForDisplay(form.email)}</strong>
          </p>
          <OtpInput value={otp} onChange={setOtp} error={otpError} disabled={verifying} />
          <button
            disabled={verifying}
            className="w-full py-3.5 rounded-2xl btn-pink text-white font-black shadow-lg flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {verifying && <Loader2 className="w-4 h-4 animate-spin" />}
            {verifying ? 'Verifying…' : 'Verify OTP'}
          </button>
          <div className="text-center text-xs font-bold">
            {resendActive ? (
              <button type="button" onClick={handleResend} className="text-brand-pink hover:underline flex items-center gap-1 justify-center mx-auto">
                <RotateCcw className="w-3 h-3" /> Resend Code
              </button>
            ) : (
              <span className="text-neutral-400">Resend available in {resendSeconds}s</span>
            )}
          </div>
        </form>
      )}

      {step === 3 && (
        <div className="text-center py-4">
          <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <p className="font-black text-neutral-900 dark:text-white">Email verified — your account is ready!</p>
        </div>
      )}
    </PageShell>
  );
};

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { forgotPassword } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await forgotPassword(email);
    setSent(true);
    setLoading(false);
  };
  return (
    <PageShell title="Reset Password" subtitle="We'll send a reset link to your email.">
      {sent ? (
        <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/40">
          <p className="font-black text-emerald-700 dark:text-emerald-300 text-sm">Check your email</p>
          <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1">
            If an account exists, a reset link has been sent.
          </p>
          <Link to="/login" className="btn-pink text-white inline-block mt-4 px-5 py-2.5 rounded-xl text-sm font-black">Back to login</Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <LabeledInput
            icon={<Mail className="w-4 h-4" />}
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button disabled={loading} className="w-full py-3.5 rounded-2xl btn-pink text-white font-black shadow-lg flex items-center justify-center gap-2 disabled:opacity-60">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Sending…' : 'Send Reset Link'}
          </button>
        </form>
      )}
    </PageShell>
  );
};

export const ResetPasswordPage = () => {
  const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { resetPassword } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const strengthError = validatePasswordStrength(password);
    if (strengthError) {
      setError(strengthError);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    const res = await resetPassword(token, password);
    setLoading(false);
    if (res.success) setDone(true);
    else setError(res.message || 'Invalid or expired token');
  };
  return (
    <PageShell title="Set a New Password" subtitle="Choose a strong password you don't use elsewhere.">
      {done ? (
        <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200">
          <p className="font-black text-emerald-700 dark:text-emerald-300 text-sm">Password updated!</p>
          <Link to="/login" className="btn-pink text-white inline-block mt-4 px-5 py-2.5 rounded-xl text-sm font-black">Log in now</Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <LabeledInput
              icon={<Lock className="w-4 h-4" />}
              label="New Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <PasswordStrengthChecklist password={password} />
          </div>
          <LabeledInput
            icon={<Lock className="w-4 h-4" />}
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {error && (
            <div className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 rounded-xl px-3 py-2">
              {error}
            </div>
          )}
          <button disabled={loading} className="w-full py-3.5 rounded-2xl btn-pink text-white font-black shadow-lg flex items-center justify-center gap-2 disabled:opacity-60">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      )}
    </PageShell>
  );
};

function LabeledInput({ icon, label, value, onChange, type = 'text', placeholder = '', required = false }) {
  return (
    <label className="block">
      <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-500 dark:text-[#B5B5B5] mb-2 block">
        {label}
      </span>
      <div className="relative">
        <div className="absolute inset-y-0 left-3.5 flex items-center text-neutral-400">{icon}</div>
        <input
          required={required}
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          className="w-full pl-11 pr-4 py-3.5 bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] rounded-2xl text-neutral-900 dark:text-white text-sm font-bold placeholder-neutral-400 focus:border-brand-pink focus:outline-none focus:ring-2 focus:ring-brand-pink/20 transition"
        />
      </div>
    </label>
  );
}
