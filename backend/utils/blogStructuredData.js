import { config } from '../config/index.js';
import { Setting } from '../models/index.js';

const baseUrl = () => (config.siteUrl || config.clientUrl || 'http://localhost:5173').replace(/\/$/, '');

export const getBlogStructuredData = async (post) => {
  if (!post) return null;
  const base = baseUrl();
  const [orgName, orgLogo] = await Promise.all([
    Setting.findOne({ key: 'seo_orgName' }).lean(),
    Setting.findOne({ key: 'seo_orgLogo' }).lean(),
  ]);

  const url = `${base}/blog/${post.slug}`;
  const image = post.seo?.ogImage || post.coverImage || '';

  const article = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.seo?.title || post.title,
    description: post.seo?.description || post.excerpt || '',
    image: image ? [image] : undefined,
    author: {
      '@type': 'Person',
      name: post.author || 'Apex Vouchers',
    },
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt || post.publishedAt || post.createdAt,
    publisher: {
      '@type': 'Organization',
      name: orgName?.value || 'Apex Vouchers',
      logo: orgLogo?.value ? { '@type': 'ImageObject', url: orgLogo.value } : undefined,
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${base}/` },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${base}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title, item: url },
    ],
  };

  // FAQPage structured data is only emitted alongside FAQ content actually
  // rendered on the page — never generated independently of visible content.
  let faqPage = null;
  if (post.faqs && post.faqs.length > 0) {
    faqPage = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: post.faqs.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer },
      })),
    };
  }

  return { article, breadcrumb, faqPage };
};
