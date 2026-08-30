import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { siteConfig } from '@/lib/config';

/**
 * On-demand cache invalidation for blog content.
 *
 * The public /blog and /blog/[slug] pages fetch with `next: { revalidate: 300 }`,
 * so edits already appear within 5 minutes with NO rebuild. This endpoint makes
 * that instant: the admin editor calls it after publish / update / unpublish /
 * trash so the change is live immediately.
 *
 * Authorisation is delegated to the Express backend — the caller's bearer token
 * must resolve to an admin via /api/auth/me. This route never touches the DB.
 */
export async function POST(req: Request) {
  const auth = req.headers.get('authorization') || '';
  if (!auth.startsWith('Bearer ')) {
    return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
  }

  let me: { success?: boolean; user?: { role?: string } } = {};
  try {
    const res = await fetch(`${siteConfig.apiUrl}/api/auth/me`, { headers: { Authorization: auth }, cache: 'no-store' });
    me = await res.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Auth check failed' }, { status: 502 });
  }
  if (!me.success || me.user?.role !== 'admin') {
    return NextResponse.json({ success: false, message: 'Admin only' }, { status: 403 });
  }

  let slugs: string[] = [];
  try {
    const body = await req.json();
    if (Array.isArray(body?.slugs)) slugs = body.slugs.filter((s: unknown) => typeof s === 'string' && s);
  } catch {
    /* no body — revalidate the collection pages only */
  }

  revalidatePath('/blog');
  revalidatePath('/blog/[slug]', 'page');
  revalidatePath('/sitemap.xml');
  revalidatePath('/');
  for (const slug of slugs) revalidatePath(`/blog/${slug}`);

  return NextResponse.json({ success: true, revalidated: ['/blog', '/blog/[slug]', '/sitemap.xml', '/', ...slugs.map((s) => `/blog/${s}`)] });
}
