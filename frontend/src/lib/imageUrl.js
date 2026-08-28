import { imageMap } from './imageMap.js';

/**
 * Pure string helpers for image delivery. No SDK, no network.
 *
 * The backend already returns Cloudinary URLs for admin/CMS content (products,
 * blogs, awards). These helpers:
 *   1. redirect known legacy local paths to their migrated Cloudinary URL
 *      (via imageMap), and
 *   2. ensure any Cloudinary URL carries an f_auto,q_auto (+ optional width)
 *      delivery transform so the browser gets an optimally sized modern format.
 *
 * Non-Cloudinary values (local `/foo.png`, external URLs, data URIs) are
 * returned unchanged, so wrapping a `src` in `imageUrl()` is always safe.
 */

const isCloudinary = (url) =>
  typeof url === 'string' &&
  url.includes('res.cloudinary.com') &&
  url.includes('/upload/');

export const imageUrl = (src, { width } = {}) => {
  if (!src || typeof src !== 'string') return src || '';
  const mapped = imageMap[src] || src;
  if (!isCloudinary(mapped)) return mapped;

  const transform = width
    ? `f_auto,q_auto,w_${Math.round(width)},c_limit`
    : 'f_auto,q_auto';

  if (/\/upload\/[^/]*f_auto[^/]*\//.test(mapped)) {
    return mapped.replace(/\/upload\/[^/]*f_auto[^/]*\//, `/upload/${transform}/`);
  }
  return mapped.replace('/upload/', `/upload/${transform}/`);
};

/**
 * Responsive srcset for a Cloudinary image. Returns '' for anything else, so it
 * can be passed straight to an <img srcSet> without conditionals.
 */
export const cldSrcSet = (src, widths = [400, 800, 1200]) => {
  const mapped = (src && imageMap[src]) || src;
  if (!isCloudinary(mapped)) return '';
  const base = mapped.replace(/\/upload\/[^/]*f_auto[^/]*\//, '/upload/');
  return widths
    .map((w) => `${base.replace('/upload/', `/upload/w_${w},c_limit,f_auto,q_auto/`)} ${w}w`)
    .join(', ');
};

export default imageUrl;
