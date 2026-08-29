import React, { useEffect, useState } from 'react';
import {
  Plus, Search, Trophy, ChevronUp, ChevronDown, Edit2, Trash2, X, Eye, Crown, Star,
  Play, CheckCircle2, Clock, Film, Building2, Save,
} from 'lucide-react';
import { adminApi } from '../lib/api';

// ── Small shared UI helpers (matching AdminConsole conventions) ────────────

const StatCard = ({ label, value, icon, tint = '#FF005C' }) => (
  <div className="rounded-3xl p-5 bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm flex flex-col justify-between">
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white" style={{ background: tint }}>
          {icon}
        </div>
      </div>
      <div className="text-xs font-bold text-neutral-500 dark:text-[#B5B5B5]">{label}</div>
      <div className="font-heading font-black text-2xl sm:text-3xl tabular-nums mt-1">{value}</div>
    </div>
  </div>
);

const Empty = ({ title, desc }) => (
  <div className="text-center py-10 rounded-2xl border border-dashed border-[#EAEAEA] dark:border-[#292929]">
    <div className="font-black text-neutral-900 dark:text-white">{title}</div>
    <div className="text-xs font-bold text-neutral-500 dark:text-[#B5B5B5] mt-1">{desc}</div>
  </div>
);

function Th({ children }) {
  return <th className="text-[10px] font-black uppercase tracking-wider px-4 py-3 text-left text-neutral-500 dark:text-neutral-400">{children}</th>;
}
function Td({ children, className = '' }) {
  return <td className={`px-4 py-3 align-top text-neutral-700 dark:text-neutral-200 ${className}`}>{children}</td>;
}
const Label = ({ children }) => <span className="block text-[11px] font-black uppercase tracking-wider text-neutral-500 dark:text-[#B5B5B5] mb-2">{children}</span>;

function Field({ label, type = 'text', value, onChange, required, placeholder }) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <input type={type} value={value ?? ''} required={required} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-sm font-bold focus:outline-none focus:border-brand-pink transition"
      />
    </label>
  );
}
function TextArea({ label, value, onChange, rows = 3 }) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <textarea rows={rows} value={value ?? ''} onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-sm font-bold focus:outline-none focus:border-brand-pink transition whitespace-pre-wrap"
      />
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
function FormCard({ title, onClose, onSave, children }) {
  return (
    <div className="mb-6 rounded-3xl p-6 bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-black text-lg">{title}</h3>
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="px-3 py-2 rounded-xl bg-neutral-100 dark:bg-[#262626] text-xs font-black text-neutral-600 dark:text-neutral-300 flex items-center gap-1.5">
            <X className="w-4 h-4" /> Cancel
          </button>
          <button onClick={onSave} className="px-4 py-2 rounded-xl btn-pink text-white font-black text-xs flex items-center gap-1.5 shadow-lg">
            <Save className="w-4 h-4" /> Save Changes
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}
export default function AwardsAdmin() {
  const [rows, setRows] = useState([]);
  const [kpis, setKpis] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [editing, setEditing] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [previewAward, setPreviewAward] = useState(null);
  const [draft, setDraft] = useState({});
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const refresh = async () => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    const res = await adminApi.awards(params);
    setRows(res.data || []);
    setKpis(res.kpis || {});
    setLoading(false);
  };

  useEffect(() => {
    const t = setTimeout(refresh, 300);
    return () => clearTimeout(t);
  }, [search, statusFilter]);

  const handleMediaUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (type === 'video') {
      if (!/\.(mp4|webm|mov)$/i.test(file.name)) { alert('Invalid video format. Please select .mp4, .webm, or .mov.'); return; }
    } else if (type === 'image') {
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
          setDraft((prev) => ({ ...prev, imageUrl: res.imageUrl || prev.imageUrl, imagePublicId: res.imagePublicId || prev.imagePublicId || '' }));
        } else if (type === 'video') {
          setDraft((prev) => ({ ...prev, videoUrl: res.videoUrl || prev.videoUrl, videoPublicId: res.videoPublicId || prev.videoPublicId || '', videoThumbnail: res.videoThumbnail || prev.videoThumbnail || '' }));
        }
      } else {
        alert(res.message || 'File upload failed');
      }
    } catch (err) {
      alert('Upload error: ' + (err.message || 'Server error during upload'));
    } finally {
      setUploadingMedia(false);
      setUploadProgress(0);
    }
  };

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

  const startEdit = (a) => {
    setEditing(a);
    setIsCreating(false);
    setDraft({
      title: a.title || '', description: a.description || '', year: a.year || '',
      dateAwarded: a.dateAwarded ? String(a.dateAwarded).slice(0, 10) : '',
      organization: a.organization || '', category: a.category || 'Recognition',
      imageUrl: a.imageUrl || '', imagePublicId: a.imagePublicId || '', imageAlt: a.imageAlt || '',
      videoUrl: a.videoUrl || '', videoPublicId: a.videoPublicId || '', videoThumbnail: a.videoThumbnail || '',
      externalLink: a.externalLink || '', featured: !!a.featured,
      displayOrder: a.displayOrder ?? a.order ?? rows.indexOf(a) + 1,
      status: a.status || (a.isActive !== false && a.published !== false ? 'active' : 'inactive'),
    });
  };

  const saveAward = async () => {
    if (!draft.title.trim()) { alert('Award title is required.'); return; }
    const payload = {
      ...draft,
      title: draft.title.trim(),
      year: (draft.year || '').toString().trim(),
      displayOrder: Number(draft.displayOrder) || 0,
      featured: !!draft.featured,
      status: draft.status === 'inactive' ? 'inactive' : 'active',
    };
    let res;
    if (isCreating) res = await adminApi.createAward(payload);
    else res = await adminApi.updateAward(editing?._id || editing?.id, payload);
    if (res.success) { setIsCreating(false); setEditing(null); refresh(); }
    else alert(res.message || 'Failed to save award');
  };

  const toggleFeatured = async (a) => {
    const res = await adminApi.quickToggleFeaturedAward(a._id || a.id, !a.featured);
    if (res.success) refresh(); else alert(res.message || 'Failed to toggle featured');
  };

  const toggleStatus = async (a) => {
    const next = a.status === 'active' || (a.isActive !== false && a.published !== false) ? 'inactive' : 'active';
    const res = await adminApi.quickToggleStatusAward(a._id || a.id, next);
    if (res.success) refresh(); else alert(res.message || 'Failed to update status');
  };

  const moveOrder = async (index, direction) => {
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

  const removeAward = async (a) => {
    if (!confirm(`Delete award "${a.title}"? Its Cloudinary media will also be removed.`)) return;
    const res = await adminApi.deleteAward(a._id || a.id);
    if (res.success) refresh(); else alert(res.message || 'Failed to delete award');
  };
return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl tracking-tight">Awards &amp; Achievements</h1>
          <p className="text-xs font-bold text-neutral-500 dark:text-[#B5B5B5]">
            Manage Cloudinary-hosted award images, videos, milestones, display order and visibility.
          </p>
        </div>
        <button onClick={startCreate} className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl btn-pink text-white font-black text-xs shadow-lg cursor-pointer">
          <Plus className="w-4 h-4" /> Add New Award
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard label="Total Awards" value={kpis.totalAwards || rows.length} icon={<Trophy className="w-4 h-4" />} tint="#FF005C" />
        <StatCard label="Active / Visible" value={kpis.activeAwards || 0} icon={<CheckCircle2 className="w-4 h-4" />} tint="#10B981" />
        <StatCard label="Inactive / Draft" value={kpis.inactiveAwards || 0} icon={<Clock className="w-4 h-4" />} tint="#64748B" />
        <StatCard label="Featured" value={kpis.featuredAwards || 0} icon={<Crown className="w-4 h-4" />} tint="#F59E0B" />
        <StatCard label="With Video" value={kpis.videoAwards || 0} icon={<Film className="w-4 h-4" />} tint="#6C3CE0" />
      </div>

      {/* Search & Filters */}
      <div className="rounded-3xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400" />
          <input
            placeholder="Search awards by title, org, year, Cloudinary ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-xs font-bold w-full text-neutral-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
          {[
            { id: '', label: 'All Awards' },
            { id: 'published', label: 'Active / Visible' },
            { id: 'draft', label: 'Inactive / Draft' },
            { id: 'featured', label: 'Featured' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setStatusFilter(pill.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition whitespace-nowrap cursor-pointer ${
                statusFilter === pill.id ? 'bg-brand-pink text-white shadow-sm' : 'bg-neutral-100 dark:bg-[#262626] text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>
{/* Add / Edit Modal */}
      {(isCreating || editing) && (
        <FormCard
          title={isCreating ? '🏆 Add New Award / Achievement (Cloudinary)' : `✏️ Edit Award: ${editing?.title}`}
          onClose={() => { setIsCreating(false); setEditing(null); }}
          onSave={saveAward}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {/* Media Upload */}
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
                    {draft.imagePublicId && <p className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 break-all">✓ {draft.imagePublicId}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300">🎬 Award Video (.mp4, .webm, .mov — optional)</label>
                    <label className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-amber-500/30 bg-amber-50/30 dark:bg-amber-950/20 hover:border-amber-500 cursor-pointer transition">
                      <span className="text-xs font-black text-amber-600 dark:text-amber-400">{draft.videoPublicId ? 'Replace Video' : 'Click to Upload Video'}</span>
                      <span className="text-[10px] text-slate-400 font-medium mt-0.5">Cloudinary • Max 100MB</span>
                      <input type="file" accept="video/mp4,video/webm,video/quicktime" onChange={(e) => handleMediaUpload(e, 'video')} className="hidden" />
                    </label>
                    {draft.videoPublicId && <p className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 break-all">✓ {draft.videoPublicId}</p>}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Award Title *" value={draft.title} onChange={(v) => setDraft({ ...draft, title: v })} placeholder="e.g. Best Emerging Exam Voucher Platform" />
                <Field label="Awarding Organization" value={draft.organization} onChange={(v) => setDraft({ ...draft, organization: v })} placeholder="e.g. Pearson PTE Official" />
                <Field label="Award Year / Date" value={draft.year} onChange={(v) => setDraft({ ...draft, year: v })} placeholder="e.g. 2025 or March 2025" />
                <Field label="Category" value={draft.category} onChange={(v) => setDraft({ ...draft, category: v })} placeholder="Recognition / Award / Certificate" />
                <Field label="Display Order (Rank)" type="number" value={draft.displayOrder} onChange={(v) => setDraft({ ...draft, displayOrder: v })} />
                <Field label="Image Alt Text (Accessibility)" value={draft.imageAlt} onChange={(v) => setDraft({ ...draft, imageAlt: v })} placeholder="Describe the award image" />
              </div>

              <TextArea label="Short Description *" value={draft.description} onChange={(v) => setDraft({ ...draft, description: v })} rows={3} placeholder="What is this achievement and why does it matter?" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Cloudinary Image Public ID" value={draft.imagePublicId} onChange={(v) => setDraft({ ...draft, imagePublicId: v })} placeholder="apex_awards/images/..." />
                <Field label="Cloudinary Video Public ID" value={draft.videoPublicId} onChange={(v) => setDraft({ ...draft, videoPublicId: v })} placeholder="apex_awards/videos/..." />
                <Field label="Image URL (auto-built from Public ID)" value={draft.imageUrl} onChange={(v) => setDraft({ ...draft, imageUrl: v })} placeholder="https://res.cloudinary.com/..." />
                <Field label="External Link (optional)" value={draft.externalLink} onChange={(v) => setDraft({ ...draft, externalLink: v })} placeholder="https://..." />
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Check label="Feature this award (spotlight on public page)" checked={!!draft.featured} onChange={(v) => setDraft({ ...draft, featured: v })} />
                <Check label="Active & Visible on Public Website" checked={draft.status !== 'inactive'} onChange={(v) => setDraft({ ...draft, status: v ? 'active' : 'inactive' })} />
              </div>
            </div>
<div className="space-y-2">
              <Label>Live Award Card Preview</Label>
              <div className="rounded-2xl overflow-hidden bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] card-shadow">
                <div className="relative aspect-4/3 bg-neutral-100 dark:bg-[#0E0E0E]">
                  {draft.imageUrl || draft.imagePublicId ? (
                    <img src={draft.imageUrl || `https://res.cloudinary.com/nbcbpuql/image/upload/c_limit,f_auto,q_auto,w_800/${draft.imagePublicId}`} alt="Award preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-300 dark:text-neutral-600"><Trophy className="w-10 h-10" /></div>
                  )}
                  {draft.videoUrl || draft.videoPublicId ? (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="w-12 h-12 rounded-full bg-white/90 dark:bg-brand-pink flex items-center justify-center shadow-xl">
                        <Play className="w-5 h-5 text-brand-pink fill-brand-pink dark:text-white dark:fill-white ml-0.5" />
                      </span>
                    </span>
                  ) : null}
                  <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-pink text-white text-[10px] font-black uppercase tracking-wider">
                    {draft.featured ? '★ Featured' : draft.category || 'Recognition'}
                  </span>
                  {draft.year && <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/55 text-white text-[11px] font-black">{draft.year}</span>}
                </div>
                <div className="p-4 space-y-2">
                  <h4 className="font-heading font-black text-sm line-clamp-1">{draft.title || 'Untitled Award'}</h4>
                  {draft.organization && <p className="text-[11px] font-bold text-neutral-500 dark:text-[#B5B5B5] line-clamp-1"><Building2 className="w-3 h-3 inline text-brand-pink mr-1" />{draft.organization}</p>}
                  <p className="text-[11px] font-medium text-neutral-500 dark:text-[#B5B5B5] line-clamp-2">{draft.description || 'Description preview…'}</p>
                  <div className="pt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg btn-pink text-white text-[10px] font-black">View Details →</div>
                </div>
              </div>
              <p className="text-[10px] font-bold text-neutral-400">
                {draft.status === 'inactive' ? '🔒 Hidden from visitors — draft state.' : '✅ Visible on the public Awards page.'}
              </p>
            </div>
          </div>
        </FormCard>
      )}
{/* Awards Table */}
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
              {rows.map((a, index) => (
                <tr key={a._id || a.id} className="border-t border-[#EAEAEA] dark:border-[#292929] hover:bg-neutral-50 dark:hover:bg-[#131313] transition-colors">
                  <Td>
                    <div className="flex items-center gap-1">
                      <button type="button" disabled={index === 0} onClick={() => moveOrder(index, -1)} className="p-1 rounded-lg bg-neutral-100 dark:bg-[#222] hover:bg-amber-400 hover:text-slate-950 transition disabled:opacity-30 cursor-pointer" title="Move Up">
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-mono font-black text-xs px-1.5">{a.displayOrder ?? index + 1}</span>
                      <button type="button" disabled={index === rows.length - 1} onClick={() => moveOrder(index, 1)} className="p-1 rounded-lg bg-neutral-100 dark:bg-[#222] hover:bg-amber-400 hover:text-slate-950 transition disabled:opacity-30 cursor-pointer" title="Move Down">
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-neutral-100 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] shrink-0">
                        {a.imageUrl ? (
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
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FFF0F5] dark:bg-[#2A0A17] text-brand-pink text-[10px] font-black w-fit">
                        {a.category || 'Recognition'}
                      </span>
                      {a.organization && <span className="text-[11px] font-bold text-neutral-500 dark:text-[#B5B5B5] line-clamp-1">🏢 {a.organization}</span>}
                    </div>
                  </Td>
                  <Td><span className="font-mono font-black text-xs">{a.year || '—'}</span></Td>
<Td>
                    <div className="flex flex-col gap-0.5">
                      {a.imagePublicId && <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 line-clamp-1">🖼 Cloud</span>}
                      {a.videoUrl || a.videoPublicId ? (
                        <span className="inline-flex items-center gap-1 w-fit px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-[10px] font-black">
                          <Film className="w-2.5 h-2.5" /> Video
                        </span>
                      ) : (
                        <span className="text-[10px] text-neutral-400">No video</span>
                      )}
                    </div>
                  </Td>
                  <Td>
                    <button onClick={() => toggleStatus(a)} className={`px-2.5 py-1 rounded-lg text-[10px] font-black border cursor-pointer transition ${
                      a.status === 'inactive' ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400' : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400'
                    }`}>
                      {a.status === 'inactive' ? 'Inactive' : 'Active'}
                    </button>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1.5 justify-end">
                      <button
                        type="button"
                        onClick={() => setPreviewAward(a)}
                        className="p-2 rounded-lg bg-neutral-100 dark:bg-[#222] hover:bg-sky-100 hover:text-sky-700 transition cursor-pointer"
                        title="Preview public card"
                        aria-label={`Preview ${a.title}`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => startEdit(a)}
                        className="p-2 rounded-lg bg-neutral-100 dark:bg-[#222] hover:bg-amber-100 hover:text-amber-700 transition cursor-pointer"
                        title="Edit award"
                        aria-label={`Edit ${a.title}`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleFeatured(a)}
                        className={`p-2 rounded-lg transition cursor-pointer ${
                          a.featured
                            ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400'
                            : 'bg-neutral-100 dark:bg-[#222] hover:bg-amber-100 hover:text-amber-700'
                        }`}
                        title={a.featured ? 'Remove from featured spotlight' : 'Feature this award'}
                        aria-label={a.featured ? 'Unfeature award' : 'Feature award'}
                      >
                        <Star className={`w-3.5 h-3.5 ${a.featured ? 'fill-amber-500 text-amber-500' : ''}`} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeAward(a)}
                        className="p-2 rounded-lg bg-neutral-100 dark:bg-[#222] hover:bg-rose-100 hover:text-rose-600 transition cursor-pointer"
                        title="Delete award"
                        aria-label={`Delete ${a.title}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {loading && rows.length === 0 && (
          <div className="py-12 text-center text-xs font-bold text-neutral-400 animate-pulse">Loading awards…</div>
        )}
        {!loading && rows.length === 0 && (
          <div className="py-10">
            <Empty title="No awards found" desc="Add your first award or clear the search filters." />
          </div>
        )}
      </div>

      {/* ── Public Card Preview Modal ─────────────────────────────────────── */}
      {previewAward && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setPreviewAward(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`Preview award: ${previewAward.title}`}
        >
          <div
            className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-2xl animate-in slide-in-from-bottom-4 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewAward(null)}
              aria-label="Close preview"
              className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-white/90 dark:bg-[#262626] text-neutral-700 dark:text-neutral-200 shadow-lg hover:bg-brand-pink hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative aspect-4/3 overflow-hidden bg-neutral-100 dark:bg-[#0E0E0E]">
              {previewAward.imageUrl || previewAward.imagePublicId ? (
                <img
                  src={
                    previewAward.imageUrl ||
                    `https://res.cloudinary.com/nbcbpuql/image/upload/c_limit,f_auto,q_auto,w_800/${previewAward.imagePublicId}`
                  }
                  alt={previewAward.imageAlt || previewAward.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-300 dark:text-neutral-600">
                  <Trophy className="w-12 h-12" />
                </div>
              )}
              <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-black/10" />
              {(previewAward.videoUrl || previewAward.videoPublicId) && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="w-14 h-14 rounded-full bg-white/90 dark:bg-brand-pink shadow-xl flex items-center justify-center">
                    <Play className="w-6 h-6 text-brand-pink fill-brand-pink dark:text-white dark:fill-white ml-0.5" />
                  </span>
                </span>
              )}
              <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-pink text-white text-[10px] font-black uppercase tracking-wider">
                {previewAward.featured ? <Star className="w-3 h-3 fill-current" /> : null}
                {previewAward.featured ? 'Featured' : previewAward.category || 'Recognition'}
              </span>
              {previewAward.year && (
                <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/55 text-white text-[11px] font-black">
                  {previewAward.year}
                </span>
              )}
            </div>

            <div className="p-5 sm:p-6 space-y-3">
              <h3 className="font-heading font-black text-xl leading-tight text-neutral-900 dark:text-white">
                {previewAward.title || 'Untitled Award'}
              </h3>
              {previewAward.organization && (
                <p className="text-xs font-bold text-neutral-500 dark:text-[#B5B5B5] flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-brand-pink" />
                  {previewAward.organization}
                </p>
              )}
              <p className="text-xs font-medium text-neutral-500 dark:text-[#B5B5B5] leading-relaxed whitespace-pre-wrap">
                {previewAward.description || 'No description provided.'}
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFF0F5] dark:bg-[#2A0A17] text-xs font-black text-brand-pink border border-brand-pink/20">
                  <Play className="w-3 h-3" /> Video
                </span>
                <span className="text-[10px] font-bold text-neutral-400">
                  {previewAward.status === 'inactive' ? '🔒 Hidden from visitors' : '✅ Visible on public Awards page'}
                </span>
              </div>
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <button
                  type="button"
                  onClick={() => setPreviewAward(null)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl btn-pink text-white text-xs font-black cursor-pointer"
                >
                  Close Preview
                </button>
                <button
                  type="button"
                  onClick={() => { startEdit(previewAward); setPreviewAward(null); }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-100 dark:bg-[#262626] text-neutral-700 dark:text-neutral-200 text-xs font-black border border-[#EAEAEA] dark:border-[#292929] hover:border-brand-pink transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit Award
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}