/**
 * Pure string transforms applied to CMS article HTML before rendering.
 * Ported from frontend/src/blogs/lib/articleContent.js — only the render-path
 * pieces (the editor-only helpers there aren't needed until the admin editor
 * is migrated).
 */

/** Strip editor table artifacts (colgroup, redundant colspan="1", min-width). */
const normalizeArticleTables = (input: string): string => {
  let html = input;
  if (!html) return '';
  html = html.replace(/<colgroup[\s\S]*?<\/colgroup>/gi, '');
  html = html.replace(/<col\b[^>]*>/gi, '');
  html = html.replace(/\s(colspan|rowspan)=("|')1\2/gi, '');
  html = html.replace(/\s(colspan|rowspan)=1(?=[\s/>])/gi, '');
  html = html.replace(/<(td|th)([^>]*)>\s*<p>\s*<\/p>\s*<\/\1>/gi, '<$1$2></$1>');
  html = html.replace(/style=("|')([^"']*)\1/gi, (m, q, decls) => {
    const cleaned = decls
      .split(';')
      .map((d: string) => d.trim())
      .filter((d: string) => d && !/^(min-width|table-layout)\s*:/i.test(d))
      .join('; ');
    return cleaned ? `style=${q}${cleaned}${q}` : '';
  });
  return html;
};

/** Wrap every <table> in <div class="table-responsive"> so it scrolls inside its own box on small screens. */
const wrapResponsiveTables = (input: string): string => {
  const html = input;
  if (!html) return '';
  return html.replace(/(<div class="table-responsive">\s*)?(<table\b[\s\S]*?<\/table>)/gi, (match, wrapped, table) => (wrapped ? match : `<div class="table-responsive">${table}</div>`));
};

/** The stable HTML pre-processing every render path applies. */
export const renderArticleHtml = (input?: string | null): string => wrapResponsiveTables(normalizeArticleTables(input || ''));
