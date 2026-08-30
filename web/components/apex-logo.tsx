export function ApexLogo({
  className = 'h-8',
  showTagline = false,
  whiteText = false,
}: {
  className?: string;
  showTagline?: boolean;
  whiteText?: boolean;
}) {
  return (
    <div className={`inline-flex flex-col select-none group cursor-pointer ${className}`}>
      <div className="flex items-start gap-1 font-heading font-black text-2xl tracking-tighter leading-none">
        <div className="relative inline-flex items-center">
          <span className={`font-black tracking-[0.02em] transition-colors duration-200 ${whiteText ? 'text-white' : 'text-neutral-900 dark:text-white group-hover:text-brand-pink'}`}>
            APEX
          </span>
          <svg
            className="w-5 h-5 -mt-2.5 -ml-0.5 text-brand-pink transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M5 19L19 5M19 5H9M19 5V15" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </div>
      </div>
      <div className="font-heading font-black text-xs tracking-[0.18em] text-brand-pink -mt-0.5 leading-tight">VOUCHERS</div>
      {showTagline && (
        <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mt-1">
          Test Smarter • Save More
        </span>
      )}
    </div>
  );
}
