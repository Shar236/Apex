/**
 * Pure function over already-fetched Search Console query rows — no new API
 * calls. Buckets queries into actionable opportunity groups, in the same
 * {priority, text, fix} shape used by utils/blogSeo.js recommendations.
 */
export const computeSearchOpportunities = (queryRows = []) => {
  const opportunities = [];

  const pageOne = queryRows.filter((r) => r.position >= 4 && r.position <= 10);
  const nearPageOne = queryRows.filter((r) => r.position > 10 && r.position <= 20);

  for (const r of pageOne.slice(0, 10)) {
    opportunities.push({
      type: 'page_one_opportunity',
      priority: r.impressions >= 1000 ? 'high' : 'medium',
      query: r.key,
      position: Number(r.position.toFixed(1)),
      impressions: r.impressions,
      ctr: r.ctr,
      text: `"${r.key}" ranks at position ${r.position.toFixed(1)} — a page-one opportunity`,
      fix: 'Review the page title, meta description, content depth and internal links for this query.',
    });
  }

  for (const r of nearPageOne.slice(0, 10)) {
    opportunities.push({
      type: 'near_page_one',
      priority: 'medium',
      query: r.key,
      position: Number(r.position.toFixed(1)),
      impressions: r.impressions,
      ctr: r.ctr,
      text: `"${r.key}" ranks at position ${r.position.toFixed(1)} — near page-one`,
      fix: 'Strengthen content depth and internal linking to help this query climb toward page one.',
    });
  }

  const withImpressions = queryRows.filter((r) => r.impressions > 0);
  const avgCtr = withImpressions.length > 0 ? withImpressions.reduce((s, r) => s + r.ctr, 0) / withImpressions.length : 0;
  const impressionThreshold = 500;
  const highImpressionLowCtr = withImpressions.filter((r) => r.impressions >= impressionThreshold && r.ctr < avgCtr * 0.6);

  for (const r of highImpressionLowCtr.slice(0, 10)) {
    opportunities.push({
      type: 'high_impressions_low_ctr',
      priority: 'high',
      query: r.key,
      position: Number(r.position.toFixed(1)),
      impressions: r.impressions,
      ctr: r.ctr,
      text: `"${r.key}" gets ${r.impressions.toLocaleString()} impressions but only ${(r.ctr * 100).toFixed(2)}% CTR`,
      fix: 'Review the title and meta description for the ranking page — a more compelling snippet may lift CTR.',
    });
  }

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  opportunities.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  return opportunities;
};
