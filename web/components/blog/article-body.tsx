import Link from 'next/link';
import Image from 'next/image';
import { Clock, User, CalendarDays, ArrowRight, PenLine } from 'lucide-react';
import { renderArticleHtml } from '@/lib/blog-content';
import { FaqAccordion } from './faq-accordion';
import { RelatedArticles } from './related-articles';
import { ShareButton } from './share-button';
import type { BlogPost } from '@/lib/blog-types';

const fmtDate = (d?: string) => (d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '');

/**
 * The rendered body of a CMS ("cms") blog post: header, hero image, sanitized
 * `content` HTML, tags, author bio, FAQs, share/CTA and related articles.
 * The outer chrome (breadcrumb, optional sticky TOC sidebar) is owned by the
 * article route's layout. The automatic Table of Contents scans H2/H3 inside
 * `.blog-cms-content`.
 */
export function ArticleBody({ post, relatedPosts = [] }: { post: BlogPost; relatedPosts?: BlogPost[] }) {
  const showUpdated = post.updatedAt && post.publishedAt && new Date(post.updatedAt).getTime() - new Date(post.publishedAt).getTime() > 86400000;

  // post.css arrives already scoped by the backend to [data-blog-article="<id>"]
  // — the same id carried by the content wrapper below — so it styles only
  // this article's body and can never reach the navbar, footer, page chrome
  // or another post.
  const scopeId = post._id || post.slug || '';
  const articleCss = post.css || '';
  const contentHtml = renderArticleHtml(post.content);

  return (
    <>
      <article>
        <header>
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <Link href={`/blog?category=${encodeURIComponent(post.category)}`} className="inline-flex px-2.5 py-1 rounded-lg bg-[#FFF0F5] dark:bg-[#2A0A17] text-brand-pink text-[10px] font-black uppercase tracking-wider border border-brand-pink/25 hover:bg-[#FFE0EB] dark:hover:bg-[#3a0f22] transition-colors">
              {post.category}
            </Link>
            {post.featured && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-pink text-white text-[10px] font-black uppercase tracking-wider">✦ Featured</span>}
          </div>

          <h1 className="font-heading font-black text-3xl sm:text-4xl lg:text-[2.6rem] leading-tight text-neutral-900 dark:text-white mb-4">{post.title}</h1>

          {post.excerpt && <p className="text-base sm:text-lg font-medium text-neutral-500 dark:text-[#B5B5B5] leading-relaxed mb-6">{post.excerpt}</p>}

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-bold text-neutral-500 dark:text-neutral-400 mb-3">
            {post.author && (
              <span className="inline-flex items-center gap-1.5">
                <span className="w-6 h-6 rounded-full bg-[#FFF0F5] dark:bg-[#2A0A17] border border-brand-pink/20 flex items-center justify-center overflow-hidden">
                  {post.authorImage ? <Image src={post.authorImage} alt={post.author} width={24} height={24} className="w-full h-full object-cover" /> : <User className="w-3.5 h-3.5 text-brand-pink" />}
                </span>
                {post.author}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5" /> Published {fmtDate(post.publishedAt || post.createdAt)}
            </span>
            {post.readingTime ? (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> {post.readingTime} min read
              </span>
            ) : null}
          </div>

          {showUpdated && <p className="text-[11px] font-bold text-neutral-400 mb-4">Updated {fmtDate(post.updatedAt)}</p>}
        </header>

        {post.coverImage && (
          <figure className="rounded-3xl overflow-hidden mb-8 bg-neutral-100 dark:bg-[#161616] card-shadow relative aspect-[1200/630]">
            <Image src={post.coverImage} alt={post.coverImageAlt || post.title} title={post.coverImageTitle || undefined} fill sizes="(max-width: 768px) 100vw, 1200px" className="object-cover" priority />
            {post.coverImageCaption && <figcaption className="absolute bottom-0 inset-x-0 text-center text-[11px] font-bold text-white bg-black/40 py-2.5 px-4">{post.coverImageCaption}</figcaption>}
          </figure>
        )}

        {articleCss && <style dangerouslySetInnerHTML={{ __html: articleCss }} />}
        <div data-blog-article={scopeId} className="prose-blog max-w-none blog-cms-content" dangerouslySetInnerHTML={{ __html: contentHtml }} />

        {post.tags && post.tags.length > 0 && (
          <div className="mt-10 flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-black uppercase tracking-wider text-neutral-400">Tags:</span>
            {post.tags.map((t) => (
              <Link key={t} href={`/blog?q=${encodeURIComponent(t)}`} className="px-3 py-1 rounded-lg bg-neutral-100 dark:bg-[#262626] text-neutral-600 dark:text-neutral-300 text-[11px] font-bold hover:text-brand-pink hover:border-brand-pink/30 border border-transparent transition-colors">
                #{t}
              </Link>
            ))}
          </div>
        )}

        {(post.author || post.authorBio) && (
          <div className="mt-10 p-5 sm:p-6 rounded-3xl bg-neutral-50 dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF0F5] dark:bg-[#2A0A17] border border-brand-pink/25 flex items-center justify-center overflow-hidden shrink-0">
              {post.authorImage ? <Image src={post.authorImage} alt={post.author || ''} width={48} height={48} className="w-full h-full object-cover" /> : <PenLine className="w-5 h-5 text-brand-pink" />}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-pink mb-0.5">Written by</p>
              <h3 className="font-heading font-black text-sm sm:text-base text-neutral-900 dark:text-white">{post.author || 'Apex Vouchers Editorial Team'}</h3>
              {post.authorBio && <p className="text-xs font-medium text-neutral-500 dark:text-[#B5B5B5] leading-relaxed mt-1.5">{post.authorBio}</p>}
            </div>
          </div>
        )}

        {post.faqs && post.faqs.length > 0 && <FaqAccordion faqs={post.faqs} />}

        <div className="mt-10 flex items-center justify-between flex-wrap gap-3">
          <ShareButton title={post.title} />
          <Link href="/exam-booking" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl btn-pink text-white text-xs font-black shadow-lg">
            Browse Exam Vouchers <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </article>

      <RelatedArticles relatedPosts={relatedPosts} />
    </>
  );
}
