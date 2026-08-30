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
  faqs?: Array<{ question: string; answer: string }>;
  relatedProducts?: string[] | Product[];
  seo?: ProductSeo;
  inclusions?: string[];
  redemptionSteps?: string[];
  officialWebsiteUrl?: string;
  officialProductUrl?: string;
}
