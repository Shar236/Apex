'use client';

import { resolveImageSrc, isCloudinaryUrl } from './cloudinary';

/**
 * Custom next/image loader (see next.config.ts `images.loaderFile`) that
 * routes optimization through Cloudinary's own transforms instead of Next's
 * built-in image optimizer, avoiding double-processing already-optimized
 * Cloudinary assets.
 */
export default function cloudinaryLoader({ src, width }: { src: string; width: number; quality?: number }): string {
  const resolved = resolveImageSrc(src);
  const w = Math.round(width);

  if (!isCloudinaryUrl(resolved)) {
    // Unsplash serves its own width-aware CDN transform via the `w` param — honour
    // `width` so next/image doesn't warn that the loader ignores it.
    if (resolved.includes('images.unsplash.com/')) {
      const u = new URL(resolved);
      u.searchParams.set('w', String(w));
      u.searchParams.set('auto', 'format');
      u.searchParams.set('fit', 'crop');
      return u.toString();
    }
    return resolved;
  }

  const transform = `f_auto,q_auto,w_${w},c_limit`;
  if (/\/upload\/[^/]*f_auto[^/]*\//.test(resolved)) {
    return resolved.replace(/\/upload\/[^/]*f_auto[^/]*\//, `/upload/${transform}/`);
  }
  return resolved.replace('/upload/', `/upload/${transform}/`);
}
