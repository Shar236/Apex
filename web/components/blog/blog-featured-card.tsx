import Link from 'next/link';
import Image from 'next/image';
import { Clock, ArrowRight, Calendar, User } from 'lucide-react';
import type { BlogPost } from '@/lib/blog-types';

const fmtDate = (d?: string) => (d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '');

/** The large "Featured Article" spotlight at the top of /blog. */
export function BlogFeaturedCard({ post }: { post: BlogPost }) {
  return (
    <div className="mb-10 sm:mb-12 animate-fade-up">
      <div className="flex items-center gap-2 mb-4">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-pink text-white text-[10px] font-black uppercase tracking-wider">✦ Featured Article</span>
      </div>
      <Link href={`/blog/${post.slug}`} className="group relative grid md:grid-cols-2 rounded-3xl overflow-hidden border border-brand-pink/25 bg-white dark:bg-[#161616] card-shadow hover:shadow-2xl transition-all duration-300">
        <div className="relative aspect-video md:aspect-auto md:min-h-80 overflow-hidden bg-neutral-100 dark:bg-[#0E0E0E]">
          {post.coverImage ? (
            <Image src={post.coverImage} alt={post.coverImageAlt || post.title} fill sizes="(max-width: 768px) 100vw, 600px" loading="eager" className="object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-300 dark:text-neutral-600">No image</div>
          )}
          <div className="absolute inset-0 bg-linear-to-t md:bg-linear-to-r from-black/60 via-black/10 to-transparent" />
          <span className="absolute top-4 left-4 px-3 py-1 rounded-lg bg-brand-pink text-white text-[11px] font-black uppercase tracking-wider shadow-md">{post.category}</span>
        </div>
        <div className="flex flex-col justify-center p-6 sm:p-10 space-y-4">
          <div className="flex items-center gap-3 flex-wrap text-[11px] font-bold text-neutral-500 dark:text-[#B5B5B5]">
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-brand-pink" /> {fmtDate(post.publishedAt)}
            </span>
            {post.readingTime ? (
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-brand-pink" /> {post.readingTime} min read
              </span>
            ) : null}
            {post.author ? (
              <span className="inline-flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-brand-pink" /> {post.author}
              </span>
            ) : null}
          </div>
          <h2 className="font-heading font-black text-2xl sm:text-3xl leading-tight text-neutral-900 dark:text-white">{post.title}</h2>
          <p className="text-sm font-medium text-neutral-500 dark:text-[#B5B5B5] leading-relaxed line-clamp-3">{post.excerpt}</p>
          <span className="inline-flex items-center gap-2 text-brand-pink text-sm font-black group-hover:gap-3 transition-all">
            Read Article <ArrowRight className="w-4 h-4" strokeWidth={3} />
          </span>
        </div>
      </Link>
    </div>
  );
}
