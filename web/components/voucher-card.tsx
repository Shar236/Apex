'use client';

import Link from 'next/link';
import { ArrowRight, ShoppingCart, Compass, Ticket } from 'lucide-react';
import { useCart } from '@/components/cart-provider';
import { Button, StockBadge, PriceDisplay, DiscountBadge, ProviderLogo, ProductBenefits, DeliveryValidityBar } from '@/components/ui';
import type { Product } from '@/lib/types';

const isRequestOnly = (p: Product): boolean => {
  if (!p) return false;
  if (p.comingSoon) return false;
  if (p.stockType === 'UNLIMITED') return false;
  const avail = p.availableStock ?? p.availability ?? (p.inStock === false ? 0 : 1);
  return Number(avail) <= 0;
};

/** The single voucher card used on every product surface (grids, best-sellers, related rows). */
export function VoucherCard({ product }: { product: Product }) {
  const { formatPrice, addToCart } = useCart();
  const detailHref = `/exam-vouchers/${product.slug || product._id || product.id}`;

  const isComingSoon = product.comingSoon || product.stockStatus === 'COMING SOON';
  const requestOnly = isRequestOnly(product);
  const canBuyNow = !isComingSoon && !requestOnly;

  const original = product.originalPrice || 0;
  const current = product.discountedPrice ?? product.sellingPrice ?? 0;
  const discountPercent = product.discountPercent || (original > current ? Math.round(((original - current) / original) * 100) : 0);
  const savings = Math.max(0, original - current);

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
        <ProviderLogo product={product} className="h-19" />
      </div>

      <Link href={detailHref} className="px-4 pt-3 text-center font-heading font-normal text-[17px] leading-snug text-ink line-clamp-2 min-h-10.4 hover:text-accent transition-colors">
        {product.name}
      </Link>

      <div className="mx-4 mt-3 border-t border-line" />

      <div className="px-4 pt-3 flex items-end justify-between gap-2">
        <PriceDisplay original={original} current={current} formatPrice={formatPrice} emphasis="accent" />
        <DiscountBadge percent={discountPercent} savings={savings} formatPrice={formatPrice} />
      </div>

      <div className="px-4 pt-3">
        <DeliveryValidityBar product={product} />
      </div>

      <div className="px-4 pt-3">
        <ProductBenefits />
      </div>

      <div className="px-4 pt-4 pb-4 mt-auto space-y-2">
        {isComingSoon ? (
          <Button variant="disabled" size="md" fullWidth disabled>
            Coming Soon
          </Button>
        ) : requestOnly ? (
          <Button as={Link} href={detailHref} variant="primary" size="md" fullWidth>
            <Ticket className="w-4 h-4" />
            Request Voucher
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        ) : (
          <Button as={Link} href={detailHref} variant="primary" size="md" fullWidth>
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
          <Button variant="ghost" size="sm" fullWidth onClick={() => addToCart(product)}>
            <ShoppingCart className="w-3.5 h-3.5" />
            Add to Cart
          </Button>
        )}
      </div>
    </div>
  );
}
