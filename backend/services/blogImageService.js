import {
  uploadBufferToCloudinary,
  deleteCloudinaryAsset,
  buildOptimizedImageUrl,
  extractPublicId,
  buildResponsiveSrcSet,
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

// buildResponsiveSrcSet now lives in cloudinaryService.js (shared by product +
// blog code); re-exported here so existing blog callsites keep working.
export { extractPublicId, buildResponsiveSrcSet };
