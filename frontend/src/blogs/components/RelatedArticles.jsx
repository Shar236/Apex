import React from 'react';
import { Link } from 'react-router-dom';
import { imageUrl } from '../../lib/imageUrl.js';

/** Related articles grid — shared by the CMS article body and code-based articles. */
export default function RelatedArticles({ relatedPosts = [] }) {
  if (!relatedPosts || relatedPosts.length === 0) return null;
  return (
    <section className="mt-14 pt-10 border-t border-[#EAEAEA] dark:border-[#292929]" aria-label="Related articles">
      <h2 className="font-heading font-black text-2xl mb-5">You may also like</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {relatedPosts.slice(0, 6).map((r) => (
          <Link key={r._id || r.slug} to={`/blog/${r.slug}`} className="group rounded-2xl overflow-hidden bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] hover:border-brand-pink transition-all hover:-translate-y-0.5 card-shadow">
            <div className="aspect-video bg-neutral-100 dark:bg-[#0E0E0E]">
              {r.coverImage && <img src={imageUrl(r.coverImage, { width: 480 })} alt={r.coverImageAlt || r.title} width={480} height={270} loading="lazy" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />}
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
