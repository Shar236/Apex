import { User, Order, Product, VoucherCode, Promotion, AuditLog, Video, Setting, Campaign } from '../models/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { hashPassword } from '../middleware/auth.js';
import { isValidObjectId } from '../config/db.js';
import { escapeRegex } from '../utils/index.js';
import { sendOrderConfirmation } from '../services/email.js';

const PAID_ORDER_STATUSES = ['PAID', 'FULFILLED'];

const toId = (id) => (id ? id.toString() : '');
const emptyVoucherStats = () => ({
  available: 0,
  reserved: 0,
  sold: 0,
  assigned: 0,
  used: 0,
  expired: 0,
  total: 0,
});

const countMap = (rows) =>
  new Map(rows.map((row) => [toId(row._id), row.count || row.total || 0]));

const productMap = (rows) =>
  new Map(rows.map((row) => [toId(row._id), row]));

const searchRegex = (search) => new RegExp(escapeRegex(search), 'i');

const aggregateVoucherStatsByProduct = async (productIds = []) => {
  const ids = productIds.filter(Boolean);
  if (!ids.length) return new Map();

  const rows = await VoucherCode.aggregate([
    { $match: { productId: { $in: ids } } },
    {
      $group: {
        _id: '$productId',
        available: { $sum: { $cond: [{ $eq: ['$status', 'AVAILABLE'] }, 1, 0] } },
        reserved: { $sum: { $cond: [{ $eq: ['$status', 'RESERVED'] }, 1, 0] } },
        sold: { $sum: { $cond: [{ $in: ['$status', ['SOLD', 'ASSIGNED', 'USED']] }, 1, 0] } },
        assigned: { $sum: { $cond: [{ $eq: ['$status', 'ASSIGNED'] }, 1, 0] } },
        used: { $sum: { $cond: [{ $eq: ['$status', 'USED'] }, 1, 0] } },
        expired: { $sum: { $cond: [{ $eq: ['$status', 'EXPIRED'] }, 1, 0] } },
        total: { $sum: 1 },
      },
    },
  ]);

  return new Map(rows.map((row) => [toId(row._id), row]));
};

const getVoucherStats = (statsByProduct, productId) =>
  statsByProduct.get(toId(productId)) || emptyVoucherStats();

const recordAudit = async (req, action, resourceType, resourceId, details) => {
  try {
    if (req?.user) {
      await AuditLog.create({
        adminId: req.user._id,
        adminEmail: req.user.email,
        action,
        resourceType,
        resourceId: resourceId ? String(resourceId) : null,
        details: details || {},
        ipAddress: req.ip || req.headers['x-forwarded-for'] || null,
      });
    }
  } catch (err) {
    console.error('[audit] log error:', err.message);
  }
};

export const dashboardOverview = async (req, res, next) => {
  try {
    const { period = '30d', startDate, endDate } = req.query;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const yesterdayEnd = new Date(todayStart);

    let daysCount = 30;
    if (period === '7d') daysCount = 7;
    if (period === '90d') daysCount = 90;
    if (period === 'today') daysCount = 1;

    const rangeStart = new Date();
    rangeStart.setDate(rangeStart.getDate() - daysCount);

    const [
      totalUsers,
      totalProducts,
      totalVouchers,
      availableVouchers,
      soldVouchers,
      usedVouchers,
      totalOrdersCount,
      pendingOrdersCount,
      activePromosCount,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Product.countDocuments({ active: true }),
      VoucherCode.countDocuments(),
      VoucherCode.countDocuments({ status: 'AVAILABLE' }),
      VoucherCode.countDocuments({ status: { $in: ['SOLD', 'ASSIGNED'] } }),
      VoucherCode.countDocuments({ status: 'USED' }),
      Order.countDocuments({ orderStatus: { $ne: 'CANCELLED' } }),
      Order.countDocuments({
        orderStatus: {
          $in: ['PENDING', 'PAYMENT_PENDING', 'PROCESSING', 'PAYMENT_RECEIVED_NEEDS_ALLOCATION'],
        },
      }),
      Promotion.countDocuments({
        active: true,
        startAt: { $lte: now },
        endAt: { $gte: now },
      }),
    ]);

    // Explicit Net Revenue: SUM(Paid/Fulfilled Total) - SUM(Refunded Orders)
    const paidAggregation = await Order.aggregate([
      { $match: { orderStatus: { $in: PAID_ORDER_STATUSES } } },
      { $group: { _id: null, sum: { $sum: '$total' } } },
    ]);
    const grossRevenue = paidAggregation[0]?.sum || 0;

    const refundAggregation = await Order.aggregate([
      { $match: { orderStatus: 'REFUNDED' } },
      { $group: { _id: null, sum: { $sum: '$total' } } },
    ]);
    const refundedAmount = refundAggregation[0]?.sum || 0;
    const netRevenue = Math.max(0, grossRevenue - refundedAmount);

    // Today's Net Revenue vs Yesterday's Net Revenue
    const todayAgg = await Order.aggregate([
      {
        $match: {
          orderStatus: { $in: PAID_ORDER_STATUSES },
          createdAt: { $gte: todayStart },
        },
      },
      { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } },
    ]);
    const todayRevenue = todayAgg[0]?.total || 0;
    const todayOrders = todayAgg[0]?.count || 0;

    const yesterdayAgg = await Order.aggregate([
      {
        $match: {
          orderStatus: { $in: PAID_ORDER_STATUSES },
          createdAt: { $gte: yesterdayStart, $lt: yesterdayEnd },
        },
      },
      { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } },
    ]);
    const yesterdayRevenue = yesterdayAgg[0]?.total || 0;
    const yesterdayOrders = yesterdayAgg[0]?.count || 0;

    const revenueGrowth =
      yesterdayRevenue > 0
        ? Math.round(((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 1000) / 10
        : todayRevenue > 0
        ? 100
        : 0;

    const ordersGrowth =
      yesterdayOrders > 0
        ? Math.round(((todayOrders - yesterdayOrders) / yesterdayOrders) * 1000) / 10
        : todayOrders > 0
        ? 100
        : 0;

    // Total products sold
    const unitsSoldAgg = await Order.aggregate([
      { $match: { orderStatus: { $in: PAID_ORDER_STATUSES } } },
      { $unwind: '$items' },
      { $group: { _id: null, totalUnits: { $sum: '$items.quantity' } } },
    ]);
    const totalProductsSold = unitsSoldAgg[0]?.totalUnits || 0;

    // Best-Selling Products Table
    const bestSellers = await Order.aggregate([
      { $match: { orderStatus: { $in: PAID_ORDER_STATUSES } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          name: { $first: '$items.productName' },
          unitsSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.unitPrice', '$items.quantity'] } },
        },
      },
      { $sort: { unitsSold: -1 } },
      { $limit: 5 },
    ]);

    // Attach current stock to best sellers without per-row count queries.
    const bestSellerProductIds = bestSellers.map((bs) => bs._id).filter(Boolean);
    const [bestSellerStockByProduct, bestSellerProducts] = await Promise.all([
      aggregateVoucherStatsByProduct(bestSellerProductIds),
      bestSellerProductIds.length
        ? Product.find({ _id: { $in: bestSellerProductIds } }).select('sellingPrice').lean()
        : [],
    ]);
    const bestSellerProductsById = productMap(bestSellerProducts);
    const enrichedBestSellers = bestSellers.map((bs) => {
      const stock = getVoucherStats(bestSellerStockByProduct, bs._id).available;
      const product = bestSellerProductsById.get(toId(bs._id));
      return {
        id: bs._id,
        name: bs.name,
        unitsSold: bs.unitsSold,
        revenue: bs.revenue,
        stock,
        sellingPrice: product?.sellingPrice || 0,
      };
    });

    // Low Stock Alert Products
    const allProducts = await Product.find({ active: true })
      .select('name brand sellingPrice lowStockThreshold')
      .lean();
    const allStockByProduct = await aggregateVoucherStatsByProduct(allProducts.map((p) => p._id));
    const lowStockProducts = allProducts
      .map((p) => ({
        id: p._id,
        name: p.name,
        brand: p.brand,
        availableStock: getVoucherStats(allStockByProduct, p._id).available,
        sellingPrice: p.sellingPrice,
        lowStockThreshold: p.lowStockThreshold || 10,
      }))
      .filter((p) => p.availableStock < p.lowStockThreshold);

    // Time-Series Charts Data (Daily Revenue, Orders, Vouchers Sold, Customers)
    const timeSeriesAgg = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: rangeStart },
          orderStatus: { $in: PAID_ORDER_STATUSES },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const vouchersSoldAgg = await VoucherCode.aggregate([
      {
        $match: {
          assignedAt: { $gte: rangeStart },
          status: { $in: ['SOLD', 'ASSIGNED', 'USED'] },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$assignedAt' } },
          vouchers: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const customersAgg = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: rangeStart },
          role: 'user',
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          customers: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Active & Expiring Promotions
    const expiringSoonPromos = await Promotion.find({
      active: true,
      endAt: { $gte: now, $lte: new Date(Date.now() + 48 * 60 * 60 * 1000) },
    }).lean();

    const activePromotionsList = await Promotion.find({
      active: true,
      startAt: { $lte: now },
      endAt: { $gte: now },
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'name email')
      .lean();

    const failedPaymentsCount = await Order.countDocuments({ paymentStatus: 'FAILED' });
    const refundsCount = await Order.countDocuments({
      $or: [{ orderStatus: 'REFUNDED' }, { paymentStatus: 'REFUNDED' }],
    });

    res.json({
      success: true,
      data: {
        kpi: {
          netRevenue,
          grossRevenue,
          refundedAmount,
          todayRevenue,
          yesterdayRevenue,
          revenueGrowth,
          totalOrders: totalOrdersCount,
          todayOrders,
          yesterdayOrders,
          ordersGrowth,
          totalProductsSold,
          totalCustomers: totalUsers,
          availableVouchers,
          activePromotions: activePromosCount,
          pendingOrders: pendingOrdersCount,
          refunds: refundsCount,
          failedPayments: failedPaymentsCount,
        },
        charts: {
          dailyRevenue: timeSeriesAgg,
          dailyVouchersSold: vouchersSoldAgg,
          dailyNewCustomers: customersAgg,
        },
        tables: {
          bestSellers: enrichedBestSellers,
          lowStockProducts,
          recentOrders,
          activePromotions: activePromotionsList,
        },
        alerts: {
          lowStockCount: lowStockProducts.length,
          failedPaymentsCount,
          pendingOrdersCount,
          expiringPromosCount: expiringSoonPromos.length,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

export const listUsers = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 50 } = req.query;
    const filter = { role: 'user' };
    if (status) filter.status = status;
    if (search) {
      const s = searchRegex(search);
      filter.$or = [{ name: s }, { email: s }, { phone: s }];
    }
    const p = Math.max(1, parseInt(page, 10) || 1);
    const l = Math.min(200, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (p - 1) * l;

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(l).lean(),
      User.countDocuments(filter),
    ]);

    const userIds = users.map((u) => u._id);
    const [orderCountRows, voucherCountRows] = userIds.length
      ? await Promise.all([
          Order.aggregate([
            { $match: { userId: { $in: userIds } } },
            { $group: { _id: '$userId', count: { $sum: 1 } } },
          ]),
          VoucherCode.aggregate([
            { $match: { userId: { $in: userIds } } },
            { $group: { _id: '$userId', count: { $sum: 1 } } },
          ]),
        ])
      : [[], []];

    const orderCounts = countMap(orderCountRows);
    const voucherCounts = countMap(voucherCountRows);
    const withCounts = users.map((u) => ({
      ...u,
      orderCount: orderCounts.get(toId(u._id)) || 0,
      voucherCount: voucherCounts.get(toId(u._id)) || 0,
    }));

    res.json({
      success: true,
      count: withCounts.length,
      total,
      page: p,
      pages: Math.ceil(total / l),
      data: withCounts,
    });
  } catch (err) {
    next(err);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = isValidObjectId(id)
      ? await User.findById(id).lean()
      : await User.findOne({ email: id }).lean();
    if (!user) return next(new AppError('User not found', 404));
    const orders = await Order.find({ userId: user._id }).sort({ createdAt: -1 }).lean();
    const vouchers = await VoucherCode.find({ userId: user._id }).populate('productId', 'name brand').lean();
    res.json({ success: true, data: user, orders, vouchers });
  } catch (err) {
    next(err);
  }
};

export const setUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['active', 'disabled'].includes(status)) return next(new AppError('Invalid status', 400));
    const user = await User.findByIdAndUpdate(id, { status }, { new: true }).lean();
    if (!user) return next(new AppError('User not found', 404));

    await recordAudit(req, 'CUSTOMER_STATUS_CHANGED', 'User', user._id, {
      userEmail: user.email,
      newStatus: status,
    });

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

export const listAdminProducts = async (req, res, next) => {
  try {
    const { search, status, category, provider, sort } = req.query;
    const filter = {};
    if (status === 'active') filter.active = true;
    if (status === 'inactive') filter.active = false;
    if (status === 'featured') filter.featured = true;
    if (category) filter.category = category;
    if (provider) filter.provider = provider;

    if (search) {
      const s = searchRegex(search);
      filter.$or = [{ name: s }, { provider: s }, { brand: s }, { category: s }, { slug: s }];
    }

    const sortOption = sort === 'displayOrder' ? { displayOrder: 1, createdAt: -1 } : { createdAt: -1 };
    const rawProducts = await Product.find(filter).sort(sortOption).lean();
    const stockByProduct = await aggregateVoucherStatsByProduct(rawProducts.map((p) => p._id));

    const products = rawProducts.map((p) => {
      const stock = getVoucherStats(stockByProduct, p._id);
      const { available, reserved, sold, total } = stock;
      const threshold = p.lowStockThreshold || 10;
      const stockStatus = available > threshold ? 'IN STOCK' : available > 0 ? 'LOW STOCK' : 'OUT OF STOCK';
      const inStock = available > 0;

      return {
        ...p,
        availableVouchers: available,
        reservedVouchers: reserved,
        soldVouchers: sold,
        totalVouchers: total,
        stockStatus,
        inStock,
      };
    });

    let filtered = products;
    if (status === 'out_of_stock') {
      filtered = products.filter((p) => p.availableVouchers === 0);
    } else if (status === 'low_stock') {
      filtered = products.filter((p) => p.availableVouchers > 0 && p.availableVouchers <= (p.lowStockThreshold || 10));
    }

    const allProducts = await Product.find().select('_id active featured lowStockThreshold').lean();
    const allStockByProduct = await aggregateVoucherStatsByProduct(allProducts.map((p) => p._id));
    let totalCount = allProducts.length;
    let activeCount = 0;
    let inactiveCount = 0;
    let outOfStockCount = 0;
    let lowStockCount = 0;
    let featuredCount = 0;

    for (const p of allProducts) {
      if (p.active) activeCount++;
      else inactiveCount++;
      if (p.featured) featuredCount++;
      const avail = getVoucherStats(allStockByProduct, p._id).available;
      if (avail === 0) outOfStockCount++;
      else if (avail <= (p.lowStockThreshold || 10)) lowStockCount++;
    }

    res.json({
      success: true,
      count: filtered.length,
      kpis: {
        totalProducts: totalCount,
        activeProducts: activeCount,
        inactiveProducts: inactiveCount,
        outOfStockProducts: outOfStockCount,
        lowStockProducts: lowStockCount,
        featuredProducts: featuredCount,
      },
      data: filtered,
    });
  } catch (err) {
    next(err);
  }
};

export const getAdminProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = isValidObjectId(id)
      ? await Product.findById(id).lean()
      : await Product.findOne({ slug: String(id).toLowerCase() }).lean();
    if (!product) return next(new AppError('Product not found', 404));

    const stockByProduct = await aggregateVoucherStatsByProduct([product._id]);
    const { available, reserved, sold, total } = getVoucherStats(stockByProduct, product._id);

    res.json({
      success: true,
      data: {
        ...product,
        availableVouchers: available,
        reservedVouchers: reserved,
        soldVouchers: sold,
        totalVouchers: total,
        stockStatus: available > (product.lowStockThreshold || 10) ? 'IN STOCK' : available > 0 ? 'LOW STOCK' : 'OUT OF STOCK',
        inStock: available > 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const { originalPrice, sellingPrice, name, provider, brand } = req.body;
    if (sellingPrice != null && originalPrice != null && Number(sellingPrice) > Number(originalPrice)) {
      return next(new AppError('Selling price cannot be greater than original price', 400));
    }
    const payload = {
      ...req.body,
      provider: provider || brand || 'Pearson',
      brand: brand || provider || 'Pearson PTE',
    };
    const product = new Product(payload);
    await product.save();

    await recordAudit(req, 'PRODUCT_CREATED', 'Product', product._id, {
      name: product.name,
      sellingPrice: product.sellingPrice,
      originalPrice: product.originalPrice,
    });

    res.status(201).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const oldProduct = await Product.findById(id).lean();
    if (!oldProduct) return next(new AppError('Product not found', 404));

    const origPrice = req.body.originalPrice !== undefined ? Number(req.body.originalPrice) : oldProduct.originalPrice;
    const sellPrice = req.body.sellingPrice !== undefined ? Number(req.body.sellingPrice) : oldProduct.sellingPrice;

    if (sellPrice > origPrice) {
      return next(new AppError('Selling price cannot exceed original price', 400));
    }

    const product = await Product.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    const diffs = {};
    if (oldProduct.sellingPrice !== product.sellingPrice) {
      diffs.oldPrice = oldProduct.sellingPrice;
      diffs.newPrice = product.sellingPrice;
    }
    if (oldProduct.active !== product.active) {
      diffs.oldActive = oldProduct.active;
      diffs.newActive = product.active;
    }

    await recordAudit(req, 'PRODUCT_UPDATED', 'Product', product._id, {
      name: product.name,
      diffs,
    });

    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

export const quickUpdatePrice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { sellingPrice, originalPrice } = req.body;
    const product = await Product.findById(id);
    if (!product) return next(new AppError('Product not found', 404));

    const orig = originalPrice != null ? Number(originalPrice) : product.originalPrice;
    const sell = sellingPrice != null ? Number(sellingPrice) : product.sellingPrice;

    if (sell < 0 || orig < 0) {
      return next(new AppError('Prices must be non-negative', 400));
    }
    if (sell > orig) {
      return next(new AppError('Selling price cannot exceed original price', 400));
    }

    const oldPrice = product.sellingPrice;
    product.originalPrice = orig;
    product.sellingPrice = sell;
    await product.save();

    await recordAudit(req, 'PRICE_UPDATED', 'Product', product._id, {
      name: product.name,
      oldPrice,
      newPrice: sell,
      originalPrice: orig,
    });

    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

export const quickUpdateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { active } = req.body;
    const product = await Product.findByIdAndUpdate(id, { active: !!active }, { new: true });
    if (!product) return next(new AppError('Product not found', 404));

    await recordAudit(req, 'PRODUCT_STATUS_CHANGED', 'Product', product._id, {
      name: product.name,
      active: product.active,
    });

    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

export const quickUpdateFeatured = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { featured } = req.body;
    const product = await Product.findByIdAndUpdate(id, { featured: !!featured }, { new: true });
    if (!product) return next(new AppError('Product not found', 404));

    await recordAudit(req, 'PRODUCT_FEATURED_CHANGED', 'Product', product._id, {
      name: product.name,
      featured: product.featured,
    });

    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return next(new AppError('Product not found', 404));

    const [hasOrders, hasVouchers] = await Promise.all([
      Order.exists({ 'items.productId': id }),
      VoucherCode.exists({ productId: id }),
    ]);

    if (hasOrders || hasVouchers) {
      product.active = false;
      await product.save();

      await recordAudit(req, 'PRODUCT_DEACTIVATED', 'Product', product._id, {
        name: product.name,
        reason: 'Preserved order/voucher historical records',
      });

      return res.json({
        success: true,
        deactivated: true,
        deleted: false,
        message: 'Product has historical orders/vouchers. Soft deactivated to preserve historical purchase data.',
        data: product,
      });
    }

    await Product.findByIdAndDelete(id);

    await recordAudit(req, 'PRODUCT_DELETED', 'Product', id, { name: product.name });

    res.json({ success: true, deleted: true, message: 'Product permanently deleted.' });
  } catch (err) {
    next(err);
  }
};

export const getProductInventory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).lean();
    if (!product) return next(new AppError('Product not found', 404));

    const stockByProduct = await aggregateVoucherStatsByProduct([product._id]);
    const { available, reserved, sold, assigned, used, expired, total } =
      getVoucherStats(stockByProduct, product._id);

    const recentCodes = await VoucherCode.find({ productId: id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    res.json({
      success: true,
      data: {
        product: { id: product._id, name: product.name, brand: product.brand },
        counts: { available, reserved, sold, assigned, used, expired, total },
        codes: recentCodes,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const listVouchers = async (req, res, next) => {
  try {
    const { status, productId, search, page = 1, limit = 100 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (productId) filter.productId = productId;
    if (search) filter.code = searchRegex(search);

    const p = Math.max(1, parseInt(page, 10) || 1);
    const l = Math.min(500, Math.max(1, parseInt(limit, 10) || 100));
    const skip = (p - 1) * l;

    const [vouchers, total] = await Promise.all([
      VoucherCode.find(filter)
        .populate('productId', 'name brand')
        .populate('userId', 'name email')
        .populate('orderId', 'orderNo total orderStatus')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(l),
      VoucherCode.countDocuments(filter),
    ]);

    res.json({ success: true, count: vouchers.length, total, page: p, pages: Math.ceil(total / l), data: vouchers });
  } catch (err) {
    next(err);
  }
};

export const addVouchers = async (req, res, next) => {
  try {
    const { productId, codes, expiryDate } = req.body || {};
    if (!productId || !Array.isArray(codes) || codes.length === 0 || !expiryDate) {
      return next(new AppError('productId, codes[], and expiryDate required', 400));
    }
    const docs = codes
      .filter((c) => typeof c === 'string' && c.trim().length > 0)
      .map((c) => ({
        code: c.trim().toUpperCase(),
        productId,
        status: 'AVAILABLE',
        expiryDate,
      }));

    const inserted = await VoucherCode.insertMany(docs, { ordered: false }).catch((err) => {
      return err.insertedDocs || [];
    });

    await recordAudit(req, 'VOUCHERS_ADDED', 'VoucherCode', productId, {
      countAdded: inserted.length || 0,
      expiryDate,
    });

    res.status(201).json({ success: true, added: inserted.length || 0 });
  } catch (err) {
    next(err);
  }
};

export const updateVoucher = async (req, res, next) => {
  try {
    const { id } = req.params;
    const voucher = await VoucherCode.findByIdAndUpdate(id, req.body, { new: true });
    if (!voucher) return next(new AppError('Voucher not found', 404));

    await recordAudit(req, 'VOUCHER_UPDATED', 'VoucherCode', voucher._id, {
      code: voucher.code,
      status: voucher.status,
    });

    res.json({ success: true, data: voucher });
  } catch (err) {
    next(err);
  }
};

export const listOrdersAdmin = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 100 } = req.query;
    const filter = {};
    if (status) filter.orderStatus = status;
    if (search) {
      const s = searchRegex(search);
      filter.$or = [{ orderNo: s }];
    }
    const p = Math.max(1, parseInt(page, 10) || 1);
    const l = Math.min(200, Math.max(1, parseInt(limit, 10) || 100));
    const skip = (p - 1) * l;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('userId', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(l)
        .lean(),
      Order.countDocuments(filter),
    ]);

    res.json({ success: true, count: orders.length, total, page: p, pages: Math.ceil(total / l), data: orders });
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { orderStatus, paymentStatus } = req.body;
    const order = await Order.findById(id);
    if (!order) return next(new AppError('Order not found', 404));
    const oldStatus = order.orderStatus;
    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    await order.save();

    await recordAudit(req, 'ORDER_STATUS_CHANGED', 'Order', order._id, {
      orderNo: order.orderNo,
      oldStatus,
      newOrderStatus: order.orderStatus,
      newPaymentStatus: order.paymentStatus,
    });

    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

export const listPromotions = async (_req, res, next) => {
  try {
    const promos = await Promotion.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, count: promos.length, data: promos });
  } catch (err) {
    next(err);
  }
};

export const createPromotion = async (req, res, next) => {
  try {
    const promo = new Promotion(req.body);
    await promo.save();

    await recordAudit(req, 'PROMOTION_CREATED', 'Promotion', promo._id, {
      code: promo.code,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
    });

    res.status(201).json({ success: true, data: promo });
  } catch (err) {
    next(err);
  }
};

export const updatePromotion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const promo = await Promotion.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!promo) return next(new AppError('Promotion not found', 404));

    await recordAudit(req, 'PROMOTION_UPDATED', 'Promotion', promo._id, {
      code: promo.code,
      active: promo.active,
    });

    res.json({ success: true, data: promo });
  } catch (err) {
    next(err);
  }
};

export const deletePromotion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const promo = await Promotion.findByIdAndDelete(id);
    if (!promo) return next(new AppError('Promotion not found', 404));

    await recordAudit(req, 'PROMOTION_DELETED', 'Promotion', id, { code: promo.code });

    res.json({ success: true, deleted: true });
  } catch (err) {
    next(err);
  }
};

export const listAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, action, resourceType } = req.query;
    const filter = {};
    if (action) filter.action = action;
    if (resourceType) filter.resourceType = resourceType;

    const p = Math.max(1, parseInt(page, 10) || 1);
    const l = Math.min(200, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (p - 1) * l;

    const [logs, total] = await Promise.all([
      AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(l).lean(),
      AuditLog.countDocuments(filter),
    ]);

    res.json({ success: true, count: logs.length, total, page: p, pages: Math.ceil(total / l), data: logs });
  } catch (err) {
    next(err);
  }
};

export const exportCSV = async (req, res, next) => {
  try {
    const { resource } = req.params;
    const { unmasked = false } = req.query;

    let csvContent = '';
    let filename = `apex_${resource}_export.csv`;

    if (resource === 'orders') {
      const orders = await Order.find().populate('userId', 'name email').sort({ createdAt: -1 }).lean();
      const headers = ['Order No', 'Customer Name', 'Customer Email', 'Subtotal', 'Discount', 'Total', 'Payment Status', 'Order Status', 'Created At'];
      const rows = orders.map((o) => [
        o.orderNo,
        `"${o.userId?.name || 'Guest'}"`,
        `"${o.userId?.email || o.customerSnapshot?.email || ''}"`,
        o.subtotal,
        o.discountAmount,
        o.total,
        o.paymentStatus,
        o.orderStatus,
        new Date(o.createdAt).toISOString(),
      ]);
      csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    } else if (resource === 'customers') {
      const users = await User.find({ role: 'user' }).sort({ createdAt: -1 }).lean();
      const headers = ['User ID', 'Name', 'Email', 'Phone', 'Status', 'Created At'];
      const rows = users.map((u) => [
        u._id,
        `"${u.name}"`,
        `"${u.email}"`,
        `"${u.phone || ''}"`,
        u.status,
        new Date(u.createdAt).toISOString(),
      ]);
      csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    } else if (resource === 'vouchers') {
      const vouchers = await VoucherCode.find().populate('productId', 'name').populate('userId', 'email').sort({ createdAt: -1 }).lean();
      const headers = ['Voucher Code', 'Product Name', 'Status', 'Assigned Email', 'Expiry Date', 'Assigned At'];
      const rows = vouchers.map((v) => {
        let codeDisplay = v.code;
        if (!unmasked || unmasked !== 'true') {
          codeDisplay = `${v.code.slice(0, 4)}-XXXX-XXXX-XXXX`;
        }
        return [
          codeDisplay,
          `"${v.productId?.name || ''}"`,
          v.status,
          `"${v.userId?.email || ''}"`,
          new Date(v.expiryDate).toISOString().slice(0, 10),
          v.assignedAt ? new Date(v.assignedAt).toISOString() : '',
        ];
      });
      csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    } else if (resource === 'sales') {
      const sales = await Order.aggregate([
        { $match: { orderStatus: { $in: ['PAID', 'FULFILLED', 'REFUNDED'] } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            grossSales: { $sum: '$subtotal' },
            discounts: { $sum: '$discountAmount' },
            netTotal: { $sum: '$total' },
            ordersCount: { $sum: 1 },
          },
        },
        { $sort: { _id: -1 } },
      ]);
      const headers = ['Date', 'Orders Count', 'Gross Subtotal', 'Total Discounts', 'Net Revenue'];
      const rows = sales.map((s) => [s._id, s.ordersCount, s.grossSales, s.discounts, s.netTotal]);
      csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    } else {
      return next(new AppError('Invalid export resource type', 400));
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csvContent);
  } catch (err) {
    next(err);
  }
};

export const seedAdmin = async () => {
  const { config } = await import('../config/index.js');

  try {
    const productsToFix = await Product.find({
      $or: [{ provider: { $exists: false } }, { provider: '' }, { provider: null }],
    });
    for (const p of productsToFix) {
      p.provider = p.brand || 'Duolingo';
      await p.save();
    }
  } catch (e) {
    // Ignore error if schema validation issue on old docs
  }

  const exists = await User.findOne({ role: 'admin' });
  if (exists) return exists;
  const admin = new User({
    name: config.admin.name,
    email: config.admin.email,
    passwordHash: await hashPassword(config.admin.password),
    role: 'admin',
    status: 'active',
  });
  await admin.save();
  console.log(`[seed] admin created: ${admin.email}`);
  return admin;
};

const formatYoutubeEmbed = (url) => {
  if (!url) return '';
  if (url.includes('embed/')) return url;
  const ytReg = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = String(url).match(ytReg);
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=0`;
  }
  return url;
};

export const listAdminVideos = async (req, res, next) => {
  try {
    const { search, category, status } = req.query;
    const filter = {};
    if (status === 'published') filter.published = true;
    if (status === 'draft') filter.published = false;
    if (status === 'featured') filter.featured = true;
    if (category) filter.category = category;

    if (search) {
      const s = searchRegex(search);
      filter.$or = [{ title: s }, { description: s }, { category: s }];
    }

    const videos = await Video.find(filter).sort({ displayOrder: 1, createdAt: -1 }).lean();
    const allVideos = await Video.find().lean();

    let totalVideos = allVideos.length;
    let publishedVideos = 0;
    let draftVideos = 0;
    let featuredVideos = 0;
    let totalViews = 0;

    for (const v of allVideos) {
      if (v.published) publishedVideos++;
      else draftVideos++;
      if (v.featured) featuredVideos++;
      totalViews += v.viewsCount || 0;
    }

    const [sectionSetting, modeSetting] = await Promise.all([
      Setting.findOne({ key: 'videoSectionEnabled' }).lean(),
      Setting.findOne({ key: 'movieReelModeEnabled' }).lean(),
    ]);

    res.json({
      success: true,
      count: videos.length,
      kpis: {
        totalVideos,
        publishedVideos,
        draftVideos,
        featuredVideos,
        totalViews,
      },
      settings: {
        videoSectionEnabled: sectionSetting?.value !== false,
        movieReelModeEnabled: modeSetting?.value !== false,
      },
      data: videos,
    });
  } catch (err) {
    next(err);
  }
};

export const createVideo = async (req, res, next) => {
  try {
    const { title, videoUrl, youtubeEmbed, featured } = req.body;
    if (!title || !videoUrl) {
      return next(new AppError('Video title and videoUrl are required', 400));
    }

    if (featured) {
      await Video.updateMany({}, { featured: false });
    }

    const payload = {
      ...req.body,
      youtubeEmbed: youtubeEmbed ? formatYoutubeEmbed(youtubeEmbed) : formatYoutubeEmbed(videoUrl),
      featured: !!featured,
    };

    const video = new Video(payload);
    await video.save();

    await recordAudit(req, 'VIDEO_CREATED', 'Video', video._id, {
      title: video.title,
      category: video.category,
      featured: video.featured,
      published: video.published,
    });

    res.status(201).json({ success: true, data: video });
  } catch (err) {
    next(err);
  }
};

export const updateVideo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const oldVideo = await Video.findById(id).lean();
    if (!oldVideo) return next(new AppError('Video not found', 404));

    if (req.body.featured) {
      await Video.updateMany({ _id: { $ne: id } }, { featured: false });
    }

    const payload = { ...req.body };
    if (payload.videoUrl || payload.youtubeEmbed) {
      payload.youtubeEmbed = formatYoutubeEmbed(payload.youtubeEmbed || payload.videoUrl);
    }

    const video = await Video.findByIdAndUpdate(id, payload, { new: true, runValidators: true });

    await recordAudit(req, 'VIDEO_UPDATED', 'Video', video._id, {
      title: video.title,
      diffs: {
        oldFeatured: oldVideo.featured,
        newFeatured: video.featured,
        oldPublished: oldVideo.published,
        newPublished: video.published,
      },
    });

    res.json({ success: true, data: video });
  } catch (err) {
    next(err);
  }
};

export const quickToggleFeaturedVideo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { featured } = req.body;

    if (featured) {
      await Video.updateMany({ _id: { $ne: id } }, { featured: false });
    }

    const video = await Video.findByIdAndUpdate(id, { featured: !!featured }, { new: true });
    if (!video) return next(new AppError('Video not found', 404));

    await recordAudit(req, 'VIDEO_FEATURED_CHANGED', 'Video', video._id, {
      title: video.title,
      featured: video.featured,
    });

    res.json({ success: true, data: video });
  } catch (err) {
    next(err);
  }
};

export const quickTogglePublishVideo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { published } = req.body;
    const video = await Video.findByIdAndUpdate(id, { published: !!published }, { new: true });
    if (!video) return next(new AppError('Video not found', 404));

    await recordAudit(req, 'VIDEO_PUBLISH_CHANGED', 'Video', video._id, {
      title: video.title,
      published: video.published,
    });

    res.json({ success: true, data: video });
  } catch (err) {
    next(err);
  }
};

export const deleteVideo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const video = await Video.findByIdAndDelete(id);
    if (!video) return next(new AppError('Video not found', 404));

    await recordAudit(req, 'VIDEO_DELETED', 'Video', id, { title: video.title });

    res.json({ success: true, deleted: true, message: 'Video permanently deleted.' });
  } catch (err) {
    next(err);
  }
};

export const updateVideoSettings = async (req, res, next) => {
  try {
    const { videoSectionEnabled, movieReelModeEnabled } = req.body;

    if (videoSectionEnabled !== undefined) {
      await Setting.findOneAndUpdate(
        { key: 'videoSectionEnabled' },
        { key: 'videoSectionEnabled', value: !!videoSectionEnabled },
        { upsert: true, new: true }
      );
    }

    if (movieReelModeEnabled !== undefined) {
      await Setting.findOneAndUpdate(
        { key: 'movieReelModeEnabled' },
        { key: 'movieReelModeEnabled', value: !!movieReelModeEnabled },
        { upsert: true, new: true }
      );
    }

    await recordAudit(req, 'VIDEO_SETTINGS_UPDATED', 'Setting', null, {
      videoSectionEnabled,
      movieReelModeEnabled,
    });

    res.json({
      success: true,
      message: 'Video settings updated successfully.',
      settings: {
        videoSectionEnabled: !!videoSectionEnabled,
        movieReelModeEnabled: !!movieReelModeEnabled,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Handle Media File Upload (Video & Thumbnail)
 * POST /api/admin/videos/upload
 */
export const uploadMedia = async (req, res, next) => {
  try {
    const files = req.files || {};
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    let videoUrl = '';
    let thumbnailUrl = '';

    if (files.video && files.video[0]) {
      videoUrl = `${baseUrl}/uploads/videos/${files.video[0].filename}`;
    }
    if (files.thumbnail && files.thumbnail[0]) {
      thumbnailUrl = `${baseUrl}/uploads/thumbnails/${files.thumbnail[0].filename}`;
    }

    if (!videoUrl && !thumbnailUrl) {
      return next(new AppError('No valid file uploaded', 400));
    }

    res.json({
      success: true,
      message: 'Media uploaded successfully',
      videoUrl,
      thumbnailUrl,
      fileInfo: {
        video: files.video ? files.video[0] : null,
        thumbnail: files.thumbnail ? files.thumbnail[0] : null,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const resendOrderEmail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const q = isValidObjectId(id) ? { _id: id } : { orderNo: id };
    const order = await Order.findOne(q).populate('userId');

    if (!order) return next(new AppError('Order not found', 404));

    if (order.paymentStatus !== 'PAID') {
      return next(new AppError('Cannot send confirmation email for unpaid order', 400));
    }

    const vouchers = await VoucherCode.find({ orderId: order._id })
      .populate('productId', 'name brand')
      .lean();

    if (!vouchers || vouchers.length === 0) {
      return next(
        new AppError(
          'No voucher codes have been assigned to this order yet. Please allocate a voucher first.',
          400
        )
      );
    }

    const enriched = vouchers.map((v) => {
      const match = order.items.find(
        (it) => it.productId.toString() === (v.productId?._id || v.productId).toString()
      );
      return {
        code: v.code,
        expiryDate: v.expiryDate,
        productName: match?.productName || v.productId?.name || 'Exam Voucher',
      };
    });

    const targetUser = order.userId || {
      name: order.customerSnapshot?.name || order.billingDetails?.name || 'Customer',
      email: order.customerSnapshot?.email || order.billingDetails?.email,
    };

    const mailRes = await sendOrderConfirmation(targetUser, order, enriched);

    if (mailRes && mailRes.sent !== false) {
      order.emailStatus = 'SENT';
      order.emailSentAt = new Date();
      order.emailError = null;
    } else {
      order.emailStatus = 'FAILED';
      order.emailError = mailRes?.error || 'Email delivery stubbed or failed';
    }
    await order.save();

    await recordAudit(req, 'ADMIN_EMAIL_RESENT', 'Order', order._id, {
      orderNo: order.orderNo,
      emailStatus: order.emailStatus,
      recipient: targetUser.email,
    });

    res.json({
      success: true,
      emailStatus: order.emailStatus,
      message:
        order.emailStatus === 'SENT'
          ? `Confirmation email resent successfully to ${targetUser.email}.`
          : `Attempted resend to ${targetUser.email}, status: ${order.emailStatus}.`,
    });
  } catch (err) {
    next(err);
  }
};

export const listCampaigns = async (req, res, next) => {
  try {
    const campaigns = await Campaign.find()
      .sort({ priority: -1, createdAt: -1 })
      .populate('applicableProducts', 'name brand sellingPrice originalPrice')
      .lean();
    res.json({ success: true, count: campaigns.length, data: campaigns });
  } catch (err) {
    next(err);
  }
};

export const createCampaign = async (req, res, next) => {
  try {
    const body = req.body || {};
    if (!body.name || !body.startDate || !body.endDate || body.discountValue === undefined) {
      return next(new AppError('Name, start date, end date, and discount value are required', 400));
    }

    const campaign = new Campaign({
      ...body,
      createdBy: req.user._id,
    });
    await campaign.save();

    await recordAudit(req, 'CAMPAIGN_CREATED', 'Campaign', campaign._id, {
      name: campaign.name,
      status: campaign.status,
      discountValue: campaign.discountValue,
    });

    res.status(201).json({ success: true, data: campaign.toObject() });
  } catch (err) {
    next(err);
  }
};

export const updateCampaign = async (req, res, next) => {
  try {
    const { id } = req.params;
    const campaign = await Campaign.findById(id);
    if (!campaign) return next(new AppError('Campaign not found', 404));

    Object.assign(campaign, req.body);
    await campaign.save();

    await recordAudit(req, 'CAMPAIGN_UPDATED', 'Campaign', campaign._id, {
      name: campaign.name,
      status: campaign.status,
    });

    res.json({ success: true, data: campaign.toObject() });
  } catch (err) {
    next(err);
  }
};

export const deleteCampaign = async (req, res, next) => {
  try {
    const { id } = req.params;
    const campaign = await Campaign.findByIdAndDelete(id);
    if (!campaign) return next(new AppError('Campaign not found', 404));

    await recordAudit(req, 'CAMPAIGN_DELETED', 'Campaign', id, { name: campaign.name });

    res.json({ success: true, message: 'Campaign deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

export const toggleCampaignStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const campaign = await Campaign.findById(id);
    if (!campaign) return next(new AppError('Campaign not found', 404));

    campaign.status = campaign.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    await campaign.save();

    await recordAudit(req, 'CAMPAIGN_STATUS_TOGGLED', 'Campaign', campaign._id, {
      name: campaign.name,
      status: campaign.status,
    });

    res.json({ success: true, status: campaign.status, data: campaign.toObject() });
  } catch (err) {
    next(err);
  }
};

export const getWebsiteSettings = async (req, res, next) => {
  try {
    const heroSettings = (await Setting.findOne({ key: 'heroSettings' }))?.value || null;
    const announcementSettings = (await Setting.findOne({ key: 'announcementSettings' }))?.value || null;
    const benefitCards = (await Setting.findOne({ key: 'benefitCards' }))?.value || null;
    const footerSettings = (await Setting.findOne({ key: 'footerSettings' }))?.value || null;

    res.json({
      success: true,
      data: {
        heroSettings,
        announcementSettings,
        benefitCards,
        footerSettings,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const updateWebsiteSettings = async (req, res, next) => {
  try {
    const { heroSettings, announcementSettings, benefitCards, footerSettings } = req.body;

    if (heroSettings) {
      await Setting.findOneAndUpdate({ key: 'heroSettings' }, { key: 'heroSettings', value: heroSettings }, { upsert: true });
    }
    if (announcementSettings) {
      await Setting.findOneAndUpdate({ key: 'announcementSettings' }, { key: 'announcementSettings', value: announcementSettings }, { upsert: true });
    }
    if (benefitCards) {
      await Setting.findOneAndUpdate({ key: 'benefitCards' }, { key: 'benefitCards', value: benefitCards }, { upsert: true });
    }
    if (footerSettings) {
      await Setting.findOneAndUpdate({ key: 'footerSettings' }, { key: 'footerSettings', value: footerSettings }, { upsert: true });
    }

    await recordAudit(req, 'WEBSITE_SETTINGS_UPDATED', 'Setting', null, {
      updatedKeys: Object.keys(req.body),
    });

    res.json({ success: true, message: 'Website settings updated successfully.' });
  } catch (err) {
    next(err);
  }
};
