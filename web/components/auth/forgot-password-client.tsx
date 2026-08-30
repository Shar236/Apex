'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { PageShell, LabeledInput } from '@/components/auth/page-shell';

export function ForgotPasswordClient() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { forgotPassword } = useAuth();

  const onSubmit = async (e: React.FormEvent) => {
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
          <p className="font-medium text-emerald-700 dark:text-emerald-300 text-sm">Check your email</p>
          <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1">If an account exists, a reset link has been sent.</p>
          <Link href="/login" className="bg-accent hover:bg-accent-hover transition-colors text-white inline-block mt-4 px-5 py-2.5 rounded-xl text-sm font-medium">
            Back to login
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <LabeledInput icon={<Mail className="w-4 h-4" />} label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <button disabled={loading} className="w-full py-3.5 rounded-2xl bg-accent hover:bg-accent-hover text-white font-medium shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Sending…' : 'Send Reset Link'}
          </button>
        </form>
      )}
    </PageShell>
  );
}
