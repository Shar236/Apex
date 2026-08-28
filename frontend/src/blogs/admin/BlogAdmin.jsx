import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Plus, Search, FileText, Edit2, Trash2, X, Eye, Save, Send, EyeOff, Clock,
  RotateCcw, Trash, ImageIcon, Tag, Link2, HelpCircle, History, Copy, ChevronDown,
  CloudUpload, AlertTriangle, Keyboard,
} from 'lucide-react';
import { blogApi } from '../lib/blogApi.js';
import { analyzeBlogSEO, checkBlogSafetyWarningsLocal } from '../lib/seoAnalysis.js';
import { Label, Th, Td, Empty, StatusBadge, ScoreBadge } from './ui.jsx';
import { toDraft, serializeDraft } from './draftModel.js';
import { useBlogDraft } from './useBlogDraft.js';
import { ToastProvider, useToast } from './Toast.jsx';
import ContentTab from './tabs/ContentTab.jsx';
import ImagesTab from './tabs/ImagesTab.jsx';
import SeoTab from './tabs/SeoTab.jsx';
import FaqTab from './tabs/FaqTab.jsx';
import LinksTab from './tabs/LinksTab.jsx';
import RelatedTab from './tabs/RelatedTab.jsx';
import HistoryTab from './tabs/HistoryTab.jsx';
import SeoHealthPanel from './panels/SeoHealthPanel.jsx';
import AnalyticsPanels from './panels/AnalyticsPanels.jsx';
import ImproveSeoPanel from './panels/ImproveSeoPanel.jsx';

// ── List view ─────────────────────────────────────────────────────────────

export default function BlogAdmin() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sort, setSort] = useState('-createdAt');
  const [editingPost, setEditingPost] = useState(undefined); // undefined = list, null = creating, object = editing

  const refresh = useCallback(async () => {
    setLoading(true);
    const params = { sort };
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    if (categoryFilter) params.category = categoryFilter;
    const res = await blogApi.list(params);
    setRows(res.data || []);
    setLoading(false);
  }, [search, statusFilter, categoryFilter, sort]);

  useEffect(() => {
    const t = setTimeout(refresh, 250);
    return () => clearTimeout(t);
  }, [refresh]);

  const counts = rows.reduce((acc, r) => { acc[r.status] = (acc[r.status] || 0) + 1; return acc; }, {});

  const rowAction = async (fn, r, confirmMsg) => {
    if (confirmMsg && !confirm(confirmMsg)) return;
    const res = await fn(r._id);
    if (res.success) refresh(); else alert(res.message);
  };

  if (editingPost !== undefined) {
    return (
      <ToastProvider>
        <BlogEditor
          post={editingPost}
          onClose={() => setEditingPost(undefined)}
          onSaved={() => refresh()}
        />
      </ToastProvider>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl tracking-tight">Blog Posts</h1>
          <p className="text-xs font-bold text-neutral-500 dark:text-[#B5B5B5]">
            Create, edit, optimize and publish SEO-aware blog articles — no code changes needed.
          </p>
        </div>
        <button onClick={() => setEditingPost(null)} className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl btn-pink text-white font-black text-xs shadow-lg cursor-pointer">
          <Plus className="w-4 h-4" /> New Blog Post
        </button>
      </div>

      <div className="rounded-3xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] flex-1 min-w-[220px] max-w-md">
            <Search className="w-4 h-4 text-neutral-400" />
            <input placeholder="Search by title, category, excerpt, tag…" value={search} onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none text-xs font-bold w-full text-neutral-900 dark:text-white" />
          </div>
          <input placeholder="Filter by category" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-2xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-xs font-bold outline-none w-44" />
          <select value={sort} onChange={(e) => setSort(e.target.value)}
            className="px-3.5 py-2.5 rounded-2xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-xs font-bold outline-none">
            <option value="-createdAt">Newest first</option>
            <option value="createdAt">Oldest first</option>
            <option value="-updatedAt">Recently updated</option>
            <option value="title">Title A–Z</option>
          </select>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
          {[
            { id: '', label: `All (${rows.length})` },
            { id: 'draft', label: `Draft (${counts.draft || 0})` },
            { id: 'scheduled', label: `Scheduled (${counts.scheduled || 0})` },
            { id: 'published', label: `Published (${counts.published || 0})` },
            { id: 'unpublished', label: `Unpublished (${counts.unpublished || 0})` },
            { id: 'trash', label: `Trash (${counts.trash || 0})` },
          ].map((pill) => (
            <button key={pill.id} onClick={() => setStatusFilter(pill.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition whitespace-nowrap cursor-pointer ${
                statusFilter === pill.id ? 'bg-brand-pink text-white shadow-sm' : 'bg-neutral-100 dark:bg-[#262626] text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'
              }`}>
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-3xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-neutral-50 dark:bg-[#0E0E0E]">
              <tr>
                <Th>Article</Th><Th>Category</Th><Th>Status</Th><Th>SEO Score</Th><Th>Last Updated</Th><Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r._id} className="border-t border-[#EAEAEA] dark:border-[#292929] hover:bg-neutral-50 dark:hover:bg-[#131313] transition-colors">
                  <Td>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-neutral-100 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] shrink-0">
                        {r.coverImage ? <img src={r.coverImage} alt={r.coverImageAlt || r.title} className="w-full h-full object-cover" loading="lazy" /> : <div className="w-full h-full flex items-center justify-center text-neutral-300 dark:text-neutral-600"><FileText className="w-5 h-5" /></div>}
                      </div>
                      <div className="min-w-0">
                        <div className="font-black text-sm text-neutral-900 dark:text-white line-clamp-1">{r.title}</div>
                        <div className="text-[11px] font-bold text-neutral-500 dark:text-[#B5B5B5] line-clamp-1">/blog/{r.slug}</div>
                      </div>
                    </div>
                  </Td>
                  <Td><span className="inline-flex px-2 py-0.5 rounded-md bg-[#FFF0F5] dark:bg-[#2A0A17] text-brand-pink text-[10px] font-black w-fit">{r.category}</span></Td>
                  <Td><StatusBadge status={r.status} /></Td>
                  <Td><ScoreBadge score={r.seoScore} grade={r.seoScoreGrade} /></Td>
                  <Td><span className="text-xs font-bold text-neutral-500">{r.updatedAt ? new Date(r.updatedAt).toLocaleDateString() : '—'}</span></Td>
                  <Td>
                    <div className="flex items-center gap-1.5 justify-end flex-wrap">
                      {r.status !== 'trash' ? (
                        <>
                          <button onClick={() => setEditingPost(r)} title="Edit" className="p-2 rounded-lg bg-neutral-100 dark:bg-[#222] hover:bg-amber-100 hover:text-amber-700 transition cursor-pointer"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => rowAction(blogApi.duplicate, r)} title="Duplicate" className="p-2 rounded-lg bg-neutral-100 dark:bg-[#222] hover:bg-sky-100 hover:text-sky-700 transition cursor-pointer"><Copy className="w-3.5 h-3.5" /></button>
                          {r.status !== 'published'
                            ? <button onClick={() => rowAction(blogApi.publish, r)} title="Publish" className="p-2 rounded-lg bg-neutral-100 dark:bg-[#222] hover:bg-emerald-100 hover:text-emerald-700 transition cursor-pointer"><Send className="w-3.5 h-3.5" /></button>
                            : <button onClick={() => rowAction(blogApi.unpublish, r, `Unpublish "${r.title}"? It will no longer be publicly accessible.`)} title="Unpublish" className="p-2 rounded-lg bg-neutral-100 dark:bg-[#222] hover:bg-amber-100 hover:text-amber-700 transition cursor-pointer"><EyeOff className="w-3.5 h-3.5" /></button>}
                          <button onClick={() => rowAction(blogApi.trash, r, `Move "${r.title}" to Trash?`)} title="Move to Trash" className="p-2 rounded-lg bg-neutral-100 dark:bg-[#222] hover:bg-rose-100 hover:text-rose-600 transition cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => rowAction(blogApi.restore, r)} title="Restore" className="p-2 rounded-lg bg-neutral-100 dark:bg-[#222] hover:bg-emerald-100 hover:text-emerald-700 transition cursor-pointer"><RotateCcw className="w-3.5 h-3.5" /></button>
                          <button onClick={() => rowAction(blogApi.permanentDelete, r, `Permanently delete "${r.title}"? This cannot be undone.`)} title="Permanently Delete" className="p-2 rounded-lg bg-neutral-100 dark:bg-[#222] hover:bg-rose-100 hover:text-rose-600 transition cursor-pointer"><Trash className="w-3.5 h-3.5" /></button>
                        </>
                      )}
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {loading && rows.length === 0 && <div className="py-12 text-center text-xs font-bold text-neutral-400 animate-pulse">Loading blog posts…</div>}
        {!loading && rows.length === 0 && <div className="py-10"><Empty title="No blog posts found" desc="Create your first article or clear the search filters." /></div>}
      </div>
    </div>
  );
}

// ── Editor shell ──────────────────────────────────────────────────────────

const TABS = [
  { id: 'content', label: 'Content', icon: <FileText className="w-4 h-4" /> },
  { id: 'images', label: 'Images', icon: <ImageIcon className="w-4 h-4" /> },
  { id: 'seo', label: 'SEO', icon: <Tag className="w-4 h-4" /> },
  { id: 'faq', label: 'FAQ', icon: <HelpCircle className="w-4 h-4" /> },
  { id: 'links', label: 'Links', icon: <Link2 className="w-4 h-4" /> },
  { id: 'related', label: 'Related Posts', icon: <Copy className="w-4 h-4" /> },
  { id: 'history', label: 'Revision History', icon: <History className="w-4 h-4" /> },
];

const SHORTCUTS = [
  ['⌘/Ctrl + B', 'Bold'], ['⌘/Ctrl + I', 'Italic'], ['⌘/Ctrl + U', 'Underline'],
  ['⌘/Ctrl + K', 'Link'], ['⌘/Ctrl + Z', 'Undo'], ['⌘/Ctrl + ⇧ + Z', 'Redo'],
];

const relTime = (d) => {
  if (!d) return '';
  const s = Math.round((Date.now() - d.getTime()) / 1000);
  if (s < 5) return 'just now';
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  return d.toLocaleString();
};

function BlogEditor({ post, onClose, onSaved }) {
  const toast = useToast();
  const [status, setStatus] = useState(post?.status || 'draft');
  const [activeTab, setActiveTab] = useState('content');
  const [editorInstance, setEditorInstance] = useState(null);
  const [editorApi, setEditorApi] = useState(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleValue, setScheduleValue] = useState('');
  const [scheduledAt, setScheduledAt] = useState(post?.scheduledAt ? new Date(post.scheduledAt) : null);
  const [serverWarnings, setServerWarnings] = useState([]);
  const [improveSuggestions, setImproveSuggestions] = useState(null);
  const [busy, setBusy] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const modalOpen = scheduleOpen || busy;
  const {
    id, draft, dirty, saveState, lastSavedAt, recoverable,
    setField, setSeoField, setDraft, save, applyServerData,
    restoreRecoverable, discardRecoverable,
  } = useBlogDraft(post, {
    blockAutosave: modalOpen,
    onServerUpdate: (data) => { setStatus(data.status); setScheduledAt(data.scheduledAt ? new Date(data.scheduledAt) : null); onSaved?.(data); },
  });

  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // ── field refs for "Fix it" ───────────────────────────────────────────────
  const refs = {
    title: useRef(null), slug: useRef(null),
    seoTitle: useRef(null), metaDesc: useRef(null), keyword: useRef(null),
    canonical: useRef(null), robots: useRef(null),
  };
  const KEY_TO_TARGET = {
    seoTitle: ['seo', 'seoTitle'], seoTitleLen: ['seo', 'seoTitle'],
    metaDesc: ['seo', 'metaDesc'], metaDescLen: ['seo', 'metaDesc'],
    keyword: ['seo', 'keyword'], canonical: ['seo', 'canonical'], indexable: ['seo', 'robots'],
    slug: ['content', 'slug'],
    h1: ['content', null], depth: ['content', null], headings: ['content', null],
    faqs: ['faq', null], internalLinks: ['links', null],
    coverImage: ['images', null], coverAlt: ['images', null], imageAltCoverage: ['images', null],
  };
  const quickFix = (rec) => {
    const [tab, refKey] = KEY_TO_TARGET[rec?.key] || ['content', null];
    setActiveTab(tab);
    setTimeout(() => {
      if (refKey && refs[refKey]?.current) refs[refKey].current.focus();
      else if (tab === 'content') editorInstance?.commands?.focus?.();
    }, 60);
  };

  // ── live SEO analysis (debounced) ─────────────────────────────────────────
  const [analysis, setAnalysis] = useState(() => {
    const a = analyzeBlogSEO(draft);
    a.localWarnings = checkBlogSafetyWarningsLocal(draft);
    return a;
  });
  useEffect(() => {
    const t = setTimeout(() => {
      const a = analyzeBlogSEO(draft);
      a.localWarnings = checkBlogSafetyWarningsLocal(draft);
      setAnalysis(a);
    }, 400);
    return () => clearTimeout(t);
  }, [draft]);

  // ── image upload helpers ─────────────────────────────────────────────────
  const pickAndUpload = () => new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/webp';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return resolve(null);
      const res = await blogApi.uploadImage(file);
      if (res.success) { if (res.warning) toast(res.warning, 'warn'); resolve(res); }
      else { toast(res.message || 'Upload failed', 'error'); resolve(null); }
    };
    input.click();
  });
  const handleImageUploadRequest = async () => {
    const res = await pickAndUpload();
    if (!res?.url) return null;
    const alt = window.prompt('ALT text for this image (describe it naturally):', '') || '';
    setDraft((d) => ({ ...d, images: [...d.images, { url: res.url, publicId: res.publicId, filename: res.filename, width: res.width, height: res.height, bytes: res.bytes, alt }] }));
    return { url: res.url, alt };
  };
  const handleFeaturedUpload = async () => {
    const res = await pickAndUpload();
    if (!res?.url) return null;
    setDraft((d) => ({ ...d, coverImage: res.url, coverImagePublicId: res.publicId || '' }));
    return res;
  };

  // ── link edit from the Links tab ─────────────────────────────────────────
  const editLink = (link) => {
    setActiveTab('content');
    setTimeout(() => {
      if (!editorInstance) return;
      const { doc } = editorInstance.state;
      let range = null;
      doc.descendants((node, pos) => {
        if (range) return false;
        const mark = node.marks?.find((mk) => mk.type.name === 'link' && mk.attrs.href === link.href);
        if (mark) range = { from: pos, to: pos + node.nodeSize };
        return true;
      });
      if (range) editorInstance.chain().focus().setTextSelection(range).run();
      editorApi?.openLinkDialog?.();
    }, 80);
  };

  // ── keyboard: Ctrl/Cmd+K → link ─────────────────────────────────────────
  useEffect(() => {
    const h = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setActiveTab('content');
        editorApi?.openLinkDialog?.();
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [editorApi]);

  // ── validation ──────────────────────────────────────────────────────────
  const validate = () => {
    if (!draft.title?.trim()) { setActiveTab('content'); refs.title.current?.focus(); return 'A title is required.'; }
    const slugOk = draft.slug?.trim() || draft.title?.trim();
    if (!slugOk) { setActiveTab('content'); refs.slug.current?.focus(); return 'A URL slug is required.'; }
    if (draft.contentSource === 'cms') {
      const plain = (draft.content || '').replace(/<[^>]*>/g, '').trim();
      if (!plain) { setActiveTab('content'); return 'Add some article content before publishing (or switch Content Source to Code).'; }
    }
    return null;
  };

  // ── actions ─────────────────────────────────────────────────────────────
  const persist = async () => {
    const r = await save();
    if (r?.error) { toast(r.error, 'error'); return null; }
    // refresh the persisted SEO score for the list view
    if (r?.data?._id) {
      blogApi.analyzeSeo(r.data._id).then((a) => { if (a.success) setServerWarnings(a.data.safetyWarnings || []); });
    }
    return r?.data || null;
  };

  const doSaveDraft = async () => { setBusy(true); const d = await persist(); setBusy(false); if (d) toast('Draft saved', 'success'); };

  const doPublish = async () => {
    const err = validate();
    if (err) { toast(err, 'error'); return; }
    if (!confirm(`Publish "${draft.title}"?\n\nIt becomes publicly visible at /blog/${draft.slug || '…'}.`)) return;
    setBusy(true);
    const d = await persist();
    if (d) {
      const res = await blogApi.publish(d._id);
      if (res.success) { applyServerData(res.data); setStatus('published'); toast('Published', 'success'); }
      else toast(res.message, 'error');
    }
    setBusy(false);
  };

  const doUnpublish = async () => {
    if (!id) return;
    if (!confirm('Unpublish this article?\n\nIt will no longer be publicly accessible. The content is kept.')) return;
    setBusy(true);
    const res = await blogApi.unpublish(id);
    if (res.success) { applyServerData(res.data); setStatus('unpublished'); toast('Unpublished', 'success'); }
    else toast(res.message, 'error');
    setBusy(false);
  };

  const doSchedule = async () => {
    if (!scheduleValue) return;
    setBusy(true);
    const d = await persist();
    if (d) {
      const res = await blogApi.schedule(d._id, new Date(scheduleValue).toISOString());
      if (res.success) { applyServerData(res.data); setStatus('scheduled'); setScheduledAt(new Date(res.data.scheduledAt)); setScheduleOpen(false); toast('Scheduled', 'success'); }
      else toast(res.message, 'error');
    }
    setBusy(false);
  };

  const cancelSchedule = async () => {
    if (!id) return;
    setBusy(true);
    const res = await blogApi.unpublish(id); // scheduled → unpublished/draft
    if (res.success) { applyServerData(res.data); setStatus(res.data.status); setScheduledAt(null); toast('Schedule cancelled', 'info'); }
    setBusy(false);
  };

  const doPreview = async () => {
    setBusy(true);
    const d = await persist();
    setBusy(false);
    if (d) window.open(`/admin/blog-preview/${d._id}`, '_blank', 'noopener,noreferrer');
  };

  const runImproveSeo = async () => {
    if (!id) { toast('Save the draft first so it can be analyzed.', 'warn'); return; }
    const res = await blogApi.improveSeo(id);
    if (res.success) setImproveSuggestions(res.data);
  };

  const SaveStatus = () => {
    if (saveState === 'saving') return <span className="text-[11px] font-black text-neutral-400 inline-flex items-center gap-1"><CloudUpload className="w-3.5 h-3.5 animate-pulse" /> Saving…</span>;
    if (saveState === 'error') return <span className="text-[11px] font-black text-rose-500 inline-flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Save failed</span>;
    if (dirty) return <span className="text-[11px] font-black text-amber-500">Unsaved changes</span>;
    if (lastSavedAt) return <span className="text-[11px] font-black text-emerald-500">Saved {relTime(lastSavedAt)}</span>;
    return null;
  };

  return (
    <div className="space-y-5">
      {recoverable && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-xs font-black">
          <span>Unsaved changes from {relTime(recoverable.at)} were found on this device.</span>
          <span className="flex gap-2">
            <button onClick={restoreRecoverable} className="px-3 py-1.5 rounded-lg bg-amber-600 text-white cursor-pointer">Restore</button>
            <button onClick={discardRecoverable} className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#161616] cursor-pointer">Discard</button>
          </span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 rounded-xl bg-neutral-100 dark:bg-[#262626] hover:bg-neutral-200 transition cursor-pointer"><X className="w-4 h-4" /></button>
          <div>
            <h2 className="font-heading font-black text-xl">{id ? 'Edit Blog Post' : 'New Blog Post'}</h2>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <StatusBadge status={status} />
              <SaveStatus />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setShowShortcuts((s) => !s)} title="Keyboard shortcuts" className="p-2.5 rounded-xl bg-neutral-100 dark:bg-[#262626] cursor-pointer"><Keyboard className="w-3.5 h-3.5" /></button>
          <button onClick={doPreview} disabled={busy} className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-neutral-100 dark:bg-[#262626] text-xs font-black cursor-pointer disabled:opacity-50"><Eye className="w-3.5 h-3.5" /> Preview</button>
          <div className="relative">
            <button onClick={() => setScheduleOpen((s) => !s)} className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-neutral-100 dark:bg-[#262626] text-xs font-black cursor-pointer"><Clock className="w-3.5 h-3.5" /> Schedule</button>
            {scheduleOpen && (
              <div className="absolute right-0 top-full mt-2 z-20 p-3 rounded-xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-xl w-72 space-y-2">
                <Label>Publish at</Label>
                <input type="datetime-local" value={scheduleValue} onChange={(e) => setScheduleValue(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-xs font-bold" />
                <p className="text-[10px] font-bold text-neutral-400">Timezone: {tz}</p>
                <button onClick={doSchedule} disabled={busy || !scheduleValue} className="w-full px-3 py-2 rounded-lg btn-pink text-white text-xs font-black cursor-pointer disabled:opacity-40">Confirm Schedule</button>
              </div>
            )}
          </div>
          {status === 'published' && <button onClick={doUnpublish} disabled={busy} className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-100 text-amber-700 text-xs font-black cursor-pointer disabled:opacity-50"><EyeOff className="w-3.5 h-3.5" /> Unpublish</button>}
          <button onClick={doSaveDraft} disabled={busy || saveState === 'saving'} className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 text-xs font-black cursor-pointer disabled:opacity-50"><Save className="w-3.5 h-3.5" /> Save Draft</button>
          <button onClick={doPublish} disabled={busy} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl btn-pink text-white text-xs font-black shadow-lg cursor-pointer disabled:opacity-50"><Send className="w-3.5 h-3.5" /> {status === 'published' ? 'Update' : 'Publish'}</button>
        </div>
      </div>

      {showShortcuts && (
        <div className="rounded-2xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] p-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {SHORTCUTS.map(([k, v]) => (
            <div key={k} className="flex items-center gap-2 text-[11px] font-bold"><kbd className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#262626] font-black">{k}</kbd> {v}</div>
          ))}
        </div>
      )}

      {status === 'scheduled' && scheduledAt && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900 text-sky-800 dark:text-sky-300 text-xs font-black">
          <span className="inline-flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Scheduled for {scheduledAt.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })} · {tz}</span>
          <button onClick={cancelSchedule} className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#161616] cursor-pointer">Cancel schedule</button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 space-y-4 min-w-0">
          <div className="rounded-2xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm p-2 flex items-center gap-1 overflow-x-auto">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap transition cursor-pointer ${
                  activeTab === t.id ? 'bg-brand-pink text-white' : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[#222]'
                }`}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          <div className="rounded-3xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm p-5 min-w-0">
            {activeTab === 'content' && (
              <ContentTab
                draft={draft} id={id} status={status} setField={setField} fieldRefs={refs}
                onEditorReady={(editor, api) => { setEditorInstance(editor); if (api) setEditorApi(api); }}
                onRequestImageUpload={handleImageUploadRequest}
              />
            )}
            {activeTab === 'images' && (
              <ImagesTab draft={draft} setField={setField} onFeaturedUploadRequest={handleFeaturedUpload} onUploadRequest={handleImageUploadRequest} onReplaceRequest={pickAndUpload} />
            )}
            {activeTab === 'seo' && <SeoTab draft={draft} setSeoField={setSeoField} slug={draft.slug} fieldRefs={refs} />}
            {activeTab === 'faq' && <FaqTab faqs={draft.faqs} onChange={(faqs) => setField('faqs', faqs)} />}
            {activeTab === 'links' && <LinksTab draft={draft} id={id} editorInstance={editorInstance} onEditLink={editLink} />}
            {activeTab === 'related' && <RelatedTab draft={draft} setField={setField} excludeId={id} />}
            {activeTab === 'history' && <HistoryTab id={id} onRestored={(data) => { setDraft(toDraft(data)); toast('Revision loaded — review and Save.', 'info'); }} />}
          </div>
        </div>

        <div className="space-y-4">
          <SeoHealthPanel analysis={analysis} serverWarnings={serverWarnings} onQuickFix={quickFix} />
          <AnalyticsPanels analysis={analysis} onQuickFix={quickFix} />
          <ImproveSeoPanel suggestions={improveSuggestions} onRun={runImproveSeo} onQuickFix={quickFix} hasId={!!id} />
        </div>
      </div>
    </div>
  );
}
