'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, ShoppingCart, Compass } from 'lucide-react';
import { useCart } from '@/components/cart-provider';
import { useVoucher } from '@/components/voucher-provider';
import { Button, StockBadge, PriceDisplay, DiscountBadge, ProviderLogo, ProductBenefits, DeliveryValidityBar } from '@/components/ui';
import type { Product, DurationOption } from '@/lib/types';

/** The single voucher card used on every product surface (grids, best-sellers, related rows). */
export function VoucherCard({ product }: { product: Product }) {
  const { formatPrice, addToCart } = useCart();
  const { startCheckout } = useVoucher();
  const detailHref = `/exam-vouchers/${product.slug || product._id || product.id}`;

  const enabledDurations = useMemo(
    () => (product.durationOptions || []).filter((o) => o.enabled !== false),
    [product.durationOptions]
  );
  const [selectedDuration, setSelectedDuration] = useState<DurationOption | null>(
    enabledDurations.length > 0 ? enabledDurations[0] : null
  );

  // Derive price from the selected duration, otherwise from the product base.
  const current = selectedDuration?.sellingPrice ?? product.discountedPrice ?? product.sellingPrice ?? 0;
  const original = selectedDuration?.originalPrice ?? product.originalPrice ?? 0;
  const discountPercent = original > current ? Math.round(((original - current) / original) * 100) : 0;
  const savings = Math.max(0, original - current);

  // Build a product-with-duration to pass to cart/checkout.
  const productWithDuration = useMemo(
    () => (selectedDuration ? { ...product, selectedDuration } : product),
    [product, selectedDuration]
  );

  // Validity label derived from the selected duration (the shared bar prefers validityMonths/validity).
  const durationValidity = selectedDuration
    ? selectedDuration.validityDays >= 30 && selectedDuration.validityDays % 30 === 0
      ? `Valid ${selectedDuration.validityDays / 30} Month${selectedDuration.validityDays / 30 === 1 ? '' : 's'}`
      : `Valid ${selectedDuration.validityDays} Days`
    : null;

  const isComingSoon = product.comingSoon || product.stockStatus === 'COMING SOON';
  const canBuyNow = !isComingSoon;

  const providerName = (product.provider || product.brand || '').toUpperCase();
  const partnerLabel = providerName.includes('PEARSON')
    ? 'Authorised Pearson Partner'
    : providerName.includes('ETS')
      ? 'Authorised ETS Partner'
      : `Authorised ${product.provider || product.brand || 'Exam'} Partner`;

  return (
    <div
      className={[
        'group relative flex flex-col h-full rounded-2xl overflow-hidden',
        'bg-surface border border-line',
        'shadow-[0_1px_3px_rgba(15,20,35,0.04),0_10px_30px_-18px_rgba(15,20,35,0.12)]',
        'dark:shadow-[0_1px_3px_rgba(0,0,0,0.4),0_10px_30px_-18px_rgba(0,0,0,0.7)]',
        'transition-all duration-200 hover:border-accent/40 hover:-translate-y-1',
        isComingSoon ? 'opacity-92' : '',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-2 px-4 pt-4">
        <StockBadge product={product} />
        <span className="text-[9px] font-medium uppercase tracking-widest text-ink-muted text-right leading-tight max-w-[42%]">{partnerLabel}</span>
      </div>

      <div className="px-4 pt-3">
        <ProviderLogo product={product} size="md" />
      </div>

      <Link href={detailHref} className="px-4 pt-3 text-center font-heading font-normal text-[17px] leading-snug text-ink line-clamp-2 min-h-10.4 hover:text-accent transition-colors">
        {product.name}
      </Link>

      <div className="mx-4 mt-3 border-t border-line" />

      {/* Duration selector */}
      {enabledDurations.length > 1 && (
        <div className="px-4 pt-3">
          <div className="flex items-center gap-1 rounded-xl bg-neutral-100 dark:bg-[#262626] p-1">
            {enabledDurations.map((opt) => {
              const isActive = selectedDuration?.key === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => setSelectedDuration(opt)}
                  className={`flex-1 px-2 py-1.5 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                    isActive ? 'bg-white dark:bg-[#161616] shadow-sm text-accent' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="px-4 pt-3 flex items-end justify-between gap-2">
        <PriceDisplay original={original} current={current} formatPrice={formatPrice} emphasis="accent" />
        <DiscountBadge percent={discountPercent} savings={savings} formatPrice={formatPrice} />
      </div>

      <div className="px-4 pt-3">
        <DeliveryValidityBar product={durationValidity ? { ...product, validity: durationValidity } : product} />
      </div>

      <div className="px-4 pt-3">
        <ProductBenefits />
      </div>

      <div className="px-4 pt-4 pb-4 mt-auto space-y-2">
        {isComingSoon ? (
          <Button variant="disabled" size="md" fullWidth disabled>
            Coming Soon
          </Button>
        ) : (
          <Button variant="primary" size="md" fullWidth onClick={() => startCheckout(productWithDuration)}>
            <ShoppingCart className="w-4 h-4" />
            Buy Now
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        )}

        <Button as={Link} href={detailHref} variant="secondary" size="sm" fullWidth>
          <Compass className="w-3.5 h-3.5" />
          Explore More
        </Button>

        {canBuyNow && (
          <Button variant="ghost" size="sm" fullWidth onClick={() => addToCart(productWithDuration)}>
            <ShoppingCart className="w-3.5 h-3.5" />
            Add to Cart
          </Button>
        )}
      </div>
    </div>
  );
}