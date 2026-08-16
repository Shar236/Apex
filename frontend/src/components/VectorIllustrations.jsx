import React from 'react';

// Student Hero Vector Illustration (Night / Dark Mode Theme)
export const StudentHeroVector = ({ className = "w-full h-auto" }) => (
  <svg viewBox="0 0 600 500" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="heroBgGlow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FF005C" stopOpacity="0.15" />
        <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.05" />
      </linearGradient>
      <linearGradient id="pinkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FF005C" />
        <stop offset="100%" stopColor="#D9004C" />
      </linearGradient>
      <linearGradient id="navyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0F172A" />
        <stop offset="100%" stopColor="#1E293B" />
      </linearGradient>
      <linearGradient id="deskGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#E2E8F0" />
        <stop offset="100%" stopColor="#F1F5F9" />
      </linearGradient>
    </defs>

    {/* Soft Curved Background Blob */}
    <path d="M480 250C480 370 380 440 260 440C140 440 60 370 60 250C60 130 150 60 270 60C390 60 480 130 480 250Z" fill="url(#heroBgGlow)" />

    {/* Study Desk & Laptop Base */}
    <rect x="70" y="380" width="460" height="14" rx="7" fill="url(#deskGrad)" />
    <path d="M120 380L135 440H145L130 380H120Z" fill="#CBD5E1" />
    <path d="M480 380L465 440H455L470 380H480Z" fill="#CBD5E1" />

    {/* Student Chair */}
    <rect x="230" y="300" width="80" height="90" rx="12" fill="#334155" />
    <rect x="262" y="390" width="16" height="50" fill="#64748B" />

    {/* Sitting Student Character */}
    <path d="M250 360V420H270V360H250Z" fill="#1E293B" />
    <path d="M280 360V420H300V360H280Z" fill="#1E293B" />

    {/* Hoodie (Vibrant Brand Color) */}
    <path d="M225 240C225 220 245 200 275 200C305 200 325 220 325 240V340H225V240Z" fill="url(#pinkGrad)" />
    <path d="M255 200L275 230L295 200H255Z" fill="#FFF0F5" opacity="0.9" />

    {/* Arms */}
    <path d="M225 240L190 310L230 325L255 260Z" fill="#E11D48" />
    <path d="M325 240L360 310L320 325L295 260Z" fill="#E11D48" />

    {/* Student Head */}
    <circle cx="275" cy="160" r="32" fill="#FDBA74" />
    <path d="M245 150C245 125 260 115 275 115C295 115 310 130 305 155C295 145 285 145 275 145C265 145 255 148 245 150Z" fill="#0F172A" />

    {/* Laptop */}
    <path d="M320 310L360 310L380 360H300L320 310Z" fill="url(#navyGrad)" />
    <rect x="330" y="270" width="90" height="55" rx="6" fill="#0F172A" stroke="#38BDF8" strokeWidth="2" />
    <rect x="340" y="280" width="70" height="35" rx="4" fill="#1E293B" />
    <text x="375" y="302" fill="#FF005C" fontSize="10" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">APEX PTE</text>
  </svg>
);

// Daylight (Light Mode) Student Hero Vector Illustration matching new reference image
export const DaylightStudentHeroVector = ({ className = "w-full h-auto" }) => (
  <svg viewBox="0 0 720 500" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="beanBagGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFF0F5" />
        <stop offset="100%" stopColor="#FFE4E6" />
      </linearGradient>
      <filter id="cardShadowSoftNew" x="-10%" y="-10%" width="125%" height="125%">
        <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#0F172A" floodOpacity="0.06" />
      </filter>
    </defs>

    {/* PINK DOTTED ORBITAL RING */}
    <ellipse cx="440" cy="250" rx="190" ry="190" stroke="#FF005C" strokeWidth="1.5" strokeDasharray="5 5" fill="none" opacity="0.35" />

    {/* Pink Satellite Orbital Node Dots */}
    <circle cx="440" cy="60" r="4.5" fill="#FF005C" />
    <circle cx="250" cy="250" r="4.5" fill="#FF005C" />
    <circle cx="440" cy="440" r="4.5" fill="#FF005C" />
    <circle cx="630" cy="250" r="4.5" fill="#FF005C" />

    {/* Plant Pot on Floor Beside Bean Bag Chair */}
    <rect x="255" y="380" width="20" height="25" rx="4" fill="#FFD1DC" />
    <path d="M265 355C255 365 250 380 265 380C280 380 275 365 265 355Z" fill="#F472B6" />
    <path d="M255 368C245 372 245 380 255 380Z" fill="#FB7185" />

    {/* SOFT PINK BEAN BAG CHAIR */}
    <path d="M310 350 C 300 270, 360 210, 430 240 C 490 260, 520 330, 490 390 C 450 430, 330 430, 310 350 Z" fill="url(#beanBagGrad)" stroke="#FECDD3" strokeWidth="2" />
    {/* Bean Bag Crease Line */}
    <path d="M360 330 Q 420 380 470 350" stroke="#FDA4AF" strokeWidth="2" strokeLinecap="round" fill="none" />

    {/* STUDENT CHARACTER SITTING IN BEAN BAG CHAIR */}
    {/* Legs crossed in bean bag */}
    <path d="M370 340 L430 360 L450 330" stroke="#1E293B" strokeWidth="32" strokeLinecap="round" strokeLinejoin="round" />
    {/* White Sneakers */}
    <ellipse cx="455" cy="330" rx="14" ry="9" fill="white" stroke="#CBD5E1" strokeWidth="1.5" />

    {/* Torso / Pink Hoodie */}
    <path d="M370 200 C370 170, 395 155, 425 155 C455 155, 475 170, 475 200 V320 H370 V200 Z" fill="#FF005C" />
    <path d="M410 155 L425 200 L440 155 H410 Z" fill="#FFF0F5" />

    {/* Student Head & Hair */}
    <circle cx="425" cy="140" r="28" fill="#FDBA74" />
    <path d="M395 130 C395 100, 412 85, 430 85 C450 85, 460 102, 455 130 C445 115, 430 115, 420 115 C410 115, 400 118, 395 130 Z" fill="#0F172A" />
    <circle cx="415" cy="135" r="3" fill="#0F172A" />
    <circle cx="433" cy="135" r="3" fill="#0F172A" />
    <path d="M417 148 C417 154, 431 154, 431 148 Z" fill="#0F172A" />

    {/* Arms holding Laptop on lap */}
    <path d="M380 220 L350 280 L430 285" stroke="#FF005C" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" />

    {/* LAPTOP */}
    <path d="M340 275 L380 235 L420 275 Z" fill="#475569" />
    <rect x="335" y="270" width="85" height="40" rx="4" fill="#94A3B8" />

    {/* FLOATING EXAM VOUCHER CARDS matching exact reference image */}

    {/* CARD 1 (Top Left): PTE Academic VOUCHER + SAVE ₹3,101 */}
    <g filter="url(#cardShadowSoftNew)">
      <rect x="25" y="45" width="205" height="85" rx="18" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
      <circle cx="58" cy="87" r="18" fill="#005A9C" />
      <text x="58" y="94" fill="white" fontSize="18" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">P</text>
      <text x="88" y="75" fill="#0F172A" fontSize="11" fontWeight="900" fontFamily="sans-serif">PTE Academic</text>
      <text x="88" y="90" fill="#94A3B8" fontSize="9" fontWeight="800" fontFamily="sans-serif">VOUCHER</text>
      <rect x="88" y="99" width="90" height="20" rx="10" fill="#0284C7" />
      <text x="133" y="113" fill="white" fontSize="9" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">SAVE ₹3,101</text>
    </g>

    {/* CARD 2 (Top Right): IELTS Test VOUCHER + SAVE ₹2,751 */}
    <g filter="url(#cardShadowSoftNew)">
      <rect x="495" y="45" width="195" height="85" rx="18" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
      <circle cx="528" cy="87" r="18" fill="#FFF0F5" />
      <text x="528" y="94" fill="#FF005C" fontSize="18" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">I</text>
      <text x="558" y="75" fill="#0F172A" fontSize="11" fontWeight="900" fontFamily="sans-serif">IELTS Test</text>
      <text x="558" y="90" fill="#94A3B8" fontSize="9" fontWeight="800" fontFamily="sans-serif">VOUCHER</text>
      <rect x="558" y="99" width="90" height="20" rx="10" fill="#FF005C" />
      <text x="603" y="113" fill="white" fontSize="9" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">SAVE ₹2,751</text>
    </g>

    {/* CARD 3 (Middle Right): TOEFL iBT VOUCHER + SAVE ₹2,401 */}
    <g filter="url(#cardShadowSoftNew)">
      <rect x="515" y="180" width="195" height="85" rx="18" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
      <rect x="532" y="200" width="32" height="32" rx="10" fill="#F59E0B" />
      <text x="548" y="222" fill="white" fontSize="17" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">T</text>
      <text x="576" y="210" fill="#0F172A" fontSize="11" fontWeight="900" fontFamily="sans-serif">TOEFL iBT</text>
      <text x="576" y="225" fill="#94A3B8" fontSize="9" fontWeight="800" fontFamily="sans-serif">VOUCHER</text>
      <rect x="576" y="234" width="90" height="20" rx="10" fill="#F59E0B" />
      <text x="621" y="248" fill="white" fontSize="9" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">SAVE ₹2,401</text>
    </g>

    {/* CARD 4 (Bottom Right): Duolingo Test VOUCHER + SAVE ₹1,901 */}
    <g filter="url(#cardShadowSoftNew)">
      <rect x="495" y="315" width="195" height="85" rx="18" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
      <circle cx="528" cy="357" r="18" fill="#58CC02" />
      <text x="528" y="363" fill="white" fontSize="16" textAnchor="middle">🦉</text>
      <text x="558" y="345" fill="#0F172A" fontSize="11" fontWeight="900" fontFamily="sans-serif">Duolingo Test</text>
      <text x="558" y="360" fill="#94A3B8" fontSize="9" fontWeight="800" fontFamily="sans-serif">VOUCHER</text>
      <rect x="558" y="369" width="90" height="20" rx="10" fill="#10B981" />
      <text x="603" y="383" fill="white" fontSize="9" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">SAVE ₹1,901</text>
    </g>
  </svg>
);

// Express Delivery Transport Vector Graphic (Night Theme - Clean High-Contrast Badges)
export const ExpressCarDeliveryVector = ({ className = "w-full h-auto" }) => (
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

    {/* Winding Road Graphic */}
    <path d="M-20 280 Q 200 240, 320 280 T 620 280" stroke="#334155" strokeWidth="48" strokeLinecap="round" fill="none" />
    <path d="M-20 280 Q 200 240, 320 280 T 620 280" stroke="#F8FAFC" strokeWidth="4" strokeDasharray="16 16" strokeLinecap="round" fill="none" opacity="0.6" />

    {/* Car Speed Trails */}
    <path d="M80 230H200" stroke="#FF005C" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
    <path d="M120 245H220" stroke="#38BDF8" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
    <path d="M60 260H180" stroke="#FF005C" strokeWidth="3" strokeLinecap="round" opacity="0.5" />

    {/* Main Express Delivery Car Body */}
    <g filter="url(#carShadow)">
      <path d="M210 220C210 200 230 180 260 170L310 135C335 120 380 120 410 135L455 170C485 175 500 195 500 220V235H210V220Z" fill="url(#carBodyGrad)" />
      
      {/* Car Roof & Windows */}
      <path d="M315 138H395L435 170H285L315 138Z" fill="#0F172A" opacity="0.85" />
      <path d="M320 142H355V166H292L320 142Z" fill="#38BDF8" opacity="0.8" />
      <path d="M365 142H390L425 166H365V142Z" fill="#38BDF8" opacity="0.8" />

      {/* Headlight Beam */}
      <polygon points="495,210 590,190 590,240 495,230" fill="#FEF08A" opacity="0.4" />
      <circle cx="495" cy="215" r="7" fill="#FEF08A" />

      {/* Apex Logo / Branding on Car Door */}
      <rect x="330" y="185" width="60" height="24" rx="6" fill="#FFFFFF" opacity="0.95" />
      <text x="338" y="201" fill="#FF005C" fontSize="10" fontWeight="900" fontFamily="sans-serif">APEX</text>
    </g>

    {/* Express Delivery Voucher Package on Top of Car - CLEAN CRISP PADDING & CONTRAST */}
    <g filter="url(#carShadow)">
      <rect x="300" y="62" width="165" height="52" rx="12" fill="#FFFFFF" stroke="#FF005C" strokeWidth="2.5" />
      <rect x="312" y="74" width="28" height="28" rx="8" fill="#10B981" />
      <path d="M320 88L325 93L333 84" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <text x="350" y="86" fill="#0F172A" fontSize="11" fontWeight="900" fontFamily="sans-serif">EXPRESS CODE</text>
      <text x="350" y="102" fill="#FF005C" fontSize="11" fontWeight="900" fontFamily="sans-serif">⚡ 10 SECONDS</text>
    </g>

    {/* Speed Indicator Badge - CLEAN CRISP PADDING & CONTRAST */}
    <g filter="url(#carShadow)">
      <rect x="25" y="62" width="215" height="52" rx="14" fill="#0F172A" stroke="#334155" strokeWidth="2" />
      <circle cx="53" cy="88" r="14" fill="#FF005C" />
      <path d="M53 80V88L59 91" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <text x="76" y="83" fill="#FFFFFF" fontSize="11" fontWeight="900" fontFamily="sans-serif">FASTER THAN OTP!</text>
      <text x="76" y="99" fill="#38BDF8" fontSize="10" fontWeight="700" fontFamily="sans-serif">Instant WhatsApp & Email</text>
    </g>
  </svg>
);

// Daylight (Light Mode) Express Delivery Transport Vector Graphic (Sunny Day Scene)
export const DaylightExpressCarDeliveryVector = ({ className = "w-full h-auto" }) => (
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

    {/* Sunlit Backdrop */}
    <rect width="600" height="350" rx="24" fill="url(#daylightCarSky)" />
    <circle cx="100" cy="60" r="35" fill="#FEF08A" opacity="0.8" />

    {/* Sunlit Road Graphic */}
    <path d="M-20 280 Q 200 240, 320 280 T 620 280" stroke="#475569" strokeWidth="48" strokeLinecap="round" fill="none" />
    <path d="M-20 280 Q 200 240, 320 280 T 620 280" stroke="#FFFFFF" strokeWidth="4" strokeDasharray="16 16" strokeLinecap="round" fill="none" />

    {/* Speed Lines */}
    <path d="M80 230H200" stroke="#FF005C" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
    <path d="M120 245H220" stroke="#0284C7" strokeWidth="4" strokeLinecap="round" opacity="0.7" />

    {/* Main Daylight Delivery Car */}
    <g filter="url(#daylightCarShadow)">
      <path d="M210 220C210 200 230 180 260 170L310 135C335 120 380 120 410 135L455 170C485 175 500 195 500 220V235H210V220Z" fill="url(#daylightCarBody)" />
      <path d="M315 138H395L435 170H285L315 138Z" fill="#0F172A" />
      <path d="M320 142H355V166H292L320 142Z" fill="#BAE6FD" />
      <path d="M365 142H390L425 166H365V142Z" fill="#BAE6FD" />
      <rect x="330" y="185" width="60" height="24" rx="6" fill="#FFFFFF" />
      <text x="338" y="201" fill="#FF005C" fontSize="10" fontWeight="900" fontFamily="sans-serif">APEX</text>
    </g>

    {/* Daylight Express Code Badge (Right) */}
    <g filter="url(#daylightCarShadow)">
      <rect x="300" y="55" width="165" height="52" rx="14" fill="#FFFFFF" stroke="#FF005C" strokeWidth="2" />
      <rect x="312" y="67" width="28" height="28" rx="8" fill="#10B981" />
      <path d="M320 81L325 86L333 77" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <text x="350" y="79" fill="#0F172A" fontSize="11" fontWeight="900" fontFamily="sans-serif">EXPRESS CODE</text>
      <text x="350" y="95" fill="#FF005C" fontSize="11" fontWeight="900" fontFamily="sans-serif">⚡ 10 SECONDS</text>
    </g>

    {/* Daylight Faster Than OTP Badge (Left) */}
    <g filter="url(#daylightCarShadow)">
      <rect x="25" y="55" width="215" height="52" rx="14" fill="#FFFFFF" stroke="#BAE6FD" strokeWidth="2" />
      <circle cx="53" cy="81" r="14" fill="#FF005C" />
      <path d="M53 73V81L59 84" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <text x="76" y="76" fill="#0F172A" fontSize="11" fontWeight="900" fontFamily="sans-serif">FASTER THAN OTP!</text>
      <text x="76" y="92" fill="#0284C7" fontSize="10" fontWeight="800" fontFamily="sans-serif">Instant WhatsApp & Email</text>
    </g>
  </svg>
);

// Assisted Booking Vector Illustration
export const AssistedBookingVector = ({ className = "w-full h-auto" }) => (
  <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="40" y="40" width="320" height="220" rx="24" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="2" />

    {/* Calendar Sheet */}
    <rect x="70" y="70" width="120" height="130" rx="14" fill="white" stroke="#CBD5E1" strokeWidth="2" />
    <path d="M70 70H190V100H70V70Z" fill="#FF005C" />
    <circle cx="100" cy="85" r="4" fill="white" />
    <circle cx="160" cy="85" r="4" fill="white" />
    <rect x="85" y="115" width="16" height="16" rx="4" fill="#EFF6FF" />
    <rect x="110" y="115" width="16" height="16" rx="4" fill="#EFF6FF" />
    <rect x="135" y="115" width="16" height="16" rx="4" fill="#10B981" />
    <rect x="160" y="115" width="16" height="16" rx="4" fill="#EFF6FF" />
    <rect x="85" y="140" width="16" height="16" rx="4" fill="#EFF6FF" />
    <rect x="110" y="140" width="16" height="16" rx="4" fill="#FF005C" />
    <rect x="135" y="140" width="16" height="16" rx="4" fill="#EFF6FF" />

    {/* Concierge Character Hand & Checkmark */}
    <circle cx="270" cy="135" r="45" fill="#FFF0F5" />
    <path d="M250 135L263 148L290 120" stroke="#FF005C" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />

    <text x="210" y="215" fill="#0F172A" fontSize="13" fontWeight="900" fontFamily="sans-serif">Concierge Booking</text>
    <text x="210" y="233" fill="#64748B" fontSize="10" fontWeight="700" fontFamily="sans-serif">We book your exam slot 100% free</text>
  </svg>
);

// Mock Test Practice Vector Illustration
export const MockTestPracticeVector = ({ className = "w-full h-auto" }) => (
  <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="30" y="40" width="340" height="220" rx="24" fill="#0F172A" />

    {/* Screen Display */}
    <rect x="50" y="60" width="300" height="160" rx="12" fill="#1E293B" stroke="#334155" strokeWidth="2" />

    {/* Score Gauge */}
    <path d="M140 160 A40 40 0 0 1 260 160" stroke="#38BDF8" strokeWidth="12" strokeLinecap="round" fill="none" />
    <path d="M140 160 A40 40 0 0 1 240 130" stroke="#FF005C" strokeWidth="12" strokeLinecap="round" fill="none" />

    <text x="200" y="155" fill="white" fontSize="22" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">79+</text>
    <text x="200" y="175" fill="#94A3B8" fontSize="9" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">TARGET SCORE</text>

    {/* Bed/Sofa Relax Icon Pill */}
    <rect x="80" y="235" width="240" height="35" rx="10" fill="#FF005C" />
    <text x="200" y="257" fill="white" fontSize="11" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">Practice from bed, sofa, or desk!</text>
  </svg>
);

// Education Loan Vector Illustration
export const EducationLoanVector = ({ className = "w-full h-auto" }) => (
  <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="40" y="40" width="320" height="220" rx="24" fill="#ECFDF5" stroke="#A7F3D0" strokeWidth="2" />

    {/* Graduation Cap */}
    <polygon points="200,60 270,95 200,130 130,95" fill="#0F172A" />
    <rect x="165" y="110" width="70" height="30" rx="4" fill="#0F172A" />
    <path d="M260 100V140" stroke="#F59E0B" strokeWidth="3" />
    <circle cx="260" cy="144" r="5" fill="#F59E0B" />

    {/* Bank Approval Stamp */}
    <circle cx="200" cy="180" r="36" fill="#10B981" />
    <path d="M185 180L195 190L215 170" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    <text x="200" y="240" fill="#065F46" fontSize="12" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">Lowest Interest Rate Loans</text>
  </svg>
);
