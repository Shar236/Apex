import { AppError } from '../middleware/errorHandler.js';
import { config } from '../config/index.js';
import { signToken, verifyToken } from '../middleware/auth.js';
import { GoogleSearchConsoleConnection, SearchPerformanceCache, PageSpeedResult, AuditLog, User } from '../models/index.js';
import {
  isGoogleSeoEnabled, isSearchConsoleEnabled, isPageSpeedEnabled, getGoogleSeoConfig,
} from '../utils/googleSeoConfig.js';
import { buildConsentUrl, exchangeCodeForTokens, getFreshAccessToken, GoogleAuthError } from '../services/googleOAuthService.js';
import { listProperties, queryPerformance, dateRangeForPeriod, SearchConsoleApiError } from '../services/searchConsoleService.js';
import { computeSearchOpportunities } from '../services/googleSeoOpportunities.js';
import { runTest, PageSpeedApiError } from '../services/pagespeedService.js';
import { encrypt } from '../utils/tokenCrypto.js';

const CACHE_FRESH_MS = 6 * 60 * 60 * 1000; // 6 hours

const recordAudit = async (req, action, details) => {
  try {
    if (req?.user) {
      await AuditLog.create({
        adminId: req.user._id,
        adminEmail: req.user.email,
        action,
        resourceType: 'GoogleSearchConsoleConnection',
        resourceId: null,
        details: details || {},
        ipAddress: req.ip || req.headers['x-forwarded-for'] || null,
      });
    }
  } catch (err) {
    console.error('[google seo audit] log error:', err.message);
  }
};

const getConnection = () => GoogleSearchConsoleConnection.findOne({});

const mapGoogleError = (err, next) => {
  if (err instanceof GoogleAuthError) {
    if (err.code === 'NOT_CONNECTED') return next(new AppError(err.message, 400, err.code));
    return next(new AppError(err.message, 401, err.code));
  }
  if (err instanceof SearchConsoleApiError) return next(new AppError(err.message, err.status || 502, err.code));
  if (err instanceof PageSpeedApiError) return next(new AppError(err.message, 502, err.code));
  return next(err);
};

// ── Status ────────────────────────────────────────────────────────────────

export const getStatus = async (req, res, next) => {
  try {
    const conn = await getConnection();
    res.json({
      success: true,
      data: {
        ...getGoogleSeoConfig(),
        connection: conn ? conn.toPublicJSON() : { connected: false, propertyUrl: '', availableProperties: [], lastSyncAt: null },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── OAuth connect / callback / disconnect ───────────────────────────────────

export const connect = async (req, res, next) => {
  try {
    if (!isSearchConsoleEnabled()) {
      return next(new AppError('Google Search Console integration is not enabled or not fully configured.', 400, 'NOT_ENABLED'));
    }
    const state = signToken({ purpose: 'gsc_oauth', adminId: String(req.user._id) }, { expiresIn: '10m' });
    const url = buildConsentUrl(state);
    res.json({ success: true, data: { url } });
  } catch (err) {
    next(err);
  }
};

export const callback = async (req, res) => {
  const redirectBase = `${(config.clientUrl || '').replace(/\/$/, '')}/admin`;
  try {
    const { code, state, error } = req.query;
    if (error) return res.redirect(`${redirectBase}?seo_google=error`);
    if (!code || !state) return res.redirect(`${redirectBase}?seo_google=error`);

    let decoded;
    try {
      decoded = verifyToken(state);
    } catch {
      return res.redirect(`${redirectBase}?seo_google=error`);
    }
    if (decoded.purpose !== 'gsc_oauth' || !decoded.adminId) {
      return res.redirect(`${redirectBase}?seo_google=error`);
    }

    const admin = await User.findById(decoded.adminId).select('email role');
    if (!admin || admin.role !== 'admin') return res.redirect(`${redirectBase}?seo_google=error`);

    const tokens = await exchangeCodeForTokens(code);
    if (!tokens.refresh_token) {
      // No refresh token returned (rare — usually only if consent was never revoked
      // and prompt=consent was somehow skipped). Ask the admin to try again.
      return res.redirect(`${redirectBase}?seo_google=error`);
    }

    let conn = await getConnection();
    if (!conn) conn = new GoogleSearchConsoleConnection({});
    conn.connected = true;
    conn.encryptedRefreshToken = encrypt(tokens.refresh_token);
    conn.scopes = (tokens.scope || '').split(' ').filter(Boolean);
    conn.connectedByAdminId = admin._id;
    conn.connectedByEmail = admin.email;
    conn.connectedAt = new Date();
    conn.propertyUrl = '';
    await conn.save();

    // Best-effort prefetch of available properties so the picker is ready immediately.
    try {
      const properties = await listProperties();
      conn.availableProperties = properties;
      await conn.save();
    } catch (err) {
      console.error('[googleSeoController] property prefetch failed:', err.message);
    }

    AuditLog.create({
      adminId: admin._id,
      adminEmail: admin.email,
      action: 'GSC_CONNECTED',
      resourceType: 'GoogleSearchConsoleConnection',
      resourceId: null,
      details: {},
    }).catch(() => {});

    return res.redirect(`${redirectBase}?seo_google=connected`);
  } catch (err) {
    console.error('[googleSeoController] OAuth callback error:', err.message);
    return res.redirect(`${redirectBase}?seo_google=error`);
  }
};

export const disconnect = async (req, res, next) => {
  try {
    const conn = await getConnection();
    if (conn) {
      conn.connected = false;
      conn.encryptedRefreshToken = '';
      conn.propertyUrl = '';
      conn.availableProperties = [];
      conn.scopes = [];
      conn.connectedAt = null;
      conn.lastSyncAt = null;
      await conn.save();
    }
    await SearchPerformanceCache.deleteMany({});
    await recordAudit(req, 'GSC_DISCONNECTED', {});
    res.json({ success: true, data: { connected: false } });
  } catch (err) {
    next(err);
  }
};

// ── Properties ────────────────────────────────────────────────────────────

export const getProperties = async (req, res, next) => {
  try {
    const conn = await getConnection();
    if (!conn || !conn.connected) return res.json({ success: true, data: { connected: false, properties: [] } });
    if (conn.availableProperties && conn.availableProperties.length > 0) {
      return res.json({ success: true, data: { connected: true, properties: conn.availableProperties, selected: conn.propertyUrl } });
    }
    const properties = await listProperties();
    conn.availableProperties = properties;
    await conn.save();
    res.json({ success: true, data: { connected: true, properties, selected: conn.propertyUrl } });
  } catch (err) {
    mapGoogleError(err, next);
  }
};

export const setProperty = async (req, res, next) => {
  try {
    const { propertyUrl } = req.body;
    const conn = await getConnection();
    if (!conn || !conn.connected) return next(new AppError('Google Search Console is not connected.', 400, 'NOT_CONNECTED'));
    if (!propertyUrl || !(conn.availableProperties || []).includes(propertyUrl)) {
      return next(new AppError('Select one of the verified Search Console properties returned for your account.', 400, 'INVALID_PROPERTY'));
    }
    conn.propertyUrl = propertyUrl;
    await conn.save();
    await recordAudit(req, 'GSC_PROPERTY_SELECTED', { propertyUrl });
    res.json({ success: true, data: { propertyUrl } });
  } catch (err) {
    next(err);
  }
};

// ── Performance data (cached) ───────────────────────────────────────────────

const getCached = async (scope, period, dimension) => {
  const doc = await SearchPerformanceCache.findOne({ scope, period, dimension }).lean();
  if (!doc) return null;
  if (Date.now() - new Date(doc.fetchedAt).getTime() > CACHE_FRESH_MS) return null;
  return doc;
};

const fetchAndCache = async ({ scope, period, dimension, pagePath, propertyUrl }) => {
  const { startDate, endDate, prevStartDate, prevEndDate } = dateRangeForPeriod(period);
  const current = await queryPerformance({ propertyUrl, startDate, endDate, dimension: dimension === 'totals' ? undefined : dimension, pagePath, rowLimit: dimension === 'totals' ? 1 : 25 });
  let previousTotals = { clicks: 0, impressions: 0, ctr: 0, position: 0 };
  if (dimension === 'totals') {
    const prev = await queryPerformance({ propertyUrl, startDate: prevStartDate, endDate: prevEndDate, dimension: undefined, pagePath, rowLimit: 1 });
    previousTotals = prev.totals;
  }
  const doc = await SearchPerformanceCache.findOneAndUpdate(
    { scope, period, dimension },
    { rows: current.rows, totals: current.totals, previousTotals, fetchedAt: new Date() },
    { upsert: true, new: true }
  );
  return doc;
};

const requireConnectedProperty = async () => {
  const conn = await getConnection();
  if (!conn || !conn.connected || !conn.propertyUrl) return null;
  return conn;
};

export const getPerformance = async (req, res, next) => {
  try {
    if (!isSearchConsoleEnabled()) return res.json({ success: true, data: { connected: false } });
    const conn = await requireConnectedProperty();
    if (!conn) return res.json({ success: true, data: { connected: false } });

    const period = ['7d', '28d', '90d'].includes(req.query.period) ? req.query.period : '28d';
    const scope = req.query.pagePath || 'site';

    let cached = await getCached(scope, period, 'totals');
    if (!cached) cached = await fetchAndCache({ scope, period, dimension: 'totals', pagePath: req.query.pagePath, propertyUrl: conn.propertyUrl });

    res.json({
      success: true,
      data: {
        connected: true,
        property: conn.propertyUrl,
        period,
        totals: cached.totals,
        previousTotals: cached.previousTotals,
        fetchedAt: cached.fetchedAt,
      },
    });
  } catch (err) {
    mapGoogleError(err, next);
  }
};

const dimensionHandler = (dimension) => async (req, res, next) => {
  try {
    if (!isSearchConsoleEnabled()) return res.json({ success: true, data: { connected: false, rows: [] } });
    const conn = await requireConnectedProperty();
    if (!conn) return res.json({ success: true, data: { connected: false, rows: [] } });

    const period = ['7d', '28d', '90d'].includes(req.query.period) ? req.query.period : '28d';
    const scope = req.query.pagePath || 'site';

    let cached = await getCached(scope, period, dimension);
    if (!cached) cached = await fetchAndCache({ scope, period, dimension, pagePath: req.query.pagePath, propertyUrl: conn.propertyUrl });

    res.json({ success: true, data: { connected: true, period, rows: cached.rows, fetchedAt: cached.fetchedAt } });
  } catch (err) {
    mapGoogleError(err, next);
  }
};

export const getQueries = dimensionHandler('query');
export const getPages = dimensionHandler('page');
export const getCountries = dimensionHandler('country');
export const getDevices = dimensionHandler('device');

export const getOpportunities = async (req, res, next) => {
  try {
    if (!isSearchConsoleEnabled()) return res.json({ success: true, data: { connected: false, opportunities: [] } });
    const conn = await requireConnectedProperty();
    if (!conn) return res.json({ success: true, data: { connected: false, opportunities: [] } });

    const period = ['7d', '28d', '90d'].includes(req.query.period) ? req.query.period : '28d';
    let cached = await getCached('site', period, 'query');
    if (!cached) cached = await fetchAndCache({ scope: 'site', period, dimension: 'query', propertyUrl: conn.propertyUrl });

    const opportunities = computeSearchOpportunities(cached.rows || []);
    res.json({ success: true, data: { connected: true, opportunities } });
  } catch (err) {
    mapGoogleError(err, next);
  }
};

export const sync = async (req, res, next) => {
  try {
    if (!isSearchConsoleEnabled()) return next(new AppError('Google Search Console integration is not enabled or not fully configured.', 400, 'NOT_ENABLED'));
    const conn = await requireConnectedProperty();
    if (!conn) return next(new AppError('Connect a Search Console property first.', 400, 'NOT_CONNECTED'));
    if (conn.syncInProgress) return next(new AppError('A sync is already in progress.', 409, 'SYNC_IN_PROGRESS'));

    conn.syncInProgress = true;
    await conn.save();
    try {
      for (const period of ['7d', '28d', '90d']) {
        for (const dimension of ['totals', 'query', 'page', 'country', 'device']) {
          await fetchAndCache({ scope: 'site', period, dimension, propertyUrl: conn.propertyUrl });
        }
      }
      conn.lastSyncAt = new Date();
    } finally {
      conn.syncInProgress = false;
      await conn.save();
    }

    await recordAudit(req, 'GSC_SYNCED', {});
    res.json({ success: true, data: { lastSyncAt: conn.lastSyncAt } });
  } catch (err) {
    try { const conn = await getConnection(); if (conn) { conn.syncInProgress = false; await conn.save(); } } catch {}
    mapGoogleError(err, next);
  }
};

// ── PageSpeed ────────────────────────────────────────────────────────────

export const getPageSpeed = async (req, res, next) => {
  try {
    const { url, strategy = 'mobile' } = req.query;
    if (!url) return next(new AppError('url is required', 400));
    if (!isPageSpeedEnabled()) return res.json({ success: true, data: { configured: false } });
    const result = await PageSpeedResult.findOne({ url, strategy }).sort({ testedAt: -1 }).lean();
    res.json({ success: true, data: { configured: true, result: result || null } });
  } catch (err) {
    next(err);
  }
};

export const runPageSpeedTest = async (req, res, next) => {
  try {
    const { url, strategy = 'mobile' } = req.body;
    if (!url) return next(new AppError('url is required', 400));
    if (!isPageSpeedEnabled()) return next(new AppError('PageSpeed Insights is not enabled or not configured.', 400, 'NOT_ENABLED'));

    const { scores, vitals, audits } = await runTest(url, strategy);
    const result = await PageSpeedResult.create({ url, strategy, scores, vitals, audits, testedAt: new Date() });
    await recordAudit(req, 'PAGESPEED_TEST_RUN', { url, strategy, performance: scores.performance });
    res.json({ success: true, data: { result } });
  } catch (err) {
    mapGoogleError(err, next);
  }
};
