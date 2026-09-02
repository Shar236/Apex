import type { Metadata } from 'next';
import { siteConfig } from './config';

export interface PageSeoInput {
  title?: string | null;
  description?: string | null;
  /** Site-relative path, e.g. "/exam-vouchers/pte-academic". */
  path: string;
  ogImage?: string | null;
  noindex?: boolean;
  nofollow?: boolean;
}

/**
 * Appends " | Apex Vouchers" unless the title already ends with the site
 * name (CMS-authored titles, like the homepage's, sometimes already include
 * it). Titles are built as complete strings here rather than relying on
 * Next's layout-level title.template, which — despite the docs — did not
 * apply consistently across statically vs. dynamically rendered routes in
 * this app (verified in-browser: root "/" kept a single suffix while
 * /exam-vouchers/[slug] got the template applied on top of an
 * already-suffixed string, duplicating it).
 */
const withSiteSuffix = (title: string): string => {
  const trimmed = title.trim();
  return trimmed.endsWith(siteConfig.name) ? trimmed : `${trimmed} | ${siteConfig.name}`;
};

/**
 * Builds a Next.js Metadata object from CMS/API-supplied SEO fields, with a
 * consistent site-wide fallback. This is the single place page-level
 * generateMetadata() functions should go through — replaces the Vite app's
 * per-page applyPageMetadata()/setMetaTag() DOM-mutation calls (lib/api.js),
 * which no longer apply now that metadata renders server-side.
 */
export function buildMetadata(input: PageSeoInput): Metadata {
  const title = withSiteSuffix(input.title?.trim() || siteConfig.defaultTitle);
  const description = input.description?.trim() || siteConfig.defaultDescription;
  const url = `${siteConfig.siteUrl}${input.path}`;
  const image = input.ogImage || undefined;

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: {
      index: !input.noindex,
      follow: !input.nofollow,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      type: 'website',
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

/** Renders a JSON-LD <script> tag for structured data (Product, Article, BreadcrumbList, FAQPage, ...). */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.siteUrl,
    logo: `${siteConfig.siteUrl}/icon.svg`,
  };
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.siteUrl,
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${siteConfig.siteUrl}${item.path}`,
    })),
  };
}
