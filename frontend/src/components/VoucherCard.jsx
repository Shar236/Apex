import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShoppingCart, Compass } from 'lucide-react';
import { useVoucher } from '../context/VoucherContext';
import {
  Button, StockBadge, PriceDisplay, DiscountBadge,
  ProviderLogo, ProductBenefits, DeliveryValidityBar,
} from './ui';

/**
 * The single voucher card used on every product surface (grids, best-sellers,
 * related rows). Pure presentation over the existing product shape — all
 * commerce logic stays in VoucherContext (startCheckout / addToCart).
 *
 * Theme-aware: real light and dark surfaces via the semantic tokens.
 */
export default function VoucherCard({ product }) {
  const { formatPrice, startCheckout, addToCart } = useVoucher();
  const navigate = useNavigate();

  const exploreMore = () => navigate(`/exam-vouchers/${product.slug || product.id || product._id}`);

  const isOutOfStock =
    product.inStock === false ||
    String(product.stockStatus || product.badge || '').toUpperCase() === 'OUT OF STOCK';

  const original = product.originalPrice || 0;
  const current = product.discountedPrice ?? product.sellingPrice ?? 0;
  const discountPercent =
    product.discountPercent ||
    (original > current ? Math.round(((original - current) / original) * 100) : 0);
  const savings = Math.max(0, original - current);

  const providerName = (product.provider || product.brand || '').toUpperCase();
  const partnerLabel = providerName.includes('PEARSON')
    ? 'Authorised Pearson Partner'
    : providerName.includes('ETS')
    ? 'Authorised ETS Partner'
    : `Authorised ${(product.provider || product.brand || 'Exam')} Partner`;

  return (
    <div
      className={[
        'group relative flex flex-col h-full rounded-2xl overflow-hidden',
        'bg-[var(--color-surface)] border border-[var(--color-line)]',
        'shadow-[0_1px_3px_rgba(15,20,35,0.04),0_10px_30px_-18px_rgba(15,20,35,0.12)]',
        'dark:shadow-[0_1px_3px_rgba(0,0,0,0.4),0_10px_30px_-18px_rgba(0,0,0,0.7)]',
        'transition-all duration-200 hover:border-[var(--color-accent)]/40 hover:-translate-y-1',
        isOutOfStock ? 'opacity-[0.92]' : '',
      ].join(' ')}
    >
      {/* 1 — status + partner */}
      <div className="flex items-start justify-between gap-2 px-4 pt-4">
        <StockBadge product={product} />
        <span className="text-[9px] font-medium uppercase tracking-[0.1em] text-[var(--color-ink-muted)] text-right leading-tight max-w-[42%]">
          {partnerLabel}
        </span>
      </div>

      {/* 2 — provider logo */}
      <div className="px-4 pt-3">
        <ProviderLogo product={product} className="h-[76px]" />
      </div>

      {/* 3 — title */}
      <h3 className="px-4 pt-3 text-center font-heading font-normal text-[17px] leading-snug text-[var(--color-ink)] line-clamp-2 min-h-[2.6rem]">
        {product.name}
      </h3>

      <div className="mx-4 mt-3 border-t border-[var(--color-line)]" />

      {/* 4 — price + discount */}
      <div className="px-4 pt-3 flex items-end justify-between gap-2">
        <PriceDisplay original={original} current={current} formatPrice={formatPrice} emphasis="accent" />
        <DiscountBadge percent={discountPercent} savings={savings} formatPrice={formatPrice} />
      </div>

      {/* 5 — delivery / validity */}
      <div className="px-4 pt-3">
        <DeliveryValidityBar product={product} />
      </div>

      {/* 6 — benefits */}
      <div className="px-4 pt-3">
        <ProductBenefits />
      </div>

      {/* 7 + 8 — actions (pinned to the bottom for grid alignment) */}
      <div className="px-4 pt-4 pb-4 mt-auto space-y-2">
        {isOutOfStock ? (
          <Button variant="disabled" size="md" fullWidth disabled>
            Out of Stock
          </Button>
        ) : (
          <Button variant="primary" size="md" fullWidth onClick={() => startCheckout(product)}>
            <ShoppingCart className="w-4 h-4" />
            Buy Now
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        )}

        <Button variant="secondary" size="sm" fullWidth onClick={exploreMore}>
          <Compass className="w-3.5 h-3.5" />
          Explore More
        </Button>

        {!isOutOfStock && (
          <Button variant="ghost" size="sm" fullWidth onClick={() => addToCart(product)}>
            <ShoppingCart className="w-3.5 h-3.5" />
            Add to Cart
          </Button>
        )}
      </div>
    </div>
  );
}

export { VoucherCard };
