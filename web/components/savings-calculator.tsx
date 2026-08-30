'use client';

import { useEffect, useRef, useState } from 'react';
import { Zap, CheckCircle2, ArrowRight } from 'lucide-react';
import { useCart } from '@/components/cart-provider';
import { useVoucher } from '@/components/voucher-provider';
import { Button, SectionHeading } from '@/components/ui';
import type { Product } from '@/lib/types';

export function SavingsCalculator({ products }: { products: Product[] }) {
  const { formatPrice } = useCart();
  const { startCheckout } = useVoucher();
  const examOptions = products.filter((p) => p.category === 'Exam Voucher');
  const [selectedId, setSelectedId] = useState<string>(examOptions[0]?._id || products[0]?._id || '');
  const [quantity, setQuantity] = useState(1);
  const [displayedSavings, setDisplayedSavings] = useState(0);
  const savingsRef = useRef(0);

  const selectedProduct = products.find((p) => p._id === selectedId) || examOptions[0] || products[0];
  const totalOriginal = (selectedProduct?.originalPrice || 0) * quantity;
  const totalDiscounted = ((selectedProduct?.discountedPrice ?? selectedProduct?.sellingPrice) || 0) * quantity;
  const totalSavings = (selectedProduct?.savings || 0) * quantity;

  useEffect(() => {
    const startValue = savingsRef.current;
    const endValue = totalSavings;
    const duration = 600;
    const startTime = performance.now();
    let raf: number;

    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplayedSavings(Math.round(startValue + (endValue - startValue) * ease));
      if (progress < 1) raf = requestAnimationFrame(animate);
      else savingsRef.current = endValue;
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [totalSavings]);

  if (!selectedProduct) return null;

  const buyNow = () => startCheckout(selectedProduct);

  return (
    <section id="savings-calculator" className="py-16 sm:py-24 bg-surface-raised border-b border-line relative transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Transparent Savings Calculator" title="See How Much You Save" subtitle="Select your target exam and compare the standard official fee against the Apex Voucher price." />

        <div className="max-w-5xl mx-auto bg-surface p-6 sm:p-10 rounded-3xl border border-line shadow-xl relative overflow-hidden">
          <div className="grid md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-6 space-y-6">
              <div>
                <label className="block text-xs font-medium text-ink uppercase tracking-wider mb-2">Select Your Exam</label>
                <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className="w-full px-4 py-3.5 rounded-xl bg-surface-raised border border-line text-ink font-normal text-sm focus:outline-none focus:border-accent transition-all cursor-pointer shadow-sm">
                  {examOptions.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name.replace('Pearson ', '').replace('ETS ', '')} — Save {formatPrice(p.savings)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-medium text-ink uppercase tracking-wider">Number of Vouchers</label>
                  <span className="px-3 py-1 rounded-lg bg-accent text-white text-xs font-medium">
                    {quantity} {quantity === 1 ? 'Voucher' : 'Vouchers'}
                  </span>
                </div>
                <input type="range" min="1" max="10" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value, 10))} className="w-full h-2 rounded-full bg-surface-sunken appearance-none cursor-pointer accent-accent" />
                <div className="flex justify-between text-xs font-normal text-ink-muted mt-1">
                  <span>1</span>
                  <span>5</span>
                  <span>10</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-surface-raised border border-line space-y-2.5">
                {['100% genuine voucher code accepted on official testing site', 'Instant delivery to your email', 'Money-Back Guarantee if unredeemed'].map((feat) => (
                  <div key={feat} className="flex items-start gap-2 text-xs font-normal text-ink-muted">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" strokeWidth={2} />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-6">
              <div className="bg-[#0B0D12] text-white rounded-2xl border border-white/10 p-6 sm:p-8 shadow-xl space-y-6">
                <div className="pb-4 border-b border-white/10">
                  <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block mb-1">Regular Official Price</span>
                  <p className="font-heading font-normal text-xl text-neutral-400 line-through">{formatPrice(totalOriginal)}</p>
                </div>

                <div>
                  <span className="text-[11px] font-medium text-accent uppercase tracking-wider block mb-1">Apex Voucher Price</span>
                  <p className="font-heading font-medium text-4xl sm:text-5xl text-white leading-none">{formatPrice(totalDiscounted)}</p>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-medium text-accent uppercase tracking-wider block">You Save</span>
                    <span className="font-heading font-medium text-2xl text-accent">{formatPrice(displayedSavings)}</span>
                  </div>
                  <span className="text-2xl">💰</span>
                </div>

                <Button onClick={buyNow} disabled={selectedProduct.inStock === false} variant="primary" size="md" fullWidth className="rounded-xl!">
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
}
