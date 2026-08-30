import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/config';
import { listProducts } from '@/lib/product-detail';
import { listPublicBlogPosts } from '@/lib/blog-api';

/**
 * Only includes routes that actually exist in this Next.js app today.
 * Pages not yet migrated (policy pages, exam booking, awards) are
 * intentionally left out rather than pointing the sitemap at URLs that don't
 * resolve yet — add each one here as its route lands.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, blogList] = await Promise.all([
    listProducts(),
    // limit: 50 is the backend's own max page size — fine while the blog is
    // this small; once it grows past 50 published posts, page through
    // listPublicBlogPosts() here instead of a single call.
    listPublicBlogPosts({ limit: 50 }),
  ]);

  const productEntries: MetadataRoute.Sitemap = products
    .filter((p) => p.slug)
    .map((p) => ({
      url: `${siteConfig.siteUrl}/exam-vouchers/${p.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

  const blogEntries: MetadataRoute.Sitemap = blogList.data
    .filter((p) => p.slug)
    .map((p) => ({
      url: `${siteConfig.siteUrl}/blog/${p.slug}`,
      lastModified: p.updatedAt || p.publishedAt ? new Date(p.updatedAt || p.publishedAt!) : new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
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
    {
      url: `${siteConfig.siteUrl}/exam-booking`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteConfig.siteUrl}/awards`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${siteConfig.siteUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${siteConfig.siteUrl}/how-to-reschedule-cancel-pte-exam`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${siteConfig.siteUrl}/refund-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${siteConfig.siteUrl}/voucher-refund-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${siteConfig.siteUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${siteConfig.siteUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    ...productEntries,
    ...blogEntries,
  ];
}
