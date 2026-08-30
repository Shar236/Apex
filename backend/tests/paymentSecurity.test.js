/**
 * Payment security regression suite.
 *
 * Acceptance criterion under test:
 *   "ONLY A SUCCESSFULLY VERIFIED PAYMENT MAY RESULT IN A VOUCHER BEING
 *    ASSIGNED OR DELIVERED."
 *
 * Runs against the configured MongoDB. Creates only "TEST-SEC" prefixed data
 * and cleans up afterwards. The Razorpay HTTP API is stubbed via global.fetch;
 * signatures are computed with the REAL configured key secret so the actual
 * verification code path is exercised.
 *
 *   node backend/tests/paymentSecurity.test.js
 */
import dotenv from 'dotenv';
dotenv.config();

// Disable transactional email BEFORE any app module reads config — otherwise
// config/index.js loads the real SMTP credentials and this suite sends REAL
// mail during tests (and T11b/T13b would see emailStatus=SENT, not FAILED).
// (dotenv does not override an already-set key, and config/index.js loads next.)
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
const { generateOrderNo } = await import('../utils/index.js');
const {
  verifyPayment,
  getPaymentStatus,
  handleRazorpayWebhook,
  createPaymentOrder,
  reconcilePayment,
} = await import('../controllers/paymentController.js');
const { myVouchers, myOrders } = await import('../controllers/accountController.js');
const { getOrder } = await import('../controllers/orderController.js');

const SECRET = config.razorpay.keySecret || 'test_secret_fallback';
const WEBHOOK_SECRET = config.razorpay.webhookSecret || SECRET;
const TAG = 'TEST-SEC';

let pass = 0;
let fail = 0;
const ok = (cond, name, extra = '') => {
  if (cond) { pass++; console.log(`  ✅ ${name}`); }
  else { fail++; console.log(`  ❌ ${name}${extra ? ` — ${extra}` : ''}`); }
};

// ── mock Express req/res ─────────────────────────────────────────────────────
const mockRes = () => {
  const res = { statusCode: 200, body: null };
  res.status = (c) => { res.statusCode = c; return res; };
  res.json = (b) => { res.body = b; return res; };
  return res;
};
const run = async (handler, { user, body = {}, params = {}, headers = {}, rawBody } = {}) => {
  const res = mockRes();
  let nextErr = null;
  const req = { user, body, params, headers, rawBody };
  await handler(req, res, (err) => { nextErr = err || new Error('next() with no error'); });
  return { res, err: nextErr, status: nextErr?.statusCode || res.statusCode, code: nextErr?.code || res.body?.code };
};

// ── Razorpay HTTP stub ──────────────────────────────────────────────────────
const realFetch = global.fetch;
let gatewayPaymentOverride = null; // set per-test to shape /payments/:id response
let gatewayOrderPaymentsOverride = null; // set per-test → items[] for GET /orders/:id/payments
global.fetch = async (url, opts) => {
  const u = String(url);
  // GET /orders/{id}/payments  — reconciliation path
  if (/api\.razorpay\.com\/v1\/orders\/[^/]+\/payments/.test(u)) {
    const rzpOrderId = u.match(/\/orders\/([^/]+)\/payments/)[1];
    const items = gatewayOrderPaymentsOverride
      ? gatewayOrderPaymentsOverride.map((p) => ({ order_id: rzpOrderId, currency: 'INR', ...p }))
      : [];
    return { ok: true, status: 200, json: async () => ({ entity: 'collection', count: items.length, items }) };
  }
  if (u.includes('api.razorpay.com/v1/payments/')) {
    const paymentId = u.split('/payments/')[1];
    const base = {
      id: paymentId,
      entity: 'payment',
      status: 'captured',
      order_id: 'order_STUB',
      amount: 100,
      currency: 'INR',
      method: 'upi',
    };
    const payload = { ...base, ...(gatewayPaymentOverride || {}) };
    return { ok: true, status: 200, json: async () => payload };
  }
  if (u.includes('api.razorpay.com/v1/orders')) {
    let reqBody = {};
    try { reqBody = JSON.parse(opts?.body || '{}'); } catch {}
    return {
      ok: true,
      status: 200,
      json: async () => ({
        id: `order_STUB_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        amount: reqBody.amount ?? 0,
        currency: reqBody.currency || 'INR',
        receipt: reqBody.receipt || 'x',
      }),
    };
  }
  return realFetch ? realFetch(url, opts) : Promise.reject(new Error('no fetch'));
};

let _n = 0;
const uniqRzpOrderId = () => `order_TESTSEC_${Date.now()}_${++_n}`;

const checkoutSig = (rzpOrderId, paymentId) =>
  crypto.createHmac('sha256', SECRET).update(`${rzpOrderId}|${paymentId}`).digest('hex');
const webhookSig = (rawBody) =>
  crypto.createHmac('sha256', WEBHOOK_SECRET).update(rawBody).digest('hex');

// ── fixtures ────────────────────────────────────────────────────────────────
const cleanup = async () => {
  const rx = new RegExp(`^${TAG}`, 'i'); // email is lowercased by the User model
  const prods = await Product.find({ name: new RegExp(`^${TAG}`, 'i') }).select('_id');
  const ids = prods.map((p) => p._id);
  await VoucherCode.deleteMany({ productId: { $in: ids } });
  await Order.deleteMany({ 'customerSnapshot.email': rx });
  await Product.deleteMany({ _id: { $in: ids } });
  await User.deleteMany({ email: rx });
};

const makeFixtures = async () => {
  const user = await User.create({
    name: 'Sec Test', email: `${TAG}@apexvouchers.in`, passwordHash: 'x', role: 'user', status: 'active',
  });
  const attacker = await User.create({
    name: 'Attacker', email: `${TAG}-ATTACKER@apexvouchers.in`, passwordHash: 'x', role: 'user', status: 'active',
  });
  const product = await Product.create({
    name: `${TAG} PTE Voucher`, slug: `${TAG.toLowerCase()}-pte-${Date.now()}`,
    brand: 'PTE', provider: 'Pearson PTE', voucherType: 'PTE', category: 'Exam Voucher',
    originalPrice: 15000, sellingPrice: 12000, active: true,
  });
  const expiry = new Date(Date.now() + 365 * 864e5);
  await VoucherCode.insertMany(
    Array.from({ length: 5 }).map((_, i) => ({
      code: `${TAG}-PTE-${Date.now()}-${i}`, productId: product._id, voucherType: 'PTE',
      status: 'AVAILABLE', expiryDate: expiry,
    }))
  );
  return { user, attacker, product };
};

const makePendingOrder = async (user, product, qty = 1, rzpOrderId = uniqRzpOrderId()) => {
  const order = await Order.create({
    orderNo: generateOrderNo(), userId: user._id,
    items: [{
      productId: product._id, productName: product.name, voucherType: 'PTE', brand: 'PTE',
      unitPrice: product.sellingPrice, originalPrice: product.originalPrice, quantity: qty,
    }],
    subtotal: product.sellingPrice * qty, discountAmount: 0, tax: 0, total: product.sellingPrice * qty,
    currency: 'INR', paymentStatus: 'PENDING', orderStatus: 'PAYMENT_PENDING', fulfillmentStatus: 'PENDING',
    paymentProvider: 'razorpay', razorpayOrderId: rzpOrderId,
    customerSnapshot: { email: `${TAG}@apexvouchers.in`, name: 'Sec Test' },
  });
  return order;
};

const vouchersFor = (orderId) => VoucherCode.countDocuments({ orderId, status: { $in: ['SOLD', 'ASSIGNED', 'USED'] } });

// ── tests ───────────────────────────────────────────────────────────────────
const main = async () => {
  await connectDB();
  await cleanup();
  const { user, attacker, product } = await makeFixtures();

  console.log('\n=== PAYMENT SECURITY SUITE ===\n');

  // T0 — createPaymentOrder ignores client-supplied price / totals
  {
    const { res, err } = await run(createPaymentOrder, {
      user,
      body: {
        items: [
          {
            productId: product._id.toString(),
            quantity: 1,
            // attacker-supplied fields that MUST be ignored:
            price: 1, unitPrice: 1, sellingPrice: 1, discountedPrice: 1,
            total: 1, amount: 1, originalPrice: 1,
          },
        ],
        total: 1, amount: 1, // top-level tampering
        promoCode: null,
      },
    });
    const createdOrder = res.body?.orderId ? await Order.findById(res.body.orderId) : null;
    ok(!err && res.body?.success, 'T0  createPaymentOrder succeeds for a valid item');
    ok(res.body?.amount === product.sellingPrice * 100,
      'T0b Razorpay amount = server sellingPrice*100 (client price ignored)',
      `got ${res.body?.amount}, expected ${product.sellingPrice * 100}`);
    ok(createdOrder && createdOrder.total === product.sellingPrice && createdOrder.paymentStatus === 'PENDING',
      'T0c internal order stored with server total, PENDING, no voucher');
    ok(!res.body?.keySecret && !res.body?.key_secret && !JSON.stringify(res.body || {}).includes(SECRET),
      'T0d response never contains the key secret');
  }

  // T0e — negative / zero / absurd quantities are rejected
  {
    for (const [q, label] of [[0, 'zero'], [-3, 'negative'], [999999, 'absurd'], [1.5, 'fractional']]) {
      const { err } = await run(createPaymentOrder, {
        user, body: { items: [{ productId: product._id.toString(), quantity: q }] },
      });
      ok(!!err, `T0e createPaymentOrder rejects ${label} quantity (${q})`);
    }
  }

  // T0f — unknown / inactive product id is rejected
  {
    const { err } = await run(createPaymentOrder, {
      user, body: { items: [{ productId: new mongoose.Types.ObjectId().toString(), quantity: 1 }] },
    });
    ok(!!err && err.code === 'PRODUCT_MISSING', 'T0f createPaymentOrder rejects unknown product id');
  }

  // T1 — a PENDING order exposes no voucher
  {
    const order = await makePendingOrder(user, product);
    const { res } = await run(getPaymentStatus, { user, params: { orderId: order._id.toString() } });
    ok(res.body?.paymentStatus === 'PENDING' && (res.body?.vouchers || []).length === 0,
      'T1  PENDING order → getPaymentStatus returns no voucher');
    ok((await vouchersFor(order._id)) === 0, 'T1b PENDING order → 0 vouchers allocated in DB');
  }

  // T2 — invalid signature is rejected, order stays PENDING
  {
    const order = await makePendingOrder(user, product);
    const { err, code } = await run(verifyPayment, {
      user,
      body: {
        orderId: order._id.toString(),
        razorpay_order_id: order.razorpayOrderId,
        razorpay_payment_id: 'pay_FAKE123',
        razorpay_signature: 'deadbeef'.repeat(8),
      },
    });
    const fresh = await Order.findById(order._id);
    ok(!!err && code === 'SIGNATURE_INVALID', 'T2  invalid checkout signature → rejected');
    ok(fresh.paymentStatus === 'PENDING' && (await vouchersFor(order._id)) === 0,
      'T2b invalid signature → order still PENDING, 0 vouchers');
  }

  // T3 — razorpay_order_id not bound to this internal order
  {
    const order = await makePendingOrder(user, product);
    const { err, code } = await run(verifyPayment, {
      user,
      body: {
        orderId: order._id.toString(),
        razorpay_order_id: 'order_ATTACKER',
        razorpay_payment_id: 'pay_X',
        razorpay_signature: checkoutSig('order_ATTACKER', 'pay_X'),
      },
    });
    ok(!!err && code === 'ORDER_ID_MISMATCH', 'T3  mismatched razorpay_order_id → rejected');
    ok((await Order.findById(order._id)).paymentStatus === 'PENDING', 'T3b order still PENDING');
  }

  // T4 — valid signature but gateway says WRONG AMOUNT
  {
    const order = await makePendingOrder(user, product);
    gatewayPaymentOverride = { status: 'captured', order_id: order.razorpayOrderId, amount: 1, currency: 'INR' }; // 1 paise
    const paymentId = 'pay_LOWAMT';
    const { err, code } = await run(verifyPayment, {
      user,
      body: {
        orderId: order._id.toString(),
        razorpay_order_id: order.razorpayOrderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: checkoutSig(order.razorpayOrderId, paymentId),
      },
    });
    gatewayPaymentOverride = null;
    const fresh = await Order.findById(order._id);
    ok(!!err && code === 'PAYMENT_NOT_VERIFIED', 'T4  valid signature + wrong gateway amount → rejected');
    ok(fresh.paymentStatus === 'PENDING' && (await vouchersFor(order._id)) === 0,
      'T4b amount mismatch → order still PENDING, 0 vouchers');
  }

  // T4c — valid signature but gateway payment not captured
  {
    const order = await makePendingOrder(user, product);
    gatewayPaymentOverride = { status: 'failed', order_id: order.razorpayOrderId, amount: order.total * 100, currency: 'INR' };
    const paymentId = 'pay_NOTCAP';
    const { err, code } = await run(verifyPayment, {
      user,
      body: {
        orderId: order._id.toString(),
        razorpay_order_id: order.razorpayOrderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: checkoutSig(order.razorpayOrderId, paymentId),
      },
    });
    gatewayPaymentOverride = null;
    ok(!!err && code === 'PAYMENT_NOT_VERIFIED', 'T4c valid signature + uncaptured payment → rejected');
    ok((await vouchersFor(order._id)) === 0, 'T4d uncaptured → 0 vouchers');
  }

  // T5 — fully valid: signature ok + gateway captured + correct amount → fulfil
  let paidOrderId;
  let paidRzpOrderId;
  {
    const order = await makePendingOrder(user, product);
    paidOrderId = order._id;
    paidRzpOrderId = order.razorpayOrderId;
    gatewayPaymentOverride = {
      status: 'captured', order_id: order.razorpayOrderId,
      amount: order.total * 100, currency: 'INR',
    };
    const paymentId = 'pay_GOOD1';
    const { res, err } = await run(verifyPayment, {
      user,
      body: {
        orderId: order._id.toString(),
        razorpay_order_id: order.razorpayOrderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: checkoutSig(order.razorpayOrderId, paymentId),
      },
    });
    gatewayPaymentOverride = null;
    const fresh = await Order.findById(order._id);
    ok(!err && res.body?.success && res.body?.paymentStatus === 'PAID', 'T5  fully verified payment → success');
    ok(fresh.paymentStatus === 'PAID' && fresh.fulfillmentStatus === 'FULFILLED', 'T5b order → PAID + FULFILLED');
    ok((await vouchersFor(order._id)) === 1, 'T5c exactly 1 voucher allocated');
    ok(fresh.razorpayPaymentId === paymentId, 'T5d captured payment id stored on order');
  }

  // T6 — idempotency: verifying again does not double-allocate
  {
    const order = await Order.findById(paidOrderId);
    const paymentId = 'pay_GOOD1';
    gatewayPaymentOverride = { status: 'captured', order_id: paidRzpOrderId, amount: order.total * 100, currency: 'INR' };
    const { res } = await run(verifyPayment, {
      user,
      body: {
        orderId: order._id.toString(),
        razorpay_order_id: paidRzpOrderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: checkoutSig(paidRzpOrderId, paymentId),
      },
    });
    gatewayPaymentOverride = null;
    ok(res.body?.success && (await vouchersFor(order._id)) === 1,
      'T6  repeat verify (idempotent) → still exactly 1 voucher');
  }

  // T7 — webhook with a bad signature is rejected
  {
    const order = await makePendingOrder(user, product);
    const bodyObj = {
      event: 'payment.captured',
      payload: { payment: { entity: { id: 'pay_WH', order_id: order.razorpayOrderId, amount: order.total * 100, currency: 'INR', status: 'captured' } } },
    };
    const raw = JSON.stringify(bodyObj);
    const { res } = await run(handleRazorpayWebhook, {
      body: bodyObj, rawBody: raw,
      headers: { 'x-razorpay-signature': 'not-a-real-signature', 'x-razorpay-event-id': 'evt_bad' },
    });
    ok(res.statusCode === 400, 'T7  webhook with bad signature → HTTP 400');
    ok((await Order.findById(order._id)).paymentStatus === 'PENDING' && (await vouchersFor(order._id)) === 0,
      'T7b bad webhook → order PENDING, 0 vouchers');
  }

  // T8 — webhook with a valid signature fulfils exactly once
  {
    const order = await makePendingOrder(user, product);
    const bodyObj = {
      event: 'payment.captured',
      payload: { payment: { entity: { id: 'pay_WH2', order_id: order.razorpayOrderId, amount: order.total * 100, currency: 'INR', status: 'captured' } } },
    };
    const raw = JSON.stringify(bodyObj);
    const headers = { 'x-razorpay-signature': webhookSig(raw), 'x-razorpay-event-id': `evt_good_${order.razorpayOrderId}` };
    const r1 = await run(handleRazorpayWebhook, { body: bodyObj, rawBody: raw, headers });
    const afterFirst = await vouchersFor(order._id);
    const r2 = await run(handleRazorpayWebhook, { body: bodyObj, rawBody: raw, headers }); // same event again
    const afterDup = await vouchersFor(order._id);
    const fresh = await Order.findById(order._id);
    ok(r1.res.statusCode === 200 && fresh.paymentStatus === 'PAID' && fresh.fulfillmentStatus === 'FULFILLED',
      'T8  valid webhook → order PAID + FULFILLED');
    ok(afterFirst === 1, 'T8b valid webhook → exactly 1 voucher');
    ok(r2.res.statusCode === 200 && afterDup === 1, 'T8c duplicate webhook event → still exactly 1 voucher');
  }

  // T8d — webhook with valid signature but tampered amount in payload → no fulfilment
  {
    const order = await makePendingOrder(user, product);
    const bodyObj = {
      event: 'payment.captured',
      payload: { payment: { entity: { id: 'pay_WH3', order_id: order.razorpayOrderId, amount: 1, currency: 'INR', status: 'captured' } } },
    };
    const raw = JSON.stringify(bodyObj);
    const headers = { 'x-razorpay-signature': webhookSig(raw), 'x-razorpay-event-id': `evt_tamper_${order.razorpayOrderId}` };
    const r = await run(handleRazorpayWebhook, { body: bodyObj, rawBody: raw, headers });
    ok(r.res.statusCode === 200 && (await Order.findById(order._id)).paymentStatus === 'PENDING' && (await vouchersFor(order._id)) === 0,
      'T8d signed webhook with wrong amount → ignored, order PENDING, 0 vouchers');
  }

  // T9 — the legacy "mark this order paid" backdoor no longer exists
  {
    const orderCtrl = await import('../controllers/orderController.js');
    const fs = await import('node:fs');
    const routesSrc = fs.readFileSync(new URL('../routes/orderRoutes.js', import.meta.url), 'utf8');
    const payCtrlSrc = fs.readFileSync(new URL('../controllers/paymentController.js', import.meta.url), 'utf8');
    ok(typeof orderCtrl.simulatePaymentSuccess === 'undefined', 'T9  orderController.simulatePaymentSuccess removed');
    ok(!/\.(post|get|put|patch)\(\s*['"`]\/:id\/pay/.test(routesSrc), 'T9b POST /api/orders/:id/pay route removed');
    ok(!/simulateSuccess/.test(payCtrlSrc), 'T9c ?simulateSuccess backdoor removed from payment controller');
    ok(!/env\s*===?\s*['"`]sandbox['"`]\s*\)?\s*\{?\s*[\r\n]*\s*isPaid\s*=\s*true/.test(payCtrlSrc),
      'T9d sandbox auto-pass removed from payment controller');
  }

  // T10 — the simulateSuccess query backdoor is gone from getPaymentStatus
  {
    const order = await makePendingOrder(user, product);
    const { res } = await run(getPaymentStatus, {
      user, params: { orderId: order._id.toString() }, body: {}, headers: {},
      // simulate ?simulateSuccess=true style tampering
    });
    // getPaymentStatus takes no query; even if it did, it is read-only.
    const fresh = await Order.findById(order._id);
    ok(fresh.paymentStatus === 'PENDING' && (res.body?.vouchers || []).length === 0,
      'T10 getPaymentStatus is read-only — cannot be coerced to fulfil');
  }

  // ── POST-PAYMENT: email failure, admin notification, account, IDOR ─────────

  // T11 — SMTP disabled in this suite: T5's fulfilled order stays PAID/FULFILLED
  {
    const o = await Order.findById(paidOrderId).lean();
    ok(o.paymentStatus === 'PAID' && o.fulfillmentStatus === 'FULFILLED',
      'T11  email send failed (SMTP off) → order still PAID + FULFILLED');
    ok(o.emailStatus === 'FAILED', 'T11b emailStatus recorded as FAILED');
    ok((await vouchersFor(paidOrderId)) === 1, 'T11c email failure did NOT allocate another voucher');
  }

  // T12 — admin "voucher sold" notification fires exactly once
  {
    const o = await Order.findById(paidOrderId).lean();
    ok(o.adminNotifiedAt instanceof Date, 'T12  adminNotifiedAt set after fulfillment');
    // Re-run fulfillment path via a duplicate webhook for the SAME order.
    const bodyObj = {
      event: 'payment.captured',
      payload: { payment: { entity: { id: 'pay_DUP12', order_id: paidRzpOrderId, amount: o.total * 100, currency: 'INR', status: 'captured' } } },
    };
    const raw = JSON.stringify(bodyObj);
    await run(handleRazorpayWebhook, {
      body: bodyObj, rawBody: raw,
      headers: { 'x-razorpay-signature': webhookSig(raw), 'x-razorpay-event-id': 'evt_dup_notif' },
    });
    const o2 = await Order.findById(paidOrderId).lean();
    ok(o2.adminNotifiedAt.getTime() === o.adminNotifiedAt.getTime(),
      'T12b duplicate fulfillment does NOT re-send the admin sale notification');
    ok((await vouchersFor(paidOrderId)) === 1, 'T12c still exactly 1 voucher');
  }

  // T13 — the customer's account shows the voucher + statuses
  {
    const { res } = await run(myVouchers, { user });
    const list = res.body?.data || [];
    const mine = list.filter((v) => String(v.orderId) === String(paidOrderId));
    ok(mine.length === 1, 'T13  myVouchers returns exactly the 1 purchased voucher');
    const v = mine[0];
    ok(v.code && v.voucherType === 'PTE' && v.orderNo && v.paymentStatus === 'PAID' &&
       v.fulfillmentStatus === 'FULFILLED' && v.emailStatus === 'FAILED' && v.amountPaid > 0,
      'T13b voucher row carries code + type + orderNo + paid/fulfilled/email/amount');
  }

  // T14 — IDOR: another customer can never see this voucher/order
  {
    const order = await Order.findById(paidOrderId);
    const r1 = await run(getPaymentStatus, { user: attacker, params: { orderId: order._id.toString() } });
    ok(!!r1.err && (r1.err.statusCode === 403 || r1.err.statusCode === 404),
      'T14  getPaymentStatus for another user → 403/404');

    const r2 = await run(getOrder, { user: attacker, params: { id: order._id.toString() } });
    ok(!!r2.err && r2.err.statusCode === 404, 'T14b GET /api/orders/:id for another user → 404 (no disclosure)');

    const r3 = await run(verifyPayment, {
      user: attacker,
      body: {
        orderId: order._id.toString(), razorpay_order_id: order.razorpayOrderId,
        razorpay_payment_id: 'pay_X', razorpay_signature: checkoutSig(order.razorpayOrderId, 'pay_X'),
      },
    });
    ok(!!r3.err && r3.err.code === 'ORDER_FORBIDDEN', 'T14c verifyPayment for another user → ORDER_FORBIDDEN');

    const r4 = await run(myVouchers, { user: attacker });
    const leaked = (r4.res.body?.data || []).some((v) => String(v.orderId) === String(paidOrderId));
    ok(!leaked, 'T14d attacker myVouchers does NOT contain the victim voucher');

    const r5 = await run(myOrders, { user: attacker });
    const leakedOrder = (r5.res.body?.data || []).some((o) => String(o._id) === String(paidOrderId));
    ok(!leakedOrder, 'T14e attacker myOrders does NOT contain the victim order');
  }

  // ── RECONCILIATION: the self-heal path (browser callback never ran) ───────

  // T20 — order PENDING + a captured gateway payment exists → reconcile fulfils
  {
    const order = await makePendingOrder(user, product);
    gatewayOrderPaymentsOverride = [
      { id: 'pay_RECON1', status: 'captured', order_id: order.razorpayOrderId, amount: order.total * 100, currency: 'INR', method: 'upi' },
    ];
    const { res } = await run(reconcilePayment, { user, params: { orderId: order._id.toString() } });
    gatewayOrderPaymentsOverride = null;
    const fresh = await Order.findById(order._id);
    ok(res.body?.success && fresh.paymentStatus === 'PAID' && fresh.fulfillmentStatus === 'FULFILLED',
      'T20  reconcile with a captured gateway payment → PAID + FULFILLED');
    ok((await vouchersFor(order._id)) === 1, 'T20b reconcile allocated exactly 1 voucher');
    ok(fresh.razorpayPaymentId === 'pay_RECON1', 'T20c captured payment id recorded');

    // idempotent — a second reconcile / status poll must not double-allocate
    const r2 = await run(reconcilePayment, { user, params: { orderId: order._id.toString() } });
    const r3 = await run(getPaymentStatus, { user, params: { orderId: order._id.toString() } });
    ok((await vouchersFor(order._id)) === 1 && r2.res.body?.success && r3.res.body?.success,
      'T20d repeat reconcile + status poll → still exactly 1 voucher');
  }

  // T21 — order PENDING, gateway has only a FAILED payment → no voucher, order FAILED
  {
    const order = await makePendingOrder(user, product);
    gatewayOrderPaymentsOverride = [
      { id: 'pay_FAIL', status: 'failed', order_id: order.razorpayOrderId, amount: order.total * 100, currency: 'INR' },
    ];
    await run(reconcilePayment, { user, params: { orderId: order._id.toString() } });
    gatewayOrderPaymentsOverride = null;
    const fresh = await Order.findById(order._id);
    ok(fresh.paymentStatus === 'FAILED' && (await vouchersFor(order._id)) === 0,
      'T21  reconcile with only a failed payment → order FAILED, 0 vouchers');
  }

  // T22 — order PENDING, gateway has NO payment yet → stays PENDING, 0 vouchers
  {
    const order = await makePendingOrder(user, product);
    gatewayOrderPaymentsOverride = [];
    const { res } = await run(reconcilePayment, { user, params: { orderId: order._id.toString() } });
    gatewayOrderPaymentsOverride = null;
    const fresh = await Order.findById(order._id);
    ok(res.body?.pending === true && fresh.paymentStatus === 'PENDING' && (await vouchersFor(order._id)) === 0,
      'T22  reconcile with no gateway payment → PENDING, 0 vouchers');
  }

  // T23 — gateway captured but amount mismatch → NOT fulfilled
  {
    const order = await makePendingOrder(user, product);
    gatewayOrderPaymentsOverride = [
      { id: 'pay_WRONGAMT', status: 'captured', order_id: order.razorpayOrderId, amount: 1, currency: 'INR' },
    ];
    await run(reconcilePayment, { user, params: { orderId: order._id.toString() } });
    gatewayOrderPaymentsOverride = null;
    ok((await Order.findById(order._id)).paymentStatus === 'PENDING' && (await vouchersFor(order._id)) === 0,
      'T23  reconcile: captured payment with wrong amount → not fulfilled');
  }

  // T24 — CANCELLED order with a captured gateway payment → NOT auto-fulfilled
  {
    const order = await makePendingOrder(user, product);
    await Order.updateOne({ _id: order._id }, { $set: { paymentStatus: 'CANCELLED', orderStatus: 'CANCELLED' } });
    gatewayOrderPaymentsOverride = [
      { id: 'pay_LATE', status: 'captured', order_id: order.razorpayOrderId, amount: order.total * 100, currency: 'INR' },
    ];
    const { res } = await run(reconcilePayment, { user, params: { orderId: order._id.toString() } });
    gatewayOrderPaymentsOverride = null;
    const fresh = await Order.findById(order._id);
    ok(fresh.paymentStatus === 'CANCELLED' && (await vouchersFor(order._id)) === 0 && res.body?.notCollectable === true,
      'T24  reconcile: CANCELLED order + captured payment → not fulfilled, flagged for admin');
  }

  // T25 — reconcile enforces ownership (IDOR)
  {
    const order = await makePendingOrder(user, product);
    const { res, err } = await run(reconcilePayment, { user: attacker, params: { orderId: order._id.toString() } });
    ok((err && err.code === 'ORDER_FORBIDDEN') || res.statusCode === 403,
      'T25  reconcile for another user → ORDER_FORBIDDEN');
  }

  // T15 — voucher/order responses never leak the Razorpay secret
  {
    const { res } = await run(getPaymentStatus, { user, params: { orderId: paidOrderId.toString() } });
    ok(!JSON.stringify(res.body || {}).includes(SECRET), 'T15  payment status response has no key secret');
    const { res: vr } = await run(myVouchers, { user });
    ok(!JSON.stringify(vr.body || {}).includes(SECRET), 'T15b myVouchers response has no key secret');
  }

  await cleanup();
  await mongoose.disconnect();

  console.log(`\n=== RESULT: ${pass} passed, ${fail} failed ===\n`);
  process.exit(fail > 0 ? 1 : 0);
};

main().catch(async (err) => {
  console.error('SUITE CRASHED:', err);
  try { await cleanup(); await mongoose.disconnect(); } catch {}
  process.exit(1);
});
