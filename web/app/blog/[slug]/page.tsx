import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { ArticleLayout } from '@/components/blog/article-layout';
import { ArticleBody } from '@/components/blog/article-body';
import { getPublicBlogPost } from '@/lib/blog-api';
import { getCodeArticle } from '@/lib/blog-registry';
import { buildMetadata, JsonLd } from '@/lib/seo';

interface RouteParams {
  params: Promise<{ slug: string }>;
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
  const CodeArticle = post.contentSource === 'code' ? getCodeArticle(post.slug) : null;

  return (
    <>
      {structuredData?.article && <JsonLd data={structuredData.article} />}
      {structuredData?.breadcrumb && <JsonLd data={structuredData.breadcrumb} />}
      {structuredData?.faqPage && <JsonLd data={structuredData.faqPage} />}

      <ArticleLayout post={post} tocScope={CodeArticle ? undefined : '.blog-cms-content'}>
        {CodeArticle ? <CodeArticle post={post} relatedPosts={relatedPosts} /> : <ArticleBody post={post} relatedPosts={relatedPosts} />}
      </ArticleLayout>
    </>
  );
}
