'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, Search, Trophy, ChevronUp, ChevronDown, Edit2, Trash2, X, Eye, Crown, Play, CheckCircle2, Clock, Film, Star, Building2 } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { StatCard, Th, Td, Empty, FormCard, Field, Label, TextArea, Check } from '@/components/admin/admin-ui';

interface AwardRow {
  _id?: string;
  id?: string;
  title?: string;
  description?: string;
  year?: string;
  organization?: string;
  category?: string;
  imageUrl?: string;
  imagePublicId?: string;
  imageAlt?: string;
  videoUrl?: string;
  videoPublicId?: string;
  videoThumbnail?: string;
  externalLink?: string;
  featured?: boolean;
  displayOrder?: number;
  order?: number;
  status?: string;
  isActive?: boolean;
  published?: boolean;
}

export function AwardsAdmin() {
  const [rows, setRows] = useState<AwardRow[]>([]);
  const [kpis, setKpis] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [editing, setEditing] = useState<AwardRow | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [previewAward, setPreviewAward] = useState<AwardRow | null>(null);
  const [draft, setDraft] = useState<Record<string, unknown>>({});
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (type === 'video') {
      if (!/\.(mp4|webm|mov)$/i.test(file.name)) { alert('Invalid video format. Please select .mp4, .webm, or .mov.'); return; }
    } else {
      if (!/\.(jpg|jpeg|png|webp)$/i.test(file.name)) { alert('Invalid image format. Please select .jpg, .png, or .webp.'); return; }
    }
    setUploadingMedia(true);
    setUploadProgress(30);
    try {
      const formData = new FormData();
      formData.append(type, file);
      setUploadProgress(60);
      const res = await adminApi.uploadAwardMedia(formData);
      setUploadProgress(100);
      if (res.success) {
        if (type === 'image') {
          setDraft((prev) => ({ ...prev, imageUrl: res.imageUrl || prev.imageUrl, imagePublicId: (res.imagePublicId as string) || (prev.imagePublicId as string) || '' }));
        } else {
          setDraft((prev) => ({ ...prev, videoUrl: (res.videoUrl as string) || (prev.videoUrl as string), videoPublicId: (res.videoPublicId as string) || (prev.videoPublicId as string) || '', videoThumbnail: (res.videoThumbnail as string) || (prev.videoThumbnail as string) || '' }));
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
    const res = await adminApi.awards(params);
    setRows((res.data as AwardRow[]) || []);
    setKpis((res.kpis as Record<string, number>) || {});
    setLoading(false);
  }, [search, statusFilter]);

  useEffect(() => {
    const t = setTimeout(refresh, 300);
    return () => clearTimeout(t);
  }, [refresh]);

  const startCreate = () => {
    setEditing(null);
    setIsCreating(true);
    setDraft({
      title: '', description: '', year: new Date().getFullYear().toString(), dateAwarded: '',
      organization: '', category: 'Recognition', imageUrl: '', imagePublicId: '', imageAlt: '',
      videoUrl: '', videoPublicId: '', videoThumbnail: '', externalLink: '',
      featured: false, displayOrder: rows.length + 1, status: 'active',
    });
  };

  const startEdit = (a: AwardRow) => {
    setEditing(a);
    setIsCreating(false);
    setDraft({
      title: a.title || '', description: a.description || '', year: a.year || '',
      dateAwarded: a.year ? String(a.year).slice(0, 10) : '',
      organization: a.organization || '', category: a.category || 'Recognition',
      imageUrl: a.imageUrl || '', imagePublicId: a.imagePublicId || '', imageAlt: a.imageAlt || '',
      videoUrl: a.videoUrl || '', videoPublicId: a.videoPublicId || '', videoThumbnail: a.videoThumbnail || '',
      externalLink: a.externalLink || '', featured: !!a.featured,
      displayOrder: a.displayOrder ?? a.order ?? rows.indexOf(a) + 1,
      status: a.status || (a.isActive !== false && a.published !== false ? 'active' : 'inactive'),
    });
  };

  const saveAward = async () => {
    if (!(draft.title as string)?.trim()) { alert('Award title is required.'); return; }
    const payload = {
      ...draft,
      title: (draft.title as string).trim(),
      year: ((draft.year as string) || '').toString().trim(),
      displayOrder: Number(draft.displayOrder) || 0,
      featured: !!draft.featured,
      status: draft.status === 'inactive' ? 'inactive' : 'active',
    };
    let res;
    if (isCreating) res = await adminApi.createAward(payload);
    else res = await adminApi.updateAward(editing?._id || editing?.id || '', payload);
    if (res.success) { setIsCreating(false); setEditing(null); refresh(); }
    else alert((res.message as string) || 'Failed to save award');
  };

  const toggleFeatured = async (a: AwardRow) => {
    const res = await adminApi.quickToggleFeaturedAward(a._id || a.id || '', !a.featured);
    if (res.success) refresh(); else alert((res.message as string) || 'Failed to toggle featured');
  };

  const toggleStatus = async (a: AwardRow) => {
    const next = a.status === 'active' || (a.isActive !== false && a.published !== false) ? 'inactive' : 'active';
    const res = await adminApi.quickToggleStatusAward(a._id || a.id || '', next);
    if (res.success) refresh(); else alert((res.message as string) || 'Failed to update status');
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
    const res = await adminApi.bulkReorderAwards(items);
    if (res.success) refresh();
  };

  const removeAward = async (a: AwardRow) => {
    if (!confirm(`Delete award "${a.title}"? Its Cloudinary media will also be removed.`)) return;
    const res = await adminApi.deleteAward(a._id || a.id || '');
    if (res.success) refresh(); else alert((res.message as string) || 'Failed to delete award');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl tracking-tight">Awards &amp; Achievements</h1>
          <p className="text-xs font-bold text-neutral-500 dark:text-[#B5B5B5]">Manage Cloudinary-hosted award images, videos, milestones, display order and visibility.</p>
        </div>
        <button onClick={startCreate} className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl btn-pink text-white font-black text-xs shadow-lg cursor-pointer">
          <Plus className="w-4 h-4" /> Add New Award
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard label="Total Awards" value={kpis.totalAwards || rows.length} icon={<Trophy className="w-4 h-4" />} tint="#FF005C" />
        <StatCard label="Active / Visible" value={kpis.activeAwards || 0} icon={<CheckCircle2 className="w-4 h-4" />} tint="#10B981" />
        <StatCard label="Inactive / Draft" value={kpis.inactiveAwards || 0} icon={<Clock className="w-4 h-4" />} tint="#64748B" />
        <StatCard label="Featured" value={kpis.featuredAwards || 0} icon={<Crown className="w-4 h-4" />} tint="#F59E0B" />
        <StatCard label="With Video" value={kpis.videoAwards || 0} icon={<Film className="w-4 h-4" />} tint="#6C3CE0" />
      </div>

      <div className="rounded-3xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400" />
          <input placeholder="Search awards by title, org, year, Cloudinary ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent outline-none text-xs font-bold w-full text-neutral-900 dark:text-white" />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
          {[
            { id: '', label: 'All Awards' },
            { id: 'published', label: 'Active / Visible' },
            { id: 'draft', label: 'Inactive / Draft' },
            { id: 'featured', label: 'Featured' },
          ].map((pill) => (
            <button key={pill.id} onClick={() => setStatusFilter(pill.id)} className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition whitespace-nowrap cursor-pointer ${statusFilter === pill.id ? 'bg-brand-pink text-white shadow-sm' : 'bg-neutral-100 dark:bg-[#262626] text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'}`}>
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {(isCreating || editing) && (
        <FormCard title={isCreating ? 'Add New Award / Achievement (Cloudinary)' : `Edit Award: ${editing?.title}`} onClose={() => { setIsCreating(false); setEditing(null); }} onSave={saveAward}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#292929] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 dark:text-white">📤 Upload Media to Cloudinary</span>
                  {uploadingMedia && <span className="text-[10px] font-bold text-amber-500 animate-pulse">Uploading… {uploadProgress}%</span>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300">🖼️ Award Image (.jpg, .png, .webp)</label>
                    <label className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-brand-pink/30 bg-rose-50/30 dark:bg-[#2A0A17]/20 hover:border-brand-pink cursor-pointer transition">
                      <span className="text-xs font-black text-brand-pink">{draft.imagePublicId ? 'Replace Award Image' : 'Click to Upload Image'}</span>
                      <span className="text-[10px] text-slate-400 font-medium mt-0.5">Cloudinary • Max 10MB</span>
                      <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => handleMediaUpload(e, 'image')} className="hidden" />
                    </label>
                    {Boolean(draft.imagePublicId) && <p className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 break-all">✓ {draft.imagePublicId as string}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300">🎬 Award Video (.mp4, .webm, .mov — optional)</label>
                    <label className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-amber-500/30 bg-amber-50/30 dark:bg-amber-950/20 hover:border-amber-500 cursor-pointer transition">
                      <span className="text-xs font-black text-amber-600 dark:text-amber-400">{draft.videoPublicId ? 'Replace Video' : 'Click to Upload Video'}</span>
                      <span className="text-[10px] text-slate-400 font-medium mt-0.5">Cloudinary • Max 100MB</span>
                      <input type="file" accept="video/mp4,video/webm,video/quicktime" onChange={(e) => handleMediaUpload(e, 'video')} className="hidden" />
                    </label>
                    {Boolean(draft.videoPublicId) && <p className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 break-all">✓ {draft.videoPublicId as string}</p>}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Award Title *" value={draft.title as string} onChange={(v) => setDraft({ ...draft, title: v })} placeholder="e.g. Best Emerging Exam Voucher Platform" />
                <Field label="Awarding Organization" value={draft.organization as string} onChange={(v) => setDraft({ ...draft, organization: v })} placeholder="e.g. Pearson PTE Official" />
                <Field label="Award Year / Date" value={draft.year as string} onChange={(v) => setDraft({ ...draft, year: v })} placeholder="e.g. 2025 or March 2025" />
                <Field label="Category" value={draft.category as string} onChange={(v) => setDraft({ ...draft, category: v })} placeholder="Recognition / Award / Certificate" />
                <Field label="Display Order (Rank)" type="number" value={draft.displayOrder as number} onChange={(v) => setDraft({ ...draft, displayOrder: v })} />
                <Field label="Image Alt Text (Accessibility)" value={draft.imageAlt as string} onChange={(v) => setDraft({ ...draft, imageAlt: v })} placeholder="Describe the award image" />
              </div>

              <TextArea label="Short Description" value={draft.description as string} onChange={(v) => setDraft({ ...draft, description: v })} rows={3} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Cloudinary Image Public ID" value={draft.imagePublicId as string} onChange={(v) => setDraft({ ...draft, imagePublicId: v })} placeholder="apex_awards/images/..." />
                <Field label="Cloudinary Video Public ID" value={draft.videoPublicId as string} onChange={(v) => setDraft({ ...draft, videoPublicId: v })} placeholder="apex_awards/videos/..." />
                <Field label="Image URL (auto-built from Public ID)" value={draft.imageUrl as string} onChange={(v) => setDraft({ ...draft, imageUrl: v })} placeholder="https://res.cloudinary.com/..." />
                <Field label="External Link (optional)" value={draft.externalLink as string} onChange={(v) => setDraft({ ...draft, externalLink: v })} placeholder="https://..." />
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Check label="Feature this award (spotlight on public page)" checked={!!draft.featured} onChange={(v) => setDraft({ ...draft, featured: v })} />
                <Check label="Active & Visible on Public Website" checked={draft.status !== 'inactive'} onChange={(v) => setDraft({ ...draft, status: v ? 'active' : 'inactive' })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Live Award Card Preview</Label>
              <div className="rounded-2xl overflow-hidden bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929]">
                <div className="relative aspect-4/3 bg-neutral-100 dark:bg-[#0E0E0E]">
                  {(draft.imageUrl || draft.imagePublicId) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={(draft.imageUrl as string) || `https://res.cloudinary.com/nbcbpuql/image/upload/c_limit,f_auto,q_auto,w_800/${draft.imagePublicId as string}`} alt="Award preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-300 dark:text-neutral-600"><Trophy className="w-10 h-10" /></div>
                  )}
                  {(draft.videoUrl || draft.videoPublicId) ? (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="w-12 h-12 rounded-full bg-white/90 dark:bg-brand-pink flex items-center justify-center shadow-xl">
                        <Play className="w-5 h-5 text-brand-pink fill-brand-pink dark:text-white dark:fill-white ml-0.5" />
                      </span>
                    </span>
                  ) : null}
                  <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-pink text-white text-[10px] font-black uppercase tracking-wider">
                    {draft.featured ? '★ Featured' : ((draft.category as string) || 'Recognition')}
                  </span>
                  {draft.year ? <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/55 text-white text-[11px] font-black">{draft.year as string}</span> : null}
                </div>
                <div className="p-4 space-y-2">
                  <h4 className="font-heading font-black text-sm line-clamp-1">{(draft.title as string) || 'Untitled Award'}</h4>
                  {draft.organization ? <p className="text-[11px] font-bold text-neutral-500 dark:text-[#B5B5B5] line-clamp-1"><Building2 className="w-3 h-3 inline text-brand-pink mr-1" />{draft.organization as string}</p> : null}
                  <p className="text-[11px] font-medium text-neutral-500 dark:text-[#B5B5B5] line-clamp-2">{(draft.description as string) || 'Description preview…'}</p>
                  <div className="pt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg btn-pink text-white text-[10px] font-black">View Details →</div>
                </div>
              </div>
              <p className="text-[10px] font-bold text-neutral-400">{draft.status === 'inactive' ? '🔒 Hidden from visitors — draft state.' : '✅ Visible on the public Awards page.'}</p>
            </div>
          </div>
        </FormCard>
      )}

      <div className="rounded-3xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-neutral-50 dark:bg-[#0E0E0E]">
              <tr>
                <Th>Order</Th>
                <Th>Award</Th>
                <Th>Category / Org</Th>
                <Th>Year</Th>
                <Th>Media</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={7} className="p-4"><div className="h-10 bg-neutral-100 dark:bg-[#292929] rounded-xl animate-pulse" /></td></tr>}
              {!loading && rows.map((a, index) => (
                <tr key={a._id || a.id} className="border-t border-[#EAEAEA] dark:border-[#292929] hover:bg-neutral-50 dark:hover:bg-[#131313] transition-colors">
                  <Td>
                    <div className="flex items-center gap-1">
                      <button type="button" disabled={index === 0} onClick={() => moveOrder(index, -1)} className="p-1 rounded-lg bg-neutral-100 dark:bg-[#222] hover:bg-amber-400 hover:text-slate-950 transition disabled:opacity-30 cursor-pointer" title="Move Up"><ChevronUp className="w-3.5 h-3.5" /></button>
                      <span className="font-mono font-black text-xs px-1.5">{a.displayOrder ?? index + 1}</span>
                      <button type="button" disabled={index === rows.length - 1} onClick={() => moveOrder(index, 1)} className="p-1 rounded-lg bg-neutral-100 dark:bg-[#222] hover:bg-amber-400 hover:text-slate-950 transition disabled:opacity-30 cursor-pointer" title="Move Down"><ChevronDown className="w-3.5 h-3.5" /></button>
                    </div>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-neutral-100 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] shrink-0">
                        {a.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={a.imageUrl} alt={a.title} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-300 dark:text-neutral-600"><Trophy className="w-5 h-5" /></div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-black text-sm text-neutral-900 dark:text-white line-clamp-1 flex items-center gap-1.5">
                          {a.title}
                          {a.featured && <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />}
                        </div>
                        <div className="text-[11px] font-bold text-neutral-500 dark:text-[#B5B5B5] line-clamp-1">{a.description || 'No description'}</div>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <div className="flex flex-col gap-0.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FFF0F5] dark:bg-[#2A0A17] text-brand-pink text-[10px] font-black w-fit">{a.category || 'Recognition'}</span>
                      {a.organization && <span className="text-[11px] font-bold text-neutral-500 dark:text-[#B5B5B5] line-clamp-1">🏢 {a.organization}</span>}
                    </div>
                  </Td>
                  <Td><span className="font-mono font-black text-xs">{a.year || '—'}</span></Td>
                  <Td>
                    <div className="flex flex-col gap-0.5">
                      {a.imagePublicId && <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 line-clamp-1">🖼 Cloud</span>}
                      {a.videoUrl || a.videoPublicId ? <span className="inline-flex items-center gap-1 w-fit px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-[10px] font-black"><Film className="w-2.5 h-2.5" /> Video</span> : <span className="text-[10px] text-neutral-400">No video</span>}
                    </div>
                  </Td>
                  <Td>
                    <button onClick={() => toggleStatus(a)} className={`px-2.5 py-1 rounded-lg text-[10px] font-black border cursor-pointer transition ${a.status === 'inactive' ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400' : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400'}`}>
                      {a.status === 'inactive' ? 'Inactive' : 'Active'}
                    </button>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1.5 justify-end">
                      <button type="button" onClick={() => setPreviewAward(a)} className="p-2 rounded-lg bg-neutral-100 dark:bg-[#222] hover:bg-sky-100 hover:text-sky-700 transition cursor-pointer" title="Preview public card"><Eye className="w-3.5 h-3.5" /></button>
                      <button type="button" onClick={() => startEdit(a)} className="p-2 rounded-lg bg-neutral-100 dark:bg-[#222] hover:bg-amber-100 hover:text-amber-700 transition cursor-pointer" title="Edit award"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button type="button" onClick={() => toggleFeatured(a)} className={`p-2 rounded-lg transition cursor-pointer ${a.featured ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400' : 'bg-neutral-100 dark:bg-[#222] hover:bg-amber-100 hover:text-amber-700'}`} title={a.featured ? 'Remove from featured spotlight' : 'Feature this award'}><Star className={`w-3.5 h-3.5 ${a.featured ? 'fill-amber-500 text-amber-500' : ''}`} /></button>
                      <button type="button" onClick={() => removeAward(a)} className="p-2 rounded-lg bg-neutral-100 dark:bg-[#222] hover:bg-rose-100 hover:text-rose-600 transition cursor-pointer" title="Delete award"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {loading && rows.length === 0 && <div className="py-12 text-center text-xs font-bold text-neutral-400 animate-pulse">Loading awards…</div>}
        {!loading && rows.length === 0 && <div className="py-10"><Empty title="No awards found" desc="Add your first award or clear the search filters." /></div>}
      </div>

      {previewAward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md" onClick={() => setPreviewAward(null)} role="dialog" aria-modal="true" aria-label={`Preview award: ${previewAward.title}`}>
          <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setPreviewAward(null)} aria-label="Close preview" className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-white/90 dark:bg-[#262626] text-neutral-700 dark:text-neutral-200 shadow-lg hover:bg-brand-pink hover:text-white transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
            <div className="relative aspect-4/3 overflow-hidden bg-neutral-100 dark:bg-[#0E0E0E]">
              {previewAward.imageUrl || previewAward.imagePublicId ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewAward.imageUrl || `https://res.cloudinary.com/nbcbpuql/image/upload/c_limit,f_auto,q_auto,w_800/${previewAward.imagePublicId}`} alt={previewAward.imageAlt || previewAward.title} className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-300 dark:text-neutral-600"><Trophy className="w-12 h-12" /></div>
              )}
              <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-black/10" aria-hidden="true" />
              {(previewAward.videoUrl || previewAward.videoPublicId) && (
                <span className="absolute inset-0 flex items-center justify-center"><span className="w-14 h-14 rounded-full bg-white/90 dark:bg-brand-pink shadow-xl flex items-center justify-center"><Play className="w-6 h-6 text-brand-pink fill-brand-pink dark:text-white dark:fill-white ml-0.5" /></span></span>
              )}
              <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-pink text-white text-[10px] font-black uppercase tracking-wider">
                {previewAward.featured ? <Star className="w-3 h-3 fill-current" /> : null}
                {previewAward.featured ? 'Featured' : previewAward.category || 'Recognition'}
              </span>
              {previewAward.year && <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/55 text-white text-[11px] font-black">{previewAward.year}</span>}
            </div>
            <div className="p-5 sm:p-6 space-y-3">
              <h3 className="font-heading font-black text-xl leading-tight text-neutral-900 dark:text-white">{previewAward.title || 'Untitled Award'}</h3>
              {previewAward.organization && <p className="text-xs font-bold text-neutral-500 dark:text-[#B5B5B5] flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-brand-pink" />{previewAward.organization}</p>}
              <p className="text-xs font-medium text-neutral-500 dark:text-[#B5B5B5] leading-relaxed whitespace-pre-wrap">{previewAward.description || 'No description provided.'}</p>
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFF0F5] dark:bg-[#2A0A17] text-xs font-black text-brand-pink border border-brand-pink/20"><Play className="w-3 h-3" /> Video</span>
                <span className="text-[10px] font-bold text-neutral-400">{previewAward.status === 'inactive' ? '🔒 Hidden from visitors' : '✅ Visible on public Awards page'}</span>
              </div>
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <button type="button" onClick={() => setPreviewAward(null)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl btn-pink text-white text-xs font-black cursor-pointer">Close Preview</button>
                <button type="button" onClick={() => { startEdit(previewAward); setPreviewAward(null); }} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-100 dark:bg-[#262626] text-neutral-700 dark:text-neutral-200 text-xs font-black border border-[#EAEAEA] dark:border-[#292929] hover:border-brand-pink transition-colors cursor-pointer"><Edit2 className="w-3.5 h-3.5" /> Edit Award</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}