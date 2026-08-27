import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVoucher } from '../context/VoucherContext';
import {
  ArrowRight,
  Compass,
  ShoppingCart,
  Zap,
  Flame,
  Star,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { BrandLogoContainer } from './OfficialBrandLogos';

/* ─────────────────────────────────────────────
   Product Logo (light card version)
   – Uses admin-uploaded image when available,
     falls back to the brand SVG component.
   The logo container has a subtle light bg.
───────────────────────────────────────────── */
function HomepageProductLogo({ product }) {
  const [failed, setFailed] = useState(false);

  if (!product.logo || failed) {
    // Always force light-mode colors: the card is white in both day AND night mode.
    // The [color-scheme:light] wrapper stops Tailwind dark: variants from applying
    // inside it, so dark navy text stays visible on the white card background.
    return (
      <div
        className="w-full h-27.5 flex items-center justify-center p-3"
        style={{ colorScheme: 'light' }}
      >
        <BrandLogoContainer
          brand={product.brand || product.provider}
          name={product.name}
          inverted={false}
        />
      </div>
    );
  }

  return (
    /* White pill — keeps any dark-colored logo image visible on the card */
    <div className="w-full h-27.5 flex items-center justify-center p-3 bg-white rounded-2xl">
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

/* ─────────────────────────────────────────────
   Badge styles — adapted for LIGHT card
───────────────────────────────────────────── */
const getBadgeStyle = (text, isOOS) => {
  if (isOOS)
    return {
      className: 'bg-brand-pink text-white',
      icon: <Clock className="w-3 h-3" />,
      label: 'OUT OF STOCK',
    };
  const t = (text || '').toLowerCase();
  if (t.includes('best sell') || t.includes('popular'))
    return {
      className: 'bg-[#FF7A00] text-white',
      icon: <Flame className="w-3 h-3 fill-white" />,
      label: text,
    };
  if (t.includes('canada') || t.includes('express') || t.includes('pr approved'))
    return {
      className: 'bg-[#0A56B0] text-white',
      icon: null,
      label: text,
    };
  return {
    className: 'bg-brand-pink text-white',
    icon: <Star className="w-3 h-3 fill-white" />,
    label: text,
  };
};

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
export const HomepageVoucherCard = ({ product }) => {
  const { formatPrice, startCheckout, addToCart } = useVoucher();
  const navigate = useNavigate();
  const exploreMore = () => navigate(`/exam-vouchers/${product.slug || product.id}`);

  /* Derived state */
  const isOutOfStock =
    product.inStock === false ||
    String(product.stockStatus || product.badge || '').toUpperCase() === 'OUT OF STOCK';

  const badgeText =
    (Array.isArray(product.badges) && product.badges[0]) ||
    (product.badgeEnabled !== false && product.badge) ||
    '';

  const discountPercent =
    product.discountPercent ||
    (product.originalPrice > product.discountedPrice
      ? Math.round(
          ((product.originalPrice - product.discountedPrice) / product.originalPrice) * 100
        )
      : 0);

  const savings = Math.max(0, (product.originalPrice || 0) - (product.discountedPrice || 0));

  /* Partner label */
  const providerName = (product.provider || product.brand || '').toUpperCase();
  const partnerLabel = providerName.includes('PEARSON')
    ? 'AUTHORISED\nPEARSON PARTNER'
    : providerName.includes('ETS')
    ? 'AUTHORISED\nETS PARTNER'
    : `AUTHORISED\n${providerName || 'EXAM'} PARTNER`;

  /* Validity strip */
  const validityStr = product.validityMonths
    ? `Valid ${product.validityMonths} Months`
    : product.validity || 'Valid 6 Months';

  /* Badge */
  const badge = getBadgeStyle(badgeText, isOutOfStock);

  /* Product name split for multi-line display */
  const nameParts = (product.name || '').split(/\s+/);

  return (
    <div
      className={`
        group relative bg-white rounded-[20px] border border-slate-200
        shadow-md hover:shadow-xl hover:-translate-y-1
        transition-all duration-300
        flex flex-col
        min-h-130
        ${isOutOfStock ? 'opacity-90' : ''}
      `}
      style={{ colorScheme: 'light' }}
    >
      {/* ── Top Header Row ─────────────────────── */}
      <div className="flex items-start justify-between gap-2 px-4 pt-4 pb-2">
        {/* Left: status / promo badge */}
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap ${badge.className}`}
        >
          {badge.icon}
          {badge.label || '\u00A0'}
        </span>

        {/* Right: authorised partner */}
        <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider text-right leading-tight whitespace-pre-line">
          {partnerLabel}
        </span>
      </div>

      {/* ── Logo Area ──────────────────────────── */}
      <div className="px-4 pb-2">
        <HomepageProductLogo product={product} />
      </div>

      {/* ── Product Name ───────────────────────── */}
      <div className="px-4 pb-3 text-center">
        <p className="font-heading font-black text-[#0F172A] leading-tight text-[17px]">
          {nameParts.slice(0, 2).join(' ')}
          {nameParts.length > 2 && (
            <>
              <br />
              {nameParts.slice(2).join(' ')}
            </>
          )}
        </p>
      </div>

      {/* ── Divider ────────────────────────────── */}
      <div className="mx-4 border-t border-slate-100" />

      {/* ── Pricing Row ────────────────────────── */}
      <div className="px-4 pt-3 pb-2 flex items-end justify-between gap-2">
        {/* Left: prices */}
        <div className="min-w-0">
          {product.originalPrice && product.originalPrice > product.discountedPrice ? (
            <span className="text-xs font-bold text-slate-400 line-through block leading-none mb-0.5">
              {formatPrice(product.originalPrice)}
            </span>
          ) : (
            <span className="text-xs block leading-none mb-0.5 select-none">&nbsp;</span>
          )}
          <span className="font-heading font-black text-[#10B981] text-2xl leading-none block tracking-tight">
            {formatPrice(product.discountedPrice)}
          </span>
        </div>

        {/* Right: discount pill */}
        {discountPercent > 0 && (
          <div className="shrink-0 flex flex-col items-end gap-1">
            <span className="text-[11px] font-black text-brand-pink leading-none">
              {discountPercent}% OFF
            </span>
            {savings > 0 && (
              <span className="text-[10px] font-black text-[#10B981] bg-[#F0FDF4] px-2 py-0.5 rounded border border-[#10B981]/20 whitespace-nowrap leading-snug">
                SAVE {formatPrice(savings)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Delivery Strip ─────────────────────── */}
      <div className="mx-4 bg-[#FFF5F8] border border-[#FFD6E0] rounded-lg py-2 px-3 flex items-center justify-center gap-3 mb-3">
        <span className="text-[11px] font-extrabold text-brand-pink flex items-center gap-1">
          <Zap className="w-3 h-3 fill-brand-pink" />
          Instant Delivery
        </span>
        <span className="w-px h-3 bg-[#FFD6E0]" />
        <span className="text-[11px] font-extrabold text-brand-pink">{validityStr}</span>
      </div>

      {/* ── Benefits ───────────────────────────── */}
      <div className="px-4 pb-3 space-y-1.5">
        {['Emailed in 10 seconds', '100% Genuine Voucher', 'Free booking guidance'].map(
          (feat, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#10B981] flex items-center justify-center shrink-0">
                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 12 12">
                  <path d="M10 3L5 9 2 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </div>
              <span className="text-[11.5px] font-semibold text-slate-600">{feat}</span>
            </div>
          )
        )}
      </div>

      {/* ── Divider ────────────────────────────── */}
      <div className="mx-4 border-t border-slate-100" />

      {/* ── Action Buttons ─────────────────────── */}
      <div className="px-4 pt-3 pb-4 mt-auto space-y-2">
        {!isOutOfStock ? (
          <>
            {/* Buy Now — primary pink */}
            <button
              onClick={() => startCheckout(product)}
              className="w-full bg-brand-pink hover:bg-[#D9004C] text-white font-black text-xs rounded-full py-3 flex items-center justify-center gap-1.5 shadow-md shadow-brand-pink/20 cursor-pointer hover:scale-[1.02] transition-all"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Buy Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Explore More — secondary outlined */}
            <button
              onClick={exploreMore}
              className="w-full bg-white hover:bg-[#FFF5F8] text-brand-pink font-bold text-xs rounded-full py-2.5 flex items-center justify-center gap-1.5 border border-brand-pink/40 cursor-pointer transition-colors"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Explore More</span>
            </button>

            {/* Add to Cart — tertiary */}
            <button
              onClick={() => addToCart(product)}
              className="w-full bg-white hover:bg-[#FFF5F8] text-brand-pink font-bold text-xs rounded-full py-2.5 flex items-center justify-center gap-1.5 border border-brand-pink/40 cursor-pointer transition-colors"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Add to Cart</span>
            </button>
          </>
        ) : (
          <>
            {/* Out of Stock disabled */}
            <button
              disabled
              className="w-full py-3 rounded-full bg-slate-100 text-slate-400 font-black text-xs cursor-not-allowed text-center border border-slate-200 flex items-center justify-center gap-1.5 select-none uppercase tracking-wider"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Out of Stock</span>
            </button>

            {/* Explore More */}
            <button
              onClick={exploreMore}
              className="w-full bg-white hover:bg-[#FFF5F8] text-brand-pink font-bold text-xs rounded-full py-2.5 flex items-center justify-center gap-1.5 border border-brand-pink/40 cursor-pointer transition-colors"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Explore More</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default HomepageVoucherCard;
