import type { Metadata } from 'next';
import { createElement } from 'react';
import { notFound, permanentRedirect } from 'next/navigation';
import { ArticleLayout } from '@/components/blog/article-layout';
import { ArticleBody } from '@/components/blog/article-body';
import { getPublicBlogPost } from '@/lib/blog-api';
import { getCodeArticle } from '@/lib/blog-registry';
import type { BlogPost } from '@/lib/blog-types';
import { buildMetadata, JsonLd } from '@/lib/seo';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * Renders a code-authored article (looked up from the static lib/blog-registry
 * allow-list) or the CMS article body. The registry returns an already-defined
 * component — `createElement` just instantiates it, nothing is defined here.
 */
function ArticleContent({ post, relatedPosts }: { post: BlogPost; relatedPosts: BlogPost[] }) {
  if (post.contentSource === 'code') {
    const codeArticle = getCodeArticle(post.slug);
    if (codeArticle) return createElement(codeArticle, { post, relatedPosts });
  }
  return <ArticleBody post={post} relatedPosts={relatedPosts} />;
}

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPublicBlogPost(slug);
  if (!result || !result.success || !result.data) {
    return buildMetadata({ title: 'Article Not Found', description: 'This article may have been removed or is no longer available.', path: `/blog/${slug}`, noindex: true });
  }

  const post = result.data;
  const seo = post.seo || {};
  return buildMetadata({
    title: seo.title || post.title,
    description: seo.description || post.excerpt,
    path: `/blog/${post.slug}`,
    ogImage: seo.ogImage || post.coverImage,
    noindex: seo.noindex,
    nofollow: seo.nofollow,
  });
}

export default async function BlogPostRoute({ params }: RouteParams) {
  const { slug } = await params;
  const result = await getPublicBlogPost(slug);

  if (!result) notFound();

  if (result.code === 'REDIRECT' && result.redirectTo) {
    permanentRedirect(result.redirectTo);
  }

  if (!result.success || !result.data) notFound();

  const post = result.data;
  const relatedPosts = result.relatedPosts || [];
  const structuredData = result.structuredData;
  const isCodeArticle = post.contentSource === 'code' && !!getCodeArticle(post.slug);

  return (
    <>
      {structuredData?.article && <JsonLd data={structuredData.article} />}
      {structuredData?.breadcrumb && <JsonLd data={structuredData.breadcrumb} />}
      {structuredData?.faqPage && <JsonLd data={structuredData.faqPage} />}

      <ArticleLayout post={post} tocScope={isCodeArticle ? undefined : '.blog-cms-content'}>
        <ArticleContent post={post} relatedPosts={relatedPosts} />
      </ArticleLayout>
    </>
  );
}
