import React from 'react';
import { Ticket, CheckCircle2, ShieldCheck, Info } from 'lucide-react';
import { useVoucher } from '../context/VoucherContext';
import { ApexLogo } from './ApexLogo';

export const VisualExplainerSection = () => {
  const { setActiveTab } = useVoucher();

  const explainerCards = [
    {
      title: 'What you receive',
      desc: 'An official alphanumeric <span className="text-pink-highlight font-bold">discount voucher code</span> sent to your email & WhatsApp.',
      icon: Ticket
    },
    {
      title: 'How to use it',
      desc: 'Simply paste the code into the <span className="font-bold text-slate-900 dark:text-white">Voucher / Promo Code</span> box at checkout on the test portal.',
      icon: CheckCircle2
    },
    {
      title: 'Where to redeem it',
      desc: 'Directly on official test sites (<span className="font-bold text-slate-900 dark:text-white">mypte.pearsonpte.com</span>, <span className="font-bold text-slate-900 dark:text-white">ets.org</span>, or <span className="font-bold text-slate-900 dark:text-white">duolingo.com</span>).',
      icon: ShieldCheck
    },
    {
      title: 'Validity & Conditions',
      desc: 'Valid for <span className="text-pink-highlight font-bold">6 to 12 months</span>. 100% money-back guarantee if unredeemed within 7 days.',
      icon: Info
    }
  ];

  return (
    <section className="py-16 sm:py-24 bg-white dark:bg-[#0A0A0A] border-b border-slate-200/80 dark:border-[#292929] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Custom Vector Illustration of Digital Voucher */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md bg-slate-950 dark:bg-[#161616] rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-slate-800 dark:border-[#292929] space-y-6">
              
              <div className="flex items-center justify-between border-b border-slate-800 dark:border-[#292929] pb-4">
                <ApexLogo className="h-6" whiteText={true} />
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                  OFFICIAL PASS
                </span>
              </div>

              {/* Vector Digital Coupon Pass Graphic */}
              <div className="relative bg-brand-pink text-white rounded-2xl p-5 shadow-lg border border-brand-pink/40 space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] uppercase font-black tracking-widest text-white/90">Pearson PTE / ETS GRE</span>
                  <span className="text-xs font-black bg-white text-brand-pink px-2 py-0.5 rounded shadow-sm">SAVE ₹3,401</span>
                </div>

                <div className="border-t-2 border-b-2 border-dashed border-white/40 py-3 my-2 text-center">
                  <span className="text-xs uppercase font-extrabold text-white/90 block mb-0.5">Voucher Code</span>
                  <span className="font-heading font-black text-2xl tracking-widest text-white">APEX-PTE-8921-X</span>
                </div>

                <div className="flex justify-between items-center text-[10px] font-extrabold text-white/90">
                  <span>Validity: 180 Days</span>
                  <span>100% Genuine Code</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 dark:bg-[#0A0A0A] border border-slate-800 dark:border-[#292929] text-xs text-slate-300 space-y-1.5 font-medium">
                <p className="font-bold text-brand-pink flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Direct Institutional Resell Credit
                </p>
                <p className="text-[11px] leading-relaxed">
                  When applied on official test portals, the voucher code waives off the test booking fee instantly.
                </p>
              </div>

            </div>
          </div>

          {/* Right Column: Editorial Explanation & Information Cards */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="space-y-3">
              <span className="text-xs font-extrabold uppercase tracking-widest text-brand-pink bg-slate-100 dark:bg-[#161616] px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-[#292929]">
                EXAM VOUCHER EXPLAINED
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                What Is an <span className="text-pink-highlight">Exam Voucher?</span>
              </h2>
              <p className="text-slate-600 dark:text-slate-300 font-medium text-base sm:text-lg leading-relaxed">
                An exam voucher is an official prepaid digital discount code issued by institutional test organizers (Pearson, ETS, Duolingo). Instead of paying full price on credit cards, students enter an Apex Voucher code to receive instant savings.
              </p>
            </div>

            {/* Small Information Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {explainerCards.map((card, idx) => {
                const IconComp = card.icon;
                return (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-[#161616] border border-slate-200/80 dark:border-[#292929] space-y-2">
                    <div className="flex items-center gap-2 font-heading font-black text-slate-900 dark:text-white text-sm">
                      <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-[#262626] text-brand-pink flex items-center justify-center">
                        <IconComp className="w-4 h-4" />
                      </div>
                      <span>{card.title}</span>
                    </div>
                    <p 
                      className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: card.desc }}
                    />
                  </div>
                );
              })}
            </div>

            <div className="pt-2">
              <button
                onClick={() => setActiveTab('shop')}
                className="btn-pink !py-3.5 !px-7 !text-sm"
              >
                <span>Browse Exam Vouchers</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
