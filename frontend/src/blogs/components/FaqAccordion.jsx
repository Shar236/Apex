import React from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * FAQ accordion — shared by the CMS article body and code-based articles.
 * Only the FAQ answers collapse; the article body is never inside an accordion.
 */
export default function FaqAccordion({ faqs }) {
  const [open, setOpen] = React.useState(0);
  if (!faqs || faqs.length === 0) return null;
  return (
    <section className="mt-12 pt-10 border-t border-[#EAEAEA] dark:border-[#292929]" aria-label="Frequently Asked Questions">
      <h2 className="font-heading font-black text-2xl sm:text-3xl mb-6">Frequently Asked Questions</h2>
      <div className="space-y-3">
        {faqs.map((f, idx) => {
          const isOpen = open === idx;
          return (
            <div key={idx} className={`faq-accordion rounded-2xl border transition-all ${isOpen ? 'border-brand-pink/40 bg-[#FFF0F5] dark:bg-[#2A0A17]' : 'border-[#EAEAEA] dark:border-[#292929] bg-white dark:bg-[#161616]'}`}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : idx)}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left cursor-pointer"
              >
                <h3 className="font-heading font-black text-sm sm:text-base text-neutral-900 dark:text-white flex-1">{f.question}</h3>
                <ChevronDown className={`w-4 h-4 text-brand-pink shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              {isOpen && (
                <div className="px-5 pb-5">
                  <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">{f.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
