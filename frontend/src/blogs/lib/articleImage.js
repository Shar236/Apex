import { imageUrl } from '../../lib/imageUrl.js';

/**
 * Resolve an image for a code-based article from the CMS.
 *
 * Code articles no longer hardcode local image paths. Instead the admin uploads
 * the article's images in the Blog editor's "In-Article Images" panel and names
 * each file with a stable key (`hero`, `ielts-clb-chart`, …). This looks that
 * image up in `post.images[]` and returns its (Cloudinary) URL, optimized via
 * `imageUrl()`.
 *
 * If nothing matches — e.g. before the admin has uploaded it — the provided
 * `fallback` (usually the old `/images/blogs/<slug>/<key>.webp` path) is
 * returned, so `ArticleFigure` renders exactly as it does today (real file or
 * its labelled placeholder). Nothing breaks.
 *
 * @param {object} post      the blog post object from the public API
 * @param {string} key       stable image key, matched against filename/publicId/alt
 * @param {string} fallback  path to use when no CMS image matches
 */
export function articleImage(post, key, fallback = '') {
  const images = Array.isArray(post?.images) ? post.images : [];
  const k = String(key).toLowerCase();
  const hit = images.find((img) => {
    const name = String(img?.filename || '').toLowerCase();
    const pid = String(img?.publicId || '').toLowerCase();
    const alt = String(img?.alt || '').toLowerCase();
    return name.includes(k) || pid.includes(k) || alt.includes(k);
  });
  return hit?.url ? imageUrl(hit.url) : fallback;
}

export default articleImage;
