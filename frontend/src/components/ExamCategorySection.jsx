import React from 'react';
import { useVoucher } from '../context/VoucherContext';
import { ArrowRight } from 'lucide-react';
import { BrandLogoContainer } from './OfficialBrandLogos';
import { useTheme } from '../context/ThemeContext.jsx';
import { SectionHeading, Badge, Button } from './ui';

const CATEGORIES = [
  { id: 'pte', searchKey: 'pte', name: 'PTE Voucher', fullName: 'Pearson PTE Academic & Core', desc: 'Save more on your PTE Academic & PTE Core exam booking.', validity: 'Valid 6 Months', badge: 'Most Popular', featured: true },
  { id: 'ielts', searchKey: 'ielts', name: 'IELTS Voucher', fullName: 'IELTS Academic & General', desc: 'Exclusive discount codes for official IELTS test registration.', validity: 'Valid 12 Months', badge: 'Best Value' },
  { id: 'toefl', searchKey: 'toefl', name: 'TOEFL Voucher', fullName: 'ETS TOEFL iBT Test', desc: 'Save on TOEFL iBT, accepted by universities worldwide.', validity: 'Valid 12 Months', badge: 'Max Discount' },
  { id: 'duolingo', searchKey: 'duolingo', name: 'Duolingo Test Voucher', fullName: 'Duolingo English Test Coupon', desc: 'Fast digital delivery with instant coupon savings.', validity: 'Valid 90 Days', badge: 'Fast Results' },
];

export const ExamCategorySection = () => {
  const { setActiveTab, formatPrice, startCheckout, products } = useVoucher();
  const { isDark } = useTheme();

  return (
    <section id="choose-your-exam" className="py-16 sm:py-24 bg-[var(--color-surface)] border-b border-[var(--color-line)] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Choose your exam"
          title="Save on your English test booking"
          subtitle="Select your test and get genuine vouchers at exclusive prices."
          className="mb-14"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
          {CATEGORIES.map((cat) => {
            const matched = products?.find((p) => {
              const key = cat.searchKey;
              return (p.name || '').toLowerCase().includes(key)
                || (p.brand || '').toLowerCase().includes(key)
                || (p.slug || '').toLowerCase().includes(key);
            });
            const price = matched?.discountedPrice ?? matched?.sellingPrice ?? 15499;
            const savings = matched?.savings ?? Math.max(0, (matched?.originalPrice || 18900) - price);
            const target = matched || products?.[0];

            return (
              <div
                key={cat.id}
                className={[
                  'group relative flex flex-col rounded-2xl p-6 transition-all duration-200',
                  'bg-[var(--color-surface)] border',
                  cat.featured
                    ? 'border-[var(--color-accent)] ring-1 ring-[var(--color-accent)]/30 shadow-sm'
                    : 'border-[var(--color-line)] hover:border-[var(--color-accent)]/45 hover:-translate-y-1',
                ].join(' ')}
              >
                <div className="flex items-center justify-between mb-4">
                  <Badge tone={cat.featured ? 'accent' : 'neutral'}>{cat.badge}</Badge>
                  <span className="text-[11px] font-normal text-[var(--color-ink-muted)]">{cat.validity}</span>
                </div>

                <div className="rounded-xl mb-4 h-20 flex items-center justify-center bg-[var(--color-surface-raised)] border border-[var(--color-line)]">
                  <BrandLogoContainer brand={cat.searchKey} name={cat.fullName} className="h-9" inverted={isDark} />
                </div>

                <h3 className="font-heading font-normal text-lg leading-snug text-[var(--color-ink)]">{cat.name}</h3>
                <p className="mt-1.5 text-xs font-normal leading-relaxed text-[var(--color-ink-muted)] flex-1">{cat.desc}</p>

                <div className="mt-5 pt-4 border-t border-[var(--color-line)] space-y-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="min-w-0">
                      <span className="block text-[10px] uppercase tracking-[0.08em] font-medium text-[var(--color-ink-muted)]">Starting from</span>
                      <span className="font-heading font-semibold text-xl text-[var(--color-ink)]">{formatPrice(price)}</span>
                    </div>
                    {savings > 0 && (
                      <span className="shrink-0 px-2 py-0.5 rounded-md bg-[var(--color-success)]/12 text-[var(--color-success)] border border-[var(--color-success)]/20 text-[11px] font-medium whitespace-nowrap">
                        Save {formatPrice(savings)}
                      </span>
                    )}
                  </div>

                  <Button
                    variant={cat.featured ? 'primary' : 'secondary'}
                    size="md"
                    fullWidth
                    onClick={() => (cat.featured && target ? startCheckout(target) : setActiveTab('shop'))}
                  >
                    View {cat.name}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ExamCategorySection;
