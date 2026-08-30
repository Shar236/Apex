'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';

/**
 * Client-side route guard for /admin — redirects unauthenticated users to
 * /login and non-admins away. This is UX-only protection; the Express
 * backend enforces `protectAdmin` on every /api/admin route, so the backend
 * remains authoritative even if this UI is bypassed.
 */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, isAdmin, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login?from=/admin');
    } else if (!loading && isAuthenticated && !isAdmin) {
      router.replace('/account');
    }
  }, [loading, isAuthenticated, isAdmin, router]);

  if (loading || !isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto" />
          <p className="text-xs font-bold text-neutral-500">
            {loading ? 'Checking session…' : !isAuthenticated ? 'Redirecting to login…' : `Redirecting ${user?.email ?? ''}…`}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
