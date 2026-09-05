import type { Product, GuideScreenshot } from './types';

/**
 * Purchase-guide resolver. Mirrors redemption-guides.ts: the content is
 * DATA-DRIVEN and product-specific —
 *
 *   1. product.purchaseGuide (admin CMS) — structured steps + screenshots
 *   2. generic default steps below        — used only when no guide is configured
 *
 * The default steps are a display fallback, never fabricated product-specific
 * instructions — they only reference the product name.
 */

export interface PurchaseGuideStep {
  title: string;
  description: string;
  screenshot?: GuideScreenshot;
  ctaText?: string;
  ctaUrl?: string;
}

export interface ResolvedPurchaseGuide {
  /** 'structured' = admin CMS, 'default' = generic fallback steps. */
  source: 'structured' | 'default';
  eyebrow: string;
  title: string;
  description: string;
  steps: PurchaseGuideStep[];
}

const cleanSteps = (product: Partial<Product>) =>
  (product.purchaseGuide?.steps || []).filter(
    (s) => (s?.title && s.title.trim()) || (s?.description && s.description.trim()),
  );

/** True when the product carries an admin-configured, enabled purchase guide with ≥1 real step. */
export const hasStructuredPurchaseGuide = (product: Partial<Product> = {}): boolean =>
  !!product.purchaseGuide?.enabled && cleanSteps(product).length > 0;

const defaultSteps = (product: Partial<Product>): PurchaseGuideStep[] => [
  { title: 'Choose Your Voucher', description: `Select the ${product.name || 'voucher'} and click "Buy Now" from the voucher page.` },
  { title: 'Review Your Order', description: 'Check the exam/product, quantity, price, discount, validity and delivery method before proceeding.' },
  { title: 'Complete Payment', description: 'Pay securely via UPI / Card / NetBanking through our encrypted Razorpay checkout.' },
  { title: 'Receive Your Voucher', description: 'Your voucher will be delivered to your registered email after successful payment.' },
];

/**
 * Resolve the complete "How to Purchase" guide for a product: metadata +
 * ordered steps + source. Falls back to generic default steps when the
 * product has no enabled, non-empty purchase guide configured.
 */
export const getPurchaseGuide = (product: Partial<Product> = {}): ResolvedPurchaseGuide => {
  if (hasStructuredPurchaseGuide(product)) {
    const g = product.purchaseGuide!;
    return {
      source: 'structured',
      eyebrow: g.eyebrow?.trim() || 'Buying Guide',
      title: g.title?.trim() || 'How to Purchase from Apex Vouchers',
      description: g.description?.trim() || '',
      steps: cleanSteps(product).map((s, i) => ({
        title: s.title?.trim() || `Step ${i + 1}`,
        description: s.description?.trim() || '',
        screenshot: s.screenshot?.url ? s.screenshot : undefined,
        ctaText: s.ctaText?.trim() || undefined,
        ctaUrl: s.ctaUrl?.trim() || undefined,
      })),
    };
  }

  return {
    source: 'default',
    eyebrow: 'Buying Guide',
    title: 'How to Purchase from Apex Vouchers',
    description: 'A simple, secure checkout — from selection to your inbox.',
    steps: defaultSteps(product),
  };
};
