import React, { useEffect, useMemo, useState } from 'react';
import { Search, ArrowUp, ArrowDown, X, Plus } from 'lucide-react';
import { blogApi } from '../../lib/blogApi.js';
import { Label, Empty } from '../ui.jsx';

export default function RelatedTab({ draft, setField, excludeId }) {
  const [allPublished, setAllPublished] = useState([]);
  const [q, setQ] = useState('');

  useEffect(() => {
    blogApi.list({ status: 'published' }).then((res) => { if (res.success) setAllPublished(res.data || []); });
  }, []);

  const byId = useMemo(() => Object.fromEntries(allPublished.map((p) => [p._id, p])), [allPublished]);
  const selectedIds = draft.relatedPosts || [];
  const selectable = allPublished.filter((p) => p._id !== excludeId && !selectedIds.includes(p._id));
  const filtered = q.trim()
    ? selectable.filter((p) => p.title.toLowerCase().includes(q.toLowerCase()) || (p.category || '').toLowerCase().includes(q.toLowerCase()))
    : selectable;
  const suggested = selectable.filter((p) => p.category === draft.category || (p.tags || []).some((t) => (draft.tags || []).includes(t)));

  const addPost = (postId) => setField('relatedPosts', [...selectedIds, postId]);
  const removePost = (postId) => setField('relatedPosts', selectedIds.filter((x) => x !== postId));
  const move = (idx, dir) => {
    const to = idx + dir;
    if (to < 0 || to >= selectedIds.length) return;
    const next = [...selectedIds];
    [next[idx], next[to]] = [next[to], next[idx]];
    setField('relatedPosts', next);
  };

  return (
    <div className="space-y-6">
      <div>
        <Label>Selected ({selectedIds.length}) — order shown on the article</Label>
        <div className="space-y-2">
          {selectedIds.map((pid, idx) => (
            <div key={pid} className="flex items-center gap-2 p-2.5 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929]">
              <span className="text-[10px] font-black text-neutral-400 w-5 text-center">{idx + 1}</span>
              <span className="flex-1 text-xs font-bold text-neutral-800 dark:text-neutral-200 line-clamp-1">{byId[pid]?.title || pid}</span>
              <button onClick={() => move(idx, -1)} disabled={idx === 0} className="p-1.5 rounded-lg bg-neutral-100 dark:bg-[#222] disabled:opacity-30 cursor-pointer"><ArrowUp className="w-3 h-3" /></button>
              <button onClick={() => move(idx, 1)} disabled={idx === selectedIds.length - 1} className="p-1.5 rounded-lg bg-neutral-100 dark:bg-[#222] disabled:opacity-30 cursor-pointer"><ArrowDown className="w-3 h-3" /></button>
              <button onClick={() => removePost(pid)} className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 cursor-pointer"><X className="w-3.5 h-3.5" /></button>
            </div>
          ))}
          {selectedIds.length === 0 && <Empty title="No related posts selected" desc="Add posts below — they render in this order on the article." />}
        </div>
      </div>

      {suggested.length > 0 && (
        <div>
          <Label>Suggested (same category / tags)</Label>
          <div className="flex flex-wrap gap-2">
            {suggested.slice(0, 8).map((p) => (
              <button key={p._id} onClick={() => addPost(p._id)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-black border bg-neutral-50 dark:bg-[#0E0E0E] border-[#EAEAEA] dark:border-[#292929] hover:border-brand-pink cursor-pointer">
                <Plus className="w-3 h-3" /> {p.title}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <Label>Add a post</Label>
        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] mb-2">
          <Search className="w-4 h-4 text-neutral-400" />
          <input placeholder="Search published posts by title or category…" value={q} onChange={(e) => setQ(e.target.value)} className="bg-transparent outline-none text-xs font-bold w-full" />
        </div>
        <div className="space-y-1.5 max-h-64 overflow-y-auto">
          {filtered.map((p) => (
            <button key={p._id} onClick={() => addPost(p._id)} className="w-full flex items-center justify-between gap-3 p-2.5 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] hover:border-brand-pink text-left cursor-pointer">
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 line-clamp-1">{p.title}</span>
              <span className="text-[10px] font-black text-brand-pink shrink-0">+ Add</span>
            </button>
          ))}
          {filtered.length === 0 && <Empty title="Nothing to add" desc={q ? 'No published posts match.' : 'All published posts are already selected.'} />}
        </div>
      </div>
    </div>
  );
}
