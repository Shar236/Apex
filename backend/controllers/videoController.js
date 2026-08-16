import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Video } from '../models/Video.js';
import { Setting } from '../models/Setting.js';
import { AppError } from '../middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const listPublicVideos = async (req, res, next) => {
  try {
    const [sectionSetting, modeSetting, videos] = await Promise.all([
      Setting.findOne({ key: 'videoSectionEnabled' }).lean(),
      Setting.findOne({ key: 'movieReelModeEnabled' }).lean(),
      Video.find({ published: true }).sort({ displayOrder: 1, featured: -1, createdAt: -1 }).lean(),
    ]);

    const videoSectionEnabled = sectionSetting?.value !== false;
    const movieReelModeEnabled = modeSetting?.value !== false;

    res.json({
      success: true,
      count: videos.length,
      settings: {
        videoSectionEnabled,
        movieReelModeEnabled,
      },
      data: videos,
    });
  } catch (err) {
    next(err);
  }
};

export const incrementVideoView = async (req, res, next) => {
  try {
    const { id } = req.params;
    const video = await Video.findByIdAndUpdate(id, { $inc: { viewsCount: 1 } }, { new: true });
    if (!video) return next(new AppError('Video not found', 404));

    res.json({
      success: true,
      id: video._id,
      viewsCount: video.viewsCount,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Stream Video File with HTTP Range Requests (206 Partial Content)
 * GET /api/videos/stream/:filename
 */
export const streamVideoFile = async (req, res, next) => {
  try {
    const { filename } = req.params;
    const safeFilename = path.basename(filename);
    const videoPath = path.join(__dirname, '../public/uploads/videos', safeFilename);

    if (!fs.existsSync(videoPath)) {
      return next(new AppError('Video file not found', 404));
    }

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    const ext = path.extname(safeFilename).toLowerCase();
    let contentType = 'video/mp4';
    if (ext === '.webm') contentType = 'video/webm';
    if (ext === '.mov') contentType = 'video/quicktime';

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize || end >= fileSize) {
        res.setHeader('Content-Range', `bytes */${fileSize}`);
        return res.status(416).json({ success: false, message: 'Requested range not satisfiable' });
      }

      const chunksize = end - start + 1;
      const file = fs.createReadStream(videoPath, { start, end });

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': contentType,
      });

      file.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
      });
      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (err) {
    next(err);
  }
};
