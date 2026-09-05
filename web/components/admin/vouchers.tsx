'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw, Upload, Search, Eye, EyeOff, Copy, Check as CheckIcon, Trash2, Ban, CalendarX, Loader2 } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { Pill, Th, Td, Empty, FormCard, Field, Label } from '@/components/admin/admin-ui';
import { ErrorState } from '@/components/ui/data-table';
import { ConfirmDialog } from '@/components/ui/alert-dialog';
import { notify } from '@/components/ui/toast';

/**
 * Statuses that are pure inventory — safe to remove permanently.
 * SOLD / ASSIGNED / USED belong to a customer's order and are preserved by the
 * backend regardless of what this UI sends; they are shown as non-selectable so
 * the admin is not offered an action that will be refused.
 */
const REMOVABLE_STATUSES = ['AVAILABLE', 'RESERVED', 'EXPIRED', 'INVALID', 'CANCELLED'];
const isRemovable = (status?: string) => REMOVABLE_STATUSES.includes(String(status || '').toUpperCase());

interface VoucherRow {
  _id: string;
  /** Absent unless explicitly revealed — the list API returns only `codeDisplay`. */
  code?: string;
  codeDisplay?: string;
  voucherType?: string;
  status?: string;
  soldTo?: string | null;
  expiryDate?: string;
  soldAt?: string | null;
  assignedAt?: string | null;
  userId?: { name?: string; email?: string } | null;
  orderId?: { orderNo?: string } | null;
  productId?: { name?: string; voucherType?: string } | null;
}

interface PreviewEntry {
  _id: string | null;
  code: string | null;
  status: string | null;
  reason: string | null;
}

interface DeletePreview {
  removable: number;
  blocked: PreviewEntry[];
}

interface VoucherSummaryItem {
  product: { _id: string; name: string; voucherType?: string; brand?: string };
  counts: { available?: number; sold?: number; assigned?: number; total?: number };
  isLowStock?: boolean;
  isOutOfStock?: boolean;
}

const STATUS_FILTERS = [
  { label: 'All Inventory', value: '' },
  { label: 'Available', value: 'AVAILABLE' },
  { label: 'Reserved', value: 'RESERVED' },
  { label: 'Sold', value: 'SOLD' },
  { label: 'Assigned', value: 'ASSIGNED' },
  { label: 'Used', value: 'USED' },
  { label: 'Expired', value: 'EXPIRED' },
  { label: 'Invalid / Cancelled', value: 'CANCELLED' },
];

export function VouchersAdmin() {
  const [rows, setRows] = useState<VoucherRow[]>([]);
  const [summary, setSummary] = useState<VoucherSummaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [productId, setProductId] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [products, setProducts] = useState<Array<{ _id: string; name: string; voucherType?: string; brand?: string }>>([]);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulk, setBulk] = useState({ productId: '', codes: '', expiryDate: '' });
  const [revealedCodes, setRevealedCodes] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revealingId, setRevealingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pendingDelete, setPendingDelete] = useState<{ ids: string[]; preview: DeletePreview | null } | null>(null);
  const [working, setWorking] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const params: Record<string, string> = { page: String(page), limit: '50' };
    if (status) params.status = status;
    if (productId) params.productId = productId;
    if (search) params.search = search;
    const [vRes, pRes, sRes] = await Promise.all([
      adminApi.vouchers(params),
      adminApi.products({ limit: '500', sort: 'name' }),
      adminApi.voucherSummaryByProduct(),
    ]);
    // request() never throws — a failed load must set the error state, not
    // silently render as "No matching vouchers".
    if (!vRes.success) {
      setLoadError(vRes.message || 'Unable to load voucher inventory.');
      setRows([]);
    } else {
      setRows((vRes.data as VoucherRow[]) || []);
      setPages(Number(vRes.pages) || 1);
      // Drop selections for rows that are no longer on screen.
      setSelected((prev) => {
        const visible = new Set(((vRes.data as VoucherRow[]) || []).map((v) => v._id));
        return new Set([...prev].filter((id) => visible.has(id)));
      });
    }
    // The product dropdown feeds the bulk-add form and filter — a failure here
    // is non-fatal (keep previous list) but must not zero it out.
    if (pRes.success) setProducts((pRes.data as Array<{ _id: string; name: string; voucherType?: string; brand?: string }>) || []);
    if (sRes.success) setSummary((sRes.data as VoucherSummaryItem[]) || []);
    setLoading(false);
  }, [status, productId, search, page]);

  useEffect(() => {
    const t = setTimeout(refresh, 300);
    return () => clearTimeout(t);
  }, [refresh]);

  const selectableIds = useMemo(() => rows.filter((v) => isRemovable(v.status)).map((v) => v._id), [rows]);
  const allSelected = selectableIds.length > 0 && selectableIds.every((id) => selected.has(id));

  const toggleRow = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(selectableIds));

  /** Ask the server what would actually happen, then open the confirm dialog. */
  const askDelete = async (ids: string[]) => {
    if (!ids.length) return;
    setWorking(true);
    try {
      const res = await adminApi.previewVoucherDelete(ids);
      setPendingDelete({
        ids,
        preview: res?.success
          ? {
              removable: ((res.removable as PreviewEntry[]) || []).length,
              blocked: (res.blocked as PreviewEntry[]) || [],
            }
          : null,
      });
    } catch {
      setPendingDelete({ ids, preview: null });
    } finally {
      setWorking(false);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setWorking(true);
    const { ids } = pendingDelete;
    const res = ids.length === 1 ? await adminApi.deleteVoucher(ids[0]) : await adminApi.bulkDeleteVouchers(ids);
    setWorking(false);
    setPendingDelete(null);
    if (res?.success) {
      const deleted = (res.deleted as number) ?? ids.length;
      const skipped = ((res.skipped as unknown[]) || []).length;
      notify.success(`${deleted} voucher${deleted === 1 ? '' : 's'} deleted`, skipped ? `${skipped} kept because a customer already has them.` : undefined);
      setSelected(new Set());
      refresh();
    } else {
      notify.error((res?.message as string) || 'Delete failed.');
    }
  };

  /** Mark codes EXPIRED / INVALID — the soft-retire path that keeps the record. */
  const markStatus = async (ids: string[], next: string) => {
    if (!ids.length) return;
    setWorking(true);
    const res = await adminApi.setVoucherStatus(ids, next);
    setWorking(false);
    if (res?.success) {
      notify.success((res.message as string) || `Marked ${next}.`);
      setSelected(new Set());
      refresh();
    } else {
      notify.error((res?.message as string) || `Could not mark ${next}.`);
    }
  };

  const handleReveal = async (voucherId: string) => {
    if (revealedCodes[voucherId]) {
      setRevealedCodes((prev) => {
        const next = { ...prev };
        delete next[voucherId];
        return next;
      });
      return;
    }
    setRevealingId(voucherId);
    try {
      const res = await adminApi.revealVoucherCode(voucherId);
      if (res?.success && (res.data as { code?: string })?.code) {
        setRevealedCodes((prev) => ({ ...prev, [voucherId]: (res.data as { code: string }).code }));
      } else {
        notify.error((res?.message as string) || 'Failed to reveal voucher code');
      }
    } catch (err) {
      notify.error('Error revealing code: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setRevealingId(null);
    }
  };

  const handleCopy = (id: string, code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const selectedProductObj = products.find((p) => p._id === bulk.productId);

  const submitBulk = async () => {
    const codes = bulk.codes.split(/[\n,]/).map((s) => s.trim()).filter(Boolean);
    if (!bulk.productId || codes.length === 0 || !bulk.expiryDate) {
      notify.error('Please choose a product, paste at least one code, and set expiry date.');
      return;
    }
    const res = await adminApi.addVouchersBulk({
      productId: bulk.productId,
      codes,
      expiryDate: new Date(bulk.expiryDate),
    });
    if (res?.success) {
      setBulkOpen(false);
      setBulk({ productId: '', codes: '', expiryDate: '' });
      refresh();
    } else {
      notify.error((res?.message as string) || 'Failed to add vouchers');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl tracking-tight">Voucher Inventory Management</h1>
          <p className="text-xs font-bold text-neutral-500 dark:text-[#B5B5B5]">
            Strict product-to-voucher inventory mapping, atomic allocations, and masked code security.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={refresh} className="p-2.5 rounded-xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] hover:border-brand-pink transition shadow-sm" title="Refresh Inventory">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => setBulkOpen(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl btn-pink text-white font-black text-xs shadow-lg">
            <Upload className="w-4 h-4" /> Add Voucher Codes
          </button>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-black text-xs uppercase tracking-wider text-neutral-400">Inventory Breakdown by Product</h3>
          {productId && (
            <button onClick={() => setProductId('')} className="text-xs font-black text-brand-pink hover:underline">
              Clear Product Filter (Show All)
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {summary.map((item) => {
            const p = item.product;
            const c = item.counts || {};
            const isSelected = productId === p._id;
            return (
              <div
                key={p._id}
                onClick={() => setProductId(isSelected ? '' : p._id)}
                className={`p-4 rounded-3xl border cursor-pointer transition-all duration-200 shadow-sm ${
                  isSelected ? 'bg-[#FFF0F5] dark:bg-[#2A0A17] border-brand-pink ring-2 ring-brand-pink/20 shadow-md' : 'bg-white dark:bg-[#161616] border-[#EAEAEA] dark:border-[#292929] hover:border-brand-pink/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-[#6C3CE0]/10 text-[#6C3CE0] dark:text-[#A78BFA] font-mono text-[9px] font-black uppercase mb-1">
                      {p.voucherType || 'EXAM'}
                    </span>
                    <h4 className="font-black text-sm truncate text-neutral-900 dark:text-white" title={p.name}>
                      {p.name}
                    </h4>
                  </div>
                  {item.isOutOfStock ? (
                    <span className="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 font-black text-[9px] whitespace-nowrap">OUT OF STOCK</span>
                  ) : item.isLowStock ? (
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-black text-[9px] whitespace-nowrap">LOW STOCK</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-black text-[9px] whitespace-nowrap">IN STOCK</span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 mt-2 border-t border-[#EAEAEA] dark:border-[#292929] text-center font-mono">
                  <div>
                    <div className="text-[10px] text-neutral-400 font-bold">Avail</div>
                    <div className="font-black text-sm text-emerald-600 dark:text-emerald-400">{c.available || 0}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-neutral-400 font-bold">Sold</div>
                    {/* `sold` already counts SOLD + ASSIGNED + USED (see
                        aggregateVoucherStatsByProduct) — adding `assigned`
                        again double-counted every assigned code. */}
                    <div className="font-black text-sm text-purple-600 dark:text-purple-400">{c.sold || 0}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-neutral-400 font-bold">Total</div>
                    <div className="font-black text-sm text-neutral-700 dark:text-neutral-300">{c.total || 0}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {bulkOpen && (
        <FormCard title="Add Voucher Codes to Inventory" onClose={() => setBulkOpen(false)} onSave={submitBulk}>
          <div className="space-y-4">
            <div>
              <Label>Select Product *</Label>
              <select value={bulk.productId} onChange={(e) => setBulk({ ...bulk, productId: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-sm font-bold focus:outline-none focus:border-brand-pink">
                <option value="">— Select Target Product —</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>{p.name} ({p.voucherType || p.brand})</option>
                ))}
              </select>
              {selectedProductObj && (
                <div className="mt-2 p-3 rounded-xl bg-[#FFF0F5] dark:bg-[#2A0A17] border border-brand-pink/20 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-brand-pink">Bound Voucher Type:</span>{' '}
                    <strong className="font-black">{selectedProductObj.voucherType || selectedProductObj.brand}</strong>
                  </div>
                  <span className="text-[10px] font-bold text-neutral-400">Codes will ONLY be delivered for this exact product</span>
                </div>
              )}
            </div>
            <Field label="Expiry Date *" type="date" value={bulk.expiryDate} onChange={(v) => setBulk({ ...bulk, expiryDate: v })} />
            <div>
              <Label>Voucher Codes (one per line or comma-separated) *</Label>
              <textarea
                value={bulk.codes}
                onChange={(e) => setBulk({ ...bulk, codes: e.target.value })}
                rows={7}
                placeholder={'APX-DUOL-1234-ABC\nAPX-DUOL-5678-DEF\nAPX-DUOL-9012-GHI'}
                className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-sm font-bold focus:outline-none focus:border-brand-pink font-mono uppercase"
              />
            </div>
          </div>
        </FormCard>
      )}

      <div className="rounded-3xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] p-4 shadow-sm space-y-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {STATUS_FILTERS.map((sf) => (
            <button
              key={sf.value}
              onClick={() => { setStatus(sf.value); setPage(1); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition ${
                status === sf.value ? 'bg-brand-pink text-white shadow-md' : 'bg-neutral-100 dark:bg-[#202020] text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'
              }`}
            >
              {sf.label}
            </button>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); refresh(); }} className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-60">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by code or customer email..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-xs font-bold focus:outline-none focus:border-brand-pink"
            />
          </div>
          <select value={productId} onChange={(e) => { setProductId(e.target.value); setPage(1); }} className="px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-xs font-bold">
            <option value="">All products</option>
            {products.map((p) => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>
          <button type="submit" className="px-4 py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-black font-black text-xs">Filter</button>
        </form>
      </div>

      {selected.size > 0 && (
        <div className="sticky top-3 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3 bg-neutral-900 dark:bg-white text-white dark:text-black shadow-xl">
          <span className="text-xs font-black">
            {selected.size} voucher{selected.size === 1 ? '' : 's'} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => markStatus([...selected], 'EXPIRED')}
              disabled={working}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/15 dark:bg-black/10 text-xs font-black disabled:opacity-50"
            >
              <CalendarX className="w-3.5 h-3.5" /> Mark expired
            </button>
            <button
              onClick={() => markStatus([...selected], 'INVALID')}
              disabled={working}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/15 dark:bg-black/10 text-xs font-black disabled:opacity-50"
            >
              <Ban className="w-3.5 h-3.5" /> Mark invalid
            </button>
            <button
              onClick={() => askDelete([...selected])}
              disabled={working}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600 text-white text-xs font-black disabled:opacity-50"
            >
              {working ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />} Delete
            </button>
            <button onClick={() => setSelected(new Set())} className="px-3 py-2 rounded-xl text-xs font-black opacity-70 hover:opacity-100">
              Clear
            </button>
          </div>
        </div>
      )}

      <div className="rounded-3xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-bold">
            <thead className="bg-neutral-50 dark:bg-[#0E0E0E] text-neutral-500">
              <tr>
                <Th className="w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    disabled={selectableIds.length === 0}
                    aria-label="Select all removable vouchers"
                    className="w-4 h-4 accent-brand-pink disabled:opacity-30"
                  />
                </Th>
                <Th>Voucher Code</Th>
                <Th>Assigned Product</Th>
                <Th>Voucher Type</Th>
                <Th>Status</Th>
                <Th>Sold / Assigned To</Th>
                <Th>Order ID</Th>
                <Th>Expiry Date</Th>
                <Th>Sale Timestamp</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {loading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`sk-${i}`} className="border-t border-[#EAEAEA] dark:border-[#292929]">
                    <td colSpan={10} className="p-3">
                      <div className="h-8 bg-neutral-100 dark:bg-[#292929] rounded-xl animate-pulse" />
                    </td>
                  </tr>
                ))}
              {!loading && rows.map((v) => {
                const isRevealed = !!revealedCodes[v._id];
                const displayCode = isRevealed ? revealedCodes[v._id] : v.codeDisplay || v.code;
                const isCopied = copiedId === v._id;
                const removable = isRemovable(v.status);
                return (
                  <tr key={v._id} className={`border-t border-[#EAEAEA] dark:border-[#292929] transition ${selected.has(v._id) ? 'bg-[#FFF0F5] dark:bg-[#2A0A17]' : 'hover:bg-neutral-50/50 dark:hover:bg-[#111111]'}`}>
                    <Td>
                      <input
                        type="checkbox"
                        checked={selected.has(v._id)}
                        onChange={() => toggleRow(v._id)}
                        disabled={!removable}
                        aria-label={removable ? `Select voucher ${displayCode}` : 'Delivered voucher — kept for order history'}
                        title={removable ? undefined : 'Delivered to a customer — kept for order history'}
                        className="w-4 h-4 accent-brand-pink disabled:opacity-30 disabled:cursor-not-allowed"
                      />
                    </Td>
                    <Td className="whitespace-nowrap font-mono font-black">
                      <div className="flex items-center gap-2">
                        <span className={isRevealed ? 'text-brand-pink bg-[#FFF0F5] dark:bg-[#2A0A17] px-2 py-0.5 rounded-md' : 'text-[#6C3CE0]'}>
                          {displayCode}
                        </span>
                        <button onClick={() => handleReveal(v._id)} disabled={revealingId === v._id} className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-[#262626] text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition" title={isRevealed ? 'Mask Code' : 'Reveal Full Code (Audit Logged)'}>
                          {revealingId === v._id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        {/* Only the revealed (audit-logged) code can be copied —
                            the list response no longer carries the raw code. */}
                        <button
                          onClick={() => handleCopy(v._id, revealedCodes[v._id])}
                          disabled={!isRevealed}
                          className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-[#262626] text-neutral-400 hover:text-brand-pink transition disabled:opacity-30 disabled:cursor-not-allowed"
                          title={isRevealed ? 'Copy code' : 'Reveal the code first'}
                        >
                          {isCopied ? <CheckIcon className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </Td>
                    <Td className="font-bold">{v.productId?.name || '—'}</Td>
                    <Td>
                      <span className="inline-flex px-2 py-0.5 rounded-md bg-[#6C3CE0]/10 text-[#6C3CE0] dark:text-[#A78BFA] font-mono text-[10px] font-black">
                        {v.voucherType || v.productId?.voucherType || 'EXAM'}
                      </span>
                    </Td>
                    <Td>
                      {v.status === 'AVAILABLE' ? <Pill text="AVAILABLE" tint="emerald" />
                        : v.status === 'RESERVED' ? <Pill text="RESERVED" tint="amber" />
                        : v.status === 'SOLD' ? <Pill text="SOLD" tint="sky" />
                        : v.status === 'ASSIGNED' ? <Pill text="ASSIGNED" tint="sky" />
                        : v.status === 'USED' ? <Pill text="USED" tint="neutral" />
                        : <Pill text={v.status || '—'} tint="rose" />}
                    </Td>
                    <Td className="whitespace-nowrap">
                      {v.soldTo ? <span className="text-neutral-700 dark:text-neutral-300">{v.soldTo}</span>
                        : v.userId ? <span>{v.userId.name} {v.userId.email && `<${v.userId.email}>`}</span>
                        : <span className="text-neutral-400 italic">—</span>}
                    </Td>
                    <Td className="whitespace-nowrap font-mono text-[11px]">
                      {v.orderId?.orderNo ? <span className="text-brand-pink">#{v.orderId.orderNo}</span> : <span className="text-neutral-400">—</span>}
                    </Td>
                    <Td className="whitespace-nowrap">{v.expiryDate ? new Date(v.expiryDate).toLocaleDateString() : '—'}</Td>
                    <Td className="whitespace-nowrap text-neutral-400">
                      {v.soldAt ? new Date(v.soldAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
                        : v.assignedAt ? new Date(v.assignedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
                        : '—'}
                    </Td>
                    <Td className="whitespace-nowrap">
                      {removable ? (
                        <div className="flex items-center justify-end gap-1">
                          {v.status !== 'EXPIRED' && (
                            <button
                              onClick={() => markStatus([v._id], 'EXPIRED')}
                              disabled={working}
                              className="p-1.5 rounded-lg text-neutral-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition disabled:opacity-40"
                              title="Mark expired (keeps the record)"
                            >
                              <CalendarX className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {v.status !== 'INVALID' && (
                            <button
                              onClick={() => markStatus([v._id], 'INVALID')}
                              disabled={working}
                              className="p-1.5 rounded-lg text-neutral-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/40 transition disabled:opacity-40"
                              title="Mark invalid (keeps the record)"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => askDelete([v._id])}
                            disabled={working}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition disabled:opacity-40"
                            title="Delete permanently"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="block text-right text-[10px] font-bold text-neutral-400 italic">Order history</span>
                      )}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!loading && loadError && <ErrorState message={loadError} onRetry={refresh} />}
        {!loading && !loadError && rows.length === 0 && (
          <Empty title="No matching vouchers" desc="Try adjusting your filter or add voucher inventory codes." />
        )}
      </div>

      {!loading && !loadError && pages > 1 && (
        <div className="flex items-center justify-between text-xs font-bold text-neutral-500">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1.5 rounded-lg border border-[#EAEAEA] dark:border-[#292929] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed">
            ← Prev
          </button>
          <span>Page {page} of {pages}</span>
          <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page >= pages} className="px-3 py-1.5 rounded-lg border border-[#EAEAEA] dark:border-[#292929] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed">
            Next →
          </button>
        </div>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        busy={working}
        title={
          pendingDelete && pendingDelete.ids.length > 1
            ? `Delete ${pendingDelete.ids.length} voucher codes?`
            : 'Delete this voucher code?'
        }
        confirmLabel={working ? 'Deleting…' : 'Delete permanently'}
        body={
          <>
            <p>
              {pendingDelete?.preview
                ? `${pendingDelete.preview.removable} code${pendingDelete.preview.removable === 1 ? '' : 's'} will be permanently removed from inventory. This cannot be undone.`
                : 'These codes will be permanently removed from inventory. This cannot be undone.'}
            </p>
            {!!pendingDelete?.preview?.blocked?.length && (
              <p className="text-amber-700 dark:text-amber-400">
                {pendingDelete.preview.blocked.length} code
                {pendingDelete.preview.blocked.length === 1 ? ' is' : 's are'} already delivered to a customer and will be
                kept so their order history stays intact.
              </p>
            )}
            <p className="text-neutral-400">
              To retire a code without erasing it, use <strong>Mark expired</strong> or <strong>Mark invalid</strong> instead.
            </p>
          </>
        }
        onConfirm={confirmDelete}
      />
    </div>
  );
}
