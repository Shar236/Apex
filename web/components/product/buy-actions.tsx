'use client';

import { ShoppingCart, Clock, Ticket, Lock } from 'lucide-react';
import { useCart } from '@/components/cart-provider';
import { useVoucher } from '@/components/voucher-provider';
import { Button } from '@/components/ui';
import type { Product } from '@/lib/types';

const isRequestOnly = (p: Product): boolean => {
  if (!p) return false;
  if (p.comingSoon) return false;
  if (p.stockType === 'UNLIMITED') return false;
  const avail = p.availableStock ?? p.availability ?? (p.inStock === false ? 0 : 1);
  return Number(avail) <= 0;
};

/** Buy Now / Add to Cart / Request Voucher — the real interactivity on the product detail page. */
export function BuyActions({ product, size = 'lg' }: { product: Product; size?: 'md' | 'lg' }) {
  const { addToCart } = useCart();
  const { startCheckout, startVoucherRequest } = useVoucher();
  const isComingSoon = product.comingSoon || product.stockStatus === 'COMING SOON';
  const requestOnly = isRequestOnly(product);
  const canBuyNow = !isComingSoon && !requestOnly;

  const buyNow = () => (requestOnly ? startVoucherRequest(product) : startCheckout(product));

  return (
    <div className="flex flex-wrap items-center gap-3 pt-1">
      {isComingSoon ? (
        <Button variant="disabled" size={size} disabled>
          <Clock className="w-4 h-4" /> Coming Soon
        </Button>
      ) : requestOnly ? (
        <Button variant="primary" size={size} onClick={buyNow}>
          <Ticket className="w-4 h-4" /> Request Voucher
        </Button>
      ) : (
        <Button variant="primary" size={size} onClick={buyNow}>
          <ShoppingCart className="w-4 h-4" /> Buy Now
        </Button>
      )}
      {canBuyNow && (
        <Button variant="secondary" size={size} onClick={() => addToCart(product)}>
          <ShoppingCart className="w-4 h-4" /> Add to Cart
        </Button>
      )}
    </div>
  );
}

/** Sticky mobile checkout bar. */
export function StickyMobileBar({ product }: { product: Product }) {
  const { formatPrice } = useCart();
  const { startCheckout, startVoucherRequest } = useVoucher();
  const isComingSoon = product.comingSoon || product.stockStatus === 'COMING SOON';
  const requestOnly = isRequestOnly(product);
  if (isComingSoon) return null;

  const buyNow = () => (requestOnly ? startVoucherRequest(product) : startCheckout(product));

  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-surface/95 backdrop-blur-md border-t border-line px-4 py-3 flex items-center justify-between gap-3 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.25)]">
      <div className="min-w-0">
        <span className="block text-[10px] font-normal text-ink-muted uppercase tracking-wider truncate">{product.name}</span>
        <span className="font-heading font-semibold text-lg text-ink">{formatPrice(product.discountedPrice ?? product.sellingPrice)}</span>
      </div>
      {requestOnly ? (
        <Button variant="primary" size="md" className="shrink-0" onClick={buyNow}>
          <Ticket className="w-3.5 h-3.5" /> Request Voucher
        </Button>
      ) : (
        <Button variant="primary" size="md" className="shrink-0" onClick={buyNow}>
          <Lock className="w-3.5 h-3.5" /> Buy This Voucher
        </Button>
      )}
    </div>
  );
}
