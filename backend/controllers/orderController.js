import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { VoucherCode } from '../models/VoucherCode.js';
import { Promotion } from '../models/Promotion.js';
import { AuditLog } from '../models/AuditLog.js';
import { AppError } from '../middleware/errorHandler.js';
import { generateOrderNo } from '../utils/index.js';
import { applyPromotion } from '../services/promotions.js';
import { sendOrderConfirmation, sendAdminVoucherAssignmentFailureAlert } from '../services/email.js';
import { allocateVouchersForOrder, normalizeVoucherType } from '../services/voucherAllocation.js';
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

export const createOrder = async (req, res, next) => {
  let session;
  try {
    session = await Order.startSession();
    await session.withTransaction(async () => {
      const { items, promoCode, billing } = req.body || {};
      if (!Array.isArray(items) || items.length === 0) {
        throw new AppError('Items required', 400, 'ITEMS_REQUIRED');
      }
      if (items.length > MAX_LINE_ITEMS) {
        throw new AppError(`Maximum ${MAX_LINE_ITEMS} line items per order`, 400, 'TOO_MANY_ITEMS');
      }

      // Server-side price calculation & exact product voucher type resolution
      const lineItems = await getProductsWithPrices(items);
      const subtotal = lineItems.reduce((s, it) => s + it.unitPrice * it.quantity, 0);
      const productIds = lineItems.map((it) => it.productId);

      const promoResult = await applyPromotion(promoCode, subtotal, req.user.id, productIds);
      const discount = promoResult.discount || 0;
      const total = Math.max(0, subtotal - discount);

      const order = new Order({
        orderNo: generateOrderNo(),
        userId: req.user.id,
        items: lineItems,
        subtotal,
        discountAmount: discount,
        tax: 0,
        total,
        currency: 'INR',
        promotionId: promoResult.promotion?._id || null,
        promoCode: promoResult.promotion?.code || null,
        paymentStatus: 'PENDING',
        orderStatus: 'PAYMENT_PENDING',
        fulfillmentStatus: 'PENDING',
        billingDetails: billing || {},
        customerSnapshot: {
          email: req.user.email,
          name: req.user.name,
          phone: req.user.phone || null,
        },
      });
      await order.save({ session });

      if (promoResult.promotion) {
        await Promotion.updateOne(
          { _id: promoResult.promotion._id },
          { $inc: { usageCount: 1 }, $push: { usedBy: req.user.id } },
          { session }
        );
      }

      res.status(201).json({
        success: true,
        data: order.toObject(),
        promotionApplied: promoResult,
      });
    });
  } catch (err) {
    next(err);
  } finally {
    if (session) await session.endSession();
  }
};

export const getOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const q = isValidObjectId(id) ? { _id: id } : { orderNo: id };
    const order = await Order.findOne({ ...q, userId: req.user.id }).lean();
    if (!order) return next(new AppError('Order not found', 404));
    const vouchers = await VoucherCode.find({ orderId: order._id, userId: req.user.id })
      .populate('productId', 'name brand provider')
      .lean();
    res.json({ success: true, data: order, vouchers });
  } catch (err) {
    next(err);
  }
};

export const simulatePaymentSuccess = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { paymentReference, provider } = req.body || {};
    const q = isValidObjectId(id) ? { _id: id } : { orderNo: id };
    const order = await Order.findOne(q);
    if (!order) return next(new AppError('Order not found', 404));
    if (String(order.userId) !== String(req.user.id) && req.user.role !== 'admin') {
      return next(new AppError('Not allowed', 403));
    }

    // Idempotency check: if order is already paid & fulfilled, return existing vouchers
    if (order.paymentStatus === 'PAID' && order.orderStatus === 'FULFILLED') {
      const vouchers = await VoucherCode.find({ orderId: order._id, userId: order.userId })
        .populate('productId', 'name brand provider')
        .lean();
      return res.json({ success: true, data: order.toObject(), vouchers });
    }

    order.paymentStatus = 'PAID';
    order.orderStatus = 'PROCESSING';
    order.paymentReference = paymentReference || order.paymentReference || `SIM-${Date.now()}`;
    order.paymentProvider = provider || 'simulated';
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

      // Log audit entry for allocation failure
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

      try {
        const mailRes = await sendOrderConfirmation(req.user, order, enriched);
        if (mailRes && mailRes.sent !== false) {
          order.emailStatus = 'SENT';
          order.emailSentAt = new Date();
          order.emailError = null;
        } else {
          order.emailStatus = 'FAILED';
          order.emailError = mailRes?.error || 'Email delivery stubbed or failed';
        }
        await order.save();
      } catch (mErr) {
        order.emailStatus = 'FAILED';
        order.emailError = mErr.message;
        await order.save().catch(() => {});
      }

      return res.json({
        success: true,
        data: order.toObject(),
        vouchers: enriched,
      });
    }

    return res.json({
      success: true,
      data: order.toObject(),
      needsAllocation: true,
      fulfillmentStatus: order.fulfillmentStatus,
      message: 'Payment received successfully. Voucher allocation is pending manual restock or verification.',
      error: allocationError,
      vouchers: [],
    });
  } catch (err) {
    next(err);
  }
};

export const getOrderByIdAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const q = isValidObjectId(id) ? { _id: id } : { orderNo: id };
    const order = await Order.findOne(q).populate('userId', 'name email phone').lean();
    if (!order) return next(new AppError('Order not found', 404));
    const vouchers = await VoucherCode.find({ orderId: order._id })
      .populate('productId', 'name brand provider')
      .lean();
    res.json({ success: true, data: order, vouchers });
  } catch (err) {
    next(err);
  }
};
