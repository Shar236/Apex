import React from 'react';

/**
 * "N% OFF" + optional "SAVE ₹X" pill. `formatPrice` is passed from the caller
 * (they already have it from useVoucher).
 */
export default function DiscountBadge({ percent = 0, savings = 0, formatPrice, align = 'end', className = '' }) {
  if (!percent && !savings) return null;
  return (
    <div className={`flex flex-col ${align === 'end' ? 'items-end' : 'items-start'} gap-1 ${className}`}>
      {percent > 0 && (
        <span className="text-[11px] font-medium text-[var(--color-accent)] leading-none tracking-wide">
          {percent}% OFF
        </span>
      )}
      {savings > 0 && formatPrice && (
        <span className="text-[10px] font-medium text-[var(--color-success)] bg-[var(--color-success)]/10 border border-[var(--color-success)]/20 px-2 py-0.5 rounded-md whitespace-nowrap leading-snug">
          SAVE {formatPrice(savings)}
        </span>
      )}
    </div>
  );
}
