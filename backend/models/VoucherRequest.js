import mongoose from 'mongoose';

/**
 * A customer request for a voucher that currently has ZERO available voucher
 * codes in inventory. Instead of showing "Out of Stock", the storefront offers
 * "Request Voucher" — the customer submits a request here, the admin sources a
 * code, the customer pays through the normal Razorpay flow, and the voucher is
 * delivered into their account by the existing fulfilment pipeline.
 *
 * Lifecycle:
 *   PENDING          — submitted by the customer, awaiting admin review
 *   PROCESSING       — admin is sourcing the voucher code
 *   AWAITING_PAYMENT — a code is in inventory; the customer can now pay
 *   FULFILLED        — payment captured + voucher allocated (set by the payment
 *                      fulfilment hook, never manually)
 *   CANCELLED        — closed by the admin (or customer) without fulfilment
 */
export const VOUCHER_REQUEST_STATUSES = [
  'PENDING',
  'PROCESSING',
  'AWAITING_PAYMENT',
  'FULFILLED',
  'CANCELLED',
];

// Statuses that count as an "open" request for duplicate-prevention (§10).
export const OPEN_VOUCHER_REQUEST_STATUSES = ['PENDING', 'PROCESSING', 'AWAITING_PAYMENT'];

const activitySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    note: { type: String, default: '', trim: true, maxlength: 2000 },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    adminEmail: { type: String, default: '', trim: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const voucherRequestSchema = new mongoose.Schema(
  {
    requestId: {
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
    // Snapshots — kept even if the user later changes their name/email.
    customerName: { type: String, required: true, trim: true, maxlength: 120 },
    customerEmail: { type: String, required: true, trim: true, lowercase: true },

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    productName: { type: String, required: true, trim: true },
    voucherType: { type: String, required: true, uppercase: true, trim: true, index: true },
    category: { type: String, default: '', trim: true },
    // Informational price at the moment of the request (final price is always
    // recomputed server-side at payment time).
    priceSnapshot: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: 'INR' },

    status: {
      type: String,
      enum: VOUCHER_REQUEST_STATUSES,
      default: 'PENDING',
      index: true,
    },
    adminNotes: { type: String, default: '', trim: true, maxlength: 2000 },
    activityHistory: [activitySchema],

    // Fulfilment linkage — populated as the request progresses.
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
      index: true,
    },
    assignedVoucherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VoucherCode',
      default: null,
    },
    paymentReference: { type: String, default: null },
    readyForPaymentAt: { type: Date, default: null },
    fulfilledAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
  },
  { timestamps: true }
);

voucherRequestSchema.index({ createdAt: -1 });
voucherRequestSchema.index({ status: 1, createdAt: -1 });
voucherRequestSchema.index({ userId: 1, productId: 1, status: 1 });

export const VoucherRequest = mongoose.model('VoucherRequest', voucherRequestSchema);
