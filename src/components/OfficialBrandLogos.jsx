import React from 'react';

// Individual Brand Logo Components for Marquee & Category Sections

export const PearsonPTELogo = ({ className = "h-8" }) => (
  <div className={`flex items-center gap-2.5 font-sans ${className}`}>
    <svg className="h-8 w-auto text-[#005A9C] shrink-0" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="18" fill="#005A9C" />
      <path d="M14 12H22C25.3137 12 28 14.6863 28 18C28 21.3137 25.3137 24 22 24H18V28H14V12ZM18 16V20H22C23.1046 20 24 19.1046 24 18C24 16.8954 23.1046 16 22 16H18Z" fill="white" />
    </svg>
    <div className="flex flex-col text-left leading-none">
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pearson</span>
      <span className="text-base font-heading font-black text-[#005A9C] dark:text-sky-400 tracking-tight">PTE Academic</span>
    </div>
  </div>
);

export const IELTSLogo = ({ className = "h-7" }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <div className="bg-[#E31837] text-white px-2.5 py-1 rounded-md font-heading font-black text-lg tracking-normal shadow-sm">
      IELTS
    </div>
    <span className="text-[10px] font-extrabold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Official</span>
  </div>
);

export const ETSToeflLogo = ({ className = "h-8" }) => (
  <div className={`flex items-center gap-2.5 font-sans ${className}`}>
    <div className="bg-[#004B87] text-white px-2 py-1 rounded-md font-heading font-black text-xs tracking-wider shadow-sm">
      ETS
    </div>
    <div className="flex flex-col text-left leading-none">
      <span className="text-base font-heading font-black text-[#004B87] dark:text-blue-400 tracking-tight">TOEFL iBT®</span>
      <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">English Proficiency</span>
    </div>
  </div>
);

export const ETSGreLogo = ({ className = "h-8" }) => (
  <div className={`flex items-center gap-2.5 font-sans ${className}`}>
    <div className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 px-2 py-1 rounded-md font-heading font-black text-xs tracking-wider shadow-sm">
      ETS
    </div>
    <div className="flex flex-col text-left leading-none">
      <span className="text-base font-heading font-black text-slate-900 dark:text-white tracking-wider">GRE®</span>
      <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">General Test</span>
    </div>
  </div>
);

export const DuolingoTestLogo = ({ className = "h-8" }) => (
  <div className={`flex items-center gap-2 font-sans ${className}`}>
    <div className="w-8 h-8 rounded-full bg-[#58CC02] text-white font-black text-base flex items-center justify-center shadow-sm shrink-0">
      🦉
    </div>
    <div className="flex flex-col text-left leading-none">
      <span className="text-base font-heading font-black text-[#58CC02] tracking-tight">duolingo</span>
      <span className="text-[9px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">English Test</span>
    </div>
  </div>
);

// Brand Header Rectangular Banners matching user's reference screenshot

export const PearsonPTEBanner = ({ title = "PTE Academic", subtitle = "PTE Academic Test" }) => (
  <div className="w-full bg-[#121A2D] p-4 rounded-2xl border border-slate-800/80 flex items-center gap-3.5 shadow-sm">
    <div className="w-12 h-12 rounded-full bg-[#005A9C] text-white flex items-center justify-center font-heading font-black text-2xl shrink-0 shadow-md">
      P
    </div>
    <div className="flex flex-col text-left leading-tight">
      <span className="text-xl font-heading font-black text-white tracking-tight">
        {title}
      </span>
      <span className="text-xs font-bold text-slate-400">
        {subtitle}
      </span>
    </div>
  </div>
);

export const ETSGREBanner = ({ title = "GRE®", subtitle = "General Test" }) => (
  <div className="w-full bg-[#1A162B] p-4 rounded-2xl border border-slate-800/80 flex items-center gap-3.5 shadow-sm">
    <div className="w-12 h-12 rounded-2xl bg-white text-slate-950 flex items-center justify-center font-heading font-black text-xs tracking-wider shrink-0 shadow-md">
      ETS
    </div>
    <div className="flex flex-col text-left leading-tight">
      <span className="text-xl font-heading font-black text-white tracking-wider">
        {title}
      </span>
      <span className="text-xs font-bold text-slate-400">
        {subtitle}
      </span>
    </div>
  </div>
);

export const ETSTOEFLBanner = ({ title = "TOEFL iBT®", subtitle = "English Proficiency Test" }) => (
  <div className="w-full bg-[#0F1B2D] p-4 rounded-2xl border border-slate-800/80 flex items-center gap-3.5 shadow-sm">
    <div className="w-12 h-12 rounded-2xl bg-[#004B87] text-white flex items-center justify-center font-heading font-black text-xs tracking-wider shrink-0 shadow-md">
      ETS
    </div>
    <div className="flex flex-col text-left leading-tight">
      <span className="text-xl font-heading font-black text-white tracking-tight">
        {title}
      </span>
      <span className="text-xs font-bold text-slate-400">
        {subtitle}
      </span>
    </div>
  </div>
);

export const DuolingoBanner = ({ title = "Duolingo DET", subtitle = "English Test" }) => (
  <div className="w-full bg-[#12241A] p-4 rounded-2xl border border-slate-800/80 flex items-center gap-3.5 shadow-sm">
    <div className="w-12 h-12 rounded-full bg-[#58CC02] text-white font-black text-xl flex items-center justify-center shrink-0 shadow-md">
      🦉
    </div>
    <div className="flex flex-col text-left leading-tight">
      <span className="text-xl font-heading font-black text-[#58CC02] tracking-tight">
        {title}
      </span>
      <span className="text-xs font-bold text-slate-400">
        {subtitle}
      </span>
    </div>
  </div>
);

export const BrandLogoContainer = ({ brand, name }) => {
  const brandLower = (brand || '').toLowerCase();
  const nameLower = (name || '').toLowerCase();

  if (brandLower.includes('gre') || nameLower.includes('gre')) {
    return <ETSGREBanner title="GRE®" subtitle="General Test" />;
  }
  if (brandLower.includes('toefl') || nameLower.includes('toefl')) {
    return <ETSTOEFLBanner title="TOEFL iBT®" subtitle="English Proficiency" />;
  }
  if (brandLower.includes('duolingo') || nameLower.includes('duolingo')) {
    return <DuolingoBanner title="Duolingo DET" subtitle="English Test" />;
  }
  
  // Default Pearson PTE
  const subtitle = nameLower.includes('core') ? 'PTE Core' : 'PTE Academic Test';
  return <PearsonPTEBanner title="PTE Academic" subtitle={subtitle} />;
};
