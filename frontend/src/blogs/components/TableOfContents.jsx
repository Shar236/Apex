import React, { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';

/**
 * Reusable, automatic Table of Contents for blog articles.
 *
 * HOW IT WORKS
 * ─────────────
 * Scans the article body (the element matched by `scope`) for H2/H3 headings
 * at runtime, assigns stable unique `id`s to any heading that lacks one, and
 * renders a numbered, nested list. There is no manual TOC to maintain — the
 * component derives everything from the actual heading structure, so it works
 * identically for:
 *
 *   - code-based React articles (scope e.g. ".ca-body")
 *   - CMS articles rendered through dangerouslySetInnerHTML
 *     (scope the content wrapper element)
 *
 * BEHAVIOUR NOTES
 * ───────────────
 * - H2 entries are numbered 01, 02, …; H3 entries nest under the previous H2.
 * - Existing heading ids are reused; new ids are slugified from the heading
 *   text and de-duplicated (never two identical ids in one article).
 * - Real `<a href="#id">` anchors + CSS smooth scroll — keyboard accessible,
 *   no JS click handlers required.
 * - H1, header text, CTA and unrelated headings are never included.
 *
 * USAGE
 * ─────
 *   import { TableOfContents } from '../components';
 *
 *   <div className="ca-body" ref={bodyRef}>
 *     <TableOfContents scope=".ca-body" />
 *     <h2>Section One</h2>
 *     ...
 *   </div>
 */
const slugify = (text) =>
  String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'section';

/**
 * Build the { h2, h3[] } tree from the DOM headings.
 * Headings inside <header> or inside an element marked [data-toc-ignore]
 * (e.g. CTA boxes) are excluded so the TOC only mirrors real article sections.
 */
const buildTocTree = (root) => {
  const headings = Array.from(root.querySelectorAll('h2, h3')).filter(
    (h) => !h.closest('header, [data-toc-ignore]')
  );
  const usedIds = new Set();
  const tree = [];
  let current = null;

  headings.forEach((h) => {
    // Reuse an existing id if present; otherwise generate one.
    let id = h.id || slugify(h.textContent);
    while (usedIds.has(id)) {
      id = `${slugify(h.textContent)}-${usedIds.size + 1}`;
    }
    usedIds.add(id);
    if (h.id !== id) h.id = id;

    const item = { id, text: h.textContent.trim() };
    if (h.tagName === 'H2') {
      current = { ...item, children: [] };
      tree.push(current);
    } else if (h.tagName === 'H3' && current) {
      current.children.push(item);
    }
  });
  return tree;
};

/**
 * Scroll to a heading with a sensible offset for the sticky site header.
 * Uses anchor links for a11y, with this handler to add smooth scroll + URL
 * hash without a full page jump.
 */
const scrollToHeading = (e, id) => {
  const el = document.getElementById(id);
  if (!el) return;
  e.preventDefault();
  const headerOffset = 92;
  const top = el.getBoundingClientRect().top + window.scrollY - headerOffset;
  window.scrollTo({ top, behavior: 'smooth' });
  history.replaceState(null, '', `#${id}`);
};

export default function TableOfContents({ scope = '.ca-body', title = 'Table of Contents', numbered = true, className = '' }) {
  const [tree, setTree] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const root =
      typeof scope === 'string'
        ? document.querySelector(scope)
        : scope && scope.current
        ? scope.current
        : null;
    if (!root) return undefined;

    // Headings may mount asynchronously (e.g. CMS content fetched by a parent).
    // Scan once on mount, then re-scan on a short rAF in case fonts/layout shifted.
    const scan = () => setTree(buildTocTree(root));
    scan();
    const t = setTimeout(scan, 250);
    return () => clearTimeout(t);
  }, [scope]);

  // Reset the mobile disclosure whenever the article/scope changes.
  useEffect(() => {
    setMobileOpen(false);
  }, [scope]);

  if (!tree.length) return null;

  return (
    <nav className={`ca-toc-auto ${className}`} aria-label="Table of contents">
      <button
        type="button"
        className="ca-toc-auto__toggle"
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen((v) => !v)}
      >
        <BookOpen className="w-4 h-4" aria-hidden="true" />
        <span>{title}</span>
        <span className="ca-toc-auto__chevron" aria-hidden="true">›</span>
      </button>

      <ol className={`ca-toc-auto__list ${mobileOpen ? 'is-open' : ''}`}>
        {tree.map((section, idx) => (
          <li key={section.id} className="ca-toc-auto__section">
            <a
              href={`#${section.id}`}
              onClick={(e) => scrollToHeading(e, section.id)}
              className="ca-toc-auto__link"
            >
              {numbered ? <span className="ca-toc-auto__num">{String(idx + 1).padStart(2, '0')}</span> : null}
              <span>{section.text}</span>
            </a>
            {section.children.length > 0 && (
              <ol className="ca-toc-auto__sub">
                {section.children.map((child) => (
                  <li key={child.id}>
                    <a
                      href={`#${child.id}`}
                      onClick={(e) => scrollToHeading(e, child.id)}
                      className="ca-toc-auto__link ca-toc-auto__link--sub"
                    >
                      <span>{child.text}</span>
                    </a>
                  </li>
                ))}
              </ol>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}