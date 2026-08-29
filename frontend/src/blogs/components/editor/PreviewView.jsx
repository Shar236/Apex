import React, { useMemo } from 'react';
import { renderArticleHtml, sanitizeArticleHtmlClient } from '../../lib/articleContent.js';
import { scopeCss, blogArticleScope } from '../../lib/cssScope.js';

const PREVIEW_SCOPE_ID = 'ae-preview';

/**
 * Live preview of the current editor HTML + CSS, rendered with the same
 * `prose-blog blog-cms-content` styling the public article uses, the same table
 * normalization, and the article CSS scoped exactly like production
 * (`[data-blog-article="…"]`). No save, no round-trip — it reads the same
 * `html` / `css` the editor writes on every keystroke.
 */
export default function PreviewView({ html, css, title }) {
  const safeHtml = useMemo(() => renderArticleHtml(sanitizeArticleHtmlClient(html || '')), [html]);
  const scopedCss = useMemo(
    () => (css ? scopeCss(css, blogArticleScope(PREVIEW_SCOPE_ID)) : ''),
    [css],
  );
  const hasContent = safeHtml.replace(/<[^>]*>/g, '').trim().length > 0;

  return (
    <div className="px-4 sm:px-8 py-6 max-h-[75vh] overflow-y-auto">
      <div className="max-w-3xl mx-auto">
        {scopedCss && <style dangerouslySetInnerHTML={{ __html: scopedCss }} />}
        {title && (
          <h1 className="font-heading font-black text-3xl sm:text-4xl leading-tight text-neutral-900 dark:text-white mb-6">
            {title}
          </h1>
        )}
        {hasContent ? (
          <div
            data-blog-article={PREVIEW_SCOPE_ID}
            className="prose-blog blog-cms-content max-w-none"
            dangerouslySetInnerHTML={{ __html: safeHtml }}
          />
        ) : (
          <p className="text-sm font-bold text-neutral-400 py-16 text-center">
            Nothing to preview yet — add some content in the Edit tab.
          </p>
        )}
      </div>
    </div>
  );
}
