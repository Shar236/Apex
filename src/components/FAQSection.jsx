import React, { useState } from 'react';
import { ChevronDown, Search, HelpCircle } from 'lucide-react';
import { FAQ_ITEMS } from '../types/data';

export const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = FAQ_ITEMS.filter(f =>
    f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section className="py-16 sm:py-24 bg-slate-50 dark:bg-[#111111] border-b border-slate-200/80 dark:border-[#292929] transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-extrabold uppercase tracking-widest text-slate-800 dark:text-white bg-white dark:bg-[#161616] px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-[#292929] shadow-sm">
            FREQUENTLY ASKED QUESTIONS
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight mt-3">
            Got Questions? <span className="text-pink-highlight">We Have Answers.</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 font-medium text-base mt-3">
            Everything you need to know about exam vouchers, code validity, instant delivery, and booking.
          </p>
        </div>

        {/* Live Filter Search Bar */}
        <div className="relative mb-8 max-w-lg mx-auto">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search FAQ questions (e.g. refund, validity, PTE)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-[#161616] border border-slate-200 dark:border-[#292929] text-slate-900 dark:text-white text-xs font-bold placeholder-slate-400 focus:outline-none focus:border-[#FF005C] transition-all shadow-sm"
          />
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-[#161616] rounded-2xl border border-slate-200/80 dark:border-[#292929] overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                  className="w-full p-5 text-left font-heading font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center justify-between gap-4 hover:text-[#FF005C] transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle className="w-4 h-4 text-[#FF005C] shrink-0" />
                    <span>{faq.question}</span>
                  </span>
                  <ChevronDown className={`w-4 h-4 text-[#FF005C] shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed border-t border-slate-100 dark:border-[#292929]">
                    {faq.answer}
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
