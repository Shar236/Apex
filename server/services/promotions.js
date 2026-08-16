import { Promotion } from '../models/Promotion.js';
import { Product } from '../models/Product.js';
import { AppError } from '../middleware/errorHandler.js';

const isIncluded = async (promo, productIds) => {
  const hasProducts = Array.isArray(promo.applicableProducts) && promo.applicableProducts.length > 0;
  const hasCategories = Array.isArray(promo.applicableCategories) && promo.applicableCategories.length > 0;

  // Storewide if no restriction set
  if (!hasProducts && !hasCategories) return true;

  if (hasProducts && productIds.length > 0) {
    const matched = productIds.some((pid) =>
      promo.applicableProducts.some((p) => p.toString() === String(pid))
    );
    if (matched) return true;
  }

  if (hasCategories && productIds.length > 0) {
    const products = await Product.find({ _id: { $in: productIds } }).select('category brand');
    const matchedCategory = products.some((prod) =>
      promo.applicableCategories.some(
        (cat) =>
          cat.toLowerCase() === prod.category?.toLowerCase() ||
          cat.toLowerCase() === prod.brand?.toLowerCase()
      )
    );
    if (matchedCategory) return true;
  }

  return false;
};

export const applyPromotion = async (code, subtotal, userId, productIds = []) => {
  if (!code) return { valid: false, discount: 0, reason: 'No code provided' };
  const promo = await Promotion.findOne({
    code: String(code).trim().toUpperCase(),
    active: true,
  });
  if (!promo) return { valid: false, discount: 0, reason: 'Invalid or inactive promo code' };
  const now = new Date();
  if (promo.startAt > now) return { valid: false, discount: 0, reason: 'Promotion has not started yet' };
  if (promo.endAt < now) return { valid: false, discount: 0, reason: 'Promotion has expired' };
  if (promo.usageLimit != null && promo.usageCount >= promo.usageLimit) {
    return { valid: false, discount: 0, reason: 'Promotion maximum usage limit reached' };
  }
  if (promo.perUserLimit != null && userId) {
    const usesByUser = promo.usedBy.filter((u) => u.toString() === userId.toString()).length;
    if (usesByUser >= promo.perUserLimit) {
      return { valid: false, discount: 0, reason: 'You have reached the limit for this offer' };
    }
  }
  if (promo.firstOrderOnly && userId) {
    const { Order } = await import('../models/Order.js');
    const hadOrder = await Order.exists({ userId, orderStatus: { $in: ['PAID', 'FULFILLED'] } });
    if (hadOrder) return { valid: false, discount: 0, reason: 'Code valid for first order only' };
  }
  if (subtotal < promo.minimumOrderAmount) {
    return {
      valid: false,
      discount: 0,
      reason: `Minimum order amount of ₹${promo.minimumOrderAmount} required`,
    };
  }

  const included = await isIncluded(promo, productIds);
  if (!included) {
    return { valid: false, discount: 0, reason: 'Code not applicable to selected products' };
  }

  let discount = 0;
  if (promo.discountType === 'percentage') {
    discount = Math.round(subtotal * promo.discountValue) / 100;
    if (promo.maximumDiscount != null) discount = Math.min(discount, promo.maximumDiscount);
  } else if (promo.discountType === 'fixed') {
    discount = promo.discountValue;
  }
  discount = Math.max(0, Math.min(subtotal, Math.round(discount)));
  return { valid: true, discount, promotion: promo };
};

export const validatePromotionEndpoint = async (req, res, next) => {
  try {
    const { code, subtotal, productIds } = req.body;
    if (subtotal == null) return next(new AppError('subtotal required', 400));
    const result = await applyPromotion(
      code,
      Number(subtotal),
      req.user?.id,
      Array.isArray(productIds) ? productIds : []
    );
    res.json({ success: result.valid, ...result });
  } catch (err) {
    next(err);
  }
};
