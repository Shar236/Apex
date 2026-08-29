import React from 'react';
import { Ticket, CheckCircle2, ShieldCheck, Info } from 'lucide-react';
import { useVoucher } from '../context/VoucherContext';
import { ApexLogo } from './ApexLogo';
import { Button } from './ui';

export const VisualExplainerSection = () => {
  const { setActiveTab } = useVoucher();

  const explainerCards = [
    {
      title: 'What you receive',
      desc: 'An official alphanumeric <span class="text-[var(--color-accent)]">discount voucher code</span> sent to your email & WhatsApp.',
      icon: Ticket
    },
    {
      title: 'How to use it',
      desc: 'Simply paste the code into the <span class="text-[var(--color-ink)]">Voucher / Promo Code</span> box at checkout on the test portal.',
      icon: CheckCircle2
    },
    {
      title: 'Where to redeem it',
      desc: 'Directly on official test sites (<span class="text-[var(--color-ink)]">mypte.pearsonpte.com</span>, <span class="text-[var(--color-ink)]">ets.org</span>, or <span class="text-[var(--color-ink)]">duolingo.com</span>).',
      icon: ShieldCheck
    },
    {
      title: 'Validity & Conditions',
      desc: 'Valid for <span class="text-[var(--color-accent)]">6 to 12 months</span>. 100% money-back guarantee if unredeemed within 7 days.',
      icon: Info
    }
  ];

  return (
    <section className="py-16 sm:py-24 bg-[var(--color-surface)] border-b border-[var(--color-line)] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left Column: Custom Vector Illustration of Digital Voucher */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md bg-[#0B0D12] rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-white/10 space-y-6">

              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <ApexLogo className="h-6" whiteText={true} />
                <span className="px-2.5 py-0.5 rounded-full bg-[var(--color-success)]/20 text-[var(--color-success)] text-[10px] font-medium">
                  OFFICIAL PASS
                </span>
              </div>

              {/* Vector Digital Coupon Pass Graphic */}
              <div className="relative bg-[var(--color-accent)] text-white rounded-2xl p-5 shadow-lg border border-white/20 space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] uppercase font-medium tracking-widest text-white/90">Pearson PTE / ETS GRE</span>
                  <span className="text-xs font-medium bg-white text-[var(--color-accent)] px-2 py-0.5 rounded shadow-sm">SAVE ₹3,401</span>
                </div>

                <div className="border-t-2 border-b-2 border-dashed border-white/40 py-3 my-2 text-center">
                  <span className="text-xs uppercase font-medium text-white/90 block mb-0.5">Voucher Code</span>
                  <span className="font-heading font-medium text-2xl tracking-widest text-white">APEX-PTE-8921-X</span>
                </div>

                <div className="flex justify-between items-center text-[10px] font-medium text-white/90">
                  <span>Validity: 180 Days</span>
                  <span>100% Genuine Code</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-neutral-300 space-y-1.5 font-normal">
                <p className="font-medium text-[var(--color-accent)] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Direct Institutional Resell Credit
                </p>
                <p className="text-[11px] leading-relaxed">
                  When applied on official test portals, the voucher code waives off the test booking fee instantly.
                </p>
              </div>

            </div>
          </div>

          {/* Right Column: Editorial Explanation & Information Cards */}
          <div className="lg:col-span-7 space-y-6">

            <div className="space-y-3">
              <span className="inline-flex text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--color-accent)]">
                Exam Voucher Explained
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-light text-[var(--color-ink)] tracking-tight">
                What Is an <span className="text-[var(--color-accent)]">Exam Voucher?</span>
              </h2>
              <p className="text-[var(--color-ink-muted)] font-normal text-base sm:text-lg leading-relaxed">
                An exam voucher is an official prepaid digital discount code issued by institutional test organizers (Pearson, ETS, Duolingo). Instead of paying full price on credit cards, students enter an Apex Voucher code to receive instant savings.
              </p>
            </div>

            {/* Small Information Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {explainerCards.map((card, idx) => {
                const IconComp = card.icon;
                return (
                  <div key={idx} className="p-4 rounded-2xl bg-[var(--color-surface-raised)] border border-[var(--color-line)] space-y-2">
                    <div className="flex items-center gap-2 font-heading font-medium text-[var(--color-ink)] text-sm">
                      <div className="w-7 h-7 rounded-lg bg-[var(--color-accent)]/[0.08] text-[var(--color-accent)] flex items-center justify-center">
                        <IconComp className="w-4 h-4" />
                      </div>
                      <span>{card.title}</span>
                    </div>
                    <p
                      className="text-xs text-[var(--color-ink-muted)] font-normal leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: card.desc }}
                    />
                  </div>
                );
              })}
            </div>

            <div className="pt-2">
              <Button onClick={() => setActiveTab('shop')} variant="primary" size="md">
                <span>Browse Exam Vouchers</span>
              </Button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
