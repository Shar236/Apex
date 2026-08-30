'use client';

import { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';

/**
 * Automatic Table of Contents. Scans the article body (the element matched by
 * `scope`) for H2/H3 headings at runtime, assigns stable unique ids to any
 * heading that lacks one, and renders a numbered, nested list — works
 * identically for code-based articles (scope e.g. ".ca-body") and CMS
 * articles (scope the content wrapper element).
 */
interface TocItem {
  id: string;
  text: string;
}
interface TocSection extends TocItem {
  children: TocItem[];
}

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'section';

const buildTocTree = (root: Element): TocSection[] => {
  const headings = Array.from(root.querySelectorAll('h2, h3')).filter((h) => !h.closest('header, [data-toc-ignore]'));
  const usedIds = new Set<string>();
  const tree: TocSection[] = [];
  let current: TocSection | null = null;

  headings.forEach((h) => {
    let id = h.id || slugify(h.textContent || '');
    while (usedIds.has(id)) {
      id = `${slugify(h.textContent || '')}-${usedIds.size + 1}`;
    }
    usedIds.add(id);
    if (h.id !== id) h.id = id;

    const item: TocItem = { id, text: (h.textContent || '').trim() };
    if (h.tagName === 'H2') {
      current = { ...item, children: [] };
      tree.push(current);
    } else if (h.tagName === 'H3' && current) {
      current.children.push(item);
    }
  });
  return tree;
};

const scrollToHeading = (e: React.MouseEvent, id: string) => {
  const el = document.getElementById(id);
  if (!el) return;
  e.preventDefault();
  const headerOffset = 92;
  const top = el.getBoundingClientRect().top + window.scrollY - headerOffset;
  window.scrollTo({ top, behavior: 'smooth' });
  history.replaceState(null, '', `#${id}`);
};

export function TableOfContents({ scope = '.ca-body', title = 'Table of Contents', numbered = true, className = '' }: { scope?: string; title?: string; numbered?: boolean; className?: string }) {
  const [tree, setTree] = useState<TocSection[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const root = document.querySelector(scope);
    if (!root) return undefined;
    const scan = () => setTree(buildTocTree(root));
    scan();
    const t = setTimeout(scan, 250);
    return () => clearTimeout(t);
  }, [scope]);

  useEffect(() => {
    setMobileOpen(false);
  }, [scope]);

  if (!tree.length) return null;

  return (
    <nav className={`ca-toc-auto ${className}`} aria-label="Table of contents">
      <button type="button" className="ca-toc-auto__toggle" aria-expanded={mobileOpen} onClick={() => setMobileOpen((v) => !v)}>
        <BookOpen className="w-4 h-4" aria-hidden="true" />
        <span>{title}</span>
        <span className="ca-toc-auto__chevron" aria-hidden="true">
          &rsaquo;
        </span>
      </button>

      <ol className={`ca-toc-auto__list ${mobileOpen ? 'is-open' : ''}`}>
        {tree.map((section, idx) => (
          <li key={section.id} className="ca-toc-auto__section">
            <a href={`#${section.id}`} onClick={(e) => scrollToHeading(e, section.id)} className="ca-toc-auto__link">
              {numbered ? <span className="ca-toc-auto__num">{String(idx + 1).padStart(2, '0')}</span> : null}
              <span>{section.text}</span>
            </a>
            {section.children.length > 0 && (
              <ol className="ca-toc-auto__sub">
                {section.children.map((child) => (
                  <li key={child.id}>
                    <a href={`#${child.id}`} onClick={(e) => scrollToHeading(e, child.id)} className="ca-toc-auto__link ca-toc-auto__link--sub">
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
