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
  if (!isCloudinaryUrl(resolved)) return resolved;

  const transform = `f_auto,q_auto,w_${Math.round(width)},c_limit`;
  if (/\/upload\/[^/]*f_auto[^/]*\//.test(resolved)) {
    return resolved.replace(/\/upload\/[^/]*f_auto[^/]*\//, `/upload/${transform}/`);
  }
  return resolved.replace('/upload/', `/upload/${transform}/`);
}
