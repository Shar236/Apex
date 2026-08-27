import React, { Suspense, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { blogApi } from '../lib/api';
import { BlogArticleView } from './BlogArticleView';
import { getCodeArticle } from '../blogs/registry';
import CodeArticleLayout from '../blogs/CodeArticleLayout';

// Admin-only preview: never registered in the public route tree, never
// indexable, and reachable only through ProtectedRoute(requireAdmin).
export function BlogPreviewPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = 'Preview — Apex Vouchers Blog';
    let meta = document.querySelector('meta[name="robots"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'robots');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', 'noindex, nofollow');

    blogApi.preview(id).then((res) => {
      if (res.success) {
        setPost(res.data);
        setRelatedPosts(res.relatedPosts || []);
      } else {
        setError(res.message || 'Failed to load preview');
      }
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="min-h-[50vh] flex items-center justify-center text-sm font-bold text-neutral-400 animate-pulse">Loading preview…</div>;
  if (error) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-sm font-bold text-neutral-500">
        {error}
        <Link to="/admin" className="text-brand-pink">Back to Admin</Link>
      </div>
    );
  }

  const CodeArticle = post?.contentSource === 'code' ? getCodeArticle(post.slug) : null;
  if (CodeArticle) {
    return (
      <>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="px-4 py-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-xs font-black text-center">
            🔒 Preview Mode — code-based article. Not publicly visible until Published.
          </div>
        </div>
        <CodeArticleLayout post={post}>
          <Suspense fallback={<div className="min-h-[40vh] flex items-center justify-center text-sm font-bold text-neutral-400 animate-pulse">Loading article…</div>}>
            <CodeArticle post={post} relatedPosts={relatedPosts} />
          </Suspense>
        </CodeArticleLayout>
      </>
    );
  }

  return <BlogArticleView post={post} relatedPosts={relatedPosts} isPreview />;
}

export default BlogPreviewPage;
