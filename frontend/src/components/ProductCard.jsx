import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVoucher } from '../context/VoucherContext';
import { Check, ArrowRight, Compass, ShoppingCart, Zap, Star, Flame, Sparkles, ExternalLink, Clock } from 'lucide-react';
import { BrandLogoContainer } from './OfficialBrandLogos';

// Renders the admin-uploaded product logo when present; falls back to the
// generic brand banner if there's no logo or the image fails to load.
function ProductLogo({ product }) {
  const [failed, setFailed] = useState(false);
  if (!product.logo || failed) {
    return <BrandLogoContainer brand={product.brand || product.provider} name={product.name} inverted={true} />;
  }
  return (
    /* White pill so dark-colored logos (e.g. TOEFL near-black, Pearson navy)
       are always visible on the dark card background */
    <div className="w-full h-24 rounded-2xl bg-white border border-white/10 flex items-center justify-center p-3">
      <img
        src={product.logo}
        alt={`${product.name} logo`}
        loading="lazy"
        className="max-h-full max-w-full object-contain"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

const BADGE_STYLES = [
  { match: /best.?sell/i, className: 'bg-[#3B2206] text-[#F59E0B] border-[#F59E0B]/30', Icon: Flame },
  { match: /popular/i, className: 'bg-[#3B2206] text-[#F59E0B] border-[#F59E0B]/30', Icon: Flame },
  { match: /canada|express entry/i, className: 'bg-[#0C2A4A] text-[#38BDF8] border-[#38BDF8]/30', Icon: null },
  { match: /\bukvi?\b|united kingdom/i, className: 'bg-[#0C2A4A] text-[#38BDF8] border-[#38BDF8]/30', Icon: null },
  { match: /australia/i, className: 'bg-[#0C2A4A] text-[#38BDF8] border-[#38BDF8]/30', Icon: null },
  { match: /study abroad/i, className: 'bg-[#0C2A4A] text-[#38BDF8] border-[#38BDF8]/30', Icon: null },
  { match: /^new$/i, className: 'bg-[#0f2e1b] text-[#34d399] border-[#34d399]/30', Icon: Sparkles },
  { match: /limited/i, className: 'bg-[#2A0A17] text-brand-pink border-brand-pink/30', Icon: Star },
  { match: /top pick|featured/i, className: 'bg-[#2A0A17] text-brand-pink border-brand-pink/30', Icon: Star },
];

const badgeStyleFor = (text) => {
  const found = BADGE_STYLES.find((s) => s.match.test(text));
  return found || { className: 'bg-[#2A0A17] text-brand-pink border-brand-pink/30', Icon: Star };
};

export const ProductCard = ({ product }) => {
  const { formatPrice, startCheckout, addToCart } = useVoucher();
  const navigate = useNavigate();
  const exploreMore = () => navigate(`/exam-vouchers/${product.slug || product.id}`);

  const providerName = (product.provider || product.brand || '').toUpperCase();
  const partnerLabel = providerName.includes('PEARSON')
    ? 'AUTHORISED PEARSON PARTNER'
    : providerName.includes('ETS')
    ? 'AUTHORISED ETS PARTNER'
    : `AUTHORISED ${providerName || 'EXAM'} PARTNER`;

  const isOutOfStock = product.inStock === false || String(product.stockStatus || product.badge || '').toUpperCase() === 'OUT OF STOCK';
  const badgeText = (Array.isArray(product.badges) && product.badges[0]) || (product.badgeEnabled !== false && product.badge) || '';

  const renderBadge = () => {
    if (isOutOfStock) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#E53E3E] text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
          OUT OF STOCK
        </span>
      );
    }
    if (!badgeText) return <span />;
    const { className, Icon } = badgeStyleFor(badgeText);
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${className}`}>
        {Icon && <Icon className="w-3 h-3 fill-current" />}
        <span>{badgeText}</span>
      </span>
    );
  };

  const isComingSoon = product.comingSoon || product.stockStatus === 'COMING SOON';
  const isLowStock = product.stockStatus === 'LOW STOCK' && Number.isFinite(product.availableStock);
  const discountPercent = product.discountPercent || (product.originalPrice > product.discountedPrice ? Math.round(((product.originalPrice - product.discountedPrice) / product.originalPrice) * 100) : 0);
  const savings = Math.max(0, (product.originalPrice || 0) - (product.discountedPrice || 0));

  return (
    <div className={`group relative bg-[#0B0F19] rounded-3xl border border-[#1E293B] hover:border-brand-pink/50 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between min-h-115 ${
      isOutOfStock ? 'opacity-85' : ''
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

        {/* Brand Banner Box / Real Official Logo Header */}
        <ProductLogo product={product} />

        {/* Discount Box */}
        <div className="bg-[#090D16] p-3.5 sm:p-4 rounded-2xl border border-[#1E293B] flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block truncate">
              {discountPercent > 0 ? `${discountPercent}% OFF` : 'SPECIAL PRICE'}
            </span>
            <span className="font-heading font-black text-xl sm:text-2xl text-brand-pink leading-none block tracking-tight">
              DISCOUNT
            </span>
          </div>

          <div className="shrink-0">
            {savings > 0 ? (
              <span className="text-[11px] sm:text-xs font-black text-[#10B981] bg-[#052E16] px-2.5 sm:px-3.5 py-1.5 rounded-lg border border-[#10B981]/30 inline-block shadow-sm whitespace-nowrap">
                SAVE {formatPrice(savings)}
              </span>
            ) : (
              <span className="text-[11px] sm:text-xs font-black text-slate-400 bg-slate-800/40 px-2.5 sm:px-3.5 py-1.5 rounded-lg border border-slate-700/40 inline-block whitespace-nowrap">
                BEST PRICE
              </span>
            )}
          </div>
        </div>

      </div>

      {/* Middle Delivery Strip */}
      <div className="bg-[#0B0F19] py-2 px-4 text-center border-y border-[#1E293B]">
        <span className="text-[11px] font-extrabold tracking-wide text-[#F59E0B] flex items-center justify-center gap-1.5 flex-wrap">
          <Zap className="w-3.5 h-3.5 fill-[#F59E0B]" />
          <span>{product.deliveryType || 'Instant Digital Delivery'}</span>
          {product.validityMonths ? (
            <>
              <span>•</span>
              <span>Valid {product.validityMonths} Months</span>
            </>
          ) : null}
          {isLowStock && (
            <>
              <span>•</span>
              <span className="text-rose-400">Only {product.availableStock} left</span>
            </>
          )}
        </span>
      </div>

      {/* Bottom Section: 2 Columns Pricing & Features */}
      <div className="p-5 space-y-4">
        
        <div className="grid grid-cols-12 gap-3 items-center">
          
          {/* Left Column: Pricing */}
          <div className="col-span-6 space-y-1">
            {product.originalPrice && product.originalPrice > product.discountedPrice ? (
              <span className="text-xs font-bold text-slate-400 line-through block">
                {formatPrice(product.originalPrice)}
              </span>
            ) : (
              <span className="text-xs font-bold text-transparent block select-none">
                &nbsp;
              </span>
            )}
            <span className="font-heading font-black text-2xl sm:text-3xl text-white block tracking-tight">
              {formatPrice(product.discountedPrice)}
            </span>
            {savings > 0 ? (
              <span className="text-xs font-bold text-[#10B981] block">
                You Save: {formatPrice(savings)}
              </span>
            ) : null}
          </div>

          {/* Right Column: Feature Checklist */}
          <div className="col-span-6 space-y-1.5 text-left pl-2">
            {[
              'Emailed in 10 seconds',
              '100% Genuine Voucher',
              'Free booking guidance'
            ].map((feat, i) => (
              <div key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <div className="w-4 h-4 rounded-full bg-[#10B981] text-black font-black text-[10px] flex items-center justify-center shrink-0">
                  ✓
                </div>
                <span className="leading-tight text-[11.5px]">{feat}</span>
              </div>
            ))}
          </div>

        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          {!isOutOfStock ? (
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={exploreMore}
                className="w-full bg-[#131B2E] hover:bg-[#1E293B] text-white rounded-full py-3 px-3 text-xs font-bold flex items-center justify-center gap-1.5 border border-[#1E293B] cursor-pointer transition-colors"
              >
                <Compass className="w-4 h-4 text-slate-400" />
                <span>Explore More</span>
              </button>

              <button
                onClick={() => startCheckout(product)}
                className="w-full bg-brand-pink hover:bg-[#D9004C] text-white rounded-full py-3 px-3 text-xs font-black flex items-center justify-center gap-1.5 shadow-lg shadow-brand-pink/20 cursor-pointer hover:scale-[1.02] transition-all"
              >
                <span>Buy Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                disabled
                className="w-full py-3 rounded-full bg-[#111625] text-slate-500 font-black text-xs cursor-not-allowed text-center border border-[#1E293B] flex items-center justify-center gap-1.5 select-none uppercase tracking-wider"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>OUT OF STOCK</span>
              </button>
              <button
                onClick={exploreMore}
                className="w-full bg-[#131B2E] hover:bg-[#1E293B] text-slate-300 hover:text-white rounded-full py-2 px-3 text-[11px] font-bold flex items-center justify-center gap-1.5 border border-[#1E293B] cursor-pointer transition-colors"
              >
                <Compass className="w-3.5 h-3.5 text-slate-400" />
                <span>Explore More</span>
              </button>
            </div>
          )}

          {!isOutOfStock && (
            <button
              onClick={() => addToCart(product)}
              className="w-full bg-transparent hover:bg-[#161D2F] text-slate-300 hover:text-white rounded-full py-2.5 text-xs font-bold flex items-center justify-center gap-2 border border-[#1E293B] transition-colors cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4 text-brand-pink" />
              <span>Add to Cart</span>
            </button>
          )}

          {(product.officialProductUrl || product.officialWebsiteUrl) && (
            <a
              href={product.officialProductUrl || product.officialWebsiteUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-slate-200 transition-colors pt-0.5"
            >
              <span>Official Website</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

      </div>

    </div>
  );
};

export default ProductCard;
