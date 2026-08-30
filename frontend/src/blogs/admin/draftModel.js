/** Blog editor draft shape + normalization between API post <-> editor draft. */

export const emptyDraft = () => ({
  title: '', slug: '', excerpt: '', content: '', css: '',
  coverImage: '', coverImagePublicId: '', coverImageAlt: '', coverImageTitle: '', coverImageCaption: '', coverImageDescription: '',
  images: [], author: 'Apex Vouchers', authorBio: '', authorImage: '', reviewer: '', reviewedAt: '',
  category: 'Exam Guide', tags: [], featured: false,
  contentSource: 'cms',
  faqs: [], relatedPosts: [],
  scheduledAt: null, publishedAt: null,
  seo: {
    title: '', description: '', focusKeyword: '', secondaryKeywords: [], canonicalUrl: '',
    ogTitle: '', ogDescription: '', ogImage: '', twitterTitle: '', twitterDescription: '', twitterImage: '',
    twitterCardType: 'summary_large_image', noindex: false, nofollow: false,
  },
});

export const toDraft = (post) => ({
  ...emptyDraft(),
  ...post,
  tags: post?.tags || [],
  images: (post?.images || []).map((i) => ({ ...i })),
  contentSource: post?.contentSource === 'code' ? 'code' : 'cms',
  faqs: (post?.faqs || []).map((f) => ({ question: f.question || '', answer: f.answer || '' })),
  relatedPosts: (post?.relatedPosts || []).map((r) => (typeof r === 'string' ? r : r._id)),
  seo: { ...emptyDraft().seo, ...(post?.seo || {}) },
});

/** Stable serialization for dirty-checking (ignores server-managed fields). */
export const serializeDraft = (draft) => {
  const { updatedAt, createdAt, __v, seoScore, seoScoreGrade, ...rest } = draft || {};
  return JSON.stringify(rest);
};
