import React from 'react';
import { Ticket, Landmark, CalendarCheck, Calculator, GraduationCap, BookOpen, ArrowUpRight } from 'lucide-react';
import { useVoucher } from '../context/VoucherContext';

export const OurServicesGrid = () => {
  const { setActiveTab } = useVoucher();

  const services = [
    {
      icon: Ticket,
      title: 'Discounted Exam Vouchers',
      desc: 'Official vouchers for PTE, GRE, TOEFL, Duolingo, and IELTS at the lowest prices in India.',
      actionTab: 'shop'
    },
    {
      icon: Landmark,
      title: 'Education Loan Assistance',
      desc: 'We connect you with banks offering the lowest interest rates to fund your study abroad journey.',
      actionTab: 'calculator'
    },
    {
      icon: CalendarCheck,
      title: 'Assisted Exam Booking',
      desc: 'We book your PTE Academic and Core exam end to end. Connect with us for instant assistance.',
      actionTab: 'how-it-works'
    },
    {
      icon: Calculator,
      title: 'Score Calculators & Tools',
      desc: 'Free tools to check band scores, convert PTE to IELTS, and plan your target score.',
      actionTab: 'calculator'
    },
    {
      icon: GraduationCap,
      title: 'Admission Support',
      desc: 'Guidance on top global universities, course eligibility, and visa applications.',
      actionTab: 'exam-guides'
    },
    {
      icon: BookOpen,
      title: 'Student Diary & Guides',
      desc: 'Comprehensive guides on PTE, GRE, TOEFL, IELTS, and admissions for abroad study.',
      actionTab: 'exam-guides'
    }
  ];

  return (
    <section className="py-16 sm:py-20 bg-slate-50/60 border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600 bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-100">
            End-To-End Student Ecosystem
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
            Our Services
          </h2>
          <p className="text-slate-500 font-medium text-sm sm:text-base mt-2">
            Everything you need for your exam prep, booking, loans, and international university admissions.
          </p>
        </div>

        {/* 6 Cards Grid (Matching EduVouchers reference) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, idx) => {
            const IconComp = service.icon;
            return (
              <div
                key={idx}
                onClick={() => setActiveTab(service.actionTab)}
                className="group relative bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <IconComp className="w-6 h-6" strokeWidth={2.2} />
                    </div>
                    <div className="w-9 h-9 rounded-full bg-slate-50 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-700 flex items-center justify-center transition-colors">
                      <ArrowUpRight className="w-5 h-5" strokeWidth={2.5} />
                    </div>
                  </div>

                  <h3 className="font-heading font-extrabold text-xl text-slate-900 leading-snug mb-2 group-hover:text-blue-600 transition-colors">
                    {service.title}
                  </h3>

                  <p className="text-slate-500 text-sm font-medium leading-relaxed">
                    {service.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Explore service →</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
