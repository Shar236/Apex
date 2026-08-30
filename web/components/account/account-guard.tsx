'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { AccountDashboard } from '@/components/account/account-dashboard';

/** Client-side route guard — mirrors the SPA's ProtectedRoute (redirect to /login, preserving the intended destination). */
export function AccountGuard() {
  const { isAuthenticated, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.replace('/login?from=/account');
    } else if (isAdmin) {
      // The customer account area is not for administrators — send them to the
      // admin console. Backend role is the source of truth (isAdmin derives from
      // the authenticated user's `role`, re-fetched via /api/auth/me).
      router.replace('/admin');
    }
  }, [loading, isAuthenticated, isAdmin, router]);

  if (loading || !isAuthenticated || isAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  return <AccountDashboard />;
}
