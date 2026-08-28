// Building blocks for the blog. Import from here so article files and pages
// have a single import surface. Everything below lives inside blogs/ — no
// cross-directory re-exports.

// ── In-article building blocks (used by code articles) ──────────────────────
export { default as ArticleFigure } from './ArticleFigure.jsx';
export { default as ArticleInfoBox } from './ArticleInfoBox.jsx';
export { default as ScoreCards } from './ScoreCards.jsx';
export { default as ComparisonTable } from './ComparisonTable.jsx';
export { default as TableOfContents } from './TableOfContents.jsx';

// ── Shared by the CMS body and code articles ────────────────────────────────
export { default as FaqAccordion } from './FaqAccordion.jsx';
export { default as RelatedArticles } from './RelatedArticles.jsx';

// ── CMS body + /blog listing pieces ────────────────────────────────────────
export { default as ArticleBody } from './ArticleBody.jsx';
export { default as BlogCard } from './BlogCard.jsx';
export { default as BlogFeaturedCard } from './BlogFeaturedCard.jsx';
export { default as BlogCategoryFilter } from './BlogCategoryFilter.jsx';
export { default as BlogSearch } from './BlogSearch.jsx';
