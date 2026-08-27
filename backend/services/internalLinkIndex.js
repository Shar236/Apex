import { Product, PageSEO, BlogPost } from '../models/index.js';
import { escapeRegex } from '../utils/index.js';

/**
 * Returns internal pages that actually exist on the site, so the blog editor's
 * "Insert Link" feature can never suggest a broken URL.
 */
export const searchInternalLinks = async (query, { excludeBlogId = null, limit = 15 } = {}) => {
  const q = String(query || '').trim();
  const regex = q ? new RegExp(escapeRegex(q), 'i') : null;

  const [products, pages, posts] = await Promise.all([
    Product.find({ active: true, ...(regex ? { name: regex } : {}) })
      .select('name slug')
      .limit(limit)
      .lean(),
    PageSEO.find({ ...(regex ? { pageTitle: regex } : {}) })
      .select('pageKey pageTitle routePath')
      .limit(limit)
      .lean(),
    BlogPost.find({
      status: 'published',
      ...(excludeBlogId ? { _id: { $ne: excludeBlogId } } : {}),
      ...(regex ? { title: regex } : {}),
    })
      .select('title slug')
      .limit(limit)
      .lean(),
  ]);

  const results = [
    ...products.map((p) => ({ title: p.name, url: `/exam-vouchers/${p.slug}`, type: 'product' })),
    ...pages
      .filter((p) => p.routePath && !p.routePath.startsWith('/#'))
      .map((p) => ({ title: p.pageTitle, url: p.routePath, type: 'page' })),
    ...posts.map((b) => ({ title: b.title, url: `/blog/${b.slug}`, type: 'blog' })),
  ];

  return results.slice(0, limit);
};
