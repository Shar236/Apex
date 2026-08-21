import mongoose from 'mongoose';
import { buildDirectVideoUrl, buildVideoThumbnailUrl, extractPublicId } from '../services/cloudinaryService.js';

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Reel / video title required'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    videoUrl: {
      type: String,
      required: [true, 'Video URL required'],
      trim: true,
    },
    cloudinaryPublicId: {
      type: String,
      trim: true,
      default: '',
      index: true,
    },
    cloudinaryResourceType: {
      type: String,
      trim: true,
      default: 'video',
    },
    thumbnailUrl: {
      type: String,
      trim: true,
      default: '',
    },
    thumbnail: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      trim: true,
      default: 'Step-By-Step Guide',
      index: true,
    },
    duration: {
      type: String,
      trim: true,
      default: '15s',
    },
    badgeColor: {
      type: String,
      default: 'bg-amber-400 text-slate-950',
    },
    icon: {
      type: String,
      default: '🎬',
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    viewsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    published: {
      type: Boolean,
      default: true,
      index: true,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    youtubeEmbed: {
      type: String,
      trim: true,
      default: '',
    },
    instagramUrl: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Synchronize mirrored fields before validation & save
videoSchema.pre('validate', function (next) {
  // Sync Cloudinary Public ID and URLs
  if (this.cloudinaryPublicId) {
    if (!this.videoUrl || this.videoUrl.includes('sample/ForBigger')) {
      this.videoUrl = buildDirectVideoUrl(this.cloudinaryPublicId);
    }
    if (!this.thumbnailUrl && !this.thumbnail) {
      this.thumbnailUrl = buildVideoThumbnailUrl(this.cloudinaryPublicId);
      this.thumbnail = this.thumbnailUrl;
    }
  } else if (this.videoUrl && this.videoUrl.includes('cloudinary.com')) {
    this.cloudinaryPublicId = extractPublicId(this.videoUrl);
  }

  // Sync thumbnailUrl <-> thumbnail
  if (this.thumbnailUrl && !this.thumbnail) {
    this.thumbnail = this.thumbnailUrl;
  } else if (this.thumbnail && !this.thumbnailUrl) {
    this.thumbnailUrl = this.thumbnail;
  }

  // Sync order <-> displayOrder
  if (this.order !== undefined && this.displayOrder === undefined) {
    this.displayOrder = this.order;
  } else if (this.displayOrder !== undefined && this.order === undefined) {
    this.order = this.displayOrder;
  } else if (this.isModified('order') && !this.isModified('displayOrder')) {
    this.displayOrder = this.order;
  } else if (this.isModified('displayOrder') && !this.isModified('order')) {
    this.order = this.displayOrder;
  }

  // Sync isActive <-> published
  if (this.isActive !== undefined && this.published === undefined) {
    this.published = this.isActive;
  } else if (this.published !== undefined && this.isActive === undefined) {
    this.isActive = this.published;
  } else if (this.isModified('isActive') && !this.isModified('published')) {
    this.published = this.isActive;
  } else if (this.isModified('published') && !this.isModified('isActive')) {
    this.isActive = this.published;
  }

  // Sync views <-> viewsCount
  if (this.views !== undefined && (this.viewsCount === undefined || this.viewsCount === 0)) {
    this.viewsCount = this.views;
  } else if (this.viewsCount !== undefined && (this.views === undefined || this.views === 0)) {
    this.views = this.viewsCount;
  } else if (this.isModified('views') && !this.isModified('viewsCount')) {
    this.viewsCount = this.views;
  } else if (this.isModified('viewsCount') && !this.isModified('views')) {
    this.views = this.viewsCount;
  }

  next();
});

videoSchema.index({ published: 1, displayOrder: 1 });
videoSchema.index({ isActive: 1, order: 1 });

export const Video = mongoose.model('Video', videoSchema);
export const Reel = Video;
