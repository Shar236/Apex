/**
 * Blog editor / CMS regression suite.
 *
 * Covers the "Article = HTML + CSS + structured metadata" contract:
 *   - pasted <style> and full <!DOCTYPE html> documents are split into
 *     { html, css } — CSS is never silently dropped (items A / C / 29 / 30)
 *   - article CSS is sanitized (no expression() / javascript: / @import) and
 *     scoped under [data-blog-article="<id>"] on render (items 5 / 6 / 34)
 *   - editor table artifacts (colgroup, colspan="1") are normalized (items F/19/31)
 *   - HTML + CSS save together and restore together through a revision (32/33)
 *   - old articles (no css) keep rendering; css:'' is the safe default (item 44)
 *
 * Creates only "TEST-BLOGCMS" prefixed data and cleans up afterwards.
 *   node backend/tests/blogEditor.test.js
 */
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { BlogPost, BlogPostRevision } from '../models/index.js';
import {
  stripDocumentChrome,
  extractStyleBlocks,
  normalizeArticleTables,
  sanitizeArticleCss,
  scopeCss,
  blogArticleScope,
  prepareIncomingArticle,
} from '../utils/articleContent.js';
import {
  createBlog,
  updateBlog,
  getAdminBlog,
  previewBlog,
  listRevisions,
  restoreRevision,
} from '../controllers/blogController.js';

const TAG = 'TEST-BLOGCMS';
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
const run = async (handler, { body = {}, params = {} } = {}) => {
  const res = mockRes();
  let nextErr = null;
  const req = { user: { _id: new mongoose.Types.ObjectId(), email: `${TAG}@apex.test` }, body, params, ip: '127.0.0.1', headers: {} };
  await handler(req, res, (err) => { nextErr = err || new Error('next() with no error'); });
  return { res, err: nextErr, body: res.body, status: nextErr?.statusCode || res.statusCode };
};

const cleanup = async () => {
  const rx = new RegExp(`^${TAG}`, 'i');
  const posts = await BlogPost.find({ title: rx }).select('_id');
  const ids = posts.map((p) => p._id);
  await BlogPostRevision.deleteMany({ blogId: { $in: ids } });
  await BlogPost.deleteMany({ _id: { $in: ids } });
};

const runTests = async () => {
  console.log('================================================================');
  console.log('🧪 BLOG EDITOR / CMS  —  HTML + CSS + METADATA');
  console.log('================================================================\n');
  await connectDB();
  await cleanup();

  // ── 1. Pure helpers ───────────────────────────────────────────────────────
  console.log('— articleContent helpers —');
  {
    const full = `<!DOCTYPE html><html><head><title>SEO</title>
      <style>.conversion-table{width:100%;border-collapse:collapse}.conversion-table th{background:#eee}</style>
      <script>steal()</script></head><body>
      <h2>Heading</h2><p>Body text</p>
      <table><colgroup><col style="width:220px"><col></colgroup>
      <tbody><tr><td colspan="1" rowspan="1"><p>Cell</p></td><td colspan="2"><p>Wide</p></td></tr></tbody></table>
      </body></html>`;
    const prepared = prepareIncomingArticle(full);
    ok(!/<head|<script|<style|<!doctype|<html|<body/i.test(prepared.html), 'full document → body fragment only');
    ok(/<h2>Heading<\/h2>/.test(prepared.html), 'keeps article headings/paragraphs');
    ok(/conversion-table/.test(prepared.css) && /border-collapse/.test(prepared.css), '<style> from <head> preserved into css');
    ok(!/colgroup/i.test(prepared.html), 'colgroup stripped');
    ok(!/colspan=("|')?1("|')?/i.test(prepared.html), 'redundant colspan="1" stripped');
    ok(/colspan="2"/.test(prepared.html), 'meaningful colspan="2" kept');

    ok(stripDocumentChrome('<p>plain fragment</p>') === '<p>plain fragment</p>', 'plain fragment passes through untouched');

    const ex = extractStyleBlocks('<style>a{x:1}</style><p>t</p><style>b{y:2}</style>');
    ok(ex.html === '<p>t</p>' && ex.css.includes('a{x:1}') && ex.css.includes('b{y:2}'), 'extractStyleBlocks merges + strips');

    const dirty = sanitizeArticleCss('.a{width:expression(alert(1));color:red;background:url(javascript:x)}@import url(//evil);@font-face{font-family:x;src:url(http://evil/f.woff)}');
    ok(!/expression|javascript|@import/i.test(dirty), 'css sanitize kills expression / javascript: / @import');
    ok(/color:\s*red/i.test(dirty), 'css sanitize keeps safe declarations');
    ok(!/evil\/f\.woff/i.test(dirty), 'css sanitize drops non-https @font-face src');

    const scope = blogArticleScope('507f1f77bcf86cd799439011');
    const scoped = scopeCss(
      `.card{color:red} :root{--x:1} .card:hover{color:blue}
       @media (max-width:600px){ .card{padding:4px} }
       @keyframes spin{from{opacity:0}to{opacity:1}}`,
      scope,
    );
    ok(scoped.includes(`${scope} .card`), 'scope: class selector prefixed');
    ok(scoped.includes(`${scope} .card:hover`), 'scope: pseudo-class preserved + prefixed');
    ok(/@media\s*\(max-width:\s*600px\)/.test(scoped) && scoped.includes(`${scope} .card`), 'scope: @media descended into');
    ok(/@keyframes spin/.test(scoped) && /\bfrom\s*{/.test(scoped) && !/[[\]]\s*from/.test(scoped), 'scope: @keyframes steps NOT prefixed');
    ok(scoped.includes(`${scope} {`) || scoped.includes(`${scope}{`), 'scope: :root rewritten to the article root');
    ok(scopeCss(scoped, scope) === scoped, 'scope: idempotent');
  }

  // ── 2. create + update round-trip through the controller ──────────────────
  console.log('\n— controller: paste HTML with <style> → save → reload → preview —');
  const created = await run(createBlog, { body: { title: `${TAG} Article One` } });
  ok(created.status === 201 && created.body?.data?._id, 'createBlog returns a draft', JSON.stringify(created.body).slice(0, 120));
  const id = created.body?.data?._id;
  ok(created.body?.data?.css === '', 'new article css defaults to ""');

  const pastedBody = `<h1>Guide</h1>
    <style>
      .apex-note{ border:2px solid #FF005C; padding:12px; border-radius:8px }
      .apex-note strong{ color:#FF005C }
      @media (max-width:640px){ .apex-note{ padding:6px } }
    </style>
    <p class="apex-note"><strong>Tip:</strong> book early.</p>
    <table><colgroup><col><col></colgroup><tbody>
      <tr><td colspan="1" rowspan="1"><p>A</p></td><td colspan="1" rowspan="1"><p>B</p></td></tr>
    </tbody></table>
    <p><a href="javascript:alert(1)">bad</a> <a href="/blog">good</a></p>`;
  const upd = await run(updateBlog, { params: { id }, body: { title: `${TAG} Article One`, content: pastedBody, css: '' } });
  ok(upd.status === 200, 'updateBlog accepts pasted HTML+style', upd.err?.message);
  const saved = upd.body?.data;
  ok(saved && !/<style/i.test(saved.content), 'stored content has NO <style> block');
  ok(/apex-note/.test(saved.css) && /max-width:\s*640px/.test(saved.css), 'stored css holds the extracted rules incl. @media');
  ok(!/colgroup/i.test(saved.content) && !/colspan/i.test(saved.content), 'stored content tables normalized');
  ok(!/javascript:/i.test(saved.content), 'javascript: href stripped by sanitizer');
  ok(/href="\/blog"/.test(saved.content), 'safe internal link kept');
  ok(saved.css.indexOf('[data-blog-article') === -1, 'getAdmin/update returns css UNSCOPED for editing');

  // getAdminBlog → unscoped (editor load)
  const adminGet = await run(getAdminBlog, { params: { id } });
  ok(adminGet.body?.data?.css && !adminGet.body.data.css.includes('[data-blog-article'), 'getAdminBlog css is unscoped');

  // previewBlog → scoped (faithful preview)
  const prev = await run(previewBlog, { params: { id } });
  const scope = blogArticleScope(id);
  ok(prev.body?.data?.css?.includes(`${scope} .apex-note`), 'previewBlog returns CSS scoped to the article root');
  ok(!/\bnav\b|\bbody\b|\bhtml\b/.test(prev.body.data.css.replace(/data-blog-article/g, '')), 'scoped css has no bare global selectors');

  // ── 3. autosave keeps HTML + CSS together ─────────────────────────────────
  console.log('\n— autosave: HTML + CSS persist together —');
  const auto = await run(updateBlog, {
    params: { id },
    body: { content: '<h1>Guide</h1><p class="apex-note">edited</p>', __autosave: true },
  });
  ok(auto.status === 200 && /apex-note/.test(auto.body?.data?.css), 'autosave with only content keeps existing css (no partial state)');

  // ── 4. revision restore brings BOTH back ──────────────────────────────────
  console.log('\n— revision: HTML + CSS restore together —');
  // change css, creating a revision of the previous (html+css) state
  await run(updateBlog, { params: { id }, body: { content: '<h1>Guide</h1><p>no styles now</p>', css: '' } });
  const afterWipe = await run(getAdminBlog, { params: { id } });
  ok(afterWipe.body?.data?.css === '', 'css can be cleared');

  const revs = await run(listRevisions, { params: { id } });
  const revList = revs.body?.data || [];
  ok(revList.length >= 1, 'a revision was recorded for the non-autosave edit');
  const withCss = revList.find((r) => (r.snapshot?.css || '').includes('apex-note'));
  ok(!!withCss, 'a revision snapshot contains the earlier css');
  if (withCss) {
    const restored = await run(restoreRevision, { params: { id, revisionId: withCss._id } });
    ok(/apex-note/.test(restored.body?.data?.css || ''), 'restoreRevision brings the css back');
    ok(/apex-note/.test(restored.body?.data?.content || '') || restored.body?.data?.content?.includes('Tip'), 'restoreRevision brings the matching html back');
  }

  // ── 5. backward compatibility: a doc saved without css ────────────────────
  console.log('\n— backward compatibility —');
  const legacy = await BlogPost.create({ title: `${TAG} Legacy`, slug: `${TAG.toLowerCase()}-legacy-${Date.now()}`, content: '<h2>Old</h2><p>content</p>' });
  ok(legacy.css === '', 'legacy article created without css → css === ""');
  const legacyPrev = await run(previewBlog, { params: { id: legacy._id } });
  ok(legacyPrev.status === 200 && legacyPrev.body?.data?.css === '', 'legacy article previews fine with css=""');

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
