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

const pageSEOSchema = new mongoose.Schema(
  {
    pageKey: {
      type: String,
      required: [true, 'Page key is required'],
      unique: true,
      trim: true,
      index: true,
    },
    pageTitle: {
      type: String,
      required: [true, 'Page display title is required'],
      trim: true,
    },
    routePath: {
      type: String,
      trim: true,
      default: '',
    },
    content: { type: String, trim: true, default: '' },
    seo: seoSubSchema,
  },
  { timestamps: true }
);

pageSEOSchema.index({ pageKey: 1 });

export const PageSEO = mongoose.model('PageSEO', pageSEOSchema);
