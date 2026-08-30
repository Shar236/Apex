import { Clock, Flame, Zap, CheckCircle2, Ticket } from 'lucide-react';
import Badge from './badge';
import type { Product } from '@/lib/types';

/**
 * Derives a single status pill from a product. Priority:
 *   coming soon  →  request only (0 codes)  →  low stock  →  promo badge  →  in stock
 *
 * A product with zero available voucher codes is NEVER shown as "Out of
 * Stock" — it's a live product with temporarily empty inventory and gets a
 * neutral "Available on Request" pill instead.
 */
export default function StockBadge({ product, className = '' }: { product: Product; className?: string }) {
  const isComingSoon = product?.comingSoon || product?.stockStatus === 'COMING SOON';
  const isUnlimited = product?.stockType === 'UNLIMITED';
  const avail = product?.availableStock ?? product?.availability ?? (product?.inStock === false ? 0 : 1);
  const isRequestOnly =
    !isComingSoon &&
    !isUnlimited &&
    (Number(avail) <= 0 || String(product?.stockStatus || '').toUpperCase() === 'OUT OF STOCK' || product?.inStock === false);
  const isLow = !isRequestOnly && product?.stockStatus === 'LOW STOCK';
  const promo = (Array.isArray(product?.badges) && product.badges[0]) || (product?.badgeEnabled !== false && product?.badge) || '';

  if (isComingSoon)
    return (
      <Badge tone="info" icon={<Clock className="w-3 h-3" />} className={className}>
        Coming Soon
      </Badge>
    );
  if (isRequestOnly)
    return (
      <Badge tone="info" icon={<Ticket className="w-3 h-3" />} className={className}>
        Available on Request
      </Badge>
    );
  if (isLow)
    return (
      <Badge tone="warn" icon={<Zap className="w-3 h-3" />} className={className}>
        Limited Stock
      </Badge>
    );

  if (promo) {
    const t = promo.toLowerCase();
    const tone = /best.?sell|popular|top/.test(t) ? 'warn' : /canada|express|australia|ukvi?|study abroad/.test(t) ? 'info' : 'accent';
    const icon = /best.?sell|popular/.test(t) ? <Flame className="w-3 h-3" /> : null;
    return (
      <Badge tone={tone} icon={icon} className={className}>
        {promo}
      </Badge>
    );
  }

  return (
    <Badge tone="success" icon={<CheckCircle2 className="w-3 h-3" />} className={className}>
      In Stock
    </Badge>
  );
}
