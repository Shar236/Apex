# Blog system

Everything the Apex Vouchers blog needs lives in this folder. Open it first.

```
src/blogs/
├── index.js              public surface (re-exports pages, layout, lib, registry)
├── registry.js           slug → code-article component (the allow-list)
├── README.md             this file
│
├── pages/                route components, mounted in src/App.jsx
│   ├── BlogIndexPage.jsx     /blog        — listing, featured, search, categories
│   ├── BlogPostPage.jsx      /blog/:slug  — public article (fetch + SEO + JSON-LD)
│   └── BlogPreviewPage.jsx   /admin/blog-preview/:id — admin-only draft preview
│
├── layout/
│   ├── ArticleLayout.jsx     THE one shell: bg + container + breadcrumb + TOC sidebar
│   └── ArticleRenderer.jsx   picks code component vs CMS body, wraps in ArticleLayout
│
├── components/
│   ├── ArticleBody.jsx       the CMS post body (hero, prose, tags, bio, FAQ, CTA)
│   ├── FaqAccordion.jsx      shared by CMS body + code articles
│   ├── RelatedArticles.jsx   shared by CMS body + code articles
│   ├── TableOfContents.jsx   automatic H2/H3 TOC (used by both)
│   ├── ArticleFigure.jsx     responsive/lazy <figure> for code articles
│   ├── ArticleInfoBox.jsx · ScoreCards.jsx · ComparisonTable.jsx   in-article blocks
│   ├── BlogCard.jsx · BlogFeaturedCard.jsx · BlogCategoryFilter.jsx · BlogSearch.jsx
│   ├── RichTextEditor.jsx    the admin TipTap editor
│   └── index.js              barrel — import building blocks from here
│
├── admin/
│   └── BlogAdmin.jsx         the "Blog" tab inside AdminConsole
│
├── lib/
│   ├── blogApi.js            every blog HTTP call (admin + public)
│   └── articleImage.js       resolves a code article's image from post.images[]
│
├── articles/                one file per code-based article + README
│   ├── IeltsCanada2026.jsx · PteAcademicAustralia.jsx · PteTestsComparison.jsx
│
└── styles/
    ├── blog.css             CMS typography (.prose-blog), FAQ, .ca-toc-auto
    ├── article-shared.css   code-article base, scoped under .blog-article
    └── articles/<name>.css  per-article, scoped under .blog-<name>
```

## Two kinds of article, one system

| | Code article | CMS article |
|---|---|---|
| Body source | a React component in `articles/` | sanitized `content` HTML from the DB |
| `BlogPost.contentSource` | `"code"` **and** slug is in `registry.js` | `"cms"` (or `"code"` with no registered component) |
| Who edits it | a developer (+ CMS for metadata) | anyone, in **Admin → Blog** |
| Needs a deploy to publish | yes (new `.jsx`) | **no** |

**All metadata is always CMS-owned** for both kinds: title, slug, excerpt, category,
tags, author, reviewer, featured image, publish status/dates, SEO title, meta
description, canonical, OG/Twitter, FAQs, related posts. Code components receive
it as `{ post, relatedPosts }` props.

## Request flow

```
/blog/:slug
  → BlogPostPage           fetch GET /api/blog/:slug, apply <title>/meta/canonical/OG + JSON-LD
  → ArticleRenderer        contentSource === 'code' && registry[slug] ?
        code component (lazy, bespoke design)   :   <ArticleBody> (prose-blog)
  → ArticleLayout          same breadcrumb, same container, sticky TOC sidebar (CMS only)
```

Backend is unchanged and already unified: one `BlogPost` model, one
`controllers/blogController.js`, admin API `/api/admin/blogs/*`, public API
`/api/blog/*` (serves code + CMS identically).

## Automatic Table of Contents

`components/TableOfContents.jsx` scans a DOM scope for `<h2>`/`<h3>` after mount,
assigns stable unique `id`s, and renders anchor links (`href="#id"`), collapsible
on mobile, sticky on desktop.

- **CMS articles** — `ArticleLayout` renders it in the sidebar with
  `scope=".blog-cms-content"` (only when the content actually has H2/H3).
- **Code articles** — place `<TableOfContents scope=".ca-body" />` inline where
  the design wants it.

Never hand-build a TOC.

## How to create a CMS article (no developer needed)

**Admin → Blog → Create Article** → fill title, slug, category, content
(RichTextEditor), featured image (uploads to Cloudinary automatically), FAQs, SEO
→ **Save** → **Publish**. It appears at `/blog` and `/blog/:slug` immediately.
Unpublish hides it (kept in the DB); Delete asks for confirmation.

## How to add a code article

1. **CMS** — create the Blog post (metadata + SEO + FAQ). Set **Content Source →
   Code**.
2. **Component** — `articles/MyArticle.jsx`:
   ```jsx
   import { ArticleFigure, FaqAccordion, RelatedArticles, TableOfContents } from '../components';
   import '../styles/article-shared.css';
   import '../styles/articles/my-article.css';
   export default function MyArticle({ post, relatedPosts }) {
     return <article className="blog-article blog-my-article"> … </article>;
   }
   ```
3. **Styles** — `styles/articles/my-article.css`, every selector prefixed
   `.blog-my-article` (no bare `body`/`h2`/`img`).
4. **Images** — put files in `public/images/blogs/my-article/…` and reference by
   that path. `ArticleFigure` runs every `src` through `imageUrl()`
   (`src/lib/imageUrl.js`); after migration they serve from Cloudinary with
   `f_auto,q_auto` + responsive `srcSet` automatically:
   `cd backend && npm run migrate:images -- --upload --public-map`. Or upload the
   image in the editor's **In-Article Images** panel named with a key (`hero`,
   `my-article-chart`) and read it with
   `articleImage(post, 'hero', '/images/blogs/my-article/hero.webp')`.
5. **Register** — one line in `registry.js` (`codeBlogRegistry` + `codeBlogLabels`).

`lazy()` keeps each article in its own chunk — nothing here loads on `/blog`.

## Switching CMS ⇄ Code (URL & SEO unchanged)

- **CMS → Code** — register the component, then set Content Source = Code. No
  component yet ⇒ safe fallback to CMS.
- **Code → CMS** — set Content Source = CMS. Keep `content` filled as a fallback.

## Security

`registry.js` is a hard-coded allow-list. The DB stores only the string
`"cms"`/`"code"` — never a path or code. Nothing from the API resolves a module.
CMS `content` HTML is sanitized server-side (`sanitize-html`).
