import React, { useState, useEffect, useRef } from 'react';
import { useVoucher } from '../context/VoucherContext';
import { Zap, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button, SectionHeading } from './ui';

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
    <section id="savings-calculator" className="py-16 sm:py-24 bg-[var(--color-surface-raised)] border-b border-[var(--color-line)] relative transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <SectionHeading
          eyebrow="Transparent Savings Calculator"
          title="See How Much You Save"
          subtitle="Select your target exam and compare the standard official fee against the Apex Voucher price."
        />

        <div className="max-w-5xl mx-auto bg-[var(--color-surface)] p-6 sm:p-10 rounded-3xl border border-[var(--color-line)] shadow-xl relative overflow-hidden">
          <div className="grid md:grid-cols-12 gap-8 items-center">

            {/* Left Selector & Controls */}
            <div className="md:col-span-6 space-y-6">

              <div>
                <label className="block text-xs font-medium text-[var(--color-ink)] uppercase tracking-wider mb-2">
                  Select Your Exam
                </label>
                <select
                  value={selectedExamId}
                  onChange={(e) => setSelectedExamId(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl bg-[var(--color-surface-raised)] border border-[var(--color-line)] text-[var(--color-ink)] font-normal text-sm focus:outline-none focus:border-[var(--color-accent)] transition-all cursor-pointer shadow-sm"
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
                  <label className="block text-xs font-medium text-[var(--color-ink)] uppercase tracking-wider">
                    Number of Vouchers
                  </label>
                  <span className="px-3 py-1 rounded-lg bg-[var(--color-accent)] text-white text-xs font-medium">
                    {quantity} {quantity === 1 ? 'Voucher' : 'Vouchers'}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="w-full h-2 rounded-full bg-[var(--color-surface-sunken)] appearance-none cursor-pointer accent-[var(--color-accent)]"
                />
                <div className="flex justify-between text-xs font-normal text-[var(--color-ink-muted)] mt-1">
                  <span>1</span>
                  <span>5</span>
                  <span>10</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[var(--color-surface-raised)] border border-[var(--color-line)] space-y-2.5">
                {[
                  '100% genuine voucher code accepted on official testing site',
                  'Instant 10-second delivery to Email & WhatsApp',
                  'Money-Back Guarantee if unredeemed',
                ].map((feat, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs font-normal text-[var(--color-ink-muted)]">
                    <CheckCircle2 className="w-4 h-4 text-[var(--color-success)] shrink-0 mt-0.5" strokeWidth={2} />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Display Box */}
            <div className="md:col-span-6">
              <div className="bg-[#0B0D12] text-white rounded-2xl border border-white/10 p-6 sm:p-8 shadow-xl space-y-6">

                <div className="pb-4 border-b border-white/10">
                  <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block mb-1">Regular Official Price</span>
                  <p className="font-heading font-normal text-xl text-neutral-400 line-through">
                    {formatPrice(totalOriginal)}
                  </p>
                </div>

                <div>
                  <span className="text-[11px] font-medium text-[var(--color-accent)] uppercase tracking-wider block mb-1">Apex Voucher Price</span>
                  <p className="font-heading font-medium text-4xl sm:text-5xl text-white leading-none">
                    {formatPrice(totalDiscounted)}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-medium text-[var(--color-accent)] uppercase tracking-wider block">You Save</span>
                    <span className="font-heading font-medium text-2xl text-[var(--color-accent)]">
                      {formatPrice(displayedSavings)}
                    </span>
                  </div>
                  <span className="text-2xl">💰</span>
                </div>

                <Button
                  onClick={() => startCheckout(selectedProduct)}
                  disabled={!selectedProduct.inStock}
                  variant="primary"
                  size="md"
                  fullWidth
                  className="rounded-xl!"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Buy Now ({formatPrice(totalDiscounted)})</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>

              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
