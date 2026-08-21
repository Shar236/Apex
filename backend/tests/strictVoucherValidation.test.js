import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { Product } from '../models/Product.js';
import { VoucherCode } from '../models/VoucherCode.js';
import { Order } from '../models/Order.js';
import { User } from '../models/User.js';
import { AuditLog } from '../models/AuditLog.js';
import {
  allocateVouchersForOrder,
  validateVouchersBeforeDelivery,
  normalizeVoucherType,
} from '../services/voucherAllocation.js';

const runTests = async () => {
  console.log('================================================================');
  console.log('🧪 RUNNING STRICT VOUCHER VALIDATION & ALLOCATION TEST SUITE');
  console.log('================================================================\n');

  await connectDB();

  // Create or retrieve a test user
  let testUser = await User.findOne({ email: 'test-runner@apexvouchers.in' });
  if (!testUser) {
    testUser = await User.create({
      name: 'Test Runner',
      email: 'test-runner@apexvouchers.in',
      passwordHash: 'dummy-hash',
      role: 'user',
    });
  }

  // Create test products for Duolingo, PTE, and TOEFL
  const duoProd = await Product.findOneAndUpdate(
    { name: 'TEST Duolingo English Test Voucher' },
    {
      name: 'TEST Duolingo English Test Voucher',
      slug: 'test-duolingo-voucher-' + Date.now(),
      brand: 'Duolingo',
      provider: 'Duolingo',
      voucherType: 'DUOLINGO',
      category: 'Exam Voucher',
      originalPrice: 6000,
      sellingPrice: 4999,
      active: true,
    },
    { upsert: true, new: true }
  );

  const pteProd = await Product.findOneAndUpdate(
    { name: 'TEST Pearson PTE Academic Voucher' },
    {
      name: 'TEST Pearson PTE Academic Voucher',
      slug: 'test-pte-voucher-' + Date.now(),
      brand: 'PTE',
      provider: 'Pearson PTE',
      voucherType: 'PTE',
      category: 'Exam Voucher',
      originalPrice: 18900,
      sellingPrice: 15499,
      active: true,
    },
    { upsert: true, new: true }
  );

  const toeflProd = await Product.findOneAndUpdate(
    { name: 'TEST ETS TOEFL iBT Voucher' },
    {
      name: 'TEST ETS TOEFL iBT Voucher',
      slug: 'test-toefl-voucher-' + Date.now(),
      brand: 'TOEFL',
      provider: 'ETS TOEFL',
      voucherType: 'TOEFL',
      category: 'Exam Voucher',
      originalPrice: 18000,
      sellingPrice: 13999,
      active: true,
    },
    { upsert: true, new: true }
  );

  // Clean up any old test vouchers
  await VoucherCode.deleteMany({
    code: { $regex: /^TEST-/ },
  });

  const futureExpiry = new Date();
  futureExpiry.setMonth(futureExpiry.getMonth() + 6);

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, extra = '') => {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName} - ${extra}`);
      failed++;
    }
  };

  try {
    // -------------------------------------------------------------
    // Test 1: Duolingo Purchase -> Duolingo Voucher ONLY
    // -------------------------------------------------------------
    const duoCode = `TEST-DL-${Date.now()}`;
    await VoucherCode.create({
      code: duoCode,
      productId: duoProd._id,
      voucherType: 'DUOLINGO',
      status: 'AVAILABLE',
      expiryDate: futureExpiry,
    });

    const orderDuo = await Order.create({
      orderNo: `ORD-TEST-DUO-${Date.now()}`,
      userId: testUser._id,
      items: [
        {
          productId: duoProd._id,
          productName: duoProd.name,
          voucherType: 'DUOLINGO',
          brand: 'Duolingo',
          unitPrice: duoProd.sellingPrice,
          originalPrice: duoProd.originalPrice,
          quantity: 1,
        },
      ],
      subtotal: duoProd.sellingPrice,
      total: duoProd.sellingPrice,
      paymentStatus: 'PAID',
      orderStatus: 'PROCESSING',
    });

    const resDuo = await allocateVouchersForOrder({ order: orderDuo, user: testUser });
    assert(
      resDuo.vouchers.length === 1 &&
        resDuo.vouchers[0].code === duoCode &&
        resDuo.vouchers[0].voucherType === 'DUOLINGO' &&
        resDuo.vouchers[0].status === 'SOLD',
      'Test 1 — Duolingo purchase allocates Duolingo voucher only'
    );

    // -------------------------------------------------------------
    // Test 2: PTE Purchase -> PTE Voucher ONLY
    // -------------------------------------------------------------
    const pteCode = `TEST-PTE-${Date.now()}`;
    await VoucherCode.create({
      code: pteCode,
      productId: pteProd._id,
      voucherType: 'PTE',
      status: 'AVAILABLE',
      expiryDate: futureExpiry,
    });

    const orderPTE = await Order.create({
      orderNo: `ORD-TEST-PTE-${Date.now()}`,
      userId: testUser._id,
      items: [
        {
          productId: pteProd._id,
          productName: pteProd.name,
          voucherType: 'PTE',
          brand: 'PTE',
          unitPrice: pteProd.sellingPrice,
          originalPrice: pteProd.originalPrice,
          quantity: 1,
        },
      ],
      subtotal: pteProd.sellingPrice,
      total: pteProd.sellingPrice,
      paymentStatus: 'PAID',
      orderStatus: 'PROCESSING',
    });

    const resPTE = await allocateVouchersForOrder({ order: orderPTE, user: testUser });
    assert(
      resPTE.vouchers.length === 1 &&
        resPTE.vouchers[0].code === pteCode &&
        resPTE.vouchers[0].voucherType === 'PTE' &&
        resPTE.vouchers[0].status === 'SOLD',
      'Test 2 — PTE purchase allocates PTE voucher only'
    );

    // -------------------------------------------------------------
    // Test 3: TOEFL Purchase -> TOEFL Voucher ONLY
    // -------------------------------------------------------------
    const toeflCode = `TEST-TF-${Date.now()}`;
    await VoucherCode.create({
      code: toeflCode,
      productId: toeflProd._id,
      voucherType: 'TOEFL',
      status: 'AVAILABLE',
      expiryDate: futureExpiry,
    });

    const orderTOEFL = await Order.create({
      orderNo: `ORD-TEST-TF-${Date.now()}`,
      userId: testUser._id,
      items: [
        {
          productId: toeflProd._id,
          productName: toeflProd.name,
          voucherType: 'TOEFL',
          brand: 'TOEFL',
          unitPrice: toeflProd.sellingPrice,
          originalPrice: toeflProd.originalPrice,
          quantity: 1,
        },
      ],
      subtotal: toeflProd.sellingPrice,
      total: toeflProd.sellingPrice,
      paymentStatus: 'PAID',
      orderStatus: 'PROCESSING',
    });

    const resTOEFL = await allocateVouchersForOrder({ order: orderTOEFL, user: testUser });
    assert(
      resTOEFL.vouchers.length === 1 &&
        resTOEFL.vouchers[0].code === toeflCode &&
        resTOEFL.vouchers[0].voucherType === 'TOEFL' &&
        resTOEFL.vouchers[0].status === 'SOLD',
      'Test 3 — TOEFL purchase allocates TOEFL voucher only'
    );

    // -------------------------------------------------------------
    // Test 4: Wrong voucher available (Duolingo order, only TOEFL code in inventory)
    // -------------------------------------------------------------
    const orderDuoMissing = await Order.create({
      orderNo: `ORD-TEST-DUO-OOS-${Date.now()}`,
      userId: testUser._id,
      items: [
        {
          productId: duoProd._id,
          productName: duoProd.name,
          voucherType: 'DUOLINGO',
          unitPrice: duoProd.sellingPrice,
          originalPrice: duoProd.originalPrice,
          quantity: 1,
        },
      ],
      subtotal: duoProd.sellingPrice,
      total: duoProd.sellingPrice,
      paymentStatus: 'PAID',
      orderStatus: 'PROCESSING',
    });

    let wrongVoucherBlocked = false;
    try {
      await allocateVouchersForOrder({ order: orderDuoMissing, user: testUser });
    } catch (err) {
      wrongVoucherBlocked = err.code === 'OUT_OF_STOCK';
    }

    assert(
      wrongVoucherBlocked === true,
      'Test 4 — Wrong voucher available: Duolingo purchase does NOT consume TOEFL inventory'
    );

    // -------------------------------------------------------------
    // Test 5: Duplicate webhook / Idempotent fulfillment
    // -------------------------------------------------------------
    const resIdempotent = await allocateVouchersForOrder({ order: orderDuo, user: testUser });
    assert(
      resIdempotent.alreadyFulfilled === true &&
        resIdempotent.vouchers.length === 1 &&
        resIdempotent.vouchers[0].code === duoCode,
      'Test 5 — Duplicate webhook / re-verification returns existing voucher without double allocation'
    );

    // -------------------------------------------------------------
    // Test 6: Concurrent purchases of same product (Race Condition Safety)
    // -------------------------------------------------------------
    const codeConc1 = `TEST-CONC-1-${Date.now()}`;
    const codeConc2 = `TEST-CONC-2-${Date.now()}`;

    await VoucherCode.create([
      {
        code: codeConc1,
        productId: duoProd._id,
        voucherType: 'DUOLINGO',
        status: 'AVAILABLE',
        expiryDate: futureExpiry,
      },
      {
        code: codeConc2,
        productId: duoProd._id,
        voucherType: 'DUOLINGO',
        status: 'AVAILABLE',
        expiryDate: futureExpiry,
      },
    ]);

    const orderCustA = await Order.create({
      orderNo: `ORD-CUST-A-${Date.now()}`,
      userId: testUser._id,
      items: [{ productId: duoProd._id, productName: duoProd.name, voucherType: 'DUOLINGO', unitPrice: 4999, originalPrice: 6000, quantity: 1 }],
      subtotal: 4999,
      total: 4999,
      paymentStatus: 'PAID',
      orderStatus: 'PROCESSING',
    });

    const orderCustB = await Order.create({
      orderNo: `ORD-CUST-B-${Date.now()}`,
      userId: testUser._id,
      items: [{ productId: duoProd._id, productName: duoProd.name, voucherType: 'DUOLINGO', unitPrice: 4999, originalPrice: 6000, quantity: 1 }],
      subtotal: 4999,
      total: 4999,
      paymentStatus: 'PAID',
      orderStatus: 'PROCESSING',
    });

    const [resA, resB] = await Promise.all([
      allocateVouchersForOrder({ order: orderCustA, user: testUser }),
      allocateVouchersForOrder({ order: orderCustB, user: testUser }),
    ]);

    const assignedCodeA = resA.vouchers[0].code;
    const assignedCodeB = resB.vouchers[0].code;

    assert(
      assignedCodeA !== assignedCodeB &&
        [codeConc1, codeConc2].includes(assignedCodeA) &&
        [codeConc1, codeConc2].includes(assignedCodeB),
      'Test 6 — Concurrent customers: Customer A & B receive distinct vouchers with zero collision'
    );

    // -------------------------------------------------------------
    // Test 7: Sold voucher reuse attempt
    // -------------------------------------------------------------
    const soldCode = `TEST-SOLD-${Date.now()}`;
    await VoucherCode.create({
      code: soldCode,
      productId: duoProd._id,
      voucherType: 'DUOLINGO',
      status: 'SOLD',
      expiryDate: futureExpiry,
      soldAt: new Date(),
    });

    const orderSoldAttempt = await Order.create({
      orderNo: `ORD-SOLD-ATTEMPT-${Date.now()}`,
      userId: testUser._id,
      items: [{ productId: duoProd._id, productName: duoProd.name, voucherType: 'DUOLINGO', unitPrice: 4999, originalPrice: 6000, quantity: 1 }],
      subtotal: 4999,
      total: 4999,
      paymentStatus: 'PAID',
      orderStatus: 'PROCESSING',
    });

    let soldReused = false;
    try {
      const resSold = await allocateVouchersForOrder({ order: orderSoldAttempt, user: testUser });
      if (resSold.vouchers.some((v) => v.code === soldCode)) {
        soldReused = true;
      }
    } catch (err) {
      // expected out of stock if no other available
    }

    assert(soldReused === false, 'Test 7 — Sold voucher cannot be reused or reallocated');

    // -------------------------------------------------------------
    // Test 8: Pre-Delivery Validation & Mismatch Block
    // -------------------------------------------------------------
    const fakeMismatchedVoucher = {
      code: 'TEST-MISMATCH-1234',
      productId: toeflProd._id,
      voucherType: 'TOEFL',
      status: 'SOLD',
    };

    const isDeliveryValid = validateVouchersBeforeDelivery(orderDuo, [fakeMismatchedVoucher]);
    assert(
      isDeliveryValid === false,
      'Test 8 — Pre-delivery validation strictly BLOCKS delivery if voucherType/productId mismatches'
    );

    console.log('\n================================================================');
    console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('================================================================\n');

    // Cleanup test records
    await VoucherCode.deleteMany({ code: { $regex: /^TEST-/ } });
    await Order.deleteMany({ orderNo: { $regex: /^ORD-TEST-|^ORD-CUST-|^ORD-SOLD-/ } });
    await Product.deleteMany({ name: { $regex: /^TEST / } });

    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('Fatal test error:', error);
    process.exit(1);
  }
};

runTests();
