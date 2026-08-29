import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useVoucher } from '../context/VoucherContext';
import { ArrowRight, GraduationCap, ShieldCheck, HeadphonesIcon, CalendarClock, Users, Building2 } from 'lucide-react';
import { PearsonOfficialLogo } from './OfficialBrandLogos';
import { imageUrl, cldSrcSet } from '../lib/imageUrl.js';
import { Button, Badge, SectionHeading } from './ui';

const EXAM_CARDS = [
  {
    examType: 'PTE Academic',
    slug: 'pte-academic',
    badge: 'Most Booked',
    icon: GraduationCap,
    desc: 'For study visas & university admissions worldwide. We help you find the right test centre and date.',
    illustration: '/pte-academic-illustration.jpg',
    illustrationAlt: 'Student studying at desk with books, laptop and coffee cup',
  },
  {
    examType: 'PTE Core',
    slug: 'pte-core',
    badge: 'Canada PR',
    icon: ShieldCheck,
    desc: 'IRCC-approved test for Canada Express Entry & PR pathways. Get assistance booking your preferred slot.',
    illustration: '/pte-core-illustration.jpg',
    illustrationAlt: 'Relaxed student sitting in armchair using laptop with plant nearby',
  },
  {
    examType: 'PTE Academic UKVI',
    slug: 'pte-ukvi',
    badge: 'UK Visa (SELT)',
    icon: Building2,
    desc: 'For UK visa & immigration applications. Our team helps coordinate your official booking request.',
    illustration: '/pte-ukvi-illustration.jpg',
    illustrationAlt: 'Student at laptop with email, stars and confirmation document floating around',
  },
];

const HIGHLIGHTS = [
  { icon: CalendarClock, text: 'We help you find available dates & centres' },
  { icon: Users, text: 'Real support team, not an automated booking bot' },
  { icon: HeadphonesIcon, text: 'Follow-up by email, WhatsApp & phone' },
];

export const PTEBookingAssistance = () => {
  const { setActiveTab } = useVoucher();
  const navigate = useNavigate();

  const handleNavigateToExamBooking = (slug) => {
    setActiveTab('exam-booking');
    navigate(`/exam-booking?exam=${slug}`);
  };

  return (
    <section
      id="pte-booking-assistance"
      className="py-16 sm:py-24 bg-[var(--color-surface-raised)] border-b border-[var(--color-line)] transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Section Header ── */}
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--color-accent)]">
              Need Help Booking PTE?
            </span>
            <span className="text-[#000048] dark:text-white">
              <PearsonOfficialLogo className="h-4" inverted={false} />
            </span>
          </div>
          <SectionHeading
            className="mb-12"
            title="PTE Exam Booking Assistance"
            subtitle="Not sure how to book your PTE slot? Tell us your preferred exam, city and date — our team will personally help you get it scheduled. This is booking assistance, not an automated Pearson booking service."
          />
        </div>

        {/* ── 3 Exam Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 items-stretch">
          {EXAM_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.slug}
                className="flex flex-col p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-line)] shadow-sm hover:border-[var(--color-accent)]/40 hover:-translate-y-1 transition-all duration-300"
              >
                {/* ── Badge + Pearson row ── */}
                <div className="flex items-center justify-between mb-3">
                  <Badge tone="accent">{card.badge}</Badge>
                  <span className="text-[#000048] dark:text-white">
                    <PearsonOfficialLogo className="h-3.5" inverted={false} />
                  </span>
                </div>

                {/* ── Illustration ── */}
                <div className="w-full h-[178px] sm:h-[178px] rounded-xl overflow-hidden bg-[var(--color-surface-sunken)] shrink-0 mb-3.5">
                  <img
                    src={imageUrl(card.illustration, { width: 600 })}
                    srcSet={cldSrcSet(card.illustration, [300, 480, 600]) || undefined}
                    sizes="(max-width: 640px) 90vw, 380px"
                    alt={card.illustrationAlt}
                    width={1200}
                    height={896}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover object-top"
                  />
                </div>

                {/* ── Icon ── */}
                <div className="w-12 h-12 rounded-2xl mb-3 border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/[0.08] text-[var(--color-accent)] flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6" strokeWidth={2} />
                </div>

                {/* ── Text ── */}
                <div className="space-y-1.5 mb-5 flex-1">
                  <h3 className="font-heading font-medium text-xl leading-snug text-[var(--color-ink)]">
                    {card.examType}
                  </h3>
                  <p className="text-xs font-normal leading-relaxed text-[var(--color-ink-muted)]">
                    {card.desc}
                  </p>
                </div>

                {/* ── CTA button ── */}
                <Button
                  onClick={() => handleNavigateToExamBooking(card.slug)}
                  variant="primary"
                  size="md"
                  fullWidth
                  className="mt-auto rounded-xl!"
                >
                  <span>Get Booking Assistance</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            );
          })}
        </div>

        {/* ── Trust Highlights Strip ── */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 pt-6 border-t border-[var(--color-line)]">
          {HIGHLIGHTS.map((h, i) => {
            const Icon = h.icon;
            return (
              <div key={i} className="flex items-center gap-2 text-xs font-normal text-[var(--color-ink-muted)]">
                <Icon className="w-4 h-4 text-[var(--color-accent)]" strokeWidth={2} />
                <span>{h.text}</span>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default PTEBookingAssistance;
