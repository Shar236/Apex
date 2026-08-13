import React from 'react';
import { useVoucher } from '../context/VoucherContext';
import { Check, ArrowRight, Eye, ShoppingCart, ShieldCheck } from 'lucide-react';
import { BrandLogoContainer } from './OfficialBrandLogos';

export const ProductCard = ({ product }) => {
  const { formatPrice, startCheckout, addToCart, setSelectedProductDetail } = useVoucher();

  const isPearson = product.brand.includes('Pearson') || product.name.toLowerCase().includes('pte');
  const isETS = product.brand.includes('ETS') || product.name.toLowerCase().includes('gre') || product.name.toLowerCase().includes('toefl');
  const isDuolingo = product.brand.includes('Duolingo') || product.name.toLowerCase().includes('duolingo');

  const partnerLabel = isPearson 
    ? 'AUTHORISED PEARSON PARTNER' 
    : isETS 
    ? 'AUTHORISED ETS PARTNER' 
    : isDuolingo 
    ? 'OFFICIAL DUOLINGO PARTNER' 
    : 'AUTHORISED EXAM PARTNER';

  return (
    <div className={`relative bg-white dark:bg-[#161616] rounded-3xl border border-slate-200/80 dark:border-[#292929] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between ${
      !product.inStock ? 'opacity-80' : ''
    }`}>
      
      {/* Top Section */}
      <div className="p-5 space-y-3">
        
        {/* Category Badge & Partner Claim */}
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-[#262626] text-slate-700 dark:text-slate-300 text-[10px] font-black uppercase tracking-wider">
            EXAM VOUCHER
          </span>

          <span className="text-[9px] font-extrabold uppercase text-slate-400 dark:text-slate-400 tracking-wider">
            {partnerLabel}
          </span>
        </div>

        {/* Dedicated Logo Container Area */}
        <div className="pt-1">
          <BrandLogoContainer brand={product.brand || product.name} />
        </div>

        {/* Discount Design Box */}
        <div className="bg-[#F0F7FF] dark:bg-[#0A0A0A] p-3.5 rounded-2xl border border-slate-200/80 dark:border-[#292929] flex items-center justify-between">
          <div>
            <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block">WE OFFER</span>
            <span className="font-heading font-black text-2xl text-[#FF005C] leading-none block">
              {product.discountPercent || 18}% DISCOUNT
            </span>
          </div>

          <div className="text-right">
            <span className="text-xs font-black text-[#10B981] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800/40 inline-block shadow-sm">
              SAVE {formatPrice(product.savings)}
            </span>
          </div>
        </div>

      </div>

      {/* Dark Navy Horizontal Strip */}
      <div className="bg-[#0F172A] dark:bg-[#0A0A0A] py-1.5 px-4 text-center border-y border-slate-800 dark:border-[#292929]">
        <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center justify-center gap-1.5">
          <span>⚡ INSTANT DIGITAL DELIVERY</span>
          <span>•</span>
          <span>VALID 6–12 MONTHS</span>
        </span>
      </div>

      {/* Card Content & Features */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        
        {/* Product Title */}
        <h3 className="font-heading font-black text-lg text-[#0F172A] dark:text-white leading-snug">
          {product.name}
        </h3>

        {/* Pricing Details */}
        <div className="space-y-1 bg-slate-50 dark:bg-[#1E293B]/50 p-3 rounded-2xl border border-slate-100 dark:border-[#292929]">
          <div className="flex items-baseline gap-2">
            <span className="font-heading font-black text-2xl text-[#0F172A] dark:text-white">
              {formatPrice(product.discountedPrice)}
            </span>
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          </div>
          <p className="text-xs font-extrabold text-[#10B981] dark:text-emerald-400">
            You Save: {formatPrice(product.savings)}
          </p>
        </div>

        {/* Benefits Checklist */}
        <div className="space-y-2 py-1">
          <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-semibold">
            <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 text-[#10B981] dark:text-emerald-400" strokeWidth={3} />
            </div>
            <span>Emailed in 10 seconds to your inbox</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-semibold">
            <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 text-[#10B981] dark:text-emerald-400" strokeWidth={3} />
            </div>
            <span>100% Genuine official exam voucher</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-semibold">
            <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 text-[#10B981] dark:text-emerald-400" strokeWidth={3} />
            </div>
            <span>Free booking & rescheduling guidance</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-[#292929]">
          {product.inStock ? (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSelectedProductDetail(product)}
                className="btn-secondary !py-2.5 !px-3 !text-xs !rounded-xl font-bold flex items-center justify-center gap-1 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>Quick View</span>
              </button>

              <button
                onClick={() => startCheckout(product)}
                className="btn-pink !py-2.5 !px-3 !text-xs !rounded-xl font-black flex items-center justify-center gap-1 shadow-md cursor-pointer"
              >
                <span>Buy Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              disabled
              className="w-full py-3 rounded-xl bg-slate-100 dark:bg-[#111111] text-slate-400 font-bold text-xs cursor-not-allowed text-center border border-slate-200 dark:border-[#292929]"
            >
              Sold Out
            </button>
          )}

          <button
            onClick={() => addToCart(product)}
            disabled={!product.inStock}
            className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-[#FF005C] hover:bg-slate-100 dark:hover:bg-[#262626] transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200/70 dark:border-[#292929]"
          >
            <ShoppingCart className="w-3.5 h-3.5 text-[#FF005C]" />
            <span>Add to Shopping Cart</span>
          </button>
        </div>

      </div>

    </div>
  );
};
