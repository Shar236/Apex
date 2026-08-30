'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Clock, CheckCircle2, Loader2, LogIn, AlertCircle, ArrowRight, ShoppingCart, Ticket } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { useVoucher } from '@/components/voucher-provider';
import { voucherRequestApi } from '@/lib/api';
import { Button } from '@/components/ui';

type Phase = 'confirm' | 'success' | 'duplicate' | 'available';

/**
 * Shown when a customer clicks "Request Voucher" on a product whose voucher-code
 * inventory is currently empty. Backend-driven — creates a real VoucherRequest
 * record via the existing /api/voucher-requests endpoint.
 */
export function VoucherRequestModal() {
  const router = useRouter();
  const { voucherRequestProduct: product, isVoucherRequestOpen, closeVoucherRequest, startCheckout, loadAccountData } = useVoucher();
  const { isAuthenticated } = useAuth();

  const [phase, setPhase] = useState<Phase>('confirm');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isVoucherRequestOpen) {
      setPhase('confirm');
      setSubmitting(false);
      setError('');
    }
  }, [isVoucherRequestOpen, product?.id, product?._id]);

  useEffect(() => {
    if (!isVoucherRequestOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) closeVoucherRequest();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [isVoucherRequestOpen, submitting, closeVoucherRequest]);

  const goToRequests = useCallback(() => {
    closeVoucherRequest();
    router.push('/account?tab=voucher-requests');
  }, [closeVoucherRequest, router]);

  const goToLogin = useCallback(() => {
    closeVoucherRequest();
    router.push('/login');
  }, [closeVoucherRequest, router]);

  const buyNow = useCallback(() => {
    const p = product;
    closeVoucherRequest();
    if (p) startCheckout(p);
  }, [product, closeVoucherRequest, startCheckout]);

  const submit = useCallback(async () => {
    if (!product || submitting) return;
    setSubmitting(true);
    setError('');
    const res = await voucherRequestApi.submit((product._id || product.id) as string);
    setSubmitting(false);

    if (res.success) {
      loadAccountData?.();
      setPhase(res.duplicate ? 'duplicate' : 'success');
      return;
    }
    if (res.code === 'STOCK_AVAILABLE') {
      setPhase('available');
      return;
    }
    setError(res.message || 'Could not submit your request. Please try again.');
  }, [product, submitting, loadAccountData]);

  if (!isVoucherRequestOpen || !product) return null;

  const productName = product.name || 'this voucher';

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => !submitting && closeVoucherRequest()}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full sm:max-w-md bg-surface border border-line rounded-t-3xl sm:rounded-3xl shadow-2xl text-ink overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 px-6 pt-6 pb-4 border-b border-line">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
              <Ticket className="w-4.5 h-4.5" />
            </div>
            <div className="leading-tight">
              <h3 className="font-heading font-medium text-base text-ink">Request Voucher</h3>
              <p className="text-[11px] font-normal text-ink-muted line-clamp-1">{productName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => !submitting && closeVoucherRequest()}
            aria-label="Close"
            className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-raised transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-6">
          {phase === 'confirm' && (
            <>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-accent" />
                <span className="font-heading font-medium text-sm text-ink">Voucher Currently Unavailable</span>
              </div>
              <p className="text-sm font-normal text-ink-muted leading-relaxed">This voucher is temporarily unavailable, but you can request it from our team.</p>
              <p className="mt-3 text-sm font-medium text-ink bg-surface-raised border border-line rounded-2xl px-4 py-3 leading-relaxed">
                You will receive your voucher within <span className="text-accent font-semibold">1–2 hours</span> after submitting your request.
              </p>

              {!isAuthenticated && (
                <p className="mt-4 text-xs font-normal text-ink-muted flex items-start gap-2">
                  <LogIn className="w-3.5 h-3.5 mt-0.5 shrink-0 text-accent" />
                  <span>Please log in or create an account before submitting your request.</span>
                </p>
              )}

              {error && (
                <p className="mt-4 text-xs font-medium text-red-600 dark:text-red-400 flex items-start gap-2">
                  <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </p>
              )}

              <div className="mt-6 flex flex-col-reverse sm:flex-row gap-2.5">
                <Button variant="ghost" size="md" fullWidth onClick={closeVoucherRequest} disabled={submitting}>
                  Cancel
                </Button>
                {isAuthenticated ? (
                  <Button variant="primary" size="md" fullWidth onClick={submit} disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Submitting…
                      </>
                    ) : (
                      <>
                        Submit Request <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                ) : (
                  <Button variant="primary" size="md" fullWidth onClick={goToLogin}>
                    <LogIn className="w-4 h-4" /> Log in to Request
                  </Button>
                )}
              </div>
            </>
          )}

          {phase === 'success' && (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="font-heading font-medium text-lg text-ink">🎉 Request Received!</h4>
              <p className="mt-2 text-sm font-normal text-ink-muted leading-relaxed">Thank you for your request. Our team has received it and will process it as soon as possible.</p>
              <p className="mt-3 text-sm font-medium text-ink">
                You will receive your voucher within <span className="text-accent font-semibold">1–2 hours</span>.
              </p>
              <div className="mt-6 flex flex-col-reverse sm:flex-row gap-2.5">
                <Button variant="ghost" size="md" fullWidth onClick={closeVoucherRequest}>
                  Close
                </Button>
                <Button variant="primary" size="md" fullWidth onClick={goToRequests}>
                  View My Requests <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {phase === 'duplicate' && (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-7 h-7" />
              </div>
              <h4 className="font-heading font-medium text-lg text-ink">Request Already Pending</h4>
              <p className="mt-2 text-sm font-normal text-ink-muted leading-relaxed">
                You already have a pending request for this voucher. Our team is processing it and you should receive it within <span className="text-accent font-semibold">1–2 hours</span>.
              </p>
              <div className="mt-6 flex flex-col-reverse sm:flex-row gap-2.5">
                <Button variant="ghost" size="md" fullWidth onClick={closeVoucherRequest}>
                  Close
                </Button>
                <Button variant="primary" size="md" fullWidth onClick={goToRequests}>
                  View My Requests <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {phase === 'available' && (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-7 h-7" />
              </div>
              <h4 className="font-heading font-medium text-lg text-ink">Good news — it&apos;s back in stock!</h4>
              <p className="mt-2 text-sm font-normal text-ink-muted leading-relaxed">This voucher just became available. You can buy it right now and get instant delivery.</p>
              <div className="mt-6 flex flex-col-reverse sm:flex-row gap-2.5">
                <Button variant="ghost" size="md" fullWidth onClick={closeVoucherRequest}>
                  Not now
                </Button>
                <Button variant="primary" size="md" fullWidth onClick={buyNow}>
                  <ShoppingCart className="w-4 h-4" /> Buy Now
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
