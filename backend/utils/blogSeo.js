import { countWords, stripHtml, detectDuplicates } from './seo.js';

export const SEO_DISCLAIMER =
  'This recommendation may improve on-page SEO and search visibility. Search rankings are determined by search engines and cannot be guaranteed.';

const countH1 = (html) => (String(html || '').match(/<h1[^>]*>/gi) || []).length;
const countHeadings = (html, level) => (String(html || '').match(new RegExp(`<h${level}[^>]*>`, 'gi')) || []).length;

const extractLinks = (html) => {
  const matches = [...String(html || '').matchAll(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi)];
  return matches.map((m) => ({ href: m[1], text: stripHtml(m[2]) }));
};

const isInternalHref = (href) => {
  if (!href) return false;
  if (href.startsWith('/')) return true;
  return false;
};

const extractImages = (html) => {
  const matches = [...String(html || '').matchAll(/<img\s+[^>]*>/gi)];
  return matches.map((tag) => {
    const altMatch = tag[0].match(/alt=["']([^"']*)["']/i);
    return { tag: tag[0], alt: altMatch ? altMatch[1] : '' };
  });
};

/**
 * Blog-specific SEO Health Score: 100 pts split Technical(40) / Content(40) / Media(20).
 * This is an internal optimization diagnostic only — never a ranking guarantee.
 */
export const analyzeBlogSEO = (post) => {
  const issues = [];
  const warnings = [];
  const successes = [];
  const checks = [];
  const recommendations = [];

  const seo = post.seo || {};
  const content = post.content || '';
  const plainContent = stripHtml(content);
  const wordCount = countWords(plainContent);
  const h1Count = countH1(content);
  const h2h3Count = countHeadings(content, 2) + countHeadings(content, 3);
  const links = extractLinks(content);
  const internalLinks = links.filter((l) => isInternalHref(l.href));
  const images = extractImages(content);
  const imagesWithAlt = images.filter((i) => i.alt && i.alt.trim().length > 0);

  let technical = 0;
  let contentScore = 0;
  let media = 0;

  // ── Technical (40) ──────────────────────────────────────────
  if (seo.title && seo.title.trim()) {
    technical += 8;
    successes.push('SEO title is present');
    checks.push({ key: 'seoTitle', status: 'good', label: 'SEO title is present' });
  } else {
    issues.push('Missing meta description');
    checks.push({ key: 'seoTitle', status: 'bad', label: 'Missing SEO title' });
    recommendations.push({ priority: 'high', text: 'Missing SEO title', fix: 'Add a concise, descriptive SEO title (30–70 characters).' });
  }
  if (seo.title && seo.title.trim().length >= 30 && seo.title.trim().length <= 70) {
    technical += 5;
    checks.push({ key: 'seoTitleLen', status: 'good', label: `SEO title length is good (${seo.title.trim().length} chars)` });
  } else if (seo.title) {
    technical += 2;
    warnings.push('SEO title length is outside the 30–70 char guidance range');
    checks.push({ key: 'seoTitleLen', status: 'warn', label: 'SEO title length outside 30–70 char guidance' });
  }

  if (seo.description && seo.description.trim()) {
    technical += 8;
    successes.push('Meta description is present');
    checks.push({ key: 'metaDesc', status: 'good', label: 'Meta description is present' });
  } else {
    issues.push('Missing meta description');
    checks.push({ key: 'metaDesc', status: 'bad', label: 'Missing meta description' });
    recommendations.push({ priority: 'high', text: 'Missing meta description', fix: "Add a concise description explaining the article's purpose." });
  }
  if (seo.description && seo.description.trim().length >= 80 && seo.description.trim().length <= 160) {
    technical += 5;
    checks.push({ key: 'metaDescLen', status: 'good', label: `Meta description length is good (${seo.description.trim().length} chars)` });
  } else if (seo.description) {
    technical += 2;
    warnings.push('Meta description length is outside the 80–160 char guidance range');
    checks.push({ key: 'metaDescLen', status: 'warn', label: 'Meta description length outside 80–160 char guidance' });
  }

  if (seo.canonicalUrl || post.slug) {
    technical += 4;
    checks.push({ key: 'canonical', status: 'good', label: 'Canonical URL configured or auto-generatable' });
  } else {
    checks.push({ key: 'canonical', status: 'warn', label: 'Canonical not explicitly set' });
  }

  if (!seo.noindex) {
    technical += 4;
    checks.push({ key: 'indexable', status: 'good', label: 'Page is indexable (noindex not set)' });
  } else {
    warnings.push('Page is set to NOINDEX — it will not appear in search results.');
    checks.push({ key: 'indexable', status: 'warn', label: 'Page is set to NOINDEX' });
  }

  if (post.slug && !/\s/.test(post.slug) && post.slug === post.slug.toLowerCase()) {
    technical += 3;
    checks.push({ key: 'slug', status: 'good', label: 'URL slug is SEO-friendly' });
  } else {
    checks.push({ key: 'slug', status: 'warn', label: 'Slug should be lowercase, hyphen-separated' });
  }

  if (h1Count === 1) {
    technical += 3;
    successes.push('Exactly one H1 heading');
    checks.push({ key: 'h1', status: 'good', label: 'Exactly one H1 heading' });
  } else if (h1Count === 0) {
    checks.push({ key: 'h1', status: 'warn', label: 'No H1 heading found' });
    recommendations.push({ priority: 'medium', text: 'No H1 heading in the article', fix: 'Add a single H1 heading (usually the title) at the top of the article.' });
  } else {
    issues.push(`Multiple H1 headings found (${h1Count}) — use only one H1 per page.`);
    checks.push({ key: 'h1', status: 'bad', label: `Multiple H1 headings found (${h1Count})` });
    recommendations.push({ priority: 'high', text: `${h1Count} H1 headings found`, fix: 'Keep only one H1 per article; demote extras to H2/H3.' });
  }

  // ── Content (40) ─────────────────────────────────────────────
  if (wordCount >= 600) {
    contentScore += 12;
    successes.push(`Good content depth (${wordCount} words)`);
    checks.push({ key: 'depth', status: 'good', label: `Good content depth (${wordCount} words)` });
  } else if (wordCount >= 250) {
    contentScore += 6;
    warnings.push(`Content is relatively short (${wordCount} words)`);
    checks.push({ key: 'depth', status: 'warn', label: `Content is thin (${wordCount} words)` });
    recommendations.push({ priority: 'medium', text: `Article is relatively short (${wordCount} words)`, fix: 'Expand with more detail, examples, or a dedicated section covering related sub-topics.' });
  } else {
    checks.push({ key: 'depth', status: 'bad', label: `Very thin content (${wordCount} words)` });
    recommendations.push({ priority: 'high', text: `Very thin content (${wordCount} words)`, fix: 'Add substantially more useful, original content.' });
  }

  if (h2h3Count >= 3) {
    contentScore += 8;
    successes.push(`Good heading structure (${h2h3Count} H2/H3 headings)`);
    checks.push({ key: 'headings', status: 'good', label: `Good heading structure (${h2h3Count} H2/H3)` });
  } else if (h2h3Count > 0) {
    contentScore += 4;
    checks.push({ key: 'headings', status: 'warn', label: `Limited heading structure (${h2h3Count} H2/H3)` });
    recommendations.push({ priority: 'medium', text: 'Limited heading structure', fix: 'Break the article into more H2/H3 sections for scannability.' });
  } else {
    checks.push({ key: 'headings', status: 'bad', label: 'No H2/H3 headings found' });
  }

  if (post.faqs && post.faqs.length > 0) {
    contentScore += 6;
    successes.push(`FAQ section present (${post.faqs.length} FAQs)`);
    checks.push({ key: 'faqs', status: 'good', label: `FAQ section with ${post.faqs.length} items` });
  } else {
    checks.push({ key: 'faqs', status: 'warn', label: 'No FAQ section' });
    recommendations.push({ priority: 'low', text: 'No FAQ section', fix: 'Consider adding 3–5 frequently asked questions relevant to this topic.' });
  }

  if (internalLinks.length >= 2) {
    contentScore += 8;
    successes.push(`Good internal linking (${internalLinks.length} internal links)`);
    checks.push({ key: 'internalLinks', status: 'good', label: `${internalLinks.length} internal links` });
  } else if (internalLinks.length === 1) {
    contentScore += 4;
    checks.push({ key: 'internalLinks', status: 'warn', label: 'Only 1 internal link' });
    recommendations.push({ priority: 'medium', text: 'Only 1 internal link', fix: 'Link to 2–3 relevant Apex Vouchers pages (related vouchers, policies, or guides).' });
  } else {
    checks.push({ key: 'internalLinks', status: 'bad', label: 'No internal links' });
    recommendations.push({ priority: 'medium', text: 'No internal links found', fix: 'Add internal links to relevant Apex Vouchers pages using the Internal Links tab.' });
  }

  const focusKeyword = (seo.focusKeyword || '').toLowerCase().trim();
  if (focusKeyword) {
    let kwHits = 0;
    if ((seo.title || '').toLowerCase().includes(focusKeyword)) kwHits++;
    if ((post.title || '').toLowerCase().includes(focusKeyword)) kwHits++;
    const intro = plainContent.slice(0, 300).toLowerCase();
    if (intro.includes(focusKeyword)) kwHits++;
    if ((seo.description || '').toLowerCase().includes(focusKeyword)) kwHits++;
    contentScore += Math.min(6, kwHits * 1.5);
    if (kwHits >= 3) {
      successes.push('Primary keyword appears naturally in the title and introduction.');
      checks.push({ key: 'keyword', status: 'good', label: 'Primary keyword appears naturally in the title and introduction.' });
    } else {
      checks.push({ key: 'keyword', status: 'warn', label: 'Primary keyword could appear more naturally in title/intro/meta description' });
      recommendations.push({ priority: 'low', text: 'Primary keyword underused', fix: 'Mention the primary keyword naturally in the title, intro paragraph and meta description.' });
    }
  }

  // ── Media (20) ───────────────────────────────────────────────
  if (post.coverImage) {
    media += 6;
    successes.push('Featured image is present');
    checks.push({ key: 'coverImage', status: 'good', label: 'Featured image is present' });
  } else {
    issues.push('No featured image set');
    checks.push({ key: 'coverImage', status: 'bad', label: 'No featured image set' });
    recommendations.push({ priority: 'medium', text: 'No featured image', fix: 'Upload a featured image — improves click-through from search and social shares.' });
  }

  if (post.coverImageAlt && post.coverImageAlt.trim()) {
    media += 8;
    successes.push('Featured image ALT text is present');
    checks.push({ key: 'coverAlt', status: 'good', label: 'Featured image ALT text is present' });
  } else if (post.coverImage) {
    checks.push({ key: 'coverAlt', status: 'bad', label: 'Featured image missing ALT text' });
    recommendations.push({ priority: 'low', text: 'Featured image missing ALT text', fix: 'Add a natural, descriptive ALT text for the featured image.' });
  }

  const totalImages = images.length + (post.coverImage ? 1 : 0);
  const altCoverage = images.length > 0 ? imagesWithAlt.length / images.length : 1;
  if (totalImages === 0) {
    checks.push({ key: 'imageAltCoverage', status: 'warn', label: 'No in-article images' });
  } else if (altCoverage === 1) {
    media += 6;
    checks.push({ key: 'imageAltCoverage', status: 'good', label: 'All in-article images have ALT text' });
  } else {
    const missing = images.length - imagesWithAlt.length;
    media += Math.round(6 * altCoverage);
    checks.push({ key: 'imageAltCoverage', status: 'warn', label: `${missing} image(s) missing ALT text` });
    recommendations.push({ priority: 'low', text: `Add ALT text to ${missing} image${missing === 1 ? '' : 's'}`, fix: 'Describe each image naturally for accessibility and SEO.' });
  }

  technical = Math.min(40, Math.round(technical));
  contentScore = Math.min(40, Math.round(contentScore));
  media = Math.min(20, Math.round(media));

  const score = Math.max(0, Math.min(100, technical + contentScore + media));
  let grade = 'Poor';
  if (score >= 90) grade = 'Excellent';
  else if (score >= 75) grade = 'Good';
  else if (score >= 60) grade = 'Okay';
  else if (score >= 40) grade = 'Needs Improvement';

  // Sort recommendations high -> medium -> low
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return {
    score,
    grade,
    breakdown: { technical, content: contentScore, media },
    issues,
    warnings,
    successes,
    checks,
    recommendations,
    metrics: {
      wordCount,
      h1Count,
      h2h3Count,
      internalLinksCount: internalLinks.length,
      imagesCount: images.length,
      imagesWithAltCount: imagesWithAlt.length,
      faqCount: post.faqs ? post.faqs.length : 0,
    },
    disclaimer: SEO_DISCLAIMER,
  };
};

/**
 * Section 26 safety warnings — surfaced, never silently auto-fixed.
 */
export const checkBlogSafetyWarnings = (post, allPosts = []) => {
  const warnings = [];
  const seo = post.seo || {};
  const others = allPosts.filter((p) => String(p._id) !== String(post._id));

  const dupTitles = detectDuplicates(
    [{ _id: post._id, title: seo.title || post.title }, ...others.map((p) => ({ _id: p._id, title: p.seo?.title || p.title }))],
    'title'
  );
  if (dupTitles.length > 0) warnings.push({ type: 'duplicate_title', text: 'This SEO title is duplicated on another post.' });

  const dupDesc = detectDuplicates(
    [{ _id: post._id, desc: seo.description }, ...others.map((p) => ({ _id: p._id, desc: p.seo?.description }))],
    'desc'
  );
  if (dupDesc.length > 0 && seo.description) warnings.push({ type: 'duplicate_meta', text: 'This meta description is duplicated on another post.' });

  const plainContent = stripHtml(post.content || '').toLowerCase();
  const focusKeyword = (seo.focusKeyword || '').toLowerCase().trim();
  if (focusKeyword && plainContent) {
    const words = plainContent.split(/\s+/).filter(Boolean);
    const kwWordCount = focusKeyword.split(/\s+/).length;
    const occurrences = (plainContent.match(new RegExp(focusKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    const density = words.length > 0 ? (occurrences * kwWordCount / words.length) * 100 : 0;
    if (density > 5) {
      warnings.push({ type: 'keyword_stuffing', text: 'Focus keyword appears unusually often — use it naturally and prioritize helpful content.' });
    }
  }

  const anchorCounts = {};
  const links = extractLinks(post.content || '');
  for (const l of links) {
    if (!isInternalHref(l.href)) continue;
    const text = l.text.toLowerCase().trim();
    if (!text) continue;
    anchorCounts[text] = (anchorCounts[text] || 0) + 1;
  }
  for (const [text, count] of Object.entries(anchorCounts)) {
    if (count >= 4) {
      warnings.push({ type: 'exact_match_anchor', text: `Anchor text "${text}" is repeated ${count} times — vary internal link anchor text.` });
    }
  }

  return warnings;
};
