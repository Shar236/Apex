import React from 'react';
import { Zap } from 'lucide-react';

/**
 * "⚡ Instant Delivery | Valid N Months" — its own bordered pill, visually
 * separated from the price block.
 */
export default function DeliveryValidityBar({ product, className = '' }) {
  const delivery = product?.deliveryType || 'Instant Delivery';
  const validity = product?.validityMonths
    ? `Valid ${product.validityMonths} Month${product.validityMonths === 1 ? '' : 's'}`
    : product?.validity || 'Valid 6 Months';

  return (
    <div
      className={[
        'flex items-center justify-center gap-3 rounded-lg py-2 px-3',
        'bg-accent/6 border border-accent/20',
        'text-[11px] font-medium text-accent',
        className,
      ].join(' ')}
    >
      <span className="inline-flex items-center gap-1.5">
        <Zap className="w-3 h-3 fill-current" />
        {delivery}
      </span>
      <span className="w-px h-3 bg-accent/25" />
      <span>{validity}</span>
    </div>
  );
}
