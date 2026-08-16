import React, { useState, useEffect, useRef } from 'react';
import { useVoucher } from '../context/VoucherContext';
import { Zap, CheckCircle2, ArrowRight } from 'lucide-react';

export const SavingsCalculator = () => {
  const { products, formatPrice, startCheckout } = useVoucher();
  const [selectedExamId, setSelectedExamId] = useState(products[0]?.id || 'pte-academic');
  const [quantity, setQuantity] = useState(1);
  const [displayedSavings, setDisplayedSavings] = useState(0);
  const savingsRef = useRef(0);

  const selectedProduct = products.find(p => p.id === selectedExamId || p._id === selectedExamId) || products[0] || {};
  const totalOriginal = (selectedProduct.originalPrice || 0) * quantity;
  const totalDiscounted = (selectedProduct.discountedPrice || 0) * quantity;
  const totalSavings = (selectedProduct.savings || 0) * quantity;

  useEffect(() => {
    if (products.length > 0 && (!selectedExamId || !products.some(p => p.id === selectedExamId || p._id === selectedExamId))) {
      setSelectedExamId(products[0].id || products[0]._id);
    }
  }, [products, selectedExamId]);

  useEffect(() => {
    const startValue = savingsRef.current;
    const endValue = totalSavings;
    const duration = 600;
    const startTime = performance.now();

    const animate = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + (endValue - startValue) * ease);
      setDisplayedSavings(current);
      if (progress < 1) requestAnimationFrame(animate);
      else savingsRef.current = endValue;
    };

    requestAnimationFrame(animate);
  }, [totalSavings]);

  const examOptions = products.filter(p => p.category === 'Exam Voucher');

  return (
    <section id="savings-calculator" className="py-16 sm:py-24 bg-slate-50 dark:bg-[#0A0A0A] border-b border-slate-200/80 dark:border-[#292929] relative transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-extrabold uppercase tracking-widest text-slate-800 dark:text-white bg-white dark:bg-[#161616] px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-[#292929] shadow-sm">
            TRANSPARENT SAVINGS CALCULATOR
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight mt-3">
            See How Much You <span className="text-pink-highlight">Save</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 font-medium text-base mt-3">
            Select your target exam and compare the standard official fee against the Apex Voucher price.
          </p>
        </div>

        <div className="max-w-5xl mx-auto bg-white dark:bg-[#161616] p-6 sm:p-10 rounded-3xl border border-slate-200/80 dark:border-[#292929] shadow-xl relative overflow-hidden">
          <div className="grid md:grid-cols-12 gap-8 items-center">

            {/* Left Selector & Controls */}
            <div className="md:col-span-6 space-y-6">

              <div>
                <label className="block text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                  Select Your Exam
                </label>
                <select
                  value={selectedExamId}
                  onChange={(e) => setSelectedExamId(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#292929] text-slate-900 dark:text-white font-bold text-sm focus:outline-none focus:border-[#FF005C] transition-all cursor-pointer shadow-sm"
                >
                  {examOptions.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name.replace('Pearson ', '').replace('ETS ', '')} — Save {formatPrice(p.savings)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                    Number of Vouchers
                  </label>
                  <span className="px-3 py-1 rounded-lg bg-[#FF005C] text-white text-xs font-extrabold">
                    {quantity} {quantity === 1 ? 'Voucher' : 'Vouchers'}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 appearance-none cursor-pointer accent-[#FF005C]"
                />
                <div className="flex justify-between text-xs font-bold text-slate-400 dark:text-slate-500 mt-1">
                  <span>1</span>
                  <span>5</span>
                  <span>10</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200/80 dark:border-[#292929] space-y-2.5">
                {[
                  '100% genuine voucher code accepted on official testing site',
                  'Instant 10-second delivery to Email & WhatsApp',
                  'Money-Back Guarantee if unredeemed',
                ].map((feat, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" strokeWidth={2.5} />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Display Box */}
            <div className="md:col-span-6">
              <div className="bg-slate-950 dark:bg-[#0A0A0A] text-white rounded-2xl border border-slate-800 dark:border-[#292929] p-6 sm:p-8 shadow-xl space-y-6">

                <div className="pb-4 border-b border-slate-800 dark:border-[#292929]">
                  <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Regular Official Price</span>
                  <p className="font-heading font-bold text-xl text-slate-400 line-through">
                    {formatPrice(totalOriginal)}
                  </p>
                </div>

                <div>
                  <span className="text-[11px] font-extrabold text-[#FF005C] uppercase tracking-wider block mb-1">Apex Voucher Price</span>
                  <p className="font-heading font-black text-4xl sm:text-5xl text-white leading-none">
                    {formatPrice(totalDiscounted)}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold text-[#FF005C] uppercase tracking-wider block">You Save</span>
                    <span className="font-heading font-black text-2xl text-[#FF005C]">
                      {formatPrice(displayedSavings)}
                    </span>
                  </div>
                  <span className="text-2xl">💰</span>
                </div>

                <button
                  onClick={() => startCheckout(selectedProduct)}
                  disabled={!selectedProduct.inStock}
                  className="w-full btn-pink !py-3.5 !rounded-xl !text-sm font-black flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>Buy Now ({formatPrice(totalDiscounted)})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
