import React, { useEffect } from 'react';
import { useVoucher } from '../context/VoucherContext';
import { X, CheckCircle2, ExternalLink, ShoppingCart, ArrowRight } from 'lucide-react';
import { ApexLogo } from './ApexLogo';
import {
  Button, Badge, StockBadge, PriceDisplay, DiscountBadge,
  ProviderLogo, DeliveryValidityBar,
} from './ui';

const DEFAULT_INCLUSIONS = [
  'Instant 10-second delivery to Email & WhatsApp',
  'Valid for 6–12 months from purchase date',
  'Valid across all exam test centers in India',
  '100% refund guarantee if unredeemed in 7 days',
  'Free test rescheduling & booking guidance',
  'Official score-boost preparation tips',
];

export const ProductDetailModal = () => {
  const { selectedProductDetail, closeProductDetail, formatPrice, startCheckout, addToCart } = useVoucher();

  useEffect(() => {
    if (!selectedProductDetail) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') closeProductDetail(); };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [selectedProductDetail, closeProductDetail]);

  if (!selectedProductDetail) return null;

  const p = selectedProductDetail;
  const inclusions = Array.isArray(p.inclusions) && p.inclusions.length ? p.inclusions : DEFAULT_INCLUSIONS;
  const isComingSoon = p.comingSoon || p.stockStatus === 'COMING SOON';
  const officialLink = p.officialProductUrl || p.officialWebsiteUrl;
  const original = p.originalPrice || 0;
  const current = p.discountedPrice ?? p.sellingPrice ?? 0;
  const savings = Math.max(0, original - current);
  const percent = p.discountPercent || (original > current ? Math.round(((original - current) / original) * 100) : 0);

  return (
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={closeProductDetail}
    >
      <div
        className="relative w-full max-w-2xl rounded-3xl p-6 sm:p-8 overflow-y-auto max-h-[90vh] space-y-6
                   bg-surface border border-line text-ink
                   shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={closeProductDetail}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-surface-raised text-ink-muted hover:text-ink transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <ApexLogo className="h-6" />
          <Badge tone="accent">Official Reseller Voucher</Badge>
        </div>

        <div className="flex items-center gap-4">
          <div className="shrink-0 rounded-xl border border-line bg-surface-raised">
            <ProviderLogo product={p} className="h-16 w-40" />
          </div>
          <div className="min-w-0 space-y-1.5">
            <h2 className="font-heading font-normal text-2xl sm:text-[28px] leading-tight text-ink">{p.name}</h2>
            <StockBadge product={p} />
          </div>
        </div>

        <p className="text-sm font-normal text-ink-muted leading-relaxed">
          {p.description || '100% genuine official exam voucher code, accepted on the official test-registration portals.'}
        </p>

        <div className="rounded-2xl p-5 bg-surface-sunken border border-line flex items-end justify-between gap-3">
          <PriceDisplay original={original} current={current} formatPrice={formatPrice} size="lg" emphasis="accent" showSaved />
          <DiscountBadge percent={percent} savings={savings} formatPrice={formatPrice} />
        </div>

        <DeliveryValidityBar product={p} />

        <div className="space-y-3">
          <h4 className="font-heading font-medium text-[11px] uppercase tracking-[0.12em] text-ink-muted">What's included</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {inclusions.map((inc, i) => (
              <div key={i} className="flex items-start gap-2 text-xs font-normal text-ink">
                <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                <span className="leading-snug">{inc}</span>
              </div>
            ))}
          </div>
        </div>

        {officialLink && (
          <a href={officialLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted hover:text-accent transition-colors">
            Official Website <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-line">
          <Button variant="secondary" size="lg" onClick={() => { addToCart(p); closeProductDetail(); }} disabled={!p.inStock}>
            <ShoppingCart className="w-4 h-4" /> Add to Cart
          </Button>
          <Button variant="primary" size="lg" onClick={() => { closeProductDetail(); startCheckout(p); }} disabled={!p.inStock}>
            {p.inStock ? 'Buy Now' : isComingSoon ? 'Coming Soon' : 'Sold Out'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
