import React from 'react';
import { Star, ShieldCheck } from 'lucide-react';
import { TESTIMONIALS } from '../types/data';

export const Testimonials = () => {
  return (
    <section className="py-16 sm:py-24 bg-white dark:bg-[#0A0A0A] border-b border-[#EAEAEA] dark:border-[#292929] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-extrabold uppercase tracking-widest text-brand-pink bg-[#FFF0F5] dark:bg-[#2A0A17] px-3.5 py-1.5 rounded-full border border-brand-pink/20">
            STUDENT REVIEWS & RATING
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-neutral-900 dark:text-white tracking-tight mt-3">
            Trusted by Over <span className="text-pink-highlight">13,500+ Students</span>
          </h2>
          <p className="text-neutral-500 dark:text-[#B5B5B5] font-medium text-base mt-3">
            Read verified reviews from real candidates who booked their PTE, GRE, and TOEFL exams with Apex Vouchers.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((rev) => (
            <div
              key={rev.id}
              className="bg-white dark:bg-[#161616] rounded-3xl p-6 border border-[#EAEAEA] dark:border-[#292929] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-md bg-[#FFF0F5] dark:bg-[#2A0A17] text-brand-pink">
                    Verified Purchase ✓
                  </span>
                </div>

                <p className="text-xs text-neutral-700 dark:text-neutral-300 font-medium leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#EAEAEA] dark:border-[#292929] flex items-center justify-between">
                <div>
                  <h4 className="font-heading font-black text-sm text-neutral-900 dark:text-white">{rev.name}</h4>
                  <span className="text-[11px] text-neutral-500 dark:text-[#B5B5B5] font-medium">{rev.city} • {rev.exam}</span>
                </div>

                <div className="text-right">
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 block">Saved {rev.saved}</span>
                  <span className="text-[10px] text-neutral-400 font-medium block">Rating 5.0</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
