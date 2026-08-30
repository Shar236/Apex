'use client';

import { BrandLogoContainer } from '@/components/official-brand-logos';
import { useTheme } from '@/components/theme-provider';

/** BrandLogoContainer wrapper that reads the live theme — for use on cards whose background isn't always-white (unlike ProviderLogo's card, this one tracks the page theme). */
export function ThemedBrandLogo({ brand, name, className }: { brand?: string; name?: string; className?: string }) {
  const { isDark } = useTheme();
  return <BrandLogoContainer brand={brand} name={name} className={className} inverted={isDark} />;
}
