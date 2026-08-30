/** "N% OFF" + optional "SAVE ₹X" pill. */
export default function DiscountBadge({
  percent = 0,
  savings = 0,
  formatPrice,
  align = 'end',
  className = '',
}: {
  percent?: number;
  savings?: number;
  formatPrice?: (n: number) => string;
  align?: 'end' | 'start';
  className?: string;
}) {
  if (!percent && !savings) return null;
  return (
    <div className={`flex flex-col ${align === 'end' ? 'items-end' : 'items-start'} gap-1 ${className}`}>
      {percent > 0 && <span className="text-[11px] font-medium text-accent leading-none tracking-wide">{percent}% OFF</span>}
      {savings > 0 && formatPrice && (
        <span className="text-[10px] font-medium text-success bg-success/10 border border-success/20 px-2 py-0.5 rounded-md whitespace-nowrap leading-snug">
          SAVE {formatPrice(savings)}
        </span>
      )}
    </div>
  );
}
