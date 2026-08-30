'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Search, Plus, Edit2, Trash2, Copy, RefreshCw, GripVertical, ChevronUp, ChevronDown,
  Package, CheckCircle2, X, AlertTriangle, Clock, Ticket, AlertOctagon, Image as ImageIcon,
} from 'lucide-react';
import { adminApi, formatPrice } from '@/lib/api';
import { StatCard, Pill, Th, Td, Empty, FormCard, Field, TextArea, Check, Label } from '@/components/admin/admin-ui';

interface AdminProduct {
  _id: string;
  name?: string;
  provider?: string;
  providerShortName?: string;
  brand?: string;
  category?: string;
  shortDescription?: string;
  description?: string;
  logo?: string;
  image?: string;
  imagePublicId?: string;
  originalPrice?: number;
  sellingPrice?: number;
  validityDays?: number;
  validityMonths?: number;
  badge?: string;
  badgeEnabled?: boolean;
  badges?: string[];
  officialWebsiteUrl?: string;
  officialProductUrl?: string;
  sku?: string;
  productCode?: string;
  stockType?: string;
  deliveryType?: string;
  comingSoon?: boolean;
  featured?: boolean;
  active?: boolean;
  displayOrder?: number;
  seoTitle?: string;
  seoDescription?: string;
  slug?: string;
  inclusions?: string[] | string;
  redemptionSteps?: string[] | string;
  cta?: string;
  availableVouchers?: number | null;
  stockStatus?: string;
  lowStockThreshold?: number;
  archived?: boolean;
  durationOptions?: Array<{ key: string; label: string; sellingPrice: number; originalPrice: number; validityDays: number; enabled: boolean }>;
}

const DURATION_KEYS = [
  { key: '1-week', label: '1 Week', defaultDays: 7 },
  { key: '1-month', label: '1 Month', defaultDays: 30 },
  { key: '3-months', label: '3 Months', defaultDays: 90 },
];

const LOGO_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const LOGO_MAX_SIZE = 5 * 1024 * 1024;

function ProductLogoUploader({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(value || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(value || '');
  }, [value]);

  const handleFile = (file?: File) => {
    if (!file || uploading) return;
    setError('');
    if (!LOGO_ALLOWED_TYPES.includes(file.type)) {
      setError('Unsupported format. Use JPG, PNG, or WebP.');
      return;
    }
    if (file.size > LOGO_MAX_SIZE) {
      setError('File too large. Maximum size is 5MB.');
      return;
    }
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    setProgress(0);
    adminApi.uploadProductLogo(file).then((res) => {
      setUploading(false);
      if (res.success) {
        onChange(res.url as string);
        setPreview(res.url as string);
      } else {
        setError((res.message as string) || 'Upload failed');
      }
    });
  };

  return (
    <div>
      <Label>Product Logo</Label>
      <div className="flex items-center gap-3">
        <div className="w-16 h-16 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] flex items-center justify-center overflow-hidden shrink-0">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Logo preview" className="w-full h-full object-contain" />
          ) : (
            <ImageIcon className="w-6 h-6 text-neutral-300" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          {uploading ? (
            <div>
              <div className="text-xs font-bold text-neutral-500 mb-1">Uploading... {progress}%</div>
              <div className="h-2 rounded-full bg-neutral-200 dark:bg-[#292929] overflow-hidden">
                <div className="h-full bg-brand-pink transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => fileInputRef.current?.click()} className="px-3 py-2 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border border-sky-200 text-[11px] font-black">
                {preview ? 'Replace Logo' : 'Upload Logo'}
              </button>
              {preview && (
                <button type="button" onClick={() => { onChange(''); setPreview(''); setError(''); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 text-[11px] font-black">
                  Remove
                </button>
              )}
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
          {error && <p className="text-[11px] font-bold text-rose-500 mt-1.5">{error}</p>}
        </div>
      </div>
    </div>
  );
}

function ProductImageUploader({ value, onChange }: { value: string; onChange: (url: string, publicId?: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(value || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(value || '');
  }, [value]);

  const handleFile = (file?: File) => {
    if (!file || uploading) return;
    setError('');
    if (!LOGO_ALLOWED_TYPES.includes(file.type)) {
      setError('Unsupported format. Use JPG, PNG, or WebP.');
      return;
    }
    if (file.size > LOGO_MAX_SIZE) {
      setError('File too large. Maximum size is 5MB.');
      return;
    }
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    adminApi.uploadProductImage(file).then((res) => {
      setUploading(false);
      if (res.success) {
        onChange(res.url as string, (res.publicId as string) || '');
        setPreview(res.url as string);
      } else {
        setError((res.message as string) || 'Upload failed');
      }
    });
  };

  return (
    <div>
      <Label>Product Image</Label>
      <div className="flex items-center gap-3">
        <div className="w-16 h-16 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] flex items-center justify-center overflow-hidden shrink-0">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Product image preview" className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="w-6 h-6 text-neutral-300" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          {uploading ? (
            <div className="text-xs font-bold text-neutral-500">Uploading…</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => fileInputRef.current?.click()} className="px-3 py-2 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border border-sky-200 text-[11px] font-black">
                {preview ? 'Replace Image' : 'Upload Image'}
              </button>
              {preview && (
                <button type="button" onClick={() => { onChange('', ''); setPreview(''); setError(''); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 text-[11px] font-black">
                  Remove
                </button>
              )}
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
          {error && <p className="text-[11px] font-bold text-rose-500 mt-1.5">{error}</p>}
        </div>
      </div>
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value, '')}
        placeholder="…or paste an image URL"
        className="mt-2 w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-xs font-bold focus:outline-none focus:border-brand-pink"
      />
    </div>
  );
}

export function ProductsAdmin({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const [rows, setRows] = useState<AdminProduct[]>([]);
  const [kpis, setKpis] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [providerFilter, setProviderFilter] = useState('');

  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [draft, setDraft] = useState<Record<string, unknown>>({});

  const [quickPriceId, setQuickPriceId] = useState<string | null>(null);
  const [quickPrices, setQuickPrices] = useState({ sellingPrice: 0, originalPrice: 0 });

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const PAGE_SIZE = 50;

  const filtersActive = !!(search || statusFilter || categoryFilter || providerFilter) || pages > 1;

  const refresh = useCallback(async (targetPage = page) => {
    setLoading(true);
    const params: Record<string, string> = { sort: 'displayOrder', page: String(targetPage), limit: String(PAGE_SIZE) };
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    if (categoryFilter) params.category = categoryFilter;
    if (providerFilter) params.provider = providerFilter;
    const res = await adminApi.products(params);
    setRows((res.data as AdminProduct[]) || []);
    setKpis((res.kpis as Record<string, number>) || {});
    setPage((res.page as number) || 1);
    setPages((res.pages as number) || 1);
    const totalCount = (res.total as number) ?? ((res.data as AdminProduct[]) || []).length;
    setTotal(totalCount);
    setLoading(false);
  }, [page, search, statusFilter, categoryFilter, providerFilter]);

  useEffect(() => {
    const t = setTimeout(() => refresh(1), 300);
    return () => clearTimeout(t);
  }, [search, statusFilter, categoryFilter, providerFilter]);

  const startCreate = () => {
    setDraft({
      name: '', provider: 'Pearson', providerShortName: 'PTE', brand: 'Pearson PTE', category: 'English Language Test',
      shortDescription: '', description: '', logo: '', image: '', imagePublicId: '',
      originalPrice: 18900, sellingPrice: 15499, validityDays: 180, validityMonths: 6,
      badge: 'MOST POPULAR', badgeEnabled: true, badgeType: 'popular', badges: '',
      officialWebsiteUrl: '', officialProductUrl: '', sku: '', productCode: '',
      stockType: 'LIMITED', deliveryType: 'Instant Delivery', comingSoon: false, featured: false, active: true, displayOrder: 0,
      seoTitle: '', seoDescription: '', slug: '',
      inclusions: ['Official Exam Voucher Code', '10-Second Digital Delivery', 'Valid for 6 Months', 'Free Support'],
      redemptionSteps: ['Login to test provider website', 'Select test center & date', 'Apply voucher code at checkout'],
    });
    setEditing(null);
    setIsCreating(true);
  };

  const startEdit = (p: AdminProduct) => {
    setEditing(p);
    setIsCreating(false);
    setDraft({
      ...p,
      inclusions: Array.isArray(p.inclusions) ? (p.inclusions as string[]).join('\n') : p.inclusions || '',
      redemptionSteps: Array.isArray(p.redemptionSteps) ? (p.redemptionSteps as string[]).join('\n') : p.redemptionSteps || '',
      badges: Array.isArray(p.badges) ? (p.badges as string[]).join(', ') : p.badges || '',
    });
  };

  const saveProduct = async () => {
    if (!draft.name || !draft.provider || (draft.sellingPrice as number) < 0 || (draft.originalPrice as number) < 0) {
      alert('Product name, provider, and valid non-negative prices are required.');
      return;
    }
    if (Number(draft.sellingPrice) > Number(draft.originalPrice)) {
      alert('Selling price cannot be higher than original price.');
      return;
    }
    const payload = {
      ...draft,
      originalPrice: Number(draft.originalPrice),
      sellingPrice: Number(draft.sellingPrice),
      validityDays: Number(draft.validityDays) || 180,
      validityMonths: Number(draft.validityMonths) || 6,
      displayOrder: Number(draft.displayOrder) || 0,
      inclusions: typeof draft.inclusions === 'string' ? draft.inclusions.split('\n').map((s) => s.trim()).filter(Boolean) : draft.inclusions,
      redemptionSteps: typeof draft.redemptionSteps === 'string' ? draft.redemptionSteps.split('\n').map((s) => s.trim()).filter(Boolean) : draft.redemptionSteps,
    };
    const res = isCreating
      ? await adminApi.createProduct(payload)
      : await adminApi.updateProduct(editing?._id || '', payload);
    if (res.success) {
      setIsCreating(false);
      setEditing(null);
      refresh();
    } else alert((res.message as string) || 'Failed to save product');
  };

  const handleQuickPriceSave = async (id: string) => {
    if (Number(quickPrices.sellingPrice) > Number(quickPrices.originalPrice)) {
      alert('Selling price cannot exceed original price.');
      return;
    }
    const res = await adminApi.quickUpdatePrice(id, quickPrices);
    if (res.success) {
      setQuickPriceId(null);
      refresh();
    } else alert((res.message as string) || 'Failed to update price');
  };

  const toggleStatus = async (p: AdminProduct) => {
    const res = await adminApi.quickUpdateStatus(p._id, !p.active);
    if (res.success) refresh();
  };
  const toggleFeatured = async (p: AdminProduct) => {
    const res = await adminApi.quickUpdateFeatured(p._id, !p.featured);
    if (res.success) refresh();
  };
  const removeProduct = async (p: AdminProduct) => {
    if (!confirm(`Are you sure you want to deactivate or remove ${p.name}?`)) return;
    const res = await adminApi.deleteProduct(p._id);
    if (res.success) {
      if (res.deactivated) alert('Product archived. Historical records preserved.');
      refresh();
    } else alert((res.message as string) || 'Action failed');
  };
  const duplicateProduct = async (p: AdminProduct) => {
    const res = await adminApi.duplicateProduct(p._id);
    if (res.success) {
      alert(`Duplicated as "${(res.data as { name?: string })?.name}" (inactive, review before publishing).`);
      refresh();
    } else alert((res.message as string) || 'Failed to duplicate product');
  };
  const archiveProduct = async (p: AdminProduct) => {
    if (!confirm(`Archive ${p.name}? It will be hidden from the public site but kept in Admin.`)) return;
    const res = await adminApi.archiveProduct(p._id);
    if (res.success) refresh();
    else alert((res.message as string) || 'Failed to archive product');
  };
  const restoreProduct = async (p: AdminProduct) => {
    const res = await adminApi.restoreProduct(p._id);
    if (res.success) refresh();
    else alert((res.message as string) || 'Failed to restore product');
  };

  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const reorderTo = async (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || filtersActive) return;
    const reordered = [...rows];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    const items = reordered.map((r, i) => ({ id: r._id, order: i + 1 }));
    const res = await adminApi.reorderProducts(items);
    if (res.success) refresh();
    else alert((res.message as string) || 'Failed to reorder products');
  };
  const moveProduct = (index: number, direction: number) => reorderTo(index, index + direction);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl tracking-tight">Products Management</h1>
          <p className="text-xs font-bold text-neutral-500 dark:text-[#B5B5B5]">Single source of truth for product pricing, availability, validity, and customer store layout.</p>
        </div>
        <button onClick={startCreate} className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl btn-pink text-white font-black text-xs shadow-lg">
          <Plus className="w-4 h-4" /> Add New Product
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Total Products" value={kpis.totalProducts || 0} icon={<Package className="w-4 h-4" />} tint="#6C3CE0" />
        <StatCard label="Active Products" value={kpis.activeProducts || 0} icon={<CheckCircle2 className="w-4 h-4" />} tint="#10B981" />
        <StatCard label="Inactive Products" value={kpis.inactiveProducts || 0} icon={<X className="w-4 h-4" />} tint="#64748B" />
        <StatCard label="Archived" value={kpis.archivedProducts || 0} icon={<Trash2 className="w-4 h-4" />} tint="#71717A" onClick={() => setStatusFilter('archived')} />
        <StatCard label="Out of Stock" value={kpis.outOfStockProducts || 0} icon={<AlertTriangle className="w-4 h-4" />} tint="#EF4444" />
        <StatCard label="Low Stock Alert" value={kpis.lowStockProducts || 0} icon={<Clock className="w-4 h-4" />} tint="#F59E0B" />
      </div>

      <div className="rounded-3xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] flex-1 max-w-md">
            <Search className="w-4 h-4 text-neutral-400" />
            <input placeholder="Search products by name, provider, category, slug..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent outline-none text-xs font-bold w-full text-neutral-900 dark:text-white" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-3.5 py-2.5 rounded-2xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-xs font-bold text-neutral-700 dark:text-neutral-300">
              <option value="">All Categories</option>
              <option value="PTE">PTE</option>
              <option value="English Language Test">English Language Test</option>
              <option value="Graduate Admissions">Graduate Admissions</option>
              <option value="Professional Certifications">Professional Certifications</option>
            </select>
            <select value={providerFilter} onChange={(e) => setProviderFilter(e.target.value)} className="px-3.5 py-2.5 rounded-2xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-xs font-bold text-neutral-700 dark:text-neutral-300">
              <option value="">All Providers</option>
              <option value="Pearson">Pearson</option>
              <option value="ETS">ETS</option>
              <option value="Duolingo">Duolingo</option>
              <option value="IELTS IDP">IELTS IDP</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
          {[
            { id: '', label: 'All Products' },
            { id: 'active', label: 'Active' },
            { id: 'inactive', label: 'Inactive' },
            { id: 'out_of_stock', label: 'Out of Stock' },
            { id: 'low_stock', label: 'Low Stock' },
            { id: 'featured', label: 'Featured' },
            { id: 'archived', label: 'Archived' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setStatusFilter(pill.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition whitespace-nowrap ${
                statusFilter === pill.id ? 'bg-brand-pink text-white shadow-sm' : 'bg-neutral-100 dark:bg-[#262626] text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {(isCreating || editing) && (
        <FormCard
          title={isCreating ? '➕ Add New Exam Voucher Product' : `✏️ Edit Product: ${editing?.name}`}
          onClose={() => { setIsCreating(false); setEditing(null); }}
          onSave={saveProduct}
        >
          <div className="space-y-6">
            <div>
              <h4 className="text-xs font-black text-brand-pink uppercase tracking-wider mb-3">1. Basic Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Product Name *" value={draft.name as string} onChange={(v) => setDraft({ ...draft, name: v })} placeholder="e.g. PTE Academic Voucher" />
                <Field label="Exam Provider *" value={draft.provider as string} onChange={(v) => setDraft({ ...draft, provider: v, brand: v })} placeholder="Pearson / ETS / Duolingo" />
                <Field label="Provider Short Name" value={draft.providerShortName as string} onChange={(v) => setDraft({ ...draft, providerShortName: v })} placeholder="PTE / GRE / TOEFL" />
                <Field label="Category *" value={draft.category as string} onChange={(v) => setDraft({ ...draft, category: v })} placeholder="PTE / English Language Test" />
                <Field label="Display Order (Rank)" type="number" value={draft.displayOrder as number} onChange={(v) => setDraft({ ...draft, displayOrder: v })} placeholder="0" />
                <Field label="CTA Button Text" value={(draft.cta as string) || 'Buy Now'} onChange={(v) => setDraft({ ...draft, cta: v })} />
              </div>
            </div>

            <div className="pt-4 border-t border-[#EAEAEA] dark:border-[#292929]">
              <h4 className="text-xs font-black text-brand-pink uppercase tracking-wider mb-3">2. Pricing & Discounts (Single Source of Truth)</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Original Price (MRP ₹) *" type="number" value={draft.originalPrice as number} onChange={(v) => setDraft({ ...draft, originalPrice: v })} />
                <Field label="Selling Price (Final ₹) *" type="number" value={draft.sellingPrice as number} onChange={(v) => setDraft({ ...draft, sellingPrice: v })} />
                <div>
                  <Label>Calculated Discount</Label>
                  <div className="px-4 py-3 rounded-xl bg-neutral-100 dark:bg-[#0E0E0E] font-black text-sm text-emerald-600 dark:text-emerald-400">
                    Save {formatPrice(Math.max(0, (Number(draft.originalPrice) || 0) - (Number(draft.sellingPrice) || 0)))} (
                    {draft.originalPrice && Number(draft.originalPrice) > 0 ? Math.round(((Number(draft.originalPrice) - Number(draft.sellingPrice)) / Number(draft.originalPrice)) * 100) : 0}% OFF)
                  </div>
                </div>
              </div>
            </div>

            {/* Duration-based pricing variants */}
            <div className="pt-4 border-t border-[#EAEAEA] dark:border-[#292929]">
              <h4 className="text-xs font-black text-brand-pink uppercase tracking-wider mb-3">Duration Options (variants with their own prices)</h4>
              <p className="text-[11px] font-bold text-neutral-500 dark:text-[#B5B5B5] mb-4">When configured, the product card shows a duration selector. Each option overrides the base price for a purchase with that duration selected. The 3-month option appears in the &quot;Explore More&quot; detail page.</p>
              {DURATION_KEYS.map((dkey) => {
                const opt = Array.isArray(draft.durationOptions) ? draft.durationOptions.find((o) => o.key === dkey.key) : null;
                const enabled = opt ? opt.enabled !== false : false;
                return (
                  <div key={dkey.key} className="rounded-2xl border border-[#EAEAEA] dark:border-[#292929] p-3 mb-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black">{dkey.label}</span>
                      <label className="inline-flex items-center gap-2 text-[10px] font-bold text-neutral-500">
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={(e) => {
                            const current = Array.isArray(draft.durationOptions) ? [...draft.durationOptions] : [];
                            const idx = current.findIndex((o) => o.key === dkey.key);
                            if (idx >= 0) {
                              current[idx] = { ...current[idx], enabled: e.target.checked };
                            } else {
                              current.push({ key: dkey.key, label: dkey.label, sellingPrice: 0, originalPrice: 0, validityDays: dkey.defaultDays, enabled: e.target.checked });
                            }
                            setDraft({ ...draft, durationOptions: current });
                          }}
                        /> Active
                      </label>
                    </div>
                    {enabled && (
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                        <Field label="Selling Price ₹" type="number" value={opt?.sellingPrice ?? 0} onChange={(v) => {
                          const current = Array.isArray(draft.durationOptions) ? [...draft.durationOptions] : [];
                          const idx = current.findIndex((o) => o.key === dkey.key);
                          if (idx >= 0) current[idx] = { ...current[idx], sellingPrice: Number(v) };
                          else current.push({ key: dkey.key, label: dkey.label, sellingPrice: Number(v), originalPrice: 0, validityDays: dkey.defaultDays, enabled: true });
                          setDraft({ ...draft, durationOptions: current });
                        }} />
                        <Field label="Original Price ₹" type="number" value={opt?.originalPrice ?? 0} onChange={(v) => {
                          const current = Array.isArray(draft.durationOptions) ? [...draft.durationOptions] : [];
                          const idx = current.findIndex((o) => o.key === dkey.key);
                          if (idx >= 0) current[idx] = { ...current[idx], originalPrice: Number(v) };
                          else current.push({ key: dkey.key, label: dkey.label, sellingPrice: 0, originalPrice: Number(v), validityDays: dkey.defaultDays, enabled: true });
                          setDraft({ ...draft, durationOptions: current });
                        }} />
                        <Field label="Validity Days" type="number" value={opt?.validityDays ?? dkey.defaultDays} onChange={(v) => {
                          const current = Array.isArray(draft.durationOptions) ? [...draft.durationOptions] : [];
                          const idx = current.findIndex((o) => o.key === dkey.key);
                          if (idx >= 0) current[idx] = { ...current[idx], validityDays: Number(v) };
                          else current.push({ key: dkey.key, label: dkey.label, sellingPrice: 0, originalPrice: 0, validityDays: Number(v), enabled: true });
                          setDraft({ ...draft, durationOptions: current });
                        }} />
                        <Field label="Label" value={opt?.label ?? dkey.label} onChange={(v) => {
                          const current = Array.isArray(draft.durationOptions) ? [...draft.durationOptions] : [];
                          const idx = current.findIndex((o) => o.key === dkey.key);
                          if (idx >= 0) current[idx] = { ...current[idx], label: String(v) || dkey.label };
                          else current.push({ key: dkey.key, label: String(v) || dkey.label, sellingPrice: 0, originalPrice: 0, validityDays: dkey.defaultDays, enabled: true });
                          setDraft({ ...draft, durationOptions: current });
                        }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-[#EAEAEA] dark:border-[#292929]">
              <h4 className="text-xs font-black text-brand-pink uppercase tracking-wider mb-3">3. Customer Card Badges & Branding</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Card Badge Text (legacy, first shown)" value={(draft.badge as string) || ''} onChange={(v) => setDraft({ ...draft, badge: v })} placeholder="e.g. MOST POPULAR" />
                <div className="md:col-span-2">
                  <Field label="Badges (comma separated)" value={(draft.badges as string) || ''} onChange={(v) => setDraft({ ...draft, badges: v })} placeholder="Best Seller, Canada, Study Abroad" />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {['Best Seller', 'Most Popular', 'Featured', 'New', 'Limited Offer', 'Top Pick', 'Canada', 'UK', 'Australia', 'Study Abroad'].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          const current = String(draft.badges || '').split(',').map((s) => s.trim()).filter(Boolean);
                          if (!current.includes(preset)) setDraft({ ...draft, badges: [...current, preset].join(', ') });
                        }}
                        className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-[#262626] text-neutral-600 dark:text-neutral-300 text-[10px] font-black hover:bg-brand-pink/10 hover:text-brand-pink transition-colors"
                      >
                        + {preset}
                      </button>
                    ))}
                  </div>
                </div>
                <Field label="Validity (Months)" type="number" value={draft.validityMonths as number} onChange={(v) => setDraft({ ...draft, validityMonths: v })} />
                <Field label="Validity (Days)" type="number" value={draft.validityDays as number} onChange={(v) => setDraft({ ...draft, validityDays: v })} />
                <Field label="Delivery Type" value={(draft.deliveryType as string) || ''} onChange={(v) => setDraft({ ...draft, deliveryType: v })} placeholder="Instant Delivery" />
                <ProductLogoUploader value={(draft.logo as string) || ''} onChange={(url) => setDraft({ ...draft, logo: url })} />
                <ProductImageUploader
                  value={(draft.image as string) || ''}
                  onChange={(url, publicId) => setDraft({ ...draft, image: url, imagePublicId: publicId ?? draft.imagePublicId })}
                />
                <div>
                  <Label>Stock Type</Label>
                  <select value={(draft.stockType as string) || 'LIMITED'} onChange={(e) => setDraft({ ...draft, stockType: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-sm font-bold focus:outline-none focus:border-brand-pink">
                    <option value="LIMITED">Limited (tracked via voucher inventory)</option>
                    <option value="UNLIMITED">Unlimited (always in stock)</option>
                  </select>
                  {draft.stockType === 'UNLIMITED' && (
                    <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400 mt-1.5">
                      ⚠ &quot;Unlimited&quot; only affects the storefront display — voucher delivery still requires real codes in inventory. Keep this product&apos;s voucher inventory stocked or checkout will succeed without a voucher to deliver.
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 pt-6 flex-wrap">
                  <Check label="Show Badge on Card" checked={!!draft.badgeEnabled} onChange={(v) => setDraft({ ...draft, badgeEnabled: v })} />
                  <Check label="Featured Product" checked={!!draft.featured} onChange={(v) => setDraft({ ...draft, featured: v })} />
                  <Check label="Active & Visible" checked={!!draft.active} onChange={(v) => setDraft({ ...draft, active: v })} />
                  <Check label="Coming Soon" checked={!!draft.comingSoon} onChange={(v) => setDraft({ ...draft, comingSoon: v })} />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#EAEAEA] dark:border-[#292929]">
              <h4 className="text-xs font-black text-brand-pink uppercase tracking-wider mb-3">3B. Official Links & Identifiers</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Official Website URL" value={(draft.officialWebsiteUrl as string) || ''} onChange={(v) => setDraft({ ...draft, officialWebsiteUrl: v })} placeholder="https://www.pearsonpte.com/" />
                <Field label="Official Product Page URL" value={(draft.officialProductUrl as string) || ''} onChange={(v) => setDraft({ ...draft, officialProductUrl: v })} placeholder="https://www.pearsonpte.com/pte-academic/" />
                <Field label="SKU" value={(draft.sku as string) || ''} onChange={(v) => setDraft({ ...draft, sku: v })} placeholder="Optional internal SKU" />
                <Field label="Product Code" value={(draft.productCode as string) || ''} onChange={(v) => setDraft({ ...draft, productCode: v })} placeholder="Optional internal code" />
              </div>
            </div>

            <div className="pt-4 border-t border-[#EAEAEA] dark:border-[#292929]">
              <h4 className="text-xs font-black text-brand-pink uppercase tracking-wider mb-3">4. Descriptions & Bullet Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextArea label="Short Description (Shown on Card)" value={(draft.shortDescription as string) || ''} onChange={(v) => setDraft({ ...draft, shortDescription: v })} rows={2} />
                <TextArea label="Full Description (Shown in Modal)" value={(draft.description as string) || ''} onChange={(v) => setDraft({ ...draft, description: v })} rows={2} />
                <TextArea label="Inclusions (One per line)" value={Array.isArray(draft.inclusions) ? (draft.inclusions as string[]).join('\n') : ((draft.inclusions as string) || '')} onChange={(v) => setDraft({ ...draft, inclusions: v })} rows={3} />
                <TextArea label="Redemption Steps (One per line)" value={Array.isArray(draft.redemptionSteps) ? (draft.redemptionSteps as string[]).join('\n') : ((draft.redemptionSteps as string) || '')} onChange={(v) => setDraft({ ...draft, redemptionSteps: v })} rows={3} />
              </div>
            </div>

            <div className="pt-4 border-t border-[#EAEAEA] dark:border-[#292929]">
              <h4 className="text-xs font-black text-brand-pink uppercase tracking-wider mb-3">5. SEO Configuration</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="SEO Slug (URL identifier)" value={(draft.slug as string) || ''} onChange={(v) => setDraft({ ...draft, slug: v })} placeholder="pte-academic-voucher" />
                <Field label="SEO Title" value={(draft.seoTitle as string) || ''} onChange={(v) => setDraft({ ...draft, seoTitle: v })} placeholder="Discounted PTE Voucher..." />
                <Field label="SEO Description" value={(draft.seoDescription as string) || ''} onChange={(v) => setDraft({ ...draft, seoDescription: v })} placeholder="Buy discounted exam vouchers..." />
              </div>
            </div>
          </div>
        </FormCard>
      )}

      {filtersActive && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs font-bold text-amber-700 dark:text-amber-400">
          <GripVertical className="w-3.5 h-3.5 shrink-0" />
          <span>Clear search/filters to reorder products — reordering a filtered subset would corrupt the global display order.</span>
        </div>
      )}

      <div className="rounded-3xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-bold">
            <thead className="bg-neutral-50 dark:bg-[#0E0E0E] text-neutral-500">
              <tr>
                <Th>Product & Branding</Th>
                <Th>Provider</Th>
                <Th>Category</Th>
                <Th className="text-right">Original MRP</Th>
                <Th className="text-right">Selling Price</Th>
                <Th className="text-center">Discount</Th>
                <Th className="text-center">Available Stock</Th>
                <Th className="text-center">Status</Th>
                <Th className="text-center">Featured</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {loading && Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={10} className="p-4"><div className="h-10 bg-neutral-100 dark:bg-[#292929] rounded-xl animate-pulse" /></td></tr>
              ))}
              {!loading && rows.map((p, rowIndex) => {
                const isQuickEditing = quickPriceId === p._id;
                const availableCount = p.availableVouchers ?? 0;
                const stockBadge = availableCount > (p.lowStockThreshold || 10) ? 'emerald' : availableCount > 0 ? 'amber' : 'rose';
                return (
                  <tr
                    key={p._id}
                    draggable={!filtersActive}
                    onDragStart={() => setDragIndex(rowIndex)}
                    onDragOver={(e) => { e.preventDefault(); if (!filtersActive) setDragOverIndex(rowIndex); }}
                    onDragLeave={() => setDragOverIndex((cur) => (cur === rowIndex ? null : cur))}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (dragIndex !== null) reorderTo(dragIndex, rowIndex);
                      setDragIndex(null);
                      setDragOverIndex(null);
                    }}
                    onDragEnd={() => { setDragIndex(null); setDragOverIndex(null); }}
                    className={`border-t transition-colors ${
                      dragOverIndex === rowIndex && dragIndex !== null && dragIndex !== rowIndex ? 'border-t-2 border-t-brand-pink' : 'border-[#EAEAEA] dark:border-[#292929]'
                    } ${dragIndex === rowIndex ? 'opacity-40' : ''} hover:bg-neutral-50/50 dark:hover:bg-[#111111]`}
                  >
                    <Td>
                      <div className="flex items-center gap-3">
                        <div className={`text-neutral-300 dark:text-neutral-600 shrink-0 ${filtersActive ? 'cursor-not-allowed opacity-40' : 'cursor-grab active:cursor-grabbing hover:text-brand-pink'}`} title={filtersActive ? 'Clear search/filters to reorder' : 'Drag to reorder'}>
                          <GripVertical className="w-4 h-4" />
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-[#FFF0F5] dark:bg-[#2A0A17] border border-brand-pink/20 flex items-center justify-center font-black text-brand-pink shrink-0">
                          {p.providerShortName || p.brand?.slice(0, 3) || 'APX'}
                        </div>
                        <div>
                          <div className="font-black text-sm text-neutral-900 dark:text-white flex items-center gap-2">
                            <span>{p.name}</span>
                            {p.badge && <span className="px-2 py-0.5 rounded-md bg-brand-pink/10 text-brand-pink border border-brand-pink/20 text-[9px] font-black">{p.badge}</span>}
                          </div>
                          <div className="text-[11px] font-semibold text-neutral-400 truncate max-w-xs">
                            {p.shortDescription || p.description || `Valid for ${p.validityMonths || 6} Months`}
                          </div>
                        </div>
                      </div>
                    </Td>
                    <Td className="whitespace-nowrap">{p.provider || p.brand}</Td>
                    <Td className="whitespace-nowrap text-neutral-500">{p.category}</Td>
                    <Td className="text-right tabular-nums text-neutral-400 line-through">{formatPrice(p.originalPrice)}</Td>
                    <Td className="text-right tabular-nums whitespace-nowrap">
                      {isQuickEditing ? (
                        <div className="inline-flex items-center gap-1 bg-white dark:bg-[#161616] p-1 rounded-xl border border-brand-pink">
                          <input
                            type="number"
                            value={quickPrices.sellingPrice}
                            onChange={(e) => setQuickPrices({ ...quickPrices, sellingPrice: Number(e.target.value) })}
                            className="w-20 px-2 py-1 rounded bg-neutral-100 dark:bg-[#0E0E0E] text-xs font-black outline-none"
                          />
                          <button onClick={() => handleQuickPriceSave(p._id)} className="p-1 rounded bg-brand-pink text-white text-[10px] font-black">Save</button>
                          <button onClick={() => setQuickPriceId(null)} className="p-1 rounded bg-neutral-200 dark:bg-[#262626] text-neutral-700 dark:text-neutral-300 text-[10px]">✕</button>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5">
                          <span className="font-black text-sm text-brand-pink">{formatPrice(p.sellingPrice)}</span>
                          <button
                            onClick={() => { setQuickPriceId(p._id); setQuickPrices({ sellingPrice: p.sellingPrice || 0, originalPrice: p.originalPrice || 0 }); }}
                            className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-[#262626] text-neutral-400 hover:text-brand-pink"
                            title="Quick edit price"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </Td>
                    <Td className="text-center whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 text-[10px] font-black">
                        {p.originalPrice ? Math.round(((p.originalPrice - (p.sellingPrice || 0)) / p.originalPrice) * 100) : 0}% OFF
                      </span>
                    </Td>
                    <Td className="text-center whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${
                        stockBadge === 'emerald'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : stockBadge === 'amber'
                          ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400'
                          : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400'
                      }`}>
                        {availableCount} Available ({p.stockStatus || (availableCount > 0 ? 'IN STOCK' : 'OUT OF STOCK')})
                      </span>
                    </Td>
                    <Td className="text-center whitespace-nowrap">
                      {p.archived ? (
                        <Pill text="ARCHIVED" tint="neutral" />
                      ) : (
                        <button onClick={() => toggleStatus(p)} className="cursor-pointer">
                          <Pill text={p.active ? 'ACTIVE' : 'INACTIVE'} tint={p.active ? 'emerald' : 'neutral'} />
                        </button>
                      )}
                    </Td>
                    <Td className="text-center whitespace-nowrap">
                      <button
                        onClick={() => toggleFeatured(p)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black border cursor-pointer ${
                          p.featured ? 'bg-brand-pink/10 text-brand-pink border-brand-pink/30' : 'bg-neutral-100 text-neutral-400 border-neutral-200 dark:bg-[#262626]'
                        }`}
                      >
                        {p.featured ? '★ Featured' : '☆ Standard'}
                      </button>
                    </Td>
                    <Td className="text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <div className="flex flex-col mr-1">
                          <button onClick={() => moveProduct(rowIndex, -1)} disabled={rowIndex === 0 || filtersActive} className="text-neutral-400 hover:text-brand-pink disabled:opacity-30 disabled:cursor-not-allowed" title={filtersActive ? 'Clear search/filters to reorder' : 'Move up'}>
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => moveProduct(rowIndex, 1)} disabled={rowIndex === rows.length - 1 || filtersActive} className="text-neutral-400 hover:text-brand-pink disabled:opacity-30 disabled:cursor-not-allowed" title={filtersActive ? 'Clear search/filters to reorder' : 'Move down'}>
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <button onClick={() => startEdit(p)} className="px-2.5 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border border-sky-200 text-[11px] font-black flex items-center gap-1">
                          <Edit2 className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => onNavigate?.('vouchers')}
                          className="px-2.5 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border border-purple-200 text-[11px] font-black flex items-center gap-1"
                          title="Manage associated voucher codes"
                        >
                          <Ticket className="w-3.5 h-3.5" /> Inventory
                        </button>
                        <button onClick={() => duplicateProduct(p)} className="p-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border border-purple-200" title="Duplicate product">
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        {p.archived ? (
                          <button onClick={() => restoreProduct(p)} className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200" title="Restore product">
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button onClick={() => archiveProduct(p)} className="p-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200" title="Archive product">
                            <AlertOctagon className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button onClick={() => removeProduct(p)} className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200" title="Deactivate or Remove">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!loading && rows.length === 0 && <Empty title="No products found" desc="Add your first exam voucher product to start selling." />}
      </div>

      {!loading && total > 0 && (
        <div className="flex items-center justify-between gap-3 px-1">
          <span className="text-xs font-bold text-neutral-500 dark:text-[#B5B5B5]">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
          </span>
          <div className="flex items-center gap-2">
            <button onClick={() => refresh(page - 1)} disabled={page <= 1} className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] text-xs font-black disabled:opacity-40 disabled:cursor-not-allowed">
              Previous
            </button>
            <span className="text-xs font-bold text-neutral-500">Page {page} of {pages}</span>
            <button onClick={() => refresh(page + 1)} disabled={page >= pages} className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] text-xs font-black disabled:opacity-40 disabled:cursor-not-allowed">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
