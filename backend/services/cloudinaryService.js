import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config/index.js';

// Configure Cloudinary credentials if present
if (config.cloudinary.cloudName) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
    secure: true,
  });
}

export const isCloudinaryConfigured = () => Boolean(config.cloudinary?.cloudName);


/**
 * Constructs direct MP4 delivery URL from Cloudinary public ID or clean name.
 * e.g. "v1" -> "https://res.cloudinary.com/nbcbpuql/video/upload/v1.mp4"
 */
export const buildDirectVideoUrl = (publicId, cloudName = config.cloudinary.cloudName || 'nbcbpuql') => {
  if (!publicId) return '';
  if (publicId.startsWith('http://') || publicId.startsWith('https://')) {
    return publicId;
  }
  // Strip extension if included
  const cleanId = publicId.replace(/\.(mp4|webm|mov|ogg)$/i, '');
  return `https://res.cloudinary.com/${cloudName}/video/upload/${cleanId}.mp4`;
};

/**
 * Constructs auto-generated poster / thumbnail URL from Cloudinary video public ID.
 * Uses keyframe snapshot (so_0) as JPG.
 * e.g. "v1" -> "https://res.cloudinary.com/nbcbpuql/video/upload/so_0/v1.jpg"
 */
export const buildVideoThumbnailUrl = (publicId, cloudName = config.cloudinary.cloudName || 'nbcbpuql') => {
  if (!publicId) return '';
  if (publicId.startsWith('http://') || publicId.startsWith('https://')) {
    // If it's a direct Cloudinary video URL, convert to poster jpg
    if (publicId.includes('res.cloudinary.com') && publicId.includes('/video/upload/')) {
      return publicId
        .replace('/video/upload/', '/video/upload/so_0/')
        .replace(/\.(mp4|webm|mov|ogg)$/i, '.jpg');
    }
    return publicId;
  }
  const cleanId = publicId.replace(/\.(mp4|webm|mov|ogg|jpg|png|webp)$/i, '');
  return `https://res.cloudinary.com/${cloudName}/video/upload/so_0/${cleanId}.jpg`;
};

/**
 * Extracts publicId from a Cloudinary URL or returns raw ID.
 */
export const extractPublicId = (urlOrId) => {
  if (!urlOrId) return '';
  const trimmed = urlOrId.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return trimmed.replace(/\.[^/.]+$/, '');
  }
  try {
    const parsed = new URL(trimmed);
    const parts = parsed.pathname.split('/upload/');
    if (parts.length > 1) {
      let afterUpload = parts[1];
      // remove version prefix like v1234567/ or transformations like so_0/
      const segments = afterUpload.split('/').filter(s => !s.startsWith('v') || isNaN(Number(s.substring(1))));
      const last = segments[segments.length - 1] || afterUpload;
      return last.replace(/\.[^/.]+$/, '');
    }
  } catch {}
  return trimmed;
};

/**
 * Stream Upload Buffer to Cloudinary
 * Supports videos and images
 */
export const uploadBufferToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!config.cloudinary.cloudName) {
      return reject(new Error('Cloudinary cloud name is not configured'));
    }

    const uploadOptions = {
      resource_type: options.resourceType || 'auto',
      folder: options.folder || 'apex_reels',
      ...options,
    };

    const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });

    stream.end(buffer);
  });
};

/**
 * Safely delete an asset from Cloudinary (video or image)
 */
export const deleteCloudinaryAsset = async (publicId, resourceType = 'video') => {
  if (!publicId || !config.cloudinary.apiKey || !config.cloudinary.apiSecret) {
    return { success: false, reason: 'Credentials not configured or missing publicId' };
  }
  try {
    const cleanId = extractPublicId(publicId);
    const res = await cloudinary.uploader.destroy(cleanId, { resource_type: resourceType });
    return { success: true, result: res };
  } catch (err) {
    console.warn(`[Cloudinary] Asset deletion warning for ${publicId}:`, err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Inserts f_auto,q_auto delivery transformation into a Cloudinary secure_url
 * so images are served in an optimal format/quality automatically.
 */
export const buildOptimizedImageUrl = (secureUrl) => {
  if (!secureUrl || typeof secureUrl !== 'string') return secureUrl;
  if (!secureUrl.includes('res.cloudinary.com') || !secureUrl.includes('/upload/')) return secureUrl;
  if (secureUrl.includes('/upload/f_auto')) return secureUrl;
  return secureUrl.replace('/upload/', '/upload/f_auto,q_auto/');
};

/**
 * True when a string is a Cloudinary delivery URL (res.cloudinary.com/.../upload/...).
 */
export const isCloudinaryUrl = (value) =>
  typeof value === 'string' &&
  value.includes('res.cloudinary.com') &&
  value.includes('/upload/');

/**
 * Build a responsive srcset of Cloudinary-derived widths from a delivery URL.
 * Any transform segment already present (e.g. f_auto,q_auto from
 * buildOptimizedImageUrl) is stripped first so widths don't stack transforms.
 * Returns '' for non-Cloudinary URLs.
 */
export const buildResponsiveSrcSet = (secureUrl, widths = [400, 800, 1200]) => {
  if (!isCloudinaryUrl(secureUrl)) return '';
  const base = secureUrl.replace(/\/upload\/[^/]*f_auto[^/]*\//, '/upload/');
  return widths
    .map((w) => {
      const variant = base.replace('/upload/', `/upload/w_${w},c_limit,f_auto,q_auto/`);
      return `${variant} ${w}w`;
    })
    .join(', ');
};

/**
 * Centralised image upload. Returns a normalized descriptor with the optimized
 * (f_auto,q_auto) delivery URL. Throws if Cloudinary is not configured so callers
 * never persist a broken reference.
 */
export const uploadImage = async (buffer, { folder = 'apex_general', publicId, overwrite = false } = {}) => {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary is not configured (missing CLOUDINARY_CLOUD_NAME)');
  }
  const opts = { resource_type: 'image', folder };
  if (publicId) {
    opts.public_id = publicId;
    opts.overwrite = overwrite;
    opts.invalidate = overwrite;
  }
  const res = await uploadBufferToCloudinary(buffer, opts);
  return {
    url: buildOptimizedImageUrl(res.secure_url),
    secureUrl: res.secure_url,
    publicId: res.public_id,
    width: res.width,
    height: res.height,
    format: res.format,
    bytes: res.bytes ?? (buffer ? buffer.length : undefined),
  };
};

/**
 * Upload a replacement image, then best-effort delete the previous asset.
 * A delete failure never rejects — the new upload is what matters.
 */
export const replaceImage = async (oldPublicId, buffer, options = {}) => {
  const result = await uploadImage(buffer, options);
  if (oldPublicId && oldPublicId !== result.publicId && isCloudinaryConfigured()) {
    try {
      await deleteCloudinaryAsset(oldPublicId, 'image');
    } catch (err) {
      console.warn(`[Cloudinary] Could not delete replaced asset ${oldPublicId}:`, err.message);
    }
  }
  return result;
};

export default {
  buildDirectVideoUrl,
  buildVideoThumbnailUrl,
  extractPublicId,
  uploadBufferToCloudinary,
  deleteCloudinaryAsset,
  buildOptimizedImageUrl,
  buildResponsiveSrcSet,
  isCloudinaryUrl,
  isCloudinaryConfigured,
  uploadImage,
  replaceImage,
};
