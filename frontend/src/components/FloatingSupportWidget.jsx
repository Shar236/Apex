import React, { useState, useEffect } from 'react';
import { MessageSquare, X, MessageCircle, ArrowRight, HelpCircle } from 'lucide-react';
import { useVoucher } from '../context/VoucherContext';
import { ApexLogo } from './ApexLogo';

export const FloatingSupportWidget = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const { setActiveTab } = useVoucher();

  useEffect(() => {
    const isClosed = sessionStorage.getItem('apex_support_widget_closed');
    if (isClosed === 'true') {
      setIsDismissed(true);
      return;
    }

    const timer = setTimeout(() => {
      setIsExpanded(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsExpanded(false);
    setIsDismissed(true);
    sessionStorage.setItem('apex_support_widget_closed', 'true');
  };

  if (isDismissed) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className="px-4 py-3 rounded-full bg-[#151515] text-white shadow-2xl flex items-center gap-2.5 border border-amber-400/40 hover:border-amber-400 transition-all hover:scale-105 group cursor-pointer"
          title="Need Help choosing a voucher?"
        >
          <div className="w-7 h-7 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-sm">
            💬
          </div>
          <span className="font-heading font-extrabold text-xs text-white">Need Help?</span>
        </button>
      ) : (
        <div className="w-72 sm:w-80 bg-[#161616] text-white rounded-3xl p-5 shadow-2xl border-2 border-amber-400/60 relative animate-in slide-in-from-bottom-5 duration-300 space-y-4">
          
          <button
            onClick={handleDismiss}
            className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="Close support widget"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center shrink-0">
              <HelpCircle className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest">Apex Support Desk</span>
              </div>
              <h4 className="font-heading font-black text-sm text-white leading-tight">Need help choosing a voucher?</h4>
            </div>
          </div>

          <p className="text-xs text-slate-300 font-medium leading-relaxed">
            Our team is online 24/7 to answer questions about PTE, GRE, TOEFL, or Duolingo exam voucher codes.
          </p>

          <div className="space-y-2 pt-1">
            <a
              href="https://wa.me/919855926113"
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>WhatsApp Instant Help</span>
            </a>

            <button
              onClick={() => {
                setIsExpanded(false);
                setActiveTab('faq');
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-white/10"
            >
              <span>View Voucher FAQ & Guides</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
