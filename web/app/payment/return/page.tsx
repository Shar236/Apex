import { Suspense } from 'react';
import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { PaymentReturnClient } from '@/components/checkout/payment-return-client';

export const metadata: Metadata = buildMetadata({
  title: 'Payment Status',
  description: 'Checking your Apex Vouchers payment status.',
  path: '/payment/return',
  noindex: true,
});

export default function PaymentReturnPage() {
  return (
    <Suspense>
      <PaymentReturnClient />
    </Suspense>
  );
}
