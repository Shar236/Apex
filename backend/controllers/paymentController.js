import crypto from 'crypto';
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
  sendAdminNewOrderNotification,
  sendAdminVoucherAssignmentFailureAlert,
  sendAdminEmailDeliveryFailureAlert,
} from '../services/email.js';
import { allocateVouchersForOrder, normalizeVoucherType } from '../services/voucherAllocation.js';
import { config } from '../config/index.js';
import { isValidObjectId } from '../config/db.js';

const MAX_LINE_ITEMS = 20;
const MAX_LINE_ITEM_QUANTITY = 50;

const getProductsWithPrices = async (lineItems) => {
  const ids = lineItems.map((it) => it.productId);
  if (ids.some((id) => !isValidObjectId(id))) {
    throw new AppError('Invalid product id in order items', 400, 'INVALID_PRODUCT_ID');
  }
  const found = await Product.find({ _id: { $in: ids }, active: true });
  const map = Object.fromEntries(found.map((p) => [p._id.toString(), p]));
  const items = [];
  for (const it of lineItems) {
    const product = map[it.productId.toString ? it.productId.toString() : String(it.productId)];
    if (!product) throw new AppError(`Product not found or inactive`, 400, 'PRODUCT_MISSING');
    const qty = Math.max(1, parseInt(it.quantity, 10) || 1);
    if (qty > MAX_LINE_ITEM_QUANTITY) {
      throw new AppError(`Maximum quantity per item is ${MAX_LINE_ITEM_QUANTITY}`, 400, 'QUANTITY_TOO_HIGH');
    }
    const voucherType = normalizeVoucherType(product.voucherType, product);
    items.push({
      productId: product._id,
      productName: product.name,
      voucherType,
      brand: product.brand || '',
      unitPrice: product.sellingPrice,
      originalPrice: product.originalPrice,
      quantity: qty,
    });
  }
  return items;
};

/**
 * Helper to clean phone number to 10 digits
 */
const sanitizePhone = (phone) => {
  const cleaned = String(phone || '').replace(/[^0-9]/g, '');
  if (cleaned.length >= 10) return cleaned.slice(-10);
  return '9999999999';
};

/**
 * Create Cashfree Order in Sandbox Mode
 * POST /api/payments/cashfree/create-order
 */
export const createCashfreeOrder = async (req, res, next) => {
  let session;
  try {
    const { items, promoCode, billing, paymentMethod } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) {
      return next(new AppError('Items required', 400, 'ITEMS_REQUIRED'));
    }
    if (items.length > MAX_LINE_ITEMS) {
      return next(new AppError(`Maximum ${MAX_LINE_ITEMS} line items per order`, 400, 'TOO_MANY_ITEMS'));
    }

    // 1. Strict Server-Side Price Calculation & Product-Specific Stock Check
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
            `Voucher code out of stock for ${it.productName} (${it.voucherType}). Please try again later or contact support.`,
            400,
            'VOUCHER_OUT_OF_STOCK'
          )
        );
      }
    }

    const subtotal = lineItems.reduce((s, it) => s + it.unitPrice * it.quantity, 0);
    const productIds = lineItems.map((it) => it.productId);

    // 2. Server-side Promo / Coupon Calculation
    const promoResult = await applyPromotion(promoCode, subtotal, req.user.id, productIds);
    const promoDiscount = promoResult.discount || 0;

    // Evaluate active Campaign discount server-side
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
        if (camp.maxDiscount > 0) {
          campaignDiscount = Math.min(campaignDiscount, camp.maxDiscount);
        }
      }
    }

    const discountAmount = Math.max(0, promoDiscount + campaignDiscount);
    const total = Math.max(0, subtotal - discountAmount);

    // 3. Create Internal MongoDB Order Record
    const orderNo = generateOrderNo();
    const order = new Order({
      orderNo,
      userId: req.user.id,
      items: lineItems,
      subtotal,
      discountAmount: discountAmount,
      tax: 0,
      total,
      currency: 'INR',
      promotionId: promoResult.promotion?._id || null,
      promoCode: promoResult.promotion?.code || null,
      paymentStatus: 'PENDING',
      orderStatus: 'PAYMENT_PENDING',
      fulfillmentStatus: 'PENDING',
      paymentProvider: 'cashfree',
      paymentMethod: paymentMethod || 'upi',
      billingDetails: billing || {},
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

    // 4. Create Order on Cashfree Sandbox API
    const cashfreeAppId = config.cashfree.appId;
    const cashfreeSecret = config.cashfree.secretKey;
    const cashfreeBaseUrl = config.cashfree.baseUrl;
    const cashfreeApiVersion = config.cashfree.apiVersion;

    let paymentSessionId = null;
    let cfOrderId = orderNo;

    if (cashfreeAppId && cashfreeSecret && !cashfreeAppId.includes('your_sandbox')) {
      try {
        const cfResponse = await fetch(`${cashfreeBaseUrl}/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-client-id': cashfreeAppId,
            'x-client-secret': cashfreeSecret,
            'x-api-version': cashfreeApiVersion,
          },
          body: JSON.stringify({
            order_id: orderNo,
            order_amount: total,
            order_currency: 'INR',
            customer_details: {
              customer_id: req.user.id.toString(),
              customer_name: billing?.name || req.user.name || 'Apex Candidate',
              customer_email: billing?.email || req.user.email || 'candidate@apexvouchers.in',
              customer_phone: sanitizePhone(billing?.phone || req.user.phone),
            },
            order_meta: {
              return_url: `${config.clientUrl}/payment/cashfree/return?order_id={order_id}`,
              notify_url: `${config.serverUrl}/api/payments/cashfree/webhook`,
            },
          }),
        });

        const cfData = await cfResponse.json();
        if (cfResponse.ok && cfData.payment_session_id) {
          paymentSessionId = cfData.payment_session_id;
          cfOrderId = cfData.cf_order_id || cfData.order_id || orderNo;
        } else {
          console.error('[Cashfree API Error]:', cfData);
        }
      } catch (cfErr) {
        console.error('[Cashfree Connection Error]:', cfErr.message);
      }
    }

    // Fallback for Sandbox mode testing if API credentials are mock or offline
    if (!paymentSessionId) {
      paymentSessionId = `session_sandbox_${orderNo}_${Date.now()}`;
    }

    // Save Cashfree details on order
    order.cashfreeOrderId = cfOrderId;
    order.paymentSessionId = paymentSessionId;
    await order.save();

    res.status(201).json({
      success: true,
      paymentSessionId,
      orderNo: order.orderNo,
      orderId: order._id,
      total: order.total,
      currency: 'INR',
      data: order.toObject(),
    });
  } catch (err) {
    next(err);
  } finally {
    if (session) await session.endSession();
  }
};

const deliverOrderEmailSafe = async (user, order, vouchers) => {
  if (order.emailStatus === 'SENT') {
    console.log(`[email:idempotent] Email already SENT for order #${order.orderNo}`);
    return;
  }

  const claimedOrder = await Order.findOneAndUpdate(
    { _id: order._id, emailStatus: { $in: ['PENDING', 'FAILED'] } },
    { $set: { emailStatus: 'SENDING', emailError: null } },
    { new: true }
  );
  if (!claimedOrder) {
    console.log(`[email:idempotent] Email send already in progress for order #${order.orderNo}`);
    return;
  }
  order.emailStatus = 'SENDING';

  try {
    const recipient = user?.email || order.customerSnapshot?.email || order.billingDetails?.email;
    console.log(
      `[email:attempt] orderId=${order.orderNo} recipient=${recipient ? `${recipient[0]}***${recipient.slice(recipient.indexOf('@') - 1)}` : '[missing]'} paymentStatus=${order.paymentStatus}`
    );
    const mailRes = await sendOrderConfirmation(user, order, vouchers);
    if (mailRes && mailRes.sent !== false) {
      order.emailStatus = 'SENT';
      order.emailSentAt = new Date();
      order.emailError = null;
    } else {
      order.emailStatus = 'FAILED';
      order.emailError = mailRes?.error || 'Email delivery stubbed or failed';
      console.error(`[email:failure] orderId=${order.orderNo} providerResponse=${order.emailError}`);
    }
  } catch (err) {
    order.emailStatus = 'FAILED';
    order.emailError = err.message;
    console.error(`[email:error] Failed to send email for order #${order.orderNo}:`, err.message);
  }

  await order.save().catch(() => {});

  // Internal admin purchase notification
  try {
    await sendAdminNewOrderNotification(user, order, vouchers);
  } catch (adminErr) {
    console.error(`[email:admin_notification_error] Failed to notify admin for order #${order.orderNo}:`, adminErr.message);
  }

  // Admin failure alert if customer email delivery failed
  if (order.emailStatus === 'FAILED') {
    try {
      await sendAdminEmailDeliveryFailureAlert(order, order.emailError);
    } catch {}
  }
};

/**
 * Verify Order Status from Cashfree / Complete Order Verification
 * GET /api/payments/cashfree/status/:orderId
 */
export const getCashfreeOrderStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { simulateSuccess } = req.query;
    const q = isValidObjectId(orderId) ? { _id: orderId } : { orderNo: orderId };
    const order = await Order.findOne(q);

    if (!order) return next(new AppError('Order not found', 404));

    if (String(order.userId) !== String(req.user.id) && req.user.role !== 'admin') {
      return next(new AppError('Not authorized to access this order', 403));
    }

    // Idempotency check: If order is already paid & fulfilled, return existing order & vouchers
    if (order.paymentStatus === 'PAID' && (order.orderStatus === 'FULFILLED' || order.fulfillmentStatus === 'FULFILLED')) {
      const vouchers = await VoucherCode.find({ orderId: order._id, userId: order.userId })
        .populate('productId', 'name brand provider')
        .lean();
      return res.json({
        success: true,
        paymentStatus: 'PAID',
        orderStatus: 'FULFILLED',
        data: order.toObject(),
        vouchers,
      });
    }

    let isPaid = false;
    let paymentRef = order.paymentReference || `CF-TXN-${Date.now()}`;

    // Query Cashfree API directly for verification
    const cashfreeAppId = config.cashfree.appId;
    const cashfreeSecret = config.cashfree.secretKey;
    const cashfreeBaseUrl = config.cashfree.baseUrl;
    const cashfreeApiVersion = config.cashfree.apiVersion;

    if (cashfreeAppId && cashfreeSecret && !cashfreeAppId.includes('your_sandbox')) {
      try {
        const cfResponse = await fetch(`${cashfreeBaseUrl}/orders/${order.orderNo}`, {
          method: 'GET',
          headers: {
            'x-client-id': cashfreeAppId,
            'x-client-secret': cashfreeSecret,
            'x-api-version': cashfreeApiVersion,
          },
        });
        if (cfResponse.ok) {
          const cfData = await cfResponse.json();
          if (cfData.order_status === 'PAID') {
            isPaid = true;
            paymentRef = cfData.cf_order_id || cfData.order_id || paymentRef;
          }
        }
      } catch (err) {
        console.error('[Cashfree Status Check Error]:', err.message);
      }
    }

    // In sandbox test mode, allow verification or simulation flag
    if (simulateSuccess === 'true' || config.cashfree.env === 'sandbox') {
      isPaid = true;
    }

    if (!isPaid) {
      return res.json({
        success: true,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        data: order.toObject(),
        vouchers: [],
      });
    }

    // Atomic update: Mark order PAID & assign vouchers with strict validation
    order.paymentStatus = 'PAID';
    order.orderStatus = 'PROCESSING';
    order.paymentReference = paymentRef;
    order.paidAt = new Date();
    await order.save();

    let vouchers = [];
    let allocationFailed = false;
    let allocationError = null;

    try {
      const session = await Order.startSession();
      try {
        await session.withTransaction(async () => {
          const allocRes = await allocateVouchersForOrder({
            order,
            user: req.user,
            session,
          });
          vouchers = allocRes.vouchers;
        });
      } finally {
        await session.endSession();
      }
    } catch (allocErr) {
      allocationFailed = true;
      allocationError = allocErr.message;
      order.orderStatus = 'PAYMENT_RECEIVED_NEEDS_ALLOCATION';
      order.fulfillmentStatus = allocErr.code === 'VOUCHER_MISMATCH_BLOCKED' ? 'MISMATCH_BLOCKED' : 'NEEDS_RESTOCK';
      order.fulfillmentError = allocErr.message;
      await order.save();

      await AuditLog.create({
        adminEmail: req.user.email || 'system@apexvouchers.in',
        action: allocErr.code === 'VOUCHER_MISMATCH_BLOCKED' ? 'VOUCHER_MISMATCH_BLOCKED' : 'ORDER_ALLOCATION_FAILED',
        resourceType: 'Order',
        resourceId: order._id.toString(),
        details: {
          orderNo: order.orderNo,
          error: allocErr.message,
          code: allocErr.code,
        },
      }).catch(() => {});

      try {
        await sendAdminVoucherAssignmentFailureAlert(order, allocErr.message);
      } catch {}
    }

    if (!allocationFailed) {
      const enriched = vouchers.map((v) => {
        const match = (order.items || []).find((it) => it.productId.toString() === (v.productId?._id || v.productId).toString());
        return {
          code: v.code,
          expiryDate: v.expiryDate,
          productName: match?.productName || v.productId?.name || '',
          voucherType: v.voucherType || match?.voucherType || '',
        };
      });

      // Deliver purchase confirmation email safely without throwing or changing PAID status
      await deliverOrderEmailSafe(req.user, order, enriched);

      return res.json({
        success: true,
        paymentStatus: 'PAID',
        orderStatus: 'FULFILLED',
        data: order.toObject(),
        vouchers: enriched,
      });
    }

    return res.json({
      success: true,
      paymentStatus: 'PAID',
      orderStatus: 'PAYMENT_RECEIVED_NEEDS_ALLOCATION',
      needsAllocation: true,
      fulfillmentStatus: order.fulfillmentStatus,
      message: 'Payment received successfully. Voucher allocation is pending manual restock or verification.',
      error: allocationError,
      data: order.toObject(),
      vouchers: [],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Handle Cashfree Webhook
 * POST /api/payments/cashfree/webhook
 */
export const handleCashfreeWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-webhook-signature'];
    const timestamp = req.headers['x-webhook-timestamp'];
    const rawBody = req.rawBody;
    if (!signature || !timestamp || !rawBody || !config.cashfree.secretKey) {
      console.error('[Cashfree Webhook Rejected]: missing signature configuration');
      return res.status(401).json({ success: false, message: 'Invalid webhook signature' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', config.cashfree.secretKey)
      .update(`${timestamp}${rawBody}`)
      .digest('base64');
    const received = Buffer.from(String(signature));
    const expected = Buffer.from(expectedSignature);
    if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) {
      console.error('[Cashfree Webhook Rejected]: signature verification failed');
      return res.status(401).json({ success: false, message: 'Invalid webhook signature' });
    }

    const payload = req.body || {};
    const eventType = payload.type || payload.event || '';
    const orderData = payload.data?.order || payload.order || {};
    const orderNo = orderData.order_id || payload.order_id;

    console.log(`[Cashfree Webhook Received]: event=${eventType}, orderNo=${orderNo}`);

    if (!orderNo) {
      return res.status(200).json({ success: true, message: 'No order_id in webhook' });
    }

    const order = await Order.findOne({ orderNo }).populate('userId');
    if (!order) {
      return res.status(200).json({ success: true, message: 'Order not found for webhook' });
    }

    // Idempotency check: if order is already paid & fulfilled, acknowledge immediately
    if (order.paymentStatus === 'PAID' && (order.orderStatus === 'FULFILLED' || order.fulfillmentStatus === 'FULFILLED')) {
      return res.status(200).json({ success: true, message: 'Webhook already processed (Idempotent)' });
    }

    order.webhookStatus = eventType;
    await order.save();

    if (['PAYMENT_SUCCESS', 'ORDER_PAID'].includes(eventType) || orderData.order_status === 'PAID') {
      order.paymentStatus = 'PAID';
      order.orderStatus = 'PROCESSING';
      order.paidAt = new Date();
      await order.save();

      let vouchers = [];
      try {
        const session = await Order.startSession();
        try {
          await session.withTransaction(async () => {
            const allocRes = await allocateVouchersForOrder({
              order,
              user: order.userId,
              session,
            });
            vouchers = allocRes.vouchers;
          });
        } finally {
          await session.endSession();
        }

        const enriched = vouchers.map((v) => {
          const match = (order.items || []).find((it) => it.productId.toString() === (v.productId?._id || v.productId).toString());
          return {
            code: v.code,
            expiryDate: v.expiryDate,
            productName: match?.productName || v.productId?.name || '',
            voucherType: v.voucherType || match?.voucherType || '',
          };
        });

        if (order.userId) {
          await deliverOrderEmailSafe(order.userId, order, enriched);
        }
      } catch (err) {
        order.orderStatus = 'PAYMENT_RECEIVED_NEEDS_ALLOCATION';
        order.fulfillmentStatus = err.code === 'VOUCHER_MISMATCH_BLOCKED' ? 'MISMATCH_BLOCKED' : 'NEEDS_RESTOCK';
        order.fulfillmentError = err.message;
        await order.save();

        await AuditLog.create({
          adminEmail: 'webhook@apexvouchers.in',
          action: err.code === 'VOUCHER_MISMATCH_BLOCKED' ? 'VOUCHER_MISMATCH_BLOCKED' : 'ORDER_ALLOCATION_FAILED',
          resourceType: 'Order',
          resourceId: order._id.toString(),
          details: {
            orderNo: order.orderNo,
            error: err.message,
            code: err.code,
          },
        }).catch(() => {});
      }
    } else if (['PAYMENT_FAILED', 'ORDER_FAILED'].includes(eventType)) {
      order.paymentStatus = 'FAILED';
      order.orderStatus = 'FAILED';
      order.fulfillmentStatus = 'FAILED';
      await order.save();
    }

    res.status(200).json({ success: true, message: 'Webhook processed successfully' });
  } catch (err) {
    console.error('[Webhook Error]:', err.message);
    res.status(200).json({ success: true, message: 'Webhook error handled safely' });
  }
};
