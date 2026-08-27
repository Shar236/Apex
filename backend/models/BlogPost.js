import mongoose from 'mongoose';

const seoSubSchema = new mongoose.Schema({
  title: { type: String, trim: true, default: '' },
  description: { type: String, trim: true, default: '' },
  focusKeyword: { type: String, trim: true, default: '' },
  secondaryKeywords: [{ type: String, trim: true }],
  canonicalUrl: { type: String, trim: true, default: '' },
  ogTitle: { type: String, trim: true, default: '' },
  ogDescription: { type: String, trim: true, default: '' },
  ogImage: { type: String, trim: true, default: '' },
  twitterTitle: { type: String, trim: true, default: '' },
  twitterDescription: { type: String, trim: true, default: '' },
  twitterImage: { type: String, trim: true, default: '' },
  twitterCardType: { type: String, trim: true, default: 'summary_large_image' },
  noindex: { type: Boolean, default: false },
  nofollow: { type: Boolean, default: false },
}, { _id: false });

const blogImageSchema = new mongoose.Schema({
  url: { type: String, trim: true, default: '' },
  publicId: { type: String, trim: true, default: '' },
  filename: { type: String, trim: true, default: '' },
  alt: { type: String, trim: true, default: '' },
  title: { type: String, trim: true, default: '' },
  caption: { type: String, trim: true, default: '' },
  description: { type: String, trim: true, default: '' },
}, { _id: true, timestamps: false });

const faqSchema = new mongoose.Schema({
  question: { type: String, trim: true, required: true },
  answer: { type: String, trim: true, required: true },
}, { _id: true, timestamps: false });

export const BLOG_STATUSES = ['draft', 'scheduled', 'published', 'unpublished', 'trash'];

const blogPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Post title is required'],
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    excerpt: {
      type: String,
      trim: true,
      default: '',
    },
    content: {
      type: String,
      trim: true,
      default: '',
    },
    coverImage: {
      type: String,
      trim: true,
      default: '',
    },
    coverImagePublicId: {
      type: String,
      trim: true,
      default: '',
    },
    coverImageAlt: { type: String, trim: true, default: '' },
    coverImageTitle: { type: String, trim: true, default: '' },
    coverImageCaption: { type: String, trim: true, default: '' },
    coverImageDescription: { type: String, trim: true, default: '' },
    images: [blogImageSchema],
    author: {
      type: String,
      trim: true,
      default: 'Apex Vouchers',
    },
    authorBio: { type: String, trim: true, default: '' },
    authorImage: { type: String, trim: true, default: '' },
    reviewer: { type: String, trim: true, default: '' },
    reviewedAt: { type: Date, default: null },
    category: {
      type: String,
      trim: true,
      default: 'Exam Guide',
      index: true,
    },
    tags: [{ type: String, trim: true }],

    status: {
      type: String,
      enum: BLOG_STATUSES,
      default: 'draft',
      index: true,
    },
    previousStatus: { type: String, enum: BLOG_STATUSES, default: null },
    scheduledAt: { type: Date, default: null, index: true },
    publishedAt: { type: Date, default: null },
    trashedAt: { type: Date, default: null },

    featured: {
      type: Boolean,
      default: false,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    readingTime: { type: Number, default: 1 },

    faqs: [faqSchema],
    relatedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'BlogPost' }],

    seoScore: { type: Number, default: 0 },
    seoScoreGrade: { type: String, default: '' },

    seo: seoSubSchema,
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function estimateReadingTime(html) {
  const words = String(html || '').replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

// Backward-compatible virtual — several older callsites (sitemap, overview scoring)
// may still be migrated incrementally; this keeps `post.published` truthy exactly
// when status is 'published' without requiring every read-site to change at once.
blogPostSchema.virtual('published').get(function () {
  return this.status === 'published';
});

blogPostSchema.pre('validate', function (next) {
  if (!this.slug && this.title) {
    this.slug = slugify(this.title);
  }
  if (!this.seo) this.seo = {};
  next();
});

blogPostSchema.pre('save', function (next) {
  this.readingTime = estimateReadingTime(this.content);
  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  if (this.status === 'trash' && !this.trashedAt) {
    this.trashedAt = new Date();
  }
  if (this.status !== 'trash') {
    this.trashedAt = null;
  }
  next();
});

blogPostSchema.index({ status: 1, category: 1 });
blogPostSchema.index({ status: 1, createdAt: -1 });
blogPostSchema.index({ status: 1, scheduledAt: 1 });

export const BlogPost = mongoose.model('BlogPost', blogPostSchema);
