import { Suspense } from 'react';
import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { RegisterPageClient } from '@/components/auth/register-page-client';

export const metadata: Metadata = buildMetadata({
  title: 'Create Account',
  description: 'Create your Apex Vouchers account to buy discounted exam vouchers with instant email delivery.',
  path: '/register',
  noindex: true,
});

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterPageClient />
    </Suspense>
  );
}
