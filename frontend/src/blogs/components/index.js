// Reusable building blocks for code-based articles.
// Add here only when a component is genuinely reused by more than one article.
export { default as ArticleFigure } from './ArticleFigure.jsx';
export { default as ArticleInfoBox } from './ArticleInfoBox.jsx';
export { default as ScoreCards } from './ScoreCards.jsx';
export { default as ComparisonTable } from './ComparisonTable.jsx';
export { default as TableOfContents } from './TableOfContents.jsx';

// FAQ + related-articles UI is shared with the CMS renderer — re-export so
// article files have a single import surface.
export { FaqAccordion, RelatedArticles } from '../../components/BlogArticleView.jsx';
