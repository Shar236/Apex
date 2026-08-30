# Images — `pte-tests-comparison-2026`

`frontend/src/blogs/articles/PteTestsComparison.jsx` references these files by exact
name. Until a file exists, `<ArticleFigure>` shows a labelled placeholder (the
ALT text) instead of a broken image, so the page still renders cleanly.

| File | Used for | Intrinsic size (matches JSX width/height) |
|------|----------|-------------------------------------------|
| `hero.webp` | Hero / LCP image (loaded eagerly) | 1200 × 630 |
| `pte-tests-comparison-chart.webp` | Master PTE tests comparison infographic | 1200 × 800 |
| `pte-decision-flowchart.webp` | PTE test selection decision flowchart | 1200 × 800 |

Guidelines:
- Prefer `.webp`; keep each file under ~150 KB.
- If you change an image's real dimensions, update the `width`/`height` props in
  the JSX too (they prevent layout shift).
- Update the `alt` text in the component if the image's content changes.
- For responsive variants add `hero-800.webp` etc. and pass `srcSet` / `sizes`
  to `<ArticleFigure>`.
