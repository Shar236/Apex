import { imageMap } from './imageMap.js';

const CLOUDINARY_CLOUD_NAME = 'nbcbpuql';

const isCloudinary = (url) =>
  typeof url === 'string' &&
  url.includes('res.cloudinary.com') &&
  url.includes('/upload/');

const resolveSource = (src) => {
  if (!src || typeof src !== 'string') return '';

  // Explicit legacy/local mapping
  if (imageMap[src]) {
    return imageMap[src];
  }

  // Already a Cloudinary delivery URL
  if (isCloudinary(src)) {
    return src;
  }

  // Bare Cloudinary public ID
  if (
    !src.startsWith('/') &&
    !src.startsWith('http://') &&
    !src.startsWith('https://') &&
    !src.startsWith('data:') &&
    !src.startsWith('blob:')
  ) {
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${src}`;
  }

  return src;
};

export const imageUrl = (src, { width } = {}) => {
  if (!src || typeof src !== 'string') {
    return src || '';
  }

  const mapped = resolveSource(src);

  if (!isCloudinary(mapped)) {
    return mapped;
  }

  const transform = width
    ? `f_auto,q_auto,w_${Math.round(width)},c_limit`
    : 'f_auto,q_auto';

  // Replace an existing Cloudinary transformation
  if (/\/upload\/[^/]*f_auto[^/]*\//.test(mapped)) {
    return mapped.replace(
      /\/upload\/[^/]*f_auto[^/]*\//,
      `/upload/${transform}/`
    );
  }

  // Add transformation to the delivery URL
  return mapped.replace(
    '/upload/',
    `/upload/${transform}/`
  );
};

/**
 * Responsive Cloudinary srcSet.
 *
 * Returns an empty string for non-Cloudinary images.
 */
export const cldSrcSet = (
  src,
  widths = [400, 800, 1200]
) => {
  const mapped = resolveSource(src);

  if (!isCloudinary(mapped)) {
    return '';
  }

  // Remove existing transformation so we don't stack transformations.
  const base = mapped.replace(
    /\/upload\/[^/]*f_auto[^/]*\//,
    '/upload/'
  );

  return widths
    .map((w) => {
      const url = base.replace(
        '/upload/',
        `/upload/w_${w},c_limit,f_auto,q_auto/`
      );

      return `${url} ${w}w`;
    })
    .join(', ');
};

export default imageUrl;