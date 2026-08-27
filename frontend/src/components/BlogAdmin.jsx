import React, { useEffect, useState, useCallback } from 'react';
import {
  Plus, Search, FileText, Edit2, Trash2, X, Eye, Save, Copy, Send, EyeOff, Clock,
  RotateCcw, Trash, ImageIcon, Tag, Link2, HelpCircle, History, Sparkles, ChevronRight,
  CheckCircle2, AlertTriangle, XCircle, ExternalLink, Upload, Code2, PenSquare,
} from 'lucide-react';
import { blogApi } from '../lib/api';
import BlogRichTextEditor from './BlogRichTextEditor';
import { listCodeArticles } from '../blogs/registry';

// ── Shared UI helpers (matching AdminConsole/AwardsAdmin conventions) ──────

const Label = ({ children }) => <span className="block text-[11px] font-black uppercase tracking-wider text-neutral-500 dark:text-[#B5B5B5] mb-2">{children}</span>;

function Field({ label, type = 'text', value, onChange, placeholder, hint }) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <input type={type} value={value ?? ''} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-sm font-bold focus:outline-none focus:border-brand-pink transition"
      />
      {hint && <span className="block text-[10px] font-bold text-neutral-400 mt-1">{hint}</span>}
    </label>
  );
}
function TextArea({ label, value, onChange, rows = 3, hint }) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <textarea rows={rows} value={value ?? ''} onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-sm font-bold focus:outline-none focus:border-brand-pink transition whitespace-pre-wrap"
      />
      {hint && <span className="block text-[10px] font-bold text-neutral-400 mt-1">{hint}</span>}
    </label>
  );
}
function Select({ label, value, onChange, options }) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-sm font-bold focus:outline-none focus:border-brand-pink transition">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}
function Check({ label, checked, onChange }) {
  return (
    <label className="inline-flex items-center gap-2.5 px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="w-4 h-4 accent-brand-pink" />
      <span className="text-xs font-black text-neutral-700 dark:text-neutral-200">{label}</span>
    </label>
  );
}
function Th({ children }) { return <th className="text-[10px] font-black uppercase tracking-wider px-4 py-3 text-left text-neutral-500 dark:text-neutral-400">{children}</th>; }
function Td({ children, className = '' }) { return <td className={`px-4 py-3 align-top text-neutral-700 dark:text-neutral-200 ${className}`}>{children}</td>; }
function Empty({ title, desc }) {
  return (
    <div className="text-center py-10 rounded-2xl border border-dashed border-[#EAEAEA] dark:border-[#292929]">
      <div className="font-black text-neutral-900 dark:text-white">{title}</div>
      <div className="text-xs font-bold text-neutral-500 dark:text-[#B5B5B5] mt-1">{desc}</div>
    </div>
  );
}

const STATUS_STYLES = {
  draft: 'bg-neutral-100 text-neutral-600 dark:bg-[#262626] dark:text-neutral-300',
  scheduled: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400',
  published: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400',
  unpublished: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400',
  trash: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400',
};
const StatusBadge = ({ status }) => (
  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black border capitalize ${STATUS_STYLES[status] || STATUS_STYLES.draft}`}>{status}</span>
);

const ScoreBadge = ({ score, grade }) => {
  const color = score >= 75 ? 'text-emerald-600 dark:text-emerald-400' : score >= 60 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400';
  return (
    <div className="flex flex-col">
      <span className={`font-black text-sm tabular-nums ${color}`}>{score || 0}/100</span>
      <span className="text-[10px] font-bold text-neutral-400">{grade || '—'}</span>
    </div>
  );
};

const emptyDraft = () => ({
  title: '', slug: '', excerpt: '', content: '',
  coverImage: '', coverImagePublicId: '', coverImageAlt: '', coverImageTitle: '', coverImageCaption: '', coverImageDescription: '',
  images: [], author: 'Apex Vouchers', authorBio: '', authorImage: '', reviewer: '', reviewedAt: '',
  category: 'Exam Guide', tags: [], featured: false,
  contentSource: 'cms',
  faqs: [], relatedPosts: [],
  seo: { title: '', description: '', focusKeyword: '', secondaryKeywords: [], canonicalUrl: '', ogTitle: '', ogDescription: '', ogImage: '', twitterTitle: '', twitterDescription: '', twitterImage: '', twitterCardType: 'summary_large_image', noindex: false, nofollow: false },
});

const toDraft = (post) => ({
  ...emptyDraft(),
  ...post,
  tags: post?.tags || [],
  images: post?.images || [],
  contentSource: post?.contentSource === 'code' ? 'code' : 'cms',
  faqs: post?.faqs || [],
  relatedPosts: (post?.relatedPosts || []).map((r) => (typeof r === 'string' ? r : r._id)),
  seo: { ...emptyDraft().seo, ...(post?.seo || {}) },
});

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

  const doPublish = async (r) => { const res = await blogApi.publish(r._id); if (res.success) refresh(); else alert(res.message); };
  const doUnpublish = async (r) => { const res = await blogApi.unpublish(r._id); if (res.success) refresh(); else alert(res.message); };
  const doDuplicate = async (r) => { const res = await blogApi.duplicate(r._id); if (res.success) refresh(); else alert(res.message); };
  const doTrash = async (r) => { if (!confirm(`Move "${r.title}" to Trash?`)) return; const res = await blogApi.trash(r._id); if (res.success) refresh(); else alert(res.message); };
  const doRestore = async (r) => { const res = await blogApi.restore(r._id); if (res.success) refresh(); else alert(res.message); };
  const doPermanentDelete = async (r) => {
    if (!confirm(`Permanently delete "${r.title}"? This cannot be undone.`)) return;
    const res = await blogApi.permanentDelete(r._id);
    if (res.success) refresh(); else alert(res.message);
  };

  if (editingPost !== undefined) {
    return (
      <BlogEditor
        post={editingPost}
        onClose={() => setEditingPost(undefined)}
        onSaved={() => { setEditingPost(undefined); refresh(); }}
      />
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
                <Th>Article</Th>
                <Th>Category</Th>
                <Th>Status</Th>
                <Th>SEO Score</Th>
                <Th>Last Updated</Th>
                <Th className="text-right">Actions</Th>
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
                          <button onClick={() => doDuplicate(r)} title="Duplicate" className="p-2 rounded-lg bg-neutral-100 dark:bg-[#222] hover:bg-sky-100 hover:text-sky-700 transition cursor-pointer"><Copy className="w-3.5 h-3.5" /></button>
                          {r.status !== 'published' ? (
                            <button onClick={() => doPublish(r)} title="Publish" className="p-2 rounded-lg bg-neutral-100 dark:bg-[#222] hover:bg-emerald-100 hover:text-emerald-700 transition cursor-pointer"><Send className="w-3.5 h-3.5" /></button>
                          ) : (
                            <button onClick={() => doUnpublish(r)} title="Unpublish" className="p-2 rounded-lg bg-neutral-100 dark:bg-[#222] hover:bg-amber-100 hover:text-amber-700 transition cursor-pointer"><EyeOff className="w-3.5 h-3.5" /></button>
                          )}
                          <button onClick={() => doTrash(r)} title="Move to Trash" className="p-2 rounded-lg bg-neutral-100 dark:bg-[#222] hover:bg-rose-100 hover:text-rose-600 transition cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => doRestore(r)} title="Restore" className="p-2 rounded-lg bg-neutral-100 dark:bg-[#222] hover:bg-emerald-100 hover:text-emerald-700 transition cursor-pointer"><RotateCcw className="w-3.5 h-3.5" /></button>
                          <button onClick={() => doPermanentDelete(r)} title="Permanently Delete" className="p-2 rounded-lg bg-neutral-100 dark:bg-[#222] hover:bg-rose-100 hover:text-rose-600 transition cursor-pointer"><Trash className="w-3.5 h-3.5" /></button>
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
  { id: 'links', label: 'Internal Links', icon: <Link2 className="w-4 h-4" /> },
  { id: 'related', label: 'Related Posts', icon: <ExternalLink className="w-4 h-4" /> },
  { id: 'history', label: 'Revision History', icon: <History className="w-4 h-4" /> },
];

function BlogEditor({ post, onClose, onSaved }) {
  const [id, setId] = useState(post?._id || null);
  const [status, setStatus] = useState(post?.status || 'draft');
  const [draft, setDraft] = useState(toDraft(post));
  const [activeTab, setActiveTab] = useState('content');
  const [saving, setSaving] = useState(false);
  const [editorInstance, setEditorInstance] = useState(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleValue, setScheduleValue] = useState('');
  const [seoAnalysis, setSeoAnalysis] = useState(null);
  const [safetyWarnings, setSafetyWarnings] = useState([]);
  const [improveSuggestions, setImproveSuggestions] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  const setField = (field, value) => setDraft((d) => ({ ...d, [field]: value }));
  const setSeoField = (field, value) => setDraft((d) => ({ ...d, seo: { ...d.seo, [field]: value } }));

  const buildPayload = () => ({ ...draft });

  const persist = async () => {
    setSaving(true);
    try {
      const payload = buildPayload();
      let res;
      if (id) res = await blogApi.update(id, payload);
      else res = await blogApi.create(payload);
      if (!res.success) { alert(res.message || 'Failed to save'); return null; }
      setId(res.data._id);
      setStatus(res.data.status);
      setDraft(toDraft(res.data));
      return res.data;
    } finally {
      setSaving(false);
    }
  };

  const saveDraft = async () => { const r = await persist(); if (r) alert('✅ Draft saved'); };
  const doPublish = async () => {
    const r = await persist();
    if (!r) return;
    const res = await blogApi.publish(r._id);
    if (res.success) { setStatus('published'); setDraft(toDraft(res.data)); alert('✅ Published'); } else alert(res.message);
  };
  const doUnpublish = async () => {
    if (!id) return;
    const res = await blogApi.unpublish(id);
    if (res.success) { setStatus('unpublished'); setDraft(toDraft(res.data)); } else alert(res.message);
  };
  const doSchedule = async () => {
    if (!scheduleValue) return;
    const r = await persist();
    if (!r) return;
    const res = await blogApi.schedule(r._id, new Date(scheduleValue).toISOString());
    if (res.success) { setStatus('scheduled'); setDraft(toDraft(res.data)); setScheduleOpen(false); alert('✅ Scheduled'); } else alert(res.message);
  };
  const doPreview = async () => {
    const r = await persist();
    if (!r) return;
    window.open(`/admin/blog-preview/${r._id}`, '_blank', 'noopener,noreferrer');
  };

  const runAnalysis = useCallback(async () => {
    if (!id) return;
    setLoadingAnalysis(true);
    try {
      const res = await blogApi.analyzeSeo(id);
      if (res.success) { setSeoAnalysis(res.data); setSafetyWarnings(res.data.safetyWarnings || []); }
    } finally {
      setLoadingAnalysis(false);
    }
  }, [id]);

  useEffect(() => { if (id) runAnalysis(); }, [id]);

  const runImproveSeo = async () => {
    if (!id) { alert('Save the draft first so it can be analyzed.'); return; }
    const res = await blogApi.improveSeo(id);
    if (res.success) setImproveSuggestions(res.data);
  };

  const quickFix = (rec) => {
    if (rec.issue.toLowerCase().includes('seo title')) setSeoField('title', draft.title);
    else if (rec.issue.toLowerCase().includes('meta description')) setSeoField('description', (draft.excerpt || '').slice(0, 155));
    else if (rec.field === 'faqs') setActiveTab('faq');
    else if (rec.field === 'images') setActiveTab('images');
    else if (rec.issue.toLowerCase().includes('internal link')) setActiveTab('links');
    else setActiveTab('content');
  };

  const pickAndUploadImage = () => new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/webp';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return resolve(null);
      const res = await blogApi.uploadImage(file);
      if (res.success) {
        if (res.warning) alert(`⚠ ${res.warning}`);
        resolve(res);
      } else {
        alert(res.message || 'Upload failed');
        resolve(null);
      }
    };
    input.click();
  });

  // Used by the Content-tab rich text editor and the Images tab's "Add Image" —
  // registers the image in draft.images for ALT/caption/description editing.
  const handleImageUploadRequest = async () => {
    const res = await pickAndUploadImage();
    if (!res?.url) return null;
    const alt = window.prompt('ALT text for this image (describe it naturally):', '') || '';
    setDraft((d) => ({ ...d, images: [...d.images, { url: res.url, publicId: res.publicId, filename: res.filename, alt }] }));
    return { url: res.url, alt };
  };

  // Featured image is its own field — never added to the in-article images registry.
  const handleFeaturedImageUpload = async () => {
    const res = await pickAndUploadImage();
    if (!res?.url) return null;
    setDraft((d) => ({ ...d, coverImage: res.url, coverImagePublicId: res.publicId || '' }));
    return res;
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 rounded-xl bg-neutral-100 dark:bg-[#262626] hover:bg-neutral-200 transition cursor-pointer">
            <X className="w-4 h-4" />
          </button>
          <div>
            <h2 className="font-heading font-black text-xl">{id ? 'Edit Blog Post' : 'New Blog Post'}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <StatusBadge status={status} />
              {draft.updatedAt && <span className="text-[10px] font-bold text-neutral-400">Last updated {new Date(draft.updatedAt).toLocaleString()}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={doPreview} disabled={saving} className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-neutral-100 dark:bg-[#262626] text-xs font-black cursor-pointer"><Eye className="w-3.5 h-3.5" /> Preview</button>
          <div className="relative">
            <button onClick={() => setScheduleOpen((s) => !s)} className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-neutral-100 dark:bg-[#262626] text-xs font-black cursor-pointer"><Clock className="w-3.5 h-3.5" /> Schedule</button>
            {scheduleOpen && (
              <div className="absolute right-0 top-full mt-2 z-20 p-3 rounded-xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-xl w-64 space-y-2">
                <Label>Publish at</Label>
                <input type="datetime-local" value={scheduleValue} onChange={(e) => setScheduleValue(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-xs font-bold" />
                <button onClick={doSchedule} className="w-full px-3 py-2 rounded-lg btn-pink text-white text-xs font-black cursor-pointer">Confirm Schedule</button>
              </div>
            )}
          </div>
          {status === 'published' ? (
            <button onClick={doUnpublish} className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-100 text-amber-700 text-xs font-black cursor-pointer"><EyeOff className="w-3.5 h-3.5" /> Unpublish</button>
          ) : null}
          <button onClick={saveDraft} disabled={saving} className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 text-xs font-black cursor-pointer"><Save className="w-3.5 h-3.5" /> Save Draft</button>
          <button onClick={doPublish} disabled={saving} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl btn-pink text-white text-xs font-black shadow-lg cursor-pointer"><Send className="w-3.5 h-3.5" /> Publish</button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 space-y-4">
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

          <div className="rounded-3xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm p-5">
            {activeTab === 'content' && (
              <div className="space-y-4">
                <Field label="Title *" value={draft.title} onChange={(v) => setField('title', v)} placeholder="e.g. Authentic PTE Exam Vouchers Online" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="URL Slug" value={draft.slug} onChange={(v) => setField('slug', v)} placeholder="auto-generated from title if left blank"
                    hint={status === 'published' ? 'Changing this on a published post auto-creates a 301 redirect.' : undefined} />
                  <Field label="Category" value={draft.category} onChange={(v) => setField('category', v)} placeholder="e.g. Exam Guide" />
                </div>
                <TextArea label="Short Excerpt" value={draft.excerpt} onChange={(v) => setField('excerpt', v)} rows={2} placeholder="One or two sentences shown on blog cards and used as a meta description fallback." />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Field label="Author" value={draft.author} onChange={(v) => setField('author', v)} />
                  <Field label="Reviewer (optional)" value={draft.reviewer} onChange={(v) => setField('reviewer', v)} hint="For policy-sensitive articles" />
                  <Field label="Tags (comma separated)" value={(draft.tags || []).join(', ')} onChange={(v) => setField('tags', v.split(',').map((s) => s.trim()).filter(Boolean))} />
                </div>

                <ContentSourceControl draft={draft} setField={setField} />

                <div>
                  <Label>{draft.contentSource === 'code' ? 'Article Content (CMS fallback)' : 'Article Content'}</Label>
                  {draft.contentSource === 'code' && (
                    <p className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 mb-2">
                      This post renders from its registered React component. The content below is kept
                      as a safe fallback and becomes live again if you switch Content Source back to CMS.
                    </p>
                  )}
                  <BlogRichTextEditor value={draft.content} onChange={(html) => setField('content', html)} onEditorReady={setEditorInstance} onRequestImageUpload={handleImageUploadRequest} />
                </div>
              </div>
            )}

            {activeTab === 'images' && (
              <BlogImagesTab draft={draft} setField={setField} onUploadRequest={handleImageUploadRequest} onFeaturedUploadRequest={handleFeaturedImageUpload} />
            )}

            {activeTab === 'seo' && (
              <BlogSeoTab draft={draft} setField={setField} setSeoField={setSeoField} slug={draft.slug} />
            )}

            {activeTab === 'faq' && (
              <BlogFaqTab faqs={draft.faqs} onChange={(faqs) => setField('faqs', faqs)} />
            )}

            {activeTab === 'links' && (
              <BlogLinksTab excludeId={id} editorInstance={editorInstance} />
            )}

            {activeTab === 'related' && (
              <BlogRelatedTab draft={draft} setField={setField} excludeId={id} />
            )}

            {activeTab === 'history' && (
              <BlogHistoryTab id={id} onRestored={(data) => setDraft(toDraft(data))} />
            )}
          </div>
        </div>

        <div className="space-y-4">
          <SeoHealthPanel
            analysis={seoAnalysis}
            safetyWarnings={safetyWarnings}
            loading={loadingAnalysis}
            onRefresh={id ? runAnalysis : null}
            onQuickFix={quickFix}
          />
          <ImproveSeoPanel suggestions={improveSuggestions} onRun={runImproveSeo} onQuickFix={quickFix} hasId={!!id} />
        </div>
      </div>
    </div>
  );
}

// ── Content Source (CMS vs Code) ──────────────────────────────────────────

function ContentSourceControl({ draft, setField }) {
  const codeArticles = listCodeArticles();
  const source = draft.contentSource === 'code' ? 'code' : 'cms';
  const registered = codeArticles.find((a) => a.slug === draft.slug) || null;

  return (
    <div className="rounded-2xl border border-[#EAEAEA] dark:border-[#292929] bg-neutral-50 dark:bg-[#0E0E0E] p-4 space-y-3">
      <div>
        <Label>Content Source</Label>
        <div className="inline-flex rounded-xl border border-[#EAEAEA] dark:border-[#292929] overflow-hidden">
          <button
            type="button"
            onClick={() => setField('contentSource', 'cms')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-black cursor-pointer transition ${source === 'cms' ? 'bg-brand-pink text-white' : 'bg-white dark:bg-[#161616] text-neutral-600 dark:text-neutral-300'}`}
          >
            <PenSquare className="w-3.5 h-3.5" /> CMS
          </button>
          <button
            type="button"
            onClick={() => setField('contentSource', 'code')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-black cursor-pointer transition ${source === 'code' ? 'bg-brand-pink text-white' : 'bg-white dark:bg-[#161616] text-neutral-600 dark:text-neutral-300'}`}
          >
            <Code2 className="w-3.5 h-3.5" /> Code
          </button>
        </div>
        <p className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 mt-2">
          {source === 'code'
            ? 'The article body is rendered by a registered React component. All metadata, SEO, schema, FAQ, related posts, sitemap and publishing stay CMS-managed. The URL never changes when you switch.'
            : 'The article body is rendered from the CMS content editor below (current behaviour).'}
        </p>
      </div>

      {source === 'code' && (
        codeArticles.length === 0 ? (
          <p className="text-[11px] font-black text-amber-600 dark:text-amber-400">
            No code articles are registered yet. Add the slug + component to
            frontend/src/blogs/registry.js, then reload.
          </p>
        ) : (
          <>
            <Select
              label="Code Article"
              value={registered ? registered.slug : ''}
              onChange={(slug) => { if (slug) setField('slug', slug); }}
              options={[
                { value: '', label: '— Select a registered component —' },
                ...codeArticles.map((a) => ({ value: a.slug, label: `${a.label}  (${a.slug})` })),
              ]}
            />
            {registered ? (
              <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                ✓ Slug matches registered component “{registered.label}”. It will render at /blog/{draft.slug}.
              </p>
            ) : (
              <p className="text-[11px] font-black text-amber-600 dark:text-amber-400">
                ⚠ This slug has no registered component. Until one is added, /blog/{draft.slug || '…'} falls
                back to the CMS content below.
              </p>
            )}
          </>
        )
      )}
    </div>
  );
}

// ── Images tab ────────────────────────────────────────────────────────────

function BlogImagesTab({ draft, setField, onUploadRequest, onFeaturedUploadRequest }) {
  const uploadFeatured = async () => {
    await onFeaturedUploadRequest();
  };
  const removeFeatured = () => {
    setField('coverImage', '');
    setField('coverImagePublicId', '');
  };
  const updateImage = (idx, patch) => {
    const next = [...draft.images];
    next[idx] = { ...next[idx], ...patch };
    setField('images', next);
  };
  const removeImage = (idx) => setField('images', draft.images.filter((_, i) => i !== idx));

  return (
    <div className="space-y-6">
      <div>
        <Label>Featured Image</Label>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-48 aspect-video rounded-2xl overflow-hidden bg-neutral-100 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] shrink-0">
            {draft.coverImage ? <img src={draft.coverImage} alt={draft.coverImageAlt} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-neutral-300"><ImageIcon className="w-8 h-8" /></div>}
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <button onClick={uploadFeatured} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-[#222] text-xs font-black cursor-pointer"><Upload className="w-3.5 h-3.5" /> {draft.coverImage ? 'Replace' : 'Upload'}</button>
              {draft.coverImage && <button onClick={removeFeatured} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-black cursor-pointer"><Trash2 className="w-3.5 h-3.5" /> Remove</button>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="ALT Text" value={draft.coverImageAlt} onChange={(v) => setField('coverImageAlt', v)} placeholder="Describe the image naturally" />
              <Field label="Image Title" value={draft.coverImageTitle} onChange={(v) => setField('coverImageTitle', v)} />
              <Field label="Caption" value={draft.coverImageCaption} onChange={(v) => setField('coverImageCaption', v)} />
              <Field label="Description" value={draft.coverImageDescription} onChange={(v) => setField('coverImageDescription', v)} />
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>In-Article Images ({draft.images.length})</Label>
          <button onClick={() => onUploadRequest()} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-[#222] text-[11px] font-black cursor-pointer"><Plus className="w-3.5 h-3.5" /> Add Image</button>
        </div>
        {draft.images.length === 0 && <Empty title="No in-article images yet" desc="Insert images from the Content tab's toolbar — they'll appear here for ALT/caption editing." />}
        <div className="space-y-3">
          {draft.images.map((img, idx) => (
            <div key={idx} className="flex gap-3 p-3 rounded-2xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929]">
              <img src={img.url} alt={img.alt} className="w-20 h-20 rounded-xl object-cover shrink-0" />
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                <Field label="ALT Text" value={img.alt} onChange={(v) => updateImage(idx, { alt: v })} />
                <Field label="Title" value={img.title} onChange={(v) => updateImage(idx, { title: v })} />
                <Field label="Caption" value={img.caption} onChange={(v) => updateImage(idx, { caption: v })} />
                <Field label="Description" value={img.description} onChange={(v) => updateImage(idx, { description: v })} />
              </div>
              <button onClick={() => removeImage(idx)} className="p-2 h-fit rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── SEO tab ───────────────────────────────────────────────────────────────

function CharGuide({ value, min, max }) {
  const len = (value || '').length;
  const ok = len >= min && len <= max;
  return <span className={`text-[10px] font-bold ${len === 0 ? 'text-neutral-400' : ok ? 'text-emerald-600' : 'text-amber-600'}`}>{len} chars (guidance: {min}–{max})</span>;
}

function BlogSeoTab({ draft, setField, setSeoField, slug }) {
  const siteUrl = (typeof window !== 'undefined' ? window.location.origin : 'https://apexvouchers.com');
  const canonical = draft.seo.canonicalUrl || `${siteUrl}/blog/${slug || 'your-post-slug'}`;
  const robotsValue = draft.seo.noindex && draft.seo.nofollow ? 'noindex_nofollow'
    : draft.seo.noindex ? 'noindex_follow'
    : draft.seo.nofollow ? 'index_nofollow'
    : 'index_follow';
  const setRobots = (v) => {
    setSeoField('noindex', v.startsWith('noindex'));
    setSeoField('nofollow', v.endsWith('nofollow'));
  };

  return (
    <div className="space-y-6">
      <div>
        <Label>Google Search Preview</Label>
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929]">
          <div className="text-[13px] text-[#1a0dab] dark:text-sky-400 font-medium truncate">{draft.seo.title || draft.title || 'SEO Title Preview'}</div>
          <div className="text-[12px] text-emerald-700 dark:text-emerald-500 truncate">{canonical}</div>
          <div className="text-[12px] text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-2">{draft.seo.description || draft.excerpt || 'Meta description preview…'}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Primary Keyword" value={draft.seo.focusKeyword} onChange={(v) => setSeoField('focusKeyword', v)} placeholder="e.g. authentic PTE exam vouchers" />
        <Field label="Secondary Keywords (comma separated)" value={(draft.seo.secondaryKeywords || []).join(', ')} onChange={(v) => setSeoField('secondaryKeywords', v.split(',').map((s) => s.trim()).filter(Boolean))} />
      </div>

      <div>
        <Field label="SEO Title" value={draft.seo.title} onChange={(v) => setSeoField('title', v)} placeholder="Shown in search results" />
        <CharGuide value={draft.seo.title} min={30} max={70} />
      </div>
      <div>
        <TextArea label="Meta Description" value={draft.seo.description} onChange={(v) => setSeoField('description', v)} rows={2} />
        <CharGuide value={draft.seo.description} min={80} max={160} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Canonical URL" value={draft.seo.canonicalUrl} onChange={(v) => setSeoField('canonicalUrl', v)} placeholder={canonical} hint="Leave blank to auto-use the article URL." />
        <Select label="Robots" value={robotsValue} onChange={setRobots} options={[
          { value: 'index_follow', label: 'Index, Follow (default)' },
          { value: 'noindex_follow', label: 'Noindex, Follow' },
          { value: 'index_nofollow', label: 'Index, Nofollow' },
          { value: 'noindex_nofollow', label: 'Noindex, Nofollow' },
        ]} />
      </div>

      <div className="pt-2 border-t border-[#EAEAEA] dark:border-[#292929]">
        <Label>Open Graph</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="OG Title" value={draft.seo.ogTitle} onChange={(v) => setSeoField('ogTitle', v)} placeholder={draft.seo.title || draft.title} />
          <Field label="OG Image URL" value={draft.seo.ogImage} onChange={(v) => setSeoField('ogImage', v)} placeholder={draft.coverImage || 'Uses featured image if blank'} />
        </div>
        <TextArea label="OG Description" value={draft.seo.ogDescription} onChange={(v) => setSeoField('ogDescription', v)} rows={2} />
      </div>

      <div className="pt-2 border-t border-[#EAEAEA] dark:border-[#292929]">
        <Label>Twitter / X</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Twitter Title" value={draft.seo.twitterTitle} onChange={(v) => setSeoField('twitterTitle', v)} />
          <Select label="Card Type" value={draft.seo.twitterCardType} onChange={(v) => setSeoField('twitterCardType', v)} options={[
            { value: 'summary_large_image', label: 'Summary Large Image' },
            { value: 'summary', label: 'Summary' },
          ]} />
        </div>
        <TextArea label="Twitter Description" value={draft.seo.twitterDescription} onChange={(v) => setSeoField('twitterDescription', v)} rows={2} />
        <Field label="Twitter Image URL" value={draft.seo.twitterImage} onChange={(v) => setSeoField('twitterImage', v)} placeholder={draft.coverImage || 'Uses featured image if blank'} />
      </div>
    </div>
  );
}

// ── FAQ tab ───────────────────────────────────────────────────────────────

function BlogFaqTab({ faqs, onChange }) {
  const add = () => onChange([...(faqs || []), { question: '', answer: '' }]);
  const update = (idx, patch) => { const next = [...faqs]; next[idx] = { ...next[idx], ...patch }; onChange(next); };
  const remove = (idx) => onChange(faqs.filter((_, i) => i !== idx));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Frequently Asked Questions ({faqs.length})</Label>
        <button onClick={add} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-[#222] text-[11px] font-black cursor-pointer"><Plus className="w-3.5 h-3.5" /> Add FAQ</button>
      </div>
      {faqs.length === 0 && <Empty title="No FAQs yet" desc="FAQPage structured data is only generated once you add FAQs that will be rendered on the article." />}
      {faqs.map((f, idx) => (
        <div key={idx} className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-neutral-400 uppercase">FAQ {idx + 1}</span>
            <button onClick={() => remove(idx)} className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
          <Field label="Question" value={f.question} onChange={(v) => update(idx, { question: v })} />
          <TextArea label="Answer" value={f.answer} onChange={(v) => update(idx, { answer: v })} rows={2} />
        </div>
      ))}
    </div>
  );
}

// ── Internal Links tab ────────────────────────────────────────────────────

function BlogLinksTab({ excludeId, editorInstance }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    const t = setTimeout(async () => {
      const res = await blogApi.internalLinkSuggestions(q, excludeId);
      if (res.success) setResults(res.data || []);
    }, 250);
    return () => clearTimeout(t);
  }, [q, excludeId]);

  const insertLink = (item) => {
    if (!editorInstance) { alert('Open the Content tab first so the editor is ready.'); return; }
    const { from, to } = editorInstance.state.selection;
    if (from === to) {
      editorInstance.chain().focus().insertContent(`<a href="${item.url}">${item.title}</a>`).run();
    } else {
      editorInstance.chain().focus().extendMarkRange('link').setLink({ href: item.url }).run();
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-xs font-bold text-neutral-500 dark:text-[#B5B5B5]">
        Search real pages on the site and insert a link at your cursor in the Content tab. Only URLs that actually exist are suggested.
      </p>
      <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929]">
        <Search className="w-4 h-4 text-neutral-400" />
        <input placeholder="Search products, pages, blog posts…" value={q} onChange={(e) => setQ(e.target.value)} className="bg-transparent outline-none text-xs font-bold w-full" />
      </div>
      <div className="space-y-2">
        {results.map((r, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929]">
            <div className="min-w-0">
              <div className="font-black text-xs text-neutral-900 dark:text-white line-clamp-1">{r.title}</div>
              <div className="text-[10px] font-bold text-neutral-400 line-clamp-1">{r.url} · {r.type}</div>
            </div>
            <button onClick={() => insertLink(r)} className="shrink-0 px-3 py-1.5 rounded-lg btn-pink text-white text-[10px] font-black cursor-pointer">Insert Link</button>
          </div>
        ))}
        {results.length === 0 && <Empty title="No matches" desc="Try a different search term." />}
      </div>
    </div>
  );
}

// ── Related Posts tab ─────────────────────────────────────────────────────

function BlogRelatedTab({ draft, setField, excludeId }) {
  const [allPublished, setAllPublished] = useState([]);

  useEffect(() => {
    blogApi.list({ status: 'published' }).then((res) => { if (res.success) setAllPublished(res.data || []); });
  }, []);

  const selectable = allPublished.filter((p) => p._id !== excludeId);
  const suggested = selectable.filter((p) => p.category === draft.category || (p.tags || []).some((t) => (draft.tags || []).includes(t)));

  const toggle = (postId) => {
    const set = new Set(draft.relatedPosts || []);
    if (set.has(postId)) set.delete(postId); else set.add(postId);
    setField('relatedPosts', Array.from(set));
  };

  return (
    <div className="space-y-6">
      <div>
        <Label>Manually Selected ({(draft.relatedPosts || []).length})</Label>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {selectable.map((p) => (
            <label key={p._id} className="flex items-center gap-3 p-2.5 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] cursor-pointer">
              <input type="checkbox" checked={(draft.relatedPosts || []).includes(p._id)} onChange={() => toggle(p._id)} className="w-4 h-4 accent-brand-pink" />
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 line-clamp-1">{p.title}</span>
            </label>
          ))}
          {selectable.length === 0 && <Empty title="No other published posts yet" desc="Publish more articles to link them here." />}
        </div>
      </div>
      {suggested.length > 0 && (
        <div>
          <Label>Auto-Suggested (same category/tags)</Label>
          <div className="flex flex-wrap gap-2">
            {suggested.map((p) => (
              <button key={p._id} onClick={() => toggle(p._id)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-black border cursor-pointer ${(draft.relatedPosts || []).includes(p._id) ? 'bg-brand-pink text-white border-brand-pink' : 'bg-neutral-50 dark:bg-[#0E0E0E] border-[#EAEAEA] dark:border-[#292929]'}`}>
                {p.title}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Revision History tab ──────────────────────────────────────────────────

function BlogHistoryTab({ id, onRestored }) {
  const [revisions, setRevisions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    blogApi.revisions(id).then((res) => { if (res.success) setRevisions(res.data || []); setLoading(false); });
  }, [id]);

  const restore = async (rev) => {
    if (!confirm(`Restore the version from ${new Date(rev.createdAt).toLocaleString()}? Your current unsaved changes in other tabs will be replaced once you Save.`)) return;
    const res = await blogApi.restoreRevision(id, rev._id);
    if (res.success) { onRestored(res.data); alert('✅ Revision restored into the editor — review and Save/Publish to confirm.'); } else alert(res.message);
  };

  if (!id) return <Empty title="Save this post first" desc="Revision history is available after the first save." />;
  if (loading) return <div className="text-xs font-bold text-neutral-400 animate-pulse py-6 text-center">Loading revisions…</div>;
  if (revisions.length === 0) return <Empty title="No revisions yet" desc="A revision is recorded every time you save changes to this post." />;

  return (
    <div className="space-y-2">
      {revisions.map((rev) => (
        <div key={rev._id} className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929]">
          <div className="min-w-0">
            <div className="text-xs font-black text-neutral-900 dark:text-white">{new Date(rev.createdAt).toLocaleString()}</div>
            <div className="text-[10px] font-bold text-neutral-400 line-clamp-1">{rev.editedByEmail || 'system'} — {rev.changeSummary}</div>
          </div>
          <button onClick={() => restore(rev)} className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-[#222] text-[10px] font-black cursor-pointer"><RotateCcw className="w-3 h-3" /> Restore</button>
        </div>
      ))}
    </div>
  );
}

// ── SEO Health sidebar panel ──────────────────────────────────────────────

function ScoreRing({ score = 0 }) {
  const color = score >= 90 ? '#10B981' : score >= 75 ? '#22C55E' : score >= 60 ? '#F59E0B' : score >= 40 ? '#F97316' : '#EF4444';
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="relative w-24 h-24 mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="10" className="text-neutral-100 dark:text-[#262626]" />
        <circle cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="10" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-heading font-black text-xl">{score}</span>
        <span className="text-[9px] font-bold text-neutral-400">/100</span>
      </div>
    </div>
  );
}

const PRIORITY_ICON = { high: '🔴', medium: '🟠', low: '🟢' };

function SeoHealthPanel({ analysis, safetyWarnings, loading, onRefresh, onQuickFix }) {
  return (
    <div className="rounded-3xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-sm flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-brand-pink" /> SEO Health</h3>
        {onRefresh && <button onClick={onRefresh} className="text-[10px] font-black text-brand-pink cursor-pointer">{loading ? 'Analyzing…' : 'Refresh'}</button>}
      </div>

      {!analysis ? (
        <p className="text-xs font-bold text-neutral-400">Save this post to see its SEO Health score and recommendations.</p>
      ) : (
        <>
          <ScoreRing score={analysis.score} />
          <div className="text-center text-xs font-black text-neutral-500">{analysis.grade}</div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E]"><div className="font-black text-sm">{analysis.breakdown.technical}/40</div><div className="text-[9px] font-bold text-neutral-400">Technical</div></div>
            <div className="p-2 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E]"><div className="font-black text-sm">{analysis.breakdown.content}/40</div><div className="text-[9px] font-bold text-neutral-400">Content</div></div>
            <div className="p-2 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E]"><div className="font-black text-sm">{analysis.breakdown.media}/20</div><div className="text-[9px] font-bold text-neutral-400">Media</div></div>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto">
            {analysis.recommendations.map((r, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929]">
                <div className="text-xs font-black flex items-start gap-1.5">
                  <span>{PRIORITY_ICON[r.priority]}</span>
                  <span className="flex-1">{r.text}</span>
                </div>
                <p className="text-[10px] font-bold text-neutral-400 mt-1 ml-5">{r.fix}</p>
                <button onClick={() => onQuickFix(r)} className="ml-5 mt-1 text-[10px] font-black text-brand-pink cursor-pointer flex items-center gap-1">Go fix it <ChevronRight className="w-3 h-3" /></button>
              </div>
            ))}
            {analysis.recommendations.length === 0 && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600"><CheckCircle2 className="w-4 h-4" /> No issues found</div>
            )}
          </div>

          {safetyWarnings.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-[#EAEAEA] dark:border-[#292929]">
              {safetyWarnings.map((w, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-[10px] font-bold text-rose-600 dark:text-rose-400"><XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {w.text}</div>
              ))}
            </div>
          )}

          <p className="text-[9px] font-bold text-neutral-400 pt-2 border-t border-[#EAEAEA] dark:border-[#292929]">{analysis.disclaimer}</p>
        </>
      )}
    </div>
  );
}

function ImproveSeoPanel({ suggestions, onRun, onQuickFix, hasId }) {
  return (
    <div className="rounded-3xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm p-5 space-y-3">
      <button onClick={onRun} disabled={!hasId} className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 text-xs font-black cursor-pointer disabled:opacity-40">
        <Sparkles className="w-3.5 h-3.5" /> Improve Article SEO
      </button>
      {!hasId && <p className="text-[10px] font-bold text-neutral-400 text-center">Save the post first.</p>}
      {suggestions && (
        <div className="space-y-2">
          {suggestions.suggestions.length === 0 ? (
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600"><CheckCircle2 className="w-4 h-4" /> No further suggestions right now</div>
          ) : suggestions.suggestions.map((s, idx) => (
            <div key={idx} className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
              <div className="text-[11px] font-black text-amber-900 dark:text-amber-300">{s.issue}</div>
              <div className="text-[10px] font-bold text-amber-700/80 dark:text-amber-400/80 mt-0.5">{s.suggestion}</div>
              <button onClick={() => onQuickFix({ issue: s.issue, field: s.field, fix: s.suggestion })} className="mt-1.5 text-[10px] font-black text-brand-pink cursor-pointer">Apply / Go to field →</button>
            </div>
          ))}
          <p className="text-[9px] font-bold text-neutral-400 pt-1">{suggestions.disclaimer}</p>
        </div>
      )}
    </div>
  );
}
