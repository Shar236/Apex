import { Suspense } from 'react';
import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { ResetPasswordClient } from '@/components/auth/reset-password-client';

export const metadata: Metadata = buildMetadata({
  title: 'Reset Password',
  description: 'Set a new password for your Apex Vouchers account.',
  path: '/reset-password',
  noindex: true,
});

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordClient />
    </Suspense>
  );
}
