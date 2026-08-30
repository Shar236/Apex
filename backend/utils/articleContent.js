import postcss from 'postcss';

/**
 * Article = HTML + CSS + structured metadata.
 *
 * This module is the single source of truth for turning whatever an admin
 * pastes or types into a clean, safe **stored** representation, and for turning
 * that stored representation into a scoped **render** form.
 *
 *   store  →  extractStyleBlocks + stripDocumentChrome + normalizeArticleTables
 *             on the HTML;  sanitizeArticleCss on the CSS  (NOT scoped — the
 *             article _id may not exist yet on create)
 *   render →  scopeCss(css, `[data-blog-article="<id>"]`)  so an article's CSS
 *             can never leak to the navbar / footer / admin / another article
 *
 * Pure + dependency-light: `postcss` (already a transitive dep of sanitize-html
 * and now a direct dep) for real CSS parsing — never string-replacement on
 * selectors.
 */

// ── HTML: document chrome + <style> extraction ───────────────────────────────

const STYLE_BLOCK = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
const HEAD_BLOCK = /<head\b[^>]*>[\s\S]*?<\/head>/gi;
const SCRIPT_BLOCK = /<script\b[^>]*>[\s\S]*?<\/script>/gi;
const HTML_COMMENT = /<!--[\s\S]*?-->/g;

/**
 * A pasted `<!DOCTYPE html> … </html>` document collapses to just the body's
 * inner HTML. Everything the article does not own (doctype, <html>, <head>,
 * <title>, <meta>, <link>, <script>) is dropped. Any `<style>` that lived in
 * `<head>` is hoisted into the returned string so extractStyleBlocks can still
 * find it — we never depend on `<head>` surviving.
 */
export const stripDocumentChrome = (input) => {
  let html = String(input || '');
  if (!html) return '';

  const looksLikeDoc =
    /<!doctype/i.test(html) || /<html[\s>]/i.test(html) || /<head[\s>]/i.test(html) || /<body[\s>]/i.test(html);
  if (!looksLikeDoc) return html;

  html = html.replace(HTML_COMMENT, '');

  // Hoist <style> out of <head> before we discard <head>.
  const headMatch = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i);
  let hoistedStyles = '';
  if (headMatch) {
    const styles = headMatch[1].match(STYLE_BLOCK);
    if (styles) hoistedStyles = styles.join('\n');
  }

  html = html.replace(HEAD_BLOCK, '').replace(SCRIPT_BLOCK, '');

  const bodyMatch = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
  let body = bodyMatch ? bodyMatch[1] : html;
  body = body.replace(/<\/?(?:html|body|head)\b[^>]*>/gi, '').replace(/<!doctype[^>]*>/gi, '');

  return `${hoistedStyles}\n${body}`.trim();
};

/**
 * Pull every `<style>` block out of an HTML string.
 * @returns {{ html: string, css: string }}
 */
export const extractStyleBlocks = (input) => {
  const html = String(input || '');
  if (!html) return { html: '', css: '' };
  const css = [];
  const stripped = html.replace(STYLE_BLOCK, (_, inner) => {
    if (inner && inner.trim()) css.push(inner.trim());
    return '';
  });
  return { html: stripped, css: css.join('\n\n') };
};

// ── HTML: table normalization ────────────────────────────────────────────────

/**
 * Block editors emit `<td colspan="1" rowspan="1">` on every cell and sometimes
 * a `<colgroup>` carrying fixed pixel widths / `min-width`. Strip the redundant
 * span attributes and any colgroup so the article stylesheet lays the table out
 * responsively (`width:100%; table-layout:fixed`) instead of overflowing.
 *
 * The responsive scroll wrapper (`<div class="table-responsive">`) is added at
 * RENDER time — see the frontend articleContent util — so the stored markup
 * stays clean and round-trips through the visual editor unchanged.
 */
export const normalizeArticleTables = (input) => {
  let html = String(input || '');
  if (!html) return '';
  html = html.replace(/<colgroup[\s\S]*?<\/colgroup>/gi, '');
  html = html.replace(/<col\b[^>]*>/gi, '');
  html = html.replace(/\s(colspan|rowspan)=("|')1\2/gi, '');
  html = html.replace(/\s(colspan|rowspan)=1(?=[\s/>])/gi, '');
  // A cell reduced to just an empty <p> (editor paste artifact) → keep the cell,
  // drop the noise so it doesn't force height.
  html = html.replace(/<(td|th)([^>]*)>\s*<p>\s*<\/p>\s*<\/\1>/gi, '<$1$2></$1>');
  // Editors bake `min-width` / `table-layout` into inline styles, which forces a
  // horizontal scrollbar on mobile. Drop just those declarations wherever they
  // appear — the responsive wrapper + article stylesheet handle overflow.
  html = html.replace(/style=("|')([^"']*)\1/gi, (m, q, decls) => {
    const cleaned = decls
      .split(';')
      .map((d) => d.trim())
      .filter((d) => d && !/^(min-width|table-layout)\s*:/i.test(d))
      .join('; ');
    return cleaned ? `style=${q}${cleaned}${q}` : '';
  });
  return html;
};

// ── CSS: sanitize (on save) + scope (on render) ──────────────────────────────

const CSS_DANGER = /(?:expression\s*\(|-moz-binding|behaviou?r\s*:|javascript\s*:|vbscript\s*:)/i;
const CSS_URL_DANGER = /url\(\s*(['"]?)\s*(?:javascript|vbscript|data:text\/html)\s*:/i;

const isKeyframesParent = (node) =>
  !!node && node.type === 'atrule' && /^(?:-\w+-)?keyframes$/i.test(node.name);

/**
 * Remove dangerous constructs from author CSS. Does NOT scope selectors — that
 * happens at render time via scopeCss(), once the article _id is known. Returns
 * '' on a parse failure so a broken paste can never poison the page.
 */
export const sanitizeArticleCss = (input) => {
  const raw = String(input || '');
  if (!raw.trim()) return '';

  let root;
  try {
    root = postcss.parse(raw);
  } catch {
    return '';
  }

  root.walkAtRules((at) => {
    const name = at.name.toLowerCase();
    // @import / @charset / @namespace can pull in arbitrary remote resources.
    if (name === 'import' || name === 'charset' || name === 'namespace') {
      at.remove();
      return;
    }
    if (name === 'font-face') {
      at.walkDecls((decl) => {
        if (decl.prop.toLowerCase() !== 'src') return;
        const ok =
          /url\(\s*['"]?\s*(?:https:\/\/|data:font|data:application\/(?:font|x-font))/i.test(decl.value) ||
          /(^|\s)local\(/i.test(decl.value);
        if (!ok) decl.remove();
      });
      if (!at.nodes || at.nodes.length === 0) at.remove();
    }
  });

  root.walkDecls((decl) => {
    const value = decl.value || '';
    if (CSS_DANGER.test(decl.prop) || CSS_DANGER.test(value) || CSS_URL_DANGER.test(value)) {
      decl.remove();
    }
  });

  // Drop rules / at-rules left empty by the passes above.
  root.walkRules((rule) => {
    if (!rule.nodes || rule.nodes.length === 0) rule.remove();
  });

  return root.toString().trim();
};

const scopeOneSelector = (selector, scope) => {
  const s = selector.trim();
  if (!s) return s;
  if (s.startsWith(scope)) return s; // idempotent
  if (/^(?::root|html|body)$/i.test(s)) return scope;
  const lead = s.match(/^(?::root|html|body)\b\s*([\s\S]*)$/i);
  if (lead) return lead[1] ? `${scope} ${lead[1]}` : scope;
  return `${scope} ${s}`;
};

/**
 * Scope every selector in `css` under `scope` (e.g. `[data-blog-article="<id>"]`).
 * `@media` / `@supports` / `@layer` / `@container` are descended into;
 * `@keyframes` step selectors (from / to / %), `@font-face`, CSS custom
 * properties and combinators are preserved. Sanitizes first (idempotent).
 */
export const scopeCss = (input, scope) => {
  const raw = sanitizeArticleCss(input);
  if (!raw) return '';
  if (!scope) return raw;

  let root;
  try {
    root = postcss.parse(raw);
  } catch {
    return '';
  }

  root.walkRules((rule) => {
    if (isKeyframesParent(rule.parent)) return;
    rule.selectors = rule.selectors.map((sel) => scopeOneSelector(sel, scope));
  });

  return root.toString().trim();
};

export const blogArticleScope = (id) => `[data-blog-article="${String(id)}"]`;

/**
 * The one place the "incoming HTML" pipeline is defined, so paste-into-visual,
 * paste-into-HTML-source and API writes all behave identically.
 * @returns {{ html: string, css: string }} — html still needs tag sanitizing by
 *          the caller (sanitize-html); css is already sanitized (unscoped).
 */
export const prepareIncomingArticle = (rawHtml, existingCss = '') => {
  const doc = stripDocumentChrome(rawHtml);
  const { html, css: inlineCss } = extractStyleBlocks(doc);
  const mergedCss = [String(existingCss || '').trim(), inlineCss].filter(Boolean).join('\n\n');
  return {
    html: normalizeArticleTables(html),
    css: sanitizeArticleCss(mergedCss),
  };
};

export default {
  stripDocumentChrome,
  extractStyleBlocks,
  normalizeArticleTables,
  sanitizeArticleCss,
  scopeCss,
  blogArticleScope,
  prepareIncomingArticle,
};
