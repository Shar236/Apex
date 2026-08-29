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
export const FULFILLMENT_STATUSES = [
  'PENDING',
  'FULFILLED',
  'FAILED',
  'MISMATCH_BLOCKED',
  'NEEDS_RESTOCK',
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
        voucherType: { type: String, uppercase: true, trim: true, default: 'EXAM', index: true },
        brand: { type: String, default: '' },
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
    fulfillmentStatus: {
      type: String,
      enum: FULFILLMENT_STATUSES,
      default: 'PENDING',
      index: true,
    },
    fulfillmentError: { type: String, default: null },
    allocatedVouchers: [
      {
        voucherId: { type: mongoose.Schema.Types.ObjectId, ref: 'VoucherCode' },
        code: { type: String, uppercase: true, trim: true },
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        voucherType: { type: String, uppercase: true, trim: true },
        allocatedAt: { type: Date, default: Date.now },
      },
    ],
    paymentProvider: { type: String, default: null },
    paymentReference: { type: String, default: null, index: true },
    // Razorpay binding — the gateway order id we created for this internal order.
    razorpayOrderId: { type: String, default: null, index: true },
    // The captured Razorpay payment id (set only after verified capture).
    razorpayPaymentId: { type: String, default: null, index: true },
    // Razorpay webhook event ids already applied to this order (idempotency).
    processedEventIds: { type: [String], default: [] },
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
    cashfreeOrderId: { type: String, default: null, index: true },
    paymentSessionId: { type: String, default: null },
    paymentMethod: { type: String, default: null },
    transactionId: { type: String, default: null },
    webhookStatus: { type: String, default: null },
    paidAt: { type: Date, default: null },
    emailStatus: {
      type: String,
      enum: ['PENDING', 'SENDING', 'SENT', 'FAILED'],
      default: 'PENDING',
      index: true,
    },
    emailSentAt: { type: Date, default: null },
    emailError: { type: String, default: null },
    // Set once, when the "voucher sold" admin notification has been dispatched.
    // Independent of customer email so email retries never re-notify the sale.
    adminNotifiedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1, createdAt: -1 });
orderSchema.index({ fulfillmentStatus: 1, createdAt: -1 });

export const Order = mongoose.model('Order', orderSchema);
