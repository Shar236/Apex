import React from 'react';
import { ShieldCheck, Lock, Zap, Headphones, Tag } from 'lucide-react';

export const TrustStrip = () => {
  const trustItems = [
    { icon: ShieldCheck, label: 'Genuine Vouchers' },
    { icon: Lock, label: 'Secure Checkout' },
    { icon: Zap, label: 'Fast Delivery' },
    { icon: Headphones, label: 'Customer Support' },
    { icon: Tag, label: 'Transparent Pricing' },
  ];

  return (
    <section className="py-6 bg-[#0B0D12] text-white border-y border-white/5 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center md:justify-between gap-6 text-xs font-medium uppercase tracking-wider">
          {trustItems.map((item, idx) => {
            const IconComp = item.icon;
            return (
              <div key={idx} className="flex items-center gap-2 text-neutral-300 hover:text-[var(--color-accent)] transition-colors">
                <span className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-[var(--color-accent)]">
                  <IconComp className="w-4 h-4" />
                </span>
                <span>✓ {item.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
