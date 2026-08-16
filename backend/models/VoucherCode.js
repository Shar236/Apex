import mongoose from 'mongoose';

export const VOUCHER_STATUSES = [
  'AVAILABLE',
  'RESERVED',
  'SOLD',
  'ASSIGNED',
  'USED',
  'EXPIRED',
  'CANCELLED',
];

const voucherCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      index: true,
      uppercase: true,
      trim: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: VOUCHER_STATUSES,
      default: 'AVAILABLE',
      index: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      index: true,
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      default: null,
    },
    assignedAt: { type: Date, default: null },
    expiryDate: { type: Date, required: true },
    usedAt: { type: Date, default: null },
    transferredTo: { type: String, default: null },
    transferredAt: { type: Date, default: null },
  },
  { timestamps: true }
);

voucherCodeSchema.index({ status: 1, productId: 1 });
voucherCodeSchema.index({ userId: 1, status: 1 });

export const VoucherCode = mongoose.model('VoucherCode', voucherCodeSchema);
