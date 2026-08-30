import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { Order } from '../models/index.js';
import { reconcileOrderPayment } from '../controllers/paymentController.js';

/**
 * reconcilePendingPayments
 * ────────────────────────
 * Finds orders that have a Razorpay order id but were never fulfilled (the
 * Checkout callback never ran and no webhook was configured), asks Razorpay
 * whether a captured payment exists, and — for a genuine captured payment of
 * the exact amount — runs the same single fulfilment gate.
 *
 *   node scripts/reconcilePendingPayments.js                 → DRY RUN, PENDING orders
 *   node scripts/reconcilePendingPayments.js --commit        → actually fulfil them
 *   node scripts/reconcilePendingPayments.js --order APX-...  → just this one
 *   node scripts/reconcilePendingPayments.js --include-cancelled
 *        → also REPORT cancelled/failed orders that actually have a captured payment
 *   node scripts/reconcilePendingPayments.js --reopen APX-... --commit
 *        → re-open a wrongly-cancelled PAID order and fulfil it
 *
 * Safe: read-only against our DB until a real captured payment is confirmed by
 * the gateway; idempotent; never fulfils a deliberately cancelled order unless
 * you name it with --reopen.
 */

const args = process.argv.slice(2);
const COMMIT = args.includes('--commit');
const INCLUDE_CANCELLED = args.includes('--include-cancelled');
const only = (args.find((a) => a === '--order') && args[args.indexOf('--order') + 1]) || null;
const reopen = (args.find((a) => a === '--reopen') && args[args.indexOf('--reopen') + 1]) || null;

const run = async () => {
  await connectDB();

  if (reopen) {
    const order = await Order.findOne({ orderNo: reopen });
    if (!order) { console.error(`Order ${reopen} not found`); process.exit(1); }
    console.log(`\n--reopen ${order.orderNo}  (currently ${order.paymentStatus}/${order.orderStatus})`);
    if (!COMMIT) { console.log('  DRY RUN — re-run with --commit to re-open + fulfil.'); await mongoose.disconnect(); process.exit(0); }
    await Order.updateOne({ _id: order._id }, { $set: { paymentStatus: 'PENDING', orderStatus: 'PAYMENT_PENDING', fulfillmentStatus: 'PENDING' } });
    const fresh = await Order.findById(order._id).populate('userId');
    const res = await reconcileOrderPayment({ order: fresh, user: fresh.userId, source: 'reopen-script' });
    const done = await Order.findById(order._id);
    console.log(`  → ${done.paymentStatus}/${done.orderStatus}/${done.fulfillmentStatus}  reconciled=${res.reconciled} reason=${res.reason || '-'}`);
    await mongoose.disconnect();
    process.exit(0);
  }

  const filter = { razorpayOrderId: { $ne: null } };
  if (only) filter.orderNo = only;
  else if (INCLUDE_CANCELLED) filter.paymentStatus = { $in: ['PENDING', 'CANCELLED', 'FAILED'] };
  else filter.paymentStatus = 'PENDING';

  const orders = await Order.find(filter).sort({ createdAt: -1 }).populate('userId').lean();
  console.log(`\n${COMMIT ? 'COMMIT' : 'DRY RUN'} — ${orders.length} candidate order(s)\n${'='.repeat(70)}`);

  let fulfilled = 0;
  let flagged = 0;
  for (const o of orders) {
    const doc = await Order.findById(o._id).populate('userId');
    const before = `${doc.paymentStatus}/${doc.orderStatus}`;

    if (!COMMIT) {
      // Dry run still queries the gateway (read-only) so you see what WOULD happen.
      const res = await reconcileOrderPayment({ order: doc, user: doc.userId, source: 'dry-run', dryRun: true })
        .catch((e) => ({ reason: 'ERROR:' + e.message }));
      const tag = res.alreadyFulfilled ? 'already fulfilled'
        : res.wouldFail ? 'gateway shows FAILED → would mark order FAILED'
        : res.wouldFulfil ? `WOULD FULFIL (captured payment ${res.razorpayPaymentId})`
        : res.reason === 'ORDER_NOT_COLLECTABLE' ? `⚠ PAID BUT ${before} — needs refund or --reopen (${res.capturedPaymentId})`
        : `no action (${res.reason})`;
      console.log(`  ${o.orderNo}  ${before}  ₹${o.total}  →  ${tag}`);
      if (res.wouldFulfil) fulfilled += 1;
      if (res.reason === 'ORDER_NOT_COLLECTABLE') flagged += 1;
      continue;
    }

    const res = await reconcileOrderPayment({ order: doc, user: doc.userId, source: 'reconcile-script' })
      .catch((e) => ({ reason: 'ERROR:' + e.message }));
    const after = await Order.findById(o._id);
    console.log(`  ${o.orderNo}  ${before} → ${after.paymentStatus}/${after.orderStatus}/${after.fulfillmentStatus}  (${res.reason || (res.reconciled ? 'reconciled' : '-')})`);
    if (res.reconciled && !res.failed && !res.needsAllocation) fulfilled += 1;
    if (res.reason === 'ORDER_NOT_COLLECTABLE') flagged += 1;
  }

  console.log(`\n${'='.repeat(70)}\n${fulfilled} fulfilled/fulfillable · ${flagged} flagged (paid but not collectable).`);
  if (!COMMIT && fulfilled) console.log('Re-run with --commit to apply.');
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((e) => { console.error(e); process.exit(1); });
