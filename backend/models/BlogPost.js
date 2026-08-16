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
  noindex: { type: Boolean, default: false },
  nofollow: { type: Boolean, default: false },
}, { _id: false });

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
    author: {
      type: String,
      trim: true,
      default: 'Apex Vouchers',
    },
    category: {
      type: String,
      trim: true,
      default: 'Exam Guide',
      index: true,
    },
    tags: [{ type: String, trim: true }],
    published: {
      type: Boolean,
      default: false,
      index: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    seo: seoSubSchema,
  },
  { timestamps: true }
);

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

blogPostSchema.pre('save', function (next) {
  if (!this.slug && this.title) {
    this.slug = slugify(this.title);
  }
  if (!this.seo) this.seo = {};
  next();
});

blogPostSchema.index({ published: 1, category: 1 });
blogPostSchema.index({ published: 1, createdAt: -1 });

export const BlogPost = mongoose.model('BlogPost', blogPostSchema);
