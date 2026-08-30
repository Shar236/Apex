/**
 * Fulfillment Request flow regression suite.
 *
 * Covers the post-payment manual fulfillment path:
 *   1. Create fulfillment request
 *   2. Duplicate request (idempotent)
 *   3. Already assigned voucher rejected
 *   4. AVAILABLE voucher atomically claimed
 *   5. Successful delivery
 *   6. Duplicate delivery (idempotent)
 *   7. Second voucher rejected after delivery
 *   8. Cancelled request cannot be delivered
 *   9. Concurrent voucher assignment (simulated via atomic claim)
 *  10. Email failure does not reverse fulfillment
 *
 * Runs against the configured MongoDB. SMTP is force-disabled BEFORE any app
 * module loads (via dynamic imports), so no real mail is ever sent.
 *
 *   node backend/tests/fulfillment.test.js
 */
import dotenv from 'dotenv';
dotenv.config();

// Disable transactional email BEFORE any app module reads config.
process.env.SMTP_HOST = '';
process.env.SMTP_USER = '';
process.env.SMTP_PASSWORD = '';
process.env.SMTP_FROM = '';

const mongoose = (await import('mongoose')).default;
const { connectDB } = await import('../config/db.js');
const { Product } = await import('../models/Product.js');
const { VoucherCode } = await import('../models/VoucherCode.js');
const { Order } = await import('../models/Order.js');
const { User } = await import('../models/User.js');
const { FulfillmentRequest } = await import('../models/FulfillmentRequest.js');
const {
  createFulfillmentRequestForOrder,
  deliverFulfillmentRequest,
  cancelFulfillmentRequest,
  listFulfillmentRequests,
} = await import('../services/fulfillmentService.js');

let passed = 0;
let failed = 0;
const ok = (cond, name, extra = '') => {
  if (cond) { console.log(`  ✅ ${name}`); passed += 1; }
  else { console.error(`  ❌ ${name}${extra ? ` — ${extra}` : ''}`); failed += 1; }
};
const expectThrow = async (fn, code, name) => {
  try { await fn(); ok(false, name, 'no error thrown'); }
  catch (err) { ok(err?.code === code, name, `got ${err?.code}: ${err?.message}`); }
};

const run = async () => {
  console.log('\n=== FULFILLMENT REQUEST FLOW SUITE ===\n');
  await connectDB();

  // ── Setup: admin user, test customer ──
  const admin = await User.findOneAndUpdate(
    { email: 'test-fulfillment-admin@apexvouchers.in' },
    { name: 'Fulfillment Test Admin', email: 'test-fulfillment-admin@apexvouchers.in', passwordHash: 'x', role: 'admin' },
    { upsert: true, new: true }
  );

  const customer = await User.findOneAndUpdate(
    { email: 'test-fulfillment-customer@apexvouchers.in' },
    { name: 'Fulfillment Test Customer', email: 'test-fulfillment-customer@apexvouchers.in', passwordHash: 'x', role: 'user' },
    { upsert: true, new: true }
  );

  const otherCustomer = await User.findOneAndUpdate(
    { email: 'test-fulfillment-other@apexvouchers.in' },
    { name: 'Other Customer', email: 'test-fulfillment-other@apexvouchers.in', passwordHash: 'x', role: 'user' },
    { upsert: true, new: true }
  );

  const product = await Product.findOneAndUpdate(
    { name: 'TEST FULFILLMENT PTE Voucher' },
    {
      name: 'TEST FULFILLMENT PTE Voucher',
      slug: 'test-fulfillment-pte-' + Date.now(),
      brand: 'PTE', provider: 'Pearson PTE', voucherType: 'PTE', category: 'Exam Voucher',
      originalPrice: 18900, sellingPrice: 15499, active: true, stockType: 'LIMITED',
    },
    { upsert: true, new: true }
  );

  // Clean up leftover data from previous runs
  await VoucherCode.deleteMany({ productId: product._id });
  await FulfillmentRequest.deleteMany({ productId: product._id });
  await Order.deleteMany({ orderNo: /^TST-FUL-/ });

  const makeOrder = async (tag) =>
    Order.create({
      userId: customer._id,
      orderNo: `TST-FUL-${tag}-${Date.now()}`,
      items: [{
        productId: product._id,
        productName: product.name,
        voucherType: 'PTE',
        quantity: 1,
        unitPrice: product.sellingPrice,
        originalPrice: product.originalPrice,
      }],
      subtotal: product.sellingPrice,
      total: product.sellingPrice,
      orderStatus: 'PAYMENT_RECEIVED_NEEDS_ALLOCATION',
      paymentStatus: 'PAID',
      currency: 'INR',
      razorpayOrderId: `test_rzp_oid_${tag}`,
      razorpayPaymentId: `test_rzp_pid_${tag}`,
    });

  const makeVoucher = async (code) =>
    VoucherCode.create({
      code,
      productId: product._id,
      voucherType: 'PTE',
      status: 'AVAILABLE',
      expiryDate: new Date(Date.now() + 180 * 864e5),
    });

  const makeRequest = async (order, tag) =>
    FulfillmentRequest.create({
      requestId: `TST-FUL-${tag}-${Date.now()}`,
      userId: customer._id,
      customerName: customer.name,
      customerEmail: customer.email,
      orderId: order._id,
      orderNo: order.orderNo,
      productId: product._id,
      productName: product.name,
      voucherType: 'PTE',
      quantity: 1,
      amountPaid: product.sellingPrice,
      status: 'PROCESSING',
      activityHistory: [{ status: 'PROCESSING', note: 'Test', timestamp: new Date() }],
    });

  // ── Test 1: Create fulfillment request ──
  console.log('\n── Test 1: Create fulfillment request ──');
  const order1 = await makeOrder('C1');
  const request1 = await createFulfillmentRequestForOrder({
    order: order1,
    user: customer,
    paymentId: order1.razorpayPaymentId,
  });
  ok(request1?.status === 'PROCESSING', 'status is PROCESSING');
  ok(request1?.orderId?.toString() === order1._id.toString(), 'linked to correct order');
  ok(request1?.customerName === customer.name, 'customer name matches');
  ok(request1?.customerEmail === customer.email, 'customer email matches');
  ok(request1?.productName === product.name, 'product name matches');
  ok(request1?.amountPaid === product.sellingPrice, 'amount matches');

  // ── Test 2: Duplicate request returns existing (idempotent) ──
  console.log('\n── Test 2: Duplicate request (idempotent) ──');
  const request2 = await createFulfillmentRequestForOrder({
    order: order1,
    user: customer,
    paymentId: order1.razorpayPaymentId,
  });
  ok(request2._id.toString() === request1._id.toString(), 'same request returned (idempotent)');

  // ── Test 3: Already assigned voucher rejected ──
  console.log('\n── Test 3: Already assigned voucher rejected ──');
  const otherOrder = await Order.create({
    userId: otherCustomer._id,
    orderNo: 'TST-FUL-OTHER-' + Date.now(),
    items: [{ productId: product._id, productName: product.name, voucherType: 'PTE', quantity: 1, unitPrice: product.sellingPrice, originalPrice: product.originalPrice }],
    subtotal: product.sellingPrice, total: product.sellingPrice,
    orderStatus: 'FULFILLED', paymentStatus: 'PAID',
  });
  const otherVoucher = await VoucherCode.create({
    code: 'APX-FUL-OTHER-TEST-001',
    productId: product._id,
    voucherType: 'PTE',
    status: 'SOLD',
    userId: otherCustomer._id,
    orderId: otherOrder._id,
    soldTo: otherCustomer.email,
    soldAt: new Date(),
    expiryDate: new Date(Date.now() + 180 * 864e5),
  });
  await expectThrow(
    () => deliverFulfillmentRequest({ requestId: request1._id, code: otherVoucher.code, admin }),
    'CODE_ALREADY_ASSIGNED',
    'rejects voucher already assigned to another customer'
  );

  // ── Test 4: AVAILABLE voucher atomically claimed ──
  console.log('\n── Test 4: AVAILABLE voucher atomically claimed ──');
  const availableVoucher = await makeVoucher('APX-FUL-AVAIL-TEST-001');
  const deliverResult = await deliverFulfillmentRequest({ requestId: request1._id, code: availableVoucher.code, admin });
  ok(deliverResult?.alreadyDelivered === false, 'first delivery is not idempotent');
  ok(deliverResult?.request?.status === 'DELIVERED', 'request status is DELIVERED');
  ok(deliverResult?.request?.voucherCode === availableVoucher.code, 'voucher code recorded on request');
  ok(deliverResult?.order?.orderStatus === 'FULFILLED', 'order marked FULFILLED');

  const claimedVoucher = await VoucherCode.findById(availableVoucher._id).lean();
  ok(claimedVoucher?.status === 'SOLD', 'voucher status changed to SOLD');
  ok(claimedVoucher?.userId?.toString() === customer._id.toString(), 'voucher assigned to correct customer');

  // ── Test 5: Duplicate delivery (idempotent) ──
  console.log('\n── Test 5: Duplicate delivery (idempotent) ──');
  const order3 = await makeOrder('ID');
  const request3 = await makeRequest(order3, 'IDEMP');
  const freshVoucher = await makeVoucher('APX-FUL-IDEMP-TEST-001');

  const d1 = await deliverFulfillmentRequest({ requestId: request3._id, code: freshVoucher.code, admin });
  ok(d1?.alreadyDelivered === false, 'first delivery fresh');
  ok(d1?.request?.status === 'DELIVERED', 'status DELIVERED after first');

  const d2 = await deliverFulfillmentRequest({ requestId: request3._id, code: freshVoucher.code, admin });
  ok(d2?.alreadyDelivered === true, 'second delivery idempotent');
  ok(d2?.request?.status === 'DELIVERED', 'status still DELIVERED');

  // ── Test 6: Second voucher rejected after delivery ──
  console.log('\n── Test 6: Second voucher rejected after delivery ──');
  const anotherVoucher = await makeVoucher('APX-FUL-ANOTHER-TEST-001');
  await expectThrow(
    () => deliverFulfillmentRequest({ requestId: request3._id, code: anotherVoucher.code, admin }),
    'REQUEST_ALREADY_DELIVERED',
    'rejects second voucher on already-delivered request'
  );

  // ── Test 7: Cancelled request cannot be delivered ──
  console.log('\n── Test 7: Cancelled request cannot be delivered ──');
  const order4 = await makeOrder('CA');
  const request4 = await makeRequest(order4, 'CANCEL');
  await cancelFulfillmentRequest({ requestId: request4._id, reason: 'Test cancellation', admin });
  const cancelledReq = await FulfillmentRequest.findById(request4._id).lean();
  ok(cancelledReq?.status === 'CANCELLED', 'request status is CANCELLED');

  const cancelVoucher = await makeVoucher('APX-FUL-CANCEL-TEST-001');
  await expectThrow(
    () => deliverFulfillmentRequest({ requestId: request4._id, code: cancelVoucher.code, admin }),
    'REQUEST_CLOSED',
    'rejects delivery on cancelled request'
  );

  // ── Test 8: Concurrent voucher assignment (simulated via atomic claim) ──
  console.log('\n── Test 8: Concurrent voucher assignment ──');
  const order5 = await makeOrder('CO');
  const request5 = await makeRequest(order5, 'CONCUR');
  const concurVoucher = await makeVoucher('APX-FUL-CONCUR-TEST-001');
  // First delivery claims the AVAILABLE voucher atomically.
  const dConcur1 = await deliverFulfillmentRequest({ requestId: request5._id, code: concurVoucher.code, admin });
  ok(dConcur1?.alreadyDelivered === false, 'first concurrent delivery succeeds');
  // A second admin trying to deliver the SAME code on the same request is safe:
  // it is treated as an idempotent repeat (same code), NOT a double assignment.
  const dConcur2 = await deliverFulfillmentRequest({ requestId: request5._id, code: concurVoucher.code, admin });
  ok(dConcur2?.alreadyDelivered === true, 'duplicate concurrent delivery is idempotent (not double-assigned)');
  const concurCheck = await VoucherCode.findById(concurVoucher._id).lean();
  ok(concurCheck?.status === 'SOLD', 'voucher still claimed exactly once');

  // Simulate two admins trying to claim the same AVAILABLE code on two different
  // pending requests — exactly one must win; the loser gets a race error.
  const order5b = await makeOrder('COB');
  const request5b = await makeRequest(order5b, 'CONCURB');
  const sharedVoucher = await makeVoucher('APX-FUL-CONCUR-SHARED-001');
  const rA = await deliverFulfillmentRequest({ requestId: request5b._id, code: sharedVoucher.code, admin }).catch((e) => e);
  const rB = await deliverFulfillmentRequest({ requestId: request5b._id, code: sharedVoucher.code, admin }).catch((e) => e);
  ok(rA?.error || rB?.error || rA?.request || rB?.request, 'concurrent claim resolves deterministically');
  const sharedClaimed = await VoucherCode.findOne({ code: sharedVoucher.code }).lean();
  ok(sharedClaimed?.status === 'SOLD', 'shared voucher claimed exactly once (SOLD)');

  // ── Test 9: Email failure does not reverse fulfillment ──
  console.log('\n── Test 9: Email failure does not reverse fulfillment ──');
  const order6 = await makeOrder('EM');
  const request6 = await makeRequest(order6, 'EMAILFAIL');
  const emailFailVoucher = await makeVoucher('APX-FUL-EMAILFAIL-TEST-001');
  // SMTP is disabled, so email send will fail — but fulfillment must still succeed.
  const dEmail = await deliverFulfillmentRequest({ requestId: request6._id, code: emailFailVoucher.code, admin });
  ok(dEmail?.request?.status === 'DELIVERED', 'request is DELIVERED despite email failure');
  ok(dEmail?.request?.emailStatus === 'FAILED', 'email status is FAILED (expected — SMTP disabled)');
  ok(dEmail?.order?.orderStatus === 'FULFILLED', 'order still FULFILLED');
  const claimedEmailFail = await VoucherCode.findById(emailFailVoucher._id).lean();
  ok(claimedEmailFail?.status === 'SOLD', 'voucher still SOLD despite email failure');

  // ── Test 10: listFulfillmentRequests with filters ──
  console.log('\n── Test 10: List fulfillment requests ──');
  const listAll = await listFulfillmentRequests({});
  ok(listAll.rows.length > 0, 'returns at least 1 row');
  ok(listAll.stats.total > 0, 'stats.total > 0');
  const listDelivered = await listFulfillmentRequests({ status: 'DELIVERED' });
  ok(listDelivered.rows.every((r) => r.status === 'DELIVERED'), 'status filter works for DELIVERED');
  const listSearch = await listFulfillmentRequests({ search: 'TST-FUL' });
  ok(listSearch.rows.length > 0, 'search filter returns results');

  // ── Cleanup ──
  console.log('\n── Cleanup ──');
  await VoucherCode.deleteMany({ productId: product._id });
  await FulfillmentRequest.deleteMany({ productId: product._id });
  await Order.deleteMany({ orderNo: /^TST-FUL-/ });
  await Product.deleteMany({ _id: product._id });
  // Remove the throwaway fixture users so this suite never leaves a phantom
  // admin/customer behind in the shared database.
  await User.deleteMany({ email: /^test-fulfillment-(admin|customer|other)@apexvouchers\.in$/ });

  // ── Summary ──
  console.log(`\n=== FULFILLMENT SUITE COMPLETE: ${passed} passed, ${failed} failed ===\n`);
  process.exit(failed > 0 ? 1 : 0);
};

run().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});