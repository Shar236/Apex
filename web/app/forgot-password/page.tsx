import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { ForgotPasswordClient } from '@/components/auth/forgot-password-client';

export const metadata: Metadata = buildMetadata({
  title: 'Forgot Password',
  description: 'Reset your Apex Vouchers account password.',
  path: '/forgot-password',
  noindex: true,
});

export default function ForgotPasswordPage() {
  return <ForgotPasswordClient />;
}
