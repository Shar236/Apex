import React, { useState } from 'react';
import { BrandLogoContainer } from '../OfficialBrandLogos';
import { imageUrl } from '../../lib/imageUrl.js';
import { useTheme } from '../../context/ThemeContext.jsx';

/**
 * The provider/exam logo for a product.
 *
 *  - admin-uploaded `product.logo` image → shown in a light chip so any
 *    dark-inked raster logo stays visible on either card surface
 *  - otherwise → the real official SVG (OfficialBrandLogos), adapting to the
 *    current theme via `inverted`
 *  - never a generated/fake logo; the SVG set already has a clean text fallback
 *
 * `height` controls the visual size; the wrapper adds breathing room.
 */
export default function ProviderLogo({ product, height = 'h-11', className = '' }) {
  const { isDark } = useTheme();
  const [imgFailed, setImgFailed] = useState(false);
  const hasImage = product?.logo && !imgFailed;

  if (hasImage) {
    return (
      <div className={`flex items-center justify-center rounded-xl bg-white border border-black/5 px-4 py-3 ${className}`}>
        <img
          src={imageUrl(product.logo, { width: 320 })}
          alt={`${product.name || product.brand || 'Provider'} logo`}
          loading="lazy"
          className={`${height} w-auto max-w-full object-contain`}
          onError={() => setImgFailed(true)}
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center px-4 py-3 ${className}`}>
      <BrandLogoContainer
        brand={product?.brand || product?.provider}
        name={product?.name}
        className={height}
        inverted={isDark}
      />
    </div>
  );
}
