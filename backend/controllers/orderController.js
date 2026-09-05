import { Order } from '../models/Order.js';
import { VoucherCode } from '../models/VoucherCode.js';
import { AppError } from '../middleware/errorHandler.js';
import { isValidObjectId } from '../config/db.js';
import { maskVoucherCode } from '../services/voucherInventory.js';

/**
 * Order READS only.
 *
 * Orders are created in exactly one place — `paymentController.createPaymentOrder`
 * — so that the internal order and the Razorpay order are always created
 * together for the same server-calculated total. The old `POST /api/orders`
 * handler duplicated that pricing logic, had no callers, and produced orders
 * with no `razorpayOrderId` (unpayable) while still consuming the customer's
 * one-time promo-code usage. It was removed rather than kept in sync.
 */

export const getOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const q = isValidObjectId(id) ? { _id: id } : { orderNo: id };
    // Ownership enforced in the query — a non-owner (or wrong id) gets 404,
    // never another customer's order or voucher code.
    const order = await Order.findOne({ ...q, userId: req.user.id })
      .select('-processedEventIds -webhookStatus -paymentSessionId -cashfreeOrderId -__v')
      .lean();
    if (!order) return next(new AppError('Order not found', 404));
    const vouchers = await VoucherCode.find({ orderId: order._id, userId: req.user.id })
      .populate('productId', 'name brand provider')
      .lean();
    res.json({ success: true, data: order, vouchers });
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
    // Raw codes never leave the server here. The admin order panel shows the
    // same mask as inventory and must use the audited /vouchers/:id/reveal
    // endpoint (VOUCHER_VIEW_CODE audit entry) to see a real code — identical
    // to the voucher inventory list.
    const maskedVouchers = vouchers.map((v) => ({
      _id: v._id,
      codeDisplay: maskVoucherCode(v.code),
      isMasked: true,
      status: v.status,
      voucherType: v.voucherType,
      productId: v.productId,
    }));
    res.json({ success: true, data: order, vouchers: maskedVouchers });
  } catch (err) {
    next(err);
  }
};
