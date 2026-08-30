import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { applyPageMetadata, setStructuredData } from '../../lib/api';
import { publicBlogApi } from '../lib/blogApi.js';
import ArticleRenderer from '../layout/ArticleRenderer.jsx';

/**
 * Public article page for /blog/:slug.
 *
 * Owns data-fetching, SEO metadata and JSON-LD; hands the actual rendering to
 * <ArticleRenderer>, which picks the code component or the CMS body and wraps
 * either in the shared <ArticleLayout>.
 */
export function BlogPostPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    publicBlogApi.get(slug).then((res) => {
      if (cancelled) return;
      if (res.success && res.data) {
        setPost(res.data);
        setRelatedPosts(res.relatedPosts || []);

        const seo = res.data.seo || {};
        const siteUrl = window.location.origin;
        applyPageMetadata({
          title: seo.title || `${res.data.title} | Apex Vouchers Blog`,
          description: seo.description || res.data.excerpt,
          canonical: seo.canonicalUrl || `${siteUrl}/blog/${res.data.slug}`,
          ogTitle: seo.ogTitle || seo.title || res.data.title,
          ogDescription: seo.ogDescription || seo.description || res.data.excerpt,
          ogImage: seo.ogImage || res.data.coverImage,
          ogUrl: `${siteUrl}/blog/${res.data.slug}`,
          ogType: 'article',
          twitterTitle: seo.twitterTitle || seo.title || res.data.title,
          twitterDescription: seo.twitterDescription || seo.description || res.data.excerpt,
          twitterImage: seo.twitterImage || seo.ogImage || res.data.coverImage,
          noindex: !!seo.noindex,
          nofollow: !!seo.nofollow,
        });

        const sd = res.structuredData || {};
        setStructuredData('blog-article', sd.article || null);
        setStructuredData('blog-breadcrumb', sd.breadcrumb || null);
        setStructuredData('blog-faq', sd.faqPage || null);
      } else if (res.code === 'REDIRECT' && (res.redirectTo || res.data?.redirectTo)) {
        // Old slug → follow the managed 301 redirect (slug rename)
        navigate(res.redirectTo || res.data.redirectTo, { replace: true });
        return;
      } else {
        setNotFound(true);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
      setStructuredData('blog-article', null);
      setStructuredData('blog-breadcrumb', null);
      setStructuredData('blog-faq', null);
    };
  }, [slug, navigate]);

  useEffect(() => {
    if (notFound) {
      const t = setTimeout(() => navigate('/blog', { replace: true }), 1200);
      return () => clearTimeout(t);
    }
  }, [notFound, navigate]);

  if (loading) {
    return <div className="min-h-[50vh] flex items-center justify-center text-sm font-bold text-neutral-400 animate-pulse">Loading article…</div>;
  }
  if (notFound) {
    return <div className="min-h-[50vh] flex items-center justify-center text-sm font-bold text-neutral-400">Article not found — redirecting to Blog…</div>;
  }

  return <ArticleRenderer post={post} relatedPosts={relatedPosts} />;
}

export default BlogPostPage;
