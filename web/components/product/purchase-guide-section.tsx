import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import SectionHeading from '@/components/ui/section-heading';
import { getPurchaseGuide } from '@/lib/purchase-guide';
import type { Product } from '@/lib/types';

const StepCta = ({ text, url }: { text?: string; url?: string }) => {
  if (!url) return null;
  return (
    <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline">
      <span>{text?.trim() || 'Learn more'}</span>
      <ExternalLink className="w-3.5 h-3.5" />
    </a>
  );
};

/**
 * Product-specific "How to Purchase" section. Fully data-driven — the
 * eyebrow, title, description, steps and screenshots all come from the
 * product's `purchaseGuide` (see lib/purchase-guide.ts for the resolution
 * order). A step with no screenshot renders as clean text: no placeholder,
 * no broken image. Mirrors RedemptionGuideSection's structure.
 *
 * Reused by the public product page and the admin editor's live preview.
 */
export function PurchaseGuideSection({
  product,
  headingAlign = 'center',
  previewMode = false,
}: {
  product: Product;
  headingAlign?: 'center' | 'left';
  previewMode?: boolean;
}) {
  const guide = getPurchaseGuide(product);
  if (guide.steps.length === 0) return null;

  return (
    <div className="space-y-10">
      <SectionHeading eyebrow={guide.eyebrow} title={guide.title} subtitle={guide.description || undefined} align={headingAlign} />

      <div className="space-y-10">
        {guide.steps.map((step, i) => {
          const shot = step.screenshot;
          const hasShot = !!shot?.url;
          const alt = shot?.alt?.trim() || `${step.title} — ${product.name} purchase step screenshot`;

          const textCol = (
            <div className={`space-y-2.5 ${hasShot && i % 2 === 1 ? 'md:order-2' : ''}`}>
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-accent/8 text-accent font-medium text-xs border border-accent/20">
                {i + 1}
              </span>
              <h3 className="font-heading font-medium text-lg text-ink">
                Step {i + 1} — {step.title}
              </h3>
              {step.description && (
                <p className="text-sm text-ink-muted font-normal leading-relaxed">{step.description}</p>
              )}
              <StepCta text={step.ctaText} url={step.ctaUrl} />
            </div>
          );

          if (!hasShot) {
            return <div key={i} className="max-w-3xl">{textCol}</div>;
          }

          return (
            <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-6 md:items-center">
              {textCol}
              <figure className={`m-0 ${i % 2 === 1 ? 'md:order-1' : ''}`}>
                <div className="overflow-hidden rounded-2xl border border-line bg-surface-raised">
                  <Image
                    src={shot!.url as string}
                    alt={alt}
                    width={shot?.width && shot.width > 0 ? shot.width : 1600}
                    height={shot?.height && shot.height > 0 ? shot.height : 900}
                    sizes="(max-width: 768px) 100vw, 640px"
                    className="w-full h-auto"
                    unoptimized={previewMode}
                  />
                </div>
                {shot?.caption && (
                  <figcaption className="mt-2 text-[11px] font-normal text-ink-muted text-center">{shot.caption}</figcaption>
                )}
              </figure>
            </div>
          );
        })}
      </div>
    </div>
  );
}
