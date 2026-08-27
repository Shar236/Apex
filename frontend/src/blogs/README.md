# Code-based articles (hybrid layer)

An **optional** way to render a blog post's body from a hand-built React
component instead of the CMS rich-text content. Everything else about the post is
unchanged and still CMS-managed.

```
src/blogs/
  registry.js            slug → approved React component (the allow-list)
  CodeArticleLayout.jsx  shared page chrome (container + breadcrumb)
  articles/              one file per code article
  components/            reusable building blocks (add only when reused)
  styles/
    article-shared.css   base styles, scoped under .blog-article
    articles/<name>.css   per-article, scoped under .blog-<name>
```

## How it plugs in

`BlogPostPage` (and `BlogPreviewPage`) fetch the post from the existing public
blog API (`GET /api/blog/:slug`), apply SEO + structured data exactly as before,
then:

```
post.contentSource === 'code' && registry has post.slug
   → render <CodeArticleLayout><RegisteredComponent post relatedPosts/></CodeArticleLayout>
otherwise
   → render <BlogArticleView/>   (unchanged CMS renderer)
```

Same `/blog/:slug` URL, same canonical, same Article/Breadcrumb/FAQ schema, same
sitemap entry, same redirects, same view tracking — for both paths.

The article component receives `{ post, relatedPosts }`. It owns the body design;
it reuses the shared `FaqAccordion` and `RelatedArticles` (exported from
`components/BlogArticleView.jsx`) so FAQ + related look identical to CMS posts and
stay driven by CMS data.

## Add a new code article

1. **CMS** — create/keep the Blog post (title, slug, SEO, FAQ, related…). In the
   Blog editor set **Content Source → Code** and pick the component.
2. **Component** — `src/blogs/articles/MyArticle.jsx`:
   ```jsx
   import '../styles/article-shared.css';
   import '../styles/articles/my-article.css';
   export default function MyArticle({ post, relatedPosts }) {
     return <article className="blog-article blog-my-article"> … </article>;
   }
   ```
3. **Styles** — `src/blogs/styles/articles/my-article.css`, every selector
   prefixed `.blog-my-article` (no bare `body`/`h2`/`img`/`button`).
4. **Images** — `public/images/blogs/my-article/…`, referenced as
   `/images/blogs/my-article/hero.webp`.
5. **Register** — add one line to `registry.js`:
   ```js
   'my-article-slug': lazy(() => import('./articles/MyArticle.jsx')),
   ```
   and a label in `codeBlogLabels`.

`lazy()` keeps each article in its own chunk — nothing here loads on `/blog`.

## Switching CMS ⇄ Code (URL & SEO unchanged)

- **CMS → Code**: register a component for the slug, then set Content Source =
  Code. If no component is registered yet, the page safely falls back to CMS.
- **Code → CMS**: set Content Source = CMS. Make sure `content` is filled (the
  editor keeps it as a fallback while in Code mode). No redirect needed.

## Security

`registry.js` is a hard-coded allow-list. The database only stores the string
`"cms"` / `"code"` — never a path or code. Nothing from the API resolves a module.
