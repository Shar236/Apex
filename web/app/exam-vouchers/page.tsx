import type { Metadata } from 'next';
import { ProductCatalog } from '@/components/product-catalog';
import { listProducts } from '@/lib/product-detail';
import { buildMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: 'Exam Vouchers — PTE, GRE, TOEFL & Duolingo Vouchers Online',
    description: 'Browse every official exam voucher we sell: PTE Academic, PTE Core, PTE Academic UKVI, ETS GRE, ETS TOEFL iBT, and Duolingo English Test — all at discounted prices with instant delivery.',
    path: '/exam-vouchers',
  });
}

export default async function ExamVouchersPage() {
  const products = await listProducts();
  return <ProductCatalog products={products} />;
}
