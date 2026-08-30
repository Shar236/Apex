/**
 * Official Brand Logos for Exam Providers.
 *
 *   inverted={false}  → logo is placed on a LIGHT/WHITE background (card bg). Dark brand colors.
 *   inverted={true}   → logo is placed on a DARK background. Light/bright colors for contrast.
 *
 * All color values are set via inline `style` (never `dark:` variants) so a logo's
 * color depends only on the `inverted` prop, not the page's Tailwind dark class —
 * product cards are always white regardless of site theme.
 */

interface LogoProps {
  className?: string;
  inverted?: boolean;
}

export const PearsonOfficialLogo = ({ className = 'h-7', inverted = false, showTagline = false }: LogoProps & { showTagline?: boolean }) => {
  const color = inverted ? '#FFFFFF' : '#000048';
  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`} style={{ color }} aria-label="Pearson">
      <svg className="h-full w-auto aspect-[3.2/1] shrink-0" viewBox="0 0 240 75" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Pearson official logo">
        <path d="M32 12C20 22 14 38 18 54C11 46 8 34 11 22C14 12 22 5 32 12Z" fill="currentColor" />
        <path d="M48 20C38 28 34 44 38 60C30 52 27 40 30 28C33 18 40 12 48 20Z" fill="currentColor" />
        <text x="58" y="56" fill="currentColor" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" fontWeight="800" fontSize="48" letterSpacing="-1.5">
          Pearson
        </text>
      </svg>
      {showTagline && <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Official Provider</span>}
    </div>
  );
};

export const PearsonPTEPracticeTestLogo = ({ className = 'h-12', inverted = false }: LogoProps) => {
  const iconColor = inverted ? '#38BDF8' : '#000048';
  const textColor = inverted ? '#FFFFFF' : '#000048';
  const pteColor = inverted ? '#FFFFFF' : '#0F172A';
  const subColor = inverted ? '#CBD5E1' : '#475569';
  return (
    <div className={`flex flex-col items-center justify-center text-center select-none ${className}`}>
      <div className="flex items-center justify-center gap-1.5">
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 40 40" fill="currentColor" style={{ color: iconColor }}>
          <path d="M12 8C6 14 3 24 6 34C2 29 0 21 2 14C4 8 8 3 12 8Z" />
          <path d="M22 13C16 19 14 29 17 38C12 33 10 25 12 18C14 12 18 8 22 13Z" />
        </svg>
        <span className="text-xs font-bold" style={{ color: textColor }}>Pearson</span>
        <span className="font-heading font-black text-xl tracking-tight" style={{ color: pteColor }}>PTE</span>
      </div>
      <span className="text-xs font-semibold tracking-tight mt-0.5" style={{ color: subColor }}>Practice Test</span>
    </div>
  );
};

export const PearsonPTEAcademicLogo = ({ className = 'h-12', inverted = false }: LogoProps) => {
  const iconColor = inverted ? '#38BDF8' : '#000048';
  const textColor = inverted ? '#38BDF8' : '#000048';
  const pteColor = inverted ? '#FFFFFF' : '#0F172A';
  const subColor = inverted ? '#CBD5E1' : '#475569';
  return (
    <div className={`flex flex-col items-center justify-center text-center select-none ${className}`}>
      <div className="flex items-center justify-center gap-1.5">
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 40 40" fill="currentColor" style={{ color: iconColor }}>
          <path d="M12 8C6 14 3 24 6 34C2 29 0 21 2 14C4 8 8 3 12 8Z" />
          <path d="M22 13C16 19 14 29 17 38C12 33 10 25 12 18C14 12 18 8 22 13Z" />
        </svg>
        <span className="font-bold text-sm tracking-tight" style={{ color: textColor }}>Pearson</span>
      </div>
      <span className="font-heading font-black text-lg tracking-tight -mt-0.5" style={{ color: pteColor }}>PTE</span>
      <span className="text-[11px] font-semibold -mt-1" style={{ color: subColor }}>Academic</span>
    </div>
  );
};

export const PTEAcademicLogo = PearsonPTEAcademicLogo;
export const PearsonPTELogo = PearsonPTEAcademicLogo;
export const PTEUKVILogo = PearsonPTEAcademicLogo;

export const PearsonPTECoreLogo = ({ className = 'h-12', inverted = false }: LogoProps) => {
  const textColor = inverted ? '#FFFFFF' : '#000048';
  const coreColor = inverted ? '#FFFFFF' : '#0F172A';
  return (
    <div className={`flex flex-col items-center justify-center text-center select-none ${className}`}>
      <div className="flex items-center justify-center gap-1.5">
        <span className="w-5 h-5 rounded-md bg-[#0284C7] text-white font-heading font-black text-xs flex items-center justify-center shadow-sm">P</span>
        <span className="font-bold text-sm" style={{ color: textColor }}>Pearson</span>
      </div>
      <span className="font-heading font-black text-base tracking-tight mt-0.5" style={{ color: coreColor }}>PTE Core</span>
    </div>
  );
};

export const PTECoreLogo = PearsonPTECoreLogo;

export const PearsonPTECanadaLogo = ({ className = 'h-12', inverted = false }: LogoProps) => {
  const iconColor = inverted ? '#38BDF8' : '#000048';
  const textColor = inverted ? '#38BDF8' : '#000048';
  const pteColor = inverted ? '#FFFFFF' : '#0F172A';
  const subColor = inverted ? '#CBD5E1' : '#475569';
  return (
    <div className={`flex flex-col items-center justify-center text-center select-none ${className}`}>
      <div className="flex items-center justify-center gap-1.5">
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 40 40" fill="currentColor" style={{ color: iconColor }}>
          <path d="M12 8C6 14 3 24 6 34C2 29 0 21 2 14C4 8 8 3 12 8Z" />
          <path d="M22 13C16 19 14 29 17 38C12 33 10 25 12 18C14 12 18 8 22 13Z" />
        </svg>
        <span className="font-bold text-xs tracking-tight" style={{ color: textColor }}>Pearson</span>
      </div>
      <span className="font-heading font-black text-base tracking-tight -mt-0.5" style={{ color: pteColor }}>PTE</span>
      <span className="text-[11px] font-semibold" style={{ color: subColor }}>Canada</span>
    </div>
  );
};

export const ETSGreLogo = ({ className = 'h-12', inverted = false }: LogoProps) => {
  const color = inverted ? '#C084FC' : '#582C83';
  const subColor = inverted ? '#D8B4FE' : '#6B21A8';
  return (
    <div className={`flex items-center justify-center gap-1.5 select-none ${className}`} aria-label="ETS GRE">
      <div className="font-black text-2xl leading-none" style={{ color }}>✱</div>
      <div className="font-heading font-black text-2xl sm:text-3xl tracking-tighter lowercase flex items-baseline" style={{ color }}>
        gre<span className="text-xs font-bold ml-0.5" style={{ color: subColor }}>®</span>
      </div>
    </div>
  );
};

export const ETSGRELogo = ETSGreLogo;

export const ETSToeflLogo = ({ className = 'h-12', inverted = false }: LogoProps) => {
  const color = inverted ? '#FFFFFF' : '#000000';
  return (
    <div className={`flex items-center justify-center gap-1.5 select-none ${className}`} aria-label="ETS TOEFL">
      <div className="font-black text-2xl leading-none" style={{ color }}>✱</div>
      <div className="font-heading font-black text-2xl sm:text-3xl tracking-tighter lowercase flex items-baseline" style={{ color }}>
        toefl<span className="text-xs font-bold ml-0.5" style={{ color }}>®</span>
      </div>
    </div>
  );
};

export const ToeflOfficialLogo = ETSToeflLogo;

export const DuolingoTestLogo = ({ className = 'h-12', inverted = false }: LogoProps) => {
  const textColor = inverted ? '#FFFFFF' : '#58CC02';
  return (
    <div className={`flex flex-col items-center justify-center text-center select-none ${className}`} aria-label="Duolingo">
      <div className="w-6 h-6 rounded-full bg-[#FFC800] text-white flex items-center justify-center font-bold text-xs shadow-sm mb-0.5">✿</div>
      <span className="font-heading font-extrabold text-lg tracking-tight lowercase" style={{ color: textColor }}>duolingo</span>
    </div>
  );
};

export const ACTLogo = ({ className = 'h-12', inverted = false }: LogoProps) => {
  const color = inverted ? '#38BDF8' : '#002D62';
  return (
    <div className={`flex items-center justify-center select-none ${className}`} aria-label="ACT">
      <span className="font-heading font-black text-2xl sm:text-3xl tracking-wider italic font-serif" style={{ color }}>ACT</span>
    </div>
  );
};

export const OETLogo = ({ className = 'h-12', inverted = false }: LogoProps) => {
  const color = inverted ? '#38BDF8' : '#0072CE';
  return (
    <div className={`flex items-center justify-center select-none ${className}`} aria-label="OET">
      <div className="flex items-center font-heading font-black text-2xl sm:text-3xl tracking-tight" style={{ color }}>
        <div className="w-7 h-7 rounded-full flex items-center justify-center mr-0.5" style={{ border: `3.5px solid ${color}` }}>
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
        </div>
        <span>ET</span>
        <span className="text-[10px] font-bold text-slate-400 ml-0.5 -mt-3">®</span>
      </div>
    </div>
  );
};

export const IELTSLogo = ({ className = 'h-12' }: { className?: string }) => (
  <div className={`flex items-center justify-center select-none ${className}`} aria-label="IELTS">
    <span className="font-heading font-black text-2xl sm:text-3xl tracking-tight" style={{ color: '#EF4444' }}>IELTS</span>
  </div>
);

export const IELTSOfficialLogo = IELTSLogo;

export const LanguageCertLogo = ({ className = 'h-12', inverted = false }: LogoProps) => {
  const textColor = inverted ? '#FFFFFF' : '#1F2937';
  return (
    <div className={`flex flex-col items-center justify-center text-center select-none ${className}`} aria-label="LanguageCert">
      <div className="w-5 h-5 rounded-full bg-[#F36C21] text-white flex items-center justify-center font-bold text-xs shadow-sm mb-0.5">a</div>
      <span className="font-heading font-extrabold text-xs tracking-wider uppercase" style={{ color: textColor }}>LANGUAGECERT</span>
    </div>
  );
};

export const CELPIPLogo = ({ className = 'h-12', inverted = false }: LogoProps) => {
  const textColor = inverted ? '#FFFFFF' : '#1E293B';
  return (
    <div className={`flex flex-col items-center justify-center text-center select-none ${className}`} aria-label="CELPIP">
      <div className="text-amber-500 text-lg leading-none mb-0.5">🍁</div>
      <div className="flex items-center font-heading font-black text-base tracking-wider" style={{ color: textColor }}>
        CELPIP<span className="text-[9px] font-bold ml-0.5 text-amber-500">®</span>
      </div>
    </div>
  );
};

export const DynamicPTELogo = ({ type = 'academic', className = 'h-12', inverted = false }: LogoProps & { type?: string }) => {
  const norm = String(type || '').toLowerCase();
  if (norm.includes('core')) return <PearsonPTECoreLogo className={className} inverted={inverted} />;
  if (norm.includes('canada')) return <PearsonPTECanadaLogo className={className} inverted={inverted} />;
  if (norm.includes('practice') || norm.includes('mock')) return <PearsonPTEPracticeTestLogo className={className} inverted={inverted} />;
  return <PearsonPTEAcademicLogo className={className} inverted={inverted} />;
};

/** Default inverted=true (dark card context). Pass inverted={false} for white/light card contexts. */
export const BrandLogoContainer = ({
  brand = '',
  name = '',
  className = 'h-12',
  inverted = true,
}: {
  brand?: string;
  name?: string;
  className?: string;
  inverted?: boolean;
}) => {
  const haystack = `${brand} ${name}`.toLowerCase();

  if (haystack.includes('practice test') || haystack.includes('mock test')) return <PearsonPTEPracticeTestLogo className={className} inverted={inverted} />;
  if (haystack.includes('pte core')) return <PearsonPTECoreLogo className={className} inverted={inverted} />;
  if (haystack.includes('pte canada') || haystack.includes('canada voucher')) return <PearsonPTECanadaLogo className={className} inverted={inverted} />;
  if (haystack.includes('pte') || haystack.includes('pearson')) return <PearsonPTEAcademicLogo className={className} inverted={inverted} />;
  if (haystack.includes('gre')) return <ETSGreLogo className={className} inverted={inverted} />;
  if (haystack.includes('toefl')) return <ETSToeflLogo className={className} inverted={inverted} />;
  if (haystack.includes('duolingo')) return <DuolingoTestLogo className={className} inverted={inverted} />;
  if (haystack.includes('act')) return <ACTLogo className={className} inverted={inverted} />;
  if (haystack.includes('oet')) return <OETLogo className={className} inverted={inverted} />;
  if (haystack.includes('ielts')) return <IELTSLogo className={className} />;
  if (haystack.includes('languagecert')) return <LanguageCertLogo className={className} inverted={inverted} />;
  if (haystack.includes('celpip')) return <CELPIPLogo className={className} inverted={inverted} />;

  const fallbackColor = inverted ? '#FFFFFF' : '#1F2937';
  return (
    <div className={`flex items-center justify-center font-heading font-black text-lg ${className}`} style={{ color: fallbackColor }}>
      {name || brand || 'Official Voucher'}
    </div>
  );
};
