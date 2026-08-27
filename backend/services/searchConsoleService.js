import { getFreshAccessToken, GoogleAuthError } from './googleOAuthService.js';

const BASE = 'https://www.googleapis.com/webmasters/v3';

class SearchConsoleApiError extends Error {
  constructor(message, code = 'SEARCH_CONSOLE_ERROR', status = 502) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

const authedFetch = async (url, options = {}) => {
  const token = await getFreshAccessToken();
  const resp = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  if (!resp.ok) {
    let body = null;
    try { body = await resp.json(); } catch {}
    // Log full detail server-side only; never forward raw Google error bodies to the client.
    console.error('[searchConsoleService] Google API error:', resp.status, JSON.stringify(body));
    if (resp.status === 401) throw new GoogleAuthError('Google authorization expired. Please reconnect.', 'REAUTH_REQUIRED');
    if (resp.status === 403) throw new SearchConsoleApiError('Access to this Search Console property was denied.', 'FORBIDDEN', 403);
    if (resp.status === 429) throw new SearchConsoleApiError('Google Search Console rate limit reached. Try again shortly.', 'RATE_LIMITED', 429);
    if (resp.status === 404) throw new SearchConsoleApiError('Search Console property not found.', 'PROPERTY_NOT_FOUND', 404);
    throw new SearchConsoleApiError('Google Search Console request failed.', 'API_ERROR', 502);
  }
  return resp.json();
};

export const listProperties = async () => {
  const data = await authedFetch(`${BASE}/sites`);
  return (data.siteEntry || [])
    .filter((s) => ['siteOwner', 'siteFullUser', 'siteRestrictedUser'].includes(s.permissionLevel))
    .map((s) => s.siteUrl);
};

const fmtDate = (d) => d.toISOString().split('T')[0];

export const dateRangeForPeriod = (period) => {
  const days = period === '7d' ? 7 : period === '90d' ? 90 : 28;
  // Search Console data typically lags ~2 days behind real-time.
  const end = new Date();
  end.setDate(end.getDate() - 2);
  const start = new Date(end);
  start.setDate(start.getDate() - days + 1);
  const prevEnd = new Date(start);
  prevEnd.setDate(prevEnd.getDate() - 1);
  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevStart.getDate() - days + 1);
  return {
    startDate: fmtDate(start),
    endDate: fmtDate(end),
    prevStartDate: fmtDate(prevStart),
    prevEndDate: fmtDate(prevEnd),
  };
};

const DIMENSION_MAP = { query: 'query', page: 'page', country: 'country', device: 'device', date: 'date' };

export const queryPerformance = async ({ propertyUrl, startDate, endDate, dimension, pagePath, rowLimit = 25 }) => {
  const body = {
    startDate,
    endDate,
    dimensions: dimension ? [DIMENSION_MAP[dimension]] : [],
    rowLimit,
  };
  if (pagePath) {
    body.dimensionFilterGroups = [
      { filters: [{ dimension: 'page', operator: 'contains', expression: pagePath }] },
    ];
  }
  const encodedSite = encodeURIComponent(propertyUrl);
  const data = await authedFetch(`${BASE}/sites/${encodedSite}/searchAnalytics/query`, {
    method: 'POST',
    body: JSON.stringify(body),
  });

  const rows = (data.rows || []).map((r) => ({
    key: dimension ? r.keys?.[0] : undefined,
    clicks: r.clicks || 0,
    impressions: r.impressions || 0,
    ctr: r.ctr || 0,
    position: r.position || 0,
  }));

  const totals = rows.reduce(
    (acc, r) => {
      acc.clicks += r.clicks;
      acc.impressions += r.impressions;
      acc.positionSum += r.position * r.impressions;
      return acc;
    },
    { clicks: 0, impressions: 0, positionSum: 0 }
  );
  const summary = {
    clicks: totals.clicks,
    impressions: totals.impressions,
    ctr: totals.impressions > 0 ? totals.clicks / totals.impressions : 0,
    position: totals.impressions > 0 ? totals.positionSum / totals.impressions : 0,
  };

  return { rows, totals: summary };
};

export { SearchConsoleApiError };
