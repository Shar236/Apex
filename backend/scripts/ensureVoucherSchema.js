import { Product, VoucherCode, Order } from '../models/index.js';

export const ensureVoucherSchemaConsistency = async () => {
  try {
    // 1. Ensure all Products have a valid uppercase voucherType
    const products = await Product.find({
      $or: [{ voucherType: { $exists: false } }, { voucherType: null }, { voucherType: '' }],
    });

    for (const p of products) {
      const vType = (p.brand || p.provider || 'EXAM').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      await Product.updateOne({ _id: p._id }, { $set: { voucherType: vType } });
    }

    // Build a map of Product ID to voucherType
    const allProducts = await Product.find({}).select('_id voucherType brand provider').lean();
    const productTypeMap = new Map(
      allProducts.map((p) => [
        p._id.toString(),
        p.voucherType || (p.brand || p.provider || 'EXAM').replace(/[^a-zA-Z0-9]/g, '').toUpperCase(),
      ])
    );

    // 2. Ensure all VoucherCodes have voucherType matching their product
    const vouchersNeedingType = await VoucherCode.find({
      $or: [{ voucherType: { $exists: false } }, { voucherType: null }, { voucherType: '' }],
    }).select('_id productId').lean();

    for (const v of vouchersNeedingType) {
      if (v.productId) {
        const vType = productTypeMap.get(v.productId.toString()) || 'EXAM';
        await VoucherCode.updateOne({ _id: v._id }, { $set: { voucherType: vType } });
      }
    }

    // 3. Ensure all Orders have voucherType in items
    const ordersNeedingType = await Order.find({
      'items.voucherType': { $exists: false },
    }).select('_id items').lean();

    for (const o of ordersNeedingType) {
      let updated = false;
      const updatedItems = (o.items || []).map((it) => {
        if (!it.voucherType && it.productId) {
          updated = true;
          return {
            ...it,
            voucherType: productTypeMap.get(it.productId.toString()) || 'EXAM',
          };
        }
        return it;
      });
      if (updated) {
        await Order.updateOne({ _id: o._id }, { $set: { items: updatedItems } });
      }
    }

    console.log('[schema] Voucher schema consistency verified successfully.');
  } catch (err) {
    console.error('[schema:error] Voucher schema consistency check failed:', err.message);
  }
};
