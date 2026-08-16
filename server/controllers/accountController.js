import { Order } from '../models/Order.js';
import { VoucherCode } from '../models/VoucherCode.js';
import { AppError } from '../middleware/errorHandler.js';
import { safeUser } from '../utils/index.js';

export const getAccount = async (req, res, next) => {
  try {
    res.json({ success: true, user: safeUser(req.user) });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const user = req.user;
    if (typeof name === 'string') user.name = name.trim();
    if (typeof phone === 'string') user.phone = phone.trim();
    await user.save();
    res.json({ success: true, user: safeUser(user) });
  } catch (err) {
    next(err);
  }
};

export const myOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
};

export const myVouchers = async (req, res, next) => {
  try {
    const vouchers = await VoucherCode.find({ userId: req.user.id })
      .populate('productId', 'name brand category validityMonths')
      .populate('orderId', 'orderNo total orderStatus')
      .sort({ assignedAt: -1 })
      .lean();

    const sanitized = vouchers.map((v) => {
      const productName = v.productId?.name || '';
      const brand = v.productId?.brand || '';
      const validity = v.productId?.validityMonths || 6;
      const orderNo = v.orderId?.orderNo || null;
      const orderStatus = v.orderId?.orderStatus || null;
      const daysLeft = Math.max(
        0,
        Math.ceil((new Date(v.expiryDate) - Date.now()) / (1000 * 60 * 60 * 24))
      );
      let status = v.status;
      if (status === 'ASSIGNED' && daysLeft <= 0) status = 'EXPIRED';
      return {
        id: v._id,
        code: v.code,
        status,
        expiryDate: v.expiryDate,
        assignedAt: v.assignedAt,
        usedAt: v.usedAt || null,
        transferredTo: v.transferredTo || null,
        productName,
        brand,
        validity,
        daysRemaining: daysLeft,
        orderNo,
        orderStatus,
      };
    });
    res.json({ success: true, data: sanitized });
  } catch (err) {
    next(err);
  }
};

export const dashboardStats = async (req, res, next) => {
  try {
    const uid = req.user._id;
    const totalOrders = await Order.countDocuments({ userId: uid, orderStatus: { $nin: ['CANCELLED', 'FAILED'] } });
    const myVouchersAgg = await VoucherCode.aggregate([
      { $match: { userId: uid } },
      {
        $group: {
          _id: null,
          active: { $sum: { $cond: [{ $in: ['$status', ['ASSIGNED', 'SOLD']] }, 1, 0] } },
          used: { $sum: { $cond: [{ $eq: ['$status', 'USED'] }, 1, 0] } },
          expiring: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $in: ['$status', ['ASSIGNED', 'SOLD']] },
                    { $lte: ['$expiryDate', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);
    const savingsArr = await Order.aggregate([
      { $match: { userId: uid, orderStatus: { $in: ['PAID', 'FULFILLED'] } } },
      {
        $group: {
          _id: null,
          totalPaid: { $sum: '$total' },
          totalOriginal: {
            $sum: { $sum: { $map: { input: '$items', in: { $multiply: ['$$this.originalPrice', '$$this.quantity'] } } } },
          },
        },
      },
    ]);
    const v = myVouchersAgg[0] || { active: 0, used: 0, expiring: 0 };
    const s = savingsArr[0] || { totalPaid: 0, totalOriginal: 0 };
    res.json({
      success: true,
      data: {
        totalOrders,
        activeVouchers: v.active,
        usedVouchers: v.used,
        expiringSoon: v.expiring,
        totalSaved: Math.max(0, Math.round((s.totalOriginal || 0) - (s.totalPaid || 0))),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const transferVoucher = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { targetEmail } = req.body;
    if (!targetEmail || !/^\S+@\S+\.\S+$/.test(targetEmail)) {
      return next(new AppError('Valid target email required', 400));
    }
    const voucher = await VoucherCode.findOne({ _id: id, userId: req.user.id });
    if (!voucher) return next(new AppError('Voucher not found', 404));
    if (!['ASSIGNED', 'SOLD'].includes(voucher.status)) {
      return next(new AppError('Voucher not transferable', 400, 'NOT_TRANSFERABLE'));
    }
    voucher.transferredTo = targetEmail.trim();
    voucher.transferredAt = new Date();
    await voucher.save();
    res.json({ success: true, data: voucher });
  } catch (err) {
    next(err);
  }
};

export const markVoucherUsed = async (req, res, next) => {
  try {
    const { id } = req.params;
    const voucher = await VoucherCode.findOne({ _id: id, userId: req.user.id });
    if (!voucher) return next(new AppError('Voucher not found', 404));
    if (!['ASSIGNED', 'SOLD'].includes(voucher.status)) {
      return next(new AppError('Voucher not markable as used', 400));
    }
    voucher.status = 'USED';
    voucher.usedAt = new Date();
    await voucher.save();
    res.json({ success: true, data: voucher });
  } catch (err) {
    next(err);
  }
};
