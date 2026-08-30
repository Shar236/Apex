import { isCloudinaryUrl } from '../services/cloudinaryService.js';

/**
 * Normalize an image reference for delivery.
 *
 *  - empty / non-string            -> ''
 *  - Cloudinary URL                -> ensure f_auto,q_auto (+ w_<n>,c_limit when
 *                                     a width is requested) so every delivered
 *                                     image is format/quality/size optimized
 *  - legacy relative path          -> returned unchanged (served by
 *    (/uploads/…, /images/…)         express.static or the frontend public dir)
 *  - other absolute URL            -> returned unchanged
 *
 * Output-only: never mutates stored data.
 */
export const resolveImageUrl = (value, { width } = {}) => {
  if (!value || typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (!isCloudinaryUrl(trimmed)) return trimmed;

  const transform = width
    ? `f_auto,q_auto,w_${Math.round(width)},c_limit`
    : 'f_auto,q_auto';

  // Replace an existing leading transform segment if it already carries f_auto,
  // otherwise insert a fresh one right after /upload/.
  if (/\/upload\/[^/]*f_auto[^/]*\//.test(trimmed)) {
    return trimmed.replace(/\/upload\/[^/]*f_auto[^/]*\//, `/upload/${transform}/`);
  }
  return trimmed.replace('/upload/', `/upload/${transform}/`);
};

export default { resolveImageUrl };
