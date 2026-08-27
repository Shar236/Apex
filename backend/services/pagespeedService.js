import { config } from '../config/index.js';

class PageSpeedApiError extends Error {
  constructor(message, code = 'PAGESPEED_ERROR') {
    super(message);
    this.code = code;
  }
}

const CATEGORIES = ['performance', 'accessibility', 'best-practices', 'seo'];

const priorityForSavingsMs = (ms) => (ms >= 1000 ? 'high' : ms >= 300 ? 'medium' : 'low');

/**
 * Runs a real PageSpeed Insights (Lighthouse) test and maps the response to
 * our display shape. Only uses fields Google actually returned — never
 * fabricates scores or recommendations.
 */
export const runTest = async (url, strategy = 'mobile') => {
  const params = new URLSearchParams({ url, key: config.google.pagespeed.apiKey, strategy });
  CATEGORIES.forEach((c) => params.append('category', c));

  const resp = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params.toString()}`);
  if (!resp.ok) {
    let body = null;
    try { body = await resp.json(); } catch {}
    console.error('[pagespeedService] Google API error:', resp.status, JSON.stringify(body));
    if (resp.status === 429) throw new PageSpeedApiError('PageSpeed Insights rate limit reached. Try again shortly.', 'RATE_LIMITED');
    throw new PageSpeedApiError('PageSpeed Insights request failed.', 'API_ERROR');
  }
  const data = await resp.json();
  const categories = data.lighthouseResult?.categories || {};
  const audits = data.lighthouseResult?.audits || {};

  const scores = {
    performance: Math.round((categories.performance?.score || 0) * 100),
    accessibility: Math.round((categories.accessibility?.score || 0) * 100),
    bestPractices: Math.round((categories['best-practices']?.score || 0) * 100),
    seo: Math.round((categories.seo?.score || 0) * 100),
  };

  const vitals = {
    lcp: audits['largest-contentful-paint']?.displayValue || '',
    inp: audits['interaction-to-next-paint']?.displayValue || audits['experimental-interaction-to-next-paint']?.displayValue || '',
    cls: audits['cumulative-layout-shift']?.displayValue || '',
  };

  const opportunityAudits = Object.values(audits).filter(
    (a) => a.details?.type === 'opportunity' && a.score !== null && a.score < 0.9
  );
  const diagnosticAudits = Object.values(audits).filter(
    (a) => a.details?.type !== 'opportunity' && a.score !== null && a.score < 0.9 && a.scoreDisplayMode !== 'notApplicable'
  );

  const toRec = (a) => ({
    id: a.id,
    title: a.title,
    description: a.description ? a.description.replace(/\[.*?\]\(.*?\)/g, '').trim() : '',
    priority: priorityForSavingsMs(a.details?.overallSavingsMs || 0),
    savings: a.details?.overallSavingsBytes
      ? `${Math.round(a.details.overallSavingsBytes / 1024)} KB`
      : a.details?.overallSavingsMs
      ? `${Math.round(a.details.overallSavingsMs)} ms`
      : '',
  });

  const audits_out = [...opportunityAudits, ...diagnosticAudits].slice(0, 15).map(toRec);

  return { scores, vitals, audits: audits_out };
};

export { PageSpeedApiError };
