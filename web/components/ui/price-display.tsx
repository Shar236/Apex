const CUR = {
  md: 'text-2xl',
  lg: 'text-[2rem] sm:text-4xl',
} as const;

/** Struck original (small, muted) above a prominent current price. Lightweight: current price is font-semibold (600) max — not black. */
export default function PriceDisplay({
  original,
  current,
  formatPrice,
  size = 'md',
  emphasis = 'ink',
  showSaved = false,
  className = '',
}: {
  original?: number | null;
  current?: number | null;
  formatPrice: (n: number) => string;
  size?: keyof typeof CUR;
  emphasis?: 'ink' | 'accent';
  showSaved?: boolean;
  className?: string;
}) {
  const hasDiscount = !!original && original > (current ?? 0);
  const saved = hasDiscount ? (original as number) - (current ?? 0) : 0;
  const curColor = emphasis === 'accent' ? 'text-accent' : 'text-ink';

  return (
    <div className={`min-w-0 ${className}`}>
      {hasDiscount ? (
        <span className="block text-xs font-normal text-ink-muted line-through leading-none mb-1">
          {formatPrice(original as number)}
        </span>
      ) : (
        <span className="block text-xs leading-none mb-1 select-none">&nbsp;</span>
      )}
      <span className={`font-heading font-semibold leading-none tracking-tight block ${CUR[size]} ${curColor}`}>
        {formatPrice(current ?? 0)}
      </span>
      {showSaved && saved > 0 && (
        <span className="block mt-1 text-xs font-normal text-success">You save {formatPrice(saved)}</span>
      )}
    </div>
  );
}
