/**
 * Fulfillment: resend-email + admin-notes + inventory-visibility regression.
 *
 * Covers the Phase 12/13 additions:
 *   - deliverFulfillmentRequest accepts adminNotes and persists them
 *   - listFulfillmentRequests attaches availableStock per row
 *   - resendFulfillmentVoucherEmail re-sends the SAME code, updates emailStatus,
 *     never allocates a second voucher, never reverts status
 *   - resend is rejected for a non-DELIVERED request
 *   - updateFulfillmentNotes edits the note without touching status
 *
 *   node backend/tests/fulfillmentResend.test.js
 */
import dotenv from 'dotenv';
dotenv.config();

// First pass: SMTP disabled so the "delivery email failed" path is exercised.
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
  deliverFulfillmentRequest,
  resendFulfillmentVoucherEmail,
  updateFulfillmentNotes,
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

const soldCount = (orderId) =>
  VoucherCode.countDocuments({ orderId, status: { $in: ['SOLD', 'ASSIGNED', 'USED'] } });

const run = async () => {
  console.log('\n=== FULFILLMENT RESEND / NOTES / STOCK SUITE ===\n');
  await connectDB();

  const admin = await User.findOneAndUpdate(
    { email: 'test-ful-resend-admin@apexvouchers.in' },
    { name: 'Resend Admin', email: 'test-ful-resend-admin@apexvouchers.in', passwordHash: 'x', role: 'admin' },
    { upsert: true, new: true }
  );
  const customer = await User.findOneAndUpdate(
    { email: 'test-ful-resend-cust@apexvouchers.in' },
    { name: 'Resend Customer', email: 'test-ful-resend-cust@apexvouchers.in', passwordHash: 'x', role: 'user' },
    { upsert: true, new: true }
  );
  const product = await Product.findOneAndUpdate(
    { name: 'TEST FUL-RESEND PTE Voucher' },
    {
      name: 'TEST FUL-RESEND PTE Voucher', slug: 'test-ful-resend-' + Date.now(),
      brand: 'PTE', provider: 'Pearson PTE', voucherType: 'PTE', category: 'Exam Voucher',
      originalPrice: 18900, sellingPrice: 15499, active: true, stockType: 'LIMITED',
      redemptionSteps: ['Go to pearsonpte.com', 'Enter the code at checkout'],
      officialWebsiteUrl: 'https://pearsonpte.com',
    },
    { upsert: true, new: true }
  );

  await VoucherCode.deleteMany({ productId: product._id });
  await FulfillmentRequest.deleteMany({ productId: product._id });
  await Order.deleteMany({ orderNo: /^TST-FRS-/ });

  const order = await Order.create({
    userId: customer._id, orderNo: `TST-FRS-${Date.now()}`,
    items: [{ productId: product._id, productName: product.name, voucherType: 'PTE', quantity: 1, unitPrice: product.sellingPrice, originalPrice: product.originalPrice }],
    subtotal: product.sellingPrice, total: product.sellingPrice,
    orderStatus: 'PAYMENT_RECEIVED_NEEDS_ALLOCATION', paymentStatus: 'PAID', currency: 'INR',
    razorpayOrderId: 'test_frs_oid', razorpayPaymentId: 'test_frs_pid',
  });
  const request = await FulfillmentRequest.create({
    requestId: `TST-FRS-REQ-${Date.now()}`, userId: customer._id,
    customerName: customer.name, customerEmail: customer.email,
    orderId: order._id, orderNo: order.orderNo,
    productId: product._id, productName: product.name, voucherType: 'PTE',
    quantity: 1, amountPaid: product.sellingPrice, status: 'PROCESSING',
    activityHistory: [{ status: 'PROCESSING', note: 'seed', timestamp: new Date() }],
  });

  // ── Stock visibility: 2 available codes → listing reports availableStock: 2 ──
  console.log('── Test 1: availableStock on the list ──');
  await VoucherCode.create({ code: 'APX-FRS-STOCK-1', productId: product._id, voucherType: 'PTE', status: 'AVAILABLE', expiryDate: new Date(Date.now() + 180 * 864e5) });
  await VoucherCode.create({ code: 'APX-FRS-STOCK-2', productId: product._id, voucherType: 'PTE', status: 'AVAILABLE', expiryDate: new Date(Date.now() + 180 * 864e5) });
  const listed = await listFulfillmentRequests({ search: request.requestId });
  const listedRow = listed.rows.find((r) => r._id.toString() === request._id.toString());
  ok(listedRow?.availableStock === 2, 'listing reports availableStock = 2', `got ${listedRow?.availableStock}`);

  // ── Resend before delivery is rejected ──
  console.log('\n── Test 2: resend rejected for non-DELIVERED request ──');
  await expectThrow(
    () => resendFulfillmentVoucherEmail({ requestId: request._id, admin }),
    'REQUEST_NOT_DELIVERED',
    'resend on a PROCESSING request → REQUEST_NOT_DELIVERED'
  );

  // ── Deliver with a note (SMTP disabled → emailStatus FAILED) ──
  console.log('\n── Test 3: deliver with adminNotes, email fails cleanly ──');
  const delivered = await deliverFulfillmentRequest({
    requestId: request._id, code: 'APX-FRS-STOCK-1', adminNotes: 'sourced from supplier batch 42', admin,
  });
  ok(delivered.request.status === 'DELIVERED', 'request is DELIVERED');
  ok(delivered.request.adminNotes === 'sourced from supplier batch 42', 'adminNotes persisted');
  ok(delivered.request.emailStatus === 'FAILED', 'emailStatus FAILED (SMTP disabled)');
  ok((await soldCount(order._id)) === 1, 'exactly 1 voucher SOLD');
  const deliveredVoucherId = delivered.request.voucherId.toString();

  // ── Resend (still SMTP-disabled) → still FAILED, still 1 voucher, still DELIVERED ──
  console.log('\n── Test 4: resend when SMTP still down ──');
  const r1 = await resendFulfillmentVoucherEmail({ requestId: request._id, admin });
  ok(r1.sent === false, 'resend reports sent:false');
  const afterResend = await FulfillmentRequest.findById(request._id).lean();
  ok(afterResend.status === 'DELIVERED', 'status stays DELIVERED after resend');
  ok(afterResend.emailStatus === 'FAILED', 'emailStatus stays FAILED');
  ok(afterResend.voucherId.toString() === deliveredVoucherId, 'same voucher id (no re-allocation)');
  ok((await soldCount(order._id)) === 1, 'still exactly 1 voucher SOLD after resend');

  // ── Resend with SMTP "up" (test-seam stub transport) → SENT, still 1 voucher ──
  console.log('\n── Test 5: resend succeeds when SMTP works ──');
  const { __setTransportForTests } = await import('../services/email.js');
  __setTransportForTests({ sendMail: async () => ({ messageId: 'stub', rejected: [], response: '250 OK' }) });
  const r2 = await resendFulfillmentVoucherEmail({ requestId: request._id, admin });
  __setTransportForTests(null);
  const afterOk = await FulfillmentRequest.findById(request._id).lean();
  ok(r2.sent === true, 'resend reports sent:true with a working transport', JSON.stringify(r2));
  ok(afterOk.emailStatus === 'SENT', 'emailStatus flips to SENT');
  ok(afterOk.emailError == null, 'emailError cleared');
  ok((await soldCount(order._id)) === 1, 'still exactly 1 voucher SOLD');

  // ── updateFulfillmentNotes edits without touching status ──
  console.log('\n── Test 6: updateFulfillmentNotes ──');
  const noted = await updateFulfillmentNotes({ requestId: request._id, adminNotes: 'customer confirmed receipt', admin });
  ok(noted.request.adminNotes === 'customer confirmed receipt', 'note updated');
  ok(noted.request.status === 'DELIVERED', 'status untouched by note edit');

  // ── cleanup ──
  await VoucherCode.deleteMany({ productId: product._id });
  await FulfillmentRequest.deleteMany({ productId: product._id });
  await Order.deleteMany({ orderNo: /^TST-FRS-/ });
  await User.deleteMany({ email: /test-ful-resend-/ });
  await Product.deleteOne({ _id: product._id });

  console.log(`\n=== RESEND SUITE: ${passed} passed, ${failed} failed ===\n`);
  await mongoose.disconnect();
  process.exit(failed > 0 ? 1 : 0);
};

run().catch(async (err) => {
  console.error('SUITE CRASHED:', err);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
