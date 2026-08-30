import mongoose from 'mongoose';

export const DISCOUNT_TYPES = ['percentage', 'fixed'];

const promotionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: {
      type: String,
      required: true,
      unique: true,
      index: true,
      uppercase: true,
      trim: true,
    },
    description: { type: String, default: '' },
    discountType: {
      type: String,
      enum: DISCOUNT_TYPES,
      required: true,
      default: 'percentage',
    },
    discountValue: {
      type: Number,
      required: true,
      min: [0, 'Discount value required'],
    },
    minimumOrderAmount: { type: Number, default: 0, min: 0 },
    maximumDiscount: { type: Number, default: null },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    active: { type: Boolean, default: true, index: true },
    usageLimit: { type: Number, default: null },
    perUserLimit: { type: Number, default: null },
    firstOrderOnly: { type: Boolean, default: false },
    usageCount: { type: Number, default: 0, min: 0 },
    applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    applicableCategories: [{ type: String }],
    usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

promotionSchema.index({ active: 1, code: 1 });

export const Promotion = mongoose.model('Promotion', promotionSchema);
