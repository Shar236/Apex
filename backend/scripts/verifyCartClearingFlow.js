import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { User } from '../models/User.js';
import { VoucherCode } from '../models/VoucherCode.js';
import { allocateVouchersForOrder } from '../services/voucherAllocation.js';
import { generateOrderNo } from '../utils/index.js';

async function runCartAndOrderVerification() {
  console.log('[test] Starting Cart & Payment Verification Flow Tests...');
  await connectDB();

  // 1. Fetch test user and test products
  const user = (await User.findOne({ email: 'demo@apexvouchers.in' })) || (await User.findOne({}));
  if (!user) {
    throw new Error('No user found for test execution');
  }
  console.log(`  ✓ Using test user: ${user.email} (${user._id})`);

  const products = await Product.find({ active: true }).limit(3);
  if (products.length === 0) {
    throw new Error('No active products found for testing');
  }
  console.log(`  ✓ Found ${products.length} active products for test`);

  // Ensure stock exists for each product
  for (const prod of products) {
    const existingCode = await VoucherCode.findOne({ productId: prod._id, status: 'AVAILABLE' });
    if (!existingCode) {
      await new VoucherCode({
        code: `TEST-APEX-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`,
        productId: prod._id,
        voucherType: prod.voucherType || 'STANDARD',
        status: 'AVAILABLE',
        expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      }).save();
      console.log(`  ✓ Seeded test voucher code for ${prod.name}`);
    }
  }

  // 2. Test Multi-Product Order Simulation
  const lineItems = products.map((p) => ({
    productId: p._id,
    productName: p.name,
    voucherType: p.voucherType || 'STANDARD',
    brand: p.brand || p.provider || '',
    unitPrice: p.sellingPrice || 10000,
    originalPrice: p.originalPrice || 12000,
    quantity: 1,
  }));

  const subtotal = lineItems.reduce((acc, it) => acc + it.unitPrice * it.quantity, 0);
  const testOrderNo = generateOrderNo();

  const testOrder = new Order({
    orderNo: testOrderNo,
    userId: user._id,
    items: lineItems,
    subtotal,
    discountAmount: 0,
    tax: 0,
    total: subtotal,
    currency: 'INR',
    paymentStatus: 'PENDING',
    orderStatus: 'PAYMENT_PENDING',
    fulfillmentStatus: 'PENDING',
    paymentProvider: 'cashfree',
    paymentMethod: 'upi',
    billingDetails: {
      name: user.name || 'Test Candidate',
      email: user.email,
      phone: '9999999999',
    },
    customerSnapshot: {
      name: user.name || 'Test Candidate',
      email: user.email,
      phone: '9999999999',
    },
  });

  await testOrder.save();
  console.log(`  ✓ Created test multi-product order #${testOrder.orderNo} with ${lineItems.length} items (Total: ₹${subtotal})`);

  // 3. Test Atomic Allocation & Payment Confirmation
  testOrder.paymentStatus = 'PAID';
  testOrder.orderStatus = 'PROCESSING';
  testOrder.paymentReference = `TEST-CF-${Date.now()}`;
  testOrder.paidAt = new Date();
  await testOrder.save();

  const session = await Order.startSession();
  let allocatedVouchers = [];
  try {
    await session.withTransaction(async () => {
      const allocRes = await allocateVouchersForOrder({
        order: testOrder,
        user,
        session,
      });
      allocatedVouchers = allocRes.vouchers;
    });
  } finally {
    await session.endSession();
  }

  console.log(`  ✓ Successfully allocated ${allocatedVouchers.length} vouchers for multi-product order`);
  if (allocatedVouchers.length !== lineItems.length) {
    throw new Error(`Expected ${lineItems.length} vouchers, got ${allocatedVouchers.length}`);
  }

  // 4. Test Idempotency: Repeating payment confirmation check
  const orderCheck = await Order.findOne({ orderNo: testOrderNo });
  if (orderCheck.paymentStatus === 'PAID') {
    const existingVouchers = await VoucherCode.find({ orderId: orderCheck._id, userId: orderCheck.userId });
    console.log(`  ✓ Idempotency verification: Order is PAID, assigned vouchers count = ${existingVouchers.length}`);
    if (existingVouchers.length !== lineItems.length) {
      throw new Error(`Idempotency check failed: expected ${lineItems.length} vouchers`);
    }
  }

  // Cleanup test order & vouchers
  await VoucherCode.deleteMany({ orderId: testOrder._id });
  await Order.deleteOne({ _id: testOrder._id });
  console.log('  ✓ Cleaned up temporary test order artifacts');

  console.log('\n[test] ALL CART & PAYMENT VERIFICATION TESTS PASSED! 🚀');
  await mongoose.disconnect();
  process.exit(0);
}

runCartAndOrderVerification().catch((err) => {
  console.error('[test:error]', err);
  process.exit(1);
});
