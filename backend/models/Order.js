import mongoose from 'mongoose';

export const PAYMENT_STATUSES = ['PENDING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED'];
export const ORDER_STATUSES = [
  'PENDING',
  'PAYMENT_PENDING',
  'PAID',
  'PROCESSING',
  'PAYMENT_RECEIVED_NEEDS_ALLOCATION',
  'FULFILLED',
  'CANCELLED',
  'REFUNDED',
  'FAILED',
];

const orderSchema = new mongoose.Schema(
  {
    orderNo: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        productName: { type: String, required: true },
        unitPrice: { type: Number, required: true },
        originalPrice: { type: Number, required: true },
        quantity: { type: Number, min: 1, default: 1, required: true },
      },
    ],
    subtotal: { type: Number, required: true, min: 0 },
    discountAmount: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    promotionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Promotion',
      default: null,
    },
    promoCode: { type: String, default: null },
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: 'PENDING',
      index: true,
    },
    orderStatus: {
      type: String,
      enum: ORDER_STATUSES,
      default: 'PENDING',
      index: true,
    },
    paymentProvider: { type: String, default: null },
    paymentReference: { type: String, default: null, index: true },
    billingDetails: {
      name: String,
      email: String,
      phone: String,
      address: String,
      gstin: String,
    },
    customerSnapshot: {
      email: String,
      phone: String,
      name: String,
    },
    paymentNotes: { type: String, default: null },
  },
  { timestamps: true }
);

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1, createdAt: -1 });

export const Order = mongoose.model('Order', orderSchema);
