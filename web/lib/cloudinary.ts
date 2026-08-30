import { imageMap } from './image-map';
import { siteConfig } from './config';

const isCloudinaryUrl = (url: string) => url.includes('res.cloudinary.com') && url.includes('/upload/');

/**
 * Resolves a legacy local path, bare Cloudinary public id, or an already-formed
 * Cloudinary delivery URL to a full Cloudinary URL. Mirrors the Vite app's
 * frontend/src/lib/imageUrl.js resolveSource() so existing DB/CMS image
 * references keep working unchanged.
 *
 * Plain (non-'use client') module so it's safely importable from both Server
 * Components and the 'use client' next/image loader — a function exported
 * from a 'use client' file becomes an unusable client reference when a
 * Server Component imports it directly.
 */
export const resolveImageSrc = (src: string): string => {
  if (imageMap[src]) return imageMap[src];
  if (isCloudinaryUrl(src)) return src;
  if (!src.startsWith('/') && !src.startsWith('http://') && !src.startsWith('https://') && !src.startsWith('data:') && !src.startsWith('blob:')) {
    return `https://res.cloudinary.com/${siteConfig.cloudinaryCloudName}/image/upload/${src}`;
  }
  return src;
};

export { isCloudinaryUrl };
