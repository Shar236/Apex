/**
 * Paid-first voucher flow regression suite.
 *
 * The customer never sees stock. Every "Buy Now" goes through Razorpay; only
 * AFTER a verified capture does the backend decide:
 *   CASE A — a code is available  → assign instantly, order FULFILLED
 *   CASE B — no code available    → order stays PAID + PROCESSING and a
 *            FulfillmentRequest is auto-created for the admin. The customer is
 *            told the voucher is "being prepared", NEVER "out of stock".
 *
 * Also asserts: race safety (one code, two buyers), webhook/verify idempotency,
 * that customer-facing product APIs expose no inventory numbers, and that the
 * retired pre-payment "Request Voucher" endpoint now 410s.
 *
 * Razorpay HTTP is stubbed via global.fetch; checkout/webhook signatures use the
 * REAL configured key secret so the true verification path runs. SMTP is forced
 * off. Data is "TEST-PFF" prefixed and cleaned up.
 *
 *   node backend/tests/paidFulfillmentFlow.test.js
 */
import dotenv from 'dotenv';
dotenv.config();

process.env.SMTP_HOST = '';
process.env.SMTP_USER = '';
process.env.SMTP_PASSWORD = '';
process.env.SMTP_FROM = '';

const crypto = (await import('crypto')).default;
const mongoose = (await import('mongoose')).default;
const { connectDB } = await import('../config/db.js');
const { config } = await import('../config/index.js');
const { Product } = await import('../models/Product.js');
const { VoucherCode } = await import('../models/VoucherCode.js');
const { Order } = await import('../models/Order.js');
const { User } = await import('../models/User.js');
const { FulfillmentRequest } = await import('../models/FulfillmentRequest.js');
const { generateOrderNo } = await import('../utils/index.js');
const { verifyPayment, handleRazorpayWebhook } = await import('../controllers/paymentController.js');
const { listProducts, getProduct } = await import('../controllers/productController.js');
const { submitVoucherRequest } = await import('../controllers/voucherRequestController.js');
const { deliverFulfillmentRequest } = await import('../services/fulfillmentService.js');
const { myVouchers } = await import('../controllers/accountController.js');

const SECRET = config.razorpay.keySecret || 'test_secret_fallback';
const WEBHOOK_SECRET = config.razorpay.webhookSecret || SECRET;
const TAG = 'TEST-PFF';

let pass = 0, fail = 0;
const ok = (cond, name, extra = '') => {
  if (cond) { pass += 1; console.log(`  ✅ ${name}`); }
  else { fail += 1; console.log(`  ❌ ${name}${extra ? ` — ${extra}` : ''}`); }
};

const mockRes = () => {
  const res = { statusCode: 200, body: null };
  res.status = (c) => { res.statusCode = c; return res; };
  res.json = (b) => { res.body = b; return res; };
  return res;
};
const run = async (handler, { user, body = {}, params = {}, headers = {}, query = {}, rawBody } = {}) => {
  const res = mockRes();
  let nextErr = null;
  await handler({ user, body, params, headers, query, rawBody, ip: '127.0.0.1' }, res, (e) => { nextErr = e || new Error('next()'); });
  return { res, err: nextErr, status: nextErr?.statusCode || res.statusCode, code: nextErr?.code || res.body?.code };
};

// ── Razorpay HTTP stub ──────────────────────────────────────────────────────
// Keyed by payment id so concurrent verifies (the race test) don't stomp on a
// single shared override.
const realFetch = global.fetch;
const gatewayPayments = new Map(); // paymentId -> { order_id, amount, currency, status }
global.fetch = async (url, opts) => {
  const u = String(url);
  if (u.includes('api.razorpay.com/v1/payments/')) {
    const id = u.split('/payments/')[1];
    const o = gatewayPayments.get(id) || {};
    return { ok: true, status: 200, json: async () => ({ id, entity: 'payment', status: 'captured', order_id: 'order_STUB', amount: 100, currency: 'INR', method: 'upi', ...o }) };
  }
  if (/api\.razorpay\.com\/v1\/orders\/[^/]+\/payments/.test(u)) {
    return { ok: true, status: 200, json: async () => ({ entity: 'collection', count: 0, items: [] }) };
  }
  return realFetch ? realFetch(url, opts) : Promise.reject(new Error('no fetch'));
};

let _n = 0;
const rzpId = () => `order_PFF_${Date.now()}_${++_n}`;
const checkoutSig = (o, p) => crypto.createHmac('sha256', SECRET).update(`${o}|${p}`).digest('hex');
const webhookSig = (raw) => crypto.createHmac('sha256', WEBHOOK_SECRET).update(raw).digest('hex');

const cleanup = async () => {
  const rx = new RegExp(`^${TAG}`, 'i');
  const prods = await Product.find({ name: rx }).select('_id');
  const ids = prods.map((p) => p._id);
  await VoucherCode.deleteMany({ productId: { $in: ids } });
  const orders = await Order.find({ 'customerSnapshot.email': rx }).select('_id');
  await FulfillmentRequest.deleteMany({ orderId: { $in: orders.map((o) => o._id) } });
  await Order.deleteMany({ 'customerSnapshot.email': rx });
  await Product.deleteMany({ _id: { $in: ids } });
  await User.deleteMany({ email: rx });
};

const makeUser = (suffix = '') => User.create({ name: `PFF ${suffix}`, email: `${TAG}${suffix}@apexvouchers.in`, passwordHash: 'x', role: 'user', status: 'active', emailVerified: true });
const makeProduct = (n) => Product.create({ name: `${TAG} ${n}`, slug: `${TAG.toLowerCase()}-${n}-${Date.now()}`, brand: 'PTE', provider: 'Pearson PTE', voucherType: 'PTE', category: 'Exam Voucher', originalPrice: 15000, sellingPrice: 12000, active: true, stockType: 'LIMITED' });
const addCode = (product, i = 0) => VoucherCode.create({ code: `${TAG}-${Date.now()}-${i}`, productId: product._id, voucherType: 'PTE', status: 'AVAILABLE', expiryDate: new Date(Date.now() + 365 * 864e5) });
const makePendingOrder = (user, product) => Order.create({
  orderNo: generateOrderNo(), userId: user._id,
  items: [{ productId: product._id, productName: product.name, voucherType: 'PTE', brand: 'PTE', unitPrice: product.sellingPrice, originalPrice: product.originalPrice, quantity: 1 }],
  subtotal: product.sellingPrice, discountAmount: 0, tax: 0, total: product.sellingPrice, currency: 'INR',
  paymentStatus: 'PENDING', orderStatus: 'PAYMENT_PENDING', fulfillmentStatus: 'PENDING',
  paymentProvider: 'razorpay', razorpayOrderId: rzpId(),
  customerSnapshot: { email: user.email, name: user.name },
});
const verify = (user, order, paymentId) => {
  gatewayPayments.set(paymentId, { order_id: order.razorpayOrderId, amount: Math.round(order.total * 100), currency: 'INR', status: 'captured' });
  return run(verifyPayment, { user, body: { orderId: String(order._id), razorpay_order_id: order.razorpayOrderId, razorpay_payment_id: paymentId, razorpay_signature: checkoutSig(order.razorpayOrderId, paymentId) } });
};
const vouchersFor = (orderId) => VoucherCode.countDocuments({ orderId, status: { $in: ['SOLD', 'ASSIGNED', 'USED'] } });
const STOCK_WORDS = /out of stock|no stock|stock unavailable|unavailable|backorder|inventory|waiting for stock/i;

const main = async () => {
  await connectDB();
  await cleanup();
  console.log('\n=== PAID-FIRST VOUCHER FLOW SUITE ===\n');

  const user = await makeUser();

  // ── CASE A: in stock → instant ────────────────────────────────────────────
  console.log('— CASE A: code available → instant fulfilment —');
  {
    const product = await makeProduct('A');
    await addCode(product, 0);
    const order = await makePendingOrder(user, product);
    const r = await verify(user, order, 'pay_A1');
    const fresh = await Order.findById(order._id);
    ok(r.res.body?.success && r.res.body?.paymentStatus === 'PAID', 'A1 verify → success + PAID');
    ok(fresh.orderStatus === 'FULFILLED' && fresh.fulfillmentStatus === 'FULFILLED', 'A2 order FULFILLED');
    ok((await vouchersFor(order._id)) === 1, 'A3 exactly 1 voucher assigned to the order');
    ok((r.res.body?.vouchers || []).length === 1 && r.res.body.vouchers[0].code, 'A4 voucher code returned to the client');
    ok(!(await FulfillmentRequest.findOne({ orderId: order._id })), 'A5 NO fulfillment request created (not needed)');
    ok(!r.res.body?.needsAllocation, 'A6 needsAllocation is falsy');
  }

  // ── CASE B: no stock → paid fulfilment request ────────────────────────────
  console.log('\n— CASE B: no code → auto paid fulfilment request —');
  let caseBOrder, caseBProduct;
  {
    const product = await makeProduct('B');
    caseBProduct = product;
    const order = await makePendingOrder(user, product); // no codes added
    caseBOrder = order;
    const r = await verify(user, order, 'pay_B1');
    const fresh = await Order.findById(order._id);
    ok(r.res.body?.success && r.res.body?.paymentStatus === 'PAID', 'B1 verify → success + PAID (payment kept)');
    ok(r.res.body?.needsAllocation === true && r.res.body?.pendingFulfillment === true, 'B2 response: needsAllocation + pendingFulfillment');
    ok(fresh.orderStatus === 'PROCESSING' && fresh.fulfillmentStatus === 'PROCESSING', 'B3 order PAID + PROCESSING (not FAILED, not FULFILLED)');
    ok((await vouchersFor(order._id)) === 0 && (r.res.body?.vouchers || []).length === 0, 'B4 no voucher assigned yet');
    ok(/1.2 minutes|being prepared|being processed/i.test(r.res.body?.message || ''), 'B5 message says "delivered within 1–2 minutes"', r.res.body?.message);
    ok(!STOCK_WORDS.test(r.res.body?.message || ''), 'B6 message contains NO stock / out-of-stock wording', r.res.body?.message);
    const fr = await FulfillmentRequest.findOne({ orderId: order._id });
    ok(!!fr && fr.status === 'PROCESSING', 'B7 one FulfillmentRequest created, status PROCESSING');
    ok(fr && fr.amountPaid === order.total && fr.orderNo === order.orderNo && fr.customerEmail === user.email.toLowerCase() && fr.productName === product.name, 'B8 request carries customer + payment + product snapshot', fr && `${fr.amountPaid}/${fr.customerEmail}`);
    ok(fr && fr.razorpayPaymentId === 'pay_B1', 'B9 request carries the captured payment id');
  }

  // ── CASE B idempotency ───────────────────────────────────────────────────
  console.log('\n— CASE B idempotency —');
  {
    const r2 = await verify(user, caseBOrder, 'pay_B1');
    ok(r2.res.body?.needsAllocation === true, 'B10 re-verify → still needsAllocation');
    ok((await FulfillmentRequest.countDocuments({ orderId: caseBOrder._id })) === 1, 'B11 still exactly ONE fulfillment request');

    const raw = JSON.stringify({ event: 'payment.captured', payload: { payment: { entity: { id: 'pay_B1', order_id: caseBOrder.razorpayOrderId, amount: Math.round(caseBOrder.total * 100), currency: 'INR', status: 'captured' } } } });
    const wh = await run(handleRazorpayWebhook, { headers: { 'x-razorpay-signature': webhookSig(raw), 'x-razorpay-event-id': `evt_${Date.now()}` }, rawBody: raw, body: JSON.parse(raw) });
    ok(wh.res.statusCode === 200 && (await FulfillmentRequest.countDocuments({ orderId: caseBOrder._id })) === 1, 'B12 webhook replay → still exactly ONE fulfillment request');
    ok((await vouchersFor(caseBOrder._id)) === 0, 'B13 webhook replay assigned no voucher');
  }

  // ── Admin delivers the CASE B request ────────────────────────────────────
  console.log('\n— admin fulfils CASE B —');
  {
    const fr = await FulfillmentRequest.findOne({ orderId: caseBOrder._id });
    const admin = await makeUser('-admin');
    const externalCode = `${TAG}-EXT-${Date.now()}`;
    const del = await deliverFulfillmentRequest({ requestId: fr._id, code: externalCode, admin });
    const fresh = await Order.findById(caseBOrder._id);
    ok(del.request.status === 'DELIVERED' && del.order.orderStatus === 'FULFILLED', 'D1 request DELIVERED, order FULFILLED');
    ok(fresh.fulfillmentStatus === 'FULFILLED', 'D2 order fulfillmentStatus FULFILLED');
    const v = await VoucherCode.findOne({ code: externalCode });
    ok(v && v.status === 'SOLD' && String(v.userId) === String(user._id) && String(v.orderId) === String(caseBOrder._id), 'D3 voucher SOLD + bound to the paying customer + order');
    const mine = await run(myVouchers, { user: { id: String(user._id), _id: user._id } });
    ok((mine.res.body?.data || []).some((x) => x.code === externalCode), 'D4 voucher now shows in the customer My Vouchers');
    // idempotent re-deliver
    const del2 = await deliverFulfillmentRequest({ requestId: fr._id, code: externalCode, admin });
    ok(del2.alreadyDelivered === true && (await VoucherCode.countDocuments({ orderId: caseBOrder._id, status: 'SOLD' })) === 1, 'D5 re-deliver same code → idempotent, still 1 voucher');
  }

  // ── Race: one code, two buyers (requirement 20) ──────────────────────────
  console.log('\n— race: 1 code, 2 simultaneous buyers —');
  {
    const product = await makeProduct('RACE');
    await addCode(product, 0); // exactly ONE
    const u1 = await makeUser('-race1');
    const u2 = await makeUser('-race2');
    const o1 = await makePendingOrder(u1, product);
    const o2 = await makePendingOrder(u2, product);
    const [r1, r2] = await Promise.all([verify(u1, o1, 'pay_R1'), verify(u2, o2, 'pay_R2')]);
    const f1 = await Order.findById(o1._id);
    const f2 = await Order.findById(o2._id);
    const fulfilledCount = [f1, f2].filter((o) => o.orderStatus === 'FULFILLED').length;
    const processingCount = [f1, f2].filter((o) => o.orderStatus === 'PROCESSING').length;
    ok(fulfilledCount === 1 && processingCount === 1, 'R1 exactly one buyer FULFILLED, one PROCESSING', `fulfilled=${fulfilledCount} processing=${processingCount}`);
    const soldForProduct = await VoucherCode.countDocuments({ productId: product._id, status: { $in: ['SOLD', 'ASSIGNED', 'USED'] } });
    ok(soldForProduct === 1, 'R2 the single code was assigned exactly ONCE (never duplicated)', `sold=${soldForProduct}`);
    const frs = await FulfillmentRequest.countDocuments({ orderId: { $in: [o1._id, o2._id] } });
    ok(frs === 1, 'R3 the loser got exactly one paid FulfillmentRequest');
    ok([r1, r2].filter((r) => r.res.body?.needsAllocation).length === 1, 'R4 exactly one verify response reported needsAllocation');
    ok([r1, r2].every((r) => !STOCK_WORDS.test(r.res.body?.message || '')), 'R5 neither buyer saw stock wording');
  }

  // ── Customer product APIs never expose inventory (requirement 19) ────────
  console.log('\n— customer product APIs hide inventory —');
  {
    const p0 = await makeProduct('NOCODES'); // zero codes
    const list = await run(listProducts, {});
    const rows = (list.res.body?.data || []).filter((p) => String(p.name).startsWith(TAG));
    ok(rows.length > 0, 'P0 test products present in public list');
    ok(rows.every((p) => p.availability === null && p.availableStock === null), 'P1 list: availability / availableStock are null (no counts)');
    ok(rows.every((p) => p.stockStatus === 'IN STOCK' || p.stockStatus === 'COMING SOON'), 'P2 list: stockStatus is only IN STOCK / COMING SOON (never OUT OF STOCK / LOW STOCK)');
    ok(rows.every((p) => p.inStock === true), 'P3 list: every active product reads inStock:true');
    ok(!STOCK_WORDS.test(JSON.stringify(rows)), 'P4 list: no out-of-stock wording anywhere in the payload');
    const one = await run(getProduct, { params: { id: p0.slug } });
    ok(one.res.body?.data?.availableStock === null && one.res.body?.data?.stockStatus === 'IN STOCK' && one.res.body?.data?.inStock === true, 'P5 detail: zero-code product still reads as purchasable, no count');
  }

  // ── The retired pre-payment request endpoint ─────────────────────────────
  console.log('\n— retired "Request Voucher" endpoint —');
  {
    const r = await run(submitVoucherRequest, { user, body: { productId: String(caseBProduct._id) } });
    ok(r.status === 410 && r.code === 'VOUCHER_REQUEST_RETIRED', 'V1 POST /api/voucher-requests → 410 VOUCHER_REQUEST_RETIRED', `${r.status}/${r.code}`);
  }

  await cleanup();
  global.fetch = realFetch;
  await mongoose.disconnect();
  console.log(`\n================================================================`);
  console.log(`${pass} passed, ${fail} failed`);
  console.log('================================================================');
  process.exit(fail ? 1 : 0);
};

main().catch(async (e) => {
  console.error(e);
  try { await cleanup(); await mongoose.disconnect(); } catch {}
  process.exit(1);
});
