import { Video } from '../models/Video.js';
import { Setting } from '../models/Setting.js';
import { AppError } from '../middleware/errorHandler.js';

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
