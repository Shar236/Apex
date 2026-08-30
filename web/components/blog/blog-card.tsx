import Link from 'next/link';
import Image from 'next/image';
import { Clock, ArrowRight, Calendar } from 'lucide-react';
import type { BlogPost } from '@/lib/blog-types';

const fmtDate = (d?: string) => (d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '');

/** One article in the /blog grid. */
export function BlogCard({ post, index = 0 }: { post: BlogPost; index?: number }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group relative flex flex-col rounded-3xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] hover:border-brand-pink/40 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl animate-fade-up"
      style={{ animationDelay: `${Math.min(index * 60, 300)}ms` }}
    >
      <div className="aspect-[16/9] bg-neutral-100 dark:bg-[#0E0E0E] overflow-hidden relative">
        {post.coverImage ? (
          <Image src={post.coverImage} alt={post.coverImageAlt || post.title} fill sizes="(max-width: 768px) 100vw, 380px" loading={index < 2 ? 'eager' : 'lazy'} className="object-cover transition-transform duration-500 group-hover:scale-105" />
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
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {fmtDate(post.publishedAt)}
            </span>
            {post.readingTime ? (
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3 h-3" /> {post.readingTime} min
              </span>
            ) : null}
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-black text-brand-pink group-hover:gap-1.5 transition-all">
            Read <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}
