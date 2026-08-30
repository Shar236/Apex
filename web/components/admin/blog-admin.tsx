'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Plus, Search, Edit2, Eye, Send, EyeOff, Trash2, RotateCcw, Copy, Loader2, Star, FileText, CheckCircle2, PencilRuler, Archive,
} from 'lucide-react';
import { adminBlogApi } from '@/lib/admin-blog-api';
import { Th, Td, Empty, StatCard, fmtDate } from '@/components/admin/admin-ui';
import { BlogEditor } from '@/components/admin/blog-editor';
import type { BlogPost } from '@/lib/blog-types';

type Row = BlogPost & { status?: string };

const STATUS_TINT: Record<string, string> = {
  published: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
  draft: 'bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300',
  unpublished: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
  scheduled: 'bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400',
  trash: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400',
};

export function BlogAdmin() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editing, setEditing] = useState<BlogPost | null | undefined>(undefined); // undefined=list, null=new, obj=edit
  const [acting, setActing] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const r = await adminBlogApi.list({
      sort: '-createdAt',
      ...(search ? { search } : {}),
      ...(statusFilter ? { status: statusFilter } : {}),
    });
    setRows(((r.data as Row[]) || []));
    setLoading(false);
  }, [search, statusFilter]);

  useEffect(() => {
    const t = setTimeout(refresh, 250);
    return () => clearTimeout(t);
  }, [refresh]);

  const act = async (fn: () => Promise<{ success: boolean; message?: string }>, key: string, slug?: string) => {
    setActing(key);
    const r = await fn();
    setActing(null);
    if (!r.success) return window.alert(r.message || 'Action failed');
    if (slug) adminBlogApi.revalidatePublic([slug]);
    refresh();
  };

  if (editing !== undefined) {
    return <BlogEditor post={editing} onClose={() => setEditing(undefined)} onSaved={refresh} />;
  }

  const counts = rows.reduce<Record<string, number>>((a, r) => { a[r.status || 'draft'] = (a[r.status || 'draft'] || 0) + 1; return a; }, {});

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl tracking-tight flex items-center gap-2"><PencilRuler className="w-6 h-6 text-brand-pink" /> Blog Management</h1>
          <p className="text-xs font-bold text-neutral-500 dark:text-[#B5B5B5]">Create, edit, optimise and publish articles — no code changes needed. Powered by the existing <code className="text-[11px]">/api/admin/blogs</code>.</p>
        </div>
        <button onClick={() => setEditing(null)} className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl btn-pink text-white font-black text-xs shadow-lg">
          <Plus className="w-4 h-4" /> Create New Post
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total posts" value={rows.length} icon={<FileText className="w-5 h-5" />} />
        <StatCard label="Published" value={counts.published || 0} icon={<CheckCircle2 className="w-5 h-5" />} tint="#059669" />
        <StatCard label="Drafts" value={counts.draft || 0} icon={<Edit2 className="w-5 h-5" />} tint="#6B7280" />
        <StatCard label="In trash" value={counts.trash || 0} icon={<Archive className="w-5 h-5" />} tint="#E11D48" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-56">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title, category, tags…" className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] text-sm font-bold" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 rounded-xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] text-sm font-bold">
          <option value="">All statuses</option>
          {['published', 'draft', 'unpublished', 'scheduled', 'trash'].map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      <div className="rounded-3xl border border-[#EAEAEA] dark:border-[#292929] bg-white dark:bg-[#161616] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 dark:bg-[#0E0E0E] text-neutral-500">
              <tr>
                <Th>Article</Th><Th>Category</Th><Th>Author</Th><Th>Status</Th><Th>Published</Th><Th>Updated</Th><Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAEAEA] dark:divide-[#292929]">
              {loading ? (
                <tr><Td className="text-center py-10"><Loader2 className="w-5 h-5 animate-spin mx-auto text-brand-pink" /></Td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={7} className="p-6"><Empty title="No posts" desc="Click “Create New Post” to write your first article." /></td></tr>
              ) : rows.map((r) => (
                <tr key={r._id} className="hover:bg-neutral-50 dark:hover:bg-[#0E0E0E]">
                  <Td>
                    <div className="flex items-center gap-3 max-w-md">
                      <div className="w-14 h-10 rounded-lg overflow-hidden bg-neutral-100 dark:bg-[#0E0E0E] shrink-0 border border-[#EAEAEA] dark:border-[#292929]">
                        {r.coverImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={r.coverImage} alt="" className="w-full h-full object-cover" />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <div className="font-black truncate flex items-center gap-1.5">
                          {r.featured ? <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" /> : null}
                          {r.title}
                        </div>
                        <div className="text-[11px] font-bold text-neutral-400 truncate">
                          /blog/{r.slug} {r.contentSource === 'code' ? <span className="text-amber-500">· code</span> : null}
                        </div>
                      </div>
                    </div>
                  </Td>
                  <Td className="text-xs font-bold">{r.category}</Td>
                  <Td className="text-xs font-bold">{r.author}</Td>
                  <Td><span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${STATUS_TINT[r.status || 'draft']}`}>{r.status}</span></Td>
                  <Td className="text-xs font-bold whitespace-nowrap">{r.publishedAt ? fmtDate(r.publishedAt) : '—'}</Td>
                  <Td className="text-xs font-bold whitespace-nowrap">{fmtDate(r.updatedAt)}</Td>
                  <Td>
                    <div className="flex items-center justify-end gap-1">
                      <button title="Edit" onClick={() => setEditing(r)} className="p-2 rounded-lg hover:bg-brand-pink/10 hover:text-brand-pink"><Edit2 className="w-4 h-4" /></button>
                      <a title="Preview" href={`/admin/blog-preview/${r._id}`} target="_blank" rel="noopener" className="p-2 rounded-lg hover:bg-brand-pink/10 hover:text-brand-pink"><Eye className="w-4 h-4" /></a>
                      {r.status === 'trash' ? (
                        <button title="Restore" disabled={acting === r._id} onClick={() => act(() => adminBlogApi.restore(r._id), r._id)} className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-600"><RotateCcw className="w-4 h-4" /></button>
                      ) : r.status === 'published' ? (
                        <button title="Unpublish" disabled={acting === r._id} onClick={() => act(() => adminBlogApi.unpublish(r._id), r._id, r.slug)} className="p-2 rounded-lg hover:bg-amber-50 text-amber-600"><EyeOff className="w-4 h-4" /></button>
                      ) : (
                        <button title="Publish" disabled={acting === r._id} onClick={() => act(() => adminBlogApi.publish(r._id), r._id, r.slug)} className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-600"><Send className="w-4 h-4" /></button>
                      )}
                      <button title="Duplicate" disabled={acting === r._id} onClick={() => act(() => adminBlogApi.duplicate(r._id), r._id)} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-[#262626]"><Copy className="w-4 h-4" /></button>
                      <button
                        title={r.status === 'trash' ? 'Delete permanently' : 'Move to trash'}
                        disabled={acting === r._id}
                        onClick={() => {
                          if (r.status === 'trash') {
                            if (window.confirm(`Permanently delete "${r.title}"? This cannot be undone.`)) act(() => adminBlogApi.permanentDelete(r._id), r._id);
                          } else if (window.confirm(`Move "${r.title}" to Trash? It will be removed from the public blog.`)) {
                            act(() => adminBlogApi.trash(r._id), r._id, r.slug);
                          }
                        }}
                        className="p-2 rounded-lg hover:bg-rose-50 text-rose-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
