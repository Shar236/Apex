import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsBaseDir = path.join(__dirname, '../public/uploads');
const videosDir = path.join(uploadsBaseDir, 'videos');
const thumbnailsDir = path.join(uploadsBaseDir, 'thumbnails');
const avatarsDir = path.join(uploadsBaseDir, 'avatars');

// Ensure upload directories exist
[uploadsBaseDir, videosDir, thumbnailsDir, avatarsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    if (file.fieldname === 'video') {
      cb(null, videosDir);
    } else if (file.fieldname === 'thumbnail') {
      cb(null, thumbnailsDir);
    } else {
      cb(null, uploadsBaseDir);
    }
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e6)}`;
    cb(null, `${cleanName}_${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (file.fieldname === 'video') {
    const allowedExts = ['.mp4', '.webm', '.mov'];
    const allowedMimes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExts.includes(ext) || allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid video format. Supported: .mp4, .webm, .mov'), false);
    }
  } else if (file.fieldname === 'thumbnail') {
    const allowedExts = ['.jpg', '.jpeg', '.png', '.webp'];
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExts.includes(ext) || allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid thumbnail image format. Supported: .jpg, .jpeg, .png, .webp'), false);
    }
  } else {
    cb(null, true);
  }
};

export const mediaUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max video size
  },
});

// ── Awards Media Upload (Image + Video) ──────────────────────────────────────
const awardImagesDir = path.join(uploadsBaseDir, 'awards');
if (!fs.existsSync(awardImagesDir)) {
  fs.mkdirSync(awardImagesDir, { recursive: true });
}

const awardMediaStorage = multer.diskStorage({
  destination: (_req, file, cb) => {
    if (file.fieldname === 'video') cb(null, videosDir);
    else cb(null, awardImagesDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e6)}`;
    cb(null, `award_${cleanName}_${uniqueSuffix}${ext}`);
  },
});

const awardMediaFileFilter = (_req, file, cb) => {
  if (file.fieldname === 'video') {
    const allowedExts = ['.mp4', '.webm', '.mov'];
    const allowedMimes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExts.includes(ext) && allowedMimes.includes(file.mimetype)) {
      return cb(null, true);
    }
    return cb(new Error('Invalid video format. Supported: .mp4, .webm, .mov'), false);
  }
  // image field (award photo)
  const allowedExts = ['.jpg', '.jpeg', '.png', '.webp'];
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExts.includes(ext) && allowedMimes.includes(file.mimetype)) {
    return cb(null, true);
  }
  return cb(new Error('Invalid award image format. Supported: .jpg, .jpeg, .png, .webp'), false);
};

export const awardMediaUpload = multer({
  storage: awardMediaStorage,
  fileFilter: awardMediaFileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max video size
  },
});

// ── Profile Image Upload ──────────────────────────────────────────────────────
const avatarStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, avatarsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e6)}`;
    cb(null, `avatar_${uniqueSuffix}${ext}`);
  },
});

const avatarFileFilter = (_req, file, cb) => {
  const allowedExts = ['.jpg', '.jpeg', '.png', '.webp'];
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExts.includes(ext) && allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid image format. Supported: JPG, JPEG, PNG, WebP'), false);
  }
};

export const profileImageUpload = multer({
  storage: avatarStorage,
  fileFilter: avatarFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
});

// ── Product Logo Upload ───────────────────────────────────────────────────────
const productLogosDir = path.join(uploadsBaseDir, 'product-logos');
if (!fs.existsSync(productLogosDir)) {
  fs.mkdirSync(productLogosDir, { recursive: true });
}

const productLogoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, productLogosDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e6)}`;
    cb(null, `logo_${uniqueSuffix}${ext}`);
  },
});

// SVG intentionally excluded: user-uploaded SVGs can embed scripts and are an
// XSS vector unless Cloudinary's account-level SVG delivery sanitization is
// explicitly verified as enabled, which is not assumed here.
const productLogoFileFilter = (_req, file, cb) => {
  const allowedExts = ['.jpg', '.jpeg', '.png', '.webp'];
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExts.includes(ext) && allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid logo format. Supported: JPG, JPEG, PNG, WebP'), false);
  }
};

export const productLogoUpload = multer({
  storage: productLogoStorage,
  fileFilter: productLogoFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
});

// ── Blog Image Upload (featured + in-article images) ─────────────────────────
const blogImagesDir = path.join(uploadsBaseDir, 'blog');
if (!fs.existsSync(blogImagesDir)) {
  fs.mkdirSync(blogImagesDir, { recursive: true });
}

const blogImageStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, blogImagesDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e6)}`;
    cb(null, `blog_${cleanName}_${uniqueSuffix}${ext}`);
  },
});

const blogImageFileFilter = (_req, file, cb) => {
  const allowedExts = ['.jpg', '.jpeg', '.png', '.webp'];
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExts.includes(ext) && allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid image format. Supported: JPG, JPEG, PNG, WebP'), false);
  }
};

export const blogImageUpload = multer({
  storage: blogImageStorage,
  fileFilter: blogImageFileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB hard cap; a softer >2MB warning is surfaced separately
  },
});

// ── Product Image Upload (primary product photo → Cloudinary) ────────────────
// Memory storage: the buffer is streamed straight to Cloudinary, so there is no
// temp file to clean up and no local-disk fallback path for the primary image.
const imageFileFilter = (_req, file, cb) => {
  const allowedExts = ['.jpg', '.jpeg', '.png', '.webp'];
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExts.includes(ext) && allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid image format. Supported: JPG, JPEG, PNG, WebP'), false);
  }
};

export const productImageUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
});

