import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, User, CalendarDays, ChevronRight, Share2, ChevronDown, ArrowRight, BookOpen, PenLine } from 'lucide-react';

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '');

const slugify = (text) =>
  String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

/**
 * Parse article HTML and assign stable ids to h2/h3 headings so the TOC
 * and in-page anchors work. Returns { htmlWithIds, toc }.
 */
const prepareContent = (html) => {
  if (!html) return { htmlWithIds: '', toc: [] };
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const headings = Array.from(doc.querySelectorAll('h2, h3'));
    const toc = [];
    const used = {};
    headings.forEach((h) => {
      const raw = slugify(h.textContent) || 'section';
      const id = used[raw] ? `${raw}-${++used[raw]}` : raw;
      used[raw] = used[raw] ? used[raw] : 0;
      h.id = id;
      toc.push({ id, level: h.tagName.toLowerCase(), text: h.textContent.trim() });
    });
    return { htmlWithIds: doc.body.innerHTML, toc };
  } catch {
    return { htmlWithIds: html, toc: [] };
  }
};

export function FaqAccordion({ faqs }) {
  const [open, setOpen] = useState(0);
  return (
    <section className="mt-12 pt-10 border-t border-[#EAEAEA] dark:border-[#292929]" aria-label="Frequently Asked Questions">
      <h2 className="font-heading font-black text-2xl sm:text-3xl mb-6">Frequently Asked Questions</h2>
      <div className="space-y-3">
        {faqs.map((f, idx) => {
          const isOpen = open === idx;
          return (
            <div key={idx} className={`faq-accordion rounded-2xl border transition-all ${isOpen ? 'border-brand-pink/40 bg-[#FFF0F5] dark:bg-[#2A0A17]' : 'border-[#EAEAEA] dark:border-[#292929] bg-white dark:bg-[#161616]'}`}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : idx)}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left cursor-pointer"
              >
                <h3 className="font-heading font-black text-sm sm:text-base text-neutral-900 dark:text-white flex-1">{f.question}</h3>
                <ChevronDown className={`w-4 h-4 text-brand-pink shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              {isOpen && (
                <div className="px-5 pb-5">
                  <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">{f.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function TableOfContents({ toc }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  if (!toc || toc.length === 0) return null;
  return (
    <nav className="mb-10 lg:mb-0" aria-label="Table of contents">
      <div className="rounded-2xl border border-[#EAEAEA] dark:border-[#292929] bg-white dark:bg-[#161616] overflow-hidden">
        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
          className="lg:hidden w-full flex items-center justify-between gap-2 px-4 py-3.5 text-left cursor-pointer"
        >
          <span className="inline-flex items-center gap-2 font-heading font-black text-sm text-neutral-900 dark:text-white"><BookOpen className="w-4 h-4 text-brand-pink" /> Table of Contents</span>
          <ChevronDown className={`w-4 h-4 text-brand-pink transition-transform duration-200 ${mobileOpen ? 'rotate-180' : ''}`} />
        </button>
        <div className={`${mobileOpen ? 'block' : 'hidden'} lg:block`}>
          <div className="hidden lg:flex items-center gap-2 px-4 py-3.5 border-b border-[#EAEAEA] dark:border-[#292929]">
            <BookOpen className="w-4 h-4 text-brand-pink" />
            <span className="font-heading font-black text-sm text-neutral-900 dark:text-white">Table of Contents</span>
          </div>
          <ol className="p-3 space-y-0.5 max-h-96 overflow-y-auto">
            {toc.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById(item.id);
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      history.replaceState(null, '', `#${item.id}`);
                    }
                    setMobileOpen(false);
                  }}
                  className={`block px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    item.level === 'h3' ? 'pl-6 text-neutral-500 dark:text-neutral-400' : 'text-neutral-700 dark:text-neutral-200 font-black'
                  } hover:text-brand-pink hover:bg-[#FFF0F5] dark:hover:bg-[#2A0A17]`}
                >
                  {item.text}
                </a>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </nav>
  );
}

/**
 * Related-articles grid. Exported so code-based articles
 * (frontend/src/blogs/) render the exact same UI without duplicating markup.
 * Data still comes from the existing public blog API.
 */
export function RelatedArticles({ relatedPosts = [], heading = 'You may also like' }) {
  if (!relatedPosts || relatedPosts.length === 0) return null;
  return (
    <section className="mt-14 pt-10 border-t border-[#EAEAEA] dark:border-[#292929]" aria-label="Related articles">
      <h2 className="font-heading font-black text-2xl mb-5">{heading}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {relatedPosts.slice(0, 6).map((r) => (
          <Link key={r._id || r.slug} to={`/blog/${r.slug}`} className="group rounded-2xl overflow-hidden bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] hover:border-brand-pink transition-all hover:-translate-y-0.5 card-shadow">
            <div className="aspect-video bg-neutral-100 dark:bg-[#0E0E0E]">
              {r.coverImage && <img src={r.coverImage} alt={r.coverImageAlt || r.title} width={480} height={270} loading="lazy" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />}
            </div>
            <div className="p-4">
              {r.category && <span className="text-[10px] font-black text-brand-pink uppercase tracking-wider">{r.category}</span>}
              <h3 className="font-heading font-black text-sm leading-snug line-clamp-2 mt-1 group-hover:text-brand-pink transition-colors">{r.title}</h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function BlogArticleView({ post, relatedPosts = [], isPreview = false }) {
  const { htmlWithIds, toc } = useMemo(() => prepareContent(post?.content), [post?.content]);

  useEffect(() => {
    if (!post) return;
    const anchor = window.location.hash;
    if (anchor) {
      const t = setTimeout(() => {
        const el = document.getElementById(anchor.slice(1));
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [post]);

  if (!post) return null;

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const hasToc = toc.length > 0;

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: post.title, url: shareUrl }); } catch {}
    } else if (navigator.clipboard) {
      try { await navigator.clipboard.writeText(shareUrl); alert('Link copied to clipboard'); } catch {}
    }
  };

  return (
    <div className="bg-white dark:bg-[#0A0A0A] text-neutral-900 dark:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {isPreview && (
          <div className="mb-6 px-4 py-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-xs font-black text-center">
            🔒 Preview Mode — this article is not publicly visible until Published.
          </div>
        )}

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-500 dark:text-neutral-400 mb-8 flex-wrap" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-brand-pink transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 text-neutral-400" />
          <Link to="/blog" className="hover:text-brand-pink transition-colors">Students Diary</Link>
          <ChevronRight className="w-3 h-3 text-neutral-400" />
          {post.category && (
            <>
              <Link to={`/blog?category=${encodeURIComponent(post.category)}`} className="hover:text-brand-pink transition-colors">{post.category}</Link>
              <ChevronRight className="w-3 h-3 text-neutral-400" />
            </>
          )}
          <span className="text-neutral-400 dark:text-neutral-500 line-clamp-1">{post.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Sticky TOC sidebar (desktop) */}
          {hasToc && (
            <aside className="lg:col-span-3 order-2 lg:order-1">
              <div className="lg:sticky lg:top-24">
                <TableOfContents toc={toc} />
              </div>
            </aside>
          )}

          {/* Article body */}
          <div className={`${hasToc ? 'lg:col-span-9' : 'lg:col-span-12 lg:mx-auto lg:max-w-4xl'} order-1 lg:order-2`}>
            <article>
              <header>
                <div className="flex items-center gap-2 flex-wrap mb-4">
                  <Link to={`/blog?category=${encodeURIComponent(post.category)}`} className="inline-flex px-2.5 py-1 rounded-lg bg-[#FFF0F5] dark:bg-[#2A0A17] text-brand-pink text-[10px] font-black uppercase tracking-wider border border-brand-pink/25 hover:bg-[#FFE0EB] dark:hover:bg-[#3a0f22] transition-colors">
                    {post.category}
                  </Link>
                  {post.featured && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-pink text-white text-[10px] font-black uppercase tracking-wider">✦ Featured</span>
                  )}
                </div>

                <h1 className="font-heading font-black text-3xl sm:text-4xl lg:text-[2.6rem] leading-tight text-neutral-900 dark:text-white mb-4">
                  {post.title}
                </h1>

                {post.excerpt && (
                  <p className="text-base sm:text-lg font-medium text-neutral-500 dark:text-[#B5B5B5] leading-relaxed mb-6">
                    {post.excerpt}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-bold text-neutral-500 dark:text-neutral-400 mb-3">
                  {post.author && (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-6 h-6 rounded-full bg-[#FFF0F5] dark:bg-[#2A0A17] border border-brand-pink/20 flex items-center justify-center overflow-hidden">
                        {post.authorImage ? <img src={post.authorImage} alt={post.author} className="w-full h-full object-cover" /> : <User className="w-3.5 h-3.5 text-brand-pink" />}
                      </span>
                      {post.author}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" /> Published {fmtDate(post.publishedAt || post.createdAt)}</span>
                  {post.readingTime ? <span className="inline-flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {post.readingTime} min read</span> : null}
                </div>

                {post.updatedAt && post.publishedAt && new Date(post.updatedAt) - new Date(post.publishedAt) > 86400000 && (
                  <p className="text-[11px] font-bold text-neutral-400 mb-4">Updated {fmtDate(post.updatedAt)}</p>
                )}
              </header>

              {/* Hero image */}
              {post.coverImage && (
                <figure className="rounded-3xl overflow-hidden mb-8 bg-neutral-100 dark:bg-[#161616] card-shadow">
                  <img
                    src={post.coverImage}
                    alt={post.coverImageAlt || post.title}
                    title={post.coverImageTitle || undefined}
                    width={1200}
                    height={630}
                    className="w-full h-auto object-cover"
                    loading="eager"
                  />
                  {post.coverImageCaption && (
                    <figcaption className="text-center text-[11px] font-bold text-neutral-400 py-2.5 px-4">{post.coverImageCaption}</figcaption>
                  )}
                </figure>
              )}

              {/* Article content */}
              <div
                className="prose-blog max-w-none"
                dangerouslySetInnerHTML={{ __html: htmlWithIds || post.content }}
              />

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-10 flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-black uppercase tracking-wider text-neutral-400">Tags:</span>
                  {post.tags.map((t) => (
                    <Link key={t} to={`/blog?q=${encodeURIComponent(t)}`} className="px-3 py-1 rounded-lg bg-neutral-100 dark:bg-[#262626] text-neutral-600 dark:text-neutral-300 text-[11px] font-bold hover:text-brand-pink hover:border-brand-pink/30 border border-transparent transition-colors">
                      #{t}
                    </Link>
                  ))}
                </div>
              )}

              {/* Author bio */}
              {(post.author || post.authorBio) && (
                <div className="mt-10 p-5 sm:p-6 rounded-3xl bg-neutral-50 dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#FFF0F5] dark:bg-[#2A0A17] border border-brand-pink/25 flex items-center justify-center overflow-hidden shrink-0">
                    {post.authorImage ? <img src={post.authorImage} alt={post.author} className="w-full h-full object-cover" /> : <PenLine className="w-5 h-5 text-brand-pink" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-pink mb-0.5">Written by</p>
                    <h3 className="font-heading font-black text-sm sm:text-base text-neutral-900 dark:text-white">{post.author || 'Apex Vouchers Editorial Team'}</h3>
                    {post.authorBio && <p className="text-xs font-medium text-neutral-500 dark:text-[#B5B5B5] leading-relaxed mt-1.5">{post.authorBio}</p>}
                  </div>
                </div>
              )}

              {/* FAQ accordion */}
              {post.faqs && post.faqs.length > 0 && <FaqAccordion faqs={post.faqs} />}

              {/* Share + CTA */}
              <div className="mt-10 flex items-center justify-between flex-wrap gap-3">
                <button onClick={handleShare} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-[#262626] text-xs font-black cursor-pointer hover:text-brand-pink transition-colors">
                  <Share2 className="w-3.5 h-3.5" /> Share this article
                </button>
                <Link to="/exam-booking" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl btn-pink text-white text-xs font-black shadow-lg">
                  Browse Exam Vouchers <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </article>

            {/* Related articles */}
            <RelatedArticles relatedPosts={relatedPosts} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default BlogArticleView;