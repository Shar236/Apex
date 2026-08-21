/**
 * Provider-specific redemption guide content.
 *
 * Matches a product to its exam provider family and returns a reusable set of
 * generic-but-accurate redemption steps for that provider's official portal.
 * A product's own admin-entered `redemptionSteps` (from the database) always
 * takes priority over this fallback content — see getRedemptionSteps().
 */

const PROVIDER_GUIDES = [
  {
    id: 'duolingo',
    match: (p) => /duolingo/i.test(`${p.provider} ${p.brand} ${p.name}`),
    providerLabel: 'Duolingo English Test',
    officialUrl: 'https://englishtest.duolingo.com',
    steps: [
      {
        title: 'Visit the official Duolingo English Test website',
        description: 'Open englishtest.duolingo.com in a new tab using the button below.',
      },
      {
        title: 'Log in or create your Duolingo account',
        description: 'Sign in with your existing account, or register with your email if this is your first test.',
      },
      {
        title: 'Start or continue your test purchase',
        description: 'Select "Take the test" and proceed to the payment step of the official checkout flow.',
      },
      {
        title: 'Enter your Apex voucher code',
        description: 'On the payment/checkout screen, look for a promo code or voucher field and enter your Apex code exactly as received.',
      },
      {
        title: 'Confirm your redemption',
        description: 'Apply the code so your payable amount updates, then confirm to schedule and unlock your test.',
      },
    ],
  },
  {
    id: 'pte',
    match: (p) => /pearson|\bpte\b/i.test(`${p.provider} ${p.brand} ${p.name} ${p.category}`),
    providerLabel: 'Pearson PTE',
    officialUrl: 'https://www.pearsonpte.com',
    steps: [
      {
        title: 'Visit the official Pearson PTE website',
        description: 'Open pearsonpte.com (mypte.pearsonpte.com for booking) in a new tab using the button below.',
      },
      {
        title: 'Log in or create your Pearson account',
        description: 'Sign in to your existing profile, or register with your details if this is your first PTE booking.',
      },
      {
        title: 'Select your test type, centre, date and time',
        description: 'Choose the exact PTE test (Academic, Core, or Academic UKVI) matching your Apex voucher, plus your preferred centre and slot.',
      },
      {
        title: 'Proceed to checkout and enter your voucher code',
        description: 'On the payment page, look for the "Voucher / Promo Code" field and paste your Apex code exactly as received.',
      },
      {
        title: 'Confirm your booking',
        description: 'Your payable amount should update to reflect the voucher. Confirm the booking to receive your official appointment confirmation.',
      },
    ],
  },
  {
    id: 'toefl',
    match: (p) => /toefl/i.test(`${p.provider} ${p.brand} ${p.name}`),
    providerLabel: 'TOEFL iBT by ETS',
    officialUrl: 'https://www.ets.org/toefl',
    steps: [
      {
        title: 'Visit the official ETS TOEFL website',
        description: 'Open ets.org/toefl in a new tab using the button below.',
      },
      {
        title: 'Log in or create your ETS account',
        description: 'Sign in to your existing ETS account, or register if this is your first TOEFL registration.',
      },
      {
        title: 'Select your test centre or Home Edition, date and time',
        description: 'Choose the TOEFL iBT format and slot matching your Apex voucher.',
      },
      {
        title: 'Proceed to checkout and enter your voucher code',
        description: 'On the payment step, enter your Apex voucher code in the applicable promo/payment field.',
      },
      {
        title: 'Confirm your registration',
        description: 'Complete the registration to receive your official ETS confirmation.',
      },
    ],
  },
  {
    id: 'gre',
    match: (p) => /\bgre\b/i.test(`${p.provider} ${p.brand} ${p.name}`),
    providerLabel: 'GRE by ETS',
    officialUrl: 'https://www.ets.org/gre',
    steps: [
      {
        title: 'Visit the official ETS GRE website',
        description: 'Open ets.org/gre in a new tab using the button below.',
      },
      {
        title: 'Log in or create your ETS account',
        description: 'Sign in to your existing ETS account, or register if this is your first GRE registration.',
      },
      {
        title: 'Select your test centre or At Home, date and time',
        description: 'Choose the GRE General Test format and slot matching your Apex voucher.',
      },
      {
        title: 'Proceed to checkout and enter your voucher code',
        description: 'On the payment step, enter your Apex voucher code in the applicable promo/payment field.',
      },
      {
        title: 'Confirm your registration',
        description: 'Complete the registration to receive your official ETS confirmation.',
      },
    ],
  },
  {
    id: 'ielts',
    match: (p) => /ielts/i.test(`${p.provider} ${p.brand} ${p.name}`),
    providerLabel: 'IELTS',
    officialUrl: 'https://www.ielts.org',
    steps: [
      {
        title: 'Visit the official IELTS website',
        description: 'Open ielts.org (or your local British Council / IDP portal) in a new tab using the button below.',
      },
      {
        title: 'Log in or create your account',
        description: 'Sign in to your existing profile, or register with your details if this is your first IELTS booking.',
      },
      {
        title: 'Select your test type, centre, date and time',
        description: 'Choose Academic or General Training, plus your preferred test centre and slot, matching your Apex voucher.',
      },
      {
        title: 'Proceed to checkout and enter your voucher code',
        description: 'On the payment page, enter your Apex voucher code in the applicable promo/payment field.',
      },
      {
        title: 'Confirm your booking',
        description: 'Complete the booking to receive your official test confirmation.',
      },
    ],
  },
];

const GENERIC_GUIDE = {
  id: 'generic',
  providerLabel: 'the official provider',
  officialUrl: '',
  steps: [
    {
      title: 'Visit the official exam provider website',
      description: 'Use the "Visit Official Website" button on this page to open the official registration portal in a new tab.',
    },
    {
      title: 'Log in or create your account',
      description: 'Sign in to your existing profile, or register with your details if this is your first booking with this provider.',
    },
    {
      title: 'Select your exam/test and preferred date',
      description: 'Choose the exact test and slot matching your Apex voucher.',
    },
    {
      title: 'Proceed to checkout and enter your voucher code',
      description: 'On the payment step, look for a promo/voucher code field and enter your Apex code exactly as received.',
    },
    {
      title: 'Confirm your redemption',
      description: 'Your payable amount should update to reflect the voucher. Confirm to complete your booking.',
    },
  ],
};

export const getRedemptionGuide = (product = {}) => {
  const found = PROVIDER_GUIDES.find((g) => g.match(product));
  const guide = found || GENERIC_GUIDE;
  const officialUrl = product.officialWebsiteUrl || product.officialProductUrl || guide.officialUrl || '';
  const providerLabel = product.provider || product.brand || guide.providerLabel;
  return { ...guide, officialUrl, providerLabel };
};

/**
 * Steps actually rendered on the redemption guide: prefer the product's own
 * admin-entered redemptionSteps (real data from the database) — only fall
 * back to the generic provider-family steps above when none exist yet.
 */
export const getRedemptionSteps = (product = {}) => {
  if (Array.isArray(product.redemptionSteps) && product.redemptionSteps.length > 0) {
    return product.redemptionSteps.map((text, i) => ({ title: `Step ${i + 1}`, description: text }));
  }
  return getRedemptionGuide(product).steps;
};
