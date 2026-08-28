import React from 'react';

/**
 * Live preview of the current editor HTML, rendered with the exact same
 * `prose-blog blog-cms-content` styling the public article uses
 * (blog.css is imported by <ArticleEditor>). No save, no round-trip — it reads
 * the same `value` the editor writes on every keystroke.
 */
export default function PreviewView({ html, title }) {
  return (
    <div className="px-4 sm:px-8 py-6 max-h-[75vh] overflow-y-auto">
      <div className="max-w-3xl mx-auto">
        {title && (
          <h1 className="font-heading font-black text-3xl sm:text-4xl leading-tight text-neutral-900 dark:text-white mb-6">
            {title}
          </h1>
        )}
        {html && html.replace(/<[^>]*>/g, '').trim() ? (
          <div
            className="prose-blog blog-cms-content max-w-none"
            dangerouslySetInnerHTML={{ __html: html }}
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
