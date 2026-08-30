import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { blogApi } from '../lib/blogApi.js';
import ArticleRenderer from '../layout/ArticleRenderer.jsx';

/**
 * Admin-only preview for /admin/blog-preview/:id — never in the public route
 * tree, never indexable, reachable only through ProtectedRoute(requireAdmin).
 * Renders exactly like the public page via <ArticleRenderer>, plus the preview
 * banner (passed through as `isPreview`).
 */
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

  return <ArticleRenderer post={post} relatedPosts={relatedPosts} isPreview />;
}

export default BlogPreviewPage;
