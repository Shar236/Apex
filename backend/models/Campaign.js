import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Campaign name is required'],
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['DRAFT', 'SCHEDULED', 'ACTIVE', 'PAUSED', 'EXPIRED'],
      default: 'DRAFT',
      index: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Campaign start date is required'],
      index: true,
    },
    endDate: {
      type: Date,
      required: [true, 'Campaign end date is required'],
      index: true,
    },
    priority: {
      type: Number,
      default: 1,
      index: true,
    },
    badgeText: {
      type: String,
      default: '🇮🇳 Special Offer',
      trim: true,
    },
    title: {
      type: String,
      default: '50% OFF EXAM VOUCHERS',
      trim: true,
    },
    subtitle: {
      type: String,
      default: 'Celebrate & Save Big on Your Exam Fees',
      trim: true,
    },
    description: {
      type: String,
      default: 'Get official exam vouchers at maximum discount during our special sale.',
      trim: true,
    },
    discountType: {
      type: String,
      enum: ['PERCENTAGE', 'FIXED'],
      default: 'PERCENTAGE',
    },
    discountValue: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: [0, 'Discount value cannot be negative'],
    },
    maxDiscount: {
      type: Number,
      default: 0, // 0 = unlimited
    },
    minOrderAmount: {
      type: Number,
      default: 0,
    },
    applicableProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ], // Empty array means ALL products
    ctaText: {
      type: String,
      default: 'Shop Special Offer',
      trim: true,
    },
    ctaLink: {
      type: String,
      default: '/#vouchers',
      trim: true,
    },
    showCountdown: {
      type: Boolean,
      default: true,
    },
    theme: {
      primaryColor: { type: String, default: '#FF005C' },
      badgeBg: { type: String, default: '#2A0A17' },
      bannerBg: { type: String, default: '#FFF0F5' },
    },
    image: {
      type: String,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
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

campaignSchema.pre('save', function (next) {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name);
  }
  next();
});

campaignSchema.index({ status: 1, startDate: 1, endDate: 1, priority: -1 });

export const Campaign = mongoose.model('Campaign', campaignSchema);
