import {
  uploadBufferToCloudinary,
  deleteCloudinaryAsset,
  buildOptimizedImageUrl,
  extractPublicId,
} from './cloudinaryService.js';

const LARGE_FILE_WARNING_BYTES = 2 * 1024 * 1024; // 2MB

/**
 * Upload a blog image buffer to Cloudinary and return the optimized delivery URL.
 * Cloudinary's f_auto,q_auto delivery transform (applied by buildOptimizedImageUrl)
 * automatically negotiates WebP/AVIF per-browser and tunes quality, so no separate
 * sharp-based transcoding pipeline is needed here.
 */
export const uploadBlogImage = async (buffer, originalname, folder = 'apex_blog/images') => {
  const cloudRes = await uploadBufferToCloudinary(buffer, {
    resource_type: 'image',
    folder,
  });

  const warning =
    buffer.length > LARGE_FILE_WARNING_BYTES
      ? `Image is ${(buffer.length / (1024 * 1024)).toFixed(1)} MB. Consider uploading a compressed version.`
      : null;

  return {
    url: buildOptimizedImageUrl(cloudRes.secure_url),
    publicId: cloudRes.public_id,
    filename: originalname || '',
    width: cloudRes.width,
    height: cloudRes.height,
    bytes: buffer.length,
    warning,
  };
};

export const deleteBlogImage = async (publicId) => {
  if (!publicId) return { success: false, reason: 'No publicId' };
  return deleteCloudinaryAsset(publicId, 'image');
};

/**
 * Build a srcset of responsive Cloudinary-derived widths from a delivery URL,
 * so the frontend can serve appropriately sized images without separate files.
 */
export const buildResponsiveSrcSet = (secureUrl, widths = [400, 800, 1200]) => {
  if (!secureUrl || !secureUrl.includes('res.cloudinary.com') || !secureUrl.includes('/upload/')) return '';
  // Strip any transform segment already inserted (e.g. by buildOptimizedImageUrl)
  // so widths don't stack transforms on top of each other.
  const base = secureUrl.replace('/upload/f_auto,q_auto/', '/upload/');
  return widths
    .map((w) => {
      const variant = base.replace('/upload/', `/upload/w_${w},c_limit,f_auto,q_auto/`);
      return `${variant} ${w}w`;
    })
    .join(', ');
};

export { extractPublicId };
