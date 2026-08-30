'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Plus, Search, ChevronUp, ChevronDown, Edit2, Trash2, X, Eye, Crown, Play, CheckCircle2, Clock, Film, Save, Sparkles, Loader2 } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { ApexLogo } from '@/components/apex-logo';
import { StatCard, Pill, Th, Td, Empty, FormCard, Field, Label, TextArea, Check } from '@/components/admin/admin-ui';

interface ReelRow {
  _id?: string;
  id?: string;
  title?: string;
  description?: string;
  category?: string;
  duration?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  thumbnail?: string;
  poster?: string;
  cloudinaryPublicId?: string;
  badgeColor?: string;
  icon?: string;
  featured?: boolean;
  published?: boolean;
  isActive?: boolean;
  order?: number;
  displayOrder?: number;
  views?: number;
  viewsCount?: number;
}

export function VideosAdmin() {
  const [rows, setRows] = useState<ReelRow[]>([]);
  const [kpis, setKpis] = useState<Record<string, number>>({});
  const [settings, setSettings] = useState({ videoSectionEnabled: true, movieReelModeEnabled: true });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const [editing, setEditing] = useState<ReelRow | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [previewVideo, setPreviewVideo] = useState<ReelRow | null>(null);
  const [draft, setDraft] = useState<Record<string, unknown>>({});
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'video' | 'thumbnail') => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (type === 'video') {
      if (!/\.(mp4|webm|mov)$/i.test(file.name)) {
        alert('Invalid video format. Please select an .mp4, .webm, or .mov video file.');
        return;
      }
    } else if (!/\.(jpg|jpeg|png|webp)$/i.test(file.name)) {
      alert('Invalid image format. Please select a .jpg, .png, or .webp image file.');
      return;
    }
    setUploadingMedia(true);
    setUploadProgress(30);
    try {
      const formData = new FormData();
      formData.append(type, file);
      setUploadProgress(60);
      const res = await adminApi.uploadMedia(formData);
      setUploadProgress(100);
      if (res.success) {
        if (type === 'video') {
          setDraft((prev) => ({
            ...prev,
            videoUrl: res.videoUrl || prev.videoUrl,
            cloudinaryPublicId: res.cloudinaryPublicId || prev.cloudinaryPublicId || '',
            thumbnail: res.thumbnailUrl || prev.thumbnail,
            thumbnailUrl: res.thumbnailUrl || prev.thumbnailUrl,
            duration: res.duration || prev.duration || '15s',
          }));
        } else {
          setDraft((prev) => ({
            ...prev,
            thumbnail: res.thumbnailUrl || prev.thumbnail,
            thumbnailUrl: res.thumbnailUrl || prev.thumbnailUrl,
          }));
        }
      } else {
        alert((res.message as string) || 'File upload failed');
      }
    } catch (err) {
      alert('Upload error: ' + (err instanceof Error ? err.message : 'Server error during upload'));
    } finally {
      setUploadingMedia(false);
      setUploadProgress(0);
    }
  };

  const refresh = useCallback(async () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    if (categoryFilter) params.category = categoryFilter;
    const res = await adminApi.reels(params);
    setRows((res.data as ReelRow[]) || []);
    setKpis((res.kpis as Record<string, number>) || {});
    if (res.settings) setSettings(res.settings as { videoSectionEnabled: boolean; movieReelModeEnabled: boolean });
    setLoading(false);
  }, [search, statusFilter, categoryFilter]);

  useEffect(() => {
    const t = setTimeout(refresh, 300);
    return () => clearTimeout(t);
  }, [refresh]);

  const setCloudinaryId = (id: string) => {
    const clean = id.trim();
    setDraft((prev) => ({
      ...prev,
      cloudinaryPublicId: clean,
      videoUrl: clean ? `https://res.cloudinary.com/nbcbpuql/video/upload/${clean}.mp4` : prev.videoUrl,
      thumbnail: clean ? `https://res.cloudinary.com/nbcbpuql/video/upload/so_0/${clean}.jpg` : prev.thumbnail,
      thumbnailUrl: clean ? `https://res.cloudinary.com/nbcbpuql/video/upload/so_0/${clean}.jpg` : prev.thumbnailUrl,
    }));
  };

  const startCreate = () => {
    const nextOrder = (rows.length || 0) + 1;
    setDraft({
      title: '',
      description: '',
      cloudinaryPublicId: '',
      videoUrl: '',
      youtubeEmbed: '',
      thumbnail: '',
      thumbnailUrl: '',
      category: 'Step-By-Step Guide',
      duration: '15s',
      badgeColor: 'bg-amber-400 text-slate-950',
      icon: '🎬',
      displayOrder: nextOrder,
      order: nextOrder,
      viewsCount: 0,
      views: 0,
      featured: false,
      published: true,
      isActive: true,
    });
    setEditing(null);
    setIsCreating(true);
  };

  const startEdit = (v: ReelRow) => {
    setEditing(v);
    setIsCreating(false);
    setDraft({
      ...v,
      cloudinaryPublicId: v.cloudinaryPublicId || '',
      thumbnail: v.thumbnailUrl || v.thumbnail || '',
      thumbnailUrl: v.thumbnailUrl || v.thumbnail || '',
      order: v.order ?? v.displayOrder ?? 0,
      displayOrder: v.displayOrder ?? v.order ?? 0,
      isActive: v.isActive ?? v.published ?? true,
      published: v.published ?? v.isActive ?? true,
      views: v.views ?? v.viewsCount ?? 0,
      viewsCount: v.viewsCount ?? v.views ?? 0,
    });
  };

  const saveVideo = async () => {
    if (!draft.title || (!draft.videoUrl && !draft.cloudinaryPublicId)) {
      alert('Video title and video URL or Cloudinary Public ID are required.');
      return;
    }
    const orderVal = Number(draft.order ?? draft.displayOrder) || 0;
    const viewsVal = Number(draft.views ?? draft.viewsCount) || 0;
    const payload = {
      ...draft,
      order: orderVal,
      displayOrder: orderVal,
      views: viewsVal,
      viewsCount: viewsVal,
      isActive: draft.isActive !== undefined ? !!draft.isActive : !!draft.published,
      published: draft.published !== undefined ? !!draft.published : !!draft.isActive,
    };
    let res;
    if (isCreating) res = await adminApi.createReel(payload);
    else res = await adminApi.updateReel(editing?._id || editing?.id || '', payload);
    if (res.success) {
      setIsCreating(false);
      setEditing(null);
      refresh();
    } else alert((res.message as string) || 'Failed to save video');
  };

  const moveOrder = async (index: number, direction: number) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= rows.length) return;
    const newRows = [...rows];
    const temp = newRows[index];
    newRows[index] = newRows[targetIdx];
    newRows[targetIdx] = temp;
    const items = newRows.map((r, idx) => ({ id: r._id || r.id, order: idx + 1 }));
    setRows(newRows);
    const res = await adminApi.bulkReorderReels(items);
    if (res.success) refresh();
  };

  const toggleSectionEnabled = async () => {
    const nextVal = !settings.videoSectionEnabled;
    const res = await adminApi.updateReelSettings({ videoSectionEnabled: nextVal });
    if (res.success) {
      setSettings((prev) => ({ ...prev, videoSectionEnabled: nextVal }));
      refresh();
    }
  };

  const toggleMovieModeEnabled = async () => {
    const nextVal = !settings.movieReelModeEnabled;
    const res = await adminApi.updateReelSettings({ movieReelModeEnabled: nextVal });
    if (res.success) {
      setSettings((prev) => ({ ...prev, movieReelModeEnabled: nextVal }));
      refresh();
    }
  };

  const toggleFeatured = async (v: ReelRow) => {
    const res = await adminApi.quickToggleFeaturedReel(v._id || v.id || '', !v.featured);
    if (res.success) refresh();
  };

  const togglePublished = async (v: ReelRow) => {
    const isPub = v.published !== undefined ? !v.published : !v.isActive;
    const res = await adminApi.quickTogglePublishReel(v._id || v.id || '', isPub);
    if (res.success) refresh();
  };

  const removeVideo = async (v: ReelRow) => {
    if (!confirm(`Are you sure you want to delete reel "${v.title}"?`)) return;
    const res = await adminApi.deleteReel(v._id || v.id || '');
    if (res.success) refresh();
    else alert((res.message as string) || 'Failed to delete reel');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl tracking-tight">Videos &amp; Reels Management</h1>
          <p className="text-xs font-bold text-neutral-500 dark:text-[#B5B5B5]">Manage Cloudinary-hosted reels, carousel order, live card previews, durations, and view analytics.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={toggleSectionEnabled} className={`px-4 py-2.5 rounded-2xl text-xs font-black border transition cursor-pointer flex items-center gap-2 ${settings.videoSectionEnabled ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400'}`}>
            <Film className="w-4 h-4" /> Reel Section: {settings.videoSectionEnabled ? 'ON (Visible)' : 'OFF (Hidden)'}
          </button>
          <button onClick={toggleMovieModeEnabled} className={`px-4 py-2.5 rounded-2xl text-xs font-black border transition cursor-pointer flex items-center gap-2 ${settings.movieReelModeEnabled ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400' : 'bg-neutral-100 text-neutral-500 border-neutral-200 dark:bg-[#262626]'}`}>
            <Sparkles className="w-4 h-4" /> Movie Mode: {settings.movieReelModeEnabled ? 'ON' : 'OFF'}
          </button>
          <button onClick={startCreate} className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl btn-pink text-white font-black text-xs shadow-lg cursor-pointer">
            <Plus className="w-4 h-4" /> Add New Reel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard label="Total Reels" value={kpis.totalVideos || rows.length} icon={<Film className="w-4 h-4" />} tint="#FF005C" />
        <StatCard label="Published" value={kpis.publishedVideos || 0} icon={<CheckCircle2 className="w-4 h-4" />} tint="#10B981" />
        <StatCard label="Drafts" value={kpis.draftVideos || 0} icon={<Clock className="w-4 h-4" />} tint="#64748B" />
        <StatCard label="Center Featured" value={kpis.featuredVideos || 0} icon={<Crown className="w-4 h-4" />} tint="#F59E0B" />
        <StatCard label="Total Reel Views" value={(kpis.totalViews || 0).toLocaleString()} icon={<Eye className="w-4 h-4" />} tint="#6C3CE0" />
      </div>

      <div className="rounded-3xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] flex-1 max-w-md">
            <Search className="w-4 h-4 text-neutral-400" />
            <input placeholder="Search reels by title, description, category, Cloudinary ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent outline-none text-xs font-bold w-full text-neutral-900 dark:text-white" />
          </div>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-3.5 py-2.5 rounded-2xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-xs font-bold text-neutral-700 dark:text-neutral-300">
            <option value="">All Categories</option>
            <option value="Step-By-Step Guide">Step-By-Step Guide</option>
            <option value="PTE Voucher">PTE Voucher</option>
            <option value="Redemption Guide">Redemption Guide</option>
            <option value="Save Money">Save Money</option>
            <option value="Offers">Offers</option>
            <option value="Voucher FAQs">Voucher FAQs</option>
            <option value="IELTS">IELTS</option>
            <option value="TOEFL">TOEFL</option>
            <option value="Duolingo">Duolingo</option>
          </select>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
          {[
            { id: '', label: 'All Reels' },
            { id: 'published', label: 'Published / Active' },
            { id: 'draft', label: 'Drafts / Inactive' },
            { id: 'featured', label: 'Center Featured' },
          ].map((pill) => (
            <button key={pill.id} onClick={() => setStatusFilter(pill.id)} className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition whitespace-nowrap cursor-pointer ${statusFilter === pill.id ? 'bg-brand-pink text-white shadow-sm' : 'bg-neutral-100 dark:bg-[#262626] text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'}`}>
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {(isCreating || editing) && (
        <FormCard title={isCreating ? 'Add New Video Reel (Cloudinary)' : `Edit Reel: ${editing?.title}`} onClose={() => { setIsCreating(false); setEditing(null); }} onSave={saveVideo}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/20 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 text-[10px] font-black uppercase">Cloudinary ID</span>
                    <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">Select or type a Cloudinary Public ID:</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {['v1', 'v2', 'v3', 'v4', 'v5'].map((id) => (
                      <button key={id} type="button" onClick={() => setCloudinaryId(id)} className={`px-2.5 py-1 rounded-lg text-xs font-mono font-black transition cursor-pointer ${draft.cloudinaryPublicId === id ? 'bg-amber-400 text-slate-950 shadow-md scale-105' : 'bg-white dark:bg-[#222] text-neutral-700 dark:text-neutral-300 border border-[#EAEAEA] dark:border-[#333] hover:border-amber-400'}`}>
                        {id}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300 mb-1">Cloudinary Public ID</label>
                    <input type="text" value={(draft.cloudinaryPublicId as string) || ''} onChange={(e) => setCloudinaryId(e.target.value)} placeholder="e.g. v1, v2, my_reel_01" className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#121212] border border-[#EAEAEA] dark:border-[#292929] text-xs font-bold text-neutral-900 dark:text-white outline-none focus:border-amber-400" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300 mb-1">Auto-Generated Poster Frame</label>
                    <button type="button" onClick={() => { if (draft.cloudinaryPublicId) { const poster = `https://res.cloudinary.com/nbcbpuql/video/upload/so_0/${draft.cloudinaryPublicId}.jpg`; setDraft((prev) => ({ ...prev, thumbnail: poster, thumbnailUrl: poster })); } }} disabled={!draft.cloudinaryPublicId} className="w-full px-3 py-2 rounded-xl bg-neutral-100 dark:bg-[#222] text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-amber-400 hover:text-slate-950 transition cursor-pointer disabled:opacity-50">
                      ⚡ Use Cloudinary Keyframe Snapshot (so_0)
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#292929]">
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-900 dark:text-white">🎬 Upload Video to Cloudinary (.mp4, .webm, .mov)</label>
                  <label className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-brand-pink/30 bg-rose-50/30 dark:bg-[#2A0A17]/20 hover:border-brand-pink cursor-pointer transition">
                    <span className="text-xs font-black text-brand-pink">Click to Upload MP4 Video</span>
                    <span className="text-[10px] text-slate-400 font-medium mt-0.5">Direct Cloudinary Stream • Max 100MB</span>
                    <input type="file" accept="video/mp4,video/webm,video/quicktime" onChange={(e) => handleMediaUpload(e, 'video')} className="hidden" />
                  </label>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-900 dark:text-white">🖼️ Upload Custom Poster (.jpg, .png, .webp)</label>
                  <label className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-amber-500/30 bg-amber-50/30 dark:bg-amber-950/20 hover:border-amber-500 cursor-pointer transition">
                    <span className="text-xs font-black text-amber-600 dark:text-amber-400">Click to Upload Poster Image</span>
                    <span className="text-[10px] text-slate-400 font-medium mt-0.5">9:16 Aspect Ratio Recommended</span>
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => handleMediaUpload(e, 'thumbnail')} className="hidden" />
                  </label>
                </div>
              </div>

              {uploadingMedia && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center justify-between">
                  <span>Uploading media to Cloudinary storage...</span>
                  <span>{uploadProgress}%</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Reel Title *" value={draft.title as string} onChange={(v) => setDraft({ ...draft, title: v })} placeholder="e.g. How to Buy an Exam Voucher" />
                <Field label="Category *" value={draft.category as string} onChange={(v) => setDraft({ ...draft, category: v })} placeholder="Step-By-Step Guide / PTE Voucher" />
                <Field label="Direct Video Stream URL (MP4) *" value={draft.videoUrl as string} onChange={(v) => setDraft({ ...draft, videoUrl: v })} placeholder="https://res.cloudinary.com/..." />
                <Field label="Poster / Thumbnail Image URL *" value={(draft.thumbnailUrl as string) || (draft.thumbnail as string)} onChange={(v) => setDraft({ ...draft, thumbnail: v, thumbnailUrl: v })} placeholder="https://..." />
                <Field label="Duration" value={draft.duration as string} onChange={(v) => setDraft({ ...draft, duration: v })} placeholder="15s" />
                <Field label="Display Order (Rank)" type="number" value={(draft.order as number) ?? (draft.displayOrder as number)} onChange={(v) => setDraft({ ...draft, order: v, displayOrder: v })} />
                <Field label="View Count" type="number" value={(draft.views as number) ?? (draft.viewsCount as number)} onChange={(v) => setDraft({ ...draft, views: v, viewsCount: v })} />
                <Field label="Badge Text Style" value={draft.badgeColor as string} onChange={(v) => setDraft({ ...draft, badgeColor: v })} placeholder="bg-amber-400 text-slate-950" />
              </div>

              <TextArea label="Short Description (Shown on Reel Card)" value={draft.description as string} onChange={(v) => setDraft({ ...draft, description: v })} rows={2} />

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Check label="Center Featured Video (Large Card Highlight)" checked={!!draft.featured} onChange={(v) => setDraft({ ...draft, featured: v })} />
                <Check label="Active & Visible on Public Website" checked={draft.isActive !== undefined ? !!draft.isActive : !!draft.published} onChange={(v) => setDraft({ ...draft, isActive: v, published: v })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Live Customer Card Preview</Label>
              <div className="w-full aspect-9/16 rounded-2xl bg-[#161616] border-2 border-amber-400 p-4 relative overflow-hidden flex flex-col justify-between text-white shadow-xl">
                {(draft.thumbnailUrl || draft.thumbnail) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={(draft.thumbnailUrl as string) || (draft.thumbnail as string)} alt="preview" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                ) : null}
                <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-transparent to-slate-950/70" aria-hidden="true" />
                <div className="relative z-10 flex justify-between items-center">
                  <span className="px-2.5 py-1 rounded bg-amber-400 text-slate-950 font-black text-[10px] uppercase">{(draft.category as string) || 'STEP-BY-STEP'}</span>
                  <ApexLogo className="h-4" whiteText />
                </div>
                <div className="relative z-10 text-center my-auto">
                  <div className="w-12 h-12 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center mx-auto shadow-xl border-2 border-white">
                    <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
                  </div>
                  <span className="inline-block mt-2 text-[9px] font-extrabold text-amber-400 uppercase tracking-widest bg-black/70 px-2 py-0.5 rounded-full">{(draft.duration as string) || '15s'} • Click to Play</span>
                </div>
                <div className="relative z-10 space-y-1 bg-slate-950/90 p-3 rounded-xl border border-white/10">
                  <div className="flex justify-between items-start gap-1">
                    <h4 className="font-heading font-black text-xs text-white leading-tight truncate">{(draft.title as string) || 'Untitled Reel'}</h4>
                    <span className="text-[9px] font-bold text-slate-400 shrink-0">{((Number(draft.views) || Number(draft.viewsCount) || 0)).toLocaleString()} views</span>
                  </div>
                  <p className="text-[10px] text-slate-300 font-medium line-clamp-2">{(draft.description as string) || 'Description will appear on reel card...'}</p>
                </div>
              </div>
            </div>
          </div>
        </FormCard>
      )}

      <div className="rounded-3xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-bold">
            <thead className="bg-neutral-50 dark:bg-[#0E0E0E] text-neutral-500">
              <tr>
                <Th>Thumbnail &amp; Reel Details</Th>
                <Th>Category</Th>
                <Th className="text-center">Duration</Th>
                <Th className="text-right">Total Views</Th>
                <Th className="text-center">Center Featured</Th>
                <Th className="text-center">Status</Th>
                <Th className="text-center">Display Order</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {loading && Array.from({ length: 4 }).map((_, i) => <tr key={i}><td colSpan={8} className="p-4"><div className="h-10 bg-neutral-100 dark:bg-[#292929] rounded-xl animate-pulse" /></td></tr>)}
              {!loading && rows.map((v, index) => (
                <tr key={v._id || v.id} className="border-t border-[#EAEAEA] dark:border-[#292929] hover:bg-neutral-50/50 dark:hover:bg-[#111111] transition-colors">
                  <Td>
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-10 rounded-xl bg-neutral-900 overflow-hidden relative border border-[#EAEAEA] dark:border-[#292929] shrink-0">
                        {(v.thumbnailUrl || v.thumbnail || v.poster) && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={v.thumbnailUrl || v.thumbnail || v.poster} alt={v.title || 'reel'} className="w-full h-full object-cover" />
                        )}
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center"><Play className="w-3.5 h-3.5 fill-white text-white" /></div>
                      </div>
                      <div>
                        <div className="font-black text-sm text-neutral-900 dark:text-white flex items-center gap-2">
                          <span>{v.title}</span>
                          {v.cloudinaryPublicId && <span className="px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-500 border border-sky-500/20 text-[9px] font-mono font-bold">{v.cloudinaryPublicId}</span>}
                          {v.featured && <span className="px-2 py-0.5 rounded-md bg-amber-400/10 text-amber-600 border border-amber-400/30 text-[9px] font-black">★ CENTER FEATURED</span>}
                        </div>
                        <div className="text-[11px] font-semibold text-neutral-400 truncate max-w-xs">{v.description || 'No short description provided'}</div>
                      </div>
                    </div>
                  </Td>
                  <Td className="whitespace-nowrap"><span className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-[#262626] text-neutral-700 dark:text-neutral-300 text-[10px] font-black">{v.category}</span></Td>
                  <Td className="text-center whitespace-nowrap text-amber-600 dark:text-amber-400 font-mono font-black">▶ {v.duration || '15s'}</Td>
                  <Td className="text-right tabular-nums font-black text-neutral-900 dark:text-white">{(v.views ?? v.viewsCount ?? 0).toLocaleString()}</Td>
                  <Td className="text-center whitespace-nowrap">
                    <button onClick={() => toggleFeatured(v)} className={`px-3 py-1 rounded-full text-[10px] font-black border cursor-pointer ${v.featured ? 'bg-amber-400/20 text-amber-600 border-amber-400' : 'bg-neutral-100 text-neutral-400 border-neutral-200 dark:bg-[#262626]'}`}>
                      {v.featured ? '★ Center Featured' : '☆ Standard'}
                    </button>
                  </Td>
                  <Td className="text-center whitespace-nowrap">
                    <button onClick={() => togglePublished(v)} className="cursor-pointer"><Pill text={(v.isActive ?? v.published) ? 'ACTIVE' : 'INACTIVE'} tint={(v.isActive ?? v.published) ? 'emerald' : 'neutral'} /></button>
                  </Td>
                  <Td className="text-center whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      <button type="button" disabled={index === 0} onClick={() => moveOrder(index, -1)} className="p-1 rounded-lg bg-neutral-100 dark:bg-[#222] hover:bg-amber-400 hover:text-slate-950 transition disabled:opacity-30 cursor-pointer" title="Move Up in Carousel"><ChevronUp className="w-3.5 h-3.5" /></button>
                      <span className="font-mono font-black text-xs px-1.5">{v.order ?? v.displayOrder ?? index + 1}</span>
                      <button type="button" disabled={index === rows.length - 1} onClick={() => moveOrder(index, 1)} className="p-1 rounded-lg bg-neutral-100 dark:bg-[#222] hover:bg-amber-400 hover:text-slate-950 transition disabled:opacity-30 cursor-pointer" title="Move Down in Carousel"><ChevronDown className="w-3.5 h-3.5" /></button>
                    </div>
                  </Td>
                  <Td className="text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      <button onClick={() => setPreviewVideo(v)} className="p-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border border-purple-200 cursor-pointer" title="Preview Native Reel Player"><Eye className="w-3.5 h-3.5" /></button>
                      <button onClick={() => startEdit(v)} className="px-2.5 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border border-sky-200 text-[11px] font-black flex items-center gap-1 cursor-pointer"><Edit2 className="w-3.5 h-3.5" /> Edit</button>
                      <button onClick={() => removeVideo(v)} className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 cursor-pointer" title="Delete Reel"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && rows.length === 0 && <Empty title="No reels found" desc="Add your first Cloudinary video reel to populate the website carousel." />}
      </div>

      {previewVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" role="dialog" aria-modal="true" aria-label={`Preview: ${previewVideo.title}`}>
          <div className="relative w-full max-w-xl bg-[#161616] rounded-3xl p-6 border border-amber-500/30 shadow-2xl text-white space-y-4">
            <button onClick={() => setPreviewVideo(null)} className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-amber-400 hover:text-slate-950 text-white transition-colors cursor-pointer" aria-label="Close preview"><X className="w-5 h-5" /></button>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black uppercase">{previewVideo.category}</span>
              {previewVideo.cloudinaryPublicId && <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30 text-[10px] font-mono font-bold">Public ID: {previewVideo.cloudinaryPublicId}</span>}
              <ApexLogo className="h-5" whiteText />
            </div>
            <h3 className="font-heading font-black text-xl text-white">{previewVideo.title}</h3>
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-[#06070B] border border-white/10 shadow-xl relative flex items-center justify-center">
              <video src={previewVideo.videoUrl || (previewVideo.cloudinaryPublicId ? `https://res.cloudinary.com/nbcbpuql/video/upload/${previewVideo.cloudinaryPublicId}.mp4` : '')} poster={previewVideo.thumbnailUrl || previewVideo.thumbnail} controls autoPlay playsInline className="w-full h-full object-cover">
                Your browser does not support video playback.
              </video>
            </div>
            <p className="text-xs text-slate-300 font-medium">{previewVideo.description}</p>
            <div className="pt-2 flex justify-between items-center">
              <span className="text-xs text-amber-400 font-mono font-bold">▶ {previewVideo.duration || '15s'} • {(Number(previewVideo.views ?? previewVideo.viewsCount) || 0).toLocaleString()} views</span>
              <button onClick={() => setPreviewVideo(null)} className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-black text-xs cursor-pointer">Close Preview</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
