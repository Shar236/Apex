'use client';

import { useState } from 'react';
import Image from 'next/image';
import { BrandLogoContainer } from '@/components/official-brand-logos';
import { useTheme } from '@/components/theme-provider';
import type { Product } from '@/lib/types';

/**
 * The provider/exam logo for a product.
 *  - admin-uploaded product.logo image → shown in a light chip so any
 *    dark-inked raster logo stays visible on either card surface
 *  - otherwise → the real official SVG (OfficialBrandLogos), adapting to the
 *    current theme via `inverted`
 */
export default function ProviderLogo({ product, height = 'h-11', className = '' }: { product: Product; height?: string; className?: string }) {
  const { isDark } = useTheme();
  const [imgFailed, setImgFailed] = useState(false);
  const hasImage = product?.logo && !imgFailed;

  if (hasImage) {
    return (
      <div className={`flex items-center justify-center rounded-xl bg-white border border-black/5 px-4 py-3 ${className}`}>
        <Image
          src={product.logo as string}
          alt={`${product.name || product.brand || 'Provider'} logo`}
          width={320}
          height={96}
          loading="lazy"
          className={`${height} w-auto max-w-full object-contain`}
          onError={() => setImgFailed(true)}
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center px-4 py-3 ${className}`}>
      <BrandLogoContainer brand={product?.brand || product?.provider} name={product?.name} className={height} inverted={isDark} />
    </div>
  );
}
