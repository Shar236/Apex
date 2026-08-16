import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useVoucher } from '../context/VoucherContext';
import { accountApi, formatPrice } from '../lib/api';
import { ApexLogo } from './ApexLogo';
import {
  Ticket,
  ClipboardList,
  User as UserIcon,
  Package,
  LogOut,
  Crown,
  ArrowRight,
  Copy,
  Check,
  ShieldCheck,
  Send,
  Clock,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const tabs = [
  { id: 'overview', label: 'Overview', icon: <Crown className="w-4 h-4" /> },
  { id: 'orders', label: 'My Orders', icon: <ClipboardList className="w-4 h-4" /> },
  { id: 'vouchers', label: 'My Vouchers', icon: <Ticket className="w-4 h-4" /> },
  { id: 'profile', label: 'Profile', icon: <UserIcon className="w-4 h-4" /> },
];

const statusColor = (s) => {
  const l = String(s || '').toUpperCase();
  if (['ASSIGNED', 'SOLD', 'ACTIVE', 'PAID', 'FULFILLED'].includes(l)) return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/40';
  if (['USED'].includes(l)) return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-900/40';
  if (['EXPIRED', 'CANCELLED', 'FAILED', 'REFUNDED'].includes(l)) return 'bg-neutral-100 text-neutral-500 border-neutral-200 dark:bg-neutral-800/50 dark:text-neutral-400 dark:border-neutral-700';
  if (['REFUND_REQUESTED', 'TRANSFERRED'].includes(l)) return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/40';
  return 'bg-amber-50 text-amber-700 border-amber-200';
};

export default function AccountHome({ initialTab = 'overview' }) {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const {
    accountStats,
    accountOrders,
    userVouchers,
    setActiveTab,
    formatPrice,
    transferVoucher,
    markVoucherUsed,
    requestRefund,
    loadAccountData,
  } = useVoucher();

  const [tab, setTab] = useState(initialTab);
  const [copiedId, setCopiedId] = useState(null);
  const [revealedCodes, setRevealedCodes] = useState({});
  const [transferModalId, setTransferModalId] = useState(null);
  const [transferEmail, setTransferEmail] = useState('');
  const [refundConfirmId, setRefundConfirmId] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '' });

  useEffect(() => {
    setProfileForm({ name: user?.name || '', phone: user?.phone || '' });
  }, [user]);

  useEffect(() => {
    setActiveTab('dashboard');
    return () => setActiveTab('home');
  }, [setActiveTab]);

  const copy = (id, code) => {
    navigator.clipboard?.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const toggleReveal = (id) =>
    setRevealedCodes((p) => ({ ...p, [id]: !p[id] }));

  const submitTransfer = (e) => {
    e.preventDefault();
    if (!transferEmail) return;
    transferVoucher(transferModalId, transferEmail);
    setTransferModalId(null);
    setTransferEmail('');
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    const res = await accountApi.updateProfile(profileForm);
    setProfileLoading(false);
    if (res.success) {
      refreshUser();
      loadAccountData();
      alert('Profile updated');
    } else {
      alert(res.message || 'Failed');
    }
  };

  const stats = [
    { label: 'Total Orders', value: accountStats?.totalOrders || 0, tint: 'bg-[#FF005C]' },
    { label: 'Active Vouchers', value: accountStats?.activeVouchers || 0, tint: 'bg-emerald-500' },
    { label: 'Used Vouchers', value: accountStats?.usedVouchers || 0, tint: 'bg-sky-500' },
    { label: 'Expiring Soon', value: accountStats?.expiringSoon || 0, tint: 'bg-amber-500' },
    { label: 'Total Saved', value: formatPrice(accountStats?.totalSaved || 0), tint: 'bg-indigo-500' },
  ];

  return (
    <section className="py-10 sm:py-14 bg-white dark:bg-[#0A0A0A] min-h-[80vh] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ApexLogo className="h-7" />
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0F5] dark:bg-[#2A0A17] text-[11px] font-black text-[#FF005C] border border-[#FF005C]/20">
                <Ticket className="w-3.5 h-3.5" />
                SELF-SERVE CANDIDATE VAULT
              </span>
            </div>
            <h1 className="font-heading font-black text-3xl tracking-tight text-neutral-900 dark:text-white">
              Hi, {user?.name?.split(' ')[0] || 'Apex User'} 👋
            </h1>
            <p className="text-sm text-neutral-500 dark:text-[#B5B5B5]">
              Manage your exam vouchers, orders, profile and refunds — all in one place.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-[#262626] text-neutral-700 dark:text-neutral-200 text-xs font-black transition hover:bg-neutral-200"
            >
              Browse Vouchers
            </button>
            <button
              onClick={() => { logout(); navigate('/'); }}
              className="px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 text-xs font-black border border-rose-200 dark:border-rose-900/40 flex items-center gap-1.5 transition"
            >
              <LogOut className="w-4 h-4" />
              Log out
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black border transition ${
                tab === t.id
                  ? 'bg-[#FF005C] text-white border-[#FF005C] shadow-lg'
                  : 'bg-white dark:bg-[#161616] text-neutral-600 dark:text-neutral-300 border-[#EAEAEA] dark:border-[#292929] hover:text-[#FF005C]'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
              {stats.map((s) => (
                <div key={s.label} className="rounded-3xl p-5 bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm">
                  <div className={`w-9 h-9 rounded-xl ${s.tint} opacity-90 mb-3`} />
                  <div className="text-xs font-bold text-neutral-500 dark:text-[#B5B5B5]">{s.label}</div>
                  <div className="font-heading font-black text-2xl mt-1 tabular-nums text-neutral-900 dark:text-white">{s.value}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 rounded-3xl p-6 bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-black text-neutral-900 dark:text-white">Recent Orders</h3>
                  <button onClick={() => setTab('orders')} className="text-xs font-black text-[#FF005C] flex items-center gap-1">
                    View all <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-3">
                  {accountOrders?.slice(0, 4)?.length === 0 && (
                    <EmptyState icon={<Package className="w-7 h-7 text-neutral-400" />} title="No orders yet" desc="Browse vouchers and place your first discounted exam order." />
                  )}
                  {accountOrders?.slice(0, 4)?.map((o) => (
                    <OrderRow key={o._id} o={o} />
                  ))}
                </div>
              </div>
              <div className="rounded-3xl p-6 bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-black text-neutral-900 dark:text-white">Voucher Wallet</h3>
                  <button onClick={() => setTab('vouchers')} className="text-xs font-black text-[#FF005C]">See all</button>
                </div>
                <div className="space-y-3">
                  {userVouchers?.slice(0, 3)?.length === 0 && (
                    <EmptyState icon={<Ticket className="w-7 h-7 text-neutral-400" />} title="No vouchers yet" desc="Your purchased codes will appear here instantly after payment." />
                  )}
                  {userVouchers?.slice(0, 3)?.map((v) => (
                    <VoucherMini key={v.id} v={v} />
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {tab === 'orders' && (
          <div className="rounded-3xl p-6 bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm">
            <h3 className="font-black text-xl mb-5 text-neutral-900 dark:text-white">All Orders</h3>
            <div className="space-y-3">
              {accountOrders?.length === 0 && (
                <EmptyState icon={<ClipboardList className="w-7 h-7 text-neutral-400" />} title="No orders yet" desc="Place an order and it will appear here." />
              )}
              {accountOrders?.map((o) => (
                <OrderRow key={o._id} o={o} detailed />
              ))}
            </div>
          </div>
        )}

        {tab === 'vouchers' && (
          <div className="space-y-5">
            {userVouchers?.length === 0 && (
              <EmptyState icon={<Ticket className="w-7 h-7 text-neutral-400" />} title="Your vault is empty" desc="Buy your first voucher and the code lands here instantly." />
            )}
            {userVouchers?.map((v) => {
              const isRevealed = revealedCodes[v.id];
              const isExpired = v.status === 'EXPIRED' || v.daysRemaining <= 0;
              return (
                <div key={v.id} className={`rounded-3xl p-6 sm:p-7 bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-md ${isExpired ? 'opacity-70' : ''}`}>
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black border ${statusColor(v.status)}`}>
                          {v.status}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-neutral-500 dark:text-[#B5B5B5]">
                          <Clock className="w-3.5 h-3.5" />
                          {v.daysRemaining > 0 ? `${v.daysRemaining} days left` : 'Expired'}
                        </span>
                        {v.transferredTo && <span className="text-[11px] font-bold text-amber-700">Transferred to {v.transferredTo}</span>}
                      </div>
                      <h4 className="font-heading font-black text-lg text-neutral-900 dark:text-white mb-1">{v.productName}</h4>
                      <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs font-bold text-neutral-500 dark:text-[#B5B5B5]">
                        <span>Brand: {v.brand || '—'}</span>
                        <span>Assigned: {new Date(v.assignedAt || v.createdAt).toLocaleDateString()}</span>
                        <span>Expiry: {new Date(v.expiryDate).toLocaleDateString()}</span>
                        {v.orderNo && <span>Order: #{v.orderNo}</span>}
                      </div>

                      <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[#F3EEFF] dark:bg-[#1e1638] border border-[#6C3CE0]/20 flex-1 min-w-0">
                          <ShieldCheck className="w-5 h-5 text-[#6C3CE0] flex-shrink-0" />
                          <span className="font-mono font-black tracking-wider text-neutral-900 dark:text-white truncate">
                            {isRevealed ? v.code : `${v.code?.slice(0, 4) || 'XXXX'}-XXXX-XXXX-XXXX`}
                          </span>
                          <div className="ml-auto flex items-center gap-2">
                            <button
                              onClick={() => toggleReveal(v.id)}
                              className="p-1.5 rounded-lg bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] text-neutral-600 dark:text-neutral-300 text-[10px] font-black"
                            >
                              {isRevealed ? 'HIDE' : 'REVEAL'}
                            </button>
                            <button
                              onClick={() => copy(v.id, v.code)}
                              className="p-2 rounded-lg bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] text-neutral-600 dark:text-neutral-300"
                            >
                              {copiedId === v.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      {!['USED', 'EXPIRED', 'CANCELLED', 'REFUNDED'].includes(v.status) && (
                        <>
                          <button
                            onClick={() => markVoucherUsed(v.id)}
                            className="px-4 py-2.5 rounded-xl text-xs font-black bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-900/40 flex items-center gap-1.5"
                          >
                            <ShieldCheck className="w-4 h-4" /> Mark Used
                          </button>
                          <button
                            onClick={() => setTransferModalId(v.id)}
                            className="px-4 py-2.5 rounded-xl text-xs font-black bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40 flex items-center gap-1.5"
                          >
                            <Send className="w-4 h-4" /> Transfer
                          </button>
                          <button
                            onClick={() => setRefundConfirmId(v.id)}
                            className="px-4 py-2.5 rounded-xl text-xs font-black bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 flex items-center gap-1.5"
                          >
                            <RefreshCw className="w-4 h-4" /> Request Refund
                          </button>
                        </>
                      )}
                      <a
                        href="https://pearsonpte.com"
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2.5 rounded-xl text-xs font-black bg-[#FF005C] text-white shadow flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-4 h-4" /> Redeem on Pearson
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === 'profile' && (
          <div className="rounded-3xl p-6 sm:p-7 bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm max-w-2xl">
            <h3 className="font-black text-xl mb-6 text-neutral-900 dark:text-white">Profile Information</h3>
            <form onSubmit={saveProfile} className="space-y-4">
              <Field label="Full name" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} required />
              <Field label="Email" value={user?.email || ''} disabled />
              <Field label="WhatsApp / Phone" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} />
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-xs font-bold text-amber-800 dark:text-amber-300">
                🔒 <strong>Passport name match reminder:</strong> Pearson requires the name on your exam booking to exactly match your government-issued photo ID.
              </div>
              <button disabled={profileLoading} className="btn-pink text-white px-6 py-3 rounded-2xl font-black shadow disabled:opacity-60">
                {profileLoading ? 'Saving…' : 'Save changes'}
              </button>
            </form>
          </div>
        )}

        {transferModalId && (
          <Modal onClose={() => setTransferModalId(null)} title="Transfer Voucher">
            <p className="text-sm text-neutral-500 dark:text-[#B5B5B5] mb-4">Enter the recipient's email. Transfers are logged for security.</p>
            <form onSubmit={submitTransfer} className="space-y-4">
              <Field label="Recipient email" type="email" value={transferEmail} onChange={(e) => setTransferEmail(e.target.value)} required placeholder="friend@example.com" />
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setTransferModalId(null)} className="px-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-[#262626] text-neutral-700 dark:text-neutral-200 text-xs font-black">Cancel</button>
                <button className="btn-pink text-white px-5 py-2.5 rounded-xl text-xs font-black">Confirm transfer</button>
              </div>
            </form>
          </Modal>
        )}
        {refundConfirmId && (
          <Modal onClose={() => setRefundConfirmId(null)} title="Request Refund">
            <p className="text-sm text-neutral-500 dark:text-[#B5B5B5] mb-4">
              Unused vouchers qualify for 100% refund within 7 days, 80% within 30 days, 50% within 90 days.
            </p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setRefundConfirmId(null)} className="px-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-[#262626] text-neutral-700 dark:text-neutral-200 text-xs font-black">Cancel</button>
              <button
                onClick={() => { requestRefund(refundConfirmId); setRefundConfirmId(null); }}
                className="btn-pink text-white px-5 py-2.5 rounded-xl text-xs font-black"
              >Confirm request</button>
            </div>
          </Modal>
        )}
      </div>
    </section>
  );
}

function Field({ label, value, onChange, type = 'text', disabled, placeholder, required }) {
  return (
    <label className="block">
      <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-500 dark:text-[#B5B5B5] mb-2 block">{label}</span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-3 bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] rounded-2xl text-neutral-900 dark:text-white text-sm font-bold focus:border-[#FF005C] focus:outline-none focus:ring-2 focus:ring-[#FF005C]/20 disabled:opacity-60"
      />
    </label>
  );
}

function OrderRow({ o, detailed = false }) {
  const items = o.items || [];
  return (
    <div className="rounded-2xl p-4 bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div>
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="font-black text-neutral-900 dark:text-white text-sm">#{o.orderNo}</span>
          <span className={`px-2 py-0.5 rounded-full border text-[10px] font-black ${statusColor(o.orderStatus)}`}>{o.orderStatus}</span>
          <span className={`px-2 py-0.5 rounded-full border text-[10px] font-black ${statusColor(o.paymentStatus)}`}>{o.paymentStatus}</span>
        </div>
        <div className="text-xs font-bold text-neutral-500 dark:text-[#B5B5B5]">
          {new Date(o.createdAt).toLocaleString()} · {items.length} {items.length === 1 ? 'item' : 'items'}
          {detailed && o.billingDetails?.email && <> · {o.billingDetails.email}</>}
        </div>
      </div>
      <div className="text-right">
        <div className="font-heading font-black text-lg text-neutral-900 dark:text-white tabular-nums">{formatPrice(o.total)}</div>
        {detailed && o.promoCode && <div className="text-[10px] font-black text-[#FF005C]">Promo: {o.promoCode}</div>}
      </div>
    </div>
  );
}

function VoucherMini({ v }) {
  return (
    <div className="rounded-2xl p-4 bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929]">
      <div className="flex items-center justify-between mb-1.5">
        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-black ${statusColor(v.status)}`}>{v.status}</span>
        <span className="text-[10px] font-black text-neutral-500 dark:text-[#B5B5B5]">{v.daysRemaining}d left</span>
      </div>
      <div className="font-black text-sm text-neutral-900 dark:text-white truncate">{v.productName}</div>
      <div className="font-mono text-[11px] font-bold text-[#6C3CE0] mt-0.5">{v.code?.slice(0, 12) || 'XXXX-XXXX-XX'}…</div>
    </div>
  );
}

function EmptyState({ icon, title, desc }) {
  return (
    <div className="text-center py-10 rounded-2xl border border-dashed border-[#EAEAEA] dark:border-[#292929]">
      <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-neutral-100 dark:bg-[#262626] flex items-center justify-center">{icon}</div>
      <div className="font-black text-neutral-900 dark:text-white">{title}</div>
      <div className="text-xs font-bold text-neutral-500 dark:text-[#B5B5B5] mt-1 max-w-sm mx-auto">{desc}</div>
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-3xl bg-white dark:bg-[#161616] p-7 border border-[#EAEAEA] dark:border-[#292929] shadow-2xl text-neutral-900 dark:text-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-lg">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-xl bg-neutral-100 dark:bg-[#262626] text-neutral-600 dark:text-neutral-200 text-xs font-black">Close</button>
        </div>
        {children}
      </div>
    </div>
  );
}
