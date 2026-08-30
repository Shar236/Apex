/**
 * Article = HTML + CSS + structured metadata — shared client helpers.
 *
 * Pure string transforms with no heavy deps, used by BOTH the public renderer
 * (<ArticleBody>) and the editor. The backend (backend/utils/articleContent.js)
 * runs the authoritative version of the same pipeline on save; this copy keeps
 * the editor's live preview and the paste flow behaving identically before a
 * round-trip.
 *
 * CSS *scoping* lives in ./cssScope.js (it pulls in postcss) so it only loads in
 * the admin editor chunk — the public blog pages render server-scoped CSS and
 * never need it.
 */

const STYLE_BLOCK = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
const HEAD_BLOCK = /<head\b[^>]*>[\s\S]*?<\/head>/gi;
const SCRIPT_BLOCK = /<script\b[^>]*>[\s\S]*?<\/script>/gi;
const HTML_COMMENT = /<!--[\s\S]*?-->/g;

/** Collapse a pasted full `<!DOCTYPE html>` document to just its body fragment. */
export const stripDocumentChrome = (input) => {
  let html = String(input || '');
  if (!html) return '';

  const looksLikeDoc =
    /<!doctype/i.test(html) || /<html[\s>]/i.test(html) || /<head[\s>]/i.test(html) || /<body[\s>]/i.test(html);
  if (!looksLikeDoc) return html;

  html = html.replace(HTML_COMMENT, '');

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

/** Strip editor table artifacts (colgroup, redundant colspan="1", min-width). */
export const normalizeArticleTables = (input) => {
  let html = String(input || '');
  if (!html) return '';
  html = html.replace(/<colgroup[\s\S]*?<\/colgroup>/gi, '');
  html = html.replace(/<col\b[^>]*>/gi, '');
  html = html.replace(/\s(colspan|rowspan)=("|')1\2/gi, '');
  html = html.replace(/\s(colspan|rowspan)=1(?=[\s/>])/gi, '');
  html = html.replace(/<(td|th)([^>]*)>\s*<p>\s*<\/p>\s*<\/\1>/gi, '<$1$2></$1>');
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

/**
 * Wrap every `<table>` in `<div class="table-responsive">` so it scrolls inside
 * its own box on small screens instead of pushing a page-wide scrollbar.
 * Idempotent — a table already inside `.table-responsive` is left alone.
 */
export const wrapResponsiveTables = (input) => {
  const html = String(input || '');
  if (!html) return '';
  return html.replace(
    /(<div class="table-responsive">\s*)?(<table\b[\s\S]*?<\/table>)/gi,
    (match, wrapped, table) => (wrapped ? match : `<div class="table-responsive">${table}</div>`),
  );
};

/**
 * Every `<img>` referenced by the article HTML — this is what makes the Images
 * tab *detect* content images instead of deleting them because they weren't
 * uploaded through the tab. Deduped by src, alt/dimensions preserved.
 */
export const detectArticleImages = (input) => {
  const html = String(input || '');
  const out = [];
  const seen = new Set();
  const re = /<img\b[^>]*>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const tag = m[0];
    const src = (tag.match(/\bsrc=("|')([^"']+)\1/i) || [])[2];
    if (!src || seen.has(src)) continue;
    seen.add(src);
    out.push({
      src,
      alt: (tag.match(/\balt=("|')([^"']*)\1/i) || [])[2] || '',
      title: (tag.match(/\btitle=("|')([^"']*)\1/i) || [])[2] || '',
      width: Number((tag.match(/\bwidth=("|')?(\d+)/i) || [])[2]) || 0,
      height: Number((tag.match(/\bheight=("|')?(\d+)/i) || [])[2]) || 0,
    });
  }
  return out;
};

const setImgAttr = (tag, name, val) => {
  const has = new RegExp(`\\s${name}=("|')[^"']*\\1`, 'i');
  if (val == null || val === '') {
    return has.test(tag) ? tag.replace(has, '') : tag;
  }
  const safe = String(val).replace(/"/g, '&quot;');
  if (has.test(tag)) return tag.replace(has, ` ${name}="${safe}"`);
  return tag.replace(/<img\b/i, `<img ${name}="${safe}"`);
};

/**
 * Update the alt / title on every `<img>` in the article HTML whose src matches
 * (raw or Cloudinary-normalized). Used by the Images tab so an admin can fix a
 * detected content image's ALT text without hunting for it in the editor.
 */
export const updateArticleImageAttrs = (input, src, attrs = {}) => {
  const html = String(input || '');
  if (!html || !src) return html;
  const norm = (u) => String(u || '').replace(/\/upload\/[^/]*\//, '/upload/');
  const targetNorm = norm(src);
  return html.replace(/<img\b[^>]*>/gi, (tag) => {
    const tagSrc = (tag.match(/\bsrc=("|')([^"']+)\1/i) || [])[2];
    if (!tagSrc || (tagSrc !== src && norm(tagSrc) !== targetNorm)) return tag;
    let next = tag;
    if ('alt' in attrs) next = setImgAttr(next, 'alt', attrs.alt);
    if ('title' in attrs) next = setImgAttr(next, 'title', attrs.title);
    return next;
  });
};

/**
 * Light DOM-based scrub for the editor's live Preview of *unsaved* content
 * (the server sanitizer is the real gate on save). Removes script/style/link,
 * on* handlers, javascript: URLs and non-YouTube/Vimeo iframes.
 */
export const sanitizeArticleHtmlClient = (input) => {
  const html = String(input || '');
  if (!html || typeof window === 'undefined' || typeof DOMParser === 'undefined') return html;
  const doc = new DOMParser().parseFromString(`<body><div id="__ae_root">${html}</div></body>`, 'text/html');
  const root = doc.getElementById('__ae_root');
  if (!root) return html;

  root.querySelectorAll('script,style,link,meta,base,object,embed').forEach((el) => el.remove());
  root.querySelectorAll('*').forEach((el) => {
    [...el.attributes].forEach((attr) => {
      const name = attr.name.toLowerCase();
      const value = attr.value || '';
      if (name.startsWith('on')) el.removeAttribute(attr.name);
      if ((name === 'href' || name === 'src' || name === 'xlink:href') &&
          /^\s*(?:javascript|vbscript|data:text\/html)\s*:/i.test(value)) {
        el.removeAttribute(attr.name);
      }
    });
  });
  root.querySelectorAll('iframe').forEach((f) => {
    if (!/^https:\/\/(?:www\.)?(?:youtube\.com\/embed\/|player\.vimeo\.com\/video\/)/i.test(f.getAttribute('src') || '')) {
      f.remove();
    }
  });
  return root.innerHTML;
};

/** The stable HTML pre-processing every render path applies. */
export const renderArticleHtml = (input) => wrapResponsiveTables(normalizeArticleTables(String(input || '')));

/** Split whatever was pasted / typed into { html, css }. */
export const splitPastedArticle = (rawHtml, existingCss = '') => {
  const { html, css } = extractStyleBlocks(stripDocumentChrome(rawHtml));
  const mergedCss = [String(existingCss || '').trim(), css].filter(Boolean).join('\n\n');
  return { html: normalizeArticleTables(html), css: mergedCss };
};

export default {
  stripDocumentChrome,
  extractStyleBlocks,
  normalizeArticleTables,
  wrapResponsiveTables,
  detectArticleImages,
  updateArticleImageAttrs,
  sanitizeArticleHtmlClient,
  renderArticleHtml,
  splitPastedArticle,
};
