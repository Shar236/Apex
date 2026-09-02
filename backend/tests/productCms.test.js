/**
 * Product-level Redemption CMS regression suite.
 *
 * Covers the "redemption content is data-driven and product-specific" contract:
 *   - a product carries its own redemptionGuide (steps + screenshots + urls),
 *     productContent (sanitized HTML), importantInfo/Notes and curated
 *     relatedProducts ("Explore More")
 *   - URLs are validated; step order is re-derived from array position; empty
 *     steps are dropped but partial steps are kept (save-before-finish)
 *   - productContent HTML is sanitized (no <script> / on* handlers)
 *   - the public getProduct returns Explore More in the admin-curated order and
 *     drops self / missing references
 *   - legacy products (redemptionSteps only, or nothing configured) still work
 *
 * Creates only "TEST-PRODCMS" prefixed products and cleans up afterwards.
 *   node backend/tests/productCms.test.js
 */
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { Product } from '../models/index.js';
import { createProduct, updateProduct, getAdminProduct } from '../controllers/adminController.js';
import { getProduct } from '../controllers/productController.js';

const TAG = 'TEST-PRODCMS';
let pass = 0;
let fail = 0;
const ok = (cond, name, extra = '') => {
  if (cond) { pass++; console.log(`  ✅ ${name}`); }
  else { fail++; console.log(`  ❌ ${name}${extra ? ` — ${extra}` : ''}`); }
};

const mockRes = () => {
  const res = { statusCode: 200, body: null };
  res.status = (c) => { res.statusCode = c; return res; };
  res.json = (b) => { res.body = b; return res; };
  return res;
};
const run = async (handler, { body = {}, params = {}, user = { _id: new mongoose.Types.ObjectId(), email: `${TAG}@apex.test`, role: 'admin' } } = {}) => {
  const res = mockRes();
  let nextErr = null;
  const req = { user, body, params, ip: '127.0.0.1', headers: {} };
  await handler(req, res, (err) => { nextErr = err || new Error('next() with no error'); });
  return { res, err: nextErr, body: res.body, status: nextErr?.statusCode || res.statusCode };
};

const cleanup = async () => {
  await Product.deleteMany({ name: new RegExp(`^${TAG}`, 'i') });
};

const baseBody = (name, extra = {}) => ({
  name: `${TAG} ${name}`,
  provider: 'Pearson',
  brand: 'Pearson PTE',
  category: 'English Language Test',
  originalPrice: 20000,
  sellingPrice: 15000,
  ...extra,
});

const runTests = async () => {
  console.log('================================================================');
  console.log('🧪 PRODUCT REDEMPTION CMS');
  console.log('================================================================\n');
  await connectDB();
  await cleanup();

  // ── 1. create a product with a full redemption guide ─────────────────────
  console.log('— create: full redemption guide —');
  const created = await run(createProduct, {
    body: baseBody('PTE', {
      redemptionGuide: {
        enabled: true,
        providerLabel: 'Pearson',
        officialUrl: 'https://www.pearsonpte.com/',
        buttonText: 'Visit Official Pearson Website',
        introduction: 'Redeem your PTE voucher on the official Pearson booking site.',
        warnings: ['Always use the official link supplied with your voucher.', '  '],
        steps: [
          { title: 'Open the official website', description: 'Open the Pearson booking website.', screenshot: { url: 'https://res.cloudinary.com/demo/image/upload/step1.png', publicId: 'apex_products/redemption/step1', alt: 'Booking page', caption: 'Pearson booking page', width: 1600, height: 900 } },
          { title: 'Log in', description: 'Sign in with your Pearson account.', importantNote: 'Use the same email as your booking.' },
          { title: '', description: '', screenshot: {} }, // empty → dropped
        ],
      },
      productContent: {
        enabled: true,
        heading: 'About the PTE Academic Voucher',
        content: '<h2>About</h2><p>Genuine voucher.</p><script>alert(1)</script><img src="x" onerror="alert(2)">',
      },
      importantInfo: [
        { label: 'Voucher Validity', value: '6 Months' },
        { label: '', value: '' }, // dropped
      ],
      importantNotes: ['Use the official booking link.', ''],
      faqs: [
        { question: 'Where do I redeem this voucher?', answer: 'On the official Pearson website.' },
        { question: '', answer: 'orphan' }, // dropped
      ],
    }),
  });
  ok(created.status === 201, 'createProduct → 201', JSON.stringify(created.body || created.err?.message).slice(0, 160));
  const pteId = created.body?.data?._id;
  const g = created.body?.data?.redemptionGuide;
  ok(g?.enabled === true, 'guide enabled persisted');
  ok(g?.steps?.length === 2, 'empty step dropped, 2 steps kept', `got ${g?.steps?.length}`);
  ok(g?.steps?.[0]?.order === 1 && g?.steps?.[1]?.order === 2, 'step order re-derived from position');
  ok(g?.steps?.[0]?.screenshot?.publicId === 'apex_products/redemption/step1', 'screenshot publicId persisted');
  ok(g?.steps?.[0]?.screenshot?.width === 1600, 'screenshot width persisted');
  ok(g?.warnings?.length === 1, 'blank warning trimmed out');
  ok(!!g?.lastUpdated, 'guide.lastUpdated stamped');
  ok(created.body?.data?.productContent?.content && !/<script/i.test(created.body.data.productContent.content), 'productContent <script> stripped');
  ok(!/onerror/i.test(created.body?.data?.productContent?.content || ''), 'productContent on* handler stripped');
  ok(created.body?.data?.importantInfo?.length === 1, 'blank importantInfo row dropped');
  ok(created.body?.data?.importantNotes?.length === 1, 'blank importantNote dropped');
  ok(created.body?.data?.faqs?.length === 1, 'FAQ missing a field dropped');

  // ── 2. getAdminProduct round-trips ──────────────────────────────────────
  const adminGet = await run(getAdminProduct, { params: { id: pteId } });
  ok(adminGet.status === 200 && adminGet.body?.data?.redemptionGuide?.steps?.length === 2, 'getAdminProduct returns the stored guide');

  // ── 3. URL validation ──────────────────────────────────────────────────
  console.log('\n— validation —');
  const badOfficial = await run(createProduct, { body: baseBody('BadUrl', { redemptionGuide: { enabled: true, officialUrl: 'not-a-url', steps: [] } }) });
  ok(badOfficial.status === 400, 'invalid guide officialUrl → 400');
  const badVideo = await run(createProduct, { body: baseBody('BadVideo', { redemptionGuide: { enabled: true, steps: [{ title: 'x', description: 'y', videoUrl: 'javascript:evil' }] } }) });
  ok(badVideo.status === 400, 'invalid step videoUrl → 400');

  // ── 4. Explore More: curated order, self + missing refs filtered ─────────
  console.log('\n— explore more —');
  const ielts = await run(createProduct, { body: baseBody('IELTS', { provider: 'IDP', brand: 'IELTS IDP' }) });
  const toefl = await run(createProduct, { body: baseBody('TOEFL', { provider: 'ETS', brand: 'ETS TOEFL' }) });
  const ieltsId = ielts.body?.data?._id;
  const toeflId = toefl.body?.data?._id;
  const missingId = new mongoose.Types.ObjectId().toString();

  const upd = await run(updateProduct, {
    params: { id: pteId },
    body: {
      relatedProducts: [toeflId, ieltsId, pteId, missingId, 'not-an-object-id'],
      redemptionGuide: {
        enabled: true,
        officialUrl: 'https://mypte.pearsonpte.com/',
        steps: [
          { title: 'Log in first', description: 'Updated first step.' },
          { title: 'Then open the site', description: 'Updated second step.' },
        ],
      },
      faqs: [
        { question: 'Where do I redeem this voucher?', answer: 'On the official Pearson website.' },
        { question: 'Is it genuine?', answer: 'Yes, 100% official.' },
      ],
    },
  });
  ok(upd.status === 200, 'updateProduct → 200', JSON.stringify(upd.body || upd.err?.message).slice(0, 160));
  const storedRelated = (upd.body?.data?.relatedProducts || []).map(String);
  ok(storedRelated.length === 3, 'self-id + non-ObjectId stripped from relatedProducts (valid-but-missing id kept, pruned at read time)', `got ${storedRelated.length}`);
  ok(!storedRelated.includes(String(pteId)), 'self reference not stored in relatedProducts');
  ok(upd.body?.data?.redemptionGuide?.steps?.[0]?.title === 'Log in first', 'step title updated');
  ok(upd.body?.data?.redemptionGuide?.officialUrl === 'https://mypte.pearsonpte.com/', 'officialUrl updated');

  const pub = await run(getProduct, { params: { id: pteId }, user: undefined });
  ok(pub.status === 200, 'public getProduct → 200');
  const relNames = (pub.body?.relatedProducts || []).map((r) => r.name);
  ok(relNames.length === 2, 'missing ref dropped from Explore More', `got ${relNames.length}`);
  ok(relNames[0] === `${TAG} TOEFL` && relNames[1] === `${TAG} IELTS`, 'Explore More preserves the admin-curated order', relNames.join(', '));
  ok(!!pub.body?.structuredData?.faq, 'FAQPage JSON-LD present when the product has FAQs');
  ok(pub.body?.data?.redemptionGuide?.steps?.length === 2, 'public payload carries the structured guide');

  // ── 5. legacy / empty behaviour ────────────────────────────────────────
  console.log('\n— backward compatibility —');
  const legacy = await run(createProduct, { body: baseBody('Legacy', { redemptionSteps: ['Log in to the provider site', 'Apply the voucher at checkout'] }) });
  const legacyId = legacy.body?.data?._id;
  const legacyPub = await run(getProduct, { params: { id: legacyId }, user: undefined });
  ok(legacyPub.status === 200 && Array.isArray(legacyPub.body?.data?.redemptionSteps) && legacyPub.body.data.redemptionSteps.length === 2, 'legacy redemptionSteps[] still returned');
  ok(!legacyPub.body?.data?.redemptionGuide?.enabled, 'legacy product has no enabled structured guide');
  ok(!legacyPub.body?.structuredData?.faq, 'no FAQ JSON-LD when the product has no FAQs');

  const noGuide = await run(createProduct, { body: baseBody('NoGuide', { redemptionGuide: { enabled: false, steps: [] } }) });
  const noGuidePub = await run(getProduct, { params: { id: noGuide.body?.data?._id }, user: undefined });
  ok(noGuidePub.status === 200, 'product with a disabled/empty guide still serves');

  // ── 6. screenshot removal on update ────────────────────────────────────
  console.log('\n— screenshot lifecycle —');
  const shotProduct = await run(createProduct, {
    body: baseBody('Shots', {
      redemptionGuide: {
        enabled: true,
        steps: [{ title: 'Step', description: 'Has a screenshot', screenshot: { url: 'https://res.cloudinary.com/demo/image/upload/keepme.png', publicId: 'apex_products/redemption/keepme' } }],
      },
    }),
  });
  const shotId = shotProduct.body?.data?._id;
  const removed = await run(updateProduct, {
    params: { id: shotId },
    body: { redemptionGuide: { enabled: true, steps: [{ title: 'Step', description: 'Screenshot removed', screenshot: {} }] } },
  });
  ok(removed.status === 200, 'updateProduct removing a screenshot → 200');
  const fresh = await Product.findById(shotId).lean();
  const refs = (fresh.redemptionGuide?.steps || []).map((s) => s.screenshot?.publicId).filter(Boolean);
  ok(refs.length === 0, 'removed screenshot publicId no longer stored on the product');

  await cleanup();
  await mongoose.disconnect();
  console.log(`\n================================================================`);
  console.log(`${pass} passed, ${fail} failed`);
  console.log(`================================================================`);
  process.exit(fail ? 1 : 0);
};

runTests().catch(async (e) => {
  console.error(e);
  try { await cleanup(); await mongoose.disconnect(); } catch {}
  process.exit(1);
});
