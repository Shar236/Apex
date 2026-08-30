/** Ported from frontend/src/components/VectorIllustrations.jsx — only the vectors actually used on the current homepage (the express-delivery pair for RedemptionAndSecurity). */

export const ExpressCarDeliveryVector = ({ className = 'w-full h-auto' }: { className?: string }) => (
  <svg viewBox="0 0 600 350" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="carBodyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#FF005C" />
        <stop offset="100%" stopColor="#FF4D8D" />
      </linearGradient>
      <filter id="carShadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#FF005C" floodOpacity="0.25" />
      </filter>
    </defs>

    <path d="M-20 280 Q 200 240, 320 280 T 620 280" stroke="#334155" strokeWidth="48" strokeLinecap="round" fill="none" />
    <path d="M-20 280 Q 200 240, 320 280 T 620 280" stroke="#F8FAFC" strokeWidth="4" strokeDasharray="16 16" strokeLinecap="round" fill="none" opacity="0.6" />

    <path d="M80 230H200" stroke="#FF005C" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
    <path d="M120 245H220" stroke="#38BDF8" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
    <path d="M60 260H180" stroke="#FF005C" strokeWidth="3" strokeLinecap="round" opacity="0.5" />

    <g filter="url(#carShadow)">
      <path d="M210 220C210 200 230 180 260 170L310 135C335 120 380 120 410 135L455 170C485 175 500 195 500 220V235H210V220Z" fill="url(#carBodyGrad)" />
      <path d="M315 138H395L435 170H285L315 138Z" fill="#0F172A" opacity="0.85" />
      <path d="M320 142H355V166H292L320 142Z" fill="#38BDF8" opacity="0.8" />
      <path d="M365 142H390L425 166H365V142Z" fill="#38BDF8" opacity="0.8" />
      <polygon points="495,210 590,190 590,240 495,230" fill="#FEF08A" opacity="0.4" />
      <circle cx="495" cy="215" r="7" fill="#FEF08A" />
      <rect x="330" y="185" width="60" height="24" rx="6" fill="#FFFFFF" opacity="0.95" />
      <text x="338" y="201" fill="#FF005C" fontSize="10" fontWeight="900" fontFamily="sans-serif">APEX</text>
    </g>

    <g filter="url(#carShadow)">
      <rect x="300" y="62" width="165" height="52" rx="12" fill="#FFFFFF" stroke="#FF005C" strokeWidth="2.5" />
      <rect x="312" y="74" width="28" height="28" rx="8" fill="#10B981" />
      <path d="M320 88L325 93L333 84" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <text x="350" y="86" fill="#0F172A" fontSize="11" fontWeight="900" fontFamily="sans-serif">EXPRESS CODE</text>
      <text x="350" y="102" fill="#FF005C" fontSize="11" fontWeight="900" fontFamily="sans-serif">⚡ 10 SECONDS</text>
    </g>

    <g filter="url(#carShadow)">
      <rect x="25" y="62" width="215" height="52" rx="14" fill="#0F172A" stroke="#334155" strokeWidth="2" />
      <circle cx="53" cy="88" r="14" fill="#FF005C" />
      <path d="M53 80V88L59 91" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <text x="76" y="83" fill="#FFFFFF" fontSize="11" fontWeight="900" fontFamily="sans-serif">FASTER THAN OTP!</text>
      <text x="76" y="99" fill="#38BDF8" fontSize="10" fontWeight="700" fontFamily="sans-serif">Instant WhatsApp &amp; Email</text>
    </g>
  </svg>
);

export const DaylightExpressCarDeliveryVector = ({ className = 'w-full h-auto' }: { className?: string }) => (
  <svg viewBox="0 0 600 350" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="daylightCarSky" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#E0F2FE" />
        <stop offset="100%" stopColor="#F0F9FF" />
      </linearGradient>
      <linearGradient id="daylightCarBody" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#FF005C" />
        <stop offset="100%" stopColor="#FF3380" />
      </linearGradient>
      <filter id="daylightCarShadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#0284C7" floodOpacity="0.15" />
      </filter>
    </defs>

    <rect width="600" height="350" rx="24" fill="url(#daylightCarSky)" />
    <circle cx="100" cy="60" r="35" fill="#FEF08A" opacity="0.8" />

    <path d="M-20 280 Q 200 240, 320 280 T 620 280" stroke="#475569" strokeWidth="48" strokeLinecap="round" fill="none" />
    <path d="M-20 280 Q 200 240, 320 280 T 620 280" stroke="#FFFFFF" strokeWidth="4" strokeDasharray="16 16" strokeLinecap="round" fill="none" />

    <path d="M80 230H200" stroke="#FF005C" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
    <path d="M120 245H220" stroke="#0284C7" strokeWidth="4" strokeLinecap="round" opacity="0.7" />

    <g filter="url(#daylightCarShadow)">
      <path d="M210 220C210 200 230 180 260 170L310 135C335 120 380 120 410 135L455 170C485 175 500 195 500 220V235H210V220Z" fill="url(#daylightCarBody)" />
      <path d="M315 138H395L435 170H285L315 138Z" fill="#0F172A" />
      <path d="M320 142H355V166H292L320 142Z" fill="#BAE6FD" />
      <path d="M365 142H390L425 166H365V142Z" fill="#BAE6FD" />
      <rect x="330" y="185" width="60" height="24" rx="6" fill="#FFFFFF" />
      <text x="338" y="201" fill="#FF005C" fontSize="10" fontWeight="900" fontFamily="sans-serif">APEX</text>
    </g>

    <g filter="url(#daylightCarShadow)">
      <rect x="300" y="55" width="165" height="52" rx="14" fill="#FFFFFF" stroke="#FF005C" strokeWidth="2" />
      <rect x="312" y="67" width="28" height="28" rx="8" fill="#10B981" />
      <path d="M320 81L325 86L333 77" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <text x="350" y="79" fill="#0F172A" fontSize="11" fontWeight="900" fontFamily="sans-serif">EXPRESS CODE</text>
      <text x="350" y="95" fill="#FF005C" fontSize="11" fontWeight="900" fontFamily="sans-serif">⚡ 10 SECONDS</text>
    </g>

    <g filter="url(#daylightCarShadow)">
      <rect x="25" y="55" width="215" height="52" rx="14" fill="#FFFFFF" stroke="#BAE6FD" strokeWidth="2" />
      <circle cx="53" cy="81" r="14" fill="#FF005C" />
      <path d="M53 73V81L59 84" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <text x="76" y="76" fill="#0F172A" fontSize="11" fontWeight="900" fontFamily="sans-serif">FASTER THAN OTP!</text>
      <text x="76" y="92" fill="#0284C7" fontSize="10" fontWeight="800" fontFamily="sans-serif">Instant WhatsApp &amp; Email</text>
    </g>
  </svg>
);
