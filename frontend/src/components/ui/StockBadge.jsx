import React from 'react';
import { Clock, Flame, Zap, CheckCircle2 } from 'lucide-react';
import Badge from './Badge.jsx';

/**
 * Derives a single status pill from a product. Priority:
 *   out of stock  →  coming soon  →  low stock  →  promo badge  →  in stock
 */
export default function StockBadge({ product, className = '' }) {
  const isOut =
    product?.inStock === false ||
    String(product?.stockStatus || product?.badge || '').toUpperCase() === 'OUT OF STOCK';
  const isComingSoon = product?.comingSoon || product?.stockStatus === 'COMING SOON';
  const isLow = product?.stockStatus === 'LOW STOCK';
  const promo =
    (Array.isArray(product?.badges) && product.badges[0]) ||
    (product?.badgeEnabled !== false && product?.badge) ||
    '';

  if (isOut) return <Badge tone="accentSolid" icon={<Clock className="w-3 h-3" />} className={className}>Out of Stock</Badge>;
  if (isComingSoon) return <Badge tone="info" icon={<Clock className="w-3 h-3" />} className={className}>Coming Soon</Badge>;
  if (isLow) return <Badge tone="warn" icon={<Zap className="w-3 h-3" />} className={className}>Limited Stock</Badge>;

  if (promo) {
    const t = promo.toLowerCase();
    const tone = /best.?sell|popular|top/.test(t) ? 'warn'
      : /canada|express|australia|ukvi?|study abroad/.test(t) ? 'info'
      : 'accent';
    const icon = /best.?sell|popular/.test(t) ? <Flame className="w-3 h-3" /> : null;
    return <Badge tone={tone} icon={icon} className={className}>{promo}</Badge>;
  }

  return <Badge tone="success" icon={<CheckCircle2 className="w-3 h-3" />} className={className}>In Stock</Badge>;
}
