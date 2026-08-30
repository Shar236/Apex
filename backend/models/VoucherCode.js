import mongoose from 'mongoose';

export const VOUCHER_STATUSES = [
  'AVAILABLE',
  'RESERVED',
  'SOLD',
  'ASSIGNED',
  'USED',
  'EXPIRED',
  'CANCELLED',
  'INVALID',
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
    voucherType: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
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
    soldAt: { type: Date, default: null },
    soldTo: { type: String, default: null },
    assignedAt: { type: Date, default: null },
    reservedAt: { type: Date, default: null },
    reservedForOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
      index: true,
    },
    expiryDate: { type: Date, required: true, index: true },
    usedAt: { type: Date, default: null },
    transferredTo: { type: String, default: null },
    transferredAt: { type: Date, default: null },
  },
  { timestamps: true }
);

voucherCodeSchema.index({ productId: 1, voucherType: 1, status: 1 });
voucherCodeSchema.index({ status: 1, expiryDate: 1 });
voucherCodeSchema.index({ userId: 1, status: 1 });

export const VoucherCode = mongoose.model('VoucherCode', voucherCodeSchema);
