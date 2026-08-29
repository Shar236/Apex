import React from 'react';
import { Check, X, ShieldCheck } from 'lucide-react';
import { useVoucher } from '../context/VoucherContext';

export const PriceComparisonTable = () => {
  const { setActiveTab } = useVoucher();

  const comparisonRows = [
    { benefit: 'Highest discount (up to 22%)', standard: false, apex: true },
    { benefit: 'Complimentary exam booking service', standard: false, apex: true },
    { benefit: '100% Genuine authorized partner codes', standard: true, apex: true },
    { benefit: 'Dedicated 24/7 WhatsApp & call customer support', standard: false, apex: true },
    { benefit: 'Free official practice & scored mock test sets', standard: false, apex: true },
    { benefit: 'Accommodation support abroad', standard: false, apex: true },
    { benefit: 'Admission & university score guidance', standard: false, apex: true },
    { benefit: 'Education loan assistance with low interest rates', standard: false, apex: true },
  ];

  return (
    <section className="py-16 sm:py-24 bg-white border-b border-slate-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600 bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-100">
            TRANSPARENT COMPARISON
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
            Why Apex Vouchers Over Other Platforms?
          </h2>
          <p className="text-slate-500 font-medium text-sm sm:text-base mt-2">
            See how we deliver unmatched value, security, and student support compared to regular portals.
          </p>
        </div>

        {/* Comparison Table (Exact like PDF page 3 reference) */}
        <div className="rounded-3xl border border-slate-200 overflow-hidden shadow-lg">
          <table className="w-full text-left border-collapse">
            
            {/* Table Header */}
            <thead>
              <tr className="bg-[#0F172A] text-white">
                <th className="py-4 px-6 text-sm font-extrabold uppercase tracking-wider w-1/2">Benefit</th>
                <th className="py-4 px-4 text-center text-xs font-bold text-slate-300 uppercase tracking-wider w-1/4">Other Platforms</th>
                <th className="py-4 px-4 text-center text-xs font-black text-amber-400 uppercase tracking-wider w-1/4 bg-blue-900/60">Apex Vouchers</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100 text-sm">
              {comparisonRows.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                  <td className="py-4 px-6 font-semibold text-slate-800">
                    {row.benefit}
                  </td>
                  
                  <td className="py-4 px-4 text-center">
                    {row.standard ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-500">
                        <Check className="w-4 h-4" strokeWidth={3} />
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-100 text-rose-600 font-extrabold text-xs">
                        ✕
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-4 text-center bg-blue-50/40">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500 text-white shadow-sm">
                      <Check className="w-4 h-4" strokeWidth={3.5} />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => setActiveTab('shop')}
            className="btn-primary py-3.5! px-8! text-base!"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>Book Your Exam With Apex Vouchers</span>
          </button>
        </div>

      </div>
    </section>
  );
};
