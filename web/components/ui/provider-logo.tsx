'use client';

import { useState } from 'react';
import Image from 'next/image';
import { BrandLogoContainer } from '@/components/official-brand-logos';
import { useTheme } from '@/components/theme-provider';
import type { Product } from '@/lib/types';

/**
 * The provider/exam logo for a product — the single logo component for every
 * product surface (cards, detail page, related rows).
 *
 * Sizing is deliberately expressed as a fixed-height FRAME plus a max-height /
 * max-width box for the mark itself, rather than one width applied to every
 * logo. Provider marks differ wildly in aspect ratio (a wide "Pearson PTE"
 * wordmark vs. a near-square Duolingo mark), so:
 *   - the frame keeps every card's logo row the same height and aligned;
 *   - `object-contain` + max-width lets a wide wordmark be limited by width and
 *     a tall/square mark by height, so both land at a similar optical weight;
 *   - nothing is ever cropped or stretched.
 *
 * Two sources are supported: an admin-uploaded raster (`product.logo`), shown on
 * a light chip so a dark-inked logo stays legible on either card surface, and
 * the built-in official SVG, which adapts to the theme via `inverted`.
 */

/**
 * `img` is an explicit height, never `h-auto`: a lazy-loaded image with auto
 * width AND height has no intrinsic box before it loads, collapses to 0×0, and
 * the intersection observer then never fires — so the logo never loads at all.
 * Fixed height + `w-auto` keeps the aspect ratio; `max-w-full` +
 * `object-contain` letterbox a very wide wordmark instead of cropping it.
 *
 * Note on aspect ratio: a near-square mark (Duolingo, IELTS) is height-bound and
 * takes the full 64px. A very wide wordmark (a 6.5:1 "Pearson PTE" lockup) is
 * width-bound — 64px of height would need ~420px of width, far more than a card
 * has — so it fills the frame's width instead. That is why the frame carries the
 * consistency (same height, same alignment on every card) rather than one width
 * being forced onto every logo. Padding is kept tight so width-bound logos get
 * as much room as possible.
 */
const SIZES = {
  /** Product cards in a grid — the logo is one of the strongest elements. */
  md: { frame: 'h-20', img: 'h-16', svg: 'h-16' },
  /** Dense rows (related products, compact lists). */
  sm: { frame: 'h-16', img: 'h-12', svg: 'h-12' },
  /** Product detail hero. */
  lg: { frame: 'h-24', img: 'h-20', svg: 'h-20' },
} as const;

export type ProviderLogoSize = keyof typeof SIZES;

export default function ProviderLogo({
  product,
  size = 'md',
  className = '',
}: {
  product: Product;
  size?: ProviderLogoSize;
  className?: string;
}) {
  const { isDark } = useTheme();
  const [imgFailed, setImgFailed] = useState(false);
  const hasImage = product?.logo && !imgFailed;
  const s = SIZES[size] ?? SIZES.md;

  if (hasImage) {
    return (
      <div
        className={`flex ${s.frame} items-center justify-center rounded-xl bg-white border border-black/5 px-2.5 py-2 ${className}`}
      >
        <Image
          src={product.logo as string}
          alt={`${product.name || product.brand || 'Provider'} logo`}
          width={320}
          height={128}
          loading="lazy"
          className={`${s.img} w-auto max-w-full object-contain`}
          onError={() => setImgFailed(true)}
        />
      </div>
    );
  }

  return (
    <div className={`flex ${s.frame} items-center justify-center overflow-hidden px-2.5 py-2 ${className}`}>
      <BrandLogoContainer
        brand={product?.brand || product?.provider}
        name={product?.name}
        className={`${s.svg} max-w-full`}
        inverted={isDark}
      />
    </div>
  );
}
