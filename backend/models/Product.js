import mongoose from 'mongoose';

const seoSchema = new mongoose.Schema({
  title: { type: String, trim: true, default: '' },
  description: { type: String, trim: true, default: '' },
  slug: { type: String, trim: true, lowercase: true, default: '' },
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

const imageSeoSchema = new mongoose.Schema({
  altText: { type: String, trim: true, default: '' },
  imageTitle: { type: String, trim: true, default: '' },
  caption: { type: String, trim: true, default: '' },
}, { _id: false });

// ── Product-level redemption CMS ────────────────────────────────────────────
// Each product carries its own complete "How to Redeem" content so redemption
// instructions are data-driven and product-specific — no hard-coded per-exam
// logic in the frontend. See web/lib/redemption-guides.ts for the render-time
// fallback chain (structured guide → legacy redemptionSteps → provider family).

const redemptionScreenshotSchema = new mongoose.Schema({
  url: { type: String, trim: true, default: '' },
  publicId: { type: String, trim: true, default: '' },
  alt: { type: String, trim: true, default: '' },
  caption: { type: String, trim: true, default: '' },
  width: { type: Number },
  height: { type: Number },
}, { _id: false });

const redemptionStepSchema = new mongoose.Schema({
  // `order` is derived from array position on save (see normalizeProductPayload);
  // stored so the public API doesn't have to infer it.
  order: { type: Number, default: 0 },
  title: { type: String, trim: true, default: '' },
  description: { type: String, trim: true, default: '' },
  screenshot: { type: redemptionScreenshotSchema, default: () => ({}) },
  importantNote: { type: String, trim: true, default: '' },
  videoUrl: { type: String, trim: true, default: '' },
}); // keep _id — the admin editor uses it as a stable React key

const redemptionGuideSchema = new mongoose.Schema({
  enabled: { type: Boolean, default: false },
  providerLabel: { type: String, trim: true, default: '' },
  officialUrl: { type: String, trim: true, default: '' },
  buttonText: { type: String, trim: true, default: '' },
  introduction: { type: String, trim: true, default: '' },
  steps: { type: [redemptionStepSchema], default: [] },
  warnings: [{ type: String, trim: true }],
  lastUpdated: { type: Date },
}, { _id: false });

const productContentSchema = new mongoose.Schema({
  enabled: { type: Boolean, default: false },
  heading: { type: String, trim: true, default: '' },
  content: { type: String, default: '' }, // sanitized HTML (see backend/utils/richText.js)
}, { _id: false });

const infoRowSchema = new mongoose.Schema({
  label: { type: String, trim: true, default: '' },
  value: { type: String, trim: true, default: '' },
}, { _id: false });

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name required'],
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
    provider: {
      type: String,
      required: [true, 'Provider required'],
      trim: true,
      default: function () {
        return this?.brand || 'Duolingo';
      },
      index: true,
    },
    providerShortName: {
      type: String,
      trim: true,
      default: '',
    },
    brand: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    voucherType: {
      type: String,
      trim: true,
      uppercase: true,
      index: true,
      default: function () {
        return (this?.brand || this?.provider || 'EXAM').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      },
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
      default: 'English Language Test',
    },
    shortDescription: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    richDescription: { type: String, trim: true, default: '' },
    logo: { type: String, default: '' },
    logoPublicId: { type: String, default: '' },
    image: { type: String, default: '' },
    imagePublicId: { type: String, default: '' },
    imageSeo: imageSeoSchema,
    originalPrice: {
      type: Number,
      required: true,
      min: [0, 'Original price must be >= 0'],
    },
    sellingPrice: {
      type: Number,
      required: true,
      min: [0, 'Selling price must be >= 0'],
    },
    discountEnabled: { type: Boolean, default: true },
    discountPercent: {
      type: Number,
      min: [0, 'Discount % must be >= 0'],
      max: [100, 'Discount % must be <= 100'],
      default: 0,
    },
    currency: { type: String, default: 'INR', enum: ['INR', 'USD'] },
    validityDays: { type: Number, default: 180 },
    validityMonths: { type: Number, default: 6 },

    // Duration-based pricing variants (e.g. APS Test: 1 Week / 1 Month / 3 Months).
    // Each option overrides the base sellingPrice/originalPrice/validity for a
    // purchase made with that duration selected. `sellingPrice`/`originalPrice`
    // on the product remain the default (back-compat) when no option is chosen
    // or no enabled options exist.
    durationOptions: {
      type: [
        {
          key: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            enum: ['1-week', '1-month', '3-months'],
          },
          label: { type: String, required: true, trim: true },
          sellingPrice: {
            type: Number,
            required: true,
            min: [0, 'Selling price must be >= 0'],
          },
          originalPrice: {
            type: Number,
            required: true,
            min: [0, 'Original price must be >= 0'],
          },
          validityDays: { type: Number, min: 1, default: 7 },
          enabled: { type: Boolean, default: true },
        },
      ],
      default: undefined,
    },

    badge: { type: String, default: '' },
    badgeEnabled: { type: Boolean, default: true },
    badgeType: { type: String, default: 'popular' },
    rating: { type: Number, min: 0, max: 5, default: 5 },
    reviewsCount: { type: Number, default: 0 },
    featured: { type: Boolean, default: false, index: true },
    displayOrder: { type: Number, default: 0, index: true },
    lowStockThreshold: { type: Number, default: 10 },
    inStock: { type: Boolean, default: true, index: true },
    active: { type: Boolean, default: true, index: true },
    archived: { type: Boolean, default: false, index: true },
    comingSoon: { type: Boolean, default: false },
    stockType: { type: String, enum: ['LIMITED', 'UNLIMITED'], default: 'LIMITED' },
    deliveryType: { type: String, trim: true, default: 'Instant Delivery' },
    badges: [{ type: String, trim: true }],
    officialWebsiteUrl: { type: String, trim: true, default: '' },
    officialProductUrl: { type: String, trim: true, default: '' },
    sku: { type: String, trim: true, default: '' },
    productCode: { type: String, trim: true, default: '' },
    cta: { type: String, default: 'Buy Now' },
    seoTitle: { type: String, trim: true, default: '' },
    seoDescription: { type: String, trim: true, default: '' },
    seo: seoSchema,
    inclusions: [{ type: String }],
    redemptionSteps: [{ type: String }], // legacy free-text steps — fallback only
    faqs: [
      {
        question: { type: String, trim: true },
        answer: { type: String, trim: true },
      },
    ],
    // Product-specific redemption CMS (data-driven "How to Redeem").
    redemptionGuide: { type: redemptionGuideSchema, default: () => ({}) },
    // Product-specific long-form "About This Product" rich content.
    productContent: { type: productContentSchema, default: () => ({}) },
    // "Important Information" label/value rows shown on the product page.
    importantInfo: { type: [infoRowSchema], default: [] },
    // "Important:" warning callouts.
    importantNotes: [{ type: String, trim: true }],
    // "Explore More" — admin-curated related products (ordered). Falls back to
    // the automatic related-product algorithm when empty (productController).
    relatedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
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

productSchema.pre('save', function (next) {
  if (!this.provider) {
    this.provider = this.brand || 'Duolingo';
  }
  if (!this.voucherType) {
    this.voucherType = (this.brand || this.provider || 'EXAM').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  }
  if (!this.slug && this.name) {
    this.slug = slugify(this.name);
  }
  if (!this.seo) {
    this.seo = {};
  }
  if (!this.seo.slug && this.slug) {
    this.seo.slug = this.slug;
  }
  if (!this.imageSeo) {
    this.imageSeo = { altText: '', imageTitle: '', caption: '' };
  }
  if (this.originalPrice > 0 && this.sellingPrice >= 0) {
    const disc = Math.round(((this.originalPrice - this.sellingPrice) / this.originalPrice) * 100);
    this.discountPercent = Math.max(0, Math.min(100, disc));
  }
  next();
});

productSchema.index({ active: 1, archived: 1 });
productSchema.index({ category: 1, active: 1 });
productSchema.index({ brand: 1, active: 1 });
productSchema.index({ provider: 1, active: 1 });
productSchema.index({ 'seo.noindex': 1, active: 1 });

export const Product = mongoose.model('Product', productSchema);
