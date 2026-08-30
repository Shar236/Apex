import Link from 'next/link';
import { Search } from 'lucide-react';
import type { BlogCategoryCount } from '@/lib/blog-types';

const DISPLAY_CATEGORIES = ['All', 'PTE', 'IELTS', 'TOEFL', 'GRE', 'Duolingo', 'Study Abroad', 'Admissions', 'Education Loans', 'Visa', 'Universities', 'Exam Preparation'];

/** Horizontal category pills. Plain links carrying the ?category= query param — no client JS needed, works with the browser's back button and is fully crawlable. */
export function BlogCategoryFilter({ active, categories = [] }: { active: string; categories?: BlogCategoryCount[] }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-6 sm:pt-8 mb-8 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
      {DISPLAY_CATEGORIES.map((cat) => {
        const hit = cat !== 'All' && categories.find((c) => c.name?.toLowerCase() === cat.toLowerCase());
        const href = cat === 'All' ? '/blog' : `/blog?category=${encodeURIComponent(cat)}`;
        const isActive = active === cat;
        return (
          <Link
            key={cat}
            href={href}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition whitespace-nowrap ${isActive ? 'bg-brand-pink text-white shadow-sm' : 'bg-neutral-100 dark:bg-[#262626] text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-[#333]'}`}
          >
            {cat} {hit ? `(${hit.count})` : ''}
          </Link>
        );
      })}
    </div>
  );
}

/** Search box in the /blog hero — a plain GET form, works without JS. */
export function BlogSearch({ defaultValue = '' }: { defaultValue?: string }) {
  return (
    <form action="/blog" method="GET" className="mt-6 max-w-md mx-auto relative">
      <input
        type="text"
        name="q"
        defaultValue={defaultValue}
        placeholder="Search articles by topic, keyword…"
        aria-label="Search articles"
        className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/10 dark:bg-[#161616] border border-[#292929] text-white text-sm font-bold placeholder:text-neutral-500 focus:outline-none focus:border-brand-pink transition"
      />
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
    </form>
  );
}
