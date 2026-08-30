export interface BlogFaq {
  question: string;
  answer: string;
}

export interface BlogImage {
  url: string;
  filename?: string;
  publicId?: string;
  alt?: string;
}

export interface BlogSeo {
  title?: string;
  description?: string;
  focusKeyword?: string;
  secondaryKeywords?: string[];
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

export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  css?: string;
  coverImage?: string;
  coverImagePublicId?: string;
  coverImageAlt?: string;
  coverImageTitle?: string;
  coverImageCaption?: string;
  coverImageDescription?: string;
  images?: BlogImage[];
  author?: string;
  authorBio?: string;
  authorImage?: string;
  reviewer?: string;
  category: string;
  tags?: string[];
  featured?: boolean;
  faqs?: BlogFaq[];
  relatedPosts?: (string | BlogPost)[];
  seo?: BlogSeo;
  contentSource?: 'cms' | 'code';
  status?: 'draft' | 'scheduled' | 'published' | 'unpublished' | 'trash';
  readingTime?: number;
  viewsCount?: number;
  scheduledAt?: string | null;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BlogCategoryCount {
  name: string;
  count: number;
}

export interface StructuredDataSet {
  article: Record<string, unknown> | null;
  breadcrumb: Record<string, unknown> | null;
  faqPage: Record<string, unknown> | null;
}
