'use client';

import { useState } from 'react';
import { ChevronDown, Search, HelpCircle } from 'lucide-react';
import { SectionHeading } from '@/components/ui';
import { FAQ_ITEMS } from '@/lib/faq-data';

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const query = searchQuery.trim().toLowerCase();
  const filteredFaqs = FAQ_ITEMS.filter((f) => !query || f.question.toLowerCase().includes(query) || f.answer.toLowerCase().includes(query));

  return (
    <section id="faq" className="py-16 sm:py-24 bg-surface-raised border-b border-line transition-colors duration-300 scroll-mt-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Frequently Asked Questions" title="Got Questions? We Have Answers." subtitle="Everything you need to know about exam vouchers, code validity, instant delivery, and booking." />

        <div className="relative mb-8 max-w-lg mx-auto">
          <Search className="w-4 h-4 text-ink-muted absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search FAQ questions (e.g. refund, validity, PTE)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-surface border border-line text-ink text-xs font-normal placeholder:text-ink-muted focus:outline-none focus:border-accent transition-all shadow-sm"
          />
        </div>

        <div className="space-y-3">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={faq.question} className="bg-surface rounded-2xl border border-line overflow-hidden transition-all duration-200">
                <button
                  onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                  className="w-full p-5 text-left font-heading font-medium text-sm sm:text-base text-ink flex items-center justify-between gap-4 hover:text-accent transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle className="w-4 h-4 text-accent shrink-0" />
                    <span>{faq.question}</span>
                  </span>
                  <ChevronDown className={`w-4 h-4 text-accent shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && <div className="px-5 pb-5 pt-1 text-ink-muted text-xs sm:text-sm font-normal leading-relaxed border-t border-line animate-in fade-in slide-in-from-top-1">{faq.answer}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
