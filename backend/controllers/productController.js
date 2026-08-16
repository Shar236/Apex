import { Product } from '../models/Product.js';
import { VoucherCode } from '../models/VoucherCode.js';
import { AppError } from '../middleware/errorHandler.js';
import { isValidObjectId } from '../config/db.js';
import { escapeRegex } from '../utils/index.js';

const applyAvailability = async (products) => {
  if (!products.length) return products;
  const ids = products.map((p) => p._id);
  const counts = await VoucherCode.aggregate([
    { $match: { productId: { $in: ids }, status: 'AVAILABLE' } },
    { $group: { _id: '$productId', total: { $sum: 1 } } },
  ]);
  const map = Object.fromEntries(counts.map((c) => [c._id.toString(), c.total]));
  return products.map((p) => {
    const raw = typeof p.toObject === 'function' ? p.toObject() : p;
    const avail = map[raw._id.toString()] || 0;
    const threshold = raw.lowStockThreshold || 10;
    const stockStatus = avail > threshold ? 'IN STOCK' : avail > 0 ? 'LOW STOCK' : 'OUT OF STOCK';
    const inStock = avail > 0;
    const savings = Math.max(0, (raw.originalPrice || 0) - (raw.sellingPrice || 0));
    return {
      ...raw,
      availability: avail,
      availableStock: avail,
      inStock,
      stockStatus,
      discountedPrice: raw.sellingPrice,
      savings,
    };
  });
};

export const listProducts = async (req, res, next) => {
  try {
    const { category, brand, provider, featured, search, all } = req.query;
    const filter = all === '1' ? {} : { active: true };
    if (category) filter.category = category;
    if (brand) filter.brand = brand;
    if (provider) filter.provider = provider;
    if (featured) filter.featured = featured === '1';
    if (search) {
      const s = new RegExp(escapeRegex(search), 'i');
      filter.$or = [{ name: s }, { brand: s }, { provider: s }, { category: s }];
    }

    const products = await Product.find(filter).sort({ displayOrder: 1, featured: -1, createdAt: -1 }).lean();
    const hydrated = await applyAvailability(products);
    res.json({ success: true, count: hydrated.length, data: hydrated });
  } catch (err) {
    next(err);
  }
};

export const getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    let product = null;
    if (isValidObjectId(id)) {
      product = await Product.findById(id);
    }
    if (!product) {
      product = await Product.findOne({ slug: String(id).toLowerCase() });
    }
    if (!product || (!product.active && req.user?.role !== 'admin')) {
      return next(new AppError('Product not found', 404, 'NOT_FOUND'));
    }
    const hydrated = (await applyAvailability([product]))[0];
    res.json({ success: true, data: hydrated });
  } catch (err) {
    next(err);
  }
};
