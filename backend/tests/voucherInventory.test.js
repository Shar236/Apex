/**
 * Admin voucher inventory regression suite.
 *
 * Covers the safe-delete rules in services/voucherInventory.js:
 *   1. AVAILABLE / EXPIRED / INVALID / CANCELLED codes are deletable
 *   2. SOLD / ASSIGNED / USED codes are NEVER deleted (order history preserved)
 *   3. A code linked to an order survives even if its status was hand-edited
 *   4. Bulk delete removes what it can and reports what it kept
 *   5. Delete preview matches what the delete actually does
 *   6. Marking EXPIRED / INVALID keeps the row (the soft-retire path)
 *   7. A delivered code cannot be returned to AVAILABLE
 *   8. Field updates are whitelisted — code / userId / orderId are not writable
 *   9. Input validation (empty ids, bad ids, oversized batches, bad status)
 *
 * Runs against the configured MongoDB and cleans up after itself.
 *
 *   node backend/tests/voucherInventory.test.js
 */
import dotenv from 'dotenv';
dotenv.config();

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
const {
  deleteVouchers,
  previewVoucherDeletion,
  setVoucherStatuses,
  updateVoucherFields,
} = await import('../services/voucherInventory.js');

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

const TAG = `VINV${Date.now()}`;
const future = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

const run = async () => {
  console.log('\n=== ADMIN VOUCHER INVENTORY SUITE ===\n');
  await connectDB();

  const admin = { _id: new mongoose.Types.ObjectId(), email: `inv-admin+${TAG}@apexvouchers.in` };

  const product = await Product.create({
    name: `Inventory Test Product ${TAG}`,
    slug: `inventory-test-${TAG.toLowerCase()}`,
    brand: 'PEARSON',
    provider: 'Pearson',
    voucherType: 'PTE',
    sellingPrice: 100,
    originalPrice: 120,
    active: false, // never surfaced to the storefront
  });

  const customer = await User.create({
    name: 'Inventory Test Customer',
    email: `inv-cust+${TAG}@apexvouchers.in`,
    passwordHash: 'x'.repeat(60),
    emailVerified: true,
  });

  const order = await Order.create({
    orderNo: `ORD-${TAG}`,
    userId: customer._id,
    items: [
      { productId: product._id, productName: product.name, voucherType: 'PTE', unitPrice: 100, originalPrice: 120, quantity: 1 },
    ],
    subtotal: 100,
    total: 100,
    paymentStatus: 'PAID',
    orderStatus: 'FULFILLED',
    fulfillmentStatus: 'FULFILLED',
  });

  const mk = (suffix, extra = {}) =>
    VoucherCode.create({
      code: `${TAG}-${suffix}`,
      productId: product._id,
      voucherType: 'PTE',
      expiryDate: future,
      ...extra,
    });

  // ── 1. Removable statuses ────────────────────────────────────────────────
  console.log('── Test 1: Removable inventory statuses are deleted ──');
  const available = await mk('AVAIL');
  const expired = await mk('EXP', { status: 'EXPIRED' });
  const invalid = await mk('INV', { status: 'INVALID' });
  const cancelled = await mk('CAN', { status: 'CANCELLED' });

  const r1 = await deleteVouchers({ ids: [available._id, expired._id, invalid._id, cancelled._id], admin });
  ok(r1.deleted === 4, 'all 4 free codes deleted', `deleted=${r1.deleted}`);
  ok(r1.skipped.length === 0, 'nothing skipped');
  ok((await VoucherCode.countDocuments({ _id: { $in: [available._id, expired._id, invalid._id, cancelled._id] } })) === 0,
    'rows are gone from the collection');

  // ── 2. Historical statuses are preserved ─────────────────────────────────
  console.log('\n── Test 2: Delivered codes are never deleted ──');
  const sold = await mk('SOLD', { status: 'SOLD', userId: customer._id, orderId: order._id, soldAt: new Date() });
  const assigned = await mk('ASSIGNED', { status: 'ASSIGNED', userId: customer._id, orderId: order._id });
  const used = await mk('USED', { status: 'USED', userId: customer._id, orderId: order._id });

  const r2 = await deleteVouchers({ ids: [sold._id, assigned._id, used._id], admin });
  ok(r2.deleted === 0, 'nothing deleted', `deleted=${r2.deleted}`);
  ok(r2.skipped.length === 3, 'all 3 reported as skipped', `skipped=${r2.skipped.length}`);
  ok(r2.skipped.every((s) => /order history/i.test(s.reason)), 'skip reason explains order history');
  ok((await VoucherCode.countDocuments({ _id: { $in: [sold._id, assigned._id, used._id] } })) === 3,
    'delivered rows still exist');
  ok(r2.skipped.every((s) => !String(s.code).includes(TAG)), 'skipped payload masks the code');

  // ── 3. Order linkage beats a hand-edited status ──────────────────────────
  console.log('\n── Test 3: An order-linked code survives a hand-edited status ──');
  const spoofed = await mk('SPOOF', { status: 'AVAILABLE', orderId: order._id, userId: customer._id });
  const r3 = await deleteVouchers({ ids: [spoofed._id], admin });
  ok(r3.deleted === 0, 'AVAILABLE-but-order-linked code not deleted');
  ok(await VoucherCode.exists({ _id: spoofed._id }), 'row still exists');

  // ── 4. Mixed bulk delete ─────────────────────────────────────────────────
  console.log('\n── Test 4: Mixed bulk delete removes only the free codes ──');
  const free1 = await mk('FREE1');
  const free2 = await mk('FREE2', { status: 'EXPIRED' });
  const mixedIds = [free1._id, free2._id, sold._id, assigned._id];
  const preview = await previewVoucherDeletion(mixedIds);
  ok(preview.removable.length === 2, 'preview: 2 removable', `got ${preview.removable.length}`);
  ok(preview.blocked.length === 2, 'preview: 2 blocked', `got ${preview.blocked.length}`);

  const r4 = await deleteVouchers({ ids: mixedIds, admin });
  ok(r4.deleted === 2, 'delete matches the preview', `deleted=${r4.deleted}`);
  ok(r4.skipped.length === 2, 'skipped matches the preview');
  ok(await VoucherCode.exists({ _id: sold._id }), 'delivered code survived the mixed batch');

  // ── 5. Soft retire keeps the row ─────────────────────────────────────────
  console.log('\n── Test 5: Mark expired / invalid keeps the record ──');
  const retire1 = await mk('RET1');
  const retire2 = await mk('RET2');
  const r5 = await setVoucherStatuses({ ids: [retire1._id, retire2._id], status: 'EXPIRED', admin });
  ok(r5.modified === 2, '2 codes marked EXPIRED', `modified=${r5.modified}`);
  ok((await VoucherCode.findById(retire1._id)).status === 'EXPIRED', 'status persisted');
  ok(await VoucherCode.exists({ _id: retire2._id }), 'row kept, not deleted');

  const r5b = await setVoucherStatuses({ ids: [retire1._id], status: 'INVALID', admin });
  ok(r5b.modified === 1 && (await VoucherCode.findById(retire1._id)).status === 'INVALID', 'EXPIRED → INVALID allowed');

  // ── 6. A delivered code cannot re-enter inventory ────────────────────────
  console.log('\n── Test 6: A delivered code cannot be returned to AVAILABLE ──');
  const r6 = await setVoucherStatuses({ ids: [sold._id], status: 'AVAILABLE', admin });
  ok(r6.modified === 0, 'not returned to inventory', `modified=${r6.modified}`);
  ok(r6.skipped.length === 1 && /delivered/i.test(r6.skipped[0].reason), 'skip reason explains why');
  ok((await VoucherCode.findById(sold._id)).status === 'SOLD', 'still SOLD');

  await expectThrow(
    () => updateVoucherFields({ id: sold._id, patch: { status: 'AVAILABLE' }, admin }),
    'VOUCHER_ALREADY_DELIVERED',
    'single-voucher edit also refuses to un-sell a code'
  );

  // A free code CAN be returned to inventory.
  const backIn = await mk('BACK', { status: 'EXPIRED' });
  const r6b = await setVoucherStatuses({ ids: [backIn._id], status: 'AVAILABLE', admin });
  ok(r6b.modified === 1 && (await VoucherCode.findById(backIn._id)).status === 'AVAILABLE',
    'an unsold EXPIRED code can be returned to AVAILABLE');

  // ── 7. Field whitelist ───────────────────────────────────────────────────
  console.log('\n── Test 7: Voucher edits are whitelisted ──');
  const editable = await mk('EDIT');
  const originalCode = editable.code;
  const newExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const updated = await updateVoucherFields({
    id: editable._id,
    patch: {
      expiryDate: newExpiry,
      status: 'INVALID',
      // Every field below must be ignored — these are owned by the fulfillment
      // pipeline and rewriting them would silently break an order's linkage.
      code: 'HACKED-CODE-0001',
      userId: customer._id,
      orderId: order._id,
      soldTo: 'attacker@example.com',
      productId: new mongoose.Types.ObjectId(),
      voucherType: 'TOEFL',
    },
    admin,
  });
  ok(updated.code === originalCode, 'code not rewritable', `got ${updated.code}`);
  ok(!updated.userId, 'userId not rewritable');
  ok(!updated.orderId, 'orderId not rewritable');
  ok(!updated.soldTo, 'soldTo not rewritable');
  ok(String(updated.productId) === String(product._id), 'productId not rewritable');
  ok(updated.voucherType === 'PTE', 'voucherType not rewritable');
  ok(updated.status === 'INVALID', 'whitelisted status applied');
  ok(Math.abs(updated.expiryDate.getTime() - newExpiry.getTime()) < 1000, 'whitelisted expiryDate applied');

  await expectThrow(
    () => updateVoucherFields({ id: editable._id, patch: { status: 'SOLD' }, admin }),
    'INVALID_STATUS',
    'cannot hand-set a fulfillment-owned status (SOLD)'
  );
  await expectThrow(
    () => updateVoucherFields({ id: editable._id, patch: { code: 'NOPE' }, admin }),
    'NOTHING_TO_UPDATE',
    'a patch of only non-editable fields is rejected'
  );

  // ── 8. Input validation ──────────────────────────────────────────────────
  console.log('\n── Test 8: Input validation ──');
  await expectThrow(() => deleteVouchers({ ids: [], admin }), 'IDS_REQUIRED', 'empty ids rejected');
  await expectThrow(() => deleteVouchers({ ids: ['not-an-objectid'], admin }), 'INVALID_VOUCHER_ID', 'malformed id rejected');
  await expectThrow(
    () => deleteVouchers({ ids: Array.from({ length: 501 }, () => new mongoose.Types.ObjectId().toString()), admin }),
    'TOO_MANY_IDS',
    'oversized batch rejected'
  );
  await expectThrow(
    () => deleteVouchers({ ids: [new mongoose.Types.ObjectId()], admin }),
    'VOUCHER_NOT_FOUND',
    'unknown id → 404'
  );
  await expectThrow(
    () => setVoucherStatuses({ ids: [editable._id], status: 'BOGUS', admin }),
    'INVALID_STATUS',
    'unknown status rejected'
  );

  // ── Cleanup ──────────────────────────────────────────────────────────────
  console.log('\n── Cleanup ──');
  await VoucherCode.deleteMany({ code: new RegExp(`^${TAG}-`) });
  await Order.deleteOne({ _id: order._id });
  await User.deleteOne({ _id: customer._id });
  await Product.deleteOne({ _id: product._id });

  console.log(`\n=== VOUCHER INVENTORY SUITE COMPLETE: ${passed} passed, ${failed} failed ===\n`);
  await mongoose.connection.close();
  process.exit(failed > 0 ? 1 : 0);
};

run().catch(async (err) => {
  console.error('\n💥 SUITE CRASHED:', err);
  await mongoose.connection.close().catch(() => {});
  process.exit(1);
});
