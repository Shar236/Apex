import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { VoucherCode } from '../models/VoucherCode.js';
import { Promotion } from '../models/Promotion.js';
import { Campaign } from '../models/Campaign.js';
import { AuditLog } from '../models/AuditLog.js';
import { AppError } from '../middleware/errorHandler.js';
import { generateOrderNo } from '../utils/index.js';
import { applyPromotion } from '../services/promotions.js';
import {
  sendOrderConfirmation,
  sendAdminVoucherSaleNotification,
  sendAdminVoucherAssignmentFailureAlert,
  sendAdminEmailDeliveryFailureAlert,
} from '../services/email.js';
import { allocateVouchersForOrder, normalizeVoucherType } from '../services/voucherAllocation.js';
import { config } from '../config/index.js';
import { isValidObjectId } from '../config/db.js';
import {
  isRazorpayConfigured,
  createRazorpayOrder,
  fetchRazorpayPayment,
  verifyCheckoutSignature,
  verifyWebhookSignature,
} from '../services/razorpay.js';

const MAX_LINE_ITEMS = 20;
const MAX_LINE_ITEM_QUANTITY = 50;

/* ────────────────────────────────────────────────────────────────────────────
 * Trusted, server-side pricing. The frontend sends only { productId, quantity }.
 * Every price, discount and total is (re)computed here from the database.
 * ──────────────────────────────────────────────────────────────────────────── */
const getProductsWithPrices = async (lineItems) => {
  const ids = lineItems.map((it) => it.productId);
  if (ids.some((id) => !isValidObjectId(id))) {
    throw new AppError('Invalid product id in order items', 400, 'INVALID_PRODUCT_ID');
  }
  const found = await Product.find({ _id: { $in: ids }, active: true, archived: { $ne: true } });
  const map = Object.fromEntries(found.map((p) => [p._id.toString(), p]));
  const items = [];
  for (const it of lineItems) {
    const product = map[String(it.productId)];
    if (!product) throw new AppError('Product not found or inactive', 400, 'PRODUCT_MISSING');
    if (product.comingSoon) throw new AppError(`${product.name} is not available for purchase yet`, 400, 'PRODUCT_COMING_SOON');

    const qtyRaw = Number(it.quantity);
    if (!Number.isFinite(qtyRaw) || !Number.isInteger(qtyRaw) || qtyRaw < 1) {
      throw new AppError('Quantity must be a whole number of at least 1', 400, 'INVALID_QUANTITY');
    }
    if (qtyRaw > MAX_LINE_ITEM_QUANTITY) {
      throw new AppError(`Maximum quantity per item is ${MAX_LINE_ITEM_QUANTITY}`, 400, 'QUANTITY_TOO_HIGH');
    }
    const unitPrice = Number(product.sellingPrice);
    const originalPrice = Number(product.originalPrice);
    if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
      throw new AppError(`${product.name} is not priced correctly. Please contact support.`, 400, 'PRODUCT_PRICE_INVALID');
    }
    const voucherType = normalizeVoucherType(product.voucherType, product);
    items.push({
      productId: product._id,
      productName: product.name,
      voucherType,
      brand: product.brand || '',
      unitPrice,
      originalPrice: Number.isFinite(originalPrice) && originalPrice > 0 ? originalPrice : unitPrice,
      quantity: qtyRaw,
    });
  }
  return items;
};

/**
 * Recompute discounts (promo + active campaign) from trusted data.
 * Returns { subtotal, promoDiscount, campaignDiscount, discountAmount, total, promoResult }.
 */
const computeOrderTotals = async ({ lineItems, promoCode, userId }) => {
  const subtotal = lineItems.reduce((s, it) => s + it.unitPrice * it.quantity, 0);
  const productIds = lineItems.map((it) => it.productId);

  const promoResult = await applyPromotion(promoCode, subtotal, userId, productIds);
  const promoDiscount = Math.max(0, promoResult.discount || 0);

  const now = new Date();
  const activeCampaigns = await Campaign.find({
    status: { $in: ['ACTIVE', 'SCHEDULED'] },
    startDate: { $lte: now },
    endDate: { $gte: now },
  })
    .sort({ priority: -1, createdAt: -1 })
    .lean();

  let campaignDiscount = 0;
  if (activeCampaigns.length > 0) {
    const camp = activeCampaigns[0];
    const applicableIds = (camp.applicableProducts || []).map((id) => id.toString());
    const isApplicable =
      applicableIds.length === 0 || lineItems.some((it) => applicableIds.includes(it.productId.toString()));
    if (isApplicable && (camp.minOrderAmount || 0) <= subtotal) {
      if (camp.discountType === 'PERCENTAGE') {
        campaignDiscount = Math.round((subtotal * camp.discountValue) / 100);
      } else {
        campaignDiscount = camp.discountValue;
      }
      if (camp.maxDiscount > 0) campaignDiscount = Math.min(campaignDiscount, camp.maxDiscount);
    }
  }
  campaignDiscount = Math.max(0, campaignDiscount);

  const discountAmount = Math.min(subtotal, promoDiscount + campaignDiscount);
  const total = Math.max(0, subtotal - discountAmount);
  return { subtotal, promoDiscount, campaignDiscount, discountAmount, total, promoResult };
};

/* ────────────────────────────────────────────────────────────────────────────
 * Email delivery — safe & idempotent. Never throws, never flips PAID state.
 * ──────────────────────────────────────────────────────────────────────────── */
const deliverOrderEmailSafe = async (user, order, vouchers) => {
  if (order.emailStatus === 'SENT') return;

  const claimedOrder = await Order.findOneAndUpdate(
    { _id: order._id, emailStatus: { $in: ['PENDING', 'FAILED'] } },
    { $set: { emailStatus: 'SENDING', emailError: null } },
    { new: true }
  );
  if (!claimedOrder) return;
  order.emailStatus = 'SENDING';

  try {
    const recipient = user?.email || order.customerSnapshot?.email || order.billingDetails?.email;
    console.log(`[email:attempt] orderNo=${order.orderNo} paymentStatus=${order.paymentStatus}`);
    const mailRes = await sendOrderConfirmation(user, order, vouchers);
    if (mailRes && mailRes.sent !== false) {
      order.emailStatus = 'SENT';
      order.emailSentAt = new Date();
      order.emailError = null;
    } else {
      order.emailStatus = 'FAILED';
      order.emailError = mailRes?.error || 'Email delivery stubbed or failed';
      console.error(`[email:failure] orderNo=${order.orderNo}`);
    }
  } catch (err) {
    order.emailStatus = 'FAILED';
    order.emailError = err.message;
    console.error(`[email:error] orderNo=${order.orderNo}: ${err.message}`);
  }

  await Order.updateOne(
    { _id: order._id },
    { $set: { emailStatus: order.emailStatus, emailSentAt: order.emailSentAt || null, emailError: order.emailError || null } }
  ).catch(() => {});

  if (order.emailStatus === 'FAILED') {
    try {
      await sendAdminEmailDeliveryFailureAlert(order, order.emailError);
    } catch {}
  }
};

/**
 * Admin "voucher sold" notification — dispatched EXACTLY ONCE per order,
 * gated by an atomic claim on `adminNotifiedAt`. Independent of the customer
 * email so email retries / webhook replays never re-notify the sale.
 */
const notifyAdminSaleOnce = async (user, order, vouchers) => {
  const claimed = await Order.findOneAndUpdate(
    { _id: order._id, adminNotifiedAt: null },
    { $set: { adminNotifiedAt: new Date() } },
    { new: true }
  );
  if (!claimed) return;
  try {
    await sendAdminVoucherSaleNotification(user, claimed, vouchers);
  } catch (err) {
    // Never affects the customer's PAID / FULFILLED state.
    console.error(`[admin:sale_notification_error] orderNo=${order.orderNo}: ${err.message}`);
  }
};

const enrichVouchers = (order, vouchers) =>
  vouchers.map((v) => {
    const match = (order.items || []).find(
      (it) => it.productId.toString() === (v.productId?._id || v.productId).toString()
    );
    return {
      code: v.code,
      expiryDate: v.expiryDate,
      productName: match?.productName || v.productId?.name || '',
      voucherType: v.voucherType || match?.voucherType || '',
      redemptionSteps: Array.isArray(v.productId?.redemptionSteps) ? v.productId.redemptionSteps : [],
      officialWebsiteUrl: v.productId?.officialWebsiteUrl || '',
    };
  });

const publicVoucherList = async (order) => {
  const vouchers = await VoucherCode.find({ orderId: order._id, userId: order.userId })
    .populate('productId', 'name brand provider redemptionSteps officialWebsiteUrl validityMonths')
    .lean();
  return enrichVouchers(order, vouchers);
};

/* ────────────────────────────────────────────────────────────────────────────
 * THE fulfillment gate. Only ever called from a code path that has already
 * cryptographically verified a captured Razorpay payment for THIS order.
 *
 * - Atomically claims the PENDING order (guards against verify/webhook races
 *   and double clicks — exactly one caller wins the transition to PAID).
 * - Allocates vouchers via the existing atomic, idempotent allocation service.
 * - Sends the confirmation email safely (failure never un-pays the order).
 * ──────────────────────────────────────────────────────────────────────────── */
const fulfillVerifiedOrder = async ({ order, user, razorpayPaymentId, source, eventId }) => {
  // Idempotency: already fully done.
  if (order.paymentStatus === 'PAID' && (order.orderStatus === 'FULFILLED' || order.fulfillmentStatus === 'FULFILLED')) {
    return { alreadyFulfilled: true, vouchers: await publicVoucherList(order), order };
  }

  // Atomic claim: PENDING -> PAID. Only the first caller proceeds to allocate.
  const claimUpdate = {
    $set: {
      paymentStatus: 'PAID',
      orderStatus: 'PROCESSING',
      paymentProvider: 'razorpay',
      paidAt: order.paidAt || new Date(),
    },
  };
  if (razorpayPaymentId) {
    claimUpdate.$set.razorpayPaymentId = razorpayPaymentId;
    claimUpdate.$set.paymentReference = razorpayPaymentId;
  }
  if (eventId) claimUpdate.$addToSet = { processedEventIds: eventId };

  const claimed = await Order.findOneAndUpdate(
    { _id: order._id, paymentStatus: { $in: ['PENDING'] } },
    claimUpdate,
    { new: true }
  );

  const working = claimed || (await Order.findById(order._id));
  if (!working) throw new AppError('Order not found during fulfillment', 404, 'ORDER_MISSING');

  // If we didn't win the claim, another path is (or already finished) fulfilling.
  if (!claimed) {
    return { alreadyFulfilled: true, vouchers: await publicVoucherList(working), order: working };
  }

  await AuditLog.create({
    adminEmail: user?.email || working.customerSnapshot?.email || 'system@apexvouchers.in',
    action: 'PAYMENT_VERIFIED',
    resourceType: 'Order',
    resourceId: working._id.toString(),
    details: {
      orderNo: working.orderNo,
      source,
      razorpayOrderId: working.razorpayOrderId,
      razorpayPaymentId: razorpayPaymentId || working.razorpayPaymentId || null,
      total: working.total,
      currency: working.currency,
    },
  }).catch(() => {});

  // Allocate vouchers atomically.
  let vouchers = [];
  try {
    const session = await Order.startSession();
    try {
      await session.withTransaction(async () => {
        const allocRes = await allocateVouchersForOrder({ order: working, user, session });
        vouchers = allocRes.vouchers;
      });
    } finally {
      await session.endSession();
    }
  } catch (allocErr) {
    working.orderStatus = 'PAYMENT_RECEIVED_NEEDS_ALLOCATION';
    working.fulfillmentStatus =
      allocErr.code === 'VOUCHER_MISMATCH_BLOCKED' ? 'MISMATCH_BLOCKED' : 'NEEDS_RESTOCK';
    working.fulfillmentError = allocErr.message;
    await working.save().catch(() => {});

    await AuditLog.create({
      adminEmail: `${source}@apexvouchers.in`,
      action: allocErr.code === 'VOUCHER_MISMATCH_BLOCKED' ? 'VOUCHER_MISMATCH_BLOCKED' : 'ORDER_ALLOCATION_FAILED',
      resourceType: 'Order',
      resourceId: working._id.toString(),
      details: { orderNo: working.orderNo, error: allocErr.message, code: allocErr.code },
    }).catch(() => {});

    try {
      await sendAdminVoucherAssignmentFailureAlert(working, allocErr.message);
    } catch {}

    return { alreadyFulfilled: false, needsAllocation: true, vouchers: [], order: working, error: allocErr.message };
  }

  const enriched = enrichVouchers(working, vouchers);

  // One fulfillment event → customer email + admin sale notification.
  // Both are best-effort and CANNOT change the PAID / FULFILLED state.
  await notifyAdminSaleOnce(user, working, enriched);
  await deliverOrderEmailSafe(user, working, enriched);

  return { alreadyFulfilled: false, vouchers: enriched, order: working };
};

/* ══════════════════════════════════════════════════════════════════════════
 * PUBLIC — checkout key id only. The secret is never exposed.
 * GET /api/payments/config
 * ══════════════════════════════════════════════════════════════════════════ */
export const getPublicPaymentConfig = (_req, res) => {
  res.json({
    success: true,
    provider: 'razorpay',
    configured: isRazorpayConfigured(),
    keyId: config.razorpay.keyId || null, // publishable key — safe for the browser
    currency: 'INR',
    env: config.razorpay.env,
  });
};

/* ══════════════════════════════════════════════════════════════════════════
 * POST /api/payments/order   (auth required)
 * Creates the internal order (PENDING) + a Razorpay order for the exact,
 * server-calculated amount. Nothing is fulfilled here.
 * ══════════════════════════════════════════════════════════════════════════ */
export const createPaymentOrder = async (req, res, next) => {
  let session;
  try {
    if (!isRazorpayConfigured()) {
      return next(new AppError('Online payment is temporarily unavailable. Please try again later.', 503, 'PAYMENT_GATEWAY_UNCONFIGURED'));
    }

    const { items, promoCode, billing, paymentMethod } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) {
      return next(new AppError('Items required', 400, 'ITEMS_REQUIRED'));
    }
    if (items.length > MAX_LINE_ITEMS) {
      return next(new AppError(`Maximum ${MAX_LINE_ITEMS} line items per order`, 400, 'TOO_MANY_ITEMS'));
    }

    // 1. Trusted server-side pricing + product-specific stock check.
    const lineItems = await getProductsWithPrices(items);
    for (const it of lineItems) {
      const availableStock = await VoucherCode.countDocuments({
        productId: it.productId,
        voucherType: it.voucherType,
        status: 'AVAILABLE',
        expiryDate: { $gt: new Date() },
      });
      if (availableStock < it.quantity) {
        return next(
          new AppError(
            `Voucher code out of stock for ${it.productName}. Please try again later or contact support.`,
            409,
            'VOUCHER_OUT_OF_STOCK'
          )
        );
      }
    }

    const { subtotal, discountAmount, total, promoResult } = await computeOrderTotals({
      lineItems,
      promoCode,
      userId: req.user.id,
    });

    if (!(total > 0)) {
      // A ₹0 order can't be paid via Razorpay and must not silently fulfil.
      return next(new AppError('Order total must be greater than zero', 400, 'ZERO_TOTAL_ORDER'));
    }

    // 2. Persist the internal order in PENDING state.
    const order = new Order({
      orderNo: generateOrderNo(),
      userId: req.user.id,
      items: lineItems,
      subtotal,
      discountAmount,
      tax: 0,
      total,
      currency: 'INR',
      promotionId: promoResult.promotion?._id || null,
      promoCode: promoResult.promotion?.code || null,
      paymentStatus: 'PENDING',
      orderStatus: 'PAYMENT_PENDING',
      fulfillmentStatus: 'PENDING',
      paymentProvider: 'razorpay',
      paymentMethod: paymentMethod || 'upi',
      billingDetails: {
        name: billing?.name || req.user.name || '',
        email: billing?.email || req.user.email || '',
        phone: billing?.phone || req.user.phone || '',
        address: billing?.address || '',
        gstin: billing?.gstin || '',
      },
      customerSnapshot: {
        email: billing?.email || req.user.email,
        name: billing?.name || req.user.name,
        phone: billing?.phone || req.user.phone || null,
      },
    });

    session = await Order.startSession();
    await session.withTransaction(async () => {
      await order.save({ session });
      if (promoResult.promotion) {
        await Promotion.updateOne(
          { _id: promoResult.promotion._id },
          { $inc: { usageCount: 1 }, $push: { usedBy: req.user.id } },
          { session }
        );
      }
    });

    // 3. Create the Razorpay order for the EXACT server total (in paise).
    let rzpOrder;
    try {
      rzpOrder = await createRazorpayOrder({
        amountPaise: Math.round(total * 100),
        currency: 'INR',
        receipt: order.orderNo,
        notes: { internalOrderId: order._id.toString(), userId: req.user.id.toString() },
      });
    } catch (gwErr) {
      // Roll the internal order into a clean failed state — it can never be paid.
      order.paymentStatus = 'FAILED';
      order.orderStatus = 'FAILED';
      order.fulfillmentStatus = 'FAILED';
      order.fulfillmentError = gwErr.message;
      await order.save().catch(() => {});
      return next(gwErr);
    }

    order.razorpayOrderId = rzpOrder.id;
    await order.save();

    res.status(201).json({
      success: true,
      orderId: order._id,
      orderNo: order.orderNo,
      amount: rzpOrder.amount, // paise
      currency: rzpOrder.currency,
      razorpayOrderId: rzpOrder.id,
      keyId: config.razorpay.keyId, // publishable
      prefill: {
        name: order.customerSnapshot?.name || '',
        email: order.customerSnapshot?.email || '',
        contact: order.customerSnapshot?.phone || '',
      },
    });
  } catch (err) {
    next(err);
  } finally {
    if (session) await session.endSession();
  }
};

/* ══════════════════════════════════════════════════════════════════════════
 * POST /api/payments/verify   (auth required)
 * Called by the browser after Razorpay Checkout succeeds. The browser CANNOT
 * be trusted, so every claim is re-verified:
 *   - order ownership + razorpay_order_id binding
 *   - checkout HMAC signature (key secret)
 *   - independent payment fetch from Razorpay: captured, correct order,
 *     correct amount, correct currency
 * Only then are vouchers allocated.
 * ══════════════════════════════════════════════════════════════════════════ */
export const verifyPayment = async (req, res, next) => {
  try {
    const {
      orderId,
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
    } = req.body || {};

    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return next(new AppError('Missing payment verification fields', 400, 'VERIFY_FIELDS_MISSING'));
    }

    const q = isValidObjectId(orderId) ? { _id: orderId } : { orderNo: orderId };
    const order = await Order.findOne(q);
    if (!order) return next(new AppError('Order not found', 404, 'ORDER_NOT_FOUND'));

    // Ownership.
    if (String(order.userId) !== String(req.user.id)) {
      return next(new AppError('Not authorized to access this order', 403, 'ORDER_FORBIDDEN'));
    }

    // Idempotent short-circuit.
    if (order.paymentStatus === 'PAID' && (order.orderStatus === 'FULFILLED' || order.fulfillmentStatus === 'FULFILLED')) {
      return res.json({
        success: true,
        paymentStatus: 'PAID',
        orderStatus: 'FULFILLED',
        data: order.toObject(),
        vouchers: await publicVoucherList(order),
      });
    }

    // Order-binding: the gateway order id must be the one we created for THIS order.
    if (!order.razorpayOrderId || order.razorpayOrderId !== razorpayOrderId) {
      await AuditLog.create({
        adminEmail: req.user.email || 'system@apexvouchers.in',
        action: 'PAYMENT_VERIFY_REJECTED',
        resourceType: 'Order',
        resourceId: order._id.toString(),
        details: { orderNo: order.orderNo, reason: 'ORDER_ID_MISMATCH' },
      }).catch(() => {});
      return next(new AppError('Payment does not belong to this order', 400, 'ORDER_ID_MISMATCH'));
    }

    // Signature (key secret).
    if (!verifyCheckoutSignature({ razorpayOrderId, razorpayPaymentId, signature: razorpaySignature })) {
      await AuditLog.create({
        adminEmail: req.user.email || 'system@apexvouchers.in',
        action: 'PAYMENT_VERIFY_REJECTED',
        resourceType: 'Order',
        resourceId: order._id.toString(),
        details: { orderNo: order.orderNo, reason: 'SIGNATURE_INVALID' },
      }).catch(() => {});
      return next(new AppError('Payment signature verification failed', 400, 'SIGNATURE_INVALID'));
    }

    // Independent re-verification against Razorpay.
    const payment = await fetchRazorpayPayment(razorpayPaymentId);
    const okStatus = ['captured', 'authorized'].includes(payment.status);
    const okOrder = payment.order_id === razorpayOrderId;
    const okAmount = Number(payment.amount) === Math.round(order.total * 100);
    const okCurrency = String(payment.currency).toUpperCase() === String(order.currency || 'INR').toUpperCase();

    if (!okStatus || !okOrder || !okAmount || !okCurrency) {
      await AuditLog.create({
        adminEmail: req.user.email || 'system@apexvouchers.in',
        action: 'PAYMENT_VERIFY_REJECTED',
        resourceType: 'Order',
        resourceId: order._id.toString(),
        details: {
          orderNo: order.orderNo,
          reason: 'GATEWAY_MISMATCH',
          paymentStatus: payment.status,
          okStatus, okOrder, okAmount, okCurrency,
        },
      }).catch(() => {});
      return next(new AppError('Payment could not be verified with the gateway', 400, 'PAYMENT_NOT_VERIFIED'));
    }
    if (payment.status === 'authorized') {
      // Auto-capture is on, but if we ever see "authorized" just wait for the
      // webhook / capture rather than fulfilling on an uncaptured payment.
      return res.json({
        success: true,
        paymentStatus: 'PENDING',
        orderStatus: order.orderStatus,
        message: 'Payment authorized — finalizing. Your voucher will appear shortly.',
        data: order.toObject(),
        vouchers: [],
      });
    }

    const result = await fulfillVerifiedOrder({
      order,
      user: req.user,
      razorpayPaymentId,
      source: 'verify',
    });

    if (result.needsAllocation) {
      return res.json({
        success: true,
        paymentStatus: 'PAID',
        orderStatus: 'PAYMENT_RECEIVED_NEEDS_ALLOCATION',
        needsAllocation: true,
        fulfillmentStatus: result.order.fulfillmentStatus,
        message: 'Payment received. Voucher allocation is pending a restock — support has been notified.',
        data: result.order.toObject(),
        vouchers: [],
      });
    }

    return res.json({
      success: true,
      paymentStatus: 'PAID',
      orderStatus: 'FULFILLED',
      fulfillmentStatus: 'FULFILLED',
      emailStatus: result.order.emailStatus, // 'SENT' | 'FAILED' | 'SENDING'
      data: {
        orderNo: result.order.orderNo,
        total: result.order.total,
        currency: result.order.currency,
        paymentStatus: 'PAID',
        orderStatus: 'FULFILLED',
        fulfillmentStatus: 'FULFILLED',
        emailStatus: result.order.emailStatus,
        paymentReference: result.order.razorpayPaymentId || result.order.paymentReference || null,
        paidAt: result.order.paidAt,
      },
      vouchers: result.vouchers,
    });
  } catch (err) {
    next(err);
  }
};

/* ══════════════════════════════════════════════════════════════════════════
 * GET /api/payments/order/:orderId   (auth required)
 * READ-ONLY. Returns the server's truth about an order. Never mutates state,
 * never fulfils. Safe to poll / refresh / open directly.
 * ══════════════════════════════════════════════════════════════════════════ */
export const getPaymentStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const q = isValidObjectId(orderId) ? { _id: orderId } : { orderNo: orderId };
    const order = await Order.findOne(q).lean();
    if (!order) return next(new AppError('Order not found', 404, 'ORDER_NOT_FOUND'));
    if (String(order.userId) !== String(req.user.id) && req.user.role !== 'admin') {
      return next(new AppError('Not authorized to access this order', 403, 'ORDER_FORBIDDEN'));
    }

    const isFulfilled =
      order.paymentStatus === 'PAID' &&
      (order.orderStatus === 'FULFILLED' || order.fulfillmentStatus === 'FULFILLED');

    const vouchers = isFulfilled ? await publicVoucherList(order) : [];

    res.json({
      success: true,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      fulfillmentStatus: order.fulfillmentStatus,
      emailStatus: order.emailStatus,
      data: {
        orderNo: order.orderNo,
        total: order.total,
        currency: order.currency,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        fulfillmentStatus: order.fulfillmentStatus,
        emailStatus: order.emailStatus,
        paymentReference: order.razorpayPaymentId || order.paymentReference || null,
        createdAt: order.createdAt,
        paidAt: order.paidAt,
      },
      vouchers,
    });
  } catch (err) {
    next(err);
  }
};

/* ══════════════════════════════════════════════════════════════════════════
 * POST /api/payments/webhook   (NO auth — verified by HMAC signature)
 * The authoritative, out-of-band confirmation. Also the safety net if the
 * browser closes before /verify runs.
 * ══════════════════════════════════════════════════════════════════════════ */
export const handleRazorpayWebhook = async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const rawBody = req.rawBody;

  if (!signature || !rawBody || !config.razorpay.webhookSecret) {
    console.error('[razorpay:webhook] rejected — missing signature / secret / body');
    return res.status(400).json({ success: false, message: 'Invalid webhook' });
  }
  if (!verifyWebhookSignature(rawBody, signature)) {
    console.error('[razorpay:webhook] rejected — signature verification failed');
    return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
  }

  // From here the payload is authentic (signed with our webhook secret).
  const payload = req.body || {};
  const event = payload.event || '';
  const eventId = req.headers['x-razorpay-event-id'] || `${event}:${payload?.payload?.payment?.entity?.id || ''}`;
  const paymentEntity = payload?.payload?.payment?.entity || null;
  const orderEntity = payload?.payload?.order?.entity || null;
  const rzpOrderId = paymentEntity?.order_id || orderEntity?.id || null;

  console.log(`[razorpay:webhook] event=${event} rzpOrderId=${rzpOrderId || 'n/a'}`);

  // We only fulfil on capture / order.paid. Everything else is acknowledged.
  const isPaidEvent = event === 'payment.captured' || event === 'order.paid';
  const isFailEvent = event === 'payment.failed';

  if (!rzpOrderId || (!isPaidEvent && !isFailEvent)) {
    return res.status(200).json({ success: true, message: 'Acknowledged' });
  }

  try {
    const order = await Order.findOne({ razorpayOrderId: rzpOrderId }).populate('userId');
    if (!order) {
      console.warn(`[razorpay:webhook] no internal order for rzpOrderId=${rzpOrderId}`);
      return res.status(200).json({ success: true, message: 'No matching order' });
    }

    if (order.processedEventIds?.includes(eventId)) {
      return res.status(200).json({ success: true, message: 'Duplicate event ignored' });
    }

    if (isFailEvent) {
      await Order.updateOne(
        { _id: order._id, paymentStatus: 'PENDING' },
        {
          $set: { paymentStatus: 'FAILED', orderStatus: 'FAILED', fulfillmentStatus: 'FAILED' },
          $addToSet: { processedEventIds: eventId },
        }
      );
      return res.status(200).json({ success: true, message: 'Failure recorded' });
    }

    // Paid event — re-verify amount/currency from the SIGNED payload.
    if (paymentEntity) {
      const okOrder = paymentEntity.order_id === rzpOrderId;
      const okAmount = Number(paymentEntity.amount) === Math.round(order.total * 100);
      const okCurrency = String(paymentEntity.currency || 'INR').toUpperCase() === String(order.currency || 'INR').toUpperCase();
      const okStatus = paymentEntity.status === 'captured';
      if (!okOrder || !okAmount || !okCurrency || !okStatus) {
        console.error(`[razorpay:webhook] payload mismatch for order ${order.orderNo}`);
        await AuditLog.create({
          adminEmail: 'webhook@apexvouchers.in',
          action: 'PAYMENT_VERIFY_REJECTED',
          resourceType: 'Order',
          resourceId: order._id.toString(),
          details: { orderNo: order.orderNo, reason: 'WEBHOOK_PAYLOAD_MISMATCH', okOrder, okAmount, okCurrency, okStatus },
        }).catch(() => {});
        return res.status(200).json({ success: true, message: 'Payload mismatch ignored' });
      }
    }

    await fulfillVerifiedOrder({
      order,
      user: order.userId,
      razorpayPaymentId: paymentEntity?.id || null,
      source: 'webhook',
      eventId,
    });

    return res.status(200).json({ success: true, message: 'Processed' });
  } catch (err) {
    // Signature already passed — log and 200 so Razorpay doesn't hammer retries,
    // the order simply stays PENDING and recoverable / the next event re-tries.
    console.error(`[razorpay:webhook] processing error: ${err.message}`);
    return res.status(200).json({ success: true, message: 'Acknowledged (deferred)' });
  }
};
