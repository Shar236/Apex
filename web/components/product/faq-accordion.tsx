'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export function FaqAccordion({ faqs }: { faqs: Array<{ question: string; answer: string }> }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="space-y-3">
      {faqs.map((f, i) => {
        const open = openIndex === i;
        return (
          <div key={f.question} className="bg-surface-raised rounded-2xl border border-line overflow-hidden">
            <button onClick={() => setOpenIndex(open ? -1 : i)} className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left cursor-pointer">
              <span className="font-heading font-medium text-sm text-ink">{f.question}</span>
              <ChevronDown className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && <div className="px-5 pb-4 text-sm text-ink-muted font-normal leading-relaxed">{f.answer}</div>}
          </div>
        );
      })}
    </div>
  );
}
