export const countWords = (text) => {
  if (!text) return 0;
  return String(text).trim().split(/\s+/).filter(Boolean).length;
};

export const stripHtml = (html) => {
  if (!html) return '';
  return String(html).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
};

const containsKeyword = (text, keyword) => {
  if (!text || !keyword) return false;
  const t = String(text).toLowerCase();
  const k = String(keyword).toLowerCase().trim();
  if (!k) return false;
  return t.includes(k);
};

const countKeywordOccurrences = (text, keyword) => {
  if (!text || !keyword) return 0;
  const t = String(text).toLowerCase();
  const k = String(keyword).toLowerCase().trim();
  if (!k) return 0;
  const regex = new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
  const matches = t.match(regex);
  return matches ? matches.length : 0;
};

export const analyzeSEO = (params) => {
  const {
    productName = '',
    seoTitle = '',
    metaDescription = '',
    slug = '',
    focusKeyword = '',
    secondaryKeywords = [],
    description = '',
    richDescription = '',
    canonicalUrl = '',
    productImage = '',
    imageAltText = '',
    ogTitle = '',
    ogDescription = '',
    ogImage = '',
    noindex = false,
    inStock = true,
    relatedProducts = [],
    faqs = [],
  } = params || {};

  const issues = [];
  const warnings = [];
  const successes = [];
  const checks = [];

  let basicMetadataScore = 0;
  let contentScore = 0;
  let urlScore = 0;
  let imagesScore = 0;
  let internalLinksScore = 0;
  let technicalScore = 0;

  const totalDescription = `${description || ''} ${stripHtml(richDescription || '')}`.trim();
  const descriptionWordCount = countWords(totalDescription);
  const headingMatches = (stripHtml(richDescription || '').match(/<h[1-6][^>]*>/gi) || []).length;

  if (seoTitle && seoTitle.trim().length > 0) {
    basicMetadataScore += 15;
    successes.push('SEO title is present');
    checks.push({ key: 'seoTitlePresent', status: 'good', label: 'SEO title is present' });
  } else {
    issues.push('Missing SEO title');
    checks.push({ key: 'seoTitlePresent', status: 'bad', label: 'Missing SEO title' });
  }

  if (seoTitle && seoTitle.trim().length >= 30 && seoTitle.trim().length <= 70) {
    basicMetadataScore += 10;
    successes.push(`SEO title length is good (${seoTitle.trim().length} chars)`);
    checks.push({ key: 'seoTitleLength', status: 'good', label: `SEO title length is good (${seoTitle.trim().length} chars)` });
  } else if (seoTitle && seoTitle.trim().length > 0) {
    warnings.push(`SEO title is ${seoTitle.trim().length} chars. Consider 30-70 chars.`);
    basicMetadataScore += 4;
    checks.push({ key: 'seoTitleLength', status: 'warn', label: `SEO title is ${seoTitle.trim().length} chars. Aim for 30-70.` });
  } else {
    checks.push({ key: 'seoTitleLength', status: 'bad', label: 'SEO title missing' });
  }

  if (metaDescription && metaDescription.trim().length > 0) {
    basicMetadataScore += 10;
    successes.push('Meta description is present');
    checks.push({ key: 'metaDescPresent', status: 'good', label: 'Meta description is present' });
  } else {
    issues.push('Missing meta description');
    checks.push({ key: 'metaDescPresent', status: 'bad', label: 'Missing meta description' });
  }

  if (metaDescription && metaDescription.trim().length >= 80 && metaDescription.trim().length <= 160) {
    basicMetadataScore += 8;
    successes.push(`Meta description length is good (${metaDescription.trim().length} chars)`);
    checks.push({ key: 'metaDescLength', status: 'good', label: `Meta description length is good (${metaDescription.trim().length} chars)` });
  } else if (metaDescription && metaDescription.trim().length > 0) {
    warnings.push(`Meta description is ${metaDescription.trim().length} chars. Consider 80-160 chars.`);
    basicMetadataScore += 3;
    checks.push({ key: 'metaDescLength', status: 'warn', label: `Meta description is ${metaDescription.trim().length} chars. Aim for 80-160.` });
  } else {
    checks.push({ key: 'metaDescLength', status: 'bad', label: 'Meta description missing' });
  }

  if (canonicalUrl || slug) {
    basicMetadataScore += 7;
    successes.push('Canonical URL configured or auto-generatable');
    checks.push({ key: 'canonical', status: 'good', label: 'Canonical URL configured or auto-generatable' });
  } else {
    checks.push({ key: 'canonical', status: 'warn', label: 'Canonical not explicitly set' });
  }

  basicMetadataScore = Math.min(basicMetadataScore, 50);

  if (totalDescription && descriptionWordCount > 0) {
    contentScore += 10;
    successes.push('Product description exists');
    checks.push({ key: 'descPresent', status: 'good', label: 'Product description exists' });
  } else {
    issues.push('No product description');
    checks.push({ key: 'descPresent', status: 'bad', label: 'No product description' });
  }

  if (descriptionWordCount >= 100) {
    contentScore += 10;
    successes.push(`Description has sufficient depth (${descriptionWordCount} words)`);
    checks.push({ key: 'descDepth', status: 'good', label: `Description has ${descriptionWordCount} words — good depth` });
  } else if (descriptionWordCount >= 30) {
    contentScore += 4;
    warnings.push(`Description is relatively short (${descriptionWordCount} words). Consider adding more detail.`);
    checks.push({ key: 'descDepth', status: 'warn', label: `Description is thin (${descriptionWordCount} words). Add more detail.` });
  } else if (descriptionWordCount > 0) {
    contentScore += 1;
    issues.push(`Product page may have thin content (${descriptionWordCount} words). Consider adding useful information about the voucher, exam, validity, purchase process and FAQs.`);
    checks.push({ key: 'descDepth', status: 'bad', label: `Thin content — only ${descriptionWordCount} words.` });
  }

  if (headingMatches >= 2) {
    contentScore += 6;
    successes.push(`Good heading structure detected (${headingMatches} headings)`);
    checks.push({ key: 'headings', status: 'good', label: `Good heading structure (${headingMatches} H2/H3 tags)` });
  } else if (headingMatches === 1) {
    contentScore += 2;
    warnings.push('Consider adding more H2/H3 headings to structure content.');
    checks.push({ key: 'headings', status: 'warn', label: 'Limited heading structure. Add more H2/H3.' });
  } else {
    checks.push({ key: 'headings', status: 'warn', label: 'Add H2/H3 headings to structure long-form content.' });
  }

  if (faqs && faqs.length > 0) {
    contentScore += 4;
    successes.push(`FAQ section present (${faqs.length} FAQs)`);
    checks.push({ key: 'faqs', status: 'good', label: `FAQ section with ${faqs.length} items` });
  } else {
    warnings.push('Consider adding an FAQ section');
    checks.push({ key: 'faqs', status: 'warn', label: 'Consider adding an FAQ section' });
  }

  contentScore = Math.min(contentScore, 30);

  if (slug && slug.trim().length > 0) {
    urlScore += 5;
    successes.push('URL slug is present');
    checks.push({ key: 'slugPresent', status: 'good', label: 'URL slug is present' });
  } else {
    issues.push('Missing URL slug');
    checks.push({ key: 'slugPresent', status: 'bad', label: 'Missing URL slug' });
  }

  if (slug && !/\s/.test(slug) && slug === slug.toLowerCase()) {
    urlScore += 5;
    successes.push('URL slug is SEO-friendly (lowercase, no spaces)');
    checks.push({ key: 'slugFormat', status: 'good', label: 'Slug is SEO-friendly (lowercase, hyphenated)' });
  } else if (slug) {
    warnings.push('Slug should be lowercase and hyphen-separated');
    checks.push({ key: 'slugFormat', status: 'warn', label: 'Normalize slug to lowercase, hyphen-separated words' });
  } else {
    checks.push({ key: 'slugFormat', status: 'bad', label: 'Slug missing' });
  }

  if (slug && slug.length <= 80 && slug.length >= 5) {
    urlScore += 5;
    checks.push({ key: 'slugLength', status: 'good', label: `Slug length is reasonable (${slug.length} chars)` });
  } else if (slug) {
    urlScore += 2;
    warnings.push(`Slug length of ${slug.length} chars — aim for a concise, descriptive slug.`);
    checks.push({ key: 'slugLength', status: 'warn', label: `Slug length of ${slug.length} chars — consider making it concise` });
  }

  urlScore = Math.min(urlScore, 15);

  if (productImage) {
    imagesScore += 5;
    successes.push('Product image is present');
    checks.push({ key: 'imagePresent', status: 'good', label: 'Product image is present' });
  } else {
    issues.push('No product image set');
    checks.push({ key: 'imagePresent', status: 'bad', label: 'No product image set' });
  }

  if (imageAltText && imageAltText.trim().length > 0) {
    imagesScore += 6;
    successes.push('Image ALT text is present');
    checks.push({ key: 'imageAlt', status: 'good', label: 'Image ALT text is present' });
  } else {
    warnings.push('Missing image ALT text — describe the image naturally for accessibility and SEO');
    checks.push({ key: 'imageAlt', status: 'bad', label: 'Missing image ALT text' });
  }

  if (imageAltText && imageAltText.trim().length >= 5 && imageAltText.trim().length <= 125) {
    imagesScore += 4;
    checks.push({ key: 'imageAltLength', status: 'good', label: `Image ALT text is descriptive (${imageAltText.trim().length} chars)` });
  } else if (imageAltText) {
    imagesScore += 1;
    checks.push({ key: 'imageAltLength', status: 'warn', label: 'Image ALT text could be more descriptive' });
  }

  imagesScore = Math.min(imagesScore, 15);

  if (relatedProducts && relatedProducts.length > 0) {
    internalLinksScore += 6;
    successes.push(`Related products linked (${relatedProducts.length} items)`);
    checks.push({ key: 'related', status: 'good', label: `Internal linking: ${relatedProducts.length} related products` });
  } else {
    warnings.push('Add related voucher/product links to improve internal linking');
    checks.push({ key: 'related', status: 'warn', label: 'Consider adding related exam vouchers for internal linking' });
  }

  internalLinksScore = Math.min(internalLinksScore, 10);

  if (!noindex) {
    technicalScore += 8;
    successes.push('Page is indexable');
    checks.push({ key: 'indexable', status: 'good', label: 'Page is indexable (noindex not set)' });
  } else {
    issues.push('Page is set to NOINDEX — it will not appear in search results.');
    checks.push({ key: 'indexable', status: 'bad', label: 'Page is set to NOINDEX' });
  }

  if (canonicalUrl || slug) {
    technicalScore += 4;
    checks.push({ key: 'canonicalTech', status: 'good', label: 'Canonical URL will be generated' });
  }

  if (ogImage || productImage) {
    technicalScore += 3;
    checks.push({ key: 'ogImage', status: 'good', label: 'Open Graph image available for social shares' });
  } else {
    checks.push({ key: 'ogImage', status: 'warn', label: 'Set an OG image for better social sharing' });
  }

  technicalScore = Math.min(technicalScore, 15);

  let keywordChecks = 0;
  let keywordTotal = 7;

  if (focusKeyword && containsKeyword(seoTitle, focusKeyword)) {
    keywordChecks += 1;
    successes.push(`Focus keyword "${focusKeyword}" appears in SEO title`);
    checks.push({ key: 'kwTitle', status: 'good', label: `Focus keyword appears in SEO title` });
  } else if (focusKeyword) {
    warnings.push(`Add focus keyword "${focusKeyword}" to SEO title naturally`);
    checks.push({ key: 'kwTitle', status: 'warn', label: `Focus keyword missing from SEO title` });
  }

  if (focusKeyword && containsKeyword(metaDescription, focusKeyword)) {
    keywordChecks += 1;
    successes.push(`Focus keyword appears in meta description`);
    checks.push({ key: 'kwMeta', status: 'good', label: `Focus keyword appears in meta description` });
  } else if (focusKeyword) {
    checks.push({ key: 'kwMeta', status: 'warn', label: `Consider adding focus keyword to meta description` });
  }

  if (focusKeyword && containsKeyword(productName, focusKeyword)) {
    keywordChecks += 1;
    successes.push(`Focus keyword appears in product title`);
    checks.push({ key: 'kwProductName', status: 'good', label: `Focus keyword appears in product name` });
  } else if (focusKeyword) {
    checks.push({ key: 'kwProductName', status: 'warn', label: `Focus keyword not in product name (if appropriate)` });
  }

  if (focusKeyword && containsKeyword(slug, focusKeyword)) {
    keywordChecks += 1;
    successes.push(`Focus keyword appears in URL slug`);
    checks.push({ key: 'kwSlug', status: 'good', label: `Focus keyword appears in URL slug` });
  } else if (focusKeyword) {
    checks.push({ key: 'kwSlug', status: 'warn', label: `Consider including focus keyword in URL slug` });
  }

  if (focusKeyword && containsKeyword(totalDescription, focusKeyword)) {
    keywordChecks += 1;
    successes.push(`Focus keyword appears in product description`);
    checks.push({ key: 'kwDesc', status: 'good', label: `Focus keyword appears in description` });
  } else if (focusKeyword) {
    warnings.push(`Add focus keyword "${focusKeyword}" naturally to the main description content`);
    checks.push({ key: 'kwDesc', status: 'warn', label: `Focus keyword missing from main description` });
  }

  if (focusKeyword && containsKeyword(imageAltText, focusKeyword)) {
    keywordChecks += 1;
    successes.push(`Focus keyword appears in image ALT text`);
    checks.push({ key: 'kwAlt', status: 'good', label: `Focus keyword naturally in image ALT` });
  } else if (focusKeyword) {
    checks.push({ key: 'kwAlt', status: 'warn', label: `Consider natural keyword use in image ALT (if appropriate)` });
  }

  if (focusKeyword && totalDescription) {
    const first100 = stripHtml(richDescription || description || '').slice(0, 300);
    if (containsKeyword(first100, focusKeyword)) {
      keywordChecks += 1;
      successes.push(`Focus keyword appears in introductory content`);
      checks.push({ key: 'kwIntro', status: 'good', label: `Focus keyword appears in the intro/first paragraph` });
    } else {
      checks.push({ key: 'kwIntro', status: 'warn', label: `Consider placing focus keyword early in the content` });
    }
  } else if (focusKeyword) {
    checks.push({ key: 'kwIntro', status: 'warn', label: `Add descriptive intro content with the focus keyword` });
  }

  let keywordScore = 0;
  if (focusKeyword) {
    keywordScore = Math.round((keywordChecks / keywordTotal) * 20);
  }

  if (focusKeyword && descriptionWordCount > 50) {
    const occurrences = countKeywordOccurrences(totalDescription, focusKeyword);
    const density = descriptionWordCount > 0 ? (occurrences * String(focusKeyword).split(/\s+/).length / descriptionWordCount) * 100 : 0;
    if (density > 5) {
      warnings.push(`⚠ Keyword appears unusually frequently. Use the keyword naturally and focus on helpful content.`);
      checks.push({ key: 'kwDensity', status: 'warn', label: `Keyword density appears high — use naturally, avoid stuffing` });
    } else {
      checks.push({ key: 'kwDensity', status: 'good', label: `Keyword usage appears natural` });
    }
  }

  const rawScore = basicMetadataScore + contentScore + urlScore + imagesScore + internalLinksScore + technicalScore + keywordScore;
  const score = Math.max(0, Math.min(100, Math.round(rawScore)));

  let grade = 'Needs Improvement';
  let gradeColor = 'red';
  if (score >= 90) {
    grade = 'Excellent';
    gradeColor = 'green';
  } else if (score >= 75) {
    grade = 'Good';
    gradeColor = 'green';
  } else if (score >= 60) {
    grade = 'Okay';
    gradeColor = 'yellow';
  } else if (score >= 40) {
    grade = 'Needs Improvement';
    gradeColor = 'yellow';
  } else {
    grade = 'Poor';
    gradeColor = 'red';
  }

  return {
    score,
    grade,
    gradeColor,
    breakdown: {
      basicMetadata: Math.min(basicMetadataScore, 50),
      content: Math.min(contentScore, 30),
      url: Math.min(urlScore, 15),
      images: Math.min(imagesScore, 15),
      internalLinks: Math.min(internalLinksScore, 10),
      technical: Math.min(technicalScore, 15),
      keyword: keywordScore,
    },
    issues,
    warnings,
    successes,
    checks,
    metrics: {
      descriptionWordCount,
      headingCount: headingMatches,
      seoTitleLength: seoTitle ? seoTitle.trim().length : 0,
      metaDescriptionLength: metaDescription ? metaDescription.trim().length : 0,
      slugLength: slug ? slug.length : 0,
      faqCount: faqs ? faqs.length : 0,
      relatedProductsCount: relatedProducts ? relatedProducts.length : 0,
    },
    disclaimer: 'Apex SEO Score is an internal optimization checklist. It is not a Google ranking score.',
  };
};

export const sanitizeRichText = (html) => {
  if (!html) return '';
  const allowedTags = new Set(['h2', 'h3', 'h4', 'p', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li', 'a', 'br', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'span', 'div']);
  const allowedAttrs = {
    a: ['href', 'title', 'target', 'rel'],
    td: ['colspan', 'rowspan'],
    th: ['colspan', 'rowspan'],
  };
  let sanitized = String(html);
  sanitized = sanitized.replace(/<script[\s\S]*?<\/script>/gi, '');
  sanitized = sanitized.replace(/<style[\s\S]*?<\/style>/gi, '');
  sanitized = sanitized.replace(/on\w+="[^"]*"/gi, '');
  sanitized = sanitized.replace(/on\w+='[^']*'/gi, '');
  sanitized = sanitized.replace(/javascript:/gi, '');
  return sanitized;
};

export const slugify = (text) => {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const detectDuplicates = (items, key) => {
  const map = new Map();
  const dups = [];
  for (const item of items) {
    const value = (item[key] || '').toString().trim().toLowerCase();
    if (!value) continue;
    if (!map.has(value)) {
      map.set(value, [item]);
    } else {
      map.get(value).push(item);
    }
  }
  for (const [, group] of map) {
    if (group.length > 1) {
      dups.push({ key, value: group[0][key], items: group });
    }
  }
  return dups;
};
