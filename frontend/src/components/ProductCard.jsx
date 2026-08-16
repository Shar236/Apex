import React from 'react';
import { useVoucher } from '../context/VoucherContext';
import { Check, ArrowRight, Eye, ShoppingCart, Zap, Star, Flame } from 'lucide-react';
import { BrandLogoContainer } from './OfficialBrandLogos';

export const ProductCard = ({ product }) => {
  const { formatPrice, startCheckout, addToCart, setSelectedProductDetail } = useVoucher();

  const brandLower = (product.brand || product.provider || product.name || '').toLowerCase();
  const nameLower = (product.name || '').toLowerCase();

  const isGRE = brandLower.includes('gre') || nameLower.includes('gre');
  const isPTE = brandLower.includes('pearson') || nameLower.includes('pte');
  const isPTECore = nameLower.includes('core');

  const providerName = (product.provider || product.brand || '').toUpperCase();
  const partnerLabel = providerName.includes('PEARSON')
    ? 'AUTHORISED PEARSON PARTNER'
    : providerName.includes('ETS')
    ? 'AUTHORISED ETS PARTNER'
    : `AUTHORISED ${providerName || 'EXAM'} PARTNER`;

  // Render Left Pill Badge matching reference image
  const renderBadge = () => {
    if (isGRE) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#2A0A17] text-[#FF005C] border border-[#FF005C]/30 text-[10px] font-black uppercase tracking-wider">
          <Star className="w-3 h-3 fill-[#FF005C]" />
          <span>GRAD SCHOOL TOP PICK</span>
        </span>
      );
    }
    if (isPTECore) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#0C2A4A] text-[#38BDF8] border border-[#38BDF8]/30 text-[10px] font-black uppercase tracking-wider">
          <span>🇨🇦 CANADA PR APPROVED</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#3B2206] text-[#F59E0B] border border-[#F59E0B]/30 text-[10px] font-black uppercase tracking-wider">
        <Flame className="w-3 h-3 fill-[#F59E0B]" />
        <span>BEST SELLER</span>
      </span>
    );
  };

  return (
    <div className={`group relative bg-[#0B0F19] rounded-3xl border border-[#1E293B] hover:border-[#FF005C]/50 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between ${
      !product.inStock ? 'opacity-75' : ''
    }`}>
      
      {/* Top Section */}
      <div className="p-5 space-y-4">
        
        {/* Top Badges Row */}
        <div className="flex items-center justify-between gap-2">
          {renderBadge()}
          <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
            {partnerLabel}
          </span>
        </div>

        {/* Brand Banner Box (ETS / Pearson Logo Header) */}
        <BrandLogoContainer brand={product.brand || product.provider} name={product.name} />

        {/* Discount Box */}
        <div className="bg-[#090D16] p-4 rounded-2xl border border-[#1E293B] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
              {product.discountPercent || 18}% OFF
            </span>
            <span className="font-heading font-black text-2xl text-[#FF005C] leading-none block tracking-tight">
              DISCOUNT
            </span>
          </div>

          <div>
            <span className="text-xs font-black text-[#10B981] bg-[#052E16] px-3.5 py-1.5 rounded-lg border border-[#10B981]/30 inline-block shadow-sm">
              SAVE {formatPrice(product.savings)}
            </span>
          </div>
        </div>

      </div>

      {/* Yellow Middle Delivery Strip */}
      <div className="bg-[#0B0F19] py-2 px-4 text-center border-y border-[#1E293B]">
        <span className="text-[11px] font-extrabold tracking-wide text-[#F59E0B] flex items-center justify-center gap-1.5">
          <Zap className="w-3.5 h-3.5 fill-[#F59E0B]" />
          <span>Instant Delivery</span>
          <span>•</span>
          <span>Valid {product.validityMonths || 6} Months</span>
        </span>
      </div>

      {/* Bottom Section: 2 Columns Pricing & Features */}
      <div className="p-5 space-y-5">
        
        <div className="grid grid-cols-12 gap-3 items-center">
          
          {/* Left Column: Pricing */}
          <div className="col-span-6 space-y-1">
            <span className="text-xs font-bold text-slate-400 line-through block">
              {formatPrice(product.originalPrice)}
            </span>
            <span className="font-heading font-black text-3xl text-white block tracking-tight">
              {formatPrice(product.discountedPrice)}
            </span>
            <span className="text-xs font-bold text-[#10B981] block">
              You Save: {formatPrice(product.savings)}
            </span>
          </div>

          {/* Right Column: Feature Checklist */}
          <div className="col-span-6 space-y-2 text-left pl-2">
            {[
              'Emailed in 10 seconds',
              '100% Genuine Voucher',
              'Free booking guidance'
            ].map((feat, i) => (
              <div key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <div className="w-4 h-4 rounded-full bg-[#10B981] text-black font-black text-[10px] flex items-center justify-center shrink-0">
                  ✓
                </div>
                <span className="leading-tight">{feat}</span>
              </div>
            ))}
          </div>

        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          {product.inStock ? (
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => setSelectedProductDetail(product)}
                className="w-full bg-[#131B2E] hover:bg-[#1E293B] text-white rounded-full py-3 px-3 text-xs font-bold flex items-center justify-center gap-1.5 border border-[#1E293B] cursor-pointer transition-colors"
              >
                <Eye className="w-4 h-4 text-slate-400" />
                <span>Quick View</span>
              </button>

              <button
                onClick={() => startCheckout(product)}
                className="w-full bg-[#FF005C] hover:bg-[#D9004C] text-white rounded-full py-3 px-3 text-xs font-black flex items-center justify-center gap-1.5 shadow-lg shadow-[#FF005C]/20 cursor-pointer hover:scale-[1.02] transition-all"
              >
                <span>Buy Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              disabled
              className="w-full py-3 rounded-full bg-[#111625] text-slate-500 font-bold text-xs cursor-not-allowed text-center border border-[#1E293B]"
            >
              Sold Out
            </button>
          )}

          <button
            onClick={() => addToCart(product)}
            disabled={!product.inStock}
            className="w-full bg-transparent hover:bg-[#161D2F] text-slate-300 hover:text-white rounded-full py-3 text-xs font-bold flex items-center justify-center gap-2 border border-[#1E293B] transition-colors cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4 text-[#FF005C]" />
            <span>Add to Cart</span>
          </button>
        </div>

      </div>

    </div>
  );
};
