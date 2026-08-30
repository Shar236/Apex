'use client';

import { imageMap } from './image-map';
import { siteConfig } from './config';

const isCloudinaryUrl = (url: string) => url.includes('res.cloudinary.com') && url.includes('/upload/');

/**
 * Resolves a legacy local path, bare Cloudinary public id, or an already-formed
 * Cloudinary delivery URL to a full Cloudinary URL. Mirrors the Vite app's
 * frontend/src/lib/imageUrl.js resolveSource() so existing DB/CMS image
 * references keep working unchanged.
 */
const resolveSource = (src: string): string => {
  if (imageMap[src]) return imageMap[src];
  if (isCloudinaryUrl(src)) return src;
  if (!src.startsWith('/') && !src.startsWith('http://') && !src.startsWith('https://') && !src.startsWith('data:') && !src.startsWith('blob:')) {
    return `https://res.cloudinary.com/${siteConfig.cloudinaryCloudName}/image/upload/${src}`;
  }
  return src;
};

/**
 * Custom next/image loader (see next.config.ts `images.loaderFile`) that
 * routes optimization through Cloudinary's own transforms instead of Next's
 * built-in image optimizer, avoiding double-processing already-optimized
 * Cloudinary assets.
 */
export default function cloudinaryLoader({ src, width }: { src: string; width: number; quality?: number }): string {
  const resolved = resolveSource(src);
  if (!isCloudinaryUrl(resolved)) return resolved;

  const transform = `f_auto,q_auto,w_${Math.round(width)},c_limit`;
  if (/\/upload\/[^/]*f_auto[^/]*\//.test(resolved)) {
    return resolved.replace(/\/upload\/[^/]*f_auto[^/]*\//, `/upload/${transform}/`);
  }
  return resolved.replace('/upload/', `/upload/${transform}/`);
}

export { resolveSource as resolveImageSrc };
