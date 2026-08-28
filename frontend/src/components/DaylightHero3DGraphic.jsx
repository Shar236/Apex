import React, { useState, useRef } from 'react';
import { imageUrl, cldSrcSet } from '../lib/imageUrl.js';

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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[440px] h-[440px] rounded-full bg-linear-to-tr from-[#FF005C]/15 via-rose-200/20 to-purple-200/10 blur-3xl" />
      </div>

      {/* ========================================================================= */}
      {/* DOTTED ORBITAL RING & CENTRAL 3D STUDENT HERO ILLUSTRATION (Parallax: 10px) */}
      {/* ========================================================================= */}
      <div
        className="relative w-full h-full flex items-center justify-center transition-transform duration-300 ease-out"
        style={{
          transform: `translate3d(${mouseOffset.x * 10}px, ${mouseOffset.y * 10}px, 0)`,
        }}
      >
        {/* DOTTED PINK ORBITAL RING & FLIGHT TRAJECTORY */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg
            viewBox="0 0 700 520"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-sm overflow-visible"
          >
            <defs>
              <filter id="softGlowShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="#FF005C" floodOpacity="0.15" />
              </filter>
            </defs>

            {/* Dotted Pink Orbit Path */}
            <ellipse
              cx="350"
              cy="255"
              rx="235"
              ry="200"
              stroke="#FF005C"
              strokeWidth="1.8"
              strokeDasharray="6 8"
              fill="none"
              opacity="0.35"
            />

            {/* Satellite Orbital Nodes */}
            <g filter="url(#softGlowShadow)">
              <circle cx="130" cy="220" r="5" fill="#FF005C" />
              <circle cx="570" cy="220" r="5" fill="#FF005C" />
              <circle cx="450" cy="65" r="5" fill="#FF005C" />
              <circle cx="650" cy="380" r="5" fill="#FF005C" />
            </g>

            {/* Flight Plane ✈ Along Orbital Path */}
            <g transform="translate(250, 155) rotate(-28)">
              <path
                d="M16 2L19 12L29 14L19 17L16 28L13 17L3 14L13 12L16 2Z"
                fill="#6C3CE0"
                opacity="0.85"
              />
            </g>
          </svg>
        </div>

        {/* Central 3D Student Character Image */}
        <div className="relative z-10 flex items-center justify-center">
          <img
            src={imageUrl('/apex_hero_student_3d.png', { width: 800 })}
            srcSet={cldSrcSet('/apex_hero_student_3d.png', [400, 600, 800]) || undefined}
            sizes="(max-width: 768px) 370px, 400px"
            alt="Apex Vouchers Student with Laptop"
            width={400}
            height={400}
            loading="eager"
            fetchPriority="high"
            className="w-[320px] sm:w-[370px] md:w-[400px] max-w-full h-auto object-contain drop-shadow-[0_20px_35px_rgba(255,0,92,0.12)] select-none pointer-events-none"
          />
        </div>
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
            <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-[#005A9C] to-[#003B66] text-white font-black text-lg flex items-center justify-center shrink-0 shadow-md">
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
            <div className="w-10 h-10 rounded-2xl bg-[#FFF0F5] dark:bg-[#2A0A17] text-brand-pink border border-brand-pink/30 font-black text-lg flex items-center justify-center shrink-0 shadow-md">
              I
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-black text-slate-900 dark:text-white leading-tight">IELTS Test</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">VOUCHER</span>
              <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full bg-brand-pink text-white font-black text-[10px] shadow-sm">
                SAVE ₹2,751
              </span>
            </div>
          </div>
        </div>

        {/* CARD 3: TOEFL iBT VOUCHER - SAVE ₹2,401 */}
        <div className="absolute bottom-14 left-1 sm:-left-3 z-30 pointer-events-auto animate-float-toefl hero-floating-card-wrapper cursor-pointer">
          <div className="hero-floating-card-inner bg-white/95 dark:bg-[#161616]/95 backdrop-blur-md p-3 sm:p-3.5 px-4 rounded-2xl border border-slate-200/90 dark:border-[#292929] shadow-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-[#F59E0B] to-[#D97706] text-white font-black text-lg flex items-center justify-center shrink-0 shadow-md">
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
            <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-[#58CC02] to-[#10B981] text-white font-black text-xl flex items-center justify-center shrink-0 shadow-md">
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
