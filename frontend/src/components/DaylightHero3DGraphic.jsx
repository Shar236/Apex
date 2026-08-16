import React, { useState, useRef } from 'react';

export const DaylightHero3DGraphic = () => {
  const containerRef = useRef(null);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to +0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to +0.5
    setMouseOffset({ x, y });
  };

  const handleMouseLeave = () => {
    setMouseOffset({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-[620px] h-[480px] sm:h-[520px] mx-auto flex items-center justify-center select-none overflow-visible"
    >
      {/* ========================================================================= */}
      {/* BACKGROUND DECORATION LAYER (Parallax multiplier: 4px) */}
      {/* ========================================================================= */}
      <div
        className="absolute inset-0 transition-transform duration-300 ease-out pointer-events-none"
        style={{
          transform: `translate3d(${mouseOffset.x * 6}px, ${mouseOffset.y * 6}px, 0)`,
        }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[440px] h-[440px] rounded-full bg-gradient-to-tr from-[#FF005C]/15 via-rose-200/20 to-purple-200/10 blur-3xl" />
      </div>

      {/* ========================================================================= */}
      {/* DOTTED ORBITAL RING & CENTRAL STUDENT HERO ILLUSTRATION (Parallax: 10px) */}
      {/* ========================================================================= */}
      <div
        className="relative w-full h-full flex items-center justify-center transition-transform duration-300 ease-out"
        style={{
          transform: `translate3d(${mouseOffset.x * 10}px, ${mouseOffset.y * 10}px, 0)`,
        }}
      >
        <svg
          viewBox="0 0 700 520"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-2xl overflow-visible"
        >
          <defs>
            <linearGradient id="beanBagGrad3D" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF0F5" />
              <stop offset="100%" stopColor="#FFE4E6" />
            </linearGradient>
            <filter id="softGlowShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="12" stdDeviation="16" floodColor="#FF005C" floodOpacity="0.1" />
            </filter>
          </defs>

          {/* DOTTED PINK ORBITAL RING WITH ROTATION */}
          <g className="animate-orbit-spin">
            <ellipse
              cx="350"
              cy="260"
              rx="230"
              ry="205"
              stroke="#FF005C"
              strokeWidth="1.8"
              strokeDasharray="7 7"
              fill="none"
              opacity="0.4"
            />

            {/* ORBIT SATELLITE NODES */}
            <g filter="url(#softGlowShadow)">
              <circle cx="350" cy="55" r="7" fill="#FF005C" />
              <circle cx="350" cy="55" r="12" stroke="#FF005C" strokeWidth="1.5" opacity="0.4" />

              <circle cx="120" cy="260" r="7" fill="#FF005C" />
              <circle cx="120" cy="260" r="12" stroke="#FF005C" strokeWidth="1.5" opacity="0.4" />

              <circle cx="350" cy="465" r="7" fill="#FF005C" />
              <circle cx="350" cy="465" r="12" stroke="#FF005C" strokeWidth="1.5" opacity="0.4" />

              <circle cx="580" cy="260" r="7" fill="#FF005C" />
              <circle cx="580" cy="260" r="12" stroke="#FF005C" strokeWidth="1.5" opacity="0.4" />
            </g>
          </g>

          {/* INNER ORBIT GUIDE */}
          <ellipse
            cx="350"
            cy="260"
            rx="160"
            ry="140"
            stroke="#FF005C"
            strokeWidth="1"
            strokeDasharray="4 8"
            fill="none"
            opacity="0.2"
          />

          {/* PLANT POT ON FLOOR */}
          <g transform="translate(170, 315)">
            <path d="M15 50L25 90H45L55 50H15Z" fill="#FFD1DC" stroke="#F472B6" strokeWidth="1.5" />
            <path d="M35 15C15 25 10 45 35 50C60 50 55 25 35 15Z" fill="#F472B6" />
            <path d="M25 30C10 32 5 45 25 50Z" fill="#FB7185" />
            <path d="M45 25C60 28 65 42 45 50Z" fill="#F43F5E" />
          </g>

          {/* BEAN BAG CHAIR */}
          <g filter="url(#softGlowShadow)">
            <path
              d="M230 370 C 210 270, 280 200, 350 230 C 420 250, 460 340, 430 410 C 390 450, 250 450, 230 370 Z"
              fill="url(#beanBagGrad3D)"
              stroke="#FECDD3"
              strokeWidth="2.5"
            />
            <path d="M280 350 Q 350 400 410 370" stroke="#FDA4AF" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </g>

          {/* STUDENT CHARACTER SITTING IN BEAN BAG CHAIR */}
          <path d="M290 355 L350 380 L380 345" stroke="#1E293B" strokeWidth="36" strokeLinecap="round" strokeLinejoin="round" />
          <ellipse cx="385" cy="345" rx="16" ry="10" fill="white" stroke="#CBD5E1" strokeWidth="2" />
          <path d="M380 342L390 348" stroke="#FF005C" strokeWidth="2" />

          {/* Vibrant Pink Hoodie */}
          <path d="M290 210 C290 175, 320 160, 350 160 C380 160, 400 175, 400 210 V340 H290 V210 Z" fill="#FF005C" />
          <path d="M335 160 L350 210 L365 160 H335 Z" fill="#FFF0F5" />

          {/* Student Head & Hair */}
          <circle cx="350" cy="140" r="30" fill="#FDBA74" />
          <path d="M318 130 C318 95, 338 80, 358 80 C378 80, 390 98, 385 130 C372 112, 355 112, 345 112 C332 112, 322 116, 318 130 Z" fill="#0F172A" />
          <circle cx="340" cy="136" r="4" fill="#0F172A" />
          <circle cx="360" cy="136" r="4" fill="#0F172A" />
          <path d="M342 148 C342 155, 358 155, 358 148 Z" fill="#0F172A" />

          {/* Arms holding Laptop on lap */}
          <path d="M300 230 L265 295 L350 300" stroke="#FF005C" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" />

          {/* LAPTOP */}
          <path d="M250 290 L290 245 L340 290 Z" fill="#334155" />
          <rect x="245" y="285" width="95" height="44" rx="5" fill="#64748B" stroke="#475569" strokeWidth="1.5" />
          <rect x="255" y="292" width="75" height="30" rx="3" fill="#0F172A" />
          <path d="M292 300L298 314H290L288 308H282L280 314H274L284 300H292Z" fill="#FF005C" />
        </svg>
      </div>

      {/* ========================================================================= */}
      {/* FOREGROUND LAYER: 4 CONTINUOUSLY FLOATING VOUCHER CARDS (Parallax: 18px) */}
      {/* ========================================================================= */}
      <div
        className="absolute inset-0 pointer-events-none transition-transform duration-300 ease-out"
        style={{
          transform: `translate3d(${mouseOffset.x * 18}px, ${mouseOffset.y * 18}px, 0)`,
        }}
      >
        {/* CARD 1: PTE Academic VOUCHER - SAVE ₹3,101 */}
        <div className="absolute top-2 left-0 sm:-left-2 z-30 pointer-events-auto animate-float-pte hero-floating-card-wrapper cursor-pointer">
          <div className="hero-floating-card-inner bg-white/95 dark:bg-[#161616]/95 backdrop-blur-md p-3 sm:p-3.5 px-4 rounded-2xl border border-slate-200/90 dark:border-[#292929] shadow-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#005A9C] to-[#003B66] text-white font-black text-lg flex items-center justify-center shrink-0 shadow-md">
              P
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-black text-slate-900 dark:text-white leading-tight">PTE Academic</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">VOUCHER</span>
              <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#0284C7] text-white font-black text-[10px] shadow-sm">
                SAVE ₹3,101
              </span>
            </div>
          </div>
        </div>

        {/* CARD 2: IELTS Test VOUCHER - SAVE ₹2,751 */}
        <div className="absolute top-4 right-0 sm:-right-2 z-30 pointer-events-auto animate-float-ielts hero-floating-card-wrapper cursor-pointer">
          <div className="hero-floating-card-inner bg-white/95 dark:bg-[#161616]/95 backdrop-blur-md p-3 sm:p-3.5 px-4 rounded-2xl border border-slate-200/90 dark:border-[#292929] shadow-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF0F5] dark:bg-[#2A0A17] text-[#FF005C] border border-[#FF005C]/30 font-black text-lg flex items-center justify-center shrink-0 shadow-md">
              I
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-black text-slate-900 dark:text-white leading-tight">IELTS Test</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">VOUCHER</span>
              <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#FF005C] text-white font-black text-[10px] shadow-sm">
                SAVE ₹2,751
              </span>
            </div>
          </div>
        </div>

        {/* CARD 3: TOEFL iBT VOUCHER - SAVE ₹2,401 */}
        <div className="absolute bottom-14 left-1 sm:-left-3 z-30 pointer-events-auto animate-float-toefl hero-floating-card-wrapper cursor-pointer">
          <div className="hero-floating-card-inner bg-white/95 dark:bg-[#161616]/95 backdrop-blur-md p-3 sm:p-3.5 px-4 rounded-2xl border border-slate-200/90 dark:border-[#292929] shadow-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#F59E0B] to-[#D97706] text-white font-black text-lg flex items-center justify-center shrink-0 shadow-md">
              T
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-black text-slate-900 dark:text-white leading-tight">TOEFL iBT</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">VOUCHER</span>
              <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#F59E0B] text-white font-black text-[10px] shadow-sm">
                SAVE ₹2,401
              </span>
            </div>
          </div>
        </div>

        {/* CARD 4: Duolingo Test VOUCHER - SAVE ₹1,901 */}
        <div className="absolute bottom-10 right-1 sm:-right-3 z-30 pointer-events-auto animate-float-duolingo hero-floating-card-wrapper cursor-pointer">
          <div className="hero-floating-card-inner bg-white/95 dark:bg-[#161616]/95 backdrop-blur-md p-3 sm:p-3.5 px-4 rounded-2xl border border-slate-200/90 dark:border-[#292929] shadow-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#58CC02] to-[#10B981] text-white font-black text-xl flex items-center justify-center shrink-0 shadow-md">
              🦉
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-black text-slate-900 dark:text-white leading-tight">Duolingo Test</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">VOUCHER</span>
              <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#10B981] text-white font-black text-[10px] shadow-sm">
                SAVE ₹1,901
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
