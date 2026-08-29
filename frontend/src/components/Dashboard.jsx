import React, { useState } from 'react';
import { useVoucher } from '../context/VoucherContext';
import { Ticket, Copy, Check, Send, RefreshCw, Clock, ShieldCheck, ExternalLink, HelpCircle, AlertCircle } from 'lucide-react';
import { ApexLogo } from './ApexLogo';

export const Dashboard = () => {
  const {
    userVouchers,
    formatPrice,
    transferVoucher,
    requestRefund,
    setActiveTab,
    accountOrders,
  } = useVoucher();
  const [copiedId, setCopiedId] = useState(null);
  const [revealedCodes, setRevealedCodes] = useState({});
  const [transferModalId, setTransferModalId] = useState(null);
  const [transferEmail, setTransferEmail] = useState('');
  const [refundConfirmId, setRefundConfirmId] = useState(null);

  const getOrderForVoucher = (orderNo) => {
    if (!accountOrders || !orderNo) return null;
    return accountOrders.find((o) => o.orderNo === orderNo) || null;
  };

  const computeVoucherSavings = (v) => {
    const order = getOrderForVoucher(v.orderNo);
    if (order) {
      const totalPaid = order.total;
      const itemsTotal =
        order.items?.reduce((s, i) => s + i.originalPrice * i.quantity, 0) || 0;
      const qty = order.items?.reduce((s, i) => s + i.quantity, 0) || 1;
      return {
        savings: Math.max(0, Math.round((itemsTotal - totalPaid) / (qty || 1))),
        paidPrice: Math.round(totalPaid / (qty || 1)),
        originalPrice: Math.round(itemsTotal / (qty || 1)),
      };
    }
    return { savings: 0, paidPrice: 0, originalPrice: 0 };
  };

  const toggleRevealCode = (id) => {
    setRevealedCodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyCode = (id, code) => {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const handleTransferSubmit = (e) => {
    e.preventDefault();
    if (!transferEmail) return;
    transferVoucher(transferModalId, transferEmail);
    setTransferModalId(null);
    setTransferEmail('');
  };

  const handleRefundSubmit = (id) => {
    requestRefund(id);
    setRefundConfirmId(null);
  };

  return (
    <section className="py-16 bg-[var(--color-surface-sunken)] border-b border-[var(--color-line)] min-h-[80vh] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-[var(--color-line)]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ApexLogo className="h-6" />
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[var(--color-accent)]/[0.08] text-xs font-normal text-[var(--color-accent)] border border-[var(--color-accent)]/20">
                <Ticket className="w-3.5 h-3.5" />
                <span>SELF-SERVE CANDIDATE VAULT</span>
              </span>
            </div>
            <h1 className="font-heading text-3xl font-medium text-[var(--color-ink)] pt-1">
              My Voucher Vault
            </h1>
            <p className="text-[var(--color-ink-muted)] text-xs sm:text-sm">
              Manage your active exam vouchers, reveal codes, transfer to friends, or request 1-click refunds.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('shop')}
            className="inline-flex items-center justify-center rounded-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-medium transition-colors py-3 px-6 text-xs shadow-md cursor-pointer"
          >
            + Buy Another Voucher
          </button>
        </div>

        {userVouchers && userVouchers.length > 0 ? (
          <div className="space-y-6">
            {userVouchers.map((v) => {
              const isRevealed = revealedCodes[v.id];
              const isExpired = v.status === 'EXPIRED' || v.daysRemaining <= 0;
              const isUsed = v.status === 'USED';
              const isRefunded = v.status === 'REFUNDED' || v.status === 'CANCELLED';
              const transferred = v.transferredTo ? true : false;
              const pricing = computeVoucherSavings(v);
              const purchaseDate = v.assignedAt
                ? new Date(v.assignedAt).toLocaleDateString()
                : new Date(v.createdAt || Date.now()).toLocaleDateString();
              const redeemUrl = v.productName?.toLowerCase()?.includes('pte')
                ? 'https://mypte.pearsonpte.com/'
                : v.productName?.toLowerCase()?.includes('gre') || v.productName?.toLowerCase()?.includes('toefl')
                ? 'https://www.ets.org/'
                : 'https://englishtest.duolingo.com/';

              return (
                <div
                  key={v.id}
                  className={`bg-[var(--color-surface)] rounded-3xl p-6 sm:p-8 border border-[var(--color-line)] shadow-lg transition-all duration-300 ${
                    isRefunded ? 'opacity-60 bg-[var(--color-surface-raised)]' : ''
                  } ${isUsed ? 'border-sky-200/40 dark:border-sky-900/40' : ''}`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[var(--color-line)]">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider ${
                            isRefunded
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400'
                              : isExpired
                              ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                              : isUsed
                              ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-900/40'
                              : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400'
                          }`}
                        >
                          • Status: {transferred ? 'TRANSFERRED' : v.status}
                        </span>
                        <span className="text-xs font-normal text-neutral-400 dark:text-neutral-500">
                          Purchased on {purchaseDate}
                        </span>
                      </div>

                      <h3 className="font-heading font-medium text-xl sm:text-2xl text-[var(--color-ink)] leading-tight">
                        {v.productName}
                      </h3>

                      <p className="text-xs text-[var(--color-ink-muted)] font-medium flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                        <span>
                          Valid until <strong className="text-[var(--color-ink)]">
                            {new Date(v.expiryDate).toLocaleDateString()}
                          </strong> ({v.daysRemaining > 0 ? `${v.daysRemaining} days remaining` : 'Expired'}
                        </span>
                      </p>
                      {v.transferredTo && (
                        <p className="text-xs font-normal text-amber-700 dark:text-amber-400 flex items-center gap-1">
                          <Send className="w-3 h-3" />
                          Transferred to: {v.transferredTo}
                        </p>
                      )}
                    </div>

                    <div className="bg-[var(--color-accent)]/[0.08] p-4 rounded-2xl border border-[var(--color-accent)]/20 text-right shrink-0">
                      <span className="text-[10px] font-medium text-[var(--color-accent)] uppercase tracking-wider block">
                      Official Savings
                    </span>
                      <span className="font-heading font-medium text-2xl text-[var(--color-accent)] block leading-none">
                        Save {formatPrice(pricing.savings)}
                      </span>
                      <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-semibold block mt-1">
                        Paid: {formatPrice(pricing.paidPrice)}{' '}
                        {pricing.originalPrice > 0 ? `(MRP ${formatPrice(pricing.originalPrice)})` : ''}
                      </span>
                    </div>
                  </div>

                  <div className="pt-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    <div className="md:col-span-7">
                      <div className="bg-[var(--color-surface-raised)] p-4 rounded-2xl border border-[var(--color-line)] flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">
                            Official Discount Code
                          </span>
                          <span className="font-heading font-medium text-xl tracking-widest text-[var(--color-ink)] select-all">
                            {isRevealed ? v.code : '••••••••••••••••'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleRevealCode(v.id)}
                            className="px-3 py-2 rounded-xl bg-[var(--color-surface)] text-[var(--color-ink-muted)] border border-[var(--color-line)] text-xs font-normal hover:border-[var(--color-accent)] transition-colors"
                          >
                            {isRevealed ? 'Hide Code' : 'Reveal Code'}
                          </button>

                          {isRevealed && (
                            <button
                              onClick={() => handleCopyCode(v.id, v.code)}
                              className="px-3.5 py-2 rounded-xl bg-[var(--color-accent)] text-white text-xs font-normal flex items-center gap-1.5 shadow-sm hover:bg-[var(--color-accent-hover)] transition-colors"
                            >
                              {copiedId === v.id ? (
                                <Check className="w-4 h-4" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                              <span>{copiedId === v.id ? 'Copied!' : 'Copy'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-5 flex flex-wrap items-center justify-end gap-3">
                      {!isRefunded && !isExpired && !isUsed && !transferred && (
                        <>
                          <button
                            onClick={() => setTransferModalId(v.id)}
                            className="px-4 py-2.5 rounded-xl bg-[var(--color-surface)] text-[var(--color-ink)] border border-[var(--color-line)] text-xs font-normal hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-all flex items-center gap-1.5"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Transfer Code</span>
                          </button>

                          <button
                            onClick={() => setRefundConfirmId(v.id)}
                            className="px-4 py-2.5 rounded-xl bg-[var(--color-surface)] text-neutral-500 hover:text-rose-600 border border-[var(--color-line)] text-xs font-normal transition-all flex items-center gap-1.5"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Request Refund</span>
                          </button>
                        </>
                      )}

                      <a
                        href={redeemUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2.5 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] transition-colors text-xs font-medium flex items-center gap-1.5 shadow-sm"
                      >
                        <span>Redeem on Official Site</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-[var(--color-surface)] rounded-3xl border border-[var(--color-line)] p-8 space-y-4">
            <div className="w-20 h-20 rounded-full bg-[var(--color-accent)]/[0.08] text-[var(--color-accent)] flex items-center justify-center mx-auto">
              <Ticket className="w-10 h-10" />
            </div>
            <h3 className="font-heading font-medium text-xl text-[var(--color-ink)]">
              No Exam Vouchers Found
            </h3>
            <p className="text-xs text-[var(--color-ink-muted)] max-w-sm mx-auto font-medium">
              You don't have any active exam vouchers in your vault yet. Explore our discounted PTE, GRE, and TOEFL vouchers to get started.
            </p>
            <button
              onClick={() => setActiveTab('shop')} className="inline-flex items-center justify-center rounded-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-medium transition-colors py-3.5 px-8 text-xs cursor-pointer">
              Browse Discount Vouchers
            </button>
          </div>
        )}
      </div>

      {transferModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[var(--color-surface)] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[var(--color-line)] text-[var(--color-ink)] space-y-4">
            <h3 className="font-heading font-medium text-xl">Transfer Voucher Code</h3>
            <p className="text-xs text-[var(--color-ink-muted)] font-medium">
              Enter recipient's email address to instantly transfer ownership of this voucher.
            </p>
            <form onSubmit={handleTransferSubmit} className="space-y-4">
              <input
                type="email"
                required
                placeholder="friend@gmail.com"
                value={transferEmail}
                onChange={(e) => setTransferEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface-raised)] border border-[var(--color-line)] text-xs font-normal focus:outline-none focus:border-[var(--color-accent)]"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTransferModalId(null)}
                  className="flex-1 py-3 rounded-xl bg-[var(--color-surface-raised)] font-normal text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white transition-colors py-3 text-xs font-medium cursor-pointer">
                  Confirm Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {refundConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[var(--color-surface)] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[var(--color-line)] text-[var(--color-ink)] space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-medium text-xl">100% Refund Guarantee</h3>
            <p className="text-xs text-[var(--color-ink-muted)] font-medium">
              Are you sure you want to request a refund? Your voucher code will be invalidated immediately, and funds returned to your source account within 24-48 hours.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setRefundConfirmId(null)}
                className="flex-1 py-3 rounded-xl bg-[var(--color-surface-raised)] font-normal text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRefundSubmit(refundConfirmId)}
                className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs transition-colors"
              >
                Yes, Issue Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
