import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductDetailPage } from '@/components/product-detail-page';
import { getProductBySlug, listProducts } from '@/lib/product-detail';
import { getWebsiteConfig } from '@/lib/website-config';
import { buildMetadata, JsonLd } from '@/lib/seo';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const products = await listProducts();
  return products.filter((p) => p.slug).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { slug } = await params;
  const result = await getProductBySlug(slug);
  if (!result) return buildMetadata({ title: 'Voucher Not Found', description: 'This voucher may have been removed or is no longer available.', path: `/exam-vouchers/${slug}`, noindex: true });

  const product = result.data;
  // Several product names already end in "Voucher" (e.g. "ETS GRE Voucher") —
  // avoid a doubled-up fallback title like "ETS GRE Voucher Voucher — Buy Online".
  const nameHasVoucher = /\bvoucher\b/i.test(product.name);
  const title = product.seo?.title || `${product.name}${nameHasVoucher ? '' : ' Voucher'} — Buy Online`;
  const description = product.seo?.description || product.shortDescription || product.description || `Buy the official ${product.name} voucher at a discounted price with instant delivery from Apex Vouchers.`;

  return buildMetadata({
    title,
    description,
    path: `/exam-vouchers/${product.slug}`,
    ogImage: product.seo?.ogImage || product.image || product.logo,
    noindex: product.seo?.noindex,
    nofollow: product.seo?.nofollow,
  });
}

export default async function VoucherDetailRoute({ params }: RouteParams) {
  const { slug } = await params;
  const [result, config] = await Promise.all([getProductBySlug(slug), getWebsiteConfig()]);

  if (!result) notFound();

  const { data: product, relatedProducts, structuredData } = result;

  return (
    <>
      {structuredData.product && <JsonLd data={structuredData.product} />}
      {structuredData.breadcrumb && <JsonLd data={structuredData.breadcrumb} />}
      <ProductDetailPage product={product} related={relatedProducts} supportPhone={config.footerSettings.phone} supportEmail={config.footerSettings.email} />
    </>
  );
}
