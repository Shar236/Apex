'use client';

import { useCallback, useEffect, useState } from 'react';
import { Search, RefreshCw, Ticket, Clock, CheckCircle2, X, Send, Download, Loader2 } from 'lucide-react';
import { adminApi, formatPrice } from '@/lib/api';
import { Th, Td, Empty, Label, fmtDateTime } from '@/components/admin/admin-ui';

interface FulfillmentRow {
  _id: string;
  requestId?: string;
  customerName?: string;
  customerEmail?: string;
  orderNo?: string;
  orderId?: string;
  productName?: string;
  voucherType?: string;
  quantity?: number;
  amountPaid?: number;
  currency?: string;
  razorpayPaymentId?: string | null;
  status?: string;
  voucherCode?: string | null;
  voucherId?: string | null;
  deliveredAt?: string | null;
  createdAt?: string;
  emailStatus?: string;
  emailError?: string | null;
  adminNotes?: string;
}

const STATUS_STYLES: Record<string, string> = {
  PROCESSING: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400',
  DELIVERED: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400',
  CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400',
  FAILED: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400',
};

const EMAIL_STYLES: Record<string, string> = {
  PENDING: 'bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700',
  SENT: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/40',
  FAILED: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/40',
};

const StatusBadge = ({ status }: { status?: string }) => (
  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black border capitalize ${STATUS_STYLES[status || ''] || STATUS_STYLES.PROCESSING}`}>{status || 'PROCESSING'}</span>
);

const EmailBadge = ({ status }: { status?: string }) => (
  <span className={`px-2 py-0.5 rounded-full border text-[10px] font-black whitespace-nowrap ${EMAIL_STYLES[status || ''] || EMAIL_STYLES.PENDING}`}>{status || 'PENDING'}</span>
);

export function FulfillmentsAdmin() {
  const [rows, setRows] = useState<FulfillmentRow[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [delivering, setDelivering] = useState<FulfillmentRow | null>(null);
  const [codeInput, setCodeInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const PAGE_SIZE = 50;

  const refresh = useCallback(async (targetPage = 1) => {
    setLoading(true);
    const params: Record<string, string> = { page: String(targetPage), limit: String(PAGE_SIZE) };
    if (status) params.status = status;
    if (search) params.search = search;
    const res = await adminApi.fulfillments(params);
    setRows((res.rows as FulfillmentRow[]) || []);
    setStats((res.stats as Record<string, number>) || {});
    setPage((res.page as number) || 1);
    const totalCount = (res.total as number) || 0;
    setPages(Math.max(1, Math.ceil(totalCount / PAGE_SIZE)));
    setTotal(totalCount);
    setLoading(false);
  }, [status, search]);

  useEffect(() => {
    const t = setTimeout(() => refresh(1), 300);
    return () => clearTimeout(t);
  }, [refresh]);

  const openDeliver = (row: FulfillmentRow) => {
    setDelivering(row);
    setCodeInput('');
  };

  const submitDeliver = async () => {
    if (!delivering) return;
    const code = codeInput.trim().toUpperCase();
    if (!code) {
      alert('Enter the voucher code to deliver.');
      return;
    }
    if (!confirm(`Deliver voucher code "${code}" to ${delivering.customerName} (${delivering.customerEmail})?\n\nThe code will be assigned exclusively to this customer and emailed immediately.`)) return;
    setSaving(true);
    try {
      const res = await adminApi.deliverFulfillment(delivering._id, code);
      if (res?.success) {
        alert('✅ Voucher delivered — customer notified by email and My Vouchers updated.');
        setDelivering(null);
        refresh(page);
      } else {
        alert((res?.message as string) || 'Delivery failed');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delivery failed');
    } finally {
      setSaving(false);
    }
  };

  const cancelRequest = async (row: FulfillmentRow) => {
    if (!confirm(`Cancel fulfillment request ${row.requestId}? Use this only when a refund will be issued.`)) return;
    const reason = window.prompt('Reason (optional):', '') || '';
    setCancellingId(row._id);
    try {
      const res = await adminApi.cancelFulfillment(row._id, reason);
      if (res?.success) alert('Request cancelled.');
      else alert((res?.message as string) || 'Cancel failed');
      refresh(page);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Cancel failed');
    } finally {
      setCancellingId(null);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    const params: Record<string, string> = {};
    if (status) params.status = status;
    if (search) params.search = search;
    await adminApi.downloadExport('fulfillments', false, params);
    setExporting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl tracking-tight">Fulfillment Requests</h1>
          <p className="text-xs font-bold text-neutral-500 dark:text-[#B5B5B5] mt-1">
            Paid orders that need a voucher code supplied manually. Enter the code to deliver it — the customer is emailed and their account updates instantly.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={handleExport} disabled={exporting} className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] hover:border-brand-pink text-xs font-black flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50">
            <Download className="w-4 h-4 text-brand-pink" />
            <span>{exporting ? 'Exporting…' : 'Export CSV'}</span>
          </button>
          <button type="button" onClick={() => refresh(page)} className="p-2.5 rounded-xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] hover:border-brand-pink text-xs font-black transition-colors shadow-sm" title="Refresh list">
            <RefreshCw className={`w-4 h-4 text-neutral-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Processing', count: stats.processing || 0, tint: '#0284C7' },
          { label: 'Delivered', count: stats.delivered || 0, tint: '#10B981' },
          { label: 'Cancelled', count: stats.cancelled || 0, tint: '#F43F5E' },
          { label: 'Total', count: stats.total || 0, tint: '#6C3CE0' },
        ].map((kpi, idx) => (
          <div key={idx} className="p-4 rounded-2xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">{kpi.label}</div>
            <div className="font-heading font-black text-2xl mt-1" style={{ color: kpi.tint }}>{kpi.count}</div>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-55 px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929]">
          <Search className="w-4 h-4 text-neutral-400 shrink-0" />
          <input placeholder="Search request ID, order, name, email, voucher…" value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent outline-none text-xs font-bold w-full" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-xs font-bold">
          <option value="">All Statuses</option>
          <option value="PROCESSING">Processing</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="FAILED">Failed</option>
        </select>
      </div>

      <div className="rounded-3xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-5xl">
            <thead className="bg-neutral-50 dark:bg-[#0E0E0E] border-b border-[#EAEAEA] dark:border-[#292929]">
              <tr>
                <Th>Request</Th>
                <Th>Customer</Th>
                <Th>Product</Th>
                <Th>Order</Th>
                <Th>Payment</Th>
                <Th>Status</Th>
                <Th>Email</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAEAEA] dark:divide-[#262626]">
              {loading && Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}><td colSpan={8} className="p-4"><div className="h-10 bg-neutral-100 dark:bg-[#292929] rounded-xl animate-pulse" /></td></tr>
              ))}
              {!loading && rows.map((r) => (
                <tr key={r._id} className="hover:bg-neutral-50 dark:hover:bg-[#131316] transition-colors">
                  <Td>
                    <div className="font-mono text-[11px] font-black text-brand-pink">{r.requestId}</div>
                    <div className="text-[10px] font-bold text-neutral-400 mt-0.5">Requested {fmtDateTime(r.createdAt)}</div>
                  </Td>
                  <Td>
                    <div className="text-xs font-black text-neutral-900 dark:text-white">{r.customerName}</div>
                    <div className="text-[11px] font-bold text-neutral-500 dark:text-[#B5B5B5] break-all">{r.customerEmail}</div>
                  </Td>
                  <Td>
                    <div className="text-xs font-bold text-neutral-700 dark:text-neutral-200">{r.productName}</div>
                    <div className="text-[10px] font-black text-neutral-400 mt-0.5">{r.voucherType} × {r.quantity || 1}</div>
                  </Td>
                  <Td>
                    <div className="font-mono text-[11px] font-bold text-neutral-700 dark:text-neutral-200">{r.orderNo}</div>
                    <div className="text-[10px] font-black text-neutral-400 mt-0.5">{formatPrice(r.amountPaid, (r.currency as 'INR' | 'USD') || 'INR')}</div>
                  </Td>
                  <Td>
                    <div className="font-mono text-[10px] font-bold text-neutral-500 dark:text-neutral-400 break-all max-w-40 truncate" title={r.razorpayPaymentId || ''}>{r.razorpayPaymentId || '—'}</div>
                    {r.voucherCode && (
                      <div className="font-mono text-[11px] font-black text-emerald-600 dark:text-emerald-400 mt-1">Delivered: {r.voucherCode}</div>
                    )}
                  </Td>
                  <Td><StatusBadge status={r.status} /></Td>
                  <Td>
                    <EmailBadge status={r.emailStatus} />
                    {r.emailError && <div className="text-[9px] font-bold text-rose-500 mt-0.5 truncate max-w-28" title={r.emailError}>{r.emailError}</div>}
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1.5 justify-end">
                      {r.status === 'PROCESSING' && (
                        <>
                          <button
                            onClick={() => openDeliver(r)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 text-[10px] font-black inline-flex items-center gap-1 hover:bg-emerald-100 transition-colors cursor-pointer"
                          >
                            <Send className="w-3 h-3" /> Deliver Code
                          </button>
                          <button
                            onClick={() => cancelRequest(r)}
                            disabled={cancellingId === r._id}
                            className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900 disabled:opacity-50"
                            title="Cancel request (refund scenario)"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      )}
                      {r.status === 'DELIVERED' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Emailed {fmtDateTime(r.deliveredAt)}
                        </span>
                      )}
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && rows.length === 0 && (
          <div className="p-6">
            <Empty title="No fulfillment requests" desc="Paid orders awaiting a manually supplied voucher code will appear here." />
          </div>
        )}
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

      {delivering && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setDelivering(null); }}
          role="dialog"
          aria-modal="true"
          aria-label={`Deliver voucher for ${delivering.requestId}`}
        >
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
                  <Ticket className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </span>
                <div>
                  <h3 className="font-heading font-black text-lg text-neutral-900 dark:text-white">Deliver Voucher</h3>
                  <p className="text-[11px] font-bold text-neutral-500 dark:text-[#B5B5B5]">{delivering.requestId} · {delivering.orderNo}</p>
                </div>
              </div>
              <button onClick={() => setDelivering(null)} className="p-2 rounded-xl bg-neutral-100 dark:bg-[#222] text-neutral-500 hover:text-brand-pink transition-colors cursor-pointer" aria-label="Close">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] space-y-1.5 text-xs font-bold">
              <div className="flex justify-between"><span className="text-neutral-400">Customer</span><span className="text-neutral-900 dark:text-white">{delivering.customerName} · {delivering.customerEmail}</span></div>
              <div className="flex justify-between"><span className="text-neutral-400">Product</span><span className="text-neutral-900 dark:text-white">{delivering.productName} ({delivering.voucherType}) × {delivering.quantity || 1}</span></div>
              <div className="flex justify-between"><span className="text-neutral-400">Amount paid</span><span className="text-brand-pink font-black">{formatPrice(delivering.amountPaid)}</span></div>
              {delivering.razorpayPaymentId && <div className="flex justify-between"><span className="text-neutral-400">Payment ID</span><span className="font-mono text-[10px] text-neutral-700 dark:text-neutral-200 break-all">{delivering.razorpayPaymentId}</span></div>}
            </div>

            <label className="block">
              <Label>Voucher Code *</Label>
              <input
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                placeholder="e.g. APEX-PTE-XXXX-XXXX"
                className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] font-mono text-sm font-black uppercase tracking-wider focus:outline-none focus:border-brand-pink transition"
              />
              <span className="block text-[10px] font-bold text-neutral-400 mt-1.5">
                The code is validated: it must not already belong to another customer. Delivery marks the order FULFILLED and emails the customer instantly.
              </span>
            </label>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setDelivering(null)}
                disabled={saving}
                className="flex-1 py-3 rounded-xl bg-neutral-100 dark:bg-[#262626] text-neutral-700 dark:text-neutral-200 text-xs font-black disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={submitDeliver}
                disabled={saving || !codeInput.trim()}
                className="flex-1 py-3 rounded-xl btn-pink text-white text-xs font-black shadow-lg disabled:opacity-50 cursor-pointer"
              >
                {saving ? <span className="inline-flex items-center gap-1.5"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Delivering…</span> : 'Confirm & Deliver'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
