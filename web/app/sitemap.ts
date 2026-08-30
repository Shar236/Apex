import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/config';
import { listProducts } from '@/lib/product-detail';

/**
 * Only includes routes that actually exist in this Next.js app today.
 * Pages not yet migrated (blog, policy pages, exam booking) are intentionally
 * left out rather than pointing the sitemap at URLs that don't resolve yet —
 * add each one here as its route lands.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await listProducts();

  const productEntries: MetadataRoute.Sitemap = products
    .filter((p) => p.slug)
    .map((p) => ({
      url: `${siteConfig.siteUrl}/exam-vouchers/${p.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

  return [
    {
      url: siteConfig.siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${siteConfig.siteUrl}/exam-vouchers`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...productEntries,
  ];
}
