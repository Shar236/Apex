'use client';

import { useEffect, useState } from 'react';
import { Loader2, ArrowLeft, AlertTriangle } from 'lucide-react';
import { adminBlogApi } from '@/lib/admin-blog-api';
import { renderArticleHtml } from '@/lib/blog-content';
import type { BlogPost } from '@/lib/blog-types';

const fmtDate = (d?: string) => (d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '');

/**
 * Private draft preview — renders the article through the SAME content pipeline
 * as the public page (renderArticleHtml + scoped `css` + prose-blog). Client-only
 * because auth is a bearer token in localStorage; the route is `noindex`.
 */
export function BlogPreviewClient({ id }: { id: string }) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<BlogPost[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    adminBlogApi.preview(id).then((r) => {
      if (r.success && r.data) {
        setPost(r.data);
        setRelated((r as { relatedPosts?: BlogPost[] }).relatedPosts || []);
      } else {
        setErr(r.message || 'Could not load preview. Make sure you are signed in as an admin.');
      }
    });
  }, [id]);

  if (err) {
    return (
      <div className="max-w-2xl mx-auto p-10 text-center space-y-3">
        <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
        <p className="text-sm font-bold text-neutral-600 dark:text-neutral-300">{err}</p>
      </div>
    );
  }
  if (!post) {
    return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-7 h-7 animate-spin text-brand-pink" /></div>;
  }

  const scopeId = post._id || post.slug || '';
  const contentHtml = renderArticleHtml(post.content);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <button onClick={() => window.close()} className="inline-flex items-center gap-1.5 text-xs font-black text-neutral-500 hover:text-brand-pink">
          <ArrowLeft className="w-4 h-4" /> Close preview
        </button>
        <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-black uppercase">Draft preview · not public · noindex</span>
      </div>

      <article>
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <span className="inline-flex px-2.5 py-1 rounded-lg bg-[#FFF0F5] dark:bg-[#2A0A17] text-brand-pink text-[10px] font-black uppercase tracking-wider border border-brand-pink/25">{post.category}</span>
          {post.featured ? <span className="inline-flex px-2.5 py-1 rounded-lg bg-brand-pink text-white text-[10px] font-black uppercase tracking-wider">✦ Featured</span> : null}
          {post.contentSource === 'code' ? <span className="inline-flex px-2.5 py-1 rounded-lg bg-amber-100 text-amber-700 text-[10px] font-black uppercase">code article — body from component</span> : null}
        </div>

        <h1 className="font-heading font-black text-3xl sm:text-4xl leading-tight text-neutral-900 dark:text-white mb-4">{post.title}</h1>
        {post.excerpt ? <p className="text-base sm:text-lg font-medium text-neutral-500 dark:text-[#B5B5B5] leading-relaxed mb-6">{post.excerpt}</p> : null}
        <div className="text-xs font-bold text-neutral-500 mb-6">
          {post.author} · {fmtDate(post.publishedAt || post.createdAt)}{post.readingTime ? ` · ${post.readingTime} min read` : ''}
        </div>

        {post.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.coverImage} alt={post.coverImageAlt || post.title} className="w-full rounded-3xl mb-8 aspect-[1200/630] object-cover" />
        ) : null}

        {post.css ? <style dangerouslySetInnerHTML={{ __html: post.css }} /> : null}
        {post.contentSource === 'code' ? (
          <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-[#161616] text-xs font-bold text-neutral-500">
            This article renders from a registered React component on the public site. Its metadata, FAQ and related posts (shown here) are still managed in the CMS.
          </div>
        ) : (
          <div data-blog-article={scopeId} className="prose-blog max-w-none blog-cms-content" dangerouslySetInnerHTML={{ __html: contentHtml }} />
        )}

        {post.tags && post.tags.length > 0 ? (
          <div className="mt-10 flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-black uppercase tracking-wider text-neutral-400">Tags:</span>
            {post.tags.map((t) => <span key={t} className="px-3 py-1 rounded-lg bg-neutral-100 dark:bg-[#262626] text-neutral-600 dark:text-neutral-300 text-[11px] font-bold">#{t}</span>)}
          </div>
        ) : null}

        {post.faqs && post.faqs.length > 0 ? (
          <div className="mt-10">
            <h2 className="font-heading font-black text-xl mb-3">Frequently Asked Questions</h2>
            <div className="space-y-2">
              {post.faqs.map((f, i) => (
                <details key={i} className="rounded-2xl border border-[#EAEAEA] dark:border-[#292929] p-4">
                  <summary className="font-black text-sm cursor-pointer">{f.question}</summary>
                  <p className="mt-2 text-sm font-medium text-neutral-600 dark:text-neutral-300">{f.answer}</p>
                </details>
              ))}
            </div>
          </div>
        ) : null}

        {related.length > 0 ? (
          <div className="mt-10 pt-6 border-t border-[#EAEAEA] dark:border-[#292929]">
            <h2 className="font-heading font-black text-lg mb-3">Related articles</h2>
            <ul className="text-sm font-bold text-brand-pink space-y-1">
              {related.map((r) => <li key={r._id}>/blog/{r.slug} — {r.title}</li>)}
            </ul>
          </div>
        ) : null}
      </article>
    </div>
  );
}
