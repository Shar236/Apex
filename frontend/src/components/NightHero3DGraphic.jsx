import React, { useState, useRef } from 'react';
import { imageUrl, cldSrcSet } from '../lib/imageUrl.js';

const FloatingVoucherCard = ({ position, animation, tile, initial, name, save }) => (
  <div className={`absolute ${position} z-30 pointer-events-auto ${animation} hero-floating-card-wrapper cursor-pointer`}>
    <div className="hero-floating-card-inner bg-[var(--color-surface-raised)]/95 backdrop-blur-md p-3 sm:p-3.5 px-4 rounded-2xl border border-[var(--color-line)] shadow-2xl flex items-center gap-3">
      <div className={`w-10 h-10 rounded-2xl ${tile} font-medium text-lg flex items-center justify-center shrink-0 shadow-md`}>
        {initial}
      </div>
      <div className="flex flex-col text-left">
        <span className="text-xs font-medium text-[var(--color-ink)] leading-tight">{name}</span>
        <span className="text-[10px] font-normal text-[var(--color-ink-muted)] uppercase tracking-wider">VOUCHER</span>
        <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full bg-[var(--color-success)] text-white font-medium text-[10px] shadow-sm">
          SAVE {save}
        </span>
      </div>
    </div>
  </div>
);

export const NightHero3DGraphic = () => {
  const containerRef = useRef(null);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMouseOffset({ x, y });
  };

  const handleMouseLeave = () => {
    setMouseOffset({ x: 0, y: 0 });
  };

  const cards = [
    { position: 'top-2 left-0 sm:-left-2', animation: 'animate-float-pte', tile: 'bg-linear-to-br from-[#005A9C] to-[#003B66] text-white', initial: 'P', name: 'PTE Academic', save: '₹3,101' },
    { position: 'top-4 right-0 sm:-right-2', animation: 'animate-float-ielts', tile: 'bg-[var(--color-accent)]/15 text-[var(--color-accent)] border border-[var(--color-accent)]/30', initial: 'I', name: 'IELTS Test', save: '₹2,751' },
    { position: 'bottom-14 left-1 sm:-left-3', animation: 'animate-float-toefl', tile: 'bg-linear-to-br from-[#F59E0B] to-[#D97706] text-white', initial: 'T', name: 'TOEFL iBT', save: '₹2,401' },
    { position: 'bottom-10 right-1 sm:-right-3', animation: 'animate-float-duolingo', tile: 'bg-linear-to-br from-[#58CC02] to-[#10B981] text-white', initial: '🦉', name: 'Duolingo Test', save: '₹1,901' },
  ];

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-[620px] h-[480px] sm:h-[520px] mx-auto flex items-center justify-center select-none overflow-visible"
    >
      {/* Background Glow Layer */}
      <div
        className="absolute inset-0 transition-transform duration-300 ease-out pointer-events-none"
        style={{
          transform: `translate3d(${mouseOffset.x * 6}px, ${mouseOffset.y * 6}px, 0)`,
        }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[460px] h-[460px] rounded-full bg-linear-to-tr from-[var(--color-accent)]/20 via-[var(--color-accent)]/5 to-transparent blur-3xl" />
      </div>

      {/* Central Night Vector Illustration with 3D Character */}
      <div
        className="relative w-full h-full flex items-center justify-center transition-transform duration-300 ease-out"
        style={{
          transform: `translate3d(${mouseOffset.x * 10}px, ${mouseOffset.y * 10}px, 0)`,
        }}
      >
        {/* Dark Radial Glow & Orbit Path */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg
            viewBox="0 0 700 520"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-2xl overflow-visible"
          >
            <defs>
              <radialGradient id="nightCircleGlowSlim" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#151922" stopOpacity="0.85" />
                <stop offset="70%" stopColor="#0E1016" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#0B0D12" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* DARK CIRCULAR BACKGROUND */}
            <circle cx="350" cy="255" r="210" fill="url(#nightCircleGlowSlim)" />

            {/* DOTTED ORBIT RING */}
            <ellipse
              cx="350"
              cy="255"
              rx="235"
              ry="200"
              stroke="#FF005C"
              strokeWidth="1.5"
              strokeDasharray="6 8"
              fill="none"
              opacity="0.4"
            />

            {/* Satellite nodes */}
            <circle cx="130" cy="220" r="5" fill="#FF005C" opacity="0.8" />
            <circle cx="570" cy="220" r="5" fill="#FF005C" opacity="0.8" />
            <circle cx="450" cy="65" r="5" fill="#FF005C" opacity="0.8" />
            <circle cx="650" cy="380" r="5" fill="#FF005C" opacity="0.8" />

            {/* Flight Plane Icon */}
            <g transform="translate(250, 155) rotate(-28)">
              <path
                d="M16 2L19 12L29 14L19 17L16 28L13 17L3 14L13 12L16 2Z"
                fill="#FF005C"
                opacity="0.9"
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
            className="w-[320px] sm:w-[370px] md:w-[400px] max-w-full h-auto object-contain drop-shadow-[0_20px_35px_rgba(255,0,92,0.2)] select-none pointer-events-none"
          />
        </div>
      </div>

      {/* Floating Voucher Cards Layer */}
      <div
        className="absolute inset-0 pointer-events-none transition-transform duration-300 ease-out"
        style={{
          transform: `translate3d(${mouseOffset.x * 18}px, ${mouseOffset.y * 18}px, 0)`,
        }}
      >
        {cards.map((c) => (
          <FloatingVoucherCard key={c.name} {...c} />
        ))}
      </div>
    </div>
  );
};
