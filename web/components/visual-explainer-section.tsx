import Link from 'next/link';
import { Ticket, CheckCircle2, ShieldCheck, Info } from 'lucide-react';
import { ApexLogo } from '@/components/apex-logo';
import { Button } from '@/components/ui';

const EXPLAINER_CARDS = [
  { title: 'What you receive', desc: 'An official alphanumeric <span class="text-accent">discount voucher code</span> sent to your email.', icon: Ticket },
  { title: 'How to use it', desc: 'Simply paste the code into the <span class="text-ink">Voucher / Promo Code</span> box at checkout on the test portal.', icon: CheckCircle2 },
  { title: 'Where to redeem it', desc: 'Directly on official test sites (<span class="text-ink">mypte.pearsonpte.com</span>, <span class="text-ink">ets.org</span>, or <span class="text-ink">duolingo.com</span>).', icon: ShieldCheck },
  { title: 'Validity & Conditions', desc: 'Valid for <span class="text-accent">6 to 12 months</span>. 100% money-back guarantee if unredeemed within 7 days.', icon: Info },
];

export function VisualExplainerSection() {
  return (
    <section className="py-16 sm:py-24 bg-surface border-b border-line transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md bg-[#0B0D12] rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-white/10 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <ApexLogo className="h-6" whiteText />
                <span className="px-2.5 py-0.5 rounded-full bg-success/20 text-success text-[10px] font-medium">OFFICIAL PASS</span>
              </div>

              <div className="relative bg-accent text-white rounded-2xl p-5 shadow-lg border border-white/20 space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] uppercase font-medium tracking-widest text-white/90">Pearson PTE / ETS GRE</span>
                  <span className="text-xs font-medium bg-white text-accent px-2 py-0.5 rounded shadow-sm">SAVE ₹3,401</span>
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
                <p className="font-medium text-accent flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Direct Institutional Resell Credit
                </p>
                <p className="text-[11px] leading-relaxed">When applied on official test portals, the voucher code waives off the test booking fee instantly.</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <span className="inline-flex text-[11px] font-medium uppercase tracking-[0.14em] text-accent">Exam Voucher Explained</span>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-light text-ink tracking-tight">
                What Is an <span className="text-accent">Exam Voucher?</span>
              </h2>
              <p className="text-ink-muted font-normal text-base sm:text-lg leading-relaxed">
                An exam voucher is an official prepaid digital discount code issued by institutional test organizers (Pearson, ETS, Duolingo). Instead of paying full price on credit cards, students enter an Apex Voucher code to receive instant savings.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {EXPLAINER_CARDS.map((card) => {
                const IconComp = card.icon;
                return (
                  <div key={card.title} className="p-4 rounded-2xl bg-surface-raised border border-line space-y-2">
                    <div className="flex items-center gap-2 font-heading font-medium text-ink text-sm">
                      <div className="w-7 h-7 rounded-lg bg-accent/8 text-accent flex items-center justify-center">
                        <IconComp className="w-4 h-4" />
                      </div>
                      <span>{card.title}</span>
                    </div>
                    <p className="text-xs text-ink-muted font-normal leading-relaxed" dangerouslySetInnerHTML={{ __html: card.desc }} />
                  </div>
                );
              })}
            </div>

            <div className="pt-2">
              <Button as={Link} href="/exam-vouchers" variant="primary" size="md">
                <span>Browse Exam Vouchers</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
