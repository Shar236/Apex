import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { TableOfContents } from './table-of-contents';
import type { BlogPost } from '@/lib/blog-types';
import type { ReactNode } from 'react';

/**
 * The ONE outer shell for every article at /blog/[slug] — both CMS posts and
 * code-based React articles. Provides the page container, breadcrumb, and —
 * for CMS posts only — the sticky desktop Table of Contents sidebar
 * (auto-generated from the H2/H3 in `tocScope`).
 *
 * Code articles pass no `tocScope`; they render full-width and place their
 * own inline <TableOfContents> where their design calls for it.
 */
export function ArticleLayout({ post, tocScope, children }: { post: BlogPost; tocScope?: string; children: ReactNode }) {
  const hasHeadings = tocScope ? /<h[23][^>]*>/i.test(post.content || '') : false;

  return (
    <div className="bg-white dark:bg-[#06070B] text-neutral-900 dark:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <nav className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-500 dark:text-neutral-400 mb-8 flex-wrap" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-brand-pink transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-neutral-400" />
          <Link href="/blog" className="hover:text-brand-pink transition-colors">
            Students Diary
          </Link>
          <ChevronRight className="w-3 h-3 text-neutral-400" />
          {post.category && (
            <>
              <Link href={`/blog?category=${encodeURIComponent(post.category)}`} className="hover:text-brand-pink transition-colors">
                {post.category}
              </Link>
              <ChevronRight className="w-3 h-3 text-neutral-400" />
            </>
          )}
          <span className="text-neutral-400 dark:text-neutral-500 line-clamp-1">{post.title}</span>
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
            <div className={`${hasHeadings ? 'lg:col-span-9' : 'lg:col-span-12 lg:mx-auto lg:max-w-4xl'} order-1 lg:order-2`}>{children}</div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
