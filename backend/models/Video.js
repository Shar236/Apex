import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Video title required'],
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
    viewsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    published: {
      type: Boolean,
      default: true,
      index: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  { timestamps: true }
);

videoSchema.index({ published: 1, displayOrder: 1 });

export const Video = mongoose.model('Video', videoSchema);
