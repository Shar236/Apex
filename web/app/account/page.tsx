import { Suspense } from 'react';
import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { AccountGuard } from '@/components/account/account-guard';

export const metadata: Metadata = buildMetadata({
  title: 'My Account',
  description: 'Manage your Apex Vouchers account, orders, and voucher codes.',
  path: '/account',
  noindex: true,
});

export default function AccountPage() {
  return (
    <Suspense>
      <AccountGuard />
    </Suspense>
  );
}
