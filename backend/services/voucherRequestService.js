import {
  VoucherRequest,
  VOUCHER_REQUEST_STATUSES,
  OPEN_VOUCHER_REQUEST_STATUSES,
  Product,
  VoucherCode,
} from '../models/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { generateVoucherRequestId, escapeRegex } from '../utils/index.js';
import { normalizeVoucherType } from './voucherAllocation.js';
import {
  sendVoucherRequestConfirmationToCustomer,
  sendVoucherRequestAdminNotification,
  sendVoucherRequestReadyForPaymentToCustomer,
  sendVoucherRequestFulfilledToCustomer,
  sendVoucherRequestCancelledToCustomer,
} from './email.js';

const logEmailFailure = (label) => (err) =>
  console.error(`[voucher-request:email] ${label} failed: ${err?.message || err}`);

/**
 * Count voucher codes that could satisfy a normal instant purchase for a
 * product RIGHT NOW. This is the single source of truth for "is this voucher
 * available?" — the same predicate the allocation service and the
 * createPaymentOrder stock check use.
 */
export const countAvailableVoucherCodes = (productId, voucherType) =>
  VoucherCode.countDocuments({
    productId,
    voucherType,
    status: 'AVAILABLE',
    expiryDate: { $gt: new Date() },
  });

/** The customer's most recent OPEN request for a given product, if any. */
export const findOpenRequestForProduct = (userId, productId) =>
  VoucherRequest.findOne({
    userId,
    productId,
    status: { $in: OPEN_VOUCHER_REQUEST_STATUSES },
  }).sort({ createdAt: -1 });

/**
 * Create a voucher request for an out-of-stock product.
 * Returns { request, duplicate, existing } — `duplicate` true when the customer
 * already has an open request for this product (§10).
 * Throws AppError('STOCK_AVAILABLE') when inventory exists — the customer should
 * just buy it normally (§10 race condition).
 */
export const createVoucherRequest = async (rawPayload, user) => {
  if (!user?._id) {
    throw new AppError('You must be logged in to request a voucher', 401, 'AUTH_REQUIRED');
  }

  const productId = String(rawPayload?.productId || '').trim();
  if (!productId) {
    throw new AppError('A product is required', 400, 'VALIDATION_ERROR');
  }

  const product = await Product.findById(productId).lean();
  if (!product || product.active === false || product.archived) {
    throw new AppError('Product not found or unavailable', 404, 'PRODUCT_NOT_FOUND');
  }
  if (product.comingSoon) {
    throw new AppError('This voucher is coming soon and cannot be requested yet', 400, 'PRODUCT_COMING_SOON');
  }
  if (product.stockType === 'UNLIMITED') {
    throw new AppError('This voucher is available to buy now', 409, 'STOCK_AVAILABLE');
  }

  const voucherType = normalizeVoucherType(product.voucherType, product);

  // Race guard — inventory may have been added since the page loaded.
  const available = await countAvailableVoucherCodes(product._id, voucherType);
  if (available > 0) {
    throw new AppError('This voucher is back in stock — you can buy it now', 409, 'STOCK_AVAILABLE');
  }

  // Duplicate guard — one open request per customer per product.
  const existing = await findOpenRequestForProduct(user._id, product._id);
  if (existing) {
    return { request: existing, duplicate: true, existing };
  }

  const request = await VoucherRequest.create({
    requestId: generateVoucherRequestId(),
    userId: user._id,
    customerName: user.name || rawPayload?.customerName || 'Customer',
    customerEmail: (user.email || rawPayload?.customerEmail || '').toLowerCase(),
    productId: product._id,
    productName: product.name,
    voucherType,
    category: product.category || '',
    priceSnapshot: Number(product.sellingPrice) || 0,
    currency: product.currency || 'INR',
    status: 'PENDING',
    activityHistory: [
      { status: 'PENDING', note: 'Request submitted by customer', timestamp: new Date() },
    ],
  });

  sendVoucherRequestConfirmationToCustomer(request).catch(logEmailFailure('customer confirmation'));
  sendVoucherRequestAdminNotification(request).catch(logEmailFailure('admin notification'));

  return { request, duplicate: false };
};

/** Admin list with filters + pagination (mirrors pteBookingService.listBookingRequests). */
export const listVoucherRequests = async (query = {}) => {
  const { status, search, dateRange, dateFrom, dateTo, page = 1, limit = 50 } = query;
  const filter = {};
  if (status && status !== 'All') filter.status = status;
  if (search) {
    const s = new RegExp(escapeRegex(search), 'i');
    filter.$or = [
      { requestId: s },
      { customerName: s },
      { customerEmail: s },
      { productName: s },
      { voucherType: s },
    ];
  }

  if (dateRange) {
    const now = new Date();
    if (dateRange === 'today') {
      filter.createdAt = { $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) };
    } else if (dateRange === '7d') {
      filter.createdAt = { $gte: new Date(now.getTime() - 7 * 864e5) };
    } else if (dateRange === '30d') {
      filter.createdAt = { $gte: new Date(now.getTime() - 30 * 864e5) };
    }
  } else if (dateFrom || dateTo) {
    filter.createdAt = {};
    if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
    if (dateTo) filter.createdAt.$lte = new Date(dateTo);
  }

  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(200, Math.max(1, parseInt(limit, 10) || 50));
  const skip = (p - 1) * l;

  const [rows, total] = await Promise.all([
    VoucherRequest.find(filter)
      .populate('productId', 'name slug brand voucherType sellingPrice originalPrice image')
      .populate('assignedVoucherId', 'code expiryDate status')
      .populate('orderId', 'orderNo total paymentStatus orderStatus')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(l)
      .lean(),
    VoucherRequest.countDocuments(filter),
  ]);

  return { rows, total, page: p, pages: Math.ceil(total / l) };
};

export const getVoucherRequestById = (id) =>
  VoucherRequest.findById(id)
    .populate('productId', 'name slug brand voucherType sellingPrice originalPrice image category')
    .populate('assignedVoucherId', 'code expiryDate status')
    .populate('orderId', 'orderNo total paymentStatus orderStatus razorpayPaymentId');

export const getVoucherRequestStats = async () => {
  const byStatus = await VoucherRequest.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const stats = { total: 0, pending: 0, processing: 0, awaitingPayment: 0, fulfilled: 0, cancelled: 0 };
  for (const item of byStatus) {
    const key = String(item._id || '').toUpperCase();
    stats.total += item.count;
    if (key === 'PENDING') stats.pending = item.count;
    else if (key === 'PROCESSING') stats.processing = item.count;
    else if (key === 'AWAITING_PAYMENT') stats.awaitingPayment = item.count;
    else if (key === 'FULFILLED') stats.fulfilled = item.count;
    else if (key === 'CANCELLED') stats.cancelled = item.count;
  }
  return stats;
};

export const listMyVoucherRequests = async (userId) => {
  const rows = await VoucherRequest.find({ userId })
    .populate('productId', 'name slug brand voucherType sellingPrice originalPrice image officialWebsiteUrl redemptionSteps')
    .populate('assignedVoucherId', 'code expiryDate status')
    .sort({ createdAt: -1 })
    .lean();

  return rows.map((r) => {
    const product = r.productId || {};
    const voucher = r.assignedVoucherId || null;
    return {
      id: r._id,
      requestId: r.requestId,
      status: r.status,
      productId: product._id || r.productId,
      productName: r.productName || product.name || '',
      productSlug: product.slug || '',
      voucherType: r.voucherType || product.voucherType || '',
      category: r.category || product.category || '',
      priceSnapshot: r.priceSnapshot || product.sellingPrice || 0,
      sellingPrice: product.sellingPrice ?? r.priceSnapshot ?? 0,
      originalPrice: product.originalPrice ?? null,
      currency: r.currency || 'INR',
      adminNotes: r.adminNotes || '',
      createdAt: r.createdAt,
      readyForPaymentAt: r.readyForPaymentAt || null,
      fulfilledAt: r.fulfilledAt || null,
      cancelledAt: r.cancelledAt || null,
      officialWebsiteUrl: product.officialWebsiteUrl || '',
      // Only ever the customer's own voucher — safe to expose in full.
      voucher: voucher
        ? { id: voucher._id, code: voucher.code, expiryDate: voucher.expiryDate, status: voucher.status }
        : null,
      orderId: r.orderId || null,
    };
  });
};

const VALID_ADMIN_TRANSITIONS = ['PENDING', 'PROCESSING', 'AWAITING_PAYMENT', 'CANCELLED'];

/**
 * Admin status / notes update. FULFILLED is never set here — it is driven only
 * by the payment fulfilment hook (markVoucherRequestFulfilled).
 */
export const updateVoucherRequest = async (id, { status, adminNotes, adminUser }) => {
  const request = await VoucherRequest.findById(id);
  if (!request) throw new AppError('Voucher request not found', 404, 'NOT_FOUND');

  const oldStatus = request.status;

  if (status !== undefined && status !== null && status !== '') {
    if (!VOUCHER_REQUEST_STATUSES.includes(status)) {
      throw new AppError('Invalid status value', 400, 'VALIDATION_ERROR');
    }
    if (!VALID_ADMIN_TRANSITIONS.includes(status)) {
      throw new AppError(
        `${status} cannot be set manually — it is applied automatically after payment`,
        400,
        'INVALID_TRANSITION'
      );
    }
    if (request.status === 'FULFILLED') {
      throw new AppError('This request is already fulfilled', 400, 'ALREADY_FULFILLED');
    }

    if (status === 'AWAITING_PAYMENT') {
      // Must have real inventory before the customer is asked to pay.
      const available = await countAvailableVoucherCodes(request.productId, request.voucherType);
      if (available < 1) {
        throw new AppError(
          'Add at least one available voucher code for this product before marking the request ready for payment',
          400,
          'NO_INVENTORY'
        );
      }
      request.readyForPaymentAt = request.readyForPaymentAt || new Date();
    }

    if (status === 'CANCELLED') {
      request.cancelledAt = new Date();
    }

    request.status = status;
  }

  if (adminNotes !== undefined) {
    request.adminNotes = adminNotes;
  }

  const statusChanged = status && status !== oldStatus;
  if (statusChanged || adminNotes !== undefined) {
    request.activityHistory = request.activityHistory || [];
    request.activityHistory.push({
      status: request.status,
      note:
        adminNotes ||
        (statusChanged ? `Status changed from ${oldStatus} to ${request.status}` : 'Notes updated'),
      adminId: adminUser?._id || null,
      adminEmail: adminUser?.email || '',
      timestamp: new Date(),
    });
  }

  await request.save();

  if (statusChanged && request.status === 'AWAITING_PAYMENT') {
    sendVoucherRequestReadyForPaymentToCustomer(request).catch(logEmailFailure('ready-for-payment'));
  }
  if (statusChanged && request.status === 'CANCELLED') {
    sendVoucherRequestCancelledToCustomer(request, adminNotes || '').catch(logEmailFailure('cancelled'));
  }

  return { request, oldStatus };
};

/**
 * Called by the payment fulfilment gate (fulfillVerifiedOrder) once a
 * request-sourced order has been paid and a voucher allocated. Atomic + safe to
 * call more than once.
 */
export const markVoucherRequestFulfilled = async ({ order, voucher, user }) => {
  if (!order?.voucherRequestId) return null;

  const request = await VoucherRequest.findOneAndUpdate(
    { _id: order.voucherRequestId, status: { $ne: 'FULFILLED' } },
    {
      $set: {
        status: 'FULFILLED',
        orderId: order._id,
        assignedVoucherId: voucher?._id || voucher?.voucherId || null,
        paymentReference: order.razorpayPaymentId || order.paymentReference || null,
        fulfilledAt: new Date(),
      },
      $push: {
        activityHistory: {
          status: 'FULFILLED',
          note: `Payment captured (order ${order.orderNo}) — voucher delivered to customer`,
          adminEmail: user?.email || 'system@apexvouchers.in',
          timestamp: new Date(),
        },
      },
    },
    { new: true }
  );

  if (!request) return null; // already fulfilled — nothing to do

  sendVoucherRequestFulfilledToCustomer(request, voucher || null).catch(
    logEmailFailure('fulfilled')
  );

  return request;
};
