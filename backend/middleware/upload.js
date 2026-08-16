import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsBaseDir = path.join(__dirname, '../public/uploads');
const videosDir = path.join(uploadsBaseDir, 'videos');
const thumbnailsDir = path.join(uploadsBaseDir, 'thumbnails');

// Ensure upload directories exist
[uploadsBaseDir, videosDir, thumbnailsDir].forEach((dir) => {
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
