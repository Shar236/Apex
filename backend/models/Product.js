import mongoose from 'mongoose';

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
        return this.brand || 'Duolingo';
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
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
      default: 'English Language Test',
    },
    shortDescription: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    logo: { type: String, default: '' },
    image: { type: String, default: '' },
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
    cta: { type: String, default: 'Buy Now' },
    seoTitle: { type: String, trim: true, default: '' },
    seoDescription: { type: String, trim: true, default: '' },
    inclusions: [{ type: String }],
    redemptionSteps: [{ type: String }],
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
  if (!this.slug && this.name) {
    this.slug = slugify(this.name);
  }
  if (this.originalPrice > 0 && this.sellingPrice >= 0) {
    const disc = Math.round(((this.originalPrice - this.sellingPrice) / this.originalPrice) * 100);
    this.discountPercent = Math.max(0, Math.min(100, disc));
  }
  next();
});

productSchema.index({ category: 1, active: 1 });
productSchema.index({ brand: 1, active: 1 });
productSchema.index({ provider: 1, active: 1 });

export const Product = mongoose.model('Product', productSchema);
