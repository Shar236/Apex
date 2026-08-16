import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { VoucherCode } from '../models/VoucherCode.js';
import { Promotion } from '../models/Promotion.js';
import { AuditLog } from '../models/AuditLog.js';
import { AppError } from '../middleware/errorHandler.js';
import { generateOrderNo } from '../utils/index.js';
import { applyPromotion } from '../services/promotions.js';
import { sendOrderConfirmation } from '../services/email.js';
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
    items.push({
      productId: product._id,
      productName: product.name,
      unitPrice: product.sellingPrice,
      originalPrice: product.originalPrice,
      quantity: qty,
    });
  }
  return items;
};

const assignVouchers = async (userId, orderId, items, session) => {
  const assigned = [];
  for (const it of items) {
    const qty = it.quantity;
    for (let i = 0; i < qty; i++) {
      const available = await VoucherCode.findOneAndUpdate(
        {
          productId: it.productId,
          status: 'AVAILABLE',
          expiryDate: { $gt: new Date() },
        },
        {
          $set: {
            status: 'ASSIGNED',
            userId,
            orderId,
            assignedAt: new Date(),
          },
        },
        { new: true, session }
      );
      if (!available) {
        throw new AppError(
          `Insufficient voucher inventory for ${it.productName}.`,
          400,
          'OUT_OF_STOCK'
        );
      }
      assigned.push(available);
    }
  }
  return assigned;
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

      // Server-side price calculation
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
      .populate('productId', 'name brand')
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
    if (order.paymentStatus === 'PAID' && order.orderStatus === 'FULFILLED') {
      const vouchers = await VoucherCode.find({ orderId: order._id, userId: order.userId })
        .populate('productId', 'name brand')
        .lean();
      return res.json({ success: true, data: order.toObject(), vouchers });
    }

    order.paymentStatus = 'PAID';
    order.orderStatus = 'PROCESSING';
    order.paymentReference = paymentReference || order.paymentReference || `SIM-${Date.now()}`;
    order.paymentProvider = provider || 'simulated';
    await order.save();

    let vouchers = [];
    let allocationFailed = false;
    try {
      const session = await Order.startSession();
      try {
        await session.withTransaction(async () => {
          vouchers = await assignVouchers(order.userId, order._id, order.items, session);
        });
      } finally {
        await session.endSession();
      }
    } catch (allocErr) {
      allocationFailed = true;
      order.orderStatus = 'PAYMENT_RECEIVED_NEEDS_ALLOCATION';
      await order.save();

      // Log audit entry for allocation failure
      if (req.user?.role === 'admin' || req.user) {
        await AuditLog.create({
          adminId: req.user._id,
          adminEmail: req.user.email,
          action: 'ORDER_ALLOCATION_FAILED',
          resourceType: 'Order',
          resourceId: order._id.toString(),
          details: {
            orderNo: order.orderNo,
            error: allocErr.message,
          },
        }).catch(() => {});
      }
    }

    if (!allocationFailed) {
      order.orderStatus = 'FULFILLED';
      await order.save();

      const enriched = vouchers.map((v) => {
        const match = order.items.find((it) => it.productId.toString() === v.productId.toString());
        return {
          code: v.code,
          expiryDate: v.expiryDate,
          productName: match?.productName || '',
        };
      });
      await sendOrderConfirmation(req.user, order, enriched).catch(() => {});

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
      message: 'Payment received successfully. Voucher allocation is pending manual restock.',
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
      .populate('productId', 'name brand')
      .lean();
    res.json({ success: true, data: order, vouchers });
  } catch (err) {
    next(err);
  }
};
