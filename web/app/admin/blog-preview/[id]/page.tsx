import type { Metadata } from 'next';
import '@/app/blog/blog.css';
import { BlogPreviewClient } from '@/components/admin/blog-preview-client';

export const metadata: Metadata = {
  title: 'Blog Preview',
  robots: { index: false, follow: false, nocache: true },
};

export default async function BlogPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BlogPreviewClient id={id} />;
}
