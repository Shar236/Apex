import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ApexLogo } from './ApexLogo';
import { Mail, Lock, User, ArrowRight, Phone, ShieldCheck, ShieldAlert, Crown } from 'lucide-react';

const PageShell = ({ title, subtitle, children, badge = null }) => (
  <section className="min-h-screen bg-white dark:bg-[#0A0A0A] flex items-center justify-center py-16 px-4 transition-colors duration-300">
    <div className="w-full max-w-md">
      <div className="flex flex-col items-center justify-center mb-6">
        <ApexLogo />
        {badge && (
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF005C]/10 text-[#FF005C] border border-[#FF005C]/20 text-[11px] font-black uppercase tracking-wider">
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
  const { login, error: authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/account';

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
      navigate(res.user?.role === 'admin' ? '/admin' : from, { replace: true });
    } else {
      setError(res.message || 'Login failed');
    }
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
        {(error || authError) && (
          <div className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 rounded-xl px-3 py-2">
            {error || authError}
          </div>
        )}
        <button
          disabled={loading}
          className="w-full py-3.5 rounded-2xl btn-pink text-white font-black shadow-lg flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? 'Signing in…' : 'Log in'}
          {!loading && <ArrowRight className="w-4 h-4" />}
        </button>
        <div className="flex justify-between text-xs font-semibold text-neutral-500 dark:text-[#B5B5B5] pt-1">
          <Link className="hover:text-[#FF005C] transition-colors" to="/forgot-password">Forgot password?</Link>
          <Link className="hover:text-[#FF005C] transition-colors" to="/register">Create Account →</Link>
        </div>
        <div className="mt-4 pt-4 border-t border-[#EAEAEA] dark:border-[#292929] flex items-center justify-between text-[11px] font-bold text-neutral-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> 256-bit Encrypted
          </span>
          <Link to="/admin/login" className="text-neutral-500 hover:text-[#FF005C] transition-colors flex items-center gap-1 font-extrabold">
            <Crown className="w-3 h-3 text-[#FF005C]" /> Admin Login
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
            <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        <button
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-black text-sm shadow-xl flex items-center justify-center gap-2.5 hover:bg-[#FF005C] dark:hover:bg-[#FF005C] dark:hover:text-white transition-all disabled:opacity-60"
        >
          <Crown className="w-4 h-4 text-[#FF005C]" />
          <span>{loading ? 'Authenticating…' : 'Secure Admin Login'}</span>
        </button>

        <div className="pt-2 text-center">
          <Link to="/login" className="text-xs font-bold text-neutral-500 hover:text-[#FF005C] transition-colors">
            ← Return to Candidate Login
          </Link>
        </div>
      </form>
    </PageShell>
  );
};

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await register(form);
    setLoading(false);
    if (res.success) navigate('/account', { replace: true });
    else setError(res.message || 'Registration failed');
  };

  return (
    <PageShell title="Create Your Account" subtitle="Sign up in under a minute. Manage your voucher codes for life.">
      <form onSubmit={onSubmit} className="space-y-4">
        <LabeledInput
          icon={<User className="w-4 h-4" />}
          label="Full Name"
          placeholder="e.g. Aarav Sharma"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <LabeledInput
          icon={<Mail className="w-4 h-4" />}
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <LabeledInput
          icon={<Phone className="w-4 h-4" />}
          label="WhatsApp / Phone (optional)"
          placeholder="+91 90000 00000"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <LabeledInput
          icon={<Lock className="w-4 h-4" />}
          label="Password (min 6 chars)"
          type="password"
          placeholder="••••••••"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        {error && (
          <div className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 rounded-xl px-3 py-2">
            {error}
          </div>
        )}
        <button
          disabled={loading}
          className="w-full py-3.5 rounded-2xl btn-pink text-white font-black shadow-lg disabled:opacity-60"
        >
          {loading ? 'Creating account…' : 'Create My Apex Account'}
        </button>
        <p className="text-xs text-center font-semibold text-neutral-500 dark:text-[#B5B5B5]">
          Already have an account?{' '}
          <Link className="text-[#FF005C]" to="/login">Log in</Link>
        </p>
      </form>
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
          <button disabled={loading} className="w-full py-3.5 rounded-2xl btn-pink text-white font-black shadow-lg disabled:opacity-60">
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
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { resetPassword } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
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
          <LabeledInput
            icon={<Lock className="w-4 h-4" />}
            label="New password (min 6 chars)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && (
            <div className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 rounded-xl px-3 py-2">
              {error}
            </div>
          )}
          <button disabled={loading} className="w-full py-3.5 rounded-2xl btn-pink text-white font-black shadow-lg disabled:opacity-60">
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
          className="w-full pl-11 pr-4 py-3.5 bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] rounded-2xl text-neutral-900 dark:text-white text-sm font-bold placeholder-neutral-400 focus:border-[#FF005C] focus:outline-none focus:ring-2 focus:ring-[#FF005C]/20 transition"
        />
      </div>
    </label>
  );
}
