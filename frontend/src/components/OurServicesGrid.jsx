import React from 'react';
import { Ticket, Landmark, CalendarCheck, Calculator, GraduationCap, BookOpen, ArrowRight, CheckCircle2, Zap } from 'lucide-react';
import { useVoucher } from '../context/VoucherContext';
import { AssistedBookingVector, MockTestPracticeVector, EducationLoanVector } from './VectorIllustrations';

export const OurServicesGrid = () => {
  const { setActiveTab } = useVoucher();

  const services = [
    {
      badge: 'POPULAR & INSTANT',
      title: 'Discounted Exam Vouchers',
      subtitle: 'PTE, GRE, TOEFL & Duolingo',
      desc: 'Official exam codes delivered directly to your Email & WhatsApp in 10 seconds flat. Up to 11 months validity.',
      highlights: ['Delivered faster than your OTP', '100% Genuine Partner Codes', 'WhatsApp Confirmation'],
      cta: 'Buy Voucher',
      actionTab: 'shop',
      vector: (
        <div className="bg-[#FFF0F5] dark:bg-[#2A0A17] p-4 rounded-2xl border border-brand-pink/20 flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-brand-pink text-white flex items-center justify-center font-black text-lg">
            ⚡
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black uppercase text-brand-pink bg-white dark:bg-[#161616] px-2.5 py-1 rounded-full border border-brand-pink/30 shadow-sm">
              INSTANT DIGITAL
            </span>
          </div>
        </div>
      )
    },
    {
      badge: 'CONCIERGE DESK',
      title: 'Assisted Exam Booking',
      subtitle: '100% Free Slot Booking',
      desc: 'You relax. We panic on your behalf! Our team books your test center, date, and slot end-to-end at zero fee.',
      highlights: ['Zero Booking Fee', 'Preferred Slot Lock', 'Free Reschedule Blueprint'],
      cta: 'Book Exam Now',
      actionTab: 'how-it-works',
      vector: <AssistedBookingVector className="w-full h-32 mb-4" />
    },
    {
      badge: 'SCORE BOOST',
      title: 'Official Mock Tests',
      subtitle: 'Real Test Simulation',
      desc: 'Practice from bed, sofa, or panic-desk! Scored mock tests with AI score breakdown matching official rubric.',
      highlights: ['Instant AI Score Report', 'Scored Speaking & Writing', 'Real Exam UI Interface'],
      cta: 'Start Practice',
      actionTab: 'shop',
      vector: <MockTestPracticeVector className="w-full h-32 mb-4" />
    },
    {
      badge: 'FINANCIAL AID',
      title: 'Education Loan Support',
      subtitle: 'Lowest Interest Rates',
      desc: 'Direct tie-ups with top nationalized banks & NBFCs to fund your study abroad tuition and living expenses.',
      highlights: ['Lowest Interest Rates', 'Pre-Visa Disbursement', 'Fast Track Approval'],
      cta: 'Calculate Loan',
      actionTab: 'calculator',
      vector: <EducationLoanVector className="w-full h-32 mb-4" />
    },
    {
      badge: 'FREE TOOLS',
      title: 'Score Converter & Calculators',
      subtitle: 'PTE to IELTS Converter',
      desc: 'Calculate band equivalencies, Canada PR points, and convert PTE score 90 scale directly to IELTS 9 bands.',
      highlights: ['PTE to IELTS Score Matrix', 'Canada PR Point Calculator', 'CRS Score Blueprint'],
      cta: 'Use Tool Free',
      actionTab: 'calculator',
      vector: (
        <div className="bg-slate-100 dark:bg-[#1A1A1A] p-4 rounded-2xl border border-slate-200 dark:border-[#2A2A2A] flex items-center justify-between mb-4">
          <div className="text-left">
            <span className="text-[10px] font-black uppercase text-slate-500 block">CONVERTER</span>
            <span className="font-heading font-black text-lg text-[#0F172A] dark:text-white">PTE 79+ = IELTS 8.0</span>
          </div>
          <span className="text-xl">🧮</span>
        </div>
      )
    },
    {
      badge: 'STUDENT GUIDE',
      title: 'University Admission Advice',
      subtitle: 'Abroad Study Blueprints',
      desc: 'Comprehensive student diaries, exam syllabi, global university cutoffs, and visa documentation templates.',
      highlights: ['Top University Cutoffs', 'SOP & LOR Guidelines', 'Visa Prep Checklists'],
      cta: 'Explore Guides',
      actionTab: 'exam-guides',
      vector: (
        <div className="bg-slate-100 dark:bg-[#1A1A1A] p-4 rounded-2xl border border-slate-200 dark:border-[#2A2A2A] flex items-center justify-between mb-4">
          <div className="text-left">
            <span className="text-[10px] font-black uppercase text-slate-500 block">STUDENT DIARY</span>
            <span className="font-heading font-black text-lg text-[#0F172A] dark:text-white">100+ Free Study Guides</span>
          </div>
          <span className="text-xl">📚</span>
        </div>
      )
    }
  ];

  return (
    <section className="py-16 sm:py-24 bg-slate-50/80 dark:bg-[#0A0A0A] border-b border-slate-200/80 dark:border-[#292929] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-extrabold uppercase tracking-widest text-brand-pink bg-[#FFF0F5] dark:bg-[#2A0A17] px-3.5 py-1.5 rounded-full border border-brand-pink/20">
            STUDENT-FRIENDLY SERVICES
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-[#0F172A] dark:text-white tracking-tight mt-3">
            Everything You Need to <span className="text-pink-highlight">Ace Your Exam.</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 font-medium text-base mt-3">
            Sleek service packages designed for students. From discount vouchers to free concierge booking.
          </p>
        </div>

        {/* Service Cards Grid (Sleek Rounded 3D Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, idx) => (
            <div
              key={idx}
              onClick={() => setActiveTab(service.actionTab)}
              className="group relative bg-white dark:bg-[#161616] rounded-3xl p-7 border border-slate-200/80 dark:border-[#292929] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
            >
              <div>
                {/* Top Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black uppercase tracking-wider text-brand-pink bg-[#FFF0F5] dark:bg-[#2A0A17] px-3 py-1 rounded-full border border-brand-pink/20">
                    {service.badge}
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    Apex Exclusive
                  </span>
                </div>

                {/* Vector / Visual Header */}
                {service.vector}

                {/* Title & Subtitle */}
                <div className="space-y-1 mb-3">
                  <h3 className="font-heading font-black text-xl text-[#0F172A] dark:text-white leading-snug group-hover:text-brand-pink transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                    {service.subtitle}
                  </p>
                </div>

                <p className="text-slate-600 dark:text-slate-400 text-xs font-medium leading-relaxed mb-5">
                  {service.desc}
                </p>

                {/* Feature Checklists */}
                <div className="space-y-2 mb-6 pt-3 border-t border-slate-100 dark:border-[#292929]">
                  {service.highlights.map((hl, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" strokeWidth={3} />
                      <span>{hl}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive CTA Button */}
              <div className="pt-4 border-t border-slate-100 dark:border-[#292929] flex items-center justify-between">
                <span className="font-heading font-extrabold text-xs text-[#0F172A] dark:text-white group-hover:text-brand-pink transition-colors">
                  {service.cta}
                </span>
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-[#262626] text-slate-900 dark:text-white group-hover:bg-brand-pink group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
