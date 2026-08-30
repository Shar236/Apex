'use client';

import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, Upload, Search, Eye, EyeOff, Copy, Check as CheckIcon } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { Pill, Th, Td, Empty, FormCard, Field, Label } from '@/components/admin/admin-ui';

interface VoucherRow {
  _id: string;
  code: string;
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
  const [products, setProducts] = useState<Array<{ _id: string; name: string; voucherType?: string; brand?: string }>>([]);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulk, setBulk] = useState({ productId: '', codes: '', expiryDate: '' });
  const [revealedCodes, setRevealedCodes] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revealingId, setRevealingId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (status) params.status = status;
    if (productId) params.productId = productId;
    if (search) params.search = search;
    try {
      const [vRes, pRes, sRes] = await Promise.all([
        adminApi.vouchers(params),
        adminApi.products(),
        adminApi.voucherSummaryByProduct(),
      ]);
      setRows((vRes?.data as VoucherRow[]) || []);
      setProducts((pRes?.data as Array<{ _id: string; name: string; voucherType?: string; brand?: string }>) || []);
      setSummary((sRes?.data as VoucherSummaryItem[]) || []);
    } catch (err) {
      console.error('Failed to load vouchers:', err);
    } finally {
      setLoading(false);
    }
  }, [status, productId, search]);

  useEffect(() => {
    const t = setTimeout(refresh, 300);
    return () => clearTimeout(t);
  }, [refresh]);

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
        alert((res?.message as string) || 'Failed to reveal voucher code');
      }
    } catch (err) {
      alert('Error revealing code: ' + (err instanceof Error ? err.message : String(err)));
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
      alert('Please choose a product, paste at least one code, and set expiry date.');
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
      alert((res?.message as string) || 'Failed to add vouchers');
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
                    <div className="font-black text-sm text-purple-600 dark:text-purple-400">{(c.sold || 0) + (c.assigned || 0)}</div>
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
              onClick={() => setStatus(sf.value)}
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
              placeholder="Search by code, customer email, or order #..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-xs font-bold focus:outline-none focus:border-brand-pink"
            />
          </div>
          <select value={productId} onChange={(e) => setProductId(e.target.value)} className="px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-xs font-bold">
            <option value="">All products</option>
            {products.map((p) => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>
          <button type="submit" className="px-4 py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-black font-black text-xs">Filter</button>
        </form>
      </div>

      <div className="rounded-3xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-bold">
            <thead className="bg-neutral-50 dark:bg-[#0E0E0E] text-neutral-500">
              <tr>
                <Th>Voucher Code</Th>
                <Th>Assigned Product</Th>
                <Th>Voucher Type</Th>
                <Th>Status</Th>
                <Th>Sold / Assigned To</Th>
                <Th>Order ID</Th>
                <Th>Expiry Date</Th>
                <Th>Sale Timestamp</Th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={8} className="p-6"><div className="h-10 bg-neutral-100 dark:bg-[#292929] rounded-xl animate-pulse" /></td></tr>
              )}
              {!loading && rows.map((v) => {
                const isRevealed = !!revealedCodes[v._id];
                const displayCode = isRevealed ? revealedCodes[v._id] : v.codeDisplay || v.code;
                const isCopied = copiedId === v._id;
                return (
                  <tr key={v._id} className="border-t border-[#EAEAEA] dark:border-[#292929] hover:bg-neutral-50/50 dark:hover:bg-[#111111] transition">
                    <Td className="whitespace-nowrap font-mono font-black">
                      <div className="flex items-center gap-2">
                        <span className={isRevealed ? 'text-brand-pink bg-[#FFF0F5] dark:bg-[#2A0A17] px-2 py-0.5 rounded-md' : 'text-[#6C3CE0]'}>
                          {displayCode}
                        </span>
                        <button onClick={() => handleReveal(v._id)} disabled={revealingId === v._id} className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-[#262626] text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition" title={isRevealed ? 'Mask Code' : 'Reveal Full Code (Audit Logged)'}>
                          {revealingId === v._id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button onClick={() => handleCopy(v._id, isRevealed ? revealedCodes[v._id] : v.code)} className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-[#262626] text-neutral-400 hover:text-brand-pink transition" title="Copy Code">
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
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!loading && rows.length === 0 && <Empty title="No matching vouchers" desc="Try adjusting your filter or add voucher inventory codes." />}
      </div>
    </div>
  );
}
