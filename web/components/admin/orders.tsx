'use client';

import { Fragment, useCallback, useEffect, useState } from 'react';
import { adminApi, formatPrice } from '@/lib/api';
import { Pill, Th, Td, Empty } from '@/components/admin/admin-ui';

interface AdminOrder {
  _id: string;
  orderNo?: string;
  total?: number;
  items?: unknown[];
  orderStatus?: string;
  paymentStatus?: string;
  emailStatus?: string;
  createdAt?: string;
  userId?: { name?: string; email?: string; phone?: string } | null;
  customerSnapshot?: { name?: string; email?: string; phone?: string } | null;
  billingDetails?: { name?: string; email?: string; phone?: string } | null;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  paymentReference?: string | null;
  paymentProvider?: string | null;
  currency?: string;
  fulfillmentStatus?: string | null;
  fulfillmentError?: string | null;
  paidAt?: string | null;
  emailSentAt?: string | null;
  adminNotifiedAt?: string | null;
}

const maskCode = (code: string) => {
  const c = String(code || '');
  if (c.length <= 4) return '••••';
  return `${c.slice(0, 2)}••••${c.slice(-2)}`;
};

function OrderDetailPanel({ order }: { order: AdminOrder }) {
  const [detail, setDetail] = useState<{ data?: AdminOrder; vouchers?: Array<{ _id: string; code: string; status?: string; voucherType?: string; productId?: { name?: string } | null }> } | null>(null);
  const [loading, setLoading] = useState(true);
  const [reveal, setReveal] = useState(false);

  useEffect(() => {
    let alive = true;
    adminApi.order(order._id).then((res) => {
      if (!alive) return;
      setDetail(res.success ? (res as never) : { data: order, vouchers: [] });
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [order._id]);

  if (loading) return <div className="p-4 text-xs font-bold text-neutral-400 animate-pulse">Loading order details…</div>;
  const o = detail?.data || order;
  const vouchers = detail?.vouchers || [];

  const F = ({ label, value, mono }: { label: string; value?: React.ReactNode; mono?: boolean }) => (
    <div>
      <div className="text-[9px] font-black uppercase tracking-wider text-neutral-400">{label}</div>
      <div className={`text-xs font-bold text-neutral-800 dark:text-neutral-200 break-all ${mono ? 'font-mono' : ''}`}>{value || '—'}</div>
    </div>
  );

  return (
    <div className="p-4 bg-neutral-50 dark:bg-[#0E0E0E] border-t border-[#EAEAEA] dark:border-[#292929] space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <F label="Internal Order ID" value={o._id} mono />
        <F label="Order No" value={o.orderNo} mono />
        <F label="Razorpay Order ID" value={o.razorpayOrderId} mono />
        <F label="Razorpay Payment ID" value={o.razorpayPaymentId || o.paymentReference} mono />
        <F label="Payment Provider" value={o.paymentProvider} />
        <F label="Amount" value={`${formatPrice(o.total)} ${o.currency || 'INR'}`} />
        <F label="Payment Status" value={o.paymentStatus} />
        <F label="Order Status" value={o.orderStatus} />
        <F label="Fulfillment Status" value={o.fulfillmentStatus} />
        <F label="Paid At" value={o.paidAt ? new Date(o.paidAt).toLocaleString() : '—'} />
        <F label="Email Delivery" value={`${o.emailStatus || 'PENDING'}${o.emailSentAt ? ' · ' + new Date(o.emailSentAt).toLocaleString() : ''}`} />
        <F label="Admin Notified" value={o.adminNotifiedAt ? new Date(o.adminNotifiedAt).toLocaleString() : '—'} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <F label="Customer" value={o.userId?.name || o.customerSnapshot?.name || o.billingDetails?.name} />
        <F label="Email" value={o.userId?.email || o.customerSnapshot?.email || o.billingDetails?.email} />
        <F label="Phone" value={o.userId?.phone || o.customerSnapshot?.phone || o.billingDetails?.phone} />
      </div>

      {o.fulfillmentError && (
        <div className="text-[11px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-lg px-3 py-2">
          Fulfillment error: {o.fulfillmentError}
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <div className="text-[9px] font-black uppercase tracking-wider text-neutral-400">Voucher Codes Delivered ({vouchers.length})</div>
          {vouchers.length > 0 && (
            <button onClick={() => setReveal((r) => !r)} className="text-[10px] font-black text-brand-pink">
              {reveal ? 'Hide codes' : 'Reveal codes'}
            </button>
          )}
        </div>
        {vouchers.length === 0 ? (
          <div className="text-xs font-bold text-neutral-400">
            {o.paymentStatus === 'PAID' ? 'No voucher codes allocated to this order yet.' : 'Not fulfilled — no codes issued.'}
          </div>
        ) : (
          <div className="space-y-1">
            {vouchers.map((v) => (
              <div key={v._id} className="flex items-center justify-between text-xs font-bold bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] rounded-lg px-3 py-2">
                <span className="font-mono">{reveal ? v.code : maskCode(v.code)}</span>
                <span className="text-neutral-400">{v.productId?.name || v.voucherType} · {v.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function OrdersAdmin() {
  const [rows, setRows] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const res = await adminApi.orders(status ? { status } : {});
    setRows((res.data as AdminOrder[]) || []);
    setLoading(false);
  }, [status]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const updateStatus = async (id: string, orderStatus: string, paymentStatus: string) => {
    const res = await adminApi.updateOrderStatus(id, { orderStatus, paymentStatus });
    if (res.success) refresh();
    else alert(res.message);
  };

  const handleResendEmail = async (id: string) => {
    const res = await adminApi.resendOrderEmail(id);
    alert(res.message);
    if (res.success) refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl tracking-tight">Order Management</h1>
          <p className="text-xs font-bold text-neutral-500 dark:text-[#B5B5B5]">Review customer orders, payment status, email delivery, and voucher allocation.</p>
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-3 py-2 rounded-xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] text-xs font-bold">
          <option value="">All statuses</option>
          {['PENDING', 'PAYMENT_PENDING', 'PAID', 'PROCESSING', 'PAYMENT_RECEIVED_NEEDS_ALLOCATION', 'FULFILLED', 'CANCELLED', 'REFUNDED', 'FAILED'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="rounded-3xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-bold">
            <thead className="bg-neutral-50 dark:bg-[#0E0E0E] text-neutral-500">
              <tr>
                <Th>Order No</Th>
                <Th>Customer</Th>
                <Th className="text-right">Total</Th>
                <Th>Items</Th>
                <Th>Order Status</Th>
                <Th>Payment Status</Th>
                <Th>Email Status</Th>
                <Th>Date</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={9} className="p-4"><div className="h-8 bg-neutral-100 dark:bg-[#292929] rounded animate-pulse" /></td></tr>}
              {!loading && rows.map((o) => (
                <FragmentRow key={o._id} o={o} expandedId={expandedId} setExpandedId={setExpandedId} updateStatus={updateStatus} handleResendEmail={handleResendEmail} />
              ))}
            </tbody>
          </table>
        </div>
        {!loading && rows.length === 0 && <Empty title="No orders" />}
      </div>
    </div>
  );
}

function FragmentRow({
  o,
  expandedId,
  setExpandedId,
  updateStatus,
  handleResendEmail,
}: {
  o: AdminOrder;
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  updateStatus: (id: string, os: string, ps: string) => void;
  handleResendEmail: (id: string) => void;
}) {
  return (
    <Fragment>
      <tr className="border-t border-[#EAEAEA] dark:border-[#292929]">
        <Td className="whitespace-nowrap font-black">
          <button
            onClick={() => setExpandedId(expandedId === o._id ? null : o._id)}
            className="inline-flex items-center gap-1 hover:text-brand-pink transition-colors cursor-pointer"
            title="View Razorpay IDs, fulfillment & delivered codes"
          >
            <span className={`transition-transform ${expandedId === o._id ? 'rotate-90' : ''}`}>▸</span>
            #{o.orderNo}
          </button>
        </Td>
        <Td className="whitespace-nowrap">
          {o.userId?.name || o.customerSnapshot?.name || 'Guest'}
          <div className="text-[10px] text-neutral-400">{o.userId?.email || o.customerSnapshot?.email || ''}</div>
        </Td>
        <Td className="text-right tabular-nums">{formatPrice(o.total)}</Td>
        <Td>{(o.items || []).length}</Td>
        <Td><Pill text={o.orderStatus || '—'} /></Td>
        <Td><Pill text={o.paymentStatus || '—'} tint="sky" /></Td>
        <Td>
          <Pill text={o.emailStatus || 'PENDING'} tint={o.emailStatus === 'SENT' ? 'emerald' : o.emailStatus === 'FAILED' ? 'rose' : 'amber'} />
        </Td>
        <Td className="whitespace-nowrap">{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '—'}</Td>
        <Td className="whitespace-nowrap">
          {o.paymentStatus === 'PAID' && (
            <button onClick={() => handleResendEmail(o._id)} className="mr-1 px-2.5 py-1 rounded-lg bg-pink-50 dark:bg-pink-950/40 text-brand-pink border border-brand-pink/30 text-[10px] font-black">
              Resend Email
            </button>
          )}
          {o.orderStatus !== 'FULFILLED' && (
            <button onClick={() => updateStatus(o._id, 'FULFILLED', 'PAID')} className="mr-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 text-[10px] font-black">
              Fulfill
            </button>
          )}
          {o.orderStatus === 'PAYMENT_PENDING' && (
            <button onClick={() => updateStatus(o._id, 'PAID', 'PAID')} className="mr-1 px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border border-sky-200 text-[10px] font-black">
              Mark Paid
            </button>
          )}
          {o.orderStatus !== 'REFUNDED' && o.paymentStatus === 'PAID' && (
            <button onClick={() => updateStatus(o._id, 'REFUNDED', 'REFUNDED')} className="mr-1 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 text-[10px] font-black">
              Refund
            </button>
          )}
          {o.orderStatus !== 'CANCELLED' && (
            <button onClick={() => updateStatus(o._id, 'CANCELLED', 'CANCELLED')} className="px-2.5 py-1 rounded-lg bg-neutral-100 text-neutral-600 border border-neutral-200 text-[10px] font-black">
              Cancel
            </button>
          )}
        </Td>
      </tr>
      {expandedId === o._id && (
        <tr>
          <td colSpan={9} className="p-0">
            <OrderDetailPanel order={o} />
          </td>
        </tr>
      )}
    </Fragment>
  );
}
