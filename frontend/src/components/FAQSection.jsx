import React, { useState } from 'react';
import { ChevronDown, Search, HelpCircle } from 'lucide-react';
import { FAQ_ITEMS } from '../types/data';
import { SectionHeading } from './ui';

export const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const query = (searchQuery || '').trim().toLowerCase();
  const filteredFaqs = (FAQ_ITEMS || []).filter(f => {
    const qText = String(f?.question || f?.q || '').toLowerCase();
    const aText = String(f?.answer || f?.a || '').toLowerCase();
    return !query || qText.includes(query) || aText.includes(query);
  });

  return (
    <section className="py-16 sm:py-24 bg-[var(--color-surface-raised)] border-b border-[var(--color-line)] transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <SectionHeading
          eyebrow="Frequently Asked Questions"
          title="Got Questions? We Have Answers."
          subtitle="Everything you need to know about exam vouchers, code validity, instant delivery, and booking."
        />

        {/* Live Filter Search Bar */}
        <div className="relative mb-8 max-w-lg mx-auto">
          <Search className="w-4 h-4 text-[var(--color-ink-muted)] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search FAQ questions (e.g. refund, validity, PTE)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-line)] text-[var(--color-ink)] text-xs font-normal placeholder:text-[var(--color-ink-muted)] focus:outline-none focus:border-[var(--color-accent)] transition-all shadow-sm"
          />
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            const qStr = faq?.question || faq?.q || '';
            const aStr = faq?.answer || faq?.a || '';
            return (
              <div
                key={idx}
                className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-line)] overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                  className="w-full p-5 text-left font-heading font-medium text-sm sm:text-base text-[var(--color-ink)] flex items-center justify-between gap-4 hover:text-[var(--color-accent)] transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
                    <span>{qStr}</span>
                  </span>
                  <ChevronDown className={`w-4 h-4 text-[var(--color-accent)] shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-[var(--color-ink-muted)] text-xs sm:text-sm font-normal leading-relaxed border-t border-[var(--color-line)] animate-in fade-in slide-in-from-top-1">
                    {aStr}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
