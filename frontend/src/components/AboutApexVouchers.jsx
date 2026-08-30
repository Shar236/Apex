import React from 'react';
import { ShieldCheck, Award, ArrowRight } from 'lucide-react';
import { useVoucher } from '../context/VoucherContext';
import { Button } from './ui';

export const AboutApexVouchers = () => {
  const { setActiveTab } = useVoucher();

  const genuineStats = [
    { number: '40,589+', label: 'Happy Candidates', desc: 'Students across India saving on test fees' },
    { number: '40,500+', label: 'Vouchers Delivered', desc: '100% genuine codes issued in under 10 seconds' },
    { number: '6+', label: 'Exam Categories', desc: 'PTE Academic, PTE Core, GRE, TOEFL, IELTS & Duolingo' },
    { number: '24/7', label: 'Student Support Desk', desc: 'Real human assistance for booking & dates' },
  ];

  return (
    <section className="py-16 sm:py-24 bg-surface-raised border-b border-line transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">

          {/* Left Column: Story */}
          <div className="lg:col-span-6 space-y-6">
            <span className="inline-flex text-[11px] font-medium uppercase tracking-[0.14em] text-accent">
              Our Mission & Story
            </span>

            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-light text-ink tracking-tight">
              Empowering Students to <br />
              <span className="text-accent">Test Smarter & Save More</span>
            </h2>

            <p className="text-ink-muted font-normal text-base leading-relaxed">
              Apex Vouchers was founded with a single mission: to make international study abroad language testing affordable for every student. Standard exam fees can be a major financial burden for candidates preparing for universities abroad.
            </p>

            <p className="text-ink-muted font-normal text-sm leading-relaxed">
              By partnering with authorized institutional channels and buying bulk exam vouchers directly, we pass maximum savings back to candidates without any compromise on validity or support.
            </p>

            <div className="pt-2 flex flex-wrap gap-4">
              <Button onClick={() => setActiveTab('shop')} variant="primary" size="md">
                <span>Browse All Vouchers</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Right Column: Company Visual Illustration */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative w-full max-w-lg bg-surface rounded-3xl p-6 shadow-xl border border-line overflow-hidden space-y-4">
              <div className="relative h-60 rounded-2xl overflow-hidden bg-[#0B0D12]">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80"
                  alt="Apex Vouchers Student Support Team"
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-xs font-medium text-accent uppercase tracking-widest block">Apex Vouchers Desk</span>
                  <p className="font-heading font-medium text-lg">Trusted by Indian Study Abroad Aspirants</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-normal text-ink">
                <div className="p-3 rounded-xl bg-surface-raised border border-line flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-accent" />
                  <span>100% Genuine Partner</span>
                </div>
                <div className="p-3 rounded-xl bg-surface-raised border border-line flex items-center gap-2">
                  <Award className="w-4 h-4 text-accent" />
                  <span>Money-Back Policy</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Genuine Statistics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-line">
          {genuineStats.map((st, idx) => (
            <div key={idx} className="bg-surface rounded-2xl p-6 border border-line shadow-sm text-center space-y-1">
              <span className="font-heading font-normal text-3xl sm:text-4xl text-ink block">
                {st.number}
              </span>
              <span className="text-xs font-medium text-accent uppercase tracking-wider block">
                {st.label}
              </span>
              <span className="text-[11px] text-ink-muted font-normal block">
                {st.desc}
              </span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
