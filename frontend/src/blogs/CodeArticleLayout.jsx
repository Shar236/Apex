import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
// Note: article-shared.css is imported by each article component, so it only
// loads when a code article actually renders — never on plain CMS post pages.

/**
 * Page chrome for a code-based article. Provides the same outer container,
 * theme background and breadcrumb as the CMS renderer (BlogArticleView) so both
 * `contentSource` paths look consistent at /blog/:slug. The registered article
 * component is rendered as `children` and owns everything below the breadcrumb.
 */
export default function CodeArticleLayout({ post, children }) {
  return (
    <div className="bg-white dark:bg-[#0A0A0A] text-neutral-900 dark:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
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

        {children}
      </div>
    </div>
  );
}
