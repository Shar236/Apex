/**
 * Admin module functional suite — Blog, SEO, Reels, Awards, CMS, Coupons,
 * Campaigns, PTE Bookings, Customers, Orders, Audit Logs, Dashboard.
 *
 * These modules were never covered by a test. This suite boots the real Express
 * app on an ephemeral port and drives each module over HTTP exactly as the admin
 * console does — create, read, update, publish, status change, delete — then
 * checks the customer-facing side reflects it. It also asserts that a customer
 * token is rejected everywhere an admin token is required.
 *
 * Everything it creates is tagged and removed at the end.
 *
 *   node backend/tests/adminModules.test.js
 */
import dotenv from 'dotenv';
dotenv.config();

process.env.SMTP_HOST = '';
process.env.SMTP_USER = '';
process.env.SMTP_PASSWORD = '';
process.env.SMTP_FROM = '';

const http = (await import('node:http')).default;
const mongoose = (await import('mongoose')).default;
const app = (await import('../app.js')).default;
const { connectDB } = await import('../config/db.js');
const { User } = await import('../models/User.js');
const { BlogPost } = await import('../models/BlogPost.js');
const { Award } = await import('../models/Award.js');
const { Video } = await import('../models/Video.js');
const { Promotion } = await import('../models/Promotion.js');
const { Campaign } = await import('../models/Campaign.js');
const { Redirect } = await import('../models/Redirect.js');
const { signToken } = await import('../middleware/auth.js');

let passed = 0;
let failed = 0;
const fails = [];
const ok = (cond, name, extra = '') => {
  if (cond) { console.log(`  ✅ ${name}`); passed += 1; }
  else { console.error(`  ❌ ${name}${extra ? ` — ${extra}` : ''}`); failed += 1; fails.push(name); }
};

const TAG = `AMOD${Date.now()}`;
let base = '';
let adminToken = '';
let customerToken = '';

const api = async (method, path, { token, body, raw } = {}) => {
  const res = await fetch(`${base}${path}`, {
    method,
    headers: {
      ...(raw ? {} : { 'Content-Type': 'application/json' }),
      ...(token === null ? {} : { Authorization: `Bearer ${token ?? adminToken}` }),
    },
    ...(body ? { body: raw ? body : JSON.stringify(body) } : {}),
  });
  let json = null;
  const text = await res.text();
  try { json = JSON.parse(text); } catch { json = { raw: text.slice(0, 200) }; }
  return { status: res.status, json, ok: res.ok };
};

const run = async () => {
  console.log('\n=== ADMIN MODULE FUNCTIONAL SUITE ===\n');
  await connectDB();

  const server = http.createServer(app);
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${server.address().port}`;
  console.log(`[test] app listening on ${base}`);

  const admin = await User.findOne({ role: 'admin', status: { $ne: 'DISABLED' } }).select('_id email').lean();
  if (!admin) throw new Error('No admin user in the database — cannot run the admin module suite');
  adminToken = signToken({ id: String(admin._id) }, { expiresIn: '30m' });

  const customer = await User.findOne({ role: { $ne: 'admin' } }).select('_id email').lean();
  if (customer) customerToken = signToken({ id: String(customer._id) }, { expiresIn: '30m' });

  // ══════════════════════════════════════════════════════════════════════════
  // 1. DASHBOARD + NOTIFICATIONS + AUDIT LOGS
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n── Dashboard, notifications, audit logs ──');
  for (const period of ['7d', '30d', '90d']) {
    const r = await api('GET', `/api/admin/dashboard?period=${period}`);
    ok(r.status === 200 && r.json?.success, `dashboard loads for period=${period}`, `status ${r.status}`);
  }
  const dash = await api('GET', '/api/admin/dashboard?period=30d');
  const kpis = dash.json?.data?.kpis || dash.json?.kpis || dash.json?.data || {};
  ok(typeof kpis === 'object' && Object.keys(kpis).length > 0, 'dashboard returns KPI data', JSON.stringify(Object.keys(dash.json?.data || {})).slice(0, 120));

  const notif = await api('GET', '/api/admin/notifications');
  ok(notif.status === 200 && Array.isArray(notif.json?.data), 'notifications feed loads');
  ok(typeof notif.json?.counts?.pendingFulfillments === 'number', 'notifications expose pendingFulfillments count');

  const audit = await api('GET', '/api/admin/audit-logs?limit=5');
  ok(audit.status === 200 && Array.isArray(audit.json?.data), 'audit logs load');

  // ══════════════════════════════════════════════════════════════════════════
  // 2. BLOG — full lifecycle
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n── Blog Management ──');
  const blogPayload = {
    title: `Test Article ${TAG}`,
    slug: `test-article-${TAG.toLowerCase()}`,
    excerpt: 'A throwaway article created by the admin module test suite.',
    category: 'PTE',
    contentHtml: '<h2>Heading</h2><p>Body copy for the automated test.</p>',
    seo: { metaTitle: `Test Article ${TAG}`, metaDescription: 'Automated test article description for SEO checks.' },
  };
  const created = await api('POST', '/api/admin/blogs', { body: blogPayload });
  const blogId = created.json?.data?._id || created.json?._id;
  ok(created.status === 201 || created.status === 200, 'blog: create', `status ${created.status} ${created.json?.message || ''}`);
  ok(!!blogId, 'blog: create returns an id');

  if (blogId) {
    const got = await api('GET', `/api/admin/blogs/${blogId}`);
    ok(got.status === 200 && (got.json?.data?.title === blogPayload.title), 'blog: read back');

    const upd = await api('PUT', `/api/admin/blogs/${blogId}`, { body: { excerpt: 'Updated excerpt from the test suite.' } });
    ok(upd.status === 200, 'blog: update (save draft)', `status ${upd.status} ${upd.json?.message || ''}`);
    const afterUpd = await api('GET', `/api/admin/blogs/${blogId}`);
    ok(afterUpd.json?.data?.excerpt === 'Updated excerpt from the test suite.', 'blog: update persisted');

    const list = await api('GET', '/api/admin/blogs');
    const inList = (list.json?.data || []).some((b) => String(b._id) === String(blogId));
    ok(list.status === 200 && inList, 'blog: appears in admin list');

    const search = await api('GET', `/api/admin/blogs?search=${encodeURIComponent(TAG)}`);
    ok(search.status === 200 && (search.json?.data || []).some((b) => String(b._id) === String(blogId)), 'blog: search filter finds it');

    const pub = await api('POST', `/api/admin/blogs/${blogId}/publish`);
    ok(pub.status === 200, 'blog: publish', `status ${pub.status} ${pub.json?.message || ''}`);
    const afterPub = await api('GET', `/api/admin/blogs/${blogId}`);
    ok(afterPub.json?.data?.status === 'published', 'blog: status is published', afterPub.json?.data?.status);

    // Public site must now serve it.
    const pubList = await api('GET', '/api/blog', { token: null });
    ok(
      (pubList.json?.data || pubList.json?.posts || []).some((b) => b.slug === blogPayload.slug),
      'blog: published article is served publicly'
    );
    const pubOne = await api('GET', `/api/blog/${blogPayload.slug}`, { token: null });
    ok(pubOne.status === 200, 'blog: public single-article endpoint works', `status ${pubOne.status}`);

    const unpub = await api('POST', `/api/admin/blogs/${blogId}/unpublish`);
    ok(unpub.status === 200, 'blog: unpublish', `status ${unpub.status}`);
    const pubList2 = await api('GET', '/api/blog', { token: null });
    ok(
      !(pubList2.json?.data || pubList2.json?.posts || []).some((b) => b.slug === blogPayload.slug),
      'blog: unpublished article is removed from the public feed'
    );

    const prev = await api('GET', `/api/admin/blogs/${blogId}/preview`);
    ok(prev.status === 200, 'blog: preview endpoint', `status ${prev.status}`);

    const revs = await api('GET', `/api/admin/blogs/${blogId}/revisions`);
    ok(revs.status === 200 && Array.isArray(revs.json?.data), 'blog: revisions list');

    const seo = await api('GET', `/api/admin/blogs/${blogId}/seo-analysis`);
    ok(seo.status === 200 && typeof (seo.json?.data?.score ?? seo.json?.score) === 'number', 'blog: SEO analysis returns a real score');

    const dup = await api('POST', `/api/admin/blogs/${blogId}/duplicate`);
    const dupId = dup.json?.data?._id;
    ok(dup.status === 200 || dup.status === 201, 'blog: duplicate', `status ${dup.status}`);
    if (dupId) await api('DELETE', `/api/admin/blogs/${dupId}/permanent`);

    const trash = await api('DELETE', `/api/admin/blogs/${blogId}`);
    ok(trash.status === 200, 'blog: trash (soft delete)', `status ${trash.status}`);
    const restore = await api('POST', `/api/admin/blogs/${blogId}/restore`);
    ok(restore.status === 200, 'blog: restore from trash', `status ${restore.status}`);

    const links = await api('GET', '/api/admin/blogs/internal-link-suggestions?q=pte');
    ok(links.status === 200, 'blog: internal link suggestions', `status ${links.status}`);

    // Permanent delete is intentionally gated on the post being in Trash.
    const permTooEarly = await api('DELETE', `/api/admin/blogs/${blogId}/permanent`);
    ok(permTooEarly.status === 400, 'blog: permanent delete refused while not in Trash', `status ${permTooEarly.status}`);
    await api('DELETE', `/api/admin/blogs/${blogId}`); // back to trash
    const perm = await api('DELETE', `/api/admin/blogs/${blogId}/permanent`);
    ok(perm.status === 200, 'blog: permanent delete', `status ${perm.status}`);
    const gone = await api('GET', `/api/admin/blogs/${blogId}`);
    ok(gone.status === 404, 'blog: permanently deleted article is gone', `status ${gone.status}`);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 3. SEO MANAGER
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n── SEO Manager ──');
  const seoOverview = await api('GET', '/api/seo/overview');
  ok(seoOverview.status === 200, 'seo: overview loads', `status ${seoOverview.status}`);

  const seoPages = await api('GET', '/api/seo/pages');
  const pages = seoPages.json?.data || [];
  ok(seoPages.status === 200 && Array.isArray(pages), 'seo: page list loads');

  if (pages.length) {
    const key = pages[0].pageKey;
    const marker = `Test description ${TAG}`;
    const before = await api('GET', `/api/seo/pages/${key}`);
    const originalSeo = before.json?.data?.seo || {};
    // Same nested payload shape the SEO Manager form sends.
    const patch = await api('PATCH', `/api/seo/pages/${key}`, {
      body: { seo: { ...originalSeo, description: marker } },
    });
    ok(patch.status === 200, `seo: update page "${key}"`, `status ${patch.status}`);
    const after = await api('GET', `/api/seo/pages/${key}`);
    ok(after.json?.data?.seo?.description === marker, 'seo: page update persisted', after.json?.data?.seo?.description);

    const publicSeo = await api('GET', '/api/seo/public', { token: null });
    const reachedPublic = JSON.stringify(publicSeo.json || {}).includes(marker);
    ok(reachedPublic, 'seo: page metadata reaches the public SEO endpoint (admin edit → customer site)');
    // restore
    await api('PATCH', `/api/seo/pages/${key}`, { body: { seo: originalSeo } });
  }

  const globalSeo = await api('GET', '/api/seo/global-settings');
  ok(globalSeo.status === 200, 'seo: global settings load', `status ${globalSeo.status}`);

  const redirect = await api('POST', '/api/seo/redirects', {
    body: { sourcePath: `/test-${TAG.toLowerCase()}`, targetPath: '/exam-vouchers', type: 301 },
  });
  const redirectId = redirect.json?.data?._id;
  ok(redirect.status === 200 || redirect.status === 201, 'seo: create redirect', `status ${redirect.status} ${redirect.json?.message || ''}`);
  if (redirectId) {
    const rUpd = await api('PATCH', `/api/seo/redirects/${redirectId}`, { body: { enabled: false } });
    ok(rUpd.status === 200, 'seo: update redirect');
    const rDel = await api('DELETE', `/api/seo/redirects/${redirectId}`);
    ok(rDel.status === 200, 'seo: delete redirect');
  }

  const analyze = await api('POST', '/api/seo/analyze', {
    body: { title: 'A reasonably sized SEO title for testing purposes', description: 'A meta description of about the right length to score reasonably in the analyzer used by the admin console.', content: '<p>Body</p>' },
  });
  ok(analyze.status === 200, 'seo: inline analyzer', `status ${analyze.status}`);

  // ══════════════════════════════════════════════════════════════════════════
  // 4. AWARDS
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n── Awards ──');
  const awardCreate = await api('POST', '/api/admin/awards', {
    body: { title: `Test Award ${TAG}`, issuer: 'Test Issuer', category: 'RECOGNITION', description: 'Created by the admin module test suite.' },
  });
  const awardId = awardCreate.json?.data?._id;
  ok(awardCreate.status === 201 || awardCreate.status === 200, 'awards: create', `status ${awardCreate.status} ${awardCreate.json?.message || ''}`);
  if (awardId) {
    const aGet = await api('GET', `/api/admin/awards/${awardId}`);
    ok(aGet.status === 200, 'awards: read back');
    const aUpd = await api('PATCH', `/api/admin/awards/${awardId}`, { body: { title: `Test Award ${TAG} (edited)` } });
    ok(aUpd.status === 200 && aUpd.json?.data?.title?.includes('edited'), 'awards: update persisted');
    const aFeat = await api('PATCH', `/api/admin/awards/${awardId}/featured`, { body: { featured: true } });
    ok(aFeat.status === 200, 'awards: toggle featured', `status ${aFeat.status}`);
    const aStat = await api('PATCH', `/api/admin/awards/${awardId}/status`, { body: { status: 'PUBLISHED' } });
    ok(aStat.status === 200, 'awards: publish', `status ${aStat.status}`);
    const aPublic = await api('GET', '/api/awards', { token: null });
    ok(
      (aPublic.json?.data || []).some((a) => String(a._id) === String(awardId)),
      'awards: published award is served publicly'
    );
    const aOrder = await api('PATCH', '/api/admin/awards/reorder', { body: { items: [{ _id: awardId, displayOrder: 1 }] } });
    ok(aOrder.status === 200, 'awards: reorder', `status ${aOrder.status}`);
    const aDel = await api('DELETE', `/api/admin/awards/${awardId}`);
    ok(aDel.status === 200, 'awards: delete', `status ${aDel.status}`);
    const aGone = await api('GET', `/api/admin/awards/${awardId}`);
    ok(aGone.status === 404, 'awards: deleted award is gone');
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 5. VIDEOS & REELS
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n── Videos & Reels ──');
  const reelCreate = await api('POST', '/api/admin/reels', {
    body: { title: `Test Reel ${TAG}`, description: 'Created by the admin module test suite.', videoUrl: 'https://res.cloudinary.com/demo/video/upload/dog.mp4' },
  });
  const reelId = reelCreate.json?.data?._id;
  ok(reelCreate.status === 201 || reelCreate.status === 200, 'reels: create', `status ${reelCreate.status} ${reelCreate.json?.message || ''}`);
  if (reelId) {
    const rGet = await api('GET', `/api/admin/reels/${reelId}`);
    ok(rGet.status === 200, 'reels: read back');
    const rUpd = await api('PATCH', `/api/admin/reels/${reelId}`, { body: { title: `Test Reel ${TAG} (edited)` } });
    ok(rUpd.status === 200 && rUpd.json?.data?.title?.includes('edited'), 'reels: update persisted');
    const rPub = await api('PATCH', `/api/admin/reels/${reelId}/publish`, { body: { published: true } });
    ok(rPub.status === 200, 'reels: publish', `status ${rPub.status}`);
    const rPublic = await api('GET', '/api/reels', { token: null });
    ok(
      (rPublic.json?.data || []).some((v) => String(v._id) === String(reelId)),
      'reels: published reel is served publicly'
    );
    const rFeat = await api('PATCH', `/api/admin/reels/${reelId}/featured`, { body: { featured: true } });
    ok(rFeat.status === 200, 'reels: toggle featured', `status ${rFeat.status}`);
    const rOrder = await api('PATCH', `/api/admin/reels/${reelId}/order`, { body: { order: 2 } });
    ok(rOrder.status === 200, 'reels: set order', `status ${rOrder.status}`);
    const rUnpub = await api('PATCH', `/api/admin/reels/${reelId}/publish`, { body: { published: false } });
    ok(rUnpub.status === 200, 'reels: unpublish', `status ${rUnpub.status}`);
    const rDel = await api('DELETE', `/api/admin/reels/${reelId}`);
    ok(rDel.status === 200, 'reels: delete', `status ${rDel.status}`);
  }
  const reelSettings = await api('GET', '/api/admin/reels');
  ok(reelSettings.status === 200, 'reels: admin list loads');

  // ══════════════════════════════════════════════════════════════════════════
  // 6. PROMO COUPONS + CAMPAIGNS
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n── Promo Coupons ──');
  const code = `TEST${TAG.slice(-6)}`;
  // Same field names the Promo Coupons form sends.
  const promoCreate = await api('POST', '/api/admin/promotions', {
    body: {
      name: `Test Coupon ${TAG}`,
      code,
      description: 'Test coupon',
      discountType: 'percentage',
      discountValue: 10,
      minimumOrderAmount: 100,
      maximumDiscount: 50,
      usageLimit: 5,
      active: true,
      startAt: new Date(Date.now() - 86400000),
      endAt: new Date(Date.now() + 30 * 86400000),
    },
  });
  const promoId = promoCreate.json?.data?._id;
  ok(promoCreate.status === 201 || promoCreate.status === 200, 'coupons: create', `status ${promoCreate.status} ${promoCreate.json?.message || ''}`);
  if (promoId && customerToken) {
    // Backend must compute the discount — 10% of 1000 capped at maxDiscount 50.
    const validate = await api('POST', '/api/account/validate-promo', {
      token: customerToken,
      body: { code, subtotal: 1000 },
    });
    const discount = validate.json?.data?.discount ?? validate.json?.discount;
    ok(validate.status === 200, 'coupons: customer validate-promo endpoint responds', `status ${validate.status}`);
    ok(discount === 50, 'coupons: backend applies maxDiscount cap (10% of 1000 → capped at 50)', `got ${discount}`);

    const belowMin = await api('POST', '/api/account/validate-promo', {
      token: customerToken,
      body: { code, subtotal: 50 },
    });
    const belowDiscount = belowMin.json?.data?.discount ?? belowMin.json?.discount ?? 0;
    ok(!belowMin.json?.success || belowDiscount === 0, 'coupons: minOrderAmount enforced server-side', `got ${belowDiscount}`);

    const upd = await api('PATCH', `/api/admin/promotions/${promoId}`, { body: { active: false } });
    ok(upd.status === 200, 'coupons: disable');
    const disabled = await api('POST', '/api/account/validate-promo', { token: customerToken, body: { code, subtotal: 1000 } });
    const disabledDiscount = disabled.json?.data?.discount ?? disabled.json?.discount ?? 0;
    ok(!disabled.json?.success || disabledDiscount === 0, 'coupons: a disabled coupon is rejected server-side', `got ${disabledDiscount}`);

    const del = await api('DELETE', `/api/admin/promotions/${promoId}`);
    ok(del.status === 200, 'coupons: delete');
  } else if (promoId) {
    await api('DELETE', `/api/admin/promotions/${promoId}`);
  }

  const campCreate = await api('POST', '/api/admin/campaigns', {
    body: {
      name: `Test Campaign ${TAG}`,
      discountType: 'PERCENTAGE',
      discountValue: 5,
      startDate: new Date(Date.now() - 86400000),
      endDate: new Date(Date.now() + 86400000),
      status: 'SCHEDULED',
    },
  });
  const campId = campCreate.json?.data?._id;
  ok(campCreate.status === 201 || campCreate.status === 200, 'campaigns: create', `status ${campCreate.status} ${campCreate.json?.message || ''}`);
  if (campId) {
    const t = await api('POST', `/api/admin/campaigns/${campId}/toggle`);
    ok(t.status === 200, 'campaigns: toggle', `status ${t.status}`);
    const d = await api('DELETE', `/api/admin/campaigns/${campId}`);
    ok(d.status === 200, 'campaigns: delete');
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 7. PTE BOOKINGS
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n── PTE Booking Requests ──');
  const pteList = await api('GET', '/api/admin/pte-bookings');
  const pteRows = pteList.json?.data || pteList.json?.rows || [];
  ok(pteList.status === 200, 'pte: admin list loads', `status ${pteList.status}`);
  if (pteRows.length) {
    const id = pteRows[0]._id;
    const one = await api('GET', `/api/admin/pte-bookings/${id}`);
    ok(one.status === 200, 'pte: read one');
    const original = one.json?.data?.status;
    const upd = await api('PATCH', `/api/admin/pte-bookings/${id}`, { body: { status: original } });
    ok(upd.status === 200, 'pte: status update accepted', `status ${upd.status} ${upd.json?.message || ''}`);
  } else {
    console.log('  … no PTE booking rows to exercise (list endpoint verified)');
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 8. CUSTOMERS + ORDERS
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n── Customers & Orders ──');
  const users = await api('GET', '/api/admin/users?limit=5');
  ok(users.status === 200 && Array.isArray(users.json?.data), 'customers: list loads');
  ok(
    !JSON.stringify(users.json?.data || []).includes('passwordHash'),
    'customers: list does not leak passwordHash'
  );
  if (users.json?.data?.length) {
    const u = users.json.data[0];
    const one = await api('GET', `/api/admin/users/${u._id}`);
    ok(one.status === 200, 'customers: read one');
    ok(!JSON.stringify(one.json || {}).includes('passwordHash'), 'customers: detail does not leak passwordHash');
    const search = await api('GET', `/api/admin/users?search=${encodeURIComponent(String(u.email || '').slice(0, 6))}`);
    ok(search.status === 200 && (search.json?.data || []).length > 0, 'customers: search returns results');
  }

  const orders = await api('GET', '/api/admin/orders?limit=5');
  ok(orders.status === 200 && Array.isArray(orders.json?.data), 'orders: list loads');
  if (orders.json?.data?.length) {
    const o = orders.json.data[0];
    const one = await api('GET', `/api/admin/orders/${o._id}`);
    ok(one.status === 200 && one.json?.data, 'orders: detail loads');
    ok(Array.isArray(one.json?.vouchers), 'orders: detail includes allocated vouchers');
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 9. WEBSITE CMS
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n── Website CMS ──');
  const cmsGet = await api('GET', '/api/admin/website-settings');
  ok(cmsGet.status === 200 && cmsGet.json?.data, 'cms: settings load', `status ${cmsGet.status}`);
  if (cmsGet.json?.data) {
    const originalAnnouncement = cmsGet.json.data.announcementSettings || null;
    const marker = `Announcement ${TAG}`;
    // Same nested group shape the Website CMS form sends.
    const patch = await api('PATCH', '/api/admin/website-settings', {
      body: { announcementSettings: { ...(originalAnnouncement || {}), text: marker } },
    });
    ok(patch.status === 200, 'cms: save settings', `status ${patch.status}`);
    ok(Array.isArray(patch.json?.updated) && patch.json.updated.includes('announcementSettings'),
      'cms: response names which setting groups were written');

    const after = await api('GET', '/api/admin/website-settings');
    ok(after.json?.data?.announcementSettings?.text === marker, 'cms: save persisted');

    const publicCfg = await api('GET', '/api/products/website-config', { token: null });
    ok(
      JSON.stringify(publicCfg.json || {}).includes(marker),
      'cms: admin edit reaches the public website-config endpoint'
    );

    // A payload with no recognised group must NOT report success.
    const bogus = await api('PATCH', '/api/admin/website-settings', { body: { notARealSetting: 'x' } });
    ok(bogus.status === 400 && bogus.json?.code === 'NO_SETTINGS_SUPPLIED',
      'cms: an unrecognised payload is rejected instead of faking success', `status ${bogus.status}`);

    if (originalAnnouncement) {
      await api('PATCH', '/api/admin/website-settings', { body: { announcementSettings: originalAnnouncement } });
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 10. AUTHORIZATION — a customer token must be refused everywhere
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n── Authorization (customer token must be refused) ──');
  if (customerToken) {
    const guarded = [
      ['GET', '/api/admin/dashboard'],
      ['GET', '/api/admin/blogs'],
      ['POST', '/api/admin/blogs'],
      ['GET', '/api/admin/awards'],
      ['POST', '/api/admin/awards'],
      ['GET', '/api/admin/reels'],
      ['GET', '/api/admin/users'],
      ['GET', '/api/admin/orders'],
      ['GET', '/api/admin/promotions'],
      ['GET', '/api/admin/website-settings'],
      ['GET', '/api/admin/audit-logs'],
      ['GET', '/api/admin/pte-bookings'],
      ['GET', '/api/seo/pages'],
      ['GET', '/api/seo/overview'],
    ];
    for (const [m, p] of guarded) {
      const r = await api(m, p, { token: customerToken, body: m === 'POST' ? {} : undefined });
      ok(r.status === 403, `authz: customer token refused on ${m} ${p}`, `got ${r.status}`);
    }
  } else {
    console.log('  … no non-admin user available to test authorization');
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Cleanup
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n── Cleanup ──');
  const tagRe = new RegExp(TAG);
  await Promise.all([
    BlogPost.deleteMany({ $or: [{ title: tagRe }, { slug: new RegExp(TAG.toLowerCase()) }] }),
    Award.deleteMany({ title: tagRe }),
    Video.deleteMany({ title: tagRe }),
    Promotion.deleteMany({ code: new RegExp(TAG.slice(-6)) }),
    Campaign.deleteMany({ name: tagRe }),
    Redirect.deleteMany({ sourcePath: new RegExp(TAG.toLowerCase()) }),
  ]);
  console.log('  cleaned test records');

  await new Promise((r) => server.close(r));
  console.log(`\n=== ADMIN MODULE SUITE COMPLETE: ${passed} passed, ${failed} failed ===`);
  if (fails.length) console.log(`Failures:\n  - ${fails.join('\n  - ')}`);
  console.log('');
  await mongoose.connection.close();
  process.exit(failed > 0 ? 1 : 0);
};

run().catch(async (err) => {
  console.error('\n💥 SUITE CRASHED:', err);
  await mongoose.connection.close().catch(() => {});
  process.exit(1);
});
