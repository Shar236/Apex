import { resolveImageSrc } from './cloudinary';
import type { BlogPost } from './blog-types';

/**
 * Resolve an image for a code-based article from the CMS. The admin uploads
 * the article's images in the Blog editor's "In-Article Images" panel, named
 * with a stable key (`hero`, `ielts-clb-chart`, …); this looks that image up
 * in `post.images[]`. If nothing matches (e.g. before the admin has uploaded
 * it), the provided `fallback` — the original local static path under
 * public/images/blogs/<slug>/ — is used instead.
 */
export function articleImage(post: BlogPost | undefined, key: string, fallback = ''): string {
  const images = Array.isArray(post?.images) ? post.images : [];
  const k = key.toLowerCase();
  const hit = images.find((img) => {
    const name = (img?.filename || '').toLowerCase();
    const pid = (img?.publicId || '').toLowerCase();
    const alt = (img?.alt || '').toLowerCase();
    return name.includes(k) || pid.includes(k) || alt.includes(k);
  });
  return hit?.url ? resolveImageSrc(hit.url) : fallback;
}
