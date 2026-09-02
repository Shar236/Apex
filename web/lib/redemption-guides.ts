import type { Product, RedemptionScreenshot } from './types';

/**
 * Redemption-guide resolver. The content is DATA-DRIVEN and product-specific:
 *
 *   1. product.redemptionGuide (admin CMS)  — structured steps + screenshots
 *   2. product.redemptionSteps (legacy)     — free-text steps, no screenshots
 *   3. provider-family fallback below        — generic-but-accurate steps
 *
 * There is deliberately NO `if (product.name === 'PTE')` logic anywhere — the
 * provider-family fallback (step 3) only ever applies when a product has no
 * configured guide at all, and its steps are generic guidance, never fabricated
 * product-specific instructions.
 */

export interface GuideStep {
  title: string;
  description: string;
  screenshot?: RedemptionScreenshot;
  importantNote?: string;
  videoUrl?: string;
}

export interface ResolvedGuide {
  /** 'structured' = admin CMS, 'legacy' = redemptionSteps[], 'provider' = fallback family. */
  source: 'structured' | 'legacy' | 'provider';
  providerLabel: string;
  officialUrl: string;
  buttonText: string;
  introduction: string;
  steps: GuideStep[];
  warnings: string[];
}

interface ProviderGuide {
  id: string;
  match: (p: Product) => boolean;
  providerLabel: string;
  officialUrl: string;
  steps: Array<{ title: string; description: string }>;
}

const PROVIDER_GUIDES: ProviderGuide[] = [
  {
    id: 'duolingo',
    match: (p) => /duolingo/i.test(`${p.provider} ${p.brand} ${p.name}`),
    providerLabel: 'Duolingo English Test',
    officialUrl: 'https://englishtest.duolingo.com',
    steps: [
      { title: 'Visit the official Duolingo English Test website', description: 'Open englishtest.duolingo.com in a new tab using the button below.' },
      { title: 'Log in or create your Duolingo account', description: 'Sign in with your existing account, or register with your email if this is your first test.' },
      { title: 'Start or continue your test purchase', description: 'Select "Take the test" and proceed to the payment step of the official checkout flow.' },
      { title: 'Enter your Apex voucher code', description: 'On the payment/checkout screen, look for a promo code or voucher field and enter your Apex code exactly as received.' },
      { title: 'Confirm your redemption', description: 'Apply the code so your payable amount updates, then confirm to schedule and unlock your test.' },
    ],
  },
  {
    id: 'pte',
    match: (p) => /pearson|\bpte\b/i.test(`${p.provider} ${p.brand} ${p.name} ${p.category}`),
    providerLabel: 'Pearson PTE',
    officialUrl: 'https://www.pearsonpte.com',
    steps: [
      { title: 'Visit the official Pearson PTE website', description: 'Open pearsonpte.com (mypte.pearsonpte.com for booking) in a new tab using the button below.' },
      { title: 'Log in or create your Pearson account', description: 'Sign in to your existing profile, or register with your details if this is your first PTE booking.' },
      { title: 'Select your test type, centre, date and time', description: 'Choose the exact PTE test (Academic, Core, or Academic UKVI) matching your Apex voucher, plus your preferred centre and slot.' },
      { title: 'Proceed to checkout and enter your voucher code', description: 'On the payment page, look for the "Voucher / Promo Code" field and paste your Apex code exactly as received.' },
      { title: 'Confirm your booking', description: 'Your payable amount should update to reflect the voucher. Confirm the booking to receive your official appointment confirmation.' },
    ],
  },
  {
    id: 'toefl',
    match: (p) => /toefl/i.test(`${p.provider} ${p.brand} ${p.name}`),
    providerLabel: 'TOEFL iBT by ETS',
    officialUrl: 'https://www.ets.org/toefl',
    steps: [
      { title: 'Visit the official ETS TOEFL website', description: 'Open ets.org/toefl in a new tab using the button below.' },
      { title: 'Log in or create your ETS account', description: 'Sign in to your existing ETS account, or register if this is your first TOEFL registration.' },
      { title: 'Select your test centre or Home Edition, date and time', description: 'Choose the TOEFL iBT format and slot matching your Apex voucher.' },
      { title: 'Proceed to checkout and enter your voucher code', description: 'On the payment step, enter your Apex voucher code in the applicable promo/payment field.' },
      { title: 'Confirm your registration', description: 'Complete the registration to receive your official ETS confirmation.' },
    ],
  },
  {
    id: 'gre',
    match: (p) => /\bgre\b/i.test(`${p.provider} ${p.brand} ${p.name}`),
    providerLabel: 'GRE by ETS',
    officialUrl: 'https://www.ets.org/gre',
    steps: [
      { title: 'Visit the official ETS GRE website', description: 'Open ets.org/gre in a new tab using the button below.' },
      { title: 'Log in or create your ETS account', description: 'Sign in to your existing ETS account, or register if this is your first GRE registration.' },
      { title: 'Select your test centre or At Home, date and time', description: 'Choose the GRE General Test format and slot matching your Apex voucher.' },
      { title: 'Proceed to checkout and enter your voucher code', description: 'On the payment step, enter your Apex voucher code in the applicable promo/payment field.' },
      { title: 'Confirm your registration', description: 'Complete the registration to receive your official ETS confirmation.' },
    ],
  },
  {
    id: 'ielts',
    match: (p) => /ielts/i.test(`${p.provider} ${p.brand} ${p.name}`),
    providerLabel: 'IELTS',
    officialUrl: 'https://www.ielts.org',
    steps: [
      { title: 'Visit the official IELTS website', description: 'Open ielts.org (or your local British Council / IDP portal) in a new tab using the button below.' },
      { title: 'Log in or create your account', description: 'Sign in to your existing profile, or register with your details if this is your first IELTS booking.' },
      { title: 'Select your test type, centre, date and time', description: 'Choose Academic or General Training, plus your preferred test centre and slot, matching your Apex voucher.' },
      { title: 'Proceed to checkout and enter your voucher code', description: 'On the payment page, enter your Apex voucher code in the applicable promo/payment field.' },
      { title: 'Confirm your booking', description: 'Complete the booking to receive your official test confirmation.' },
    ],
  },
];

const GENERIC_PROVIDER: Omit<ProviderGuide, 'match'> = {
  id: 'generic',
  providerLabel: 'the official provider',
  officialUrl: '',
  steps: [
    { title: 'Visit the official exam provider website', description: 'Use the "Visit Official Website" button on this page to open the official registration portal in a new tab.' },
    { title: 'Log in or create your account', description: 'Sign in to your existing profile, or register with your details if this is your first booking with this provider.' },
    { title: 'Select your exam/test and preferred date', description: 'Choose the exact test and slot matching your Apex voucher.' },
    { title: 'Proceed to checkout and enter your voucher code', description: 'On the payment step, look for a promo/voucher code field and enter your Apex code exactly as received.' },
    { title: 'Confirm your redemption', description: 'Your payable amount should update to reflect the voucher. Confirm to complete your booking.' },
  ],
};

const cleanSteps = (product: Partial<Product>) =>
  (product.redemptionGuide?.steps || []).filter(
    (s) => (s?.title && s.title.trim()) || (s?.description && s.description.trim()),
  );

/** True when the product carries an admin-configured, enabled redemption guide with ≥1 real step. */
export const hasStructuredGuide = (product: Partial<Product> = {}): boolean =>
  !!product.redemptionGuide?.enabled && cleanSteps(product).length > 0;

const providerFamily = (product: Partial<Product>) =>
  PROVIDER_GUIDES.find((g) => g.match(product as Product)) || GENERIC_PROVIDER;

/**
 * Resolve the complete guide for a product: metadata + ordered steps + source.
 * `officialUrl` / `providerLabel` / `buttonText` prefer the product's own admin
 * values, then its official links, then the provider-family default.
 */
export const getRedemptionGuide = (product: Partial<Product> = {}): ResolvedGuide => {
  const family = providerFamily(product);
  const officialLink =
    (product as { officialWebsiteUrl?: string }).officialWebsiteUrl ||
    (product as { officialProductUrl?: string }).officialProductUrl ||
    '';

  if (hasStructuredGuide(product)) {
    const g = product.redemptionGuide!;
    return {
      source: 'structured',
      providerLabel: g.providerLabel?.trim() || product.provider || product.brand || family.providerLabel,
      officialUrl: g.officialUrl?.trim() || officialLink || family.officialUrl || '',
      buttonText: g.buttonText?.trim() || '',
      introduction: g.introduction?.trim() || '',
      steps: cleanSteps(product).map((s, i) => ({
        title: s.title?.trim() || `Step ${i + 1}`,
        description: s.description?.trim() || '',
        screenshot: s.screenshot?.url ? s.screenshot : undefined,
        importantNote: s.importantNote?.trim() || undefined,
        videoUrl: s.videoUrl?.trim() || undefined,
      })),
      warnings: (product.redemptionGuide?.warnings || []).map((w) => w.trim()).filter(Boolean),
    };
  }

  const providerLabel = product.provider || product.brand || family.providerLabel;
  const officialUrl = officialLink || family.officialUrl || '';

  if (Array.isArray(product.redemptionSteps) && product.redemptionSteps.length > 0) {
    return {
      source: 'legacy',
      providerLabel,
      officialUrl,
      buttonText: '',
      introduction: '',
      steps: product.redemptionSteps.map((text, i) => ({ title: `Step ${i + 1}`, description: text })),
      warnings: [],
    };
  }

  return {
    source: 'provider',
    providerLabel,
    officialUrl,
    buttonText: '',
    introduction: '',
    steps: family.steps.map((s) => ({ ...s })),
    warnings: [],
  };
};

/** Ordered steps for the product (richer shape — carries screenshot / note / video when present). */
export const getRedemptionSteps = (product: Partial<Product> = {}): GuideStep[] =>
  getRedemptionGuide(product).steps;
