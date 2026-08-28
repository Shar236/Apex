/**
 * Public surface of the blog system. Everything blog-related lives under
 * src/blogs/ — see README.md.
 *
 *   pages/     route components (mounted in src/App.jsx)
 *   layout/    ArticleLayout (the one shell) + ArticleRenderer (code-vs-CMS)
 *   components/ in-article building blocks, CMS body, /blog listing pieces
 *   admin/     BlogAdmin (mounted in components/AdminConsole.jsx)
 *   lib/       blogApi (HTTP) + articleImage (CMS image lookup for code articles)
 *   articles/  the code-based React articles
 *   registry.js  slug → code component map
 *   styles/    blog.css + per-article css
 */
export { default as BlogIndexPage } from './pages/BlogIndexPage.jsx';
export { default as BlogPostPage } from './pages/BlogPostPage.jsx';
export { default as BlogPreviewPage } from './pages/BlogPreviewPage.jsx';
export { default as BlogAdmin } from './admin/BlogAdmin.jsx';

export { default as ArticleLayout } from './layout/ArticleLayout.jsx';
export { default as ArticleRenderer } from './layout/ArticleRenderer.jsx';

export { blogApi, publicBlogApi } from './lib/blogApi.js';
export { articleImage } from './lib/articleImage.js';
export {
  getCodeArticle,
  hasCodeArticle,
  listCodeArticles,
  codeBlogRegistry,
} from './registry.js';
