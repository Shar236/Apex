import type { Metadata } from 'next';
import Link from 'next/link';
import { Sparkles, ChevronRight, ChevronLeft, User } from 'lucide-react';
import { BlogCard } from '@/components/blog/blog-card';
import { BlogFeaturedCard } from '@/components/blog/blog-featured-card';
import { BlogCategoryFilter, BlogSearch } from '@/components/blog/blog-filters';
import { listPublicBlogPosts, listBlogCategories } from '@/lib/blog-api';
import { buildMetadata, JsonLd } from '@/lib/seo';
import { siteConfig } from '@/lib/config';

const PAGE_SIZE = 9;

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: 'Students Diary & Exam Guides',
    description: 'Expert guides on PTE, IELTS, TOEFL, GRE, admissions, study abroad, and education loans for Indian students. Read the latest exam tips and voucher guides.',
    path: '/blog',
  });
}

interface BlogSearchParams {
  category?: string;
  q?: string;
  page?: string;
}

export default async function BlogIndexPage({ searchParams }: { searchParams: Promise<BlogSearchParams> }) {
  const params = await searchParams;
  const activeCategory = params.category || 'All';
  const search = params.q || '';
  const page = Math.max(1, parseInt(params.page || '1', 10) || 1);

  const [listResult, categories] = await Promise.all([listPublicBlogPosts({ category: activeCategory, search, page, limit: PAGE_SIZE }), listBlogCategories()]);

  const posts = listResult.data;
  const featured = page === 1 && !search ? posts.find((p) => p.featured) : undefined;
  const gridPosts = featured ? posts.filter((p) => p._id !== featured._id) : posts;

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Students Diary & Exam Guides',
    description: 'Expert guides on PTE, IELTS, TOEFL, GRE, admissions, study abroad, and education loans for Indian students.',
    url: `${siteConfig.siteUrl}/blog`,
  };

  const buildPageHref = (targetPage: number) => {
    const qs = new URLSearchParams();
    if (activeCategory !== 'All') qs.set('category', activeCategory);
    if (search) qs.set('q', search);
    if (targetPage > 1) qs.set('page', String(targetPage));
    const query = qs.toString();
    return `/blog${query ? `?${query}` : ''}`;
  };

  return (
    <div className="bg-white dark:bg-[#06070B] text-neutral-900 dark:text-white transition-colors duration-300">
      <JsonLd data={collectionJsonLd} />

      <div className="relative bg-[#06070B] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-brand-pink/8 blur-3xl" />
          <div className="absolute top-1/2 -left-40 w-96 h-96 rounded-full bg-[#6C3CE0]/8 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFF0F5] dark:bg-[#2A0A17] text-brand-pink text-[11px] font-black uppercase tracking-widest border border-brand-pink/25 mb-5">
              <Sparkles className="w-3.5 h-3.5" /> Students Diary
            </span>
            <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight text-white mb-4">
              Students Diary &amp; <span className="text-gradient-pink">Exam Guides</span>
            </h1>
            <p className="text-sm sm:text-base font-medium text-neutral-400 max-w-2xl mx-auto leading-relaxed">Expert guides on PTE, IELTS, TOEFL, GRE, admissions, study abroad, and education loans for Indian students.</p>
            <BlogSearch defaultValue={search} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
        <BlogCategoryFilter active={activeCategory} categories={categories} />

        {posts.length === 0 && (
          <div className="py-20 text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] flex items-center justify-center mx-auto">
              <User className="w-7 h-7 text-neutral-400" />
            </div>
            <p className="font-heading font-black text-lg text-neutral-900 dark:text-white">No articles found</p>
            <p className="text-sm font-medium text-neutral-500 dark:text-[#B5B5B5]">{search ? `No results for "${search}".` : 'New articles coming soon. Check back later.'}</p>
            {(search || activeCategory !== 'All') && (
              <Link href="/blog" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl btn-pink text-white font-bold text-sm shadow-md">
                Clear filters
              </Link>
            )}
          </div>
        )}

        {featured && <BlogFeaturedCard post={featured} />}

        {posts.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-7">
              {gridPosts.map((post, idx) => (
                <BlogCard key={post._id || post.slug} post={post} index={idx} />
              ))}
            </div>

            {listResult.pages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-10">
                {page > 1 && (
                  <Link href={buildPageHref(page - 1)} className="inline-flex items-center gap-1.5 px-5 py-3 rounded-2xl btn-secondary text-sm! font-black">
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </Link>
                )}
                <span className="text-xs font-bold text-neutral-400 px-2">
                  Page {page} of {listResult.pages}
                </span>
                {page < listResult.pages && (
                  <Link href={buildPageHref(page + 1)} className="inline-flex items-center gap-1.5 px-5 py-3 rounded-2xl btn-secondary text-sm! font-black">
                    Next <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            )}

            <p className="text-center text-[11px] font-bold text-neutral-400 dark:text-neutral-500 mt-6">
              Showing {posts.length} of {listResult.total} articles
            </p>
          </>
        )}
      </div>
    </div>
  );
}
