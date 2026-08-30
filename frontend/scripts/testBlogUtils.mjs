/**
 * Blog editor client-helper checks (pure functions, no DOM / network).
 *   node frontend/scripts/testBlogUtils.mjs
 *
 * The authoritative HTML+CSS pipeline is regression-tested server-side in
 * backend/tests/blogEditor.test.js; this covers the browser-only helpers the
 * editor and public renderer rely on.
 */
import {
  stripDocumentChrome, extractStyleBlocks, normalizeArticleTables,
  wrapResponsiveTables, detectArticleImages, updateArticleImageAttrs,
  renderArticleHtml, splitPastedArticle,
} from '../src/blogs/lib/articleContent.js';
import { isSafeLinkHref, linkHrefError, buildRel } from '../src/blogs/components/editor/linkCommands.js';

let pass = 0; let fail = 0;
const ok = (name, cond) => { if (cond) { pass += 1; console.log(`  ok   ${name}`); } else { fail += 1; console.log(`  FAIL ${name}`); } };

// ── articleContent ──────────────────────────────────────────────────────────
ok('stripDocumentChrome passes a fragment through', stripDocumentChrome('<p>x</p>') === '<p>x</p>');
{
  const r = stripDocumentChrome('<!DOCTYPE html><html><head><style>.a{x:1}</style><title>t</title></head><body><h2>H</h2></body></html>');
  ok('stripDocumentChrome drops head/title, keeps body + hoists style', /<h2>H<\/h2>/.test(r) && /\.a\{x:1\}/.test(r) && !/<title|<head/i.test(r));
}
{
  const { html, css } = extractStyleBlocks('<style>.a{c:red}</style><p>t</p>');
  ok('extractStyleBlocks splits html/css', html === '<p>t</p>' && css === '.a{c:red}');
}
{
  const raw = '<table><colgroup><col><col></colgroup><tbody><tr><td colspan="1" rowspan="1" style="min-width:400px">A</td></tr></tbody></table>';
  const n = normalizeArticleTables(raw);
  ok('normalizeArticleTables strips colgroup', !/colgroup|<col\b/i.test(n));
  ok('normalizeArticleTables strips colspan="1"', !/colspan/i.test(n));
  ok('normalizeArticleTables strips min-width', !/min-width/i.test(n));
}
{
  const w = wrapResponsiveTables('<p>a</p><table><tr><td>x</td></tr></table>');
  ok('wrapResponsiveTables adds a scroll wrapper', /<div class="table-responsive"><table>/.test(w));
  ok('wrapResponsiveTables is idempotent', wrapResponsiveTables(w) === w);
}
{
  const html = '<p><img src="https://res.cloudinary.com/x/image/upload/v1/a.jpg" alt="A"></p><figure><img src="/img/b.png" width="640" height="360"></figure><img src="https://res.cloudinary.com/x/image/upload/v1/a.jpg">';
  const imgs = detectArticleImages(html);
  ok('detectArticleImages finds + dedupes', imgs.length === 2);
  ok('detectArticleImages keeps alt', imgs[0].alt === 'A');
  ok('detectArticleImages keeps dimensions', imgs[1].width === 640 && imgs[1].height === 360);
}
{
  const html = '<img src="/a.png" alt="old"><img src="/b.png">';
  const out = updateArticleImageAttrs(html, '/a.png', { alt: 'new alt' });
  ok('updateArticleImageAttrs sets alt on the match only', /src="\/a\.png" alt="new alt"|alt="new alt" src="\/a\.png"/.test(out) && /<img src="\/b\.png">/.test(out));
}
{
  const { html, css } = splitPastedArticle('<style>.z{c:1}</style><h1>T</h1><table><colgroup><col></colgroup><tr><td colspan="1">x</td></tr></table>', '.old{a:1}');
  ok('splitPastedArticle merges existing + new css', css.includes('.old{a:1}') && css.includes('.z{c:1}'));
  ok('splitPastedArticle normalizes tables in html', !/colgroup|colspan/i.test(html) && /<h1>T<\/h1>/.test(html));
}
ok('renderArticleHtml wraps + normalizes', /table-responsive/.test(renderArticleHtml('<table><tr><td colspan="1">x</td></tr></table>')));

// ── linkCommands ────────────────────────────────────────────────────────────
ok('isSafeLinkHref allows site paths', isSafeLinkHref('/exam-vouchers/pte'));
ok('isSafeLinkHref allows https', isSafeLinkHref('https://example.com/x'));
ok('isSafeLinkHref allows #hash + mailto + tel', isSafeLinkHref('#faq') && isSafeLinkHref('mailto:a@b.com') && isSafeLinkHref('tel:+91'));
ok('isSafeLinkHref rejects javascript:', !isSafeLinkHref('javascript:alert(1)'));
ok('isSafeLinkHref rejects data:', !isSafeLinkHref('data:text/html,x'));
ok('linkHrefError explains a bad scheme', /not allowed/i.test(linkHrefError('javascript:x') || ''));
ok('linkHrefError passes a good url', linkHrefError('/blog') === null);
ok('buildRel adds noopener noreferrer for _blank', buildRel({ target: '_blank' }) === 'noopener noreferrer');
ok('buildRel merges nofollow', buildRel({ target: '_blank', nofollow: true }) === 'noopener noreferrer nofollow');
ok('buildRel empty for same-tab', buildRel({}) === '');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
