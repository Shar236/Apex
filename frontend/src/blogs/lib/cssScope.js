import postcss from 'postcss';

/**
 * Client mirror of backend/utils/articleContent.js `sanitizeArticleCss` +
 * `scopeCss`. Used ONLY by the editor's live Preview of *unsaved* CSS — the
 * public blog pages receive CSS already scoped by the server, so this module
 * (and postcss) never loads on a reader-facing route.
 *
 * Keep in sync with the backend copy: same danger patterns, same selector rules.
 */

const CSS_DANGER = /(?:expression\s*\(|-moz-binding|behaviou?r\s*:|javascript\s*:|vbscript\s*:)/i;
const CSS_URL_DANGER = /url\(\s*(['"]?)\s*(?:javascript|vbscript|data:text\/html)\s*:/i;

const isKeyframesParent = (node) =>
  !!node && node.type === 'atrule' && /^(?:-\w+-)?keyframes$/i.test(node.name);

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
    if (name === 'import' || name === 'charset' || name === 'namespace') {
      at.remove();
      return;
    }
    if (name === 'font-face') {
      at.walkDecls((decl) => {
        if (decl.prop.toLowerCase() !== 'src') return;
        const okSrc =
          /url\(\s*['"]?\s*(?:https:\/\/|data:font|data:application\/(?:font|x-font))/i.test(decl.value) ||
          /(^|\s)local\(/i.test(decl.value);
        if (!okSrc) decl.remove();
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

  root.walkRules((rule) => {
    if (!rule.nodes || rule.nodes.length === 0) rule.remove();
  });

  return root.toString().trim();
};

const scopeOneSelector = (selector, scope) => {
  const s = selector.trim();
  if (!s) return s;
  if (s.startsWith(scope)) return s;
  if (/^(?::root|html|body)$/i.test(s)) return scope;
  const lead = s.match(/^(?::root|html|body)\b\s*([\s\S]*)$/i);
  if (lead) return lead[1] ? `${scope} ${lead[1]}` : scope;
  return `${scope} ${s}`;
};

export const blogArticleScope = (id) => `[data-blog-article="${String(id)}"]`;

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

export default { sanitizeArticleCss, scopeCss, blogArticleScope };
