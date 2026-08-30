import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { AdminConsole } from '@/components/admin/admin-console';

export const metadata: Metadata = buildMetadata({
  title: 'Admin Console',
  description: 'Apex Vouchers administration console.',
  path: '/admin',
  noindex: true,
  nofollow: true,
});

export default function AdminPage() {
  return <AdminConsole />;
}
