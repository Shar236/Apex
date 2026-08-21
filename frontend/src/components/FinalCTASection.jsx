import React from 'react';
import { useVoucher } from '../context/VoucherContext';
import { ArrowRight, MessageCircle, Ticket, ShieldCheck } from 'lucide-react';
import { ApexLogo } from './ApexLogo';

export const FinalCTASection = () => {
  const { setActiveTab } = useVoucher();

  return (
    <section className="relative overflow-hidden bg-[#111111] dark:bg-[#0A0A0A] py-20 sm:py-24 text-white border-b border-neutral-800 dark:border-[#292929] transition-colors duration-300">
      
      {/* Background Hot Pink Glow */}
      <div className="absolute top-0 right-1/4 w-125 h-125 bg-brand-pink/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Content */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-pink/10 border border-brand-pink/20 text-brand-pink text-xs font-extrabold uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4 text-brand-pink" />
              GUARANTEED OFFICIAL VOUCHERS
            </div>

            <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white">
              Ready to Save on Your <br />
              <span className="text-brand-pink">Next English Exam?</span>
            </h2>

            <p className="text-neutral-300 font-medium text-base sm:text-lg max-w-xl">
              Choose your exam voucher and get started. Instant 10-second delivery to your email & WhatsApp.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => setActiveTab('shop')}
                className="btn-pink py-4! px-9! text-base! shadow-xl"
              >
                <Ticket className="w-5 h-5" />
                <span>Browse Vouchers</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <a
                href="https://wa.me/919855926113"
                target="_blank"
                rel="noreferrer"
                className="btn-secondary py-4! px-8! text-base! bg-[#161616]! text-white! border-[#292929]! hover:border-brand-pink!"
              >
                <MessageCircle className="w-5 h-5 text-emerald-400" />
                <span>Contact Us</span>
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs font-bold text-neutral-400 pt-4">
              <span>⚡ 10-Second Instant Delivery</span>
              <span>•</span>
              <span>🔒 256-bit Encrypted Checkout</span>
              <span>•</span>
              <span>💬 24/7 Support Available</span>
            </div>

          </div>

          {/* Right Column: Graphic Card with ApexLogo */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md bg-[#161616] rounded-3xl p-6 border border-[#292929] shadow-2xl text-center space-y-4">
              
              <div className="flex justify-center py-4">
                <div className="p-4 rounded-2xl bg-[#0A0A0A] border border-[#292929]">
                  <ApexLogo className="h-10" showTagline={true} whiteText={true} />
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-heading font-black text-xl text-white block">Official Bulk Discount Passes</span>
                <span className="text-xs text-neutral-400 font-medium block">PTE • GRE • TOEFL • Duolingo • IELTS</span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
