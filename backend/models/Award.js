import mongoose from 'mongoose';
import { buildDirectVideoUrl, buildVideoThumbnailUrl, extractPublicId, buildOptimizedImageUrl } from '../services/cloudinaryService.js';

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const awardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Award / achievement title is required'],
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    // Display year / date, e.g. "2025" or "March 2025"
    year: {
      type: String,
      trim: true,
      default: '',
      index: true,
    },
    dateAwarded: {
      type: Date,
      default: null,
    },
    // Awarding organization / presented by
    organization: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      trim: true,
      default: 'Recognition',
      index: true,
    },
    // Cloudinary-hosted image
    imageUrl: {
      type: String,
      trim: true,
      default: '',
    },
    imagePublicId: {
      type: String,
      trim: true,
      default: '',
      index: true,
    },
    imageAlt: {
      type: String,
      trim: true,
      default: '',
    },
    // Optional Cloudinary-hosted video
    videoUrl: {
      type: String,
      trim: true,
      default: '',
    },
    videoPublicId: {
      type: String,
      trim: true,
      default: '',
      index: true,
    },
    videoResourceType: {
      type: String,
      trim: true,
      default: 'video',
    },
    videoThumbnail: {
      type: String,
      trim: true,
      default: '',
    },
    // Optional external link for more info
    externalLink: {
      type: String,
      trim: true,
      default: '',
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
      index: true,
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

awardSchema.pre('validate', function (next) {
  // Auto slug
  if (!this.slug && this.title) {
    this.slug = slugify(this.title);
  }

  // Sync status <-> isActive <-> published so any alias stays consistent
  if (this.status !== undefined) {
    const active = this.status === 'active';
    if (this.isActive === undefined) this.isActive = active;
    if (this.published === undefined) this.published = active;
  } else if (this.isActive !== undefined && this.status === undefined) {
    this.status = this.isActive ? 'active' : 'inactive';
  }

  if (this.isActive !== undefined && this.published === undefined) {
    this.published = this.isActive;
  } else if (this.published !== undefined && this.isActive === undefined) {
    this.isActive = this.published;
  } else if (this.isModified('isActive') && !this.isModified('published')) {
    this.published = this.isActive;
  } else if (this.isModified('published') && !this.isModified('isActive')) {
    this.isActive = this.published;
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

  // Auto-derive Cloudinary helper URLs from public IDs
  if (this.imagePublicId && !this.imageUrl) {
    this.imageUrl = buildOptimizedImageUrl(
      `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME || 'nbcbpuql'}/image/upload/${this.imagePublicId}`
    );
  }
  if (this.videoPublicId) {
    if (!this.videoUrl || this.videoUrl.includes('sample/ForBigger')) {
      this.videoUrl = buildDirectVideoUrl(this.videoPublicId);
    }
    if (!this.videoThumbnail) {
      this.videoThumbnail = buildVideoThumbnailUrl(this.videoPublicId);
    }
  } else if (this.videoUrl && this.videoUrl.includes('cloudinary.com')) {
    this.videoPublicId = extractPublicId(this.videoUrl);
    if (!this.videoThumbnail) this.videoThumbnail = buildVideoThumbnailUrl(this.videoPublicId);
  }

  next();
});

awardSchema.index({ published: 1, displayOrder: 1 });
awardSchema.index({ status: 1, featured: -1 });
awardSchema.index({ category: 1, published: 1 });
awardSchema.index({ featured: -1, displayOrder: 1, order: 1, createdAt: -1 });

export const Award = mongoose.model('Award', awardSchema);