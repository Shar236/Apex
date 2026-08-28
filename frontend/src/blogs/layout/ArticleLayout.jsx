import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import TableOfContents from '../components/TableOfContents.jsx';
import '../styles/blog.css';

/**
 * The ONE outer shell for every article at /blog/:slug — both CMS posts
 * (`contentSource: "cms"`) and code-based React articles (`"code"`).
 *
 * Provides: theme background, page container, breadcrumb, the optional
 * preview banner, and — for CMS posts only — the sticky desktop Table of
 * Contents sidebar (auto-generated from the H2/H3 in `tocScope`).
 *
 * Code articles pass no `tocScope`; they render full-width and place their
 * own inline <TableOfContents> where their design calls for it.
 *
 * Props:
 *   post       – the post object (for the breadcrumb category + title)
 *   isPreview  – show the "not publicly visible" admin banner
 *   tocScope   – CSS selector of the CMS content wrapper (e.g. ".blog-cms-content").
 *                Omit for code articles.
 *   children   – <ArticleBody> for CMS, or the registered code component.
 */
export default function ArticleLayout({ post, isPreview = false, tocScope, children }) {
  // Smooth-scroll to a #hash target once the article has mounted.
  useEffect(() => {
    const anchor = typeof window !== 'undefined' ? window.location.hash : '';
    if (!anchor) return undefined;
    const t = setTimeout(() => {
      const el = document.getElementById(anchor.slice(1));
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
    return () => clearTimeout(t);
  }, [post]);

  const hasHeadings = tocScope
    ? /<h[23][^>]*>/i.test(post?.content || '')
    : false;

  return (
    <div className="bg-white dark:bg-[#0A0A0A] text-neutral-900 dark:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {isPreview && (
          <div className="mb-6 px-4 py-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-xs font-black text-center">
            🔒 Preview Mode — this article is not publicly visible until Published.
          </div>
        )}

        <nav
          className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-500 dark:text-neutral-400 mb-8 flex-wrap"
          aria-label="Breadcrumb"
        >
          <Link to="/" className="hover:text-brand-pink transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 text-neutral-400" />
          <Link to="/blog" className="hover:text-brand-pink transition-colors">Students Diary</Link>
          <ChevronRight className="w-3 h-3 text-neutral-400" />
          {post?.category && (
            <>
              <Link
                to={`/blog?category=${encodeURIComponent(post.category)}`}
                className="hover:text-brand-pink transition-colors"
              >
                {post.category}
              </Link>
              <ChevronRight className="w-3 h-3 text-neutral-400" />
            </>
          )}
          <span className="text-neutral-400 dark:text-neutral-500 line-clamp-1">{post?.title}</span>
        </nav>

        {tocScope ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {hasHeadings && (
              <aside className="lg:col-span-3 order-2 lg:order-1">
                <div className="lg:sticky lg:top-24">
                  <TableOfContents scope={tocScope} title="Table of Contents" />
                </div>
              </aside>
            )}
            <div className={`${hasHeadings ? 'lg:col-span-9' : 'lg:col-span-12 lg:mx-auto lg:max-w-4xl'} order-1 lg:order-2`}>
              {children}
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
