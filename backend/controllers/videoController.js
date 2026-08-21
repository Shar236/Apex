import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Video } from '../models/Video.js';
import { Setting } from '../models/Setting.js';
import { AppError } from '../middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * List Public Reels / Videos
 * GET /api/reels or GET /api/videos
 */
export const listPublicVideos = async (req, res, next) => {
  try {
    const [sectionSetting, modeSetting, videos] = await Promise.all([
      Setting.findOne({ key: 'videoSectionEnabled' }).lean(),
      Setting.findOne({ key: 'movieReelModeEnabled' }).lean(),
      Video.find({
        $or: [{ isActive: true }, { published: true }],
      })
        .sort({ order: 1, displayOrder: 1, featured: -1, createdAt: -1 })
        .lean(),
    ]);

    const videoSectionEnabled = sectionSetting?.value !== false;
    const movieReelModeEnabled = modeSetting?.value !== false;

    const formattedVideos = videos.map((v, index) => ({
      _id: v._id,
      id: v._id,
      title: v.title,
      description: v.description || '',
      category: v.category || 'Step-By-Step Guide',
      duration: v.duration || '15s',
      videoUrl: v.videoUrl,
      cloudinaryPublicId: v.cloudinaryPublicId || '',
      cloudinaryResourceType: v.cloudinaryResourceType || 'video',
      thumbnailUrl: v.thumbnailUrl || v.thumbnail || '',
      thumbnail: v.thumbnail || v.thumbnailUrl || '',
      badgeColor: v.badgeColor || 'bg-amber-400 text-slate-950',
      icon: v.icon || '🎬',
      views: v.views || v.viewsCount || 0,
      viewsCount: v.viewsCount || v.views || 0,
      order: v.order ?? v.displayOrder ?? index + 1,
      displayOrder: v.displayOrder ?? v.order ?? index + 1,
      isActive: v.isActive ?? v.published ?? true,
      published: v.published ?? v.isActive ?? true,
      featured: !!v.featured,
      youtubeEmbed: v.youtubeEmbed || '',
      instagramUrl: v.instagramUrl || '',
    }));

    res.json({
      success: true,
      count: formattedVideos.length,
      settings: {
        videoSectionEnabled,
        movieReelModeEnabled,
      },
      data: formattedVideos,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get Single Public Reel / Video
 * GET /api/reels/:id or GET /api/videos/:id
 */
export const getPublicVideo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const video = await Video.findById(id).lean();
    if (!video || (video.isActive === false && video.published === false)) {
      return next(new AppError('Reel not found', 404));
    }

    res.json({
      success: true,
      data: {
        ...video,
        thumbnailUrl: video.thumbnailUrl || video.thumbnail || '',
        order: video.order ?? video.displayOrder ?? 0,
        views: video.views ?? video.viewsCount ?? 0,
        isActive: video.isActive ?? video.published ?? true,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Increment Reel / Video View
 * POST /api/reels/:id/view or POST /api/videos/:id/view
 */
export const incrementVideoView = async (req, res, next) => {
  try {
    const { id } = req.params;
    const video = await Video.findByIdAndUpdate(
      id,
      { $inc: { viewsCount: 1, views: 1 } },
      { new: true }
    );
    if (!video) return next(new AppError('Video not found', 404));

    res.json({
      success: true,
      id: video._id,
      viewsCount: video.viewsCount || video.views,
      views: video.views || video.viewsCount,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Stream Video File with HTTP Range Requests (Legacy local file fallback)
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

export const listPublicReels = listPublicVideos;
export const getPublicReel = getPublicVideo;
export const incrementReelView = incrementVideoView;
