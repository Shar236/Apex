import React, { useEffect } from 'react';
import { useVoucher } from '../context/VoucherContext';
import { X, CheckCircle2, ShieldCheck, Zap, Lock, ShoppingCart, ArrowRight, ExternalLink, Clock } from 'lucide-react';
import { ApexLogo } from './ApexLogo';

const DEFAULT_INCLUSIONS = [
  'Instant 10-second delivery to Email & WhatsApp',
  'Valid for 6–12 months from purchase date',
  'Valid across all exam test centers in India',
  '100% refund guarantee if unredeemed in 7 days',
  'Free test rescheduling & booking guidance',
  'Official Score boost preparation tips',
];

export const ProductDetailModal = () => {
  const { selectedProductDetail, closeProductDetail, formatPrice, startCheckout, addToCart } = useVoucher();

  useEffect(() => {
    if (!selectedProductDetail) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKey = (e) => {
      if (e.key === 'Escape') closeProductDetail();
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedProductDetail, closeProductDetail]);

  if (!selectedProductDetail) return null;

  const p = selectedProductDetail;
  const inclusions = Array.isArray(p.inclusions) && p.inclusions.length > 0 ? p.inclusions : DEFAULT_INCLUSIONS;
  const badges = Array.isArray(p.badges) && p.badges.length > 0 ? p.badges : (p.badge ? [p.badge] : []);
  const isComingSoon = p.comingSoon || p.stockStatus === 'COMING SOON';
  const officialLink = p.officialProductUrl || p.officialWebsiteUrl;

  return (
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={closeProductDetail}
    >
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh] text-neutral-900 dark:text-white space-y-6 transition-colors duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Close button — always on top */}
        <button
          type="button"
          onClick={closeProductDetail}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-neutral-100 dark:bg-[#262626] text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-[#333] transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <ApexLogo className="h-6" />
          <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded bg-[#FFF0F5] dark:bg-[#2A0A17] text-brand-pink border border-brand-pink/20">
            OFFICIAL RESELLER VOUCHER
          </span>
        </div>

        <div className="space-y-2">
          <h2 className="font-heading font-black text-2xl sm:text-3xl text-neutral-900 dark:text-white leading-tight">
            {selectedProductDetail.name}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-[#B5B5B5] font-medium leading-relaxed">
            {selectedProductDetail.description || '100% genuine official exam voucher code accepted on official test registration portals.'}
          </p>
        </div>

        {/* Pricing Box */}
        <div className="bg-[#FFF0F5] dark:bg-[#2A0A17] p-5 rounded-2xl border border-brand-pink/20 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-extrabold text-brand-pink uppercase tracking-wider block">Apex Discount Price</span>
            <span className="font-heading font-black text-3xl text-neutral-900 dark:text-white leading-none">{formatPrice(selectedProductDetail.discountedPrice)}</span>
            <span className="text-xs font-bold text-neutral-400 line-through ml-2">{formatPrice(selectedProductDetail.originalPrice)}</span>
          </div>

          <div className="text-right">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-brand-pink text-white font-black text-xs">
              SAVE {formatPrice(p.savings)}
            </span>
            <span className={`block text-[10px] font-black mt-1.5 ${p.inStock ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
              {isComingSoon ? 'Coming Soon' : p.stockStatus || (p.inStock ? 'IN STOCK' : 'OUT OF STOCK')}
            </span>
          </div>
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {badges.map((b, i) => (
              <span key={i} className="px-2.5 py-1 rounded-full bg-[#FFF0F5] dark:bg-[#2A0A17] text-brand-pink border border-brand-pink/20 text-[10px] font-black uppercase tracking-wider">
                {b}
              </span>
            ))}
          </div>
        )}

        {/* Delivery / Validity Row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-bold text-neutral-500 dark:text-[#B5B5B5]">
          <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-brand-pink" />{p.deliveryType || 'Instant Delivery'}</span>
          {p.validityMonths ? <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-brand-pink" />Valid {p.validityMonths} Months</span> : null}
        </div>

        {/* Features Inclusions List */}
        <div className="space-y-3 pt-2">
          <h4 className="font-heading font-extrabold text-xs text-neutral-400 uppercase tracking-wider">What is Included</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {inclusions.map((inc, i) => (
              <div key={i} className="flex items-center gap-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{inc}</span>
              </div>
            ))}
          </div>
        </div>

        {officialLink && (
          <a
            href={officialLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-brand-pink transition-colors"
          >
            <span>Official Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}

        {/* Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-[#EAEAEA] dark:border-[#292929]">
          <button
            onClick={() => {
              addToCart(p);
              closeProductDetail();
            }}
            disabled={!p.inStock}
            className="btn-secondary py-3.5! rounded-xl! text-sm! font-extrabold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="w-4 h-4 text-brand-pink" />
            <span>Add to Cart</span>
          </button>

          <button
            onClick={() => {
              closeProductDetail();
              startCheckout(p);
            }}
            disabled={!p.inStock}
            className="btn-pink py-3.5! rounded-xl! text-sm! font-black flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{p.inStock ? 'Buy Now' : (isComingSoon ? 'Coming Soon' : 'Sold Out')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
