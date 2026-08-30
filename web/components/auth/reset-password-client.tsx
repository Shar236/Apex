'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Lock, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { PageShell, LabeledInput } from '@/components/auth/page-shell';
import { PasswordStrengthChecklist } from '@/components/auth/password-strength-checklist';
import { validatePasswordStrength } from '@/lib/password-rules';

export function ResetPasswordClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { resetPassword } = useAuth();

  const onSubmit = async (e: React.FormEvent) => {
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
          <p className="font-medium text-emerald-700 dark:text-emerald-300 text-sm">Password updated!</p>
          <Link href="/login" className="bg-accent hover:bg-accent-hover transition-colors text-white inline-block mt-4 px-5 py-2.5 rounded-xl text-sm font-medium">
            Log in now
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <LabeledInput icon={<Lock className="w-4 h-4" />} label="New Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <PasswordStrengthChecklist password={password} />
          </div>
          <LabeledInput icon={<Lock className="w-4 h-4" />} label="Confirm New Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          {error && <div className="text-xs font-medium text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 rounded-xl px-3 py-2">{error}</div>}
          <button disabled={loading} className="w-full py-3.5 rounded-2xl bg-accent hover:bg-accent-hover text-white font-medium shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      )}
    </PageShell>
  );
}
