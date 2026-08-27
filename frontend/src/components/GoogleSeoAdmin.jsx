import React, { useEffect, useState, useCallback } from 'react';
import {
  Globe2, RefreshCw, PlugZap, Unplug, Gauge, Smartphone, Monitor,
  TrendingUp, TrendingDown, Search, CheckCircle2, XCircle, Clock,
} from 'lucide-react';
import { googleSeoApi, blogApi } from '../lib/api';

const Th = ({ children }) => <th className="text-[10px] font-black uppercase tracking-wider px-4 py-3 text-left text-neutral-500 dark:text-neutral-400">{children}</th>;
const Td = ({ children, className = '' }) => <td className={`px-4 py-3 align-top text-neutral-700 dark:text-neutral-200 ${className}`}>{children}</td>;
const Empty = ({ title, desc }) => (
  <div className="text-center py-10 rounded-2xl border border-dashed border-[#EAEAEA] dark:border-[#292929]">
    <div className="font-black text-neutral-900 dark:text-white">{title}</div>
    <div className="text-xs font-bold text-neutral-500 dark:text-[#B5B5B5] mt-1">{desc}</div>
  </div>
);

const fmtNum = (n) => (n == null ? '—' : Number(n).toLocaleString());
const fmtPct = (n) => (n == null ? '—' : `${(Number(n) * 100).toFixed(2)}%`);
const fmtPos = (n) => (n == null ? '—' : Number(n).toFixed(1));

function StatTile({ label, value, delta, deltaGood }) {
  return (
    <div className="rounded-2xl p-4 bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929]">
      <div className="text-[10px] font-black uppercase tracking-wider text-neutral-400">{label}</div>
      <div className="font-heading font-black text-2xl mt-1 tabular-nums">{value}</div>
      {delta != null && (
        <div className={`inline-flex items-center gap-1 text-[10px] font-black mt-1 ${deltaGood ? 'text-emerald-600' : 'text-rose-600'}`}>
          {deltaGood ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />} {delta}
        </div>
      )}
    </div>
  );
}

const PRIORITY_ICON = { high: '🔴', medium: '🟠', low: '🟢' };

export default function GoogleSeoAdmin() {
  const [status, setStatus] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [toast, setToast] = useState(null);

  const [properties, setProperties] = useState([]);
  const [period, setPeriod] = useState('28d');
  const [performance, setPerformance] = useState(null);
  const [dimTab, setDimTab] = useState('query');
  const [dimRows, setDimRows] = useState([]);
  const [dimLoading, setDimLoading] = useState(false);
  const [opportunities, setOpportunities] = useState([]);
  const [syncing, setSyncing] = useState(false);

  const [psUrl, setPsUrl] = useState('');
  const [psSearch, setPsSearch] = useState('');
  const [psSuggestions, setPsSuggestions] = useState([]);
  const [psStrategy, setPsStrategy] = useState('mobile');
  const [psResult, setPsResult] = useState(null);
  const [psTesting, setPsTesting] = useState(false);

  const loadStatus = useCallback(async () => {
    setLoadingStatus(true);
    const res = await googleSeoApi.status();
    if (res.success) setStatus(res.data);
    setLoadingStatus(false);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const flag = params.get('seo_google');
    if (flag) {
      setToast(flag === 'connected' ? '✅ Google Search Console connected' : '⚠ Google connection failed — please try again');
      params.delete('seo_google');
      const newUrl = window.location.pathname + (params.toString() ? `?${params}` : '') + window.location.hash;
      window.history.replaceState({}, '', newUrl);
      setTimeout(() => setToast(null), 5000);
    }
    loadStatus();
  }, [loadStatus]);

  const connected = status?.connection?.connected;
  const hasProperty = !!status?.connection?.propertyUrl;
  const gscEnabled = status?.searchConsole?.enabled;
  const gscConfigured = status?.searchConsole?.configured;
  const pagespeedEnabled = status?.pagespeed?.enabled;

  const loadProperties = useCallback(async () => {
    const res = await googleSeoApi.properties();
    if (res.success) setProperties(res.data.properties || []);
  }, []);

  useEffect(() => { if (connected && !hasProperty) loadProperties(); }, [connected, hasProperty, loadProperties]);

  const loadPerformance = useCallback(async () => {
    const res = await googleSeoApi.performance({ period });
    if (res.success) setPerformance(res.data);
  }, [period]);

  const loadDimension = useCallback(async () => {
    setDimLoading(true);
    const fn = { query: googleSeoApi.queries, page: googleSeoApi.pages, country: googleSeoApi.countries, device: googleSeoApi.devices }[dimTab];
    const res = await fn({ period });
    if (res.success) setDimRows(res.data.rows || []);
    setDimLoading(false);
  }, [dimTab, period]);

  const loadOpportunities = useCallback(async () => {
    const res = await googleSeoApi.opportunities({ period });
    if (res.success) setOpportunities(res.data.opportunities || []);
  }, [period]);

  useEffect(() => {
    if (hasProperty) {
      loadPerformance();
      loadDimension();
      loadOpportunities();
    }
  }, [hasProperty, loadPerformance, loadDimension, loadOpportunities]);

  const doConnect = async () => { const res = await googleSeoApi.connect(); if (!res.success) alert(res.message); };
  const doDisconnect = async () => {
    if (!confirm('Disconnect Google Search Console? Cached performance data will be cleared.')) return;
    const res = await googleSeoApi.disconnect();
    if (res.success) { loadStatus(); setPerformance(null); setDimRows([]); setOpportunities([]); }
  };
  const selectProperty = async (propertyUrl) => {
    const res = await googleSeoApi.setProperty(propertyUrl);
    if (res.success) loadStatus();
    else alert(res.message);
  };
  const doSync = async () => {
    setSyncing(true);
    const res = await googleSeoApi.sync();
    setSyncing(false);
    if (res.success) { loadStatus(); loadPerformance(); loadDimension(); loadOpportunities(); }
    else alert(res.message);
  };

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!psSearch) { setPsSuggestions([]); return; }
      const res = await blogApi.internalLinkSuggestions(psSearch);
      if (res.success) setPsSuggestions(res.data || []);
    }, 250);
    return () => clearTimeout(t);
  }, [psSearch]);

  const loadCachedPageSpeed = async (url) => {
    const res = await googleSeoApi.pagespeed(url, psStrategy);
    if (res.success) setPsResult(res.data.result || null);
  };

  useEffect(() => { if (psUrl) loadCachedPageSpeed(psUrl); }, [psUrl, psStrategy]);

  const runPageSpeed = async () => {
    if (!psUrl) return;
    setPsTesting(true);
    const res = await googleSeoApi.runPageSpeedTest(psUrl, psStrategy);
    setPsTesting(false);
    if (res.success) setPsResult(res.data.result);
    else alert(res.message);
  };

  if (loadingStatus) return <div className="py-12 text-center text-xs font-bold text-neutral-400 animate-pulse">Loading Google integrations…</div>;

  return (
    <div className="space-y-6">
      {toast && (
        <div className="p-3 rounded-xl bg-neutral-900 text-white text-xs font-black text-center dark:bg-white dark:text-neutral-900">{toast}</div>
      )}

      <div>
        <h1 className="font-heading font-black text-2xl sm:text-3xl tracking-tight">Google Search &amp; Speed</h1>
        <p className="text-xs font-bold text-neutral-500 dark:text-[#B5B5B5]">Live Search Console performance and PageSpeed Insights, on top of the internal SEO Health score.</p>
      </div>

      {/* ── Search Console status card ── */}
      <div className="rounded-3xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] p-6 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${connected ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40' : 'bg-neutral-100 dark:bg-[#262626] text-neutral-400'}`}>
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm">Google Search Console</h3>
              {!gscEnabled && !gscConfigured ? (
                <p className="text-[11px] font-bold text-neutral-400">Integration disabled — enable GOOGLE_SEARCH_CONSOLE_ENABLED=true after adding valid Google OAuth credentials.</p>
              ) : connected ? (
                <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Connected{status.connection.propertyUrl ? ` — ${status.connection.propertyUrl}` : ''}</p>
              ) : (
                <p className="text-[11px] font-bold text-neutral-400 flex items-center gap-1"><XCircle className="w-3 h-3" /> Not Connected</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {connected && hasProperty && (
              <button onClick={doSync} disabled={syncing || status?.connection?.syncInProgress} className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-neutral-100 dark:bg-[#262626] text-xs font-black cursor-pointer disabled:opacity-50">
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} /> {syncing ? 'Syncing…' : 'Sync Now'}
              </button>
            )}
            {connected ? (
              <button onClick={doDisconnect} className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-black cursor-pointer">
                <Unplug className="w-3.5 h-3.5" /> Disconnect
              </button>
            ) : (
              <button onClick={doConnect} disabled={!gscEnabled} title={!gscEnabled ? 'Requires GOOGLE_SEARCH_CONSOLE_ENABLED=true and valid credentials' : ''}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl btn-pink text-white text-xs font-black shadow-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                <PlugZap className="w-3.5 h-3.5" /> Connect Google Search Console
              </button>
            )}
          </div>
        </div>
        {status?.connection?.lastSyncAt && (
          <p className="text-[10px] font-bold text-neutral-400 mt-3 flex items-center gap-1"><Clock className="w-3 h-3" /> Last synchronized: {new Date(status.connection.lastSyncAt).toLocaleString()}</p>
        )}

        {connected && !hasProperty && (
          <div className="mt-5 pt-5 border-t border-[#EAEAEA] dark:border-[#292929]">
            <h4 className="text-xs font-black mb-2">Select Search Console Property</h4>
            {properties.length === 0 ? (
              <p className="text-[11px] font-bold text-neutral-400">No verified properties found for this Google account.</p>
            ) : (
              <div className="space-y-2">
                {properties.map((p) => (
                  <button key={p} onClick={() => selectProperty(p)} className="w-full text-left flex items-center gap-2 p-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] hover:border-brand-pink transition cursor-pointer">
                    <span className="w-2 h-2 rounded-full border-2 border-neutral-300" />
                    <span className="text-xs font-bold">{p}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {connected && hasProperty && (
        <>
          <div className="flex items-center gap-2">
            {['7d', '28d', '90d'].map((p) => (
              <button key={p} onClick={() => setPeriod(p)} className={`px-3.5 py-1.5 rounded-xl text-xs font-black cursor-pointer ${period === p ? 'bg-brand-pink text-white' : 'bg-neutral-100 dark:bg-[#262626] text-neutral-600 dark:text-neutral-300'}`}>
                Last {p.replace('d', '')} Days
              </button>
            ))}
          </div>

          {performance && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatTile label="Clicks" value={fmtNum(performance.totals.clicks)}
                delta={performance.previousTotals ? `${performance.totals.clicks >= performance.previousTotals.clicks ? '+' : ''}${performance.totals.clicks - performance.previousTotals.clicks} vs prev period` : null}
                deltaGood={performance.totals.clicks >= (performance.previousTotals?.clicks || 0)} />
              <StatTile label="Impressions" value={fmtNum(performance.totals.impressions)}
                delta={performance.previousTotals ? `${performance.totals.impressions >= performance.previousTotals.impressions ? '+' : ''}${performance.totals.impressions - performance.previousTotals.impressions} vs prev period` : null}
                deltaGood={performance.totals.impressions >= (performance.previousTotals?.impressions || 0)} />
              <StatTile label="CTR" value={fmtPct(performance.totals.ctr)} />
              <StatTile label="Avg Position" value={fmtPos(performance.totals.position)} />
            </div>
          )}

          <div className="rounded-3xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm overflow-hidden">
            <div className="flex items-center gap-1 p-2 border-b border-[#EAEAEA] dark:border-[#292929] overflow-x-auto">
              {[{ id: 'query', label: 'Queries' }, { id: 'page', label: 'Pages' }, { id: 'country', label: 'Countries' }, { id: 'device', label: 'Devices' }].map((t) => (
                <button key={t.id} onClick={() => setDimTab(t.id)} className={`px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap cursor-pointer ${dimTab === t.id ? 'bg-brand-pink text-white' : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[#222]'}`}>{t.label}</button>
              ))}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-neutral-50 dark:bg-[#0E0E0E]">
                  <tr><Th>{dimTab === 'query' ? 'Query' : dimTab === 'page' ? 'Page' : dimTab === 'country' ? 'Country' : 'Device'}</Th><Th>Clicks</Th><Th>Impressions</Th><Th>CTR</Th><Th>Position</Th></tr>
                </thead>
                <tbody>
                  {dimRows.map((r, idx) => (
                    <tr key={idx} className="border-t border-[#EAEAEA] dark:border-[#292929]">
                      <Td className="max-w-xs truncate">{r.key}</Td>
                      <Td>{fmtNum(r.clicks)}</Td>
                      <Td>{fmtNum(r.impressions)}</Td>
                      <Td>{fmtPct(r.ctr)}</Td>
                      <Td>{fmtPos(r.position)}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!dimLoading && dimRows.length === 0 && <div className="py-8"><Empty title="No data yet" desc="Sync Now to fetch the latest Search Console data." /></div>}
          </div>

          <div className="rounded-3xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm p-5">
            <h3 className="font-black text-sm mb-3">Search Opportunities</h3>
            <div className="space-y-2">
              {opportunities.map((o, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929]">
                  <div className="text-xs font-black flex items-start gap-1.5"><span>{PRIORITY_ICON[o.priority]}</span><span>{o.text}</span></div>
                  <p className="text-[10px] font-bold text-neutral-400 mt-1 ml-5">{o.fix}</p>
                </div>
              ))}
              {opportunities.length === 0 && <p className="text-xs font-bold text-neutral-400 text-center py-4">No opportunities identified yet — Sync Now once you have query data.</p>}
            </div>
            <p className="text-[9px] font-bold text-neutral-400 pt-3 mt-3 border-t border-[#EAEAEA] dark:border-[#292929]">
              This recommendation may improve on-page SEO and search visibility. Search rankings are determined by search engines and cannot be guaranteed.
            </p>
          </div>
        </>
      )}

      {/* ── PageSpeed ── */}
      <div className="rounded-3xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${pagespeedEnabled ? 'bg-sky-50 text-sky-600 dark:bg-sky-950/40' : 'bg-neutral-100 dark:bg-[#262626] text-neutral-400'}`}><Gauge className="w-5 h-5" /></div>
          <div>
            <h3 className="font-black text-sm">Google PageSpeed Insights</h3>
            <p className="text-[11px] font-bold text-neutral-400">{pagespeedEnabled ? 'Configured ✓' : 'Not Configured — add GOOGLE_PAGESPEED_API_KEY to .env'}</p>
          </div>
        </div>

        {pagespeedEnabled && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] flex-1 min-w-[220px]">
                <Search className="w-4 h-4 text-neutral-400" />
                <input placeholder="Search a page (blog post, product, policy page)…" value={psSearch} onChange={(e) => setPsSearch(e.target.value)}
                  className="bg-transparent outline-none text-xs font-bold w-full" />
              </div>
              <button onClick={() => setPsUrl(`${window.location.origin}/`)} className="px-3 py-2.5 rounded-xl bg-neutral-100 dark:bg-[#262626] text-[11px] font-black cursor-pointer">Homepage</button>
              <button onClick={() => setPsUrl(`${window.location.origin}/blog`)} className="px-3 py-2.5 rounded-xl bg-neutral-100 dark:bg-[#262626] text-[11px] font-black cursor-pointer">Blog Index</button>
            </div>
            {psSuggestions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {psSuggestions.map((s, idx) => (
                  <button key={idx} onClick={() => { setPsUrl(`${window.location.origin}${s.url}`); setPsSearch(''); setPsSuggestions([]); }}
                    className="px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-[#262626] text-[11px] font-black cursor-pointer">{s.title}</button>
                ))}
              </div>
            )}
            {psUrl && (
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] flex items-center justify-between flex-wrap gap-2">
                <span className="text-[11px] font-bold font-mono truncate">{psUrl}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPsStrategy('mobile')} className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-black cursor-pointer ${psStrategy === 'mobile' ? 'bg-brand-pink text-white' : 'bg-neutral-100 dark:bg-[#262626]'}`}><Smartphone className="w-3 h-3" /> Mobile</button>
                  <button onClick={() => setPsStrategy('desktop')} className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-black cursor-pointer ${psStrategy === 'desktop' ? 'bg-brand-pink text-white' : 'bg-neutral-100 dark:bg-[#262626]'}`}><Monitor className="w-3 h-3" /> Desktop</button>
                  <button onClick={runPageSpeed} disabled={psTesting} className="px-3 py-1.5 rounded-lg btn-pink text-white text-[10px] font-black cursor-pointer disabled:opacity-50">{psTesting ? 'Running…' : 'Run PageSpeed Test'}</button>
                </div>
              </div>
            )}

            {psResult && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatTile label="Performance" value={psResult.scores.performance} />
                  <StatTile label="Accessibility" value={psResult.scores.accessibility} />
                  <StatTile label="Best Practices" value={psResult.scores.bestPractices} />
                  <StatTile label="SEO" value={psResult.scores.seo} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <StatTile label="LCP" value={psResult.vitals.lcp || '—'} />
                  <StatTile label="INP" value={psResult.vitals.inp || '—'} />
                  <StatTile label="CLS" value={psResult.vitals.cls || '—'} />
                </div>
                <div className="space-y-2">
                  {(psResult.audits || []).map((a, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929]">
                      <div className="text-xs font-black flex items-start gap-1.5"><span>{PRIORITY_ICON[a.priority]}</span><span>{a.title}</span></div>
                      {a.savings && <p className="text-[10px] font-bold text-neutral-400 mt-1 ml-5">Potential savings: {a.savings}</p>}
                      {a.description && <p className="text-[10px] font-medium text-neutral-400 mt-1 ml-5">{a.description}</p>}
                    </div>
                  ))}
                </div>
                <p className="text-[10px] font-bold text-neutral-400">Last tested: {new Date(psResult.testedAt).toLocaleString()}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
