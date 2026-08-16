import React from 'react';

export const DaylightHero3DGraphic = () => {
  return (
    <div className="relative w-full max-w-[560px] h-[440px] sm:h-[480px] mx-auto flex items-center justify-center perspective-1000 select-none">
      
      {/* ========================================================================= */}
      {/* 3D BACKGROUND LAYER: SVG DOTTED ORBITAL RING & BEAN BAG STUDENT ARTWORK */}
      {/* ========================================================================= */}
      <svg
        viewBox="0 0 700 520"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-xl"
      >
        <defs>
          <linearGradient id="beanBagGrad3D" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF0F5" />
            <stop offset="100%" stopColor="#FFE4E6" />
          </linearGradient>
          <filter id="softGlowShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="12" stdDeviation="16" floodColor="#FF005C" floodOpacity="0.08" />
          </filter>
        </defs>

        {/* DOTTED PINK ORBITAL RING */}
        <ellipse
          cx="360"
          cy="260"
          rx="220"
          ry="200"
          stroke="#FF005C"
          strokeWidth="1.5"
          strokeDasharray="6 6"
          fill="none"
          opacity="0.35"
        />

        {/* PINK SATELLITE ORBITAL NODE DOTS WITH SOFT GLOW */}
        <g filter="url(#softGlowShadow)">
          <circle cx="360" cy="60" r="7" fill="#FF005C" />
          <circle cx="360" cy="60" r="11" stroke="#FF005C" strokeWidth="1.5" opacity="0.4" />

          <circle cx="140" cy="260" r="7" fill="#FF005C" />
          <circle cx="140" cy="260" r="11" stroke="#FF005C" strokeWidth="1.5" opacity="0.4" />

          <circle cx="360" cy="460" r="7" fill="#FF005C" />
          <circle cx="360" cy="460" r="11" stroke="#FF005C" strokeWidth="1.5" opacity="0.4" />

          <circle cx="580" cy="260" r="7" fill="#FF005C" />
          <circle cx="580" cy="260" r="11" stroke="#FF005C" strokeWidth="1.5" opacity="0.4" />
        </g>

        {/* PLANT POT ON FLOOR BESIDE BEAN BAG CHAIR */}
        <g transform="translate(180, 310)">
          <path d="M15 50L25 90H45L55 50H15Z" fill="#FFD1DC" stroke="#F472B6" strokeWidth="1.5" />
          <path d="M35 15C15 25 10 45 35 50C60 50 55 25 35 15Z" fill="#F472B6" />
          <path d="M25 30C10 32 5 45 25 50Z" fill="#FB7185" />
          <path d="M45 25C60 28 65 42 45 50Z" fill="#F43F5E" />
        </g>

        {/* SOFT PINK BEAN BAG CHAIR */}
        <g filter="url(#softGlowShadow)">
          <path
            d="M240 370 C 220 270, 290 200, 360 230 C 430 250, 470 340, 440 410 C 400 450, 260 450, 240 370 Z"
            fill="url(#beanBagGrad3D)"
            stroke="#FECDD3"
            strokeWidth="2.5"
          />
          {/* Bean Bag Seam Line */}
          <path d="M290 350 Q 360 400 420 370" stroke="#FDA4AF" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </g>

        {/* STUDENT CHARACTER SITTING IN BEAN BAG CHAIR */}
        {/* Legs crossed in bean bag */}
        <path d="M300 355 L360 380 L390 345" stroke="#1E293B" strokeWidth="36" strokeLinecap="round" strokeLinejoin="round" />
        {/* White Sneakers with Pink Laces */}
        <ellipse cx="395" cy="345" rx="16" ry="10" fill="white" stroke="#CBD5E1" strokeWidth="2" />
        <path d="M390 342L400 348" stroke="#FF005C" strokeWidth="2" />

        {/* Student Torso / Vibrant Pink Hoodie */}
        <path d="M300 210 C300 175, 330 160, 360 160 C390 160, 410 175, 410 210 V340 H300 V210 Z" fill="#FF005C" />
        <path d="M345 160 L360 210 L375 160 H345 Z" fill="#FFF0F5" />

        {/* Student Head & Hair */}
        <circle cx="360" cy="140" r="30" fill="#FDBA74" />
        {/* Modern Dark Haircut */}
        <path d="M328 130 C328 95, 348 80, 368 80 C388 80, 400 98, 395 130 C382 112, 365 112, 355 112 C342 112, 332 116, 328 130 Z" fill="#0F172A" />
        {/* Eye Glasses / Facial Detail */}
        <circle cx="350" cy="136" r="4" fill="#0F172A" />
        <circle cx="370" cy="136" r="4" fill="#0F172A" />
        <path d="M352 148 C352 155, 368 155, 368 148 Z" fill="#0F172A" />

        {/* Arms holding Laptop on lap */}
        <path d="M310 230 L275 295 L360 300" stroke="#FF005C" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" />

        {/* LAPTOP */}
        <path d="M260 290 L300 245 L350 290 Z" fill="#334155" />
        <rect x="255" y="285" width="95" height="44" rx="5" fill="#64748B" stroke="#475569" strokeWidth="1.5" />
        <rect x="265" y="292" width="75" height="30" rx="3" fill="#0F172A" />
        <path d="M302 300L308 314H300L298 308H292L290 314H284L294 300H302Z" fill="#FF005C" />
      </svg>

      {/* ========================================================================= */}
      {/* FOREGROUND 3D LAYER: 4 FLOATING INTERACTIVE HTML/CSS VOUCHER CARDS */}
      {/* ========================================================================= */}
      
      {/* CARD 1 (Top Left): PTE Academic VOUCHER + SAVE ₹3,101 */}
      <div className="absolute top-2 left-0 sm:-left-4 z-20 hover:-translate-y-2 hover:scale-105 transition-all duration-300 group cursor-pointer">
        <div className="bg-white/95 backdrop-blur-md p-3 px-4 rounded-2xl border border-slate-200/90 shadow-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#005A9C] text-white font-black text-lg flex items-center justify-center shrink-0 shadow-md group-hover:rotate-6 transition-transform">
            P
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-black text-slate-900 leading-tight">PTE Academic</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">VOUCHER</span>
            <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#0284C7] text-white font-black text-[10px] shadow-sm">
              SAVE ₹3,101
            </span>
          </div>
        </div>
      </div>

      {/* CARD 2 (Top Right): IELTS Test VOUCHER + SAVE ₹2,751 */}
      <div className="absolute top-4 right-0 sm:-right-4 z-20 hover:-translate-y-2 hover:scale-105 transition-all duration-300 group cursor-pointer">
        <div className="bg-white/95 backdrop-blur-md p-3 px-4 rounded-2xl border border-slate-200/90 shadow-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#FFF0F5] text-[#FF005C] border border-[#FF005C]/20 font-black text-lg flex items-center justify-center shrink-0 shadow-md group-hover:-rotate-6 transition-transform">
            I
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-black text-slate-900 leading-tight">IELTS Test</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">VOUCHER</span>
            <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#FF005C] text-white font-black text-[10px] shadow-sm">
              SAVE ₹2,751
            </span>
          </div>
        </div>
      </div>

      {/* CARD 3 (Middle Right): TOEFL iBT VOUCHER + SAVE ₹2,401 */}
      <div className="absolute top-1/2 -translate-y-1/2 right-1 sm:-right-6 z-20 hover:-translate-y-2 hover:scale-105 transition-all duration-300 group cursor-pointer">
        <div className="bg-white/95 backdrop-blur-md p-3 px-4 rounded-2xl border border-slate-200/90 shadow-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F59E0B] text-white font-black text-lg flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-transform">
            T
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-black text-slate-900 leading-tight">TOEFL iBT</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">VOUCHER</span>
            <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#F59E0B] text-white font-black text-[10px] shadow-sm">
              SAVE ₹2,401
            </span>
          </div>
        </div>
      </div>

      {/* CARD 4 (Bottom Right): Duolingo Test VOUCHER + SAVE ₹1,901 */}
      <div className="absolute bottom-6 right-2 sm:right-0 z-20 hover:-translate-y-2 hover:scale-105 transition-all duration-300 group cursor-pointer">
        <div className="bg-white/95 backdrop-blur-md p-3 px-4 rounded-2xl border border-slate-200/90 shadow-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#58CC02] text-white font-black text-xl flex items-center justify-center shrink-0 shadow-md group-hover:rotate-12 transition-transform">
            🦉
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-black text-slate-900 leading-tight">Duolingo Test</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">VOUCHER</span>
            <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#10B981] text-white font-black text-[10px] shadow-sm">
              SAVE ₹1,901
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
