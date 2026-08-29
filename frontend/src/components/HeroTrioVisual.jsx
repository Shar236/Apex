import React, { useRef, useState, useEffect } from 'react';
import {
  LazyMotion, domAnimation, m,
  useReducedMotion, useMotionValue, useSpring, useTransform,
} from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import heroTrio from '../assets/hero/hero-trio.png';

/*
 * The single right-side hero visual. Replaces the old day/night graphic pair
 * with one theme-aware, Framer-Motion composition:
 *
 *   layer 0  ambient light + soft background blobs   (parallax ×0.35, slowest)
 *   layer 1  wireframe globe                          (parallax ×0.5, slow spin)
 *   layer 2  the trio cut-out                         (parallax ×1.0, gentle float)
 *   layer 3  floating voucher cards + specks          (parallax ×1.45, fastest)
 *
 * prefers-reduced-motion → a clean static render (no float, spin or parallax).
 */

const VOUCHER_CARDS = [
  { pos: 'top-1 left-0 sm:-left-3', delay: 0, tile: 'bg-linear-to-br from-[#005A9C] to-[#003B66] text-white', initial: 'P', name: 'PTE Academic', save: '₹3,101' },
  { pos: 'top-8 right-0 sm:-right-4', delay: 1.1, tile: 'bg-accent/12 text-accent border border-accent/30', initial: 'I', name: 'IELTS Test', save: '₹2,751' },
  { pos: 'bottom-20 left-0 sm:-left-4', delay: 0.6, tile: 'bg-linear-to-br from-[#F59E0B] to-[#D97706] text-white', initial: 'T', name: 'TOEFL iBT', save: '₹2,401' },
  { pos: 'bottom-12 right-0 sm:-right-3', delay: 1.6, tile: 'bg-linear-to-br from-[#58CC02] to-[#10B981] text-white', initial: '🦉', name: 'Duolingo Test', save: '₹1,901' },
];

const FloatingVoucherCard = ({ pos, tile, initial, name, save, delay, reduced }) => (
  <m.div
    className={`absolute ${pos} z-30 pointer-events-auto cursor-pointer`}
    animate={reduced ? undefined : { y: [0, -9, 0] }}
    transition={reduced ? undefined : { duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay }}
    whileHover={reduced ? undefined : { scale: 1.06, y: -6 }}
  >
    <div className="bg-surface/95 backdrop-blur-md p-3 sm:p-3.5 px-4 rounded-2xl border border-line shadow-xl dark:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.7)] flex items-center gap-3">
      <div className={`w-10 h-10 rounded-2xl ${tile} font-medium text-lg flex items-center justify-center shrink-0 shadow-md`}>
        {initial}
      </div>
      <div className="flex flex-col text-left">
        <span className="text-xs font-medium text-ink leading-tight">{name}</span>
        <span className="text-[10px] font-normal text-ink-muted uppercase tracking-wider">VOUCHER</span>
        <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full bg-success text-white font-medium text-[10px] shadow-sm">
          SAVE {save}
        </span>
      </div>
    </div>
  </m.div>
);

/** Wireframe globe — sits behind the trio to add depth + a sense of "study abroad". */
const WireGlobe = ({ isDark }) => {
  const stroke = isDark ? '#FF6AA0' : '#FF005C';
  const faint = isDark ? 0.16 : 0.14;
  const strong = isDark ? 0.4 : 0.3;
  return (
    <svg viewBox="0 0 400 400" fill="none" className="w-full h-full overflow-visible" aria-hidden="true">
      <defs>
        <radialGradient id="globeCore" cx="42%" cy="38%" r="62%">
          <stop offset="0%" stopColor={isDark ? '#241019' : '#FFE6EF'} stopOpacity={isDark ? 0.55 : 0.7} />
          <stop offset="60%" stopColor={isDark ? '#15121A' : '#F4EEFF'} stopOpacity={isDark ? 0.35 : 0.45} />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="200" cy="200" r="150" fill="url(#globeCore)" />
      <circle cx="200" cy="200" r="150" stroke={stroke} strokeWidth="1.4" opacity={strong} />
      {/* longitudes */}
      {[150, 112, 66, 0].map((rx, i) => (
        <ellipse key={`lo${i}`} cx="200" cy="200" rx={rx || 1} ry="150" stroke={stroke} strokeWidth="1" opacity={faint} />
      ))}
      {/* latitudes */}
      {[-96, -50, 0, 50, 96].map((dy, i) => (
        <ellipse key={`la${i}`} cx="200" cy={200 + dy} rx={Math.sqrt(Math.max(0, 150 * 150 - dy * dy))} ry="26" stroke={stroke} strokeWidth="1" opacity={faint} />
      ))}
      {/* orbit + nodes */}
      <ellipse cx="200" cy="200" rx="188" ry="150" stroke={stroke} strokeWidth="1.4" strokeDasharray="5 8" opacity={strong} />
      {[[24, 150], [376, 150], [286, 40], [300, 372]].map(([cx, cy], i) => (
        <circle key={`n${i}`} cx={cx} cy={cy} r="4.5" fill={stroke} opacity={strong + 0.25} />
      ))}
    </svg>
  );
};

export const HeroTrioVisual = () => {
  const { isDark } = useTheme();
  const prefersReduced = useReducedMotion();
  const containerRef = useRef(null);
  const [pointerFine, setPointerFine] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(pointer: fine)');
    const update = () => setPointerFine(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);

  const parallaxOn = !prefersReduced && pointerFine;

  // Pointer position, normalised to roughly -0.5..0.5, spring-smoothed.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 60, damping: 18, mass: 0.6 });
  const sy = useSpring(py, { stiffness: 60, damping: 18, mass: 0.6 });

  const bgX = useTransform(sx, (v) => v * 14);
  const bgY = useTransform(sy, (v) => v * 14);
  const globeX = useTransform(sx, (v) => v * 20);
  const globeY = useTransform(sy, (v) => v * 20);
  const trioX = useTransform(sx, (v) => v * 40);
  const trioY = useTransform(sy, (v) => v * 40);
  const cardsX = useTransform(sx, (v) => v * 58);
  const cardsY = useTransform(sy, (v) => v * 58);

  const handlePointerMove = (e) => {
    if (!parallaxOn || !containerRef.current) return;
    const r = containerRef.current.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };
  const resetPointer = () => {
    px.set(0);
    py.set(0);
  };

  const entrance = prefersReduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.4 } }
    : {
        initial: { opacity: 0, y: 26, scale: 0.96 },
        animate: { opacity: 1, y: 0, scale: 1 },
        transition: { type: 'spring', stiffness: 55, damping: 16, mass: 1 },
      };

  return (
   <LazyMotion features={domAnimation} strict>
    <m.div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
      className="relative w-full max-w-[520px] h-[420px] sm:h-[500px] lg:h-[520px] mx-auto flex items-end justify-center select-none [perspective:1200px]"
      {...entrance}
      whileHover={parallaxOn ? { scale: 1.015 } : undefined}
    >
      {/* layer 0 — ambient light + background blobs */}
      <m.div className="absolute inset-0 pointer-events-none" style={parallaxOn ? { x: bgX, y: bgY } : undefined}>
        <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl ${isDark ? 'w-[115%] h-[115%] bg-[radial-gradient(circle,rgba(255,0,92,0.22),rgba(93,63,211,0.12)_45%,transparent_72%)]' : 'w-[105%] h-[105%] bg-[radial-gradient(circle,rgba(255,0,92,0.14),transparent_68%)]'}`} />
        <div className="absolute right-[8%] top-[14%] w-32 h-40 sm:w-40 sm:h-52 rounded-[2.5rem] rotate-6 bg-[#F5B301]/22 dark:bg-[#F5B301]/14 blur-[2px]" />
        <div className="absolute left-[6%] bottom-[10%] w-40 h-48 sm:w-52 sm:h-60 rounded-[3rem] -rotate-3 bg-accent/12 dark:bg-[#5D3FD3]/22 blur-[2px]" />
      </m.div>

      {/* layer 1 — wireframe globe, slow spin */}
      <m.div
        className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 w-[92%] h-[92%] pointer-events-none"
        style={parallaxOn ? { x: globeX, y: globeY } : undefined}
      >
        <m.div
          className="w-full h-full"
          animate={prefersReduced ? undefined : { rotate: 360 }}
          transition={prefersReduced ? undefined : { duration: 140, repeat: Infinity, ease: 'linear' }}
        >
          <WireGlobe isDark={isDark} />
        </m.div>
      </m.div>

      {/* layer 2 — the trio, gentle continuous float */}
      <m.div
        className="relative z-20 h-full flex items-end justify-center [transform-style:preserve-3d]"
        style={parallaxOn ? { x: trioX, y: trioY } : undefined}
      >
        <m.img
          src={heroTrio}
          alt="Students who saved on their exam fees with Apex Vouchers"
          width={520}
          height={560}
          loading="eager"
          fetchPriority="high"
          draggable={false}
          className="h-[92%] w-auto max-w-full object-contain object-bottom drop-shadow-[0_28px_45px_rgba(15,20,35,0.22)] dark:drop-shadow-[0_30px_55px_rgba(0,0,0,0.65)]"
          animate={prefersReduced ? undefined : { y: [0, -14, 0] }}
          transition={prefersReduced ? undefined : { duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* contact shadow under the group */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[62%] h-6 rounded-[100%] bg-black/25 dark:bg-black/50 blur-xl" />
      </m.div>

      {/* layer 3 — floating voucher cards + specks */}
      <m.div
        className="absolute inset-0 z-30 pointer-events-none"
        style={parallaxOn ? { x: cardsX, y: cardsY } : undefined}
      >
        {VOUCHER_CARDS.map((c) => (
          <div key={c.name} className="pointer-events-auto">
            <FloatingVoucherCard {...c} reduced={prefersReduced} />
          </div>
        ))}
        {!prefersReduced && (
          <>
            <m.span
              className="absolute top-[30%] left-[18%] w-2 h-2 rounded-full bg-accent/70"
              animate={{ y: [0, -10, 0], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <m.span
              className="absolute bottom-[34%] right-[22%] w-1.5 h-1.5 rounded-full bg-[#5D3FD3]/70 dark:bg-[#8B78FF]/80"
              animate={{ y: [0, 12, 0], opacity: [0.3, 0.9, 0.3] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            />
          </>
        )}
      </m.div>
    </m.div>
   </LazyMotion>
  );
};

export default HeroTrioVisual;
