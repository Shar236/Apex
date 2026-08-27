import { lazy } from 'react';

/**
 * Code-based article registry.
 *
 * Maps an EXISTING blog slug (managed by the CMS) to an approved React
 * component. A post renders from code only when BOTH are true:
 *   1. its `contentSource` is `"code"` (set in the CMS Blog editor), and
 *   2. its slug is a key in this object.
 *
 * If `contentSource` is `"code"` but no component is registered for the slug,
 * the app falls back to the normal CMS renderer — it never errors.
 *
 * SECURITY: this map is the ONLY place a code article can be wired in. The
 * database stores a plain `contentSource` flag, never an import path or code.
 * Nothing from the API is used to resolve a module.
 *
 * PERFORMANCE: each component is `lazy()`-loaded, so article bundles are
 * code-split and never loaded on /blog or any route other than that article.
 */
export const codeBlogRegistry = {
  'ielts-score-canada-8-7-7-7-rule-2026': lazy(() => import('./articles/IeltsCanada2026.jsx')),
};

/** Human-readable component name per slug — used by the admin selector only. */
export const codeBlogLabels = {
  'ielts-score-canada-8-7-7-7-rule-2026': 'IeltsCanada2026',
};

/** Lazy component for a slug, or null when there is no registered code article. */
export function getCodeArticle(slug) {
  if (!slug) return null;
  return Object.prototype.hasOwnProperty.call(codeBlogRegistry, slug)
    ? codeBlogRegistry[slug]
    : null;
}

/** True when a slug has an approved code component registered. */
export function hasCodeArticle(slug) {
  return getCodeArticle(slug) !== null;
}

/** [{ slug, label }] of every registered code article — for the admin dropdown. */
export function listCodeArticles() {
  return Object.keys(codeBlogRegistry).map((slug) => ({
    slug,
    label: codeBlogLabels[slug] || slug,
  }));
}
