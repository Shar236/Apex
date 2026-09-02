import { FulfillmentRequest, Order, VoucherCode, Product, AuditLog } from '../models/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { generateFulfillmentRequestId, escapeRegex } from '../utils/index.js';
import { normalizeVoucherType } from './voucherAllocation.js';
import {
  sendOrderConfirmation,
  sendAdminFulfillmentRequestNotification,
  sendFulfillmentPendingConfirmation,
} from './email.js';

const log = (label, err) =>
  console.error(`[fulfillment:${label}] ${err?.message || err}`);

/** The "is this code buyable right now" predicate — same one allocation uses. */
const availableCodeFilter = () => ({ status: 'AVAILABLE', expiryDate: { $gt: new Date() } });

/**
 * Send (or re-send) the voucher-delivery email for a fulfilled request. Reused by
 * both the initial delivery and the admin "resend" action so there is exactly one
 * email code path. Never throws — returns the nodemailer-style { sent } result.
 */
const emailFulfilmentVoucher = async (request, order, voucher) => {
  const product = await Product.findById(request.productId)
    .select('redemptionSteps officialWebsiteUrl')
    .lean()
    .catch(() => null);
  const enriched = [
    {
      code: voucher.code,
      expiryDate: voucher.expiryDate,
      productName: request.productName,
      voucherType: voucher.voucherType,
      redemptionSteps: Array.isArray(product?.redemptionSteps) ? product.redemptionSteps : [],
      officialWebsiteUrl: product?.officialWebsiteUrl || '',
    },
  ];
  try {
    return await sendOrderConfirmation(
      { name: request.customerName, email: request.customerEmail },
      order,
      enriched
    );
  } catch (err) {
    log('delivery-email', err);
    return { sent: false, error: err.message };
  }
};

/**
 * Create (or return the existing) post-payment fulfillment request for a PAID
 * order that could not be auto-allocated because inventory ran out.
 *
 * Idempotent: one FulfillmentRequest per order (unique orderId index).
 */
export const createFulfillmentRequestForOrder = async ({ order, user, paymentId = null }) => {
  if (!order?._id) throw new AppError('Order is required', 400, 'ORDER_REQUIRED');

  const existing = await FulfillmentRequest.findOne({ orderId: order._id });
  if (existing) return existing;

  const item = (order.items || [])[0] || {};
  const customerName = user?.name || order.customerSnapshot?.name || order.billingDetails?.name || 'Customer';
  const customerEmail = user?.email || order.customerSnapshot?.email || order.billingDetails?.email || '';

  const request = await FulfillmentRequest.create({
    requestId: generateFulfillmentRequestId(),
    userId: order.userId,
    customerName,
    customerEmail,
    orderId: order._id,
    orderNo: order.orderNo,
    razorpayPaymentId: paymentId || order.razorpayPaymentId || null,
    razorpayOrderId: order.razorpayOrderId || null,
    productId: item.productId,
    productName: item.productName || 'Exam Voucher',
    voucherType: normalizeVoucherType(item.voucherType),
    quantity: Math.max(1, parseInt(item.quantity, 10) || 1),
    amountPaid: Number(order.total) || 0,
    currency: order.currency || 'INR',
    status: 'PROCESSING',
    activityHistory: [
      {
        status: 'PROCESSING',
        note: 'Payment captured — voucher awaiting manual fulfillment',
        timestamp: new Date(),
      },
    ],
  });

  // Notify the admin (needs to source a code) and reassure the customer (their
  // purchase succeeded and is being finalised). Both best-effort. `emailStatus`
  // on the request tracks the VOUCHER-delivery email only, so it is left PENDING
  // here — this confirmation is a separate message.
  sendAdminFulfillmentRequestNotification(request, order).catch((err) =>
    log('admin-notification', err)
  );
  sendFulfillmentPendingConfirmation(request, order).catch((err) =>
    log('pending-confirmation', err)
  );

  return request;
};

/**
 * Admin delivers a voucher code for a pending fulfillment request.
 *
 * - Validates the code is not already assigned to another customer.
 * - Atomically claims it from inventory when it exists as AVAILABLE, or records
 *   it as a delivered code when it is an external/manual code not in inventory.
 * - Marks the order FULFILLED, attaches the voucher, and emails the customer.
 * - Idempotent: delivering the same code twice returns the same result.
 */
export const deliverFulfillmentRequest = async ({ requestId, code, adminNotes, admin }) => {
  const codeClean = String(code || '').trim().toUpperCase();
  if (!codeClean) {
    throw new AppError('Voucher code is required', 400, 'CODE_REQUIRED');
  }
  if (!/^[A-Z0-9-]{4,64}$/.test(codeClean)) {
    throw new AppError('Invalid voucher code format', 400, 'CODE_FORMAT_INVALID');
  }

  const request = await FulfillmentRequest.findById(requestId);
  if (!request) throw new AppError('Fulfillment request not found', 404, 'REQUEST_NOT_FOUND');

  // Already delivered → idempotent success (same code only).
  if (request.status === 'DELIVERED') {
    if (request.voucherCode === codeClean) {
      const order = await Order.findById(request.orderId);
      return { request, order, alreadyDelivered: true };
    }
    throw new AppError('This request is already delivered', 409, 'REQUEST_ALREADY_DELIVERED');
  }
  if (request.status === 'CANCELLED' || request.status === 'FAILED') {
    throw new AppError(`This request is ${request.status.toLowerCase()} and cannot be delivered`, 409, 'REQUEST_CLOSED');
  }

  const order = await Order.findById(request.orderId);
  if (!order) throw new AppError('Linked order not found', 404, 'ORDER_NOT_FOUND');

  // ── Voucher code validation: never deliver a code that belongs to another customer.
  const existingVoucher = await VoucherCode.findOne({ code: codeClean });
  if (existingVoucher) {
    const alreadyUsed = ['SOLD', 'ASSIGNED', 'USED'].includes(existingVoucher.status);
    const belongsToOther =
      existingVoucher.userId &&
      String(existingVoucher.userId) !== String(request.userId);
    if (alreadyUsed && belongsToOther) {
      throw new AppError(
        'This voucher code is already assigned to another customer',
        409,
        'CODE_ALREADY_ASSIGNED'
      );
    }
    if (existingVoucher.status === 'CANCELLED' || existingVoucher.status === 'INVALID' || existingVoucher.status === 'EXPIRED') {
      throw new AppError('This voucher code is not usable', 409, 'CODE_NOT_USABLE');
    }
  }

  const now = new Date();
  const soldToEmail = request.customerEmail || order.customerSnapshot?.email || '';

  let voucher;
  if (existingVoucher) {
    // Atomic claim from AVAILABLE (or the same order's own SOLD record → idempotent).
    const claimed = await VoucherCode.findOneAndUpdate(
      {
        code: codeClean,
        $or: [
          { status: 'AVAILABLE' },
          { _id: existingVoucher._id, userId: request.userId, orderId: request.orderId },
        ],
      },
      {
        $set: {
          status: 'SOLD',
          userId: request.userId,
          orderId: request.orderId,
          soldAt: now,
          soldTo: soldToEmail,
          assignedAt: now,
          reservedForOrderId: request.orderId,
        },
      },
      { new: true }
    );
    if (!claimed) {
      throw new AppError(
        'This voucher code could not be claimed — it may have just been assigned to another customer',
        409,
        'CODE_CLAIM_RACE'
      );
    }
    voucher = claimed;
  } else {
    // External/manual code — record it as a delivered voucher for this order.
    const product = await Product.findById(request.productId).lean();
    const validityDays = Number(product?.validityDays) || Number(product?.validityMonths || 6) * 30 || 180;
    try {
      voucher = await VoucherCode.create({
        code: codeClean,
        productId: request.productId,
        voucherType: normalizeVoucherType(request.voucherType, product),
        status: 'SOLD',
        userId: request.userId,
        orderId: request.orderId,
        soldAt: now,
        soldTo: soldToEmail,
        assignedAt: now,
        expiryDate: new Date(now.getTime() + validityDays * 24 * 60 * 60 * 1000),
      });
    } catch (err) {
      if (err?.code === 11000) {
        // Concurrent create for the same code — another request won the race.
        throw new AppError(
          'This voucher code was just assigned to another customer',
          409,
          'CODE_ALREADY_ASSIGNED'
        );
      }
      throw err;
    }
  }

  // ── Update the order to FULFILLED with the delivered voucher attached.
  order.paymentStatus = 'PAID';
  order.orderStatus = 'FULFILLED';
  order.fulfillmentStatus = 'FULFILLED';
  order.fulfillmentError = null;
  order.allocatedVouchers = order.allocatedVouchers || [];
  if (!order.allocatedVouchers.some((av) => av.voucherId?.toString() === voucher._id.toString())) {
    order.allocatedVouchers.push({
      voucherId: voucher._id,
      code: voucher.code,
      productId: request.productId,
      voucherType: voucher.voucherType,
      allocatedAt: now,
    });
  }
  await order.save();

  // ── Mark the request delivered.
  const noteClean = String(adminNotes || '').trim().slice(0, 2000);
  request.status = 'DELIVERED';
  request.voucherCode = voucher.code;
  request.voucherId = voucher._id;
  request.deliveredAt = now;
  request.emailStatus = 'PENDING';
  if (noteClean) request.adminNotes = noteClean;
  request.activityHistory.push({
    status: 'DELIVERED',
    note: `Voucher delivered by ${admin?.email || 'admin'}${noteClean ? ` — note: ${noteClean}` : ''}`,
    adminId: admin?._id || null,
    adminEmail: admin?.email || '',
    timestamp: now,
  });
  await request.save();

  // ── Email the customer (best-effort, never fails the delivery).
  const mailRes = await emailFulfilmentVoucher(request, order, voucher);
  request.emailStatus = mailRes?.sent === false ? 'FAILED' : 'SENT';
  request.emailError = mailRes?.sent === false ? mailRes.error || 'Email send failed' : null;
  await request.save().catch(() => {});

  await AuditLog.create({
    adminEmail: admin?.email || 'admin@apexvouchers.in',
    action: 'FULFILLMENT_DELIVERED',
    resourceType: 'FulfillmentRequest',
    resourceId: request._id.toString(),
    details: {
      requestId: request.requestId,
      orderNo: order.orderNo,
      productName: request.productName,
      voucherId: voucher._id.toString(),
    },
  }).catch(() => {});

  return { request, order, alreadyDelivered: false, voucher };
};

/**
 * Re-send the voucher-delivery email for an ALREADY-DELIVERED request (e.g. the
 * first send bounced). Never allocates a second voucher and never moves the
 * request out of DELIVERED — it only re-sends the existing code and updates
 * emailStatus.
 */
export const resendFulfillmentVoucherEmail = async ({ requestId, admin }) => {
  const request = await FulfillmentRequest.findById(requestId);
  if (!request) throw new AppError('Fulfillment request not found', 404, 'REQUEST_NOT_FOUND');
  if (request.status !== 'DELIVERED') {
    throw new AppError('Only a delivered request can have its voucher email re-sent', 409, 'REQUEST_NOT_DELIVERED');
  }

  const [order, voucher] = await Promise.all([
    Order.findById(request.orderId),
    request.voucherId
      ? VoucherCode.findById(request.voucherId).lean()
      : VoucherCode.findOne({ code: request.voucherCode, userId: request.userId }).lean(),
  ]);
  if (!order) throw new AppError('Linked order not found', 404, 'ORDER_NOT_FOUND');
  if (!voucher) throw new AppError('Delivered voucher record not found', 404, 'VOUCHER_NOT_FOUND');

  const mailRes = await emailFulfilmentVoucher(request, order, voucher);
  const sent = mailRes?.sent !== false;
  request.emailStatus = sent ? 'SENT' : 'FAILED';
  request.emailError = sent ? null : mailRes.error || 'Email send failed';
  request.activityHistory.push({
    status: 'DELIVERED',
    note: `Voucher email re-sent by ${admin?.email || 'admin'} — ${sent ? 'accepted' : `failed: ${request.emailError}`}`,
    adminId: admin?._id || null,
    adminEmail: admin?.email || '',
    timestamp: new Date(),
  });
  await request.save();

  await AuditLog.create({
    adminEmail: admin?.email || 'admin@apexvouchers.in',
    action: 'FULFILLMENT_EMAIL_RESENT',
    resourceType: 'FulfillmentRequest',
    resourceId: request._id.toString(),
    details: { requestId: request.requestId, orderNo: order.orderNo, sent, error: request.emailError || undefined },
  }).catch(() => {});

  return { request, sent, error: request.emailError };
};

/** Admin edits the internal note on a request without changing its status. */
export const updateFulfillmentNotes = async ({ requestId, adminNotes, admin }) => {
  const request = await FulfillmentRequest.findById(requestId);
  if (!request) throw new AppError('Fulfillment request not found', 404, 'REQUEST_NOT_FOUND');
  request.adminNotes = String(adminNotes || '').trim().slice(0, 2000);
  request.activityHistory.push({
    status: request.status,
    note: `Note updated by ${admin?.email || 'admin'}`,
    adminId: admin?._id || null,
    adminEmail: admin?.email || '',
    timestamp: new Date(),
  });
  await request.save();
  return { request };
};

/** Admin cancels a pending fulfillment request (e.g. refund issued). */
export const cancelFulfillmentRequest = async ({ requestId, reason = '', admin }) => {
  const request = await FulfillmentRequest.findById(requestId);
  if (!request) throw new AppError('Fulfillment request not found', 404, 'REQUEST_NOT_FOUND');
  if (request.status === 'DELIVERED') {
    throw new AppError('A delivered request cannot be cancelled', 409, 'REQUEST_DELIVERED');
  }

  request.status = 'CANCELLED';
  request.cancelledAt = new Date();
  request.cancelledReason = String(reason || '').slice(0, 2000);
  request.activityHistory.push({
    status: 'CANCELLED',
    note: `Cancelled by ${admin?.email || 'admin'}${reason ? ` — ${reason}` : ''}`,
    adminId: admin?._id || null,
    adminEmail: admin?.email || '',
    timestamp: new Date(),
  });
  await request.save();

  return { request };
};

/** Admin list with filters + stats (mirrors voucher-requests admin). */
export const listFulfillmentRequests = async (query = {}) => {
  const { status, search, page = 1, limit = 50 } = query;
  const filter = {};
  if (status && status !== 'All') filter.status = status;
  if (search) {
    const s = new RegExp(escapeRegex(search), 'i');
    filter.$or = [
      { requestId: s },
      { orderNo: s },
      { customerName: s },
      { customerEmail: s },
      { productName: s },
      { voucherType: s },
      { voucherCode: s },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10) || 50));

  const [total, rows, statsRows] = await Promise.all([
    FulfillmentRequest.countDocuments(filter),
    FulfillmentRequest.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean(),
    FulfillmentRequest.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
  ]);

  // One aggregate for the whole page — current buyable stock per product, so the
  // admin can see at a glance whether a code can be pulled from inventory.
  const productIds = [...new Set(rows.map((r) => r.productId).filter(Boolean).map(String))];
  let stockByProduct = new Map();
  if (productIds.length) {
    const grouped = await VoucherCode.aggregate([
      { $match: { productId: { $in: rows.map((r) => r.productId).filter(Boolean) }, ...availableCodeFilter() } },
      { $group: { _id: '$productId', available: { $sum: 1 } } },
    ]);
    stockByProduct = new Map(grouped.map((g) => [String(g._id), g.available]));
  }
  for (const r of rows) r.availableStock = stockByProduct.get(String(r.productId)) || 0;

  const stats = {
    total,
    processing: 0,
    delivered: 0,
    cancelled: 0,
    failed: 0,
  };
  for (const r of statsRows) {
    stats[(r._id || 'processing').toLowerCase()] = r.count;
  }

  return { total, page: pageNum, rows, stats };
};
