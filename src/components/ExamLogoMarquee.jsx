import React from 'react';
import { PearsonPTELogo, IELTSLogo, ETSToeflLogo, DuolingoTestLogo, ETSGreLogo } from './OfficialBrandLogos';

export const ExamLogoMarquee = () => {
  const logos = [
    { id: 'pte', component: PearsonPTELogo, label: 'Pearson PTE Academic' },
    { id: 'ielts', component: IELTSLogo, label: 'IELTS Academic' },
    { id: 'toefl', component: ETSToeflLogo, label: 'ETS TOEFL iBT' },
    { id: 'duolingo', component: DuolingoTestLogo, label: 'Duolingo English Test' },
    { id: 'gre', component: ETSGreLogo, label: 'ETS GRE General' },
  ];

  return (
    <section 
      aria-label="Exam platforms supported by Apex Vouchers"
      className="py-6 sm:py-8 bg-white dark:bg-[#111111] border-y border-slate-200/80 dark:border-[#292929] relative overflow-hidden transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-3 text-center">
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          Vouchers Available For Leading English-Language Exams
        </span>
      </div>

      {/* Marquee Wrapper with Fade Mask Edges */}
      <div className="relative w-full overflow-hidden">
        
        {/* Left Fade Gradient Mask */}
        <div className="absolute top-0 left-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-white via-white/80 to-transparent dark:from-[#111111] dark:via-[#111111]/80 dark:to-transparent z-10 pointer-events-none" />

        {/* Right Fade Gradient Mask */}
        <div className="absolute top-0 right-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-white via-white/80 to-transparent dark:from-[#111111] dark:via-[#111111]/80 dark:to-transparent z-10 pointer-events-none" />

        {/* Infinite Continuous Marquee Track */}
        <div className="flex w-max animate-marquee hover:[animation-play-state:paused] items-center space-x-8 sm:space-x-12 py-2">
          
          {/* Group 1 */}
          <div className="flex items-center space-x-8 sm:space-x-12 shrink-0">
            {logos.map((item) => {
              const LogoComp = item.component;
              return (
                <React.Fragment key={`g1-${item.id}`}>
                  <div className="h-10 sm:h-12 px-4 py-2 bg-[#F0F7FF] dark:bg-[#161616] rounded-2xl border border-slate-200/80 dark:border-[#292929] shadow-sm flex items-center justify-center hover:border-[#FF005C] transition-colors">
                    <LogoComp />
                  </div>
                  <span className="text-slate-300 dark:text-slate-600 font-bold text-sm select-none">•</span>
                </React.Fragment>
              );
            })}
          </div>

          {/* Group 2 (Duplicate for Seamless Infinite Loop) */}
          <div className="flex items-center space-x-8 sm:space-x-12 shrink-0">
            {logos.map((item) => {
              const LogoComp = item.component;
              return (
                <React.Fragment key={`g2-${item.id}`}>
                  <div className="h-10 sm:h-12 px-4 py-2 bg-[#F0F7FF] dark:bg-[#161616] rounded-2xl border border-slate-200/80 dark:border-[#292929] shadow-sm flex items-center justify-center hover:border-[#FF005C] transition-colors">
                    <LogoComp />
                  </div>
                  <span className="text-slate-300 dark:text-slate-600 font-bold text-sm select-none">•</span>
                </React.Fragment>
              );
            })}
          </div>

          {/* Group 3 (Duplicate for Ultrawide Displays) */}
          <div className="flex items-center space-x-8 sm:space-x-12 shrink-0">
            {logos.map((item) => {
              const LogoComp = item.component;
              return (
                <React.Fragment key={`g3-${item.id}`}>
                  <div className="h-10 sm:h-12 px-4 py-2 bg-[#F0F7FF] dark:bg-[#161616] rounded-2xl border border-slate-200/80 dark:border-[#292929] shadow-sm flex items-center justify-center hover:border-[#FF005C] transition-colors">
                    <LogoComp />
                  </div>
                  <span className="text-slate-300 dark:text-slate-600 font-bold text-sm select-none">•</span>
                </React.Fragment>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
};
