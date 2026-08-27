import React, { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Clock, ArrowRight, Search, Calendar, User, Sparkles, Loader2, ChevronRight, TriangleAlert } from 'lucide-react';
import { publicBlogApi, applyPageMetadata, setStructuredData } from '../lib/api';

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '');

const CATEGORIES = [
  'All', 'PTE', 'IELTS', 'TOEFL', 'GRE', 'Duolingo', 'Study Abroad',
  'Admissions', 'Education Loans', 'Visa', 'Universities', 'Exam Preparation',
];

function ArticleCard({ post, index = 0 }) {
  return (
    <Link to={`/blog/${post.slug}`} className="group relative flex flex-col rounded-3xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] hover:border-brand-pink/40 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl animate-fade-up" style={{ animationDelay: `${Math.min(index * 60, 300)}ms` }}>
      <div className="aspect-[16/9] bg-neutral-100 dark:bg-[#0E0E0E] overflow-hidden">
        {post.coverImage ? (
          <img src={post.coverImage} alt={post.coverImageAlt || post.title} width={480} height={270} loading={index < 2 ? 'eager' : 'lazy'} decoding="async" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-300 dark:text-neutral-600 text-xs font-bold">No image</div>
        )}
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-brand-pink text-white text-[10px] font-black uppercase tracking-wider shadow-md">{post.category}</span>
      </div>
      <div className="flex flex-col flex-1 p-5 space-y-2.5">
        <h3 className="font-heading font-black text-base leading-snug text-neutral-900 dark:text-white line-clamp-2 group-hover:text-brand-pink transition-colors">{post.title}</h3>
        <p className="text-xs font-medium text-neutral-500 dark:text-[#B5B5B5] line-clamp-2 flex-1">{post.excerpt}</p>
        <div className="flex items-center justify-between pt-2.5 border-t border-[#EAEAEA] dark:border-[#292929]">
          <div className="flex items-center gap-3 text-[10px] font-bold text-neutral-400">
            <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" /> {fmtDate(post.publishedAt)}</span>
            {post.readingTime ? <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readingTime} min</span> : null}
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-black text-brand-pink group-hover:gap-1.5 transition-all">Read <ArrowRight className="w-3 h-3" /></span>
        </div>
      </div>
    </Link>
  );
}

export function BlogIndexPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'All');
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '');

  const loadPosts = useCallback(async (nextPage = 1, append = false) => {
    const loader = append ? setLoadingMore : setLoading;
    loader(true);
    setError(null);
    try {
      const params = { page: nextPage, limit: 9 };
      if (activeCategory && activeCategory !== 'All') params.category = activeCategory;
      if (search) params.search = search;
      const res = await publicBlogApi.list(params);
      if (res.success) {
        setPosts((prev) => (append ? [...prev, ...(res.data || [])] : (res.data || [])));
        setTotal(res.total || 0);
        setHasMore(!!res.hasMore);
        setPage(nextPage);
      } else {
        setError(res.message || 'Failed to load articles');
      }
    } catch (err) {
      setError(err.message || 'Failed to load articles');
    } finally {
      loader(false);
    }
  }, [activeCategory, search]);

  useEffect(() => {
    loadPosts(1, false);
  }, [loadPosts]);

  useEffect(() => {
    publicBlogApi.categories().then((res) => {
      if (res.success) setCategories(res.data || []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    applyPageMetadata({
      title: 'Students Diary & Exam Guides | Apex Vouchers',
      description: 'Expert guides on PTE, IELTS, TOEFL, GRE, admissions, study abroad, and education loans for Indian students. Read the latest exam tips and voucher guides.',
      canonical: `${window.location.origin}/blog`,
    });
    setStructuredData('blog-index', {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Students Diary & Exam Guides',
      description: 'Expert guides on PTE, IELTS, TOEFL, GRE, admissions, study abroad, and education loans for Indian students.',
      url: `${window.location.origin}/blog`,
    });
    return () => setStructuredData('blog-index', null);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchInput.trim();
    setSearch(q);
    setActiveCategory('All');
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    setSearchParams(params, { replace: true });
  };

  const handleCategory = (cat) => {
    setActiveCategory(cat);
    setSearch('');
    setSearchInput('');
    const params = new URLSearchParams();
    if (cat !== 'All') params.set('category', cat);
    setSearchParams(params, { replace: true });
  };

  const featured = posts.find((p) => p.featured);
  const gridPosts = featured ? posts.filter((p) => p._id !== featured._id) : posts;

  return (
    <div className="bg-white dark:bg-[#0A0A0A] text-neutral-900 dark:text-white transition-colors duration-300">
      {/* ── Hero Header ──────────────────────────────────────────────────── */}
      <div className="relative bg-[#0A0A0A] overflow-hidden">
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
            <p className="text-sm sm:text-base font-medium text-neutral-400 max-w-2xl mx-auto leading-relaxed">
              Expert guides on PTE, IELTS, TOEFL, GRE, admissions, study abroad, and education loans for Indian students.
            </p>
            {/* Search */}
            <form onSubmit={handleSearch} className="mt-6 max-w-md mx-auto relative">
              <input
                type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search articles by topic, keyword…"
                aria-label="Search articles"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/10 dark:bg-[#161616] border border-[#292929] text-white text-sm font-bold placeholder:text-neutral-500 focus:outline-none focus:border-brand-pink transition"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            </form>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
        {/* ── Category Nav ────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-6 sm:pt-8 mb-8 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition whitespace-nowrap cursor-pointer ${
                activeCategory === cat
                  ? 'bg-brand-pink text-white shadow-sm'
                  : 'bg-neutral-100 dark:bg-[#262626] text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-[#333]'
              }`}
            >
              {cat} {cat !== 'All' && categories.find((c) => c.name?.toLowerCase() === cat.toLowerCase()) ? `(${categories.find((c) => c.name?.toLowerCase() === cat.toLowerCase()).count})` : ''}
            </button>
          ))}
        </div>

        {/* ── Loading State ───────────────────────────────────────────────── */}
        {loading && (
          <div className="flex items-center justify-center py-20 text-neutral-500 dark:text-neutral-400 gap-2.5">
            <Loader2 className="w-5 h-5 animate-spin text-brand-pink" />
            <span className="text-sm font-bold">Loading articles…</span>
          </div>
        )}

        {/* ── Error State ─────────────────────────────────────────────────── */}
        {!loading && error && (
          <div className="max-w-md mx-auto py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 mx-auto flex items-center justify-center mb-4">
              <TriangleAlert className="w-7 h-7 text-amber-500" />
            </div>
            <h2 className="font-heading font-black text-lg mb-1.5 text-neutral-900 dark:text-white">Couldn't load articles</h2>
            <p className="text-sm font-medium text-neutral-500 dark:text-[#B5B5B5] mb-5">{error}</p>
            <button onClick={() => loadPosts(1, false)} className="btn-pink text-xs! font-black px-5 py-3! rounded-xl">Try Again</button>
          </div>
        )}

        {/* ── Empty State ─────────────────────────────────────────────────── */}
        {!loading && !error && posts.length === 0 && (
          <div className="py-20 text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] flex items-center justify-center mx-auto">
              <User className="w-7 h-7 text-neutral-400" />
            </div>
            <p className="font-heading font-black text-lg text-neutral-900 dark:text-white">No articles found</p>
            <p className="text-sm font-medium text-neutral-500 dark:text-[#B5B5B5]">{search ? `No results for "${search}".` : 'New articles coming soon. Check back later.'}</p>
            {search && <button onClick={() => { setSearch(''); setSearchInput(''); handleCategory('All'); }} className="btn-pink text-xs! font-black px-5 py-3! rounded-xl">Clear Search</button>}
          </div>
        )}

        {/* ── Featured Spotlight ──────────────────────────────────────────── */}
        {!loading && featured && (
          <div className="mb-10 sm:mb-12 animate-fade-up">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-pink text-white text-[10px] font-black uppercase tracking-wider">
                ✦ Featured Article
              </span>
            </div>
            <Link to={`/blog/${featured.slug}`} className="group relative grid md:grid-cols-2 rounded-3xl overflow-hidden border border-brand-pink/25 bg-white dark:bg-[#161616] card-shadow hover:shadow-2xl transition-all duration-300">
              <div className="relative aspect-video md:aspect-auto md:min-h-80 overflow-hidden bg-neutral-100 dark:bg-[#0E0E0E]">
                {featured.coverImage ? (
                  <img src={featured.coverImage} alt={featured.coverImageAlt || featured.title} width={800} height={450} loading="eager" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-300 dark:text-neutral-600">No image</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/60 via-black/10 to-transparent" />
                <span className="absolute top-4 left-4 px-3 py-1 rounded-lg bg-brand-pink text-white text-[11px] font-black uppercase tracking-wider shadow-md">{featured.category}</span>
              </div>
              <div className="flex flex-col justify-center p-6 sm:p-10 space-y-4">
                <div className="flex items-center gap-3 flex-wrap text-[11px] font-bold text-neutral-500 dark:text-[#B5B5B5]">
                  <span className="inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-brand-pink" /> {fmtDate(featured.publishedAt)}</span>
                  {featured.readingTime ? <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-brand-pink" /> {featured.readingTime} min read</span> : null}
                  {featured.author ? <span className="inline-flex items-center gap-1"><User className="w-3.5 h-3.5 text-brand-pink" /> {featured.author}</span> : null}
                </div>
                <h2 className="font-heading font-black text-2xl sm:text-3xl leading-tight text-neutral-900 dark:text-white">{featured.title}</h2>
                <p className="text-sm font-medium text-neutral-500 dark:text-[#B5B5B5] leading-relaxed line-clamp-3">{featured.excerpt}</p>
                <span className="inline-flex items-center gap-2 text-brand-pink text-sm font-black group-hover:gap-3 transition-all">
                  Read Article <ArrowRight className="w-4 h-4" strokeWidth={3} />
                </span>
              </div>
            </Link>
          </div>
        )}

        {/* ── Article Grid ────────────────────────────────────────────────── */}
        {!loading && !error && posts.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-7">
              {(featured ? gridPosts : posts).map((post, idx) => (
                <ArticleCard key={post._id || post.slug} post={post} index={idx} />
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={() => loadPosts(page + 1, true)}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl btn-secondary text-sm! font-black disabled:opacity-60 cursor-pointer"
                >
                  {loadingMore ? <><Loader2 className="w-4 h-4 animate-spin text-brand-pink" /> Loading…</> : <>Load More Articles <ChevronRight className="w-4 h-4" /></>}
                </button>
              </div>
            )}

            <p className="text-center text-[11px] font-bold text-neutral-400 dark:text-neutral-500 mt-6" aria-live="polite">
              Showing {posts.length} of {total} articles
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default BlogIndexPage;