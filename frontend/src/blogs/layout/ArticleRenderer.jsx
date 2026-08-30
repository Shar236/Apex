import React, { Suspense } from 'react';
import { getCodeArticle } from '../registry.js';
import ArticleLayout from './ArticleLayout.jsx';
import ArticleBody from '../components/ArticleBody.jsx';

const LoadingArticle = () => (
  <div className="min-h-[40vh] flex items-center justify-center text-sm font-bold text-neutral-400 animate-pulse">
    Loading article…
  </div>
);

/**
 * Decides how a single post renders and wraps it in the shared <ArticleLayout>.
 *
 *   contentSource === "code"  AND  a component is registered for the slug
 *        → render that React component (bespoke design), lazy-loaded
 *   otherwise (incl. "code" with no registered component)
 *        → render <ArticleBody> from the sanitized CMS `content`
 *
 * Same URL, same breadcrumb, same SEO/schema (applied by the page) either way.
 * Used by both the public BlogPostPage and the admin BlogPreviewPage.
 */
export default function ArticleRenderer({ post, relatedPosts = [], isPreview = false }) {
  if (!post) return null;

  const CodeArticle = post.contentSource === 'code' ? getCodeArticle(post.slug) : null;

  return (
    <ArticleLayout
      post={post}
      isPreview={isPreview}
      tocScope={CodeArticle ? undefined : '.blog-cms-content'}
    >
      {CodeArticle ? (
        <Suspense fallback={<LoadingArticle />}>
          <CodeArticle post={post} relatedPosts={relatedPosts} />
        </Suspense>
      ) : (
        <ArticleBody post={post} relatedPosts={relatedPosts} />
      )}
    </ArticleLayout>
  );
}
