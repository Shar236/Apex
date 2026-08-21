import React from 'react';
import { ShieldCheck, CheckCircle2, Lock, CreditCard } from 'lucide-react';

export const TrustMarquee = () => {
  const brandLogos = [
    { name: "Pearson PTE Academic", text: "PEARSON PTE", color: "from-blue-500 to-indigo-500" },
    { name: "ETS GRE General", text: "ETS GRE", color: "from-violet-500 to-pink-500" },
    { name: "ETS TOEFL iBT", text: "ETS TOEFL", color: "from-emerald-500 to-teal-500" },
    { name: "Duolingo English Test", text: "DUOLINGO", color: "from-amber-400 to-emerald-500" },
    { name: "UPI Instant Payment", text: "UPI", color: "from-amber-500 to-orange-500" },
    { name: "Razorpay Secure", text: "RAZORPAY", color: "from-cyan-500 to-blue-600" },
    { name: "Visa / Mastercard", text: "VISA / MC", color: "from-indigo-400 to-violet-400" },
    { name: "PayPal International", text: "PAYPAL", color: "from-blue-600 to-blue-400" }
  ];

  return (
    <section className="bg-white border-y border-gray-200 py-8 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 mb-4 text-center">
        <p className="text-xs font-semibold text-gray-500 tracking-wider uppercase flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-violet-600" />
          <span>ACCEPTED ON OFFICIAL PORTALS & POWERED BY SECURE PAYMENT GATEWAYS</span>
        </p>
      </div>

      <div className="relative flex overflow-x-hidden">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-8">
          {[...brandLogos, ...brandLogos, ...brandLogos].map((brand, idx) => (
            <div
              key={idx}
              className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gray-50 border border-gray-200 shadow-sm shrink-0 hover:border-violet-300 transition-colors"
            >
              <div className={`w-3 h-3 rounded-full bg-linear-to-r ${brand.color}`} />
              <span className="font-heading font-extrabold text-sm text-gray-800 tracking-wider">
                {brand.text}
              </span>
              <span className="text-[10px] bg-white text-gray-500 px-2 py-0.5 rounded font-mono border border-gray-200">VERIFIED</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
