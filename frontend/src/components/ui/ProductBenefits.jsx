import React from 'react';
import { Check } from 'lucide-react';

const DEFAULT = ['Emailed in 10 seconds', '100% Genuine Voucher', 'Free booking guidance'];

/** Scannable check-list of product benefits. Lightweight type. */
export default function ProductBenefits({ items = DEFAULT, className = '' }) {
  return (
    <ul className={`space-y-1.5 ${className}`}>
      {items.map((item, i) => (
        <li key={i} className="flex items-center gap-2 text-[12px] font-normal text-ink-muted">
          <span className="w-4 h-4 rounded-full bg-success/15 flex items-center justify-center shrink-0">
            <Check className="w-2.5 h-2.5 text-success" strokeWidth={3} />
          </span>
          <span className="leading-tight">{item}</span>
        </li>
      ))}
    </ul>
  );
}
