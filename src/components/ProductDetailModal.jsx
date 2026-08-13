import React from 'react';
import { useVoucher } from '../context/VoucherContext';
import { X, CheckCircle2, ShieldCheck, Zap, Lock, ShoppingCart, ArrowRight } from 'lucide-react';
import { ApexLogo } from './ApexLogo';

export const ProductDetailModal = () => {
  const { selectedProductDetail, setSelectedProductDetail, formatPrice, startCheckout, addToCart } = useVoucher();

  if (!selectedProductDetail) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh] text-neutral-900 dark:text-white space-y-6 transition-colors duration-300">
        
        <button
          onClick={() => setSelectedProductDetail(null)}
          className="absolute top-5 right-5 p-2 rounded-full bg-neutral-100 dark:bg-[#262626] text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <ApexLogo className="h-6" />
          <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded bg-[#FFF0F5] dark:bg-[#2A0A17] text-[#FF005C] border border-[#FF005C]/20">
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
        <div className="bg-[#FFF0F5] dark:bg-[#2A0A17] p-5 rounded-2xl border border-[#FF005C]/20 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-extrabold text-[#FF005C] uppercase tracking-wider block">Apex Discount Price</span>
            <span className="font-heading font-black text-3xl text-neutral-900 dark:text-white leading-none">{formatPrice(selectedProductDetail.discountedPrice)}</span>
            <span className="text-xs font-bold text-neutral-400 line-through ml-2">{formatPrice(selectedProductDetail.originalPrice)}</span>
          </div>

          <div className="text-right">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#FF005C] text-white font-black text-xs">
              SAVE {formatPrice(selectedProductDetail.savings)}
            </span>
            <span className="block text-[10px] text-neutral-500 dark:text-neutral-400 font-semibold mt-1">(incl. 18% GST)</span>
          </div>
        </div>

        {/* Features Inclusions List */}
        <div className="space-y-3 pt-2">
          <h4 className="font-heading font-extrabold text-xs text-neutral-400 uppercase tracking-wider">What is Included</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              'Instant 10-second delivery to Email & WhatsApp',
              'Valid for 6–12 months from purchase date',
              'Valid across all exam test centers in India',
              '100% refund guarantee if unredeemed in 7 days',
              'Free test rescheduling & booking guidance',
              'Official Score boost preparation tips',
            ].map((inc, i) => (
              <div key={i} className="flex items-center gap-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{inc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-[#EAEAEA] dark:border-[#292929]">
          <button
            onClick={() => {
              addToCart(selectedProductDetail);
              setSelectedProductDetail(null);
            }}
            className="btn-secondary !py-3.5 !rounded-xl !text-sm font-extrabold flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-4 h-4 text-[#FF005C]" />
            <span>Add to Cart</span>
          </button>

          <button
            onClick={() => {
              const prod = selectedProductDetail;
              setSelectedProductDetail(null);
              startCheckout(prod);
            }}
            className="btn-pink !py-3.5 !rounded-xl !text-sm font-black flex items-center justify-center gap-2"
          >
            <span>Buy Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
