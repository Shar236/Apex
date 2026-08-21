import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useVoucher } from '../context/VoucherContext';
import { ArrowRight, GraduationCap, Globe2, ShieldCheck, HeadphonesIcon, CalendarClock, Users, Building2 } from 'lucide-react';
import { PearsonOfficialLogo } from './OfficialBrandLogos';

const EXAM_CARDS = [
  {
    examType: 'PTE Academic',
    slug: 'pte-academic',
    badge: 'MOST BOOKED',
    icon: GraduationCap,
    tint: '#005A9C',
    desc: 'For study visas & university admissions worldwide. We help you find the right test centre and date.',
  },
  {
    examType: 'PTE Core',
    slug: 'pte-core',
    badge: 'CANADA PR',
    icon: ShieldCheck,
    tint: '#FF005C',
    desc: 'IRCC-approved test for Canada Express Entry & PR pathways. Get assistance booking your preferred slot.',
  },
  {
    examType: 'PTE Academic UKVI',
    slug: 'pte-ukvi',
    badge: 'UK VISA (SELT)',
    icon: Building2,
    tint: '#6C3CE0',
    desc: 'For UK visa & immigration applications. Our team helps coordinate your official booking request.',
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
    <section id="pte-booking-assistance" className="py-16 sm:py-24 bg-[#FAFAFA] dark:bg-[#0D0D0D] border-b border-slate-200/80 dark:border-[#292929] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-pink bg-[#FFF0F5] dark:bg-[#2A0A17] px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-[#292929]">
              NEED HELP BOOKING PTE?
            </span>
            <PearsonOfficialLogo className="h-4" />
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-[#0F172A] dark:text-white tracking-tight mt-1">
            PTE Exam <span className="text-pink-highlight">Booking Assistance</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 font-medium text-base mt-3">
            Not sure how to book your PTE slot? Tell us your preferred exam, city and date — our team will personally
            help you get it scheduled. This is booking assistance, not an automated Pearson booking service.
          </p>
        </div>

        {/* 3 Exam Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {EXAM_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.examType}
                className="relative rounded-3xl p-6 bg-white dark:bg-[#161616] border border-slate-200/80 dark:border-[#292929] hover:border-brand-pink hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full text-white shadow-sm"
                    style={{ backgroundColor: card.tint }}
                  >
                    {card.badge}
                  </span>
                  <PearsonOfficialLogo className="h-3.5" />
                </div>

                <div
                  className="w-14 h-14 rounded-2xl mb-4 border flex items-center justify-center"
                  style={{ backgroundColor: `${card.tint}14`, borderColor: `${card.tint}33` }}
                >
                  <Icon className="w-7 h-7" style={{ color: card.tint }} strokeWidth={2} />
                </div>

                <div className="space-y-2 mb-6">
                  <h3 className="font-heading font-black text-xl leading-snug text-[#0F172A] dark:text-white">
                    {card.examType}
                  </h3>
                  <p className="text-xs font-medium leading-relaxed text-slate-500 dark:text-slate-400">
                    {card.desc}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleNavigateToExamBooking(card.slug)}
                  className="w-full btn-pink !py-3.5 !rounded-xl !text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <span>Get Booking Assistance</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Trust Highlights Strip */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 pt-6 border-t border-slate-200/80 dark:border-[#292929]">
          {HIGHLIGHTS.map((h, i) => {
            const Icon = h.icon;
            return (
              <div key={i} className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                <Icon className="w-4 h-4 text-brand-pink" strokeWidth={2.5} />
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
