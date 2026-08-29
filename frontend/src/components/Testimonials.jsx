import React from 'react';
import { Star } from 'lucide-react';
import { TESTIMONIALS } from '../types/data';
import { SectionHeading } from './ui';

export const Testimonials = () => {
  return (
    <section className="py-16 sm:py-24 bg-[var(--color-surface)] border-b border-[var(--color-line)] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <SectionHeading
          eyebrow="Student Reviews & Rating"
          title="Trusted by Over 13,500+ Students"
          subtitle="Read verified reviews from real candidates who booked their PTE, GRE, and TOEFL exams with Apex Vouchers."
        />

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((rev) => (
            <div
              key={rev.id}
              className="bg-[var(--color-surface)] rounded-3xl p-6 border border-[var(--color-line)] shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] font-medium px-2.5 py-1 rounded-md bg-[var(--color-accent)]/[0.08] text-[var(--color-accent)]">
                    Verified Purchase ✓
                  </span>
                </div>

                <p className="text-xs text-[var(--color-ink-muted)] font-normal leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[var(--color-line)] flex items-center justify-between">
                <div>
                  <h4 className="font-heading font-medium text-sm text-[var(--color-ink)]">{rev.name}</h4>
                  <span className="text-[11px] text-[var(--color-ink-muted)] font-normal">{rev.city} • {rev.exam}</span>
                </div>

                <div className="text-right">
                  <span className="text-xs font-medium text-[var(--color-success)] block">Saved {rev.saved}</span>
                  <span className="text-[10px] text-[var(--color-ink-muted)] font-normal block">Rating 5.0</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
