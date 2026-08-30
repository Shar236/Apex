import type { ComponentType } from 'react';
import { IeltsCanada2026 } from '@/components/blog/articles/ielts-canada-2026';
import { PteAcademicAustralia } from '@/components/blog/articles/pte-academic-australia';
import { PteTestsComparison } from '@/components/blog/articles/pte-tests-comparison';
import type { BlogPost } from './blog-types';

export interface CodeArticleProps {
  post: BlogPost;
  relatedPosts?: BlogPost[];
}

/**
 * Code-based article registry — the hard-coded allow-list. A post renders
 * from code only when BOTH are true: its `contentSource` is `"code"` (set in
 * the CMS Blog editor), and its slug is a key here. Nothing from the API
 * resolves a module — this map is the only place a code article is wired in.
 *
 * Ported from frontend/src/blogs/registry.js. Unlike the Vite app, no lazy()
 * is needed: these render on the server, so nothing here is sent to the
 * client bundle regardless of which branch runs.
 */
export const codeBlogRegistry: Record<string, ComponentType<CodeArticleProps>> = {
  'ielts-score-canada-8-7-7-7-rule-2026': IeltsCanada2026,
  'pte-tests-comparison-2026': PteTestsComparison,
  'pte-academic-vs-pte-core-comparison-2026': PteTestsComparison,
  'pte-tests-comparison': PteTestsComparison,
  'pte-academic-score-australia-pr-2026': PteAcademicAustralia,
  'pte-academic-score-australia-pr-university-cutoffs-2026': PteAcademicAustralia,
  'pte-academic-score-australia-pr': PteAcademicAustralia,
  'pte-academic-australia': PteAcademicAustralia,
};

export function getCodeArticle(slug?: string): ComponentType<CodeArticleProps> | null {
  if (!slug) return null;
  return Object.prototype.hasOwnProperty.call(codeBlogRegistry, slug) ? codeBlogRegistry[slug] : null;
}
