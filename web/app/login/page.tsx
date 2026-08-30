import { Suspense } from 'react';
import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { LoginPageClient } from '@/components/auth/login-page-client';

export const metadata: Metadata = buildMetadata({
  title: 'Log In',
  description: 'Log in to your Apex Vouchers account to manage your exam vouchers and orders.',
  path: '/login',
  noindex: true,
});

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageClient />
    </Suspense>
  );
}
