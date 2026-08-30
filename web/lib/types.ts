export interface ProductSeo {
  title?: string;
  description?: string;
  slug?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  noindex?: boolean;
  nofollow?: boolean;
}

/** A selectable duration/plan variant of a product (e.g. APS Test: 1 Week / 1 Month). */
export interface DurationOption {
  key: '1-week' | '1-month' | '3-months' | string;
  label: string;
  sellingPrice: number;
  originalPrice: number;
  validityDays: number;
  enabled?: boolean;
}

/** The hydrated product shape returned by the backend (backend/controllers/productController.js applyAvailability). */
export interface Product {
  _id: string;
  id?: string;
  name: string;
  slug: string;
  brand?: string;
  provider?: string;
  category?: string;
  shortDescription?: string;
  description?: string;
  richDescription?: string;
  logo?: string;
  image?: string;
  originalPrice: number;
  sellingPrice: number;
  discountedPrice?: number;
  discountPercent?: number;
  savings?: number;
  comingSoon?: boolean;
  stockType?: 'LIMITED' | 'UNLIMITED';
  stockStatus?: string;
  inStock?: boolean;
  availableStock?: number | null;
  availability?: number | null;
  validityMonths?: number;
  validityDays?: number;
  validity?: string;
  deliveryType?: string;
  badge?: string;
  badgeEnabled?: boolean;
  badges?: string[];
  rating?: number;
  reviewsCount?: number;
  featured?: boolean;
  displayOrder?: number;
  active?: boolean;
  archived?: boolean;
  durationOptions?: DurationOption[];
  /** Selected duration variant (carried by the cart/checkout payload, not stored on the product). */
  selectedDuration?: DurationOption | null;
  faqs?: Array<{ question: string; answer: string }>;
  relatedProducts?: string[] | Product[];
  seo?: ProductSeo;
  inclusions?: string[];
  redemptionSteps?: string[];
  officialWebsiteUrl?: string;
  officialProductUrl?: string;
}
