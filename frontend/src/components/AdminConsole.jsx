import React, { useEffect, useState, useCallback } from 'react';
import {
  LayoutDashboard, Package, Ticket, Users, ShoppingCart, Tag, Film, Play, Video as VideoIcon,
  LogOut, Search, Plus, Edit2, Trash2, Upload, Save, RefreshCw, CheckCircle2, AlertTriangle, X, ArrowRight, Crown, Sparkles, Clock, ShieldCheck, Eye, Copy, Download, TrendingUp, TrendingDown, FileSpreadsheet, ShieldAlert, Megaphone, Globe, Calendar, DollarSign, Sliders, Type,
  Search as SearchIcon, ExternalLink, AlertOctagon, Info, ArrowLeftRight, Settings2, FileText, Link2, Image as ImageIcon, Code2, Hash, CheckSquare, ListChecks
} from 'lucide-react';
import { adminApi, formatPrice } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useVoucher } from '../context/VoucherContext';
import { useNavigate } from 'react-router-dom';
import { ApexLogo } from './ApexLogo';

const TABS = [
  { id: 'dashboard', label: 'Overview & Analytics', icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'cms', label: 'Website CMS & Campaigns', icon: <Megaphone className="w-4 h-4 text-[#FF005C]" /> },
  { id: 'products', label: 'Products & Pricing', icon: <Package className="w-4 h-4" /> },
  { id: 'vouchers', label: 'Voucher Inventory', icon: <Ticket className="w-4 h-4" /> },
  { id: 'orders', label: 'Orders', icon: <ShoppingCart className="w-4 h-4" /> },
  { id: 'users', label: 'Customers', icon: <Users className="w-4 h-4" /> },
  { id: 'promotions', label: 'Promo Coupons', icon: <Tag className="w-4 h-4" /> },
  { id: 'seo', label: 'SEO Manager', icon: <SearchIcon className="w-4 h-4" /> },
  { id: 'videos', label: 'Videos / Reels', icon: <Film className="w-4 h-4" /> },
  { id: 'audit-logs', label: 'Audit Logs', icon: <Clock className="w-4 h-4" /> },
];

export default function AdminConsole({ initial = 'dashboard' }) {
  const [tab, setTab] = useState(initial);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F3EEFF]/30 dark:bg-[#0A0A0A] text-neutral-900 dark:text-white flex flex-col lg:flex-row transition-colors duration-300">
      <aside className="lg:w-72 lg:min-h-screen bg-white dark:bg-[#101010] border-r border-[#EAEAEA] dark:border-[#222] p-5 lg:sticky lg:top-0 flex-shrink-0">
        <div className="flex items-center justify-between mb-6 lg:mb-8">
          <ApexLogo className="h-7" />
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FF005C]/10 text-[#FF005C] border border-[#FF005C]/20 text-[10px] font-black">
            <Crown className="w-3 h-3" /> ADMIN
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-[#F3EEFF] dark:bg-[#1e1638] border border-[#6C3CE0]/20 mb-6">
          <p className="text-xs font-black text-[#6C3CE0] mb-1">Signed in as</p>
          <p className="font-black truncate">{user?.name}</p>
          <p className="text-xs font-bold text-neutral-500 dark:text-[#B5B5B5] truncate">{user?.email}</p>
        </div>
        <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-2.5 px-4 py-3 rounded-2xl font-black text-xs whitespace-nowrap transition flex-shrink-0 ${
                tab === t.id ? 'bg-[#FF005C] text-white shadow-lg' : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[#1e1e1e]'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </nav>
        <div className="mt-6 pt-5 border-t border-[#EAEAEA] dark:border-[#292929]">
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="w-full inline-flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-400 font-black text-xs justify-center"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-[1400px] mx-auto w-full">
        {tab === 'dashboard' && <AdminOverview />}
        {tab === 'cms' && <WebsiteCMSAdmin />}
        {tab === 'products' && <ProductsAdmin />}
        {tab === 'vouchers' && <VouchersAdmin />}
        {tab === 'orders' && <OrdersAdmin />}
        {tab === 'users' && <UsersAdmin />}
        {tab === 'promotions' && <PromotionsAdmin />}
        {tab === 'seo' && <SEOManager />}
        {tab === 'videos' && <VideosAdmin />}
        {tab === 'audit-logs' && <AuditLogsAdmin />}
      </main>
    </div>
  );
}

function StatCard({ label, value, icon, tint = '#FF005C', growth = null, sub = null }) {
  return (
    <div className="rounded-3xl p-5 bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white" style={{ background: tint }}>
            {icon}
          </div>
          {growth != null && (
            <span className={`inline-flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-full border ${growth >= 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400'}`}>
              {growth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {growth > 0 ? `+${growth}%` : `${growth}%`}
            </span>
          )}
        </div>
        <div className="text-xs font-bold text-neutral-500 dark:text-[#B5B5B5]">{label}</div>
        <div className="font-heading font-black text-2xl sm:text-3xl tabular-nums mt-1">{value}</div>
      </div>
      {sub && <div className="text-[11px] font-black text-neutral-400 mt-2 pt-2 border-t border-[#EAEAEA] dark:border-[#292929]">{sub}</div>}
    </div>
  );
}

function AdminOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');
  const [unmaskedExport, setUnmaskedExport] = useState(false);

  const refresh = async (p = period) => {
    setLoading(true);
    const res = await adminApi.dashboard({ period: p });
    setData(res.data || null);
    setLoading(false);
  };

  useEffect(() => { refresh(period); }, [period]);

  const kpi = data?.kpi || {};
  const charts = data?.charts || {};
  const tables = data?.tables || {};
  const alerts = data?.alerts || {};

  const stats = [
    { label: 'Total Net Revenue', value: formatPrice(kpi.netRevenue || 0), icon: <Sparkles className="w-5 h-5" />, tint: '#FF005C', sub: 'Excludes refunded/cancelled' },
    { label: "Today's Revenue", value: formatPrice(kpi.todayRevenue || 0), icon: <Sparkles className="w-5 h-5" />, tint: '#10B981', growth: kpi.revenueGrowth },
    { label: "Yesterday's Revenue", value: formatPrice(kpi.yesterdayRevenue || 0), icon: <Clock className="w-5 h-5" />, tint: '#8B5CF6' },
    { label: 'Total Orders', value: kpi.totalOrders || 0, icon: <ShoppingCart className="w-5 h-5" />, tint: '#EC4899' },
    { label: "Today's Orders", value: kpi.todayOrders || 0, icon: <ShoppingCart className="w-5 h-5" />, tint: '#0EA5E9', growth: kpi.ordersGrowth },
    { label: 'Total Products Sold', value: kpi.totalProductsSold || 0, icon: <Package className="w-5 h-5" />, tint: '#6C3CE0' },
    { label: 'Total Customers', value: kpi.totalCustomers || 0, icon: <Users className="w-5 h-5" />, tint: '#14B8A6' },
    { label: 'Available Vouchers', value: kpi.availableVouchers || 0, icon: <Ticket className="w-5 h-5" />, tint: '#F59E0B' },
    { label: 'Active Promotions', value: kpi.activePromotions || 0, icon: <Tag className="w-5 h-5" />, tint: '#3B82F6' },
    { label: 'Pending Orders', value: kpi.pendingOrders || 0, icon: <Clock className="w-5 h-5" />, tint: '#F97316' },
    { label: 'Refunds Processed', value: kpi.refunds || 0, icon: <AlertTriangle className="w-5 h-5" />, tint: '#EF4444' },
  ];

  return (
    <div className="space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl tracking-tight">Enterprise Business Dashboard</h1>
          <p className="text-xs font-bold text-neutral-500 dark:text-[#B5B5B5]">Real MongoDB revenue metrics, inventory Depletion, and analytics.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] font-black text-xs shadow-sm focus:outline-none focus:border-[#FF005C]"
          >
            <option value="today">Today</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <button onClick={() => refresh(period)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] font-black text-xs shadow-sm hover:border-[#FF005C]">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Real-time Alerts Banner */}
      {(alerts.lowStockCount > 0 || alerts.failedPaymentsCount > 0 || alerts.pendingOrdersCount > 0 || alerts.expiringPromosCount > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {alerts.lowStockCount > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <div>
                <div className="font-black text-xs text-amber-900 dark:text-amber-300">Low Stock Alert</div>
                <div className="text-[11px] font-bold text-amber-700 dark:text-amber-400">{alerts.lowStockCount} products need restocking</div>
              </div>
            </div>
          )}
          {alerts.pendingOrdersCount > 0 && (
            <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900/40 flex items-center gap-3">
              <Clock className="w-5 h-5 text-sky-600 dark:text-sky-400 flex-shrink-0" />
              <div>
                <div className="font-black text-xs text-sky-900 dark:text-sky-300">Pending Orders</div>
                <div className="text-[11px] font-bold text-sky-700 dark:text-sky-400">{alerts.pendingOrdersCount} orders awaiting action</div>
              </div>
            </div>
          )}
          {alerts.failedPaymentsCount > 0 && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0" />
              <div>
                <div className="font-black text-xs text-rose-900 dark:text-rose-300">Failed Payments</div>
                <div className="text-[11px] font-bold text-rose-700 dark:text-rose-400">{alerts.failedPaymentsCount} transaction attempts failed</div>
              </div>
            </div>
          )}
          {alerts.expiringPromosCount > 0 && (
            <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/40 flex items-center gap-3">
              <Tag className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
              <div>
                <div className="font-black text-xs text-purple-900 dark:text-purple-300">Expiring Promos</div>
                <div className="text-[11px] font-bold text-purple-700 dark:text-purple-400">{alerts.expiringPromosCount} promotions ending in 48h</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {loading ? Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-3xl p-5 bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] animate-pulse h-32" />
        )) : stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* SVG Time-Series Chart */}
      <div className="rounded-3xl p-6 bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-black text-lg text-neutral-900 dark:text-white">Revenue & Sales Trends</h3>
            <p className="text-xs font-bold text-neutral-500 dark:text-[#B5B5B5]">Daily net sales breakdown for selected period ({period})</p>
          </div>
        </div>

        {charts.dailyRevenue && charts.dailyRevenue.length > 0 ? (
          <div className="pt-4">
            <div className="h-44 flex items-end gap-2 border-b border-[#EAEAEA] dark:border-[#292929] pb-2 px-2">
              {charts.dailyRevenue.map((item, idx) => {
                const maxRev = Math.max(...charts.dailyRevenue.map(d => d.revenue || 1));
                const heightPct = Math.max(12, Math.round((item.revenue / maxRev) * 100));
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-neutral-900 text-white px-2 py-1 rounded text-[10px] font-mono font-bold transition-opacity whitespace-nowrap z-10">
                      {item._id}: {formatPrice(item.revenue)} ({item.orders} orders)
                    </div>
                    <div
                      className="w-full bg-[#FF005C] rounded-t-lg transition-all hover:bg-[#6C3CE0]"
                      style={{ height: `${heightPct}%` }}
                    />
                    <span className="text-[9px] font-bold text-neutral-400 truncate w-full text-center">{item._id?.slice(5)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-xs font-bold text-neutral-400">
            No sales data available for the selected period.
          </div>
        )}
      </div>

      {/* Best-Selling Products & Low Stock Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best Sellers */}
        <div className="rounded-3xl p-6 bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm">
          <h3 className="font-black text-lg mb-4 text-neutral-900 dark:text-white">Best-Selling Products</h3>
          <div className="space-y-3">
            {(tables.bestSellers || []).map((p, i) => (
              <div key={p.id || i} className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929]">
                <div>
                  <div className="font-black text-sm text-neutral-900 dark:text-white">{p.name}</div>
                  <div className="text-xs font-bold text-neutral-500">
                    Sold: <span className="text-neutral-900 dark:text-white">{p.unitsSold} units</span> • Available Stock: <span className="text-emerald-600 dark:text-emerald-400">{p.stock}</span>
                  </div>
                </div>
                <div className="text-right font-heading font-black text-base text-[#FF005C]">
                  {formatPrice(p.revenue)}
                </div>
              </div>
            ))}
            {(!tables.bestSellers?.length) && <Empty title="No best sellers yet" />}
          </div>
        </div>

        {/* Low Stock Alerts Table */}
        <div className="rounded-3xl p-6 bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-lg text-neutral-900 dark:text-white">Low Stock Inventory Alerts</h3>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">Threshold: &lt; 10 codes</span>
          </div>
          <div className="space-y-3">
            {(tables.lowStockProducts || []).map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40">
                <div>
                  <div className="font-black text-sm text-neutral-900 dark:text-white">{p.name}</div>
                  <div className="text-xs font-bold text-neutral-500">Brand: {p.brand}</div>
                </div>
                <div className="text-right">
                  <span className="inline-flex px-3 py-1 rounded-full bg-rose-500 text-white font-black text-xs">
                    {p.availableStock} Left
                  </span>
                </div>
              </div>
            ))}
            {(!tables.lowStockProducts?.length) && <div className="py-8 text-center text-xs font-bold text-emerald-600 dark:text-emerald-400">✓ All products have sufficient voucher inventory.</div>}
          </div>
        </div>
      </div>

      {/* CSV Reports Export Panel */}
      <div className="rounded-3xl p-6 bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h3 className="font-black text-lg text-neutral-900 dark:text-white">Export Business Reports (CSV)</h3>
            <p className="text-xs font-bold text-neutral-500 dark:text-[#B5B5B5]">Download sanitized e-commerce reports for auditing and accounting.</p>
          </div>
          <label className="inline-flex items-center gap-2 text-xs font-bold text-neutral-600 dark:text-neutral-300">
            <input
              type="checkbox"
              checked={unmaskedExport}
              onChange={(e) => setUnmaskedExport(e.target.checked)}
              className="accent-[#FF005C]"
            />
            <span>Allow Unmasked Voucher Export</span>
          </label>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => adminApi.downloadExport('orders')}
            className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] hover:border-[#FF005C] text-left font-black text-xs flex items-center justify-between transition"
          >
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-[#FF005C]" />
              <span>Orders CSV</span>
            </div>
            <Download className="w-4 h-4 text-neutral-400" />
          </button>
          <button
            onClick={() => adminApi.downloadExport('customers')}
            className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] hover:border-[#FF005C] text-left font-black text-xs flex items-center justify-between transition"
          >
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-[#6C3CE0]" />
              <span>Customers CSV</span>
            </div>
            <Download className="w-4 h-4 text-neutral-400" />
          </button>
          <button
            onClick={() => adminApi.downloadExport('vouchers', unmaskedExport)}
            className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] hover:border-[#FF005C] text-left font-black text-xs flex items-center justify-between transition"
          >
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
              <span>Vouchers CSV</span>
            </div>
            <Download className="w-4 h-4 text-neutral-400" />
          </button>
          <button
            onClick={() => adminApi.downloadExport('sales')}
            className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] hover:border-[#FF005C] text-left font-black text-xs flex items-center justify-between transition"
          >
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-sky-500" />
              <span>Sales Summary CSV</span>
            </div>
            <Download className="w-4 h-4 text-neutral-400" />
          </button>
        </div>
      </div>

      {/* Recent Orders List */}
      <div className="rounded-3xl p-6 bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm">
        <h3 className="font-black text-lg mb-4 text-neutral-900 dark:text-white">Recent Orders</h3>
        <div className="space-y-2.5">
          {(tables.recentOrders || []).map((o) => (
            <div key={o._id} className="flex items-center justify-between flex-wrap gap-3 p-4 rounded-2xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929]">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black text-sm">#{o.orderNo}</span>
                  <Pill text={o.orderStatus} />
                  <Pill text={o.paymentStatus} tint="sky" />
                </div>
                <div className="text-xs font-bold text-neutral-500 dark:text-[#B5B5B5] mt-1">
                  {o.userId?.name || 'Guest'} · {o.userId?.email || o.customerSnapshot?.email || ''} · {new Date(o.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="text-right">
                <div className="font-heading font-black text-xl tabular-nums">{formatPrice(o.total)}</div>
                <div className="text-[10px] font-black text-neutral-400">{o.items?.length} items</div>
              </div>
            </div>
          ))}
          {(!tables.recentOrders?.length) && <Empty title="No orders yet" />}
        </div>
      </div>
    </div>
  );
}

function Pill({ text, tint = 'emerald' }) {
  const map = {
    emerald: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/40',
    sky: 'text-sky-700 bg-sky-50 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-900/40',
    rose: 'text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/40',
    amber: 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/40',
    neutral: 'text-neutral-600 bg-neutral-100 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700',
    pink: 'text-[#FF005C] bg-[#FF005C]/10 border-[#FF005C]/20',
  };
  const t = ['FULFILLED', 'PAID', 'ASSIGNED', 'USED', 'ACTIVE', 'SOLD', 'AVAILABLE'].includes(text) ? 'emerald'
    : ['PENDING', 'PROCESSING', 'RESERVED', 'PAYMENT_PENDING', 'PAYMENT_RECEIVED_NEEDS_ALLOCATION'].includes(text) ? 'amber'
    : ['CANCELLED', 'FAILED', 'REFUNDED', 'EXPIRED'].includes(text) ? 'rose'
    : 'neutral';
  return <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-black ${map[t]}`}>{text}</span>;
}

function Empty({ title, desc = 'Nothing here yet.' }) {
  return (
    <div className="text-center py-10 rounded-2xl border border-dashed border-[#EAEAEA] dark:border-[#292929]">
      <div className="font-black text-neutral-900 dark:text-white">{title}</div>
      <div className="text-xs font-bold text-neutral-500 dark:text-[#B5B5B5] mt-1">{desc}</div>
    </div>
  );
}

function ProductsAdmin() {
  const voucherCtx = useVoucher();
  const refreshProducts = voucherCtx?.refreshProducts;

  const [rows, setRows] = useState([]);
  const [kpis, setKpis] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [providerFilter, setProviderFilter] = useState('');

  const [editing, setEditing] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [draft, setDraft] = useState({});

  const [quickPriceId, setQuickPriceId] = useState(null);
  const [quickPrices, setQuickPrices] = useState({ sellingPrice: 0, originalPrice: 0 });

  const refresh = async () => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    if (categoryFilter) params.category = categoryFilter;
    if (providerFilter) params.provider = providerFilter;

    const res = await adminApi.products(params);
    setRows(res.data || []);
    setKpis(res.kpis || {});
    setLoading(false);
    if (typeof refreshProducts === 'function') {
      refreshProducts();
    }
  };

  useEffect(() => {
    const t = setTimeout(refresh, 300);
    return () => clearTimeout(t);
  }, [search, statusFilter, categoryFilter, providerFilter]);

  const startCreate = () => {
    setDraft({
      name: '',
      provider: 'Pearson',
      providerShortName: 'PTE',
      brand: 'Pearson PTE',
      category: 'English Language Test',
      shortDescription: '',
      description: '',
      logo: '',
      image: '',
      originalPrice: 18900,
      sellingPrice: 15499,
      validityDays: 180,
      validityMonths: 6,
      badge: 'MOST POPULAR',
      badgeEnabled: true,
      badgeType: 'popular',
      featured: false,
      active: true,
      displayOrder: 0,
      seoTitle: '',
      seoDescription: '',
      slug: '',
      inclusions: ['Official Exam Voucher Code', '10-Second Digital Delivery', 'Valid for 6 Months', 'Free Support'],
      redemptionSteps: ['Login to test provider website', 'Select test center & date', 'Apply voucher code at checkout'],
    });
    setEditing(null);
    setIsCreating(true);
  };

  const startEdit = (p) => {
    setEditing(p);
    setIsCreating(false);
    setDraft({
      ...p,
      inclusions: Array.isArray(p.inclusions) ? p.inclusions.join('\n') : p.inclusions || '',
      redemptionSteps: Array.isArray(p.redemptionSteps) ? p.redemptionSteps.join('\n') : p.redemptionSteps || '',
    });
  };

  const saveProduct = async () => {
    if (!draft.name || !draft.provider || draft.sellingPrice < 0 || draft.originalPrice < 0) {
      alert('Product name, provider, and valid non-negative prices are required.');
      return;
    }
    if (Number(draft.sellingPrice) > Number(draft.originalPrice)) {
      alert('Selling price cannot be higher than original price.');
      return;
    }

    const payload = {
      ...draft,
      originalPrice: Number(draft.originalPrice),
      sellingPrice: Number(draft.sellingPrice),
      validityDays: Number(draft.validityDays) || 180,
      validityMonths: Number(draft.validityMonths) || 6,
      displayOrder: Number(draft.displayOrder) || 0,
      inclusions: typeof draft.inclusions === 'string' ? draft.inclusions.split('\n').map(s => s.trim()).filter(Boolean) : draft.inclusions,
      redemptionSteps: typeof draft.redemptionSteps === 'string' ? draft.redemptionSteps.split('\n').map(s => s.trim()).filter(Boolean) : draft.redemptionSteps,
    };

    let res;
    if (isCreating) res = await adminApi.createProduct(payload);
    else res = await adminApi.updateProduct(editing?._id || editing?.id, payload);

    if (res.success) {
      setIsCreating(false);
      setEditing(null);
      refresh();
    } else alert(res.message || 'Failed to save product');
  };

  const handleQuickPriceSave = async (id) => {
    if (Number(quickPrices.sellingPrice) > Number(quickPrices.originalPrice)) {
      alert('Selling price cannot exceed original price.');
      return;
    }
    const res = await adminApi.quickUpdatePrice(id, quickPrices);
    if (res.success) {
      setQuickPriceId(null);
      refresh();
    } else alert(res.message || 'Failed to update price');
  };

  const toggleStatus = async (p) => {
    const res = await adminApi.quickUpdateStatus(p._id || p.id, !p.active);
    if (res.success) refresh();
  };

  const toggleFeatured = async (p) => {
    const res = await adminApi.quickUpdateFeatured(p._id || p.id, !p.featured);
    if (res.success) refresh();
  };

  const removeProduct = async (p) => {
    if (!confirm(`Are you sure you want to deactivate or remove ${p.name}?`)) return;
    const res = await adminApi.deleteProduct(p._id || p.id);
    if (res.success) {
      if (res.deactivated) alert(`Product deactivated. Historical records preserved.`);
      refresh();
    } else alert(res.message || 'Action failed');
  };

  return (
    <div className="space-y-6">
      {/* Header & Primary Action */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl tracking-tight">Products Management</h1>
          <p className="text-xs font-bold text-neutral-500 dark:text-[#B5B5B5]">Single source of truth for product pricing, availability, validity, and customer store layout.</p>
        </div>
        <button onClick={startCreate} className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl btn-pink text-white font-black text-xs shadow-lg">
          <Plus className="w-4 h-4" /> Add New Product
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard label="Total Products" value={kpis.totalProducts || 0} icon={<Package className="w-4 h-4" />} tint="#6C3CE0" />
        <StatCard label="Active Products" value={kpis.activeProducts || 0} icon={<CheckCircle2 className="w-4 h-4" />} tint="#10B981" />
        <StatCard label="Inactive Products" value={kpis.inactiveProducts || 0} icon={<X className="w-4 h-4" />} tint="#64748B" />
        <StatCard label="Out of Stock" value={kpis.outOfStockProducts || 0} icon={<AlertTriangle className="w-4 h-4" />} tint="#EF4444" />
        <StatCard label="Low Stock Alert" value={kpis.lowStockProducts || 0} icon={<Clock className="w-4 h-4" />} tint="#F59E0B" />
      </div>

      {/* Search & Filter Controls */}
      <div className="rounded-3xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] flex-1 max-w-md">
            <Search className="w-4 h-4 text-neutral-400" />
            <input
              placeholder="Search products by name, provider, category, slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none text-xs font-bold w-full text-neutral-900 dark:text-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3.5 py-2.5 rounded-2xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-xs font-bold text-neutral-700 dark:text-neutral-300"
            >
              <option value="">All Categories</option>
              <option value="English Language Test">English Language Test</option>
              <option value="Graduate Admissions">Graduate Admissions</option>
              <option value="Professional Certifications">Professional Certifications</option>
            </select>

            <select
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value)}
              className="px-3.5 py-2.5 rounded-2xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-xs font-bold text-neutral-700 dark:text-neutral-300"
            >
              <option value="">All Providers</option>
              <option value="Pearson">Pearson</option>
              <option value="ETS">ETS</option>
              <option value="Duolingo">Duolingo</option>
              <option value="IELTS IDP">IELTS IDP</option>
            </select>
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
          {[
            { id: '', label: 'All Products' },
            { id: 'active', label: 'Active' },
            { id: 'inactive', label: 'Inactive' },
            { id: 'out_of_stock', label: 'Out of Stock' },
            { id: 'low_stock', label: 'Low Stock' },
            { id: 'featured', label: 'Featured' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setStatusFilter(pill.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition whitespace-nowrap ${
                statusFilter === pill.id
                  ? 'bg-[#FF005C] text-white shadow-sm'
                  : 'bg-neutral-100 dark:bg-[#262626] text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product Creation / Edit Form Modal */}
      {(isCreating || editing) && (
        <FormCard
          title={isCreating ? '➕ Add New Exam Voucher Product' : `✏️ Edit Product: ${editing?.name}`}
          onClose={() => { setIsCreating(false); setEditing(null); }}
          onSave={saveProduct}
        >
          <div className="space-y-6">
            {/* Section 1: Basic Metadata */}
            <div>
              <h4 className="text-xs font-black text-[#FF005C] uppercase tracking-wider mb-3">1. Basic Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Product Name *" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} placeholder="e.g. PTE Academic Voucher" />
                <Field label="Exam Provider *" value={draft.provider} onChange={(v) => setDraft({ ...draft, provider: v, brand: v })} placeholder="Pearson / ETS / Duolingo" />
                <Field label="Provider Short Name" value={draft.providerShortName} onChange={(v) => setDraft({ ...draft, providerShortName: v })} placeholder="PTE / GRE / TOEFL" />
                <Field label="Category *" value={draft.category} onChange={(v) => setDraft({ ...draft, category: v })} placeholder="English Language Test" />
                <Field label="Display Order (Rank)" type="number" value={draft.displayOrder} onChange={(v) => setDraft({ ...draft, displayOrder: v })} placeholder="0" />
                <Field label="CTA Button Text" value={draft.cta || 'Buy Now'} onChange={(v) => setDraft({ ...draft, cta: v })} />
              </div>
            </div>

            {/* Section 2: Pricing & Discounts */}
            <div className="pt-4 border-t border-[#EAEAEA] dark:border-[#292929]">
              <h4 className="text-xs font-black text-[#FF005C] uppercase tracking-wider mb-3">2. Pricing & Discounts (Single Source of Truth)</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Original Price (MRP ₹) *" type="number" value={draft.originalPrice} onChange={(v) => setDraft({ ...draft, originalPrice: v })} />
                <Field label="Selling Price (Final ₹) *" type="number" value={draft.sellingPrice} onChange={(v) => setDraft({ ...draft, sellingPrice: v })} />
                <div>
                  <Label>Calculated Discount</Label>
                  <div className="px-4 py-3 rounded-xl bg-neutral-100 dark:bg-[#0E0E0E] font-black text-sm text-emerald-600 dark:text-emerald-400">
                    Save {formatPrice(Math.max(0, (Number(draft.originalPrice) || 0) - (Number(draft.sellingPrice) || 0)))} (
                    {draft.originalPrice > 0 ? Math.round(((Number(draft.originalPrice) - Number(draft.sellingPrice)) / Number(draft.originalPrice)) * 100) : 0}% OFF)
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Branding & Card Badges */}
            <div className="pt-4 border-t border-[#EAEAEA] dark:border-[#292929]">
              <h4 className="text-xs font-black text-[#FF005C] uppercase tracking-wider mb-3">3. Customer Card Badges & Branding</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Card Badge Text" value={draft.badge || ''} onChange={(v) => setDraft({ ...draft, badge: v })} placeholder="e.g. MOST POPULAR" />
                <Field label="Validity (Months)" type="number" value={draft.validityMonths} onChange={(v) => setDraft({ ...draft, validityMonths: v })} />
                <Field label="Validity (Days)" type="number" value={draft.validityDays} onChange={(v) => setDraft({ ...draft, validityDays: v })} />
                <Field label="Product Logo URL" value={draft.logo || ''} onChange={(v) => setDraft({ ...draft, logo: v })} placeholder="https://..." />
                <Field label="Product Image URL" value={draft.image || ''} onChange={(v) => setDraft({ ...draft, image: v })} placeholder="https://..." />
                <div className="flex items-center gap-3 pt-6">
                  <Check label="Show Badge on Card" checked={!!draft.badgeEnabled} onChange={(v) => setDraft({ ...draft, badgeEnabled: v })} />
                  <Check label="Featured Product" checked={!!draft.featured} onChange={(v) => setDraft({ ...draft, featured: v })} />
                  <Check label="Active & Visible" checked={!!draft.active} onChange={(v) => setDraft({ ...draft, active: v })} />
                </div>
              </div>
            </div>

            {/* Section 4: Descriptions & Details */}
            <div className="pt-4 border-t border-[#EAEAEA] dark:border-[#292929]">
              <h4 className="text-xs font-black text-[#FF005C] uppercase tracking-wider mb-3">4. Descriptions & Bullet Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextArea label="Short Description (Shown on Card)" value={draft.shortDescription || ''} onChange={(v) => setDraft({ ...draft, shortDescription: v })} rows={2} />
                <TextArea label="Full Description (Shown in Modal)" value={draft.description || ''} onChange={(v) => setDraft({ ...draft, description: v })} rows={2} />
                <TextArea label="Inclusions (One per line)" value={Array.isArray(draft.inclusions) ? draft.inclusions.join('\n') : draft.inclusions || ''} onChange={(v) => setDraft({ ...draft, inclusions: v })} rows={3} />
                <TextArea label="Redemption Steps (One per line)" value={Array.isArray(draft.redemptionSteps) ? draft.redemptionSteps.join('\n') : draft.redemptionSteps || ''} onChange={(v) => setDraft({ ...draft, redemptionSteps: v })} rows={3} />
              </div>
            </div>

            {/* Section 5: SEO */}
            <div className="pt-4 border-t border-[#EAEAEA] dark:border-[#292929]">
              <h4 className="text-xs font-black text-[#FF005C] uppercase tracking-wider mb-3">5. SEO Configuration</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="SEO Slug (URL identifier)" value={draft.slug || ''} onChange={(v) => setDraft({ ...draft, slug: v })} placeholder="pte-academic-voucher" />
                <Field label="SEO Title" value={draft.seoTitle || ''} onChange={(v) => setDraft({ ...draft, seoTitle: v })} placeholder="Discounted PTE Voucher..." />
                <Field label="SEO Description" value={draft.seoDescription || ''} onChange={(v) => setDraft({ ...draft, seoDescription: v })} placeholder="Buy discounted exam vouchers..." />
              </div>
            </div>
          </div>
        </FormCard>
      )}

      {/* Main Products Table */}
      <div className="rounded-3xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-bold">
            <thead className="bg-neutral-50 dark:bg-[#0E0E0E] text-neutral-500">
              <tr>
                <Th>Product & Branding</Th>
                <Th>Provider</Th>
                <Th>Category</Th>
                <Th className="text-right">Original MRP</Th>
                <Th className="text-right">Selling Price</Th>
                <Th className="text-center">Discount</Th>
                <Th className="text-center">Available Stock</Th>
                <Th className="text-center">Status</Th>
                <Th className="text-center">Featured</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {loading && Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan="10" className="p-4"><div className="h-10 bg-neutral-100 dark:bg-[#292929] rounded-xl animate-pulse" /></td></tr>
              ))}

              {!loading && rows.map((p) => {
                const isQuickEditing = quickPriceId === p._id;
                const availableCount = p.availableVouchers ?? p.availability ?? 0;
                const stockBadge = availableCount > (p.lowStockThreshold || 10) ? 'emerald' : availableCount > 0 ? 'amber' : 'rose';

                return (
                  <tr key={p._id} className="border-t border-[#EAEAEA] dark:border-[#292929] hover:bg-neutral-50/50 dark:hover:bg-[#111111] transition-colors">
                    {/* Product & Branding */}
                    <Td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#FFF0F5] dark:bg-[#2A0A17] border border-[#FF005C]/20 flex items-center justify-center font-black text-[#FF005C] flex-shrink-0">
                          {p.providerShortName || p.brand?.slice(0, 3) || 'APX'}
                        </div>
                        <div>
                          <div className="font-black text-sm text-neutral-900 dark:text-white flex items-center gap-2">
                            <span>{p.name}</span>
                            {p.badge && (
                              <span className="px-2 py-0.5 rounded-md bg-[#FF005C]/10 text-[#FF005C] border border-[#FF005C]/20 text-[9px] font-black">
                                {p.badge}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] font-semibold text-neutral-400 truncate max-w-xs">
                            {p.shortDescription || p.description || `Valid for ${p.validityMonths || 6} Months`}
                          </div>
                        </div>
                      </div>
                    </Td>

                    {/* Provider */}
                    <Td className="whitespace-nowrap">{p.provider || p.brand}</Td>

                    {/* Category */}
                    <Td className="whitespace-nowrap text-neutral-500">{p.category}</Td>

                    {/* Original MRP */}
                    <Td className="text-right tabular-nums text-neutral-400 line-through">
                      {formatPrice(p.originalPrice)}
                    </Td>

                    {/* Selling Price & Quick Inline Edit */}
                    <Td className="text-right tabular-nums whitespace-nowrap">
                      {isQuickEditing ? (
                        <div className="inline-flex items-center gap-1 bg-white dark:bg-[#161616] p-1 rounded-xl border border-[#FF005C]">
                          <input
                            type="number"
                            value={quickPrices.sellingPrice}
                            onChange={(e) => setQuickPrices({ ...quickPrices, sellingPrice: Number(e.target.value) })}
                            className="w-20 px-2 py-1 rounded bg-neutral-100 dark:bg-[#0E0E0E] text-xs font-black outline-none"
                          />
                          <button onClick={() => handleQuickPriceSave(p._id)} className="p-1 rounded bg-[#FF005C] text-white text-[10px] font-black">Save</button>
                          <button onClick={() => setQuickPriceId(null)} className="p-1 rounded bg-neutral-200 dark:bg-[#262626] text-neutral-700 dark:text-neutral-300 text-[10px]">✕</button>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5">
                          <span className="font-black text-sm text-[#FF005C]">{formatPrice(p.sellingPrice)}</span>
                          <button
                            onClick={() => {
                              setQuickPriceId(p._id);
                              setQuickPrices({ sellingPrice: p.sellingPrice, originalPrice: p.originalPrice });
                            }}
                            className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-[#262626] text-neutral-400 hover:text-[#FF005C]"
                            title="Quick edit price"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </Td>

                    {/* Discount */}
                    <Td className="text-center whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 text-[10px] font-black">
                        {p.discountPercent || (p.originalPrice ? Math.round(((p.originalPrice - p.sellingPrice) / p.originalPrice) * 100) : 0)}% OFF
                      </span>
                    </Td>

                    {/* Available Stock */}
                    <Td className="text-center whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${
                        stockBadge === 'emerald'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : stockBadge === 'amber'
                          ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400'
                          : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400'
                      }`}>
                        {availableCount} Available ({p.stockStatus || (availableCount > 0 ? 'IN STOCK' : 'OUT OF STOCK')})
                      </span>
                    </Td>

                    {/* Active Status Toggle */}
                    <Td className="text-center whitespace-nowrap">
                      <button onClick={() => toggleStatus(p)} className="cursor-pointer">
                        <Pill text={p.active ? 'ACTIVE' : 'INACTIVE'} tint={p.active ? 'emerald' : 'neutral'} />
                      </button>
                    </Td>

                    {/* Featured Toggle */}
                    <Td className="text-center whitespace-nowrap">
                      <button
                        onClick={() => toggleFeatured(p)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black border cursor-pointer ${
                          p.featured
                            ? 'bg-[#FF005C]/10 text-[#FF005C] border-[#FF005C]/30'
                            : 'bg-neutral-100 text-neutral-400 border-neutral-200 dark:bg-[#262626]'
                        }`}
                      >
                        {p.featured ? '★ Featured' : '☆ Standard'}
                      </button>
                    </Td>

                    {/* Actions */}
                    <Td className="text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => startEdit(p)}
                          className="px-2.5 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border border-sky-200 text-[11px] font-black flex items-center gap-1"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Edit
                        </button>

                        <button
                          onClick={() => window.location.hash = `#vouchers?productId=${p._id}`}
                          className="px-2.5 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border border-purple-200 text-[11px] font-black flex items-center gap-1"
                          title="Manage associated voucher codes"
                        >
                          <Ticket className="w-3.5 h-3.5" /> Inventory
                        </button>

                        <button
                          onClick={() => removeProduct(p)}
                          className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200"
                          title="Deactivate or Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!loading && rows.length === 0 && <Empty title="No products found" desc="Add your first exam voucher product to start selling." />}
      </div>
    </div>
  );
}

function VouchersAdmin() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [productId, setProductId] = useState('');
  const [products, setProducts] = useState([]);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulk, setBulk] = useState({ productId: '', codes: '', expiryDate: '' });

  const refresh = async () => {
    setLoading(true);
    const params = {};
    if (status) params.status = status;
    if (productId) params.productId = productId;
    const [vRes, pRes] = await Promise.all([adminApi.vouchers(params), adminApi.products()]);
    setRows(vRes.data || []);
    setProducts(pRes.data || []);
    setLoading(false);
  };

  useEffect(() => { refresh(); }, [status, productId]);

  const submitBulk = async () => {
    const codes = bulk.codes.split(/[\n,]/).map(s => s.trim()).filter(Boolean);
    if (!bulk.productId || codes.length === 0 || !bulk.expiryDate) {
      alert('Please choose a product, paste at least one code, and set expiry.');
      return;
    }
    const res = await adminApi.addVouchersBulk({
      productId: bulk.productId,
      codes,
      expiryDate: new Date(bulk.expiryDate),
    });
    if (res.success) {
      setBulkOpen(false);
      setBulk({ productId: '', codes: '', expiryDate: '' });
      refresh();
    } else alert(res.message || 'Failed to add vouchers');
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl tracking-tight">Voucher Inventory</h1>
          <p className="text-xs font-bold text-neutral-500 dark:text-[#B5B5B5]">Add codes, filter inventory state machine, and verify assignments.</p>
        </div>
        <button onClick={() => setBulkOpen(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl btn-pink text-white font-black text-xs shadow-lg">
          <Upload className="w-4 h-4" /> Add Voucher Codes
        </button>
      </div>

      {bulkOpen && (
        <FormCard title="Add Voucher Codes" onClose={() => setBulkOpen(false)} onSave={submitBulk}>
          <div className="space-y-4">
            <div>
              <Label>Product</Label>
              <select
                value={bulk.productId}
                onChange={(e) => setBulk({ ...bulk, productId: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-sm font-bold focus:outline-none focus:border-[#FF005C]"
              >
                <option value="">— select —</option>
                {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            </div>
            <Field label="Expiry Date" type="date" value={bulk.expiryDate} onChange={(v) => setBulk({ ...bulk, expiryDate: v })} />
            <div>
              <Label>Codes (one per line or comma-separated)</Label>
              <textarea
                value={bulk.codes}
                onChange={(e) => setBulk({ ...bulk, codes: e.target.value })}
                rows={8}
                placeholder={'APX-PTE-1234-ABC\nAPX-PTE-5678-DEF\nAPX-PTE-9012-GHI'}
                className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-sm font-bold focus:outline-none focus:border-[#FF005C] font-mono"
              />
            </div>
          </div>
        </FormCard>
      )}

      <div className="rounded-3xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] p-4 shadow-sm mb-4 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-neutral-400" />
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-xs font-bold">
            <option value="">All statuses</option>
            {['AVAILABLE','RESERVED','SOLD','ASSIGNED','USED','EXPIRED','CANCELLED'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <select value={productId} onChange={(e) => setProductId(e.target.value)} className="px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-xs font-bold">
          <option value="">All products</option>
          {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
      </div>

      <div className="rounded-3xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-bold">
            <thead className="bg-neutral-50 dark:bg-[#0E0E0E] text-neutral-500">
              <tr>
                <Th>Code</Th>
                <Th>Product</Th>
                <Th>Status</Th>
                <Th>Customer</Th>
                <Th>Order</Th>
                <Th>Expiry</Th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan="6" className="p-4"><div className="h-8 bg-neutral-100 dark:bg-[#292929] rounded animate-pulse" /></td></tr>}
              {!loading && rows.map(v => (
                <tr key={v._id} className="border-t border-[#EAEAEA] dark:border-[#292929]">
                  <Td className="font-mono whitespace-nowrap font-black text-[#6C3CE0]">{v.code}</Td>
                  <Td>{v.productId?.name || '—'}</Td>
                  <Td><Pill text={v.status} /></Td>
                  <Td className="whitespace-nowrap">{v.userId ? `${v.userId.name || ''} ${v.userId.email ? `<${v.userId.email}>` : ''}` : '—'}</Td>
                  <Td className="whitespace-nowrap">{v.orderId?.orderNo || '—'}</Td>
                  <Td>{new Date(v.expiryDate).toLocaleDateString()}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && rows.length === 0 && <Empty title="No vouchers" desc="Add inventory codes to start selling." />}
      </div>
    </div>
  );
}

function OrdersAdmin() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');

  const refresh = async () => {
    setLoading(true);
    const res = await adminApi.orders(status ? { status } : {});
    setRows(res.data || []);
    setLoading(false);
  };
  useEffect(() => { refresh(); }, [status]);

  const updateStatus = async (id, orderStatus, paymentStatus) => {
    const res = await adminApi.updateOrderStatus(id, { orderStatus, paymentStatus });
    if (res.success) refresh();
    else alert(res.message);
  };

  const handleResendEmail = async (id, orderNo) => {
    const res = await adminApi.resendOrderEmail(id);
    alert(res.message);
    if (res.success) refresh();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl tracking-tight">Order Management</h1>
          <p className="text-xs font-bold text-neutral-500 dark:text-[#B5B5B5]">Review customer orders, payment status, email delivery, and voucher allocation.</p>
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-3 py-2 rounded-xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] text-xs font-bold">
          <option value="">All statuses</option>
          {['PENDING','PAYMENT_PENDING','PAID','PROCESSING','PAYMENT_RECEIVED_NEEDS_ALLOCATION','FULFILLED','CANCELLED','REFUNDED','FAILED'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="rounded-3xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-bold">
            <thead className="bg-neutral-50 dark:bg-[#0E0E0E] text-neutral-500">
              <tr>
                <Th>Order No</Th>
                <Th>Customer</Th>
                <Th className="text-right">Total</Th>
                <Th>Items</Th>
                <Th>Order Status</Th>
                <Th>Payment Status</Th>
                <Th>Email Status</Th>
                <Th>Date</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan="9" className="p-4"><div className="h-8 bg-neutral-100 dark:bg-[#292929] rounded animate-pulse" /></td></tr>}
              {!loading && rows.map(o => (
                <tr key={o._id} className="border-t border-[#EAEAEA] dark:border-[#292929]">
                  <Td className="whitespace-nowrap font-black">#{o.orderNo}</Td>
                  <Td className="whitespace-nowrap">{o.userId?.name || o.customerSnapshot?.name || 'Guest'}<div className="text-[10px] text-neutral-400">{o.userId?.email || o.customerSnapshot?.email || ''}</div></Td>
                  <Td className="text-right tabular-nums">{formatPrice(o.total)}</Td>
                  <Td>{(o.items || []).length}</Td>
                  <Td><Pill text={o.orderStatus} /></Td>
                  <Td><Pill text={o.paymentStatus} tint="sky" /></Td>
                  <Td><Pill text={o.emailStatus || 'PENDING'} tint={o.emailStatus === 'SENT' ? 'emerald' : o.emailStatus === 'FAILED' ? 'rose' : 'amber'} /></Td>
                  <Td className="whitespace-nowrap">{new Date(o.createdAt).toLocaleDateString()}</Td>
                  <Td className="whitespace-nowrap">
                    {o.paymentStatus === 'PAID' && (
                      <button onClick={() => handleResendEmail(o._id, o.orderNo)} className="mr-1 px-2.5 py-1 rounded-lg bg-pink-50 dark:bg-pink-950/40 text-[#FF005C] border border-[#FF005C]/30 text-[10px] font-black">Resend Email</button>
                    )}
                    {o.orderStatus !== 'FULFILLED' && (
                      <button onClick={() => updateStatus(o._id, 'FULFILLED', 'PAID')} className="mr-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 text-[10px] font-black">Fulfill</button>
                    )}
                    {o.orderStatus === 'PAYMENT_PENDING' && (
                      <button onClick={() => updateStatus(o._id, 'PAID', 'PAID')} className="mr-1 px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border border-sky-200 text-[10px] font-black">Mark Paid</button>
                    )}
                    {o.orderStatus !== 'REFUNDED' && o.paymentStatus === 'PAID' && (
                      <button onClick={() => updateStatus(o._id, 'REFUNDED', 'REFUNDED')} className="mr-1 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 text-[10px] font-black">Refund</button>
                    )}
                    {o.orderStatus !== 'CANCELLED' && (
                      <button onClick={() => updateStatus(o._id, 'CANCELLED', 'CANCELLED')} className="px-2.5 py-1 rounded-lg bg-neutral-100 text-neutral-600 border border-neutral-200 text-[10px] font-black">Cancel</button>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && rows.length === 0 && <Empty title="No orders" />}
      </div>
    </div>
  );
}

function UsersAdmin() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const refresh = async () => {
    setLoading(true);
    const res = await adminApi.users(search ? { search } : {});
    setRows(res.data || []);
    setLoading(false);
  };
  useEffect(() => {
    const t = setTimeout(refresh, 300);
    return () => clearTimeout(t);
  }, [search]);

  const toggle = async (u) => {
    const next = u.status === 'active' ? 'disabled' : 'active';
    await adminApi.setUserStatus(u._id, next);
    refresh();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl tracking-tight">Customer Management</h1>
          <p className="text-xs font-bold text-neutral-500 dark:text-[#B5B5B5]">Search registered customers, inspect order histories, and toggle account access.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929]">
          <Search className="w-4 h-4 text-neutral-400" />
          <input placeholder="Search name / email / phone" value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent outline-none text-xs font-bold w-60" />
        </div>
      </div>

      <div className="rounded-3xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-bold">
            <thead className="bg-neutral-50 dark:bg-[#0E0E0E] text-neutral-500">
              <tr>
                <Th>Customer</Th>
                <Th>Phone</Th>
                <Th>Role</Th>
                <Th>Status</Th>
                <Th className="text-right">Orders</Th>
                <Th className="text-right">Vouchers</Th>
                <Th>Joined</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan="8" className="p-4"><div className="h-8 bg-neutral-100 dark:bg-[#292929] rounded animate-pulse" /></td></tr>}
              {!loading && rows.map(u => (
                <tr key={u._id} className="border-t border-[#EAEAEA] dark:border-[#292929]">
                  <Td>
                    <div className="font-black text-sm">{u.name}</div>
                    <div className="text-[10px] text-neutral-400">{u.email}</div>
                  </Td>
                  <Td>{u.phone || '—'}</Td>
                  <Td><span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${u.role === 'admin' ? 'bg-[#FF005C]/10 text-[#FF005C] border-[#FF005C]/20' : 'bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300'}`}>{u.role}</span></Td>
                  <Td><Pill text={u.status} tint={u.status === 'active' ? 'emerald' : 'rose'} /></Td>
                  <Td className="text-right tabular-nums">{u.orderCount || 0}</Td>
                  <Td className="text-right tabular-nums">{u.voucherCount || 0}</Td>
                  <Td>{new Date(u.createdAt).toLocaleDateString()}</Td>
                  <Td>
                    <button onClick={() => toggle(u)} className="px-3 py-1.5 rounded-xl border text-[10px] font-black border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200">
                      {u.status === 'active' ? 'Disable' : 'Enable'}
                    </button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && rows.length === 0 && <Empty title="No customers" />}
      </div>
    </div>
  );
}

function PromotionsAdmin() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({
    name: '', code: '', description: '', discountType: 'percentage', discountValue: 0,
    minimumOrderAmount: 0, maximumDiscount: null, startAt: new Date().toISOString().slice(0, 10),
    endAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 10),
    active: true, usageLimit: null, perUserLimit: 1, firstOrderOnly: false,
  });

  const refresh = async () => {
    setLoading(true);
    const res = await adminApi.promotions();
    setRows(res.data || []);
    setLoading(false);
  };
  useEffect(() => { refresh(); }, []);

  const startCreate = () => {
    setCreating(true);
    setEditing(null);
    setDraft({
      name: '', code: '', description: '', discountType: 'percentage', discountValue: 0,
      minimumOrderAmount: 0, maximumDiscount: null, startAt: new Date().toISOString().slice(0, 10),
      endAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 10),
      active: true, usageLimit: null, perUserLimit: 1, firstOrderOnly: false,
    });
  };

  const save = async () => {
    if (!draft.name || !draft.code || draft.discountValue <= 0) {
      alert('Name, code, and discount value are required.');
      return;
    }
    const payload = {
      ...draft,
      discountValue: Number(draft.discountValue) || 0,
      minimumOrderAmount: Number(draft.minimumOrderAmount) || 0,
      maximumDiscount: draft.maximumDiscount ? Number(draft.maximumDiscount) : null,
      usageLimit: draft.usageLimit ? Number(draft.usageLimit) : null,
      perUserLimit: draft.perUserLimit ? Number(draft.perUserLimit) : null,
      startAt: new Date(draft.startAt),
      endAt: new Date(draft.endAt),
    };
    const res = creating
      ? await adminApi.createPromotion(payload)
      : await adminApi.updatePromotion(editing._id, payload);
    if (res.success) {
      setCreating(false);
      setEditing(null);
      refresh();
    } else alert(res.message || 'Failed to save promotion');
  };

  const remove = async (p) => {
    if (!confirm(`Delete promotion ${p.name}?`)) return;
    const res = await adminApi.deletePromotion(p._id);
    if (res.success) refresh();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl tracking-tight">Promotions & Event Discounts</h1>
          <p className="text-xs font-bold text-neutral-500 dark:text-[#B5B5B5]">Manage promotional campaigns, storewide vouchers, and discount rules.</p>
        </div>
        <button onClick={startCreate} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl btn-pink text-white font-black text-xs shadow-lg">
          <Plus className="w-4 h-4" /> New Promotion
        </button>
      </div>

      {(creating || editing) && (
        <FormCard title={creating ? 'Create Promotion' : 'Edit Promotion'} onClose={() => { setCreating(false); setEditing(null); }} onSave={save}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Promotion Name *" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} />
            <Field label="Promo Code *" value={draft.code} onChange={(v) => setDraft({ ...draft, code: String(v).toUpperCase() })} />
            <div>
              <Label>Discount Type</Label>
              <select value={draft.discountType} onChange={(e) => setDraft({ ...draft, discountType: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-sm font-bold focus:outline-none focus:border-[#FF005C]">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>
            <Field label={`Discount Value * (${draft.discountType === 'percentage' ? '%' : '₹'})`} type="number" value={draft.discountValue} onChange={(v) => setDraft({ ...draft, discountValue: v })} />
            <Field label="Minimum Order Amount (₹)" type="number" value={draft.minimumOrderAmount} onChange={(v) => setDraft({ ...draft, minimumOrderAmount: v })} />
            <Field label="Maximum Discount (₹, optional)" type="number" value={draft.maximumDiscount ?? ''} onChange={(v) => setDraft({ ...draft, maximumDiscount: v || null })} />
            <Field label="Start Date" type="date" value={String(draft.startAt || '').slice(0, 10)} onChange={(v) => setDraft({ ...draft, startAt: v })} />
            <Field label="End Date" type="date" value={String(draft.endAt || '').slice(0, 10)} onChange={(v) => setDraft({ ...draft, endAt: v })} />
            <Field label="Global Usage Limit (optional)" type="number" value={draft.usageLimit ?? ''} onChange={(v) => setDraft({ ...draft, usageLimit: v || null })} />
            <Field label="Per-User Limit (optional)" type="number" value={draft.perUserLimit ?? ''} onChange={(v) => setDraft({ ...draft, perUserLimit: v || null })} />
            <div className="md:col-span-2 grid grid-cols-2 gap-3">
              <Check label="Active" checked={!!draft.active} onChange={(v) => setDraft({ ...draft, active: v })} />
              <Check label="First-order only" checked={!!draft.firstOrderOnly} onChange={(v) => setDraft({ ...draft, firstOrderOnly: v })} />
            </div>
            <div className="md:col-span-2">
              <TextArea label="Description (optional)" value={draft.description || ''} onChange={(v) => setDraft({ ...draft, description: v })} />
            </div>
          </div>
        </FormCard>
      )}

      <div className="rounded-3xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-bold">
            <thead className="bg-neutral-50 dark:bg-[#0E0E0E] text-neutral-500">
              <tr>
                <Th>Campaign</Th>
                <Th>Code</Th>
                <Th>Discount</Th>
                <Th>Valid Dates</Th>
                <Th>Usage</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan="7" className="p-4"><div className="h-8 bg-neutral-100 dark:bg-[#292929] rounded animate-pulse" /></td></tr>}
              {!loading && rows.map(p => (
                <tr key={p._id} className="border-t border-[#EAEAEA] dark:border-[#292929]">
                  <Td>
                    <div className="font-black text-sm">{p.name}</div>
                    <div className="text-[10px] text-neutral-400 max-w-xs truncate">{p.description}</div>
                  </Td>
                  <Td className="font-mono whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FFF0F5] dark:bg-[#2A0A17] text-[#FF005C] border border-[#FF005C]/20 font-black">
                      {p.code}
                      <button onClick={() => navigator.clipboard?.writeText(p.code)} className="ml-1"><Copy className="w-3 h-3" /></button>
                    </div>
                  </Td>
                  <Td className="whitespace-nowrap">
                    {p.discountType === 'percentage' ? `${p.discountValue}%` : formatPrice(p.discountValue)}
                    {p.maximumDiscount ? <span className="text-[10px] ml-1 text-neutral-400">Max {formatPrice(p.maximumDiscount)}</span> : null}
                  </Td>
                  <Td className="whitespace-nowrap text-neutral-500">{new Date(p.startAt).toLocaleDateString()} → {new Date(p.endAt).toLocaleDateString()}</Td>
                  <Td>{p.usageCount}{p.usageLimit ? ` / ${p.usageLimit}` : ''}</Td>
                  <Td>
                    {p.active ? <Pill text="Active" /> : <Pill text="Inactive" tint="neutral" />}
                  </Td>
                  <Td className="text-right whitespace-nowrap">
                    <div className="inline-flex gap-1">
                      <button onClick={() => { setEditing(p); setCreating(false); setDraft({ ...p, startAt: String(p.startAt).slice(0, 10), endAt: String(p.endAt).slice(0, 10) }); }} className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border border-sky-200"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => remove(p)} className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && rows.length === 0 && <Empty title="No active promotions" desc="Create your first discount campaign." />}
      </div>
    </div>
  );
}

function AuditLogsAdmin() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    const res = await adminApi.auditLogs();
    setRows(res.data || []);
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl tracking-tight">Admin Audit Trail</h1>
          <p className="text-xs font-bold text-neutral-500 dark:text-[#B5B5B5]">Track every price edit, product creation, status change, and voucher operation.</p>
        </div>
        <button onClick={refresh} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] font-black text-xs shadow-sm hover:border-[#FF005C]">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="rounded-3xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-bold">
            <thead className="bg-neutral-50 dark:bg-[#0E0E0E] text-neutral-500">
              <tr>
                <Th>Timestamp</Th>
                <Th>Admin</Th>
                <Th>Action</Th>
                <Th>Resource</Th>
                <Th>Details / Diffs</Th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan="5" className="p-4"><div className="h-8 bg-neutral-100 dark:bg-[#292929] rounded animate-pulse" /></td></tr>}
              {!loading && rows.map((log) => (
                <tr key={log._id} className="border-t border-[#EAEAEA] dark:border-[#292929]">
                  <Td className="whitespace-nowrap text-neutral-500">{new Date(log.createdAt).toLocaleString()}</Td>
                  <Td className="whitespace-nowrap font-black">{log.adminEmail}</Td>
                  <Td><span className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-[#262626] font-mono text-[10px] font-black">{log.action}</span></Td>
                  <Td className="whitespace-nowrap">{log.resourceType} {log.resourceId ? `#${log.resourceId.slice(-6)}` : ''}</Td>
                  <Td className="font-mono text-[11px] text-neutral-600 dark:text-neutral-300">
                    {JSON.stringify(log.details || {})}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && rows.length === 0 && <Empty title="No audit logs recorded yet" desc="Admin actions will appear here automatically." />}
      </div>
    </div>
  );
}

function FormCard({ title, onClose, onSave, children }) {
  return (
    <div className="mb-6 rounded-3xl p-6 bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-black text-lg">{title}</h3>
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="px-3 py-2 rounded-xl bg-neutral-100 dark:bg-[#262626] text-xs font-black text-neutral-600 dark:text-neutral-300 flex items-center gap-1.5">
            <X className="w-4 h-4" /> Cancel
          </button>
          <button onClick={onSave} className="px-4 py-2 rounded-xl btn-pink text-white font-black text-xs flex items-center gap-1.5 shadow-lg">
            <Save className="w-4 h-4" /> Save Changes
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}

function Th({ children, className = '' }) {
  return <th className={`text-[10px] font-black uppercase tracking-wider px-4 py-3 text-left ${className}`}>{children}</th>;
}
function Td({ children, className = '' }) {
  return <td className={`px-4 py-3 align-top text-neutral-700 dark:text-neutral-200 ${className}`}>{children}</td>;
}
function Label({ children }) { return <span className="block text-[11px] font-black uppercase tracking-wider text-neutral-500 dark:text-[#B5B5B5] mb-2">{children}</span>; }
function Field({ label, type = 'text', value, onChange, required, placeholder }) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <input type={type} value={value ?? ''} required={required} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-sm font-bold focus:outline-none focus:border-[#FF005C] transition"
      />
    </label>
  );
}
function TextArea({ label, value, onChange, rows = 3 }) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <textarea rows={rows} value={value ?? ''} onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-sm font-bold focus:outline-none focus:border-[#FF005C] transition whitespace-pre-wrap"
      />
    </label>
  );
}
function Check({ label, checked, onChange }) {
  return (
    <label className="inline-flex items-center gap-2.5 px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 accent-[#FF005C]" />
      <span className="text-xs font-black text-neutral-700 dark:text-neutral-200">{label}</span>
    </label>
  );
}

function SEOScoreBadge({ score, grade, gradeColor, size = 'md' }) {
  const safeScore = Math.max(0, Math.min(100, Number(score) || 0));
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (safeScore / 100) * circumference;
  const sizeClass = size === 'lg' ? 'w-28 h-28' : size === 'sm' ? 'w-14 h-14' : 'w-20 h-20';
  const svgSize = size === 'lg' ? 112 : size === 'sm' ? 56 : 80;
  const titleSize = size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-xs' : 'text-xl';
  const gradeSize = size === 'lg' ? 'text-[10px]' : size === 'sm' ? 'text-[8px]' : 'text-[10px]';

  return (
    <div className={`${sizeClass} relative shrink-0`}>
      <svg width={svgSize} height={svgSize} className="transform -rotate-90">
        <circle cx={svgSize/2} cy={svgSize/2} r={svgSize/2 - 6} stroke="currentColor" strokeWidth="6" fill="none" className="text-neutral-200 dark:text-[#262626]" />
        <circle cx={svgSize/2} cy={svgSize/2} r={svgSize/2 - 6} stroke={gradeColor || '#10B981'} strokeWidth="6" fill="none" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-500" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-heading font-black ${titleSize}`}>{safeScore}</span>
        {grade && <span className={`font-black ${gradeSize} uppercase tracking-wider mt-0.5`} style={{ color: gradeColor || '#10B981' }}>{grade}</span>}
      </div>
    </div>
  );
}

function CharCounter({ value, min, max, idealMin, idealMax }) {
  const len = String(value || '').length;
  let status = 'neutral';
  let tint = '#94A3B8';
  if (len === 0) { status = 'empty'; tint = '#EF4444'; }
  else if (len < (idealMin || min || 0)) { status = 'short'; tint = '#F59E0B'; }
  else if (len > (idealMax || max || 9999)) { status = 'long'; tint = '#F59E0B'; }
  else { status = 'good'; tint = '#10B981'; }

  return (
    <div className="flex items-center justify-between mt-1.5">
      <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: tint }}>
        {status === 'empty' && '⚠ Empty'}
        {status === 'short' && '⚠ Short'}
        {status === 'long' && '⚠ Long'}
        {status === 'good' && '✓ Good length'}
      </span>
      <span className="text-[10px] font-mono font-bold text-neutral-500">
        {len}{max ? ` / ${max}` : ''}
        {idealMin && idealMax && <span className="text-neutral-400 ml-1">(ideal {idealMin}–{idealMax})</span>}
      </span>
    </div>
  );
}

function GooglePreview({ title, description, url, siteName = 'Apex Vouchers' }) {
  const displayTitle = (title || 'Untitled Page').slice(0, 70);
  const displayDesc = (description || 'No meta description set yet.').slice(0, 170);
  const cleanUrl = url || '/exam-vouchers/your-slug';
  return (
    <div className="rounded-2xl border border-[#EAEAEA] dark:border-[#292929] bg-white dark:bg-[#0E0E0E] p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-full bg-[#6C3CE0]/20 flex items-center justify-center font-black text-[8px] text-[#6C3CE0]">AP</div>
        <div>
          <div className="text-[11px] font-bold text-neutral-900 dark:text-white leading-tight">{siteName}</div>
          <div className="text-[10px] font-semibold text-neutral-500 truncate max-w-xs">{cleanUrl}</div>
        </div>
      </div>
      <div className="text-[15px] font-semibold text-[#1a0dab] dark:text-[#8ab4f8] leading-snug mb-1 cursor-pointer hover:underline line-clamp-2">
        {displayTitle}
      </div>
      <div className="text-[13px] leading-relaxed text-neutral-700 dark:text-neutral-300 line-clamp-2">
        {displayDesc}
      </div>
      <div className="mt-2 pt-2 border-t border-[#EAEAEA] dark:border-[#262626] flex items-center gap-1.5">
        <Info className="w-3 h-3 text-neutral-400 shrink-0" />
        <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Preview only — actual Google display may vary</span>
      </div>
    </div>
  );
}

function SocialPreview({ variant = 'og', title, description, image, url, siteName = 'Apex Vouchers' }) {
  const safeTitle = title || (variant === 'og' ? 'Open Graph Title' : 'Twitter Title');
  const safeDesc = description || '';
  const safeImage = image || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=420&fit=crop&auto=format';
  const isTwitter = variant === 'twitter';
  return (
    <div className={`rounded-2xl border border-[#EAEAEA] dark:border-[#292929] overflow-hidden bg-white dark:bg-[#0E0E0E] ${isTwitter ? 'max-w-sm' : ''}`}>
      <div className="aspect-[1200/630] bg-neutral-100 dark:bg-[#161616] relative overflow-hidden">
        <img src={safeImage} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        <div className="absolute inset-0 flex items-center justify-center text-neutral-300 dark:text-[#333] font-black text-xs">
          {!image && isTwitter ? 'Twitter Card Image (1200×675)' : !image ? 'OG Image (1200×630)' : ''}
        </div>
      </div>
      <div className="p-3">
        <div className="text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1">{siteName}</div>
        <div className={`font-black ${isTwitter ? 'text-[13px]' : 'text-[14px]'} text-neutral-900 dark:text-white leading-snug line-clamp-2 mb-1`}>
          {safeTitle}
        </div>
        {safeDesc && <div className="text-[11px] leading-snug text-neutral-500 dark:text-neutral-400 line-clamp-2">{safeDesc}</div>}
      </div>
    </div>
  );
}

function SEOChecklist({ checks = [], successes = [], warnings = [], issues = [] }) {
  const all = [
    ...(successes || []).map(t => ({ type: 'good', text: t })),
    ...(warnings || []).map(t => ({ type: 'warn', text: t })),
    ...(issues || []).map(t => ({ type: 'bad', text: t })),
    ...(checks || []).map(c => ({ type: c.passed ? 'good' : c.warning ? 'warn' : 'bad', text: c.text })),
  ];
  if (all.length === 0) return <div className="text-[11px] font-bold text-neutral-400 italic">No analysis yet — enter SEO fields to see checks.</div>;
  return (
    <ul className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
      {all.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-[11px] leading-snug">
          {item.type === 'good' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />}
          {item.type === 'warn' && <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />}
          {item.type === 'bad' && <AlertOctagon className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />}
          <span className={`font-semibold ${item.type === 'good' ? 'text-neutral-700 dark:text-neutral-200' : item.type === 'warn' ? 'text-amber-700 dark:text-amber-300' : 'text-rose-700 dark:text-rose-300'}`}>{item.text}</span>
        </li>
      ))}
    </ul>
  );
}

function RichTextToolbar({ onFormat }) {
  const btns = [
    { id: 'h2', label: 'H2', title: 'Heading 2' },
    { id: 'h3', label: 'H3', title: 'Heading 3' },
    { id: 'p', label: '¶', title: 'Paragraph' },
    { id: 'strong', label: 'B', title: 'Bold' },
    { id: 'em', label: 'I', title: 'Italic' },
    { id: 'ul', label: '• List', title: 'Bulleted List' },
    { id: 'ol', label: '1. List', title: 'Numbered List' },
    { id: 'a', label: 'Link', title: 'Hyperlink' },
    { id: 'table', label: '▦ Table', title: 'Table' },
    { id: 'clear', label: '✕ Clear', title: 'Clear formatting' },
  ];
  return (
    <div className="flex flex-wrap gap-1.5 p-2 rounded-t-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-b-0 border-[#EAEAEA] dark:border-[#292929]">
      {btns.map(b => (
        <button key={b.id} onClick={() => onFormat?.(b.id)} title={b.title}
          className="px-2 py-1 rounded-lg text-[10px] font-black bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] text-neutral-700 dark:text-neutral-200 hover:border-[#FF005C] hover:text-[#FF005C] transition">
          {b.label}
        </button>
      ))}
    </div>
  );
}

function SEOProductEditor({ product, onClose, onSaved }) {
  const pid = product?._id || product?.id;
  const [form, setForm] = useState(() => ({
    seo: {
      title: product?.seo?.title || product?.seoTitle || '',
      description: product?.seo?.description || product?.seoDescription || '',
      slug: product?.seo?.slug || product?.slug || '',
      focusKeyword: product?.seo?.focusKeyword || '',
      secondaryKeywords: (product?.seo?.secondaryKeywords || []).join('\n'),
      canonicalUrl: product?.seo?.canonicalUrl || '',
      ogTitle: product?.seo?.ogTitle || '',
      ogDescription: product?.seo?.ogDescription || '',
      ogImage: product?.seo?.ogImage || '',
      twitterTitle: product?.seo?.twitterTitle || '',
      twitterDescription: product?.seo?.twitterDescription || '',
      twitterImage: product?.seo?.twitterImage || '',
      noindex: !!product?.seo?.noindex,
      nofollow: !!product?.seo?.nofollow,
    },
    richDescription: product?.richDescription || product?.description || '',
    imageSeo: product?.imageSeo || { altText: '', imageTitle: '', caption: '' },
    faqs: (product?.faqs || []).length > 0
      ? (product?.faqs || []).map(f => `${f.question}\n${f.answer}`).join('\n---\n')
      : '',
    relatedProducts: (product?.relatedProducts || []).map(r => typeof r === 'object' ? (r._id || r.id) : r).join(','),
    description: product?.description || '',
    slug: product?.slug || '',
  }));
  const [seoSubTab, setSeoSubTab] = useState('basic');
  const [saving, setSaving] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const runAnalysis = useCallback(async () => {
    setAnalyzing(true);
    try {
      const sks = String(form.seo.secondaryKeywords || '').split('\n').map(s => s.trim()).filter(Boolean);
      const res = await adminApi.seo.analyzeInline({
        type: 'product',
        name: product?.name || '',
        seoTitle: form.seo.title,
        seoDescription: form.seo.description,
        slug: form.seo.slug || form.slug,
        focusKeyword: form.seo.focusKeyword,
        secondaryKeywords: sks,
        canonicalUrl: form.seo.canonicalUrl,
        description: form.description,
        richDescription: form.richDescription,
        imageAlt: form.imageSeo?.altText,
        imagePresent: !!(product?.image || product?.logo),
        faqCount: form.faqs ? form.faqs.split('---').length : 0,
        relatedCount: form.relatedProducts ? form.relatedProducts.split(',').filter(Boolean).length : 0,
        noindex: form.seo.noindex,
      });
      if (res) setAnalysis(res);
    } catch (e) { /* ignore */ } finally { setAnalyzing(false); }
  }, [form, product]);

  useEffect(() => {
    const t = setTimeout(runAnalysis, 600);
    return () => clearTimeout(t);
  }, [runAnalysis]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const sks = String(form.seo.secondaryKeywords || '').split('\n').map(s => s.trim()).filter(Boolean);
      const faqs = String(form.faqs || '').split(/\n---\n/).map(block => {
        const [q, ...rest] = block.split('\n');
        return { question: (q || '').trim(), answer: rest.join('\n').trim() };
      }).filter(f => f.question);
      const related = String(form.relatedProducts || '').split(',').map(s => s.trim()).filter(Boolean);

      const res = await adminApi.seo.updateProductSEO(pid, {
        seo: { ...form.seo, secondaryKeywords: sks },
        richDescription: form.richDescription,
        imageSeo: form.imageSeo,
        faqs,
        relatedProducts: related,
        description: form.description,
        slug: form.seo.slug || form.slug,
      });
      if (res?.success) {
        alert('✅ SEO saved successfully!');
        onSaved?.(res);
        onClose?.();
      } else alert(res?.message || 'Failed to save SEO');
    } catch (e) { alert(e.message || 'Save failed'); } finally { setSaving(false); }
  };

  const insertFormatting = (type) => {
    const ta = document.getElementById('rich-desc-ta');
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const before = form.richDescription.slice(0, start);
    const selected = form.richDescription.slice(start, end) || 'text';
    const after = form.richDescription.slice(end);
    let wrap = selected;
    switch (type) {
      case 'h2': wrap = `\n\n<h2>${selected}</h2>\n\n`; break;
      case 'h3': wrap = `\n\n<h3>${selected}</h3>\n\n`; break;
      case 'p': wrap = `\n\n<p>${selected}</p>\n\n`; break;
      case 'strong': wrap = `<strong>${selected}</strong>`; break;
      case 'em': wrap = `<em>${selected}</em>`; break;
      case 'ul': wrap = `\n\n<ul>\n  <li>${selected}</li>\n  <li>Item 2</li>\n</ul>\n\n`; break;
      case 'ol': wrap = `\n\n<ol>\n  <li>${selected}</li>\n  <li>Step 2</li>\n</ol>\n\n`; break;
      case 'a': { const href = prompt('Enter URL:'); if (href) wrap = `<a href="${href}" target="_blank" rel="noopener">${selected}</a>`; break; }
      case 'table': wrap = `\n\n<table>\n  <thead><tr><th>Header 1</th><th>Header 2</th></tr></thead>\n  <tbody><tr><td>Cell A1</td><td>Cell B1</td></tr></tbody>\n</table>\n\n`; break;
      case 'clear': wrap = ''; break;
      default: break;
    }
    setForm({ ...form, richDescription: before + wrap + after });
  };

  const seoSubTabs = [
    { id: 'basic', label: 'Basic SEO', icon: <Hash className="w-3.5 h-3.5" /> },
    { id: 'content', label: 'Content', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'social', label: 'Social', icon: <Globe className="w-3.5 h-3.5" /> },
    { id: 'image', label: 'Image SEO', icon: <ImageIcon className="w-3.5 h-3.5" /> },
    { id: 'advanced', label: 'Advanced', icon: <Settings2 className="w-3.5 h-3.5" /> },
    { id: 'faqs', label: 'FAQs', icon: <ListChecks className="w-3.5 h-3.5" /> },
    { id: 'related', label: 'Related', icon: <Link2 className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="mb-6 rounded-3xl p-6 bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm">
      <div className="flex items-start justify-between mb-5 flex-wrap gap-4">
        <div className="flex items-start gap-4">
          <SEOScoreBadge score={analysis?.score ?? 0} grade={analysis?.grade} gradeColor={analysis?.gradeColor} size="lg" />
          <div>
            <h3 className="font-black text-lg mb-1">🧠 Product SEO Editor — {product?.name}</h3>
            <p className="text-[11px] font-bold text-neutral-500 max-w-lg">Configure search metadata, long-form content, and social sharing. Updates are sanitized on the server and applied in real-time to live product pages.</p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#6C3CE0]/10 text-[#6C3CE0] border border-[#6C3CE0]/20">
              <Info className="w-3 h-3" />
              <span className="text-[9px] font-black uppercase tracking-wider">Apex SEO Score — not a Google ranking score</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={runAnalysis} disabled={analyzing}
            className="px-3 py-2 rounded-xl bg-neutral-100 dark:bg-[#262626] text-xs font-black text-neutral-600 dark:text-neutral-300 flex items-center gap-1.5 disabled:opacity-60">
            <RefreshCw className={`w-4 h-4 ${analyzing ? 'animate-spin' : ''}`} /> Re-analyze
          </button>
          <button onClick={onClose} className="px-3 py-2 rounded-xl bg-neutral-100 dark:bg-[#262626] text-xs font-black text-neutral-600 dark:text-neutral-300 flex items-center gap-1.5">
            <X className="w-4 h-4" /> Close
          </button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-xl btn-pink text-white font-black text-xs flex items-center gap-1.5 shadow-lg disabled:opacity-60">
            <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save SEO'}
          </button>
        </div>
      </div>

      <div className="flex overflow-x-auto gap-1 p-1.5 rounded-2xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] mb-5">
        {seoSubTabs.map(t => (
          <button key={t.id} onClick={() => setSeoSubTab(t.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-black whitespace-nowrap transition ${
              seoSubTab === t.id ? 'bg-[#FF005C] text-white shadow-sm' : 'text-neutral-600 dark:text-neutral-300 hover:bg-white dark:hover:bg-[#161616]'
            }`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {seoSubTab === 'basic' && (
            <div className="space-y-4">
              <div>
                <Label>SEO Title</Label>
                <input value={form.seo.title} onChange={e => setForm({ ...form, seo: { ...form.seo, title: e.target.value } })}
                  placeholder="e.g. PTE Academic Voucher India – Save ₹3000+ | Apex Vouchers"
                  className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-sm font-bold focus:outline-none focus:border-[#FF005C]" />
                <CharCounter value={form.seo.title} idealMin={30} idealMax={60} max={100} />
              </div>
              <div>
                <Label>Meta Description</Label>
                <textarea rows={3} value={form.seo.description} onChange={e => setForm({ ...form, seo: { ...form.seo, description: e.target.value } })}
                  placeholder="Buy PTE Academic exam vouchers at discounted prices. 10-second WhatsApp + email delivery, 6-12 month validity, 100% genuine official codes from Apex Vouchers."
                  className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-sm font-bold focus:outline-none focus:border-[#FF005C]" />
                <CharCounter value={form.seo.description} idealMin={80} idealMax={160} max={250} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>URL Slug</Label>
                  <div className="flex items-center rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] overflow-hidden">
                    <span className="px-3 text-[11px] font-mono font-bold text-neutral-400 border-r border-[#EAEAEA] dark:border-[#292929] bg-neutral-100 dark:bg-[#161616]">/exam-vouchers/</span>
                    <input value={form.seo.slug || form.slug} onChange={e => {
                      const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
                      setForm({ ...form, seo: { ...form.seo, slug: val }, slug: val });
                    }} placeholder="pte-academic-voucher"
                      className="flex-1 px-3 py-3 bg-transparent text-sm font-mono font-bold focus:outline-none" />
                  </div>
                  {product?.slug && (form.seo.slug || form.slug) && (form.seo.slug || form.slug) !== product?.slug && (
                    <div className="mt-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 flex items-start gap-2">
                      <ArrowLeftRight className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <div className="text-[10px] font-bold text-amber-700 dark:text-amber-300 leading-snug">
                        ⚠ Slug changed from <span className="font-mono">{product?.slug}</span> → <span className="font-mono">{form.seo.slug || form.slug}</span>. A 301 redirect will be automatically created on save.
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <Label>Canonical URL (optional)</Label>
                  <input value={form.seo.canonicalUrl} onChange={e => setForm({ ...form, seo: { ...form.seo, canonicalUrl: e.target.value } })}
                    placeholder="https://apexvouchers.com/exam-vouchers/..."
                    className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-sm font-bold focus:outline-none focus:border-[#FF005C]" />
                  <div className="mt-1.5 text-[10px] font-bold text-neutral-400">Leave empty to auto-generate from slug.</div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Focus Keyword</Label>
                  <input value={form.seo.focusKeyword} onChange={e => setForm({ ...form, seo: { ...form.seo, focusKeyword: e.target.value } })}
                    placeholder="e.g. PTE Academic Voucher"
                    className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-sm font-bold focus:outline-none focus:border-[#FF005C]" />
                </div>
                <div>
                  <Label>Secondary Keywords (one per line)</Label>
                  <textarea rows={4} value={form.seo.secondaryKeywords} onChange={e => setForm({ ...form, seo: { ...form.seo, secondaryKeywords: e.target.value } })}
                    placeholder="PTE voucher&#10;PTE exam voucher India&#10;PTE Academic discount"
                    className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-[11px] font-mono focus:outline-none focus:border-[#FF005C]" />
                </div>
              </div>
            </div>
          )}

          {seoSubTab === 'content' && (
            <div className="space-y-4">
              <div>
                <Label>Short Description (legacy card text)</Label>
                <textarea rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-sm font-bold focus:outline-none focus:border-[#FF005C]" />
              </div>
              <div>
                <Label>Long-form Rich Description (H2/H3 allowed)</Label>
                <RichTextToolbar onFormat={insertFormatting} />
                <textarea id="rich-desc-ta" rows={14} value={form.richDescription} onChange={e => setForm({ ...form, richDescription: e.target.value })}
                  placeholder="<h2>What is a PTE Academic Voucher?</h2>&#10;<p>A PTE Academic voucher is a pre-paid exam code...</p>"
                  className="w-full px-4 py-3 rounded-b-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-[11px] font-mono leading-relaxed focus:outline-none focus:border-[#FF005C] whitespace-pre-wrap" />
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-neutral-400">Supported HTML: h2, h3, h4, p, strong, em, ul, ol, li, a, br, table, thead, tbody, tr, th, td, span, div. Unsafe tags are stripped on save.</span>
                  <span className="text-[10px] font-mono font-bold text-neutral-500">{String(form.richDescription || '').replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length} words</span>
                </div>
              </div>
            </div>
          )}

          {seoSubTab === 'social' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="!mb-0">Facebook / Open Graph</Label>
                  <span className="text-[9px] font-black uppercase tracking-wider text-[#1877F2]">OG</span>
                </div>
                <Field label="OG Title" value={form.seo.ogTitle} onChange={v => setForm({ ...form, seo: { ...form.seo, ogTitle: v } })} placeholder="Falls back to SEO title" />
                <TextArea label="OG Description" value={form.seo.ogDescription} onChange={v => setForm({ ...form, seo: { ...form.seo, ogDescription: v } })} rows={2} />
                <Field label="OG Image URL (1200×630)" value={form.seo.ogImage} onChange={v => setForm({ ...form, seo: { ...form.seo, ogImage: v } })} placeholder="https://..." />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="!mb-0">Twitter / X Card</Label>
                  <span className="text-[9px] font-black uppercase tracking-wider text-neutral-500">X</span>
                </div>
                <Field label="Twitter Title" value={form.seo.twitterTitle} onChange={v => setForm({ ...form, seo: { ...form.seo, twitterTitle: v } })} placeholder="Falls back to OG/SEO title" />
                <TextArea label="Twitter Description" value={form.seo.twitterDescription} onChange={v => setForm({ ...form, seo: { ...form.seo, twitterDescription: v } })} rows={2} />
                <Field label="Twitter Image URL (1200×675)" value={form.seo.twitterImage} onChange={v => setForm({ ...form, seo: { ...form.seo, twitterImage: v } })} placeholder="https://..." />
              </div>
            </div>
          )}

          {seoSubTab === 'image' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#F3EEFF] dark:bg-[#1e1638] border border-[#6C3CE0]/20 flex items-start gap-3">
                {product?.image ? <img src={product.image} alt="" className="w-24 h-24 rounded-xl object-cover shrink-0 border border-[#6C3CE0]/30" /> : <div className="w-24 h-24 rounded-xl bg-white dark:bg-[#161616] flex items-center justify-center font-black text-[10px] text-neutral-400 border border-dashed border-[#6C3CE0]/30">No Image</div>}
                <div>
                  <div className="font-black text-xs text-[#6C3CE0] mb-1">Current Product Image</div>
                  <div className="text-[10px] font-bold text-neutral-500 break-all">{product?.image || 'Not set — upload image first in General tab.'}</div>
                </div>
              </div>
              <Field label="ALT Text (describe for visually impaired + SEO)" value={form.imageSeo?.altText || ''} onChange={v => setForm({ ...form, imageSeo: { ...form.imageSeo, altText: v } })}
                placeholder="e.g. Official PTE Academic exam voucher card from Apex Vouchers India" />
              <CharCounter value={form.imageSeo?.altText} idealMin={5} idealMax={80} max={125} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Image Title (tooltip)" value={form.imageSeo?.imageTitle || ''} onChange={v => setForm({ ...form, imageSeo: { ...form.imageSeo, imageTitle: v } })}
                  placeholder="PTE Voucher" />
                <Field label="Image Caption (shown below image)" value={form.imageSeo?.caption || ''} onChange={v => setForm({ ...form, imageSeo: { ...form.imageSeo, caption: v } })}
                  placeholder="Apex Vouchers — Authorized Pearson Reseller" />
              </div>
            </div>
          )}

          {seoSubTab === 'advanced' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-3">
                <div className="flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <span className="text-[11px] font-black text-rose-700 dark:text-rose-300 uppercase tracking-wider">Robots Control — use with caution</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Check label="Noindex — block search engines" checked={!!form.seo.noindex} onChange={v => setForm({ ...form, seo: { ...form.seo, noindex: v } })} />
                  <Check label="Nofollow — don't follow links" checked={!!form.seo.nofollow} onChange={v => setForm({ ...form, seo: { ...form.seo, nofollow: v } })} />
                </div>
                {form.seo.noindex && (
                  <div className="p-2.5 rounded-xl bg-rose-100/50 dark:bg-rose-950/40 border border-rose-300/50 dark:border-rose-900/60 text-[10px] font-bold text-rose-700 dark:text-rose-300 leading-snug">
                    ⚠ You're about to remove this product from search engines. Existing rankings will be lost. Use only for internal/test products.
                  </div>
                )}
              </div>
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] space-y-2">
                <div className="text-[11px] font-black uppercase tracking-wider text-neutral-500">Structured Data Fields (auto-filled)</div>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-neutral-500">
                  <div>Schema: Product + Offer</div>
                  <div>Price: ₹{product?.sellingPrice || '—'}</div>
                  <div>Currency: INR</div>
                  <div>Availability: {product?.inStock ? 'InStock' : 'OutOfStock'}</div>
                  <div>Brand: {product?.brand || '—'}</div>
                  <div>Seller: Apex Vouchers</div>
                </div>
                <div className="text-[10px] font-bold text-neutral-400 pt-1 border-t border-[#EAEAEA] dark:border-[#292929]">Structured data uses real database values. No fake reviews/ratings are ever generated.</div>
              </div>
            </div>
          )}

          {seoSubTab === 'faqs' && (
            <div className="space-y-4">
              <div>
                <Label>FAQ Schema (Question + Answer format)</Label>
                <div className="p-3 rounded-xl bg-[#6C3CE0]/10 dark:bg-[#1e1638] border border-[#6C3CE0]/20 mb-3 flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-[#6C3CE0] shrink-0 mt-0.5" />
                  <div className="text-[10px] font-bold text-[#6C3CE0] dark:text-[#8B5CF6] leading-snug">
                    Format: Write each FAQ as <span className="font-mono">Question line</span> followed by <span className="font-mono">Answer lines</span>. Separate multiple FAQs with a line containing exactly <span className="font-mono">---</span>. Generates FAQPage schema automatically.
                  </div>
                </div>
                <textarea rows={12} value={form.faqs} onChange={e => setForm({ ...form, faqs: e.target.value })}
                  placeholder="Is the PTE voucher valid for any test center?&#10;Yes. The official PTE voucher works at all authorized Pearson test centers across India.&#10;---&#10;How long is the voucher valid?&#10;Each voucher is valid for 6 to 12 months from date of purchase."
                  className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-[11px] font-mono leading-relaxed focus:outline-none focus:border-[#FF005C] whitespace-pre-wrap" />
                <div className="mt-1.5 text-[10px] font-bold text-neutral-500">
                  {form.faqs ? `${form.faqs.split('\n---\n').length} FAQ(s) detected` : '0 FAQs'}
                </div>
              </div>
            </div>
          )}

          {seoSubTab === 'related' && (
            <div className="space-y-4">
              <Field label="Related Product IDs (comma separated)" value={form.relatedProducts} onChange={v => setForm({ ...form, relatedProducts: v })}
                placeholder="65abc..., 65def..., 65123..." />
              <div className="text-[10px] font-bold text-neutral-400 leading-snug">
                Enter the MongoDB _id values of related products separated by commas. These appear in a "You may also like" section under the product detail modal and count as internal links for SEO.
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 leading-snug">
                ✓ Tip: If left empty, the frontend will auto-suggest related products by provider + category (top 4 by featured + displayOrder).
              </div>
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-[#EAEAEA] dark:border-[#292929] p-4 bg-neutral-50 dark:bg-[#0E0E0E]">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-black text-xs uppercase tracking-wider text-neutral-500">Apex SEO Analysis</h4>
              {analyzing && <span className="text-[9px] font-black text-[#6C3CE0] uppercase tracking-wider animate-pulse">analyzing…</span>}
            </div>
            <div className="flex items-center gap-4 mb-4">
              <SEOScoreBadge score={analysis?.score ?? 0} grade={analysis?.grade} gradeColor={analysis?.gradeColor} />
              <div className="flex-1 min-w-0">
                <div className="font-black text-sm">
                  {analysis?.grade === 'Excellent' && '🌟'}
                  {analysis?.grade === 'Good' && '✅'}
                  {analysis?.grade === 'Okay' && '👍'}
                  {analysis?.grade === 'Needs Improvement' && '⚠️'}
                  {analysis?.grade === 'Poor' && '🚨'}
                  {' '}{analysis?.grade || 'Analyzing…'}
                </div>
                <div className="text-[10px] font-bold text-neutral-500 mt-0.5 leading-snug">
                  {analysis?.breakdown ? (
                    <>Meta: {analysis.breakdown.basicMetadata || 0}/50 · Content: {analysis.breakdown.content || 0}/30 · URL: {analysis.breakdown.url || 0}/15<br/>Img: {analysis.breakdown.images || 0}/15 · Links: {analysis.breakdown.internalLinks || 0}/10 · Tech: {analysis.breakdown.technical || 0}/15</>
                  ) : 'Run analysis by filling in basic SEO fields.'}
                </div>
              </div>
            </div>
            <SEOChecklist successes={analysis?.successes} warnings={analysis?.warnings} issues={analysis?.issues} />
          </div>

          <div>
            <h4 className="font-black text-xs uppercase tracking-wider text-neutral-500 mb-3">Google Preview</h4>
            <GooglePreview
              title={form.seo.title || product?.name}
              description={form.seo.description || product?.description || product?.shortDescription}
              url={`https://apexvouchers.com/exam-vouchers/${form.seo.slug || form.slug || product?.slug || ''}`}
            />
          </div>

          <div>
            <h4 className="font-black text-xs uppercase tracking-wider text-neutral-500 mb-3">Social Previews</h4>
            <div className="space-y-3">
              <SocialPreview variant="og"
                title={form.seo.ogTitle || form.seo.title || product?.name}
                description={form.seo.ogDescription || form.seo.description}
                image={form.seo.ogImage || product?.image}
                url={`/exam-vouchers/${form.seo.slug || form.slug || product?.slug}`}
              />
              <SocialPreview variant="twitter"
                title={form.seo.twitterTitle || form.seo.ogTitle || form.seo.title || product?.name}
                description={form.seo.twitterDescription || form.seo.ogDescription || form.seo.description}
                image={form.seo.twitterImage || form.seo.ogImage || product?.image}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SEOManager() {
  const voucherCtx = useVoucher();
  const refreshProducts = voucherCtx?.refreshProducts;

  const [subTab, setSubTab] = useState('overview');
  const [overviewData, setOverviewData] = useState(null);
  const [loadingOverview, setLoadingOverview] = useState(true);

  const [pageRows, setPageRows] = useState([]);
  const [pagesLoading, setPagesLoading] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [pageDraft, setPageDraft] = useState({ seo: {} });

  const [redirectRows, setRedirectRows] = useState([]);
  const [redirectsLoading, setRedirectsLoading] = useState(false);
  const [redirectModalOpen, setRedirectModalOpen] = useState(false);
  const [editingRedirect, setEditingRedirect] = useState(null);
  const [redirectDraft, setRedirectDraft] = useState({ sourcePath: '', targetPath: '', type: '301', enabled: true, notes: '' });
  const [redirectSearch, setRedirectSearch] = useState('');

  const [blogRows, setBlogRows] = useState([]);
  const [blogsLoading, setBlogsLoading] = useState(false);
  const [blogModalOpen, setBlogModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [blogDraft, setBlogDraft] = useState({ title: '', slug: '', excerpt: '', content: '', coverImage: '', author: '', category: '', tags: '', published: true, featured: false, seo: {} });

  const [globalForm, setGlobalForm] = useState({});
  const [globalLoading, setGlobalLoading] = useState(true);
  const [globalSaving, setGlobalSaving] = useState(false);

  const [productSEOEditing, setProductSEOEditing] = useState(null);

  const subTabs = [
    { id: 'overview', label: 'SEO Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'products', label: 'Products SEO', icon: <Package className="w-4 h-4" /> },
    { id: 'pages', label: 'Pages SEO', icon: <FileSpreadsheet className="w-4 h-4" /> },
    { id: 'blogs', label: 'Blog Posts', icon: <FileText className="w-4 h-4" /> },
    { id: 'redirects', label: 'Redirect Manager', icon: <ArrowLeftRight className="w-4 h-4" /> },
    { id: 'global', label: 'Global Settings', icon: <Settings2 className="w-4 h-4" /> },
    { id: 'sitemap', label: 'Sitemap & Robots', icon: <Code2 className="w-4 h-4" /> },
  ];

  const loadOverview = async () => {
    setLoadingOverview(true);
    try {
      const res = await adminApi.seo.overview();
      if (res) setOverviewData(res);
    } catch (e) { setOverviewData(null); } finally { setLoadingOverview(false); }
  };
  const loadPages = async () => {
    setPagesLoading(true);
    try { const res = await adminApi.seo.pages(); if (res?.success) setPageRows(res.data || []); } finally { setPagesLoading(false); }
  };
  const loadRedirects = async () => {
    setRedirectsLoading(true);
    try {
      const params = {};
      if (redirectSearch) params.search = redirectSearch;
      const res = await adminApi.seo.redirects(params);
      if (res?.success) setRedirectRows(res.data || []);
    } finally { setRedirectsLoading(false); }
  };
  const loadBlogs = async () => {
    setBlogsLoading(true);
    try { const res = await adminApi.seo.blogs(); if (res?.success) setBlogRows(res.data || []); } finally { setBlogsLoading(false); }
  };
  const loadGlobal = async () => {
    setGlobalLoading(true);
    try { const res = await adminApi.seo.globalSettings(); if (res?.success) setGlobalForm(res.data || {}); } finally { setGlobalLoading(false); }
  };

  useEffect(() => {
    if (subTab === 'overview') loadOverview();
    if (subTab === 'pages') loadPages();
    if (subTab === 'redirects') loadRedirects();
    if (subTab === 'blogs') loadBlogs();
    if (subTab === 'global') loadGlobal();
  }, [subTab]);

  useEffect(() => {
    if (subTab === 'redirects') {
      const t = setTimeout(loadRedirects, 250);
      return () => clearTimeout(t);
    }
  }, [redirectSearch]);

  const startEditPage = async (row) => {
    try {
      const res = await adminApi.seo.getPage(row.pageKey);
      if (res?.success) {
        setEditingPage(res.data || row);
        setPageDraft({
          pageTitle: res.data?.pageTitle || row.pageTitle || '',
          routePath: res.data?.routePath || row.routePath || '',
          content: res.data?.content || '',
          seo: { ...(res.data?.seo || {}) },
        });
      }
    } catch (e) { alert('Failed to load page SEO'); }
  };

  const savePageSEO = async () => {
    try {
      const res = await adminApi.seo.updatePage(editingPage.pageKey, pageDraft);
      if (res?.success) {
        alert('✅ Page SEO saved!');
        setEditingPage(null);
        loadPages();
      } else alert(res?.message || 'Failed');
    } catch (e) { alert(e.message); }
  };

  const startEditRedirect = (r = null) => {
    setEditingRedirect(r);
    setRedirectDraft({
      sourcePath: r?.sourcePath || '',
      targetPath: r?.targetPath || '',
      type: r?.type || '301',
      enabled: r?.enabled !== false,
      notes: r?.notes || '',
    });
    setRedirectModalOpen(true);
  };

  const saveRedirect = async () => {
    try {
      let res;
      if (editingRedirect?._id) res = await adminApi.seo.updateRedirect(editingRedirect._id, redirectDraft);
      else res = await adminApi.seo.createRedirect(redirectDraft);
      if (res?.success) {
        setRedirectModalOpen(false);
        setEditingRedirect(null);
        loadRedirects();
        alert('✅ Redirect saved');
      } else alert(res?.message || 'Failed');
    } catch (e) { alert(e.message); }
  };

  const deleteRedirect = async (r) => {
    if (!confirm(`Delete redirect from ${r.sourcePath}?`)) return;
    try { const res = await adminApi.seo.deleteRedirect(r._id); if (res?.success) loadRedirects(); } catch (e) { alert(e.message); }
  };

  const startEditBlog = (b = null) => {
    setEditingBlog(b);
    setBlogDraft({
      title: b?.title || '',
      slug: b?.slug || '',
      excerpt: b?.excerpt || '',
      content: b?.content || '',
      coverImage: b?.coverImage || '',
      author: b?.author || 'Apex Vouchers',
      category: b?.category || 'Exam Guide',
      tags: (b?.tags || []).join(', '),
      published: b?.published !== false,
      featured: !!b?.featured,
      seo: { ...(b?.seo || {}) },
    });
    setBlogModalOpen(true);
  };

  const saveBlog = async () => {
    try {
      const payload = { ...blogDraft, tags: String(blogDraft.tags || '').split(',').map(s => s.trim()).filter(Boolean) };
      let res;
      if (editingBlog?._id) res = await adminApi.seo.updateBlog(editingBlog._id, payload);
      else res = await adminApi.seo.createBlog(payload);
      if (res?.success) {
        setBlogModalOpen(false);
        setEditingBlog(null);
        loadBlogs();
        alert('✅ Blog post saved');
      } else alert(res?.message || 'Failed');
    } catch (e) { alert(e.message); }
  };

  const deleteBlog = async (b) => {
    if (!confirm(`Delete blog post "${b.title}"?`)) return;
    try { const res = await adminApi.seo.deleteBlog(b._id); if (res?.success) loadBlogs(); } catch (e) { alert(e.message); }
  };

  const saveGlobal = async () => {
    setGlobalSaving(true);
    try {
      const res = await adminApi.seo.updateGlobalSettings(globalForm);
      if (res?.success) {
        alert('✅ Global SEO settings saved! Visit site front-end to see metadata changes after refresh.');
        loadGlobal();
      } else alert(res?.message || 'Failed');
    } catch (e) { alert(e.message); } finally { setGlobalSaving(false); }
  };

  const gradeBar = (g) => {
    const gd = overviewData?.gradeDistribution || {};
    return gd[g] || 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6C3CE0]/10 text-[#6C3CE0] font-black text-[11px] border border-[#6C3CE0]/20 mb-2">
            <SearchIcon className="w-3.5 h-3.5" /> SEO MANAGER
          </span>
          <h1 className="font-heading font-black text-2xl sm:text-3xl tracking-tight">Search Visibility Control Center</h1>
          <p className="text-xs font-bold text-neutral-500 dark:text-[#B5B5B5]">Configure product/page/blog SEO, structured data, redirects, global defaults, sitemap and robots.txt.</p>
        </div>
        <div className="flex items-center gap-2">
          <a href="/sitemap.xml" target="_blank" rel="noreferrer" className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] font-black text-[11px] inline-flex items-center gap-1.5 hover:border-[#6C3CE0] hover:text-[#6C3CE0]">
            <ExternalLink className="w-3.5 h-3.5" /> sitemap.xml
          </a>
          <a href="/robots.txt" target="_blank" rel="noreferrer" className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] font-black text-[11px] inline-flex items-center gap-1.5 hover:border-[#6C3CE0] hover:text-[#6C3CE0]">
            <ExternalLink className="w-3.5 h-3.5" /> robots.txt
          </a>
          <button onClick={loadOverview} className="px-4 py-2.5 rounded-xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] font-black text-[11px] inline-flex items-center gap-1.5 hover:border-[#FF005C]">
            <RefreshCw className={`w-4 h-4 ${loadingOverview ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      <div className="flex overflow-x-auto gap-1 p-1.5 bg-white dark:bg-[#161616] rounded-2xl border border-[#EAEAEA] dark:border-[#292929]">
        {subTabs.map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id)}
            className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-[11px] font-black whitespace-nowrap transition ${
              subTab === t.id ? 'bg-[#FF005C] text-white shadow-sm' : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[#262626]'
            }`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {productSEOEditing && (
        <SEOProductEditor product={productSEOEditing} onClose={() => setProductSEOEditing(null)}
          onSaved={() => { loadOverview(); if (typeof refreshProducts === 'function') refreshProducts(); }} />
      )}

      {subTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <StatCard label="Overall SEO Health" value={`${overviewData?.overallHealth?.score ?? 0}/100`} icon={<SearchIcon className="w-4 h-4" />} tint="#6C3CE0" sub={`Grade: ${overviewData?.overallHealth?.grade || '—'}`} />
            <StatCard label="Analyzed Products" value={overviewData?.counts?.products || 0} icon={<Package className="w-4 h-4" />} tint="#10B981" />
            <StatCard label="SEO Pages" value={overviewData?.counts?.pages || 0} icon={<FileSpreadsheet className="w-4 h-4" />} tint="#0EA5E9" />
            <StatCard label="Blog Posts" value={overviewData?.counts?.blogPosts || 0} icon={<FileText className="w-4 h-4" />} tint="#F59E0B" />
            <StatCard label="Active Redirects" value={overviewData?.counts?.redirects || 0} icon={<ArrowLeftRight className="w-4 h-4" />} tint="#EC4899" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 rounded-3xl p-5 bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm space-y-5">
              <div>
                <h3 className="font-black text-sm mb-3">Grade Distribution</h3>
                <div className="space-y-2.5">
                  {[
                    { name: 'Excellent', min: 90, tint: '#10B981', count: gradeBar('Excellent') },
                    { name: 'Good', min: 75, tint: '#34D399', count: gradeBar('Good') },
                    { name: 'Okay', min: 60, tint: '#0EA5E9', count: gradeBar('Okay') },
                    { name: 'Needs Improvement', min: 40, tint: '#F59E0B', count: gradeBar('Needs Improvement') },
                    { name: 'Poor', min: 0, tint: '#EF4444', count: gradeBar('Poor') },
                  ].map(row => {
                    const total = (overviewData?.overallHealth?.analyzedCount || 0) || 1;
                    const pct = Math.min(100, Math.round((row.count / total) * 100));
                    return (
                      <div key={row.name} className="flex items-center gap-3">
                        <span className="text-[10px] font-black w-40 shrink-0">{row.name} ({row.min}+)</span>
                        <div className="flex-1 h-4 rounded-full bg-neutral-100 dark:bg-[#262626] overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: row.tint }} />
                        </div>
                        <span className="text-[10px] font-mono font-bold w-10 text-right text-neutral-500">{row.count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#EAEAEA] dark:border-[#292929]">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-black text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Issues ({overviewData?.issues?.length || 0})</h4>
                  </div>
                  <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                    {(overviewData?.issues || []).slice(0, 25).map((it, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40">
                        <AlertOctagon className="w-3 h-3 text-rose-500 shrink-0 mt-0.5" />
                        <div className="text-[10px] font-bold text-rose-700 dark:text-rose-300 leading-snug flex-1">{it.text || it}</div>
                      </div>
                    ))}
                    {(!overviewData?.issues?.length) && <div className="text-[10px] font-bold text-emerald-600">✓ No critical issues detected.</div>}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-black text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400">Warnings ({overviewData?.warnings?.length || 0})</h4>
                  </div>
                  <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                    {(overviewData?.warnings || []).slice(0, 25).map((it, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40">
                        <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                        <div className="text-[10px] font-bold text-amber-700 dark:text-amber-300 leading-snug flex-1">{it.text || it}</div>
                      </div>
                    ))}
                    {(!overviewData?.warnings?.length) && <div className="text-[10px] font-bold text-neutral-400">No warnings.</div>}
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-3xl p-5 bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm space-y-4">
              <h3 className="font-black text-sm">Duplicate Detection</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Duplicate SEO Titles</span>
                    <span className={`text-[10px] font-black ${(overviewData?.duplicates?.seoTitles?.length || 0) > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{overviewData?.duplicates?.seoTitles?.length || 0} groups</span>
                  </div>
                  <div className="space-y-1.5 max-h-28 overflow-y-auto">
                    {(overviewData?.duplicates?.seoTitles || []).map((g, i) => (
                      <div key={i} className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 text-[10px] font-bold text-rose-700 dark:text-rose-300 leading-snug">
                        <span className="font-mono line-clamp-1">{g.value}</span>
                        <div className="text-[9px] opacity-70 mt-0.5">{g.count} items</div>
                      </div>
                    ))}
                    {(!overviewData?.duplicates?.seoTitles?.length) && <div className="text-[10px] font-bold text-emerald-600">✓ All unique</div>}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Duplicate Meta Descriptions</span>
                    <span className={`text-[10px] font-black ${(overviewData?.duplicates?.metaDescriptions?.length || 0) > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{overviewData?.duplicates?.metaDescriptions?.length || 0} groups</span>
                  </div>
                  <div className="space-y-1.5 max-h-28 overflow-y-auto">
                    {(overviewData?.duplicates?.metaDescriptions || []).map((g, i) => (
                      <div key={i} className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 text-[10px] font-bold text-rose-700 dark:text-rose-300 leading-snug">
                        <span className="font-mono line-clamp-2">{g.value}</span>
                        <div className="text-[9px] opacity-70 mt-0.5">{g.count} items</div>
                      </div>
                    ))}
                    {(!overviewData?.duplicates?.metaDescriptions?.length) && <div className="text-[10px] font-bold text-emerald-600">✓ All unique</div>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl p-5 bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-sm">Quick Actions</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { l: 'Edit a Product SEO', i: <Package className="w-4 h-4" />, t: '#10B981', action: () => setSubTab('products') },
                { l: 'Open Pages SEO', i: <FileSpreadsheet className="w-4 h-4" />, t: '#0EA5E9', action: () => setSubTab('pages') },
                { l: 'Create a Redirect', i: <ArrowLeftRight className="w-4 h-4" />, t: '#F59E0B', action: () => startEditRedirect() },
                { l: 'Update Global SEO', i: <Settings2 className="w-4 h-4" />, t: '#6C3CE0', action: () => setSubTab('global') },
              ].map(q => (
                <button key={q.l} onClick={q.action} className="flex items-center gap-3 p-4 rounded-2xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-left hover:border-[#FF005C] transition">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: q.t }}>{q.i}</div>
                  <div className="font-black text-xs">{q.l}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {subTab === 'products' && (
        <div className="space-y-5">
          <div className="rounded-3xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-bold">
                <thead className="bg-neutral-50 dark:bg-[#0E0E0E] text-neutral-500">
                  <tr>
                    <Th>Product</Th>
                    <Th>SEO Title</Th>
                    <Th>Slug</Th>
                    <Th className="text-center">Focus KW</Th>
                    <Th className="text-center">Apex SEO Score</Th>
                    <Th className="text-center">Indexable</Th>
                    <Th className="text-right">Action</Th>
                  </tr>
                </thead>
                <tbody>
                  {loadingOverview && Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}><td colSpan="7" className="p-4"><div className="h-10 bg-neutral-100 dark:bg-[#292929] rounded-xl animate-pulse" /></td></tr>
                  ))}
                  {!loadingOverview && (overviewData?.productScores || []).map(ps => {
                    const fullProd = (overviewData?.allProducts || []).find(p => (p._id || p.id) === (ps._id || ps.id)) || ps;
                    return (
                      <tr key={ps._id || ps.id} className="border-t border-[#EAEAEA] dark:border-[#292929] hover:bg-neutral-50/50 dark:hover:bg-[#111111]">
                        <Td>
                          <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-lg bg-[#FFF0F5] dark:bg-[#2A0A17] border border-[#FF005C]/20 flex items-center justify-center font-black text-[9px] text-[#FF005C]">
                              {fullProd.providerShortName || fullProd.brand?.slice(0,3) || 'APX'}
                            </div>
                            <div>
                              <div className="font-black text-sm">{fullProd.name}</div>
                              <div className="text-[10px] font-bold text-neutral-400">{fullProd.provider} · {fullProd.category}</div>
                            </div>
                          </div>
                        </Td>
                        <Td className="max-w-xs">
                          <div className="text-[11px] leading-snug line-clamp-2">{fullProd.seo?.title || fullProd.seoTitle || <span className="text-neutral-400 italic">not set</span>}</div>
                        </Td>
                        <Td><span className="font-mono text-[10px]">{fullProd.seo?.slug || fullProd.slug}</span></Td>
                        <Td className="text-center">
                          {fullProd.seo?.focusKeyword ? <span className="inline-flex px-2 py-0.5 rounded-md bg-[#6C3CE0]/10 text-[#6C3CE0] text-[10px] font-black border border-[#6C3CE0]/20">{fullProd.seo.focusKeyword}</span> : <span className="text-neutral-400 text-[10px]">—</span>}
                        </Td>
                        <Td className="text-center">
                          <div className="flex justify-center"><SEOScoreBadge score={ps.score || 0} grade={ps.grade} gradeColor={ps.gradeColor} size="sm" /></div>
                        </Td>
                        <Td className="text-center whitespace-nowrap">
                          {fullProd.seo?.noindex ? <Pill text="NOINDEX" tint="rose" /> : fullProd.active ? <Pill text="INDEXABLE" tint="emerald" /> : <Pill text="INACTIVE" tint="neutral" />}
                        </Td>
                        <Td className="text-right whitespace-nowrap">
                          <button onClick={() => setProductSEOEditing(fullProd)} className="px-3 py-1.5 rounded-xl bg-[#6C3CE0]/10 text-[#6C3CE0] border border-[#6C3CE0]/20 font-black text-[10px] inline-flex items-center gap-1 hover:bg-[#6C3CE0] hover:text-white transition">
                            <Edit2 className="w-3 h-3" /> Edit SEO
                          </button>
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {!loadingOverview && !(overviewData?.productScores?.length) && <Empty title="No products analyzed yet" desc="Add products in Products & Pricing tab, then come back to configure SEO." />}
          </div>
        </div>
      )}

      {subTab === 'pages' && (
        <div className="space-y-5">
          <div className="rounded-3xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-bold">
                <thead className="bg-neutral-50 dark:bg-[#0E0E0E] text-neutral-500">
                  <tr>
                    <Th>Page</Th>
                    <Th>Route</Th>
                    <Th>SEO Title</Th>
                    <Th>Meta Description</Th>
                    <Th className="text-center">Indexable</Th>
                    <Th className="text-right">Action</Th>
                  </tr>
                </thead>
                <tbody>
                  {pagesLoading && Array.from({ length: 5 }).map((_, i) => (<tr key={i}><td colSpan="6" className="p-4"><div className="h-10 bg-neutral-100 dark:bg-[#292929] rounded-xl animate-pulse" /></td></tr>))}
                  {!pagesLoading && pageRows.map(p => (
                    <tr key={p.pageKey} className="border-t border-[#EAEAEA] dark:border-[#292929] hover:bg-neutral-50/50 dark:hover:bg-[#111111]">
                      <Td>
                        <div className="font-black text-sm capitalize">{p.pageTitle || p.pageKey}</div>
                        <div className="text-[10px] font-bold text-neutral-400 font-mono">{p.pageKey}</div>
                      </Td>
                      <Td><span className="font-mono text-[10px]">{p.routePath || '/'}</span></Td>
                      <Td className="max-w-sm"><div className="line-clamp-2 text-[11px] leading-snug">{p.seo?.title || <span className="text-neutral-400 italic">not set</span>}</div></Td>
                      <Td className="max-w-sm"><div className="line-clamp-2 text-[11px] leading-snug text-neutral-500">{p.seo?.description || <span className="text-neutral-400 italic">not set</span>}</div></Td>
                      <Td className="text-center whitespace-nowrap">{p.seo?.noindex ? <Pill text="NOINDEX" tint="rose" /> : <Pill text="INDEXABLE" tint="emerald" />}</Td>
                      <Td className="text-right whitespace-nowrap">
                        <button onClick={() => startEditPage(p)} className="px-3 py-1.5 rounded-xl bg-[#6C3CE0]/10 text-[#6C3CE0] border border-[#6C3CE0]/20 font-black text-[10px] inline-flex items-center gap-1 hover:bg-[#6C3CE0] hover:text-white transition">
                          <Edit2 className="w-3 h-3" /> Edit SEO
                        </button>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!pagesLoading && pageRows.length === 0 && <Empty title="No page SEO entries" />}
          </div>

          {editingPage && (
            <FormCard title={`✏️ Edit Page SEO — ${editingPage.pageTitle || editingPage.pageKey}`} onClose={() => setEditingPage(null)} onSave={savePageSEO}>
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Route Path" value={pageDraft.routePath} onChange={v => setPageDraft({ ...pageDraft, routePath: v })} placeholder="/about" />
                  <Field label="Page Display Title" value={pageDraft.pageTitle} onChange={v => setPageDraft({ ...pageDraft, pageTitle: v })} placeholder="About Apex Vouchers" />
                </div>
                <div>
                  <Label>SEO Title</Label>
                  <input value={pageDraft.seo?.title || ''} onChange={e => setPageDraft({ ...pageDraft, seo: { ...pageDraft.seo, title: e.target.value } })}
                    className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-sm font-bold focus:outline-none focus:border-[#FF005C]" />
                  <CharCounter value={pageDraft.seo?.title} idealMin={30} idealMax={60} max={100} />
                </div>
                <div>
                  <Label>Meta Description</Label>
                  <textarea rows={3} value={pageDraft.seo?.description || ''} onChange={e => setPageDraft({ ...pageDraft, seo: { ...pageDraft.seo, description: e.target.value } })}
                    className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-sm font-bold focus:outline-none focus:border-[#FF005C]" />
                  <CharCounter value={pageDraft.seo?.description} idealMin={80} idealMax={160} max={250} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Focus Keyword" value={pageDraft.seo?.focusKeyword || ''} onChange={v => setPageDraft({ ...pageDraft, seo: { ...pageDraft.seo, focusKeyword: v } })} />
                  <Field label="Canonical URL (optional)" value={pageDraft.seo?.canonicalUrl || ''} onChange={v => setPageDraft({ ...pageDraft, seo: { ...pageDraft.seo, canonicalUrl: v } })} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="OG Title" value={pageDraft.seo?.ogTitle || ''} onChange={v => setPageDraft({ ...pageDraft, seo: { ...pageDraft.seo, ogTitle: v } })} />
                  <Field label="OG Image URL" value={pageDraft.seo?.ogImage || ''} onChange={v => setPageDraft({ ...pageDraft, seo: { ...pageDraft.seo, ogImage: v } })} />
                </div>
                <TextArea label="OG Description" value={pageDraft.seo?.ogDescription || ''} onChange={v => setPageDraft({ ...pageDraft, seo: { ...pageDraft.seo, ogDescription: v } })} rows={2} />
                <div className="flex flex-wrap gap-3 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40">
                  <Check label="Noindex" checked={!!pageDraft.seo?.noindex} onChange={v => setPageDraft({ ...pageDraft, seo: { ...pageDraft.seo, noindex: v } })} />
                  <Check label="Nofollow" checked={!!pageDraft.seo?.nofollow} onChange={v => setPageDraft({ ...pageDraft, seo: { ...pageDraft.seo, nofollow: v } })} />
                </div>
                <div>
                  <h4 className="font-black text-xs uppercase tracking-wider text-neutral-500 mb-3">Preview</h4>
                  <GooglePreview title={pageDraft.seo?.title || editingPage.pageTitle} description={pageDraft.seo?.description} url={`https://apexvouchers.com${pageDraft.routePath || '/'}`} />
                </div>
              </div>
            </FormCard>
          )}
        </div>
      )}

      {subTab === 'blogs' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="text-[11px] font-bold text-neutral-500">Total: <span className="text-neutral-900 dark:text-white font-black">{blogRows.length}</span> posts</div>
            <button onClick={() => startEditBlog()} className="px-5 py-2.5 rounded-2xl btn-pink text-white font-black text-xs shadow-lg inline-flex items-center gap-2">
              <Plus className="w-4 h-4" /> New Blog Post
            </button>
          </div>
          <div className="rounded-3xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-bold">
                <thead className="bg-neutral-50 dark:bg-[#0E0E0E] text-neutral-500">
                  <tr>
                    <Th>Post</Th>
                    <Th>Author</Th>
                    <Th>Category</Th>
                    <Th>Tags</Th>
                    <Th className="text-center">Views</Th>
                    <Th className="text-center">Status</Th>
                    <Th className="text-right">Actions</Th>
                  </tr>
                </thead>
                <tbody>
                  {blogsLoading && Array.from({ length: 4 }).map((_, i) => (<tr key={i}><td colSpan="7" className="p-4"><div className="h-10 bg-neutral-100 dark:bg-[#292929] rounded-xl animate-pulse" /></td></tr>))}
                  {!blogsLoading && blogRows.map(b => (
                    <tr key={b._id} className="border-t border-[#EAEAEA] dark:border-[#292929] hover:bg-neutral-50/50 dark:hover:bg-[#111111]">
                      <Td>
                        <div className="flex items-center gap-3">
                          {b.coverImage ? <img src={b.coverImage} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0 border border-[#EAEAEA] dark:border-[#292929]" /> : <div className="w-12 h-12 rounded-xl bg-[#6C3CE0]/10 flex items-center justify-center font-black text-[#6C3CE0] text-xs shrink-0">📖</div>}
                          <div className="min-w-0">
                            <div className="font-black text-sm flex items-center gap-1.5">{b.title}{b.featured && <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300">★ FEATURED</span>}</div>
                            <div className="text-[10px] font-bold text-neutral-400 truncate max-w-xs">Slug: <span className="font-mono">{b.slug}</span></div>
                          </div>
                        </div>
                      </Td>
                      <Td>{b.author}</Td>
                      <Td>{b.category}</Td>
                      <Td className="max-w-xs">{(b.tags || []).slice(0, 3).map(t => <span key={t} className="inline-block mr-1 mb-1 px-2 py-0.5 rounded bg-[#6C3CE0]/10 text-[#6C3CE0] text-[9px] font-black border border-[#6C3CE0]/20">{t}</span>)}</Td>
                      <Td className="text-center tabular-nums">{b.viewsCount || 0}</Td>
                      <Td className="text-center whitespace-nowrap">
                        {b.published ? <Pill text="PUBLISHED" tint="emerald" /> : <Pill text="DRAFT" tint="neutral" />}
                      </Td>
                      <Td className="text-right whitespace-nowrap">
                        <div className="inline-flex gap-1.5 justify-end">
                          <button onClick={() => startEditBlog(b)} className="px-2.5 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border border-sky-200 text-[10px] font-black inline-flex items-center gap-1">
                            <Edit2 className="w-3 h-3" /> Edit
                          </button>
                          <button onClick={() => deleteBlog(b)} className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!blogsLoading && blogRows.length === 0 && <Empty title="No blog posts yet" desc="Publish exam guides, preparation tips, and study strategies to drive organic traffic." />}
          </div>

          {blogModalOpen && (
            <FormCard title={editingBlog?._id ? '✏️ Edit Blog Post' : '➕ New Blog Post'} onClose={() => { setBlogModalOpen(false); setEditingBlog(null); }} onSave={saveBlog}>
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Field label="Post Title *" value={blogDraft.title} onChange={v => setBlogDraft({ ...blogDraft, title: v })} placeholder="How to Score 79+ in PTE Academic" />
                  <Field label="URL Slug" value={blogDraft.slug} onChange={v => setBlogDraft({ ...blogDraft, slug: v.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-') })} placeholder="how-to-score-79-pte" />
                  <Field label="Author" value={blogDraft.author} onChange={v => setBlogDraft({ ...blogDraft, author: v })} />
                </div>
                <TextArea label="Excerpt (short intro shown on blog cards)" value={blogDraft.excerpt} onChange={v => setBlogDraft({ ...blogDraft, excerpt: v })} rows={2} />
                <div>
                  <Label>Post Content (HTML supported, sanitized on save)</Label>
                  <RichTextToolbar onFormat={() => {}} />
                  <textarea rows={12} value={blogDraft.content} onChange={e => setBlogDraft({ ...blogDraft, content: e.target.value })}
                    className="w-full px-4 py-3 rounded-b-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-[11px] font-mono leading-relaxed focus:outline-none focus:border-[#FF005C] whitespace-pre-wrap" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Cover Image URL" value={blogDraft.coverImage} onChange={v => setBlogDraft({ ...blogDraft, coverImage: v })} />
                  <Field label="Category" value={blogDraft.category} onChange={v => setBlogDraft({ ...blogDraft, category: v })} />
                </div>
                <Field label="Tags (comma separated)" value={blogDraft.tags} onChange={v => setBlogDraft({ ...blogDraft, tags: v })} placeholder="PTE, exam tips, study guide" />
                <div className="p-4 rounded-2xl bg-[#F3EEFF] dark:bg-[#1e1638] border border-[#6C3CE0]/20 space-y-3">
                  <div className="text-[11px] font-black uppercase tracking-wider text-[#6C3CE0]">Blog SEO Fields</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="SEO Title" value={blogDraft.seo?.title || ''} onChange={v => setBlogDraft({ ...blogDraft, seo: { ...blogDraft.seo, title: v } })} />
                    <Field label="Focus Keyword" value={blogDraft.seo?.focusKeyword || ''} onChange={v => setBlogDraft({ ...blogDraft, seo: { ...blogDraft.seo, focusKeyword: v } })} />
                  </div>
                  <TextArea label="Meta Description" value={blogDraft.seo?.description || ''} onChange={v => setBlogDraft({ ...blogDraft, seo: { ...blogDraft.seo, description: v } })} rows={2} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Canonical URL (optional)" value={blogDraft.seo?.canonicalUrl || ''} onChange={v => setBlogDraft({ ...blogDraft, seo: { ...blogDraft.seo, canonicalUrl: v } })} />
                    <Field label="OG Image URL" value={blogDraft.seo?.ogImage || ''} onChange={v => setBlogDraft({ ...blogDraft, seo: { ...blogDraft.seo, ogImage: v } })} />
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Check label="Published (public)" checked={!!blogDraft.published} onChange={v => setBlogDraft({ ...blogDraft, published: v })} />
                  <Check label="Featured Post" checked={!!blogDraft.featured} onChange={v => setBlogDraft({ ...blogDraft, featured: v })} />
                  <Check label="Noindex (hide from search)" checked={!!blogDraft.seo?.noindex} onChange={v => setBlogDraft({ ...blogDraft, seo: { ...blogDraft.seo, noindex: v } })} />
                </div>
              </div>
            </FormCard>
          )}
        </div>
      )}

      {subTab === 'redirects' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] flex-1 max-w-md">
              <Search className="w-4 h-4 text-neutral-400" />
              <input value={redirectSearch} onChange={e => setRedirectSearch(e.target.value)}
                placeholder="Search source / target path..."
                className="bg-transparent outline-none text-xs font-bold w-full text-neutral-900 dark:text-white" />
            </div>
            <button onClick={() => startEditRedirect()} className="px-5 py-2.5 rounded-2xl btn-pink text-white font-black text-xs shadow-lg inline-flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Redirect
            </button>
          </div>
          <div className="rounded-3xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-bold">
                <thead className="bg-neutral-50 dark:bg-[#0E0E0E] text-neutral-500">
                  <tr>
                    <Th>Source Path</Th>
                    <Th>Target Path</Th>
                    <Th className="text-center">Type</Th>
                    <Th className="text-center">Hits</Th>
                    <Th className="text-center">Last Hit</Th>
                    <Th className="text-center">Origin</Th>
                    <Th className="text-center">Status</Th>
                    <Th className="text-right">Actions</Th>
                  </tr>
                </thead>
                <tbody>
                  {redirectsLoading && Array.from({ length: 4 }).map((_, i) => (<tr key={i}><td colSpan="8" className="p-4"><div className="h-10 bg-neutral-100 dark:bg-[#292929] rounded-xl animate-pulse" /></td></tr>))}
                  {!redirectsLoading && redirectRows.map(r => (
                    <tr key={r._id} className="border-t border-[#EAEAEA] dark:border-[#292929] hover:bg-neutral-50/50 dark:hover:bg-[#111111]">
                      <Td><span className="font-mono text-[11px]">{r.sourcePath}</span></Td>
                      <Td><span className="font-mono text-[11px]">{r.targetPath}</span></Td>
                      <Td className="text-center whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${r.type === '301' ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300' : 'bg-sky-100 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300'}`}>{r.type} {r.type === '301' ? '(Permanent)' : '(Temporary)'}</span>
                      </Td>
                      <Td className="text-center tabular-nums">{r.hits || 0}</Td>
                      <Td className="text-center text-[10px]">{r.lastHitAt ? new Date(r.lastHitAt).toLocaleDateString() : '—'}</Td>
                      <Td className="text-center whitespace-nowrap">
                        {r.entityType === 'auto' ? <span className="inline-block px-2 py-0.5 rounded bg-[#6C3CE0]/10 text-[#6C3CE0] border border-[#6C3CE0]/20 text-[10px] font-black">AUTO</span> : <span className="text-[10px] text-neutral-500">MANUAL</span>}
                      </Td>
                      <Td className="text-center whitespace-nowrap">{r.enabled ? <Pill text="ACTIVE" tint="emerald" /> : <Pill text="DISABLED" tint="neutral" />}</Td>
                      <Td className="text-right whitespace-nowrap">
                        <div className="inline-flex gap-1.5 justify-end">
                          <button onClick={() => startEditRedirect(r)} className="px-2.5 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border border-sky-200 text-[10px] font-black inline-flex items-center gap-1">
                            <Edit2 className="w-3 h-3" /> Edit
                          </button>
                          <button onClick={() => deleteRedirect(r)} className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!redirectsLoading && redirectRows.length === 0 && <Empty title="No redirects yet" desc="Redirects are auto-created when you change a product URL slug. Add manual redirects here for legacy URLs." />}
          </div>

          {redirectModalOpen && (
            <FormCard title={editingRedirect?._id ? '✏️ Edit Redirect' : '➕ Add Redirect'} onClose={() => { setRedirectModalOpen(false); setEditingRedirect(null); }} onSave={saveRedirect}>
              <div className="space-y-5">
                <div className="p-3 rounded-xl bg-[#6C3CE0]/10 dark:bg-[#1e1638] border border-[#6C3CE0]/20 flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-[#6C3CE0] shrink-0 mt-0.5" />
                  <div className="text-[10px] font-bold text-[#6C3CE0] dark:text-[#8B5CF6] leading-snug">
                    Enter paths only, no domain. Source must be unique. Example: <span className="font-mono bg-white dark:bg-[#161616] px-1.5 py-0.5 rounded">/old-page</span> → <span className="font-mono bg-white dark:bg-[#161616] px-1.5 py-0.5 rounded">/new-page</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Source Path (from) *" value={redirectDraft.sourcePath} onChange={v => setRedirectDraft({ ...redirectDraft, sourcePath: v.startsWith('/') ? v : '/' + v })} placeholder="/old-slug" />
                  <Field label="Target Path (to) *" value={redirectDraft.targetPath} onChange={v => setRedirectDraft({ ...redirectDraft, targetPath: v.startsWith('/') || v.startsWith('http') ? v : '/' + v })} placeholder="/new-slug or https://..." />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Redirect Type</Label>
                    <select value={redirectDraft.type} onChange={e => setRedirectDraft({ ...redirectDraft, type: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-sm font-bold focus:outline-none focus:border-[#FF005C]">
                      <option value="301">301 — Permanent (SEO friendly)</option>
                      <option value="302">302 — Temporary</option>
                    </select>
                  </div>
                  <div className="flex items-center pt-6 gap-3">
                    <Check label="Enabled" checked={!!redirectDraft.enabled} onChange={v => setRedirectDraft({ ...redirectDraft, enabled: v })} />
                  </div>
                </div>
                <TextArea label="Notes (optional, admin-only)" value={redirectDraft.notes} onChange={v => setRedirectDraft({ ...redirectDraft, notes: v })} rows={2} />
              </div>
            </FormCard>
          )}
        </div>
      )}

      {subTab === 'global' && (
        <div className="space-y-5">
          <div className="rounded-3xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-black text-lg mb-1">🌐 Global SEO Defaults</h3>
                <p className="text-[11px] font-bold text-neutral-500 max-w-xl">Used as safe fallbacks when individual products/pages don't have custom SEO metadata.</p>
              </div>
              <button onClick={saveGlobal} disabled={globalSaving || globalLoading}
                className="px-5 py-2.5 rounded-2xl btn-pink text-white font-black text-xs shadow-lg inline-flex items-center gap-2 disabled:opacity-60">
                <Save className="w-4 h-4" /> {globalSaving ? 'Saving…' : 'Save Global SEO'}
              </button>
            </div>
            {globalLoading ? <div className="h-96 rounded-2xl bg-neutral-100 dark:bg-[#262626] animate-pulse" /> : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="space-y-4">
                  <Field label="Website Name" value={globalForm.websiteName || ''} onChange={v => setGlobalForm({ ...globalForm, websiteName: v })} placeholder="Apex Vouchers" />
                  <Field label="Default SEO Title" value={globalForm.defaultSeoTitle || ''} onChange={v => setGlobalForm({ ...globalForm, defaultSeoTitle: v })} placeholder="Exam Vouchers at Best Prices | Apex Vouchers" />
                  <TextArea label="Default Meta Description" value={globalForm.defaultMetaDescription || ''} onChange={v => setGlobalForm({ ...globalForm, defaultMetaDescription: v })} rows={3} />
                  <Field label="Website URL (Canonical Base)" value={globalForm.siteUrl || ''} onChange={v => setGlobalForm({ ...globalForm, siteUrl: v })} placeholder="https://apexvouchers.com" />
                </div>
                <div className="space-y-4">
                  <Field label="Default OG Image URL (1200×630)" value={globalForm.defaultOgImage || ''} onChange={v => setGlobalForm({ ...globalForm, defaultOgImage: v })} placeholder="https://..." />
                  <Field label="Default Social Sharing Image" value={globalForm.defaultSocialImage || ''} onChange={v => setGlobalForm({ ...globalForm, defaultSocialImage: v })} />
                  <div className="pt-4 border-t border-[#EAEAEA] dark:border-[#292929]" />
                  <Field label="Organization / Brand Name" value={globalForm.orgName || ''} onChange={v => setGlobalForm({ ...globalForm, orgName: v })} placeholder="Apex Vouchers" />
                  <Field label="Organization Logo URL" value={globalForm.orgLogo || ''} onChange={v => setGlobalForm({ ...globalForm, orgLogo: v })} placeholder="https://.../logo.png" />
                  <div className="pt-4 border-t border-[#EAEAEA] dark:border-[#292929]" />
                  <Field label="Google Search Console (Verification Meta Tag content)" value={globalForm.gscVerification || ''} onChange={v => setGlobalForm({ ...globalForm, gscVerification: v })} placeholder="google-site-verification value" />
                  <Field label="Google Analytics 4 Measurement ID" value={globalForm.gaMeasurementId || ''} onChange={v => setGlobalForm({ ...globalForm, gaMeasurementId: v })} placeholder="G-XXXXXXXXXX" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {subTab === 'sitemap' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-3xl p-6 bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 flex items-center justify-center text-[#10B981]"><Code2 className="w-5 h-5" /></div>
                <div>
                  <h3 className="font-black text-sm">Dynamic sitemap.xml</h3>
                  <p className="text-[11px] font-bold text-neutral-500">Live-generated. Auto-includes products, pages, blog posts.</p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] font-mono text-[10px] break-all"><span className="text-emerald-600 dark:text-emerald-400">GET</span> /sitemap.xml — content-type: application/xml</div>
              <ul className="space-y-1.5 text-[11px] font-bold text-neutral-600 dark:text-neutral-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Static routes (homepage, how-it-works, etc.)</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Active products: <span className="font-mono">/exam-vouchers/{'{slug}'}</span></li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Pages SEO entries</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Published blog posts</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Respects noindex flags</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Cache-Control: 1 hour</li>
              </ul>
              <a href="/sitemap.xml" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#10B981] text-white font-black text-xs hover:brightness-110 transition">
                <ExternalLink className="w-3.5 h-3.5" /> Open sitemap.xml
              </a>
            </div>
            <div className="rounded-3xl p-6 bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0EA5E9]/10 flex items-center justify-center text-[#0EA5E9]"><ShieldCheck className="w-5 h-5" /></div>
                <div>
                  <h3 className="font-black text-sm">robots.txt</h3>
                  <p className="text-[11px] font-bold text-neutral-500">Rules for search engine crawlers. Sitemap URL included.</p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] font-mono text-[10px] break-all"><span className="text-sky-600 dark:text-sky-400">GET</span> /robots.txt — content-type: text/plain</div>
              <ul className="space-y-1.5 text-[11px] font-bold text-neutral-600 dark:text-neutral-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Allow: / (public content)</li>
                <li className="flex items-center gap-2"><AlertOctagon className="w-3.5 h-3.5 text-rose-500" /> Disallow: /admin</li>
                <li className="flex items-center gap-2"><AlertOctagon className="w-3.5 h-3.5 text-rose-500" /> Disallow: /account</li>
                <li className="flex items-center gap-2"><AlertOctagon className="w-3.5 h-3.5 text-rose-500" /> Disallow: /checkout</li>
                <li className="flex items-center gap-2"><AlertOctagon className="w-3.5 h-3.5 text-rose-500" /> Disallow: /cart</li>
                <li className="flex items-center gap-2"><AlertOctagon className="w-3.5 h-3.5 text-rose-500" /> Disallow: /payment</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Sitemap reference included</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Cache-Control: 24 hours</li>
              </ul>
              <a href="/robots.txt" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0EA5E9] text-white font-black text-xs hover:brightness-110 transition">
                <ExternalLink className="w-3.5 h-3.5" /> Open robots.txt
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function VideosAdmin() {
  const [rows, setRows] = useState([]);
  const [kpis, setKpis] = useState({});
  const [settings, setSettings] = useState({ videoSectionEnabled: true, movieReelModeEnabled: true });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const [editing, setEditing] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [draft, setDraft] = useState({});
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleMediaUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'video') {
      if (!/\.(mp4|webm|mov)$/i.test(file.name)) {
        alert('Invalid video format. Please select an .mp4, .webm, or .mov video file.');
        return;
      }
    } else if (type === 'thumbnail') {
      if (!/\.(jpg|jpeg|png|webp)$/i.test(file.name)) {
        alert('Invalid image format. Please select a .jpg, .png, or .webp image file.');
        return;
      }
    }

    setUploadingMedia(true);
    setUploadProgress(30);
    try {
      const formData = new FormData();
      formData.append(type, file);

      setUploadProgress(60);
      const res = await adminApi.uploadMedia(formData);
      setUploadProgress(100);

      if (res.success) {
        if (type === 'video' && res.videoUrl) {
          setDraft((prev) => ({ ...prev, videoUrl: res.videoUrl }));
        } else if (type === 'thumbnail' && res.thumbnailUrl) {
          setDraft((prev) => ({ ...prev, thumbnail: res.thumbnailUrl }));
        }
      } else {
        alert(res.message || 'File upload failed');
      }
    } catch (err) {
      alert('Upload error: ' + (err.message || 'Server error during upload'));
    } finally {
      setUploadingMedia(false);
      setUploadProgress(0);
    }
  };

  const refresh = async () => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    if (categoryFilter) params.category = categoryFilter;

    const res = await adminApi.videos(params);
    setRows(res.data || []);
    setKpis(res.kpis || {});
    if (res.settings) setSettings(res.settings);
    setLoading(false);
  };

  useEffect(() => {
    const t = setTimeout(refresh, 300);
    return () => clearTimeout(t);
  }, [search, statusFilter, categoryFilter]);

  const startCreate = () => {
    setDraft({
      title: '',
      description: '',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      youtubeEmbed: '',
      thumbnail: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&auto=format&fit=crop&q=80',
      category: 'Step-By-Step Guide',
      duration: '15s',
      badgeColor: 'bg-amber-400 text-slate-950',
      icon: '🎬',
      displayOrder: (rows.length || 0) + 1,
      viewsCount: 0,
      featured: false,
      published: true,
    });
    setEditing(null);
    setIsCreating(true);
  };

  const startEdit = (v) => {
    setEditing(v);
    setIsCreating(false);
    setDraft({ ...v });
  };

  const saveVideo = async () => {
    if (!draft.title || !draft.videoUrl) {
      alert('Video title and video URL are required.');
      return;
    }
    const payload = {
      ...draft,
      displayOrder: Number(draft.displayOrder) || 0,
      viewsCount: Number(draft.viewsCount) || 0,
    };
    let res;
    if (isCreating) res = await adminApi.createVideo(payload);
    else res = await adminApi.updateVideo(editing?._id || editing?.id, payload);

    if (res.success) {
      setIsCreating(false);
      setEditing(null);
      refresh();
    } else alert(res.message || 'Failed to save video');
  };

  const toggleSectionEnabled = async () => {
    const nextVal = !settings.videoSectionEnabled;
    const res = await adminApi.updateVideoSettings({ videoSectionEnabled: nextVal });
    if (res.success) {
      setSettings((prev) => ({ ...prev, videoSectionEnabled: nextVal }));
      refresh();
    }
  };

  const toggleMovieModeEnabled = async () => {
    const nextVal = !settings.movieReelModeEnabled;
    const res = await adminApi.updateVideoSettings({ movieReelModeEnabled: nextVal });
    if (res.success) {
      setSettings((prev) => ({ ...prev, movieReelModeEnabled: nextVal }));
      refresh();
    }
  };

  const toggleFeatured = async (v) => {
    const res = await adminApi.quickToggleFeaturedVideo(v._id || v.id, !v.featured);
    if (res.success) refresh();
  };

  const togglePublished = async (v) => {
    const res = await adminApi.quickTogglePublishVideo(v._id || v.id, !v.published);
    if (res.success) refresh();
  };

  const removeVideo = async (v) => {
    if (!confirm(`Are you sure you want to delete video "${v.title}"?`)) return;
    const res = await adminApi.deleteVideo(v._id || v.id);
    if (res.success) refresh();
    else alert(res.message || 'Failed to delete video');
  };

  return (
    <div className="space-y-6">
      {/* Header & Global Settings Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl tracking-tight">Videos & Reels Management</h1>
          <p className="text-xs font-bold text-neutral-500 dark:text-[#B5B5B5]">Manage video tutorials, reel cards, featured highlights, durations, and view analytics.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={toggleSectionEnabled}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black border transition cursor-pointer flex items-center gap-2 ${
              settings.videoSectionEnabled
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400'
                : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400'
            }`}
          >
            <Film className="w-4 h-4" /> Video Section: {settings.videoSectionEnabled ? 'ON (Visible)' : 'OFF (Hidden)'}
          </button>

          <button
            onClick={toggleMovieModeEnabled}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black border transition cursor-pointer flex items-center gap-2 ${
              settings.movieReelModeEnabled
                ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400'
                : 'bg-neutral-100 text-neutral-500 border-neutral-200 dark:bg-[#262626]'
            }`}
          >
            <Sparkles className="w-4 h-4" /> Movie Mode: {settings.movieReelModeEnabled ? 'ON' : 'OFF'}
          </button>

          <button onClick={startCreate} className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl btn-pink text-white font-black text-xs shadow-lg">
            <Plus className="w-4 h-4" /> Add New Video
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard label="Total Videos" value={kpis.totalVideos || 0} icon={<Film className="w-4 h-4" />} tint="#FF005C" />
        <StatCard label="Published" value={kpis.publishedVideos || 0} icon={<CheckCircle2 className="w-4 h-4" />} tint="#10B981" />
        <StatCard label="Drafts" value={kpis.draftVideos || 0} icon={<Clock className="w-4 h-4" />} tint="#64748B" />
        <StatCard label="Center Featured" value={kpis.featuredVideos || 0} icon={<Crown className="w-4 h-4" />} tint="#F59E0B" />
        <StatCard label="Total Reel Views" value={(kpis.totalViews || 0).toLocaleString()} icon={<Eye className="w-4 h-4" />} tint="#6C3CE0" />
      </div>

      {/* Search & Filters */}
      <div className="rounded-3xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] flex-1 max-w-md">
            <Search className="w-4 h-4 text-neutral-400" />
            <input
              placeholder="Search videos by title, description, category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none text-xs font-bold w-full text-neutral-900 dark:text-white"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-2xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-xs font-bold text-neutral-700 dark:text-neutral-300"
          >
            <option value="">All Categories</option>
            <option value="Step-By-Step Guide">Step-By-Step Guide</option>
            <option value="PTE Voucher">PTE Voucher</option>
            <option value="Redemption Guide">Redemption Guide</option>
            <option value="Offers">Offers</option>
            <option value="Voucher FAQs">Voucher FAQs</option>
            <option value="IELTS">IELTS</option>
            <option value="TOEFL">TOEFL</option>
            <option value="Duolingo">Duolingo</option>
          </select>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
          {[
            { id: '', label: 'All Videos' },
            { id: 'published', label: 'Published' },
            { id: 'draft', label: 'Drafts' },
            { id: 'featured', label: 'Center Featured' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setStatusFilter(pill.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition whitespace-nowrap ${
                statusFilter === pill.id
                  ? 'bg-[#FF005C] text-white shadow-sm'
                  : 'bg-neutral-100 dark:bg-[#262626] text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Add / Edit Video Modal */}
      {(isCreating || editing) && (
        <FormCard
          title={isCreating ? '🎬 Add New Video Reel' : `✏️ Edit Video: ${editing?.title}`}
          onClose={() => { setIsCreating(false); setEditing(null); }}
          onSave={saveVideo}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Inputs */}
            <div className="lg:col-span-2 space-y-4">
              {/* File Upload Dropzones */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#292929]">
                {/* Video File Upload */}
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-900 dark:text-white">
                    🎬 Upload Video File (.mp4, .webm, .mov)
                  </label>
                  <label className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-[#FF005C]/30 bg-rose-50/30 dark:bg-[#2A0A17]/20 hover:border-[#FF005C] cursor-pointer transition">
                    <span className="text-xs font-black text-[#FF005C]">Click to Upload / Drag MP4 Video</span>
                    <span className="text-[10px] text-slate-400 font-medium mt-0.5">Max 100MB • High Performance H.264</span>
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime"
                      onChange={(e) => handleMediaUpload(e, 'video')}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Thumbnail Image Upload */}
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-900 dark:text-white">
                    🖼️ Upload Poster Thumbnail (.jpg, .png, .webp)
                  </label>
                  <label className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-amber-500/30 bg-amber-50/30 dark:bg-amber-950/20 hover:border-amber-500 cursor-pointer transition">
                    <span className="text-xs font-black text-amber-600 dark:text-amber-400">Click to Upload / Drag Poster Image</span>
                    <span className="text-[10px] text-slate-400 font-medium mt-0.5">Max 10MB • 9:16 Aspect Ratio Recommended</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => handleMediaUpload(e, 'thumbnail')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {uploadingMedia && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center justify-between">
                  <span>Uploading media file to server storage...</span>
                  <span>{uploadProgress}%</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Video Title *" value={draft.title} onChange={(v) => setDraft({ ...draft, title: v })} placeholder="e.g. How to Buy an Exam Voucher" />
                <Field label="Category *" value={draft.category} onChange={(v) => setDraft({ ...draft, category: v })} placeholder="Step-By-Step Guide / PTE Voucher" />
                <Field label="Video Stream URL (MP4 / Uploaded URL) *" value={draft.videoUrl} onChange={(v) => setDraft({ ...draft, videoUrl: v })} placeholder="https://..." />
                <Field label="Thumbnail Image URL *" value={draft.thumbnail} onChange={(v) => setDraft({ ...draft, thumbnail: v })} placeholder="https://..." />
                <Field label="Instagram Reel URL (Optional Reference Link)" value={draft.instagramUrl || ''} onChange={(v) => setDraft({ ...draft, instagramUrl: v })} placeholder="https://www.instagram.com/reel/..." />
                <Field label="YouTube Embed / Link (Optional)" value={draft.youtubeEmbed || ''} onChange={(v) => setDraft({ ...draft, youtubeEmbed: v })} placeholder="https://www.youtube.com/watch?v=..." />
                <Field label="Duration" value={draft.duration} onChange={(v) => setDraft({ ...draft, duration: v })} placeholder="15s" />
                <Field label="Display Order (Rank)" type="number" value={draft.displayOrder} onChange={(v) => setDraft({ ...draft, displayOrder: v })} />
                <Field label="View Count" type="number" value={draft.viewsCount} onChange={(v) => setDraft({ ...draft, viewsCount: v })} />
              </div>

              <TextArea label="Short Description (Shown on Reel Card)" value={draft.description} onChange={(v) => setDraft({ ...draft, description: v })} rows={2} />

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Check label="Center Featured Video (Large Card)" checked={!!draft.featured} onChange={(v) => setDraft({ ...draft, featured: v })} />
                <Check label="Published & Visible on Website" checked={!!draft.published} onChange={(v) => setDraft({ ...draft, published: v })} />
              </div>
            </div>

            {/* Right Col: Live Card Preview */}
            <div className="space-y-2">
              <Label>Live Customer Card Preview</Label>
              <div className="w-full aspect-[9/16] rounded-2xl bg-[#161616] border-2 border-amber-400 p-4 relative overflow-hidden flex flex-col justify-between text-white shadow-xl">
                <img src={draft.thumbnail || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600'} alt="preview" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/70" />

                <div className="relative z-10 flex justify-between items-center">
                  <span className="px-2.5 py-1 rounded bg-amber-400 text-slate-950 font-black text-[10px] uppercase">
                    {draft.category || 'STEP-BY-STEP'}
                  </span>
                  <ApexLogo className="h-4" whiteText={true} />
                </div>

                <div className="relative z-10 text-center my-auto">
                  <div className="w-12 h-12 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center mx-auto shadow-xl border-2 border-white">
                    <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
                  </div>
                  <span className="inline-block mt-2 text-[9px] font-extrabold text-amber-400 uppercase tracking-widest bg-black/70 px-2 py-0.5 rounded-full">
                    {draft.duration || '15s'} • Click to Play
                  </span>
                </div>

                <div className="relative z-10 space-y-1 bg-slate-950/90 p-3 rounded-xl border border-white/10">
                  <div className="flex justify-between items-start gap-1">
                    <h4 className="font-heading font-black text-xs text-white leading-tight truncate">{draft.title || 'Untitled Video'}</h4>
                    <span className="text-[9px] font-bold text-slate-400 shrink-0">{(Number(draft.viewsCount) || 0).toLocaleString()} views</span>
                  </div>
                  <p className="text-[10px] text-slate-300 font-medium line-clamp-2">{draft.description || 'Description will appear here...'}</p>
                </div>
              </div>
            </div>
          </div>
        </FormCard>
      )}

      {/* Main Video Table */}
      <div className="rounded-3xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-bold">
            <thead className="bg-neutral-50 dark:bg-[#0E0E0E] text-neutral-500">
              <tr>
                <Th>Thumbnail & Video Title</Th>
                <Th>Category</Th>
                <Th className="text-center">Duration</Th>
                <Th className="text-right">Total Views</Th>
                <Th className="text-center">Center Featured</Th>
                <Th className="text-center">Status</Th>
                <Th className="text-center">Display Order</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {loading && Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}><td colSpan="8" className="p-4"><div className="h-10 bg-neutral-100 dark:bg-[#292929] rounded-xl animate-pulse" /></td></tr>
              ))}

              {!loading && rows.map((v) => (
                <tr key={v._id} className="border-t border-[#EAEAEA] dark:border-[#292929] hover:bg-neutral-50/50 dark:hover:bg-[#111111] transition-colors">
                  {/* Thumbnail & Title */}
                  <Td>
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-10 rounded-xl bg-neutral-900 overflow-hidden relative border border-[#EAEAEA] dark:border-[#292929] flex-shrink-0">
                        <img src={v.thumbnail || v.poster} alt={v.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <Play className="w-3.5 h-3.5 fill-white text-white" />
                        </div>
                      </div>
                      <div>
                        <div className="font-black text-sm text-neutral-900 dark:text-white flex items-center gap-2">
                          <span>{v.title}</span>
                          {v.featured && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-400/10 text-amber-600 border border-amber-400/30 text-[9px] font-black">
                              ★ CENTER FEATURED
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-semibold text-neutral-400 truncate max-w-xs">
                          {v.description || 'No short description provided'}
                        </div>
                      </div>
                    </div>
                  </Td>

                  {/* Category */}
                  <Td className="whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-[#262626] text-neutral-700 dark:text-neutral-300 text-[10px] font-black">
                      {v.category}
                    </span>
                  </Td>

                  {/* Duration */}
                  <Td className="text-center whitespace-nowrap text-amber-600 dark:text-amber-400 font-mono font-black">
                    ▶ {v.duration || '15s'}
                  </Td>

                  {/* Views */}
                  <Td className="text-right tabular-nums font-black text-neutral-900 dark:text-white">
                    {(v.viewsCount || 0).toLocaleString()}
                  </Td>

                  {/* Center Featured Toggle */}
                  <Td className="text-center whitespace-nowrap">
                    <button
                      onClick={() => toggleFeatured(v)}
                      className={`px-3 py-1 rounded-full text-[10px] font-black border cursor-pointer ${
                        v.featured
                          ? 'bg-amber-400/20 text-amber-600 border-amber-400'
                          : 'bg-neutral-100 text-neutral-400 border-neutral-200 dark:bg-[#262626]'
                      }`}
                    >
                      {v.featured ? '★ Center Featured' : '☆ Standard'}
                    </button>
                  </Td>

                  {/* Status Toggle */}
                  <Td className="text-center whitespace-nowrap">
                    <button onClick={() => togglePublished(v)} className="cursor-pointer">
                      <Pill text={v.published ? 'PUBLISHED' : 'DRAFT'} tint={v.published ? 'emerald' : 'neutral'} />
                    </button>
                  </Td>

                  {/* Display Order */}
                  <Td className="text-center font-mono font-black text-xs">{v.displayOrder || 0}</Td>

                  {/* Actions */}
                  <Td className="text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => setPreviewVideo(v)}
                        className="p-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border border-purple-200"
                        title="Preview Customer Player"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => startEdit(v)}
                        className="px-2.5 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border border-sky-200 text-[11px] font-black flex items-center gap-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>

                      <button
                        onClick={() => removeVideo(v)}
                        className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200"
                        title="Delete Video"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && rows.length === 0 && <Empty title="No videos found" desc="Add your first reel video to populate the website video section." />}
      </div>

      {/* Admin Video Preview Modal */}
      {previewVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-xl bg-[#161616] rounded-3xl p-6 border border-amber-500/30 shadow-2xl text-white space-y-4">
            <button
              onClick={() => setPreviewVideo(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-amber-400 hover:text-slate-950 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black uppercase">
                {previewVideo.category}
              </span>
              <ApexLogo className="h-5" whiteText={true} />
            </div>

            <h3 className="font-heading font-black text-xl text-white">{previewVideo.title}</h3>

            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-[#0A0A0A] border border-white/10 shadow-xl relative flex items-center justify-center">
              {/instagram\.com|instagr\.am/i.test(previewVideo.instagramUrl || previewVideo.videoUrl) ? (
                <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center space-y-3">
                  {previewVideo.thumbnail && <img src={previewVideo.thumbnail} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />}
                  <div className="relative z-10 w-12 h-12 rounded-full bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-500 flex items-center justify-center text-white shadow-xl">
                    <Film className="w-6 h-6" />
                  </div>
                  <div className="relative z-10 space-y-1">
                    <div className="font-heading font-black text-sm text-white">{previewVideo.title}</div>
                    <div className="text-xs text-slate-300 font-medium">Hosted on Instagram (No direct iframe)</div>
                  </div>
                  <a
                    href={previewVideo.instagramUrl || previewVideo.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="relative z-10 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-amber-500 text-white font-black text-xs inline-flex items-center gap-1.5"
                  >
                    <span>Watch on Instagram ↗</span>
                  </a>
                </div>
              ) : /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(previewVideo.videoUrl) || /commondatastorage|cloudinary|s3/i.test(previewVideo.videoUrl) ? (
                <video
                  src={previewVideo.videoUrl}
                  poster={previewVideo.thumbnail}
                  controls
                  className="w-full h-full object-cover"
                />
              ) : (
                <iframe
                  className="w-full h-full object-cover"
                  src={previewVideo.youtubeEmbed || previewVideo.videoUrl}
                  title={previewVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>

            <p className="text-xs text-slate-300 font-medium">{previewVideo.description}</p>
            <div className="pt-2 flex justify-end">
              <button onClick={() => setPreviewVideo(null)} className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-black text-xs">
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function WebsiteCMSAdmin() {
  const { products, refreshWebsiteConfig, showToast } = useVoucher();
  const [activeSubTab, setActiveSubTab] = useState('campaigns');

  const [campaigns, setCampaigns] = useState([]);
  const [campaignsLoading, setCampaignsLoading] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);

  const [heroForm, setHeroForm] = useState({
    headingLine1: 'Your Exam. Your Dream.',
    headingHighlight: 'Our Vouchers.',
    headingLine3: 'Your Savings.',
    descriptionText: 'Get official voucher codes for PTE, IELTS, TOEFL & Duolingo at the best prices and save more on your exam fees.',
    ctaText: 'Browse Vouchers',
    ctaLink: '/#vouchers',
  });

  const [announcementForm, setAnnouncementForm] = useState({
    enabled: true,
    text: '⚡ Instant Voucher Delivery in 10s • 100% Genuine Official Vouchers',
    link: '/#vouchers',
    overrideWithCampaign: true,
  });

  const [footerForm, setFooterForm] = useState({
    description: 'Apex Vouchers helps candidates save on official exam voucher fees for PTE, IELTS, TOEFL and Duolingo with 100% genuine guaranteed vouchers.',
    phone: '+91 9855926113',
    email: 'apexvouchers@gmail.com',
    copyright: '© 2026 Apex Vouchers. All rights reserved.',
  });

  const [productPrices, setProductPrices] = useState([]);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    loadCMSData();
  }, []);

  useEffect(() => {
    if (Array.isArray(products) && products.length > 0) {
      setProductPrices(
        products.map((p) => ({
          _id: p._id || p.id,
          name: p.name,
          brand: p.brand || p.provider,
          originalPrice: p.originalPrice || 0,
          sellingPrice: p.sellingPrice || p.discountedPrice || 0,
          inStock: p.inStock !== false,
          active: p.active !== false,
        }))
      );
    }
  }, [products]);

  const loadCMSData = async () => {
    setCampaignsLoading(true);
    try {
      const [cRes, sRes] = await Promise.all([adminApi.campaigns(), adminApi.getWebsiteSettings()]);
      if (cRes.success) setCampaigns(Array.isArray(cRes.data) ? cRes.data : []);
      if (sRes.success && sRes.data) {
        if (sRes.data.heroSettings) setHeroForm((prev) => ({ ...prev, ...sRes.data.heroSettings }));
        if (sRes.data.announcementSettings) setAnnouncementForm((prev) => ({ ...prev, ...sRes.data.announcementSettings }));
        if (sRes.data.footerSettings) setFooterForm((prev) => ({ ...prev, ...sRes.data.footerSettings }));
      }
    } catch (err) {
      showToast?.(err.message || 'Failed to load CMS settings', 'error');
    } finally {
      setCampaignsLoading(false);
    }
  };

  const handleSaveHeroSettings = async () => {
    setSavingSettings(true);
    try {
      await adminApi.updateWebsiteSettings({ heroSettings: heroForm });
      await refreshWebsiteConfig?.();
      showToast?.('Hero slogans updated successfully!', 'success');
    } catch (err) {
      showToast?.(err.message || 'Failed to update hero settings', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSaveAnnouncement = async () => {
    setSavingSettings(true);
    try {
      await adminApi.updateWebsiteSettings({ announcementSettings: announcementForm });
      await refreshWebsiteConfig?.();
      showToast?.('Announcement bar updated successfully!', 'success');
    } catch (err) {
      showToast?.(err.message || 'Failed to update announcement bar', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSaveFooterSettings = async () => {
    setSavingSettings(true);
    try {
      await adminApi.updateWebsiteSettings({ footerSettings: footerForm });
      await refreshWebsiteConfig?.();
      showToast?.('Footer settings updated successfully!', 'success');
    } catch (err) {
      showToast?.(err.message || 'Failed to update footer settings', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleQuickPriceSave = async (prod) => {
    try {
      await adminApi.quickUpdatePrice(prod._id, {
        originalPrice: Number(prod.originalPrice),
        sellingPrice: Number(prod.sellingPrice),
        inStock: prod.inStock,
        active: prod.active,
      });
      await refreshWebsiteConfig?.();
      showToast?.(`Updated price for ${prod.name}!`, 'success');
    } catch (err) {
      showToast?.(err.message || 'Failed to update product price', 'error');
    }
  };

  const handleToggleCampaign = async (id) => {
    try {
      const res = await adminApi.toggleCampaign(id);
      if (res.success) {
        setCampaigns((prev) => prev.map((c) => (c._id === id ? { ...c, status: res.status } : c)));
        await refreshWebsiteConfig?.();
        showToast?.(`Campaign status changed to ${res.status}!`, 'success');
      }
    } catch (err) {
      showToast?.(err.message || 'Failed to toggle campaign status', 'error');
    }
  };

  const handleDeleteCampaign = async (id) => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) return;
    try {
      await adminApi.deleteCampaign(id);
      setCampaigns((prev) => prev.filter((c) => c._id !== id));
      await refreshWebsiteConfig?.();
      showToast?.('Campaign deleted!', 'success');
    } catch (err) {
      showToast?.(err.message || 'Failed to delete campaign', 'error');
    }
  };

  const handleSaveCampaignSubmit = async (campaignData) => {
    try {
      if (editingCampaign?._id) {
        const res = await adminApi.updateCampaign(editingCampaign._id, campaignData);
        if (res.success) {
          setCampaigns((prev) => prev.map((c) => (c._id === editingCampaign._id ? res.data : c)));
          showToast?.('Campaign updated successfully!', 'success');
        }
      } else {
        const res = await adminApi.createCampaign(campaignData);
        if (res.success) {
          setCampaigns((prev) => [res.data, ...prev]);
          showToast?.('Campaign created successfully!', 'success');
        }
      }
      setIsCampaignModalOpen(false);
      setEditingCampaign(null);
      await refreshWebsiteConfig?.();
    } catch (err) {
      showToast?.(err.message || 'Failed to save campaign', 'error');
    }
  };

  const activeCampaign = campaigns.find((c) => c.status === 'ACTIVE' || c.status === 'SCHEDULED');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-[#121212] p-6 rounded-3xl border border-[#EAEAEA] dark:border-[#222] shadow-sm">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF005C]/10 text-[#FF005C] font-black text-xs border border-[#FF005C]/20 mb-2">
            <Megaphone className="w-3.5 h-3.5" /> WEBSITE CONTENT & CAMPAIGN CMS
          </span>
          <h2 className="font-heading font-black text-2xl text-slate-900 dark:text-white">
            Dynamic Marketing & Pricing Management
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
            Control homepage slogans, festival offers, voucher prices, announcement bar, and footer content without code changes.
          </p>
        </div>

        <button
          onClick={loadCMSData}
          className="px-4 py-2.5 rounded-2xl bg-neutral-100 dark:bg-[#1A1A1A] hover:bg-neutral-200 dark:hover:bg-[#252525] font-black text-xs text-neutral-700 dark:text-neutral-200 inline-flex items-center gap-2 transition"
        >
          <RefreshCw className={`w-4 h-4 ${campaignsLoading ? 'animate-spin' : ''}`} /> Refresh CMS Data
        </button>
      </div>

      {/* Sub-Navigation Bar */}
      <div className="flex overflow-x-auto gap-2 p-1.5 bg-white dark:bg-[#121212] rounded-2xl border border-[#EAEAEA] dark:border-[#222]">
        {[
          { id: 'campaigns', label: '🚀 Campaigns Manager', count: campaigns.length },
          { id: 'hero', label: '✍️ Hero Slogans & Copy' },
          { id: 'announcement', label: '⚡ Announcement Bar' },
          { id: 'prices', label: '💰 Voucher Price Controls' },
          { id: 'footer', label: '🛡️ Benefits & Footer CMS' },
          { id: 'business', label: '📧 Business & Email Info' },
          { id: 'preview', label: '👁️ Live Homepage Preview' },
        ].map((sub) => (
          <button
            key={sub.id}
            onClick={() => setActiveSubTab(sub.id)}
            className={`px-4 py-2.5 rounded-xl font-black text-xs whitespace-nowrap transition flex items-center gap-2 ${
              activeSubTab === sub.id
                ? 'bg-[#FF005C] text-white shadow-md'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-[#1D1D1D]'
            }`}
          >
            <span>{sub.label}</span>
            {sub.count !== undefined && (
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black">{sub.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: CAMPAIGNS MANAGER */}
      {activeSubTab === 'campaigns' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white dark:bg-[#121212] p-5 rounded-3xl border border-[#EAEAEA] dark:border-[#222]">
            <div>
              <h3 className="font-heading font-black text-lg text-slate-900 dark:text-white">Promotional Campaigns</h3>
              <p className="text-xs text-neutral-500 font-medium">Create festival sales (Independence Day, Diwali, New Year) with automatic start/end dates.</p>
            </div>
            <button
              onClick={() => {
                setEditingCampaign(null);
                setIsCampaignModalOpen(true);
              }}
              className="px-5 py-3 rounded-2xl bg-[#FF005C] hover:bg-[#E00052] text-white font-black text-xs shadow-lg shadow-[#FF005C]/20 inline-flex items-center gap-2 cursor-pointer transition"
            >
              <Plus className="w-4 h-4" /> Create New Campaign
            </button>
          </div>

          <div className="bg-white dark:bg-[#121212] rounded-3xl border border-[#EAEAEA] dark:border-[#222] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-[#171717] border-b border-[#EAEAEA] dark:border-[#222] text-[11px] font-black text-neutral-500 uppercase tracking-wider">
                    <th className="p-4">Campaign Name</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Badge / Offer</th>
                    <th className="p-4">Discount</th>
                    <th className="p-4">Start - End Date</th>
                    <th className="p-4">Priority</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAEAEA] dark:divide-[#222] text-xs font-semibold">
                  {campaigns.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-neutral-400 font-medium">
                        No promotional campaigns created yet. Click <strong>"Create New Campaign"</strong> to launch your first sale.
                      </td>
                    </tr>
                  ) : (
                    campaigns.map((c) => {
                      const isCurrentlyActive = c.status === 'ACTIVE' || c.status === 'SCHEDULED';
                      return (
                        <tr key={c._id} className="hover:bg-neutral-50/50 dark:hover:bg-[#171717]/50">
                          <td className="p-4 font-black text-slate-900 dark:text-white">
                            <div>{c.name}</div>
                            <div className="text-[10px] text-neutral-400 font-medium">{c.title}</div>
                          </td>
                          <td className="p-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                                c.status === 'ACTIVE'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400'
                                  : c.status === 'SCHEDULED'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-400'
                                  : c.status === 'PAUSED'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400'
                                  : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                              }`}
                            >
                              {c.status}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded bg-rose-50 text-[#FF005C] font-extrabold text-[10px] border border-rose-200">
                              {c.badgeText || 'Offer'}
                            </span>
                          </td>
                          <td className="p-4 font-black text-[#FF005C]">
                            {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                            {c.maxDiscount > 0 && (
                              <div className="text-[10px] text-neutral-400 font-normal">Max: ₹{c.maxDiscount}</div>
                            )}
                          </td>
                          <td className="p-4 text-[11px] text-neutral-500">
                            <div>{new Date(c.startDate).toLocaleDateString()}</div>
                            <div>to {new Date(c.endDate).toLocaleDateString()}</div>
                          </td>
                          <td className="p-4 font-mono font-bold text-center">{c.priority}</td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => handleToggleCampaign(c._id)}
                              className={`px-3 py-1.5 rounded-xl font-black text-[11px] transition ${
                                c.status === 'ACTIVE'
                                  ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                  : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              }`}
                            >
                              {c.status === 'ACTIVE' ? 'Pause' : 'Activate'}
                            </button>
                            <button
                              onClick={() => {
                                setEditingCampaign(c);
                                setIsCampaignModalOpen(true);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 font-black text-[11px]"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteCampaign(c._id)}
                              className="px-2.5 py-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 font-black text-[11px]"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HERO SLOGANS & COPY */}
      {activeSubTab === 'hero' && (
        <div className="bg-white dark:bg-[#121212] p-6 rounded-3xl border border-[#EAEAEA] dark:border-[#222] space-y-6">
          <div>
            <h3 className="font-heading font-black text-lg text-slate-900 dark:text-white">Hero Slogan & Subheading CMS</h3>
            <p className="text-xs text-neutral-500 font-medium">Edit main headline lines, highlighted brand text, and sub-text without touching code.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">Headline Line 1</label>
              <input
                type="text"
                value={heroForm.headingLine1}
                onChange={(e) => setHeroForm({ ...heroForm, headingLine1: e.target.value })}
                className="w-full p-3 rounded-2xl border border-slate-200 dark:border-[#292929] bg-slate-50 dark:bg-[#1A1A1A] font-bold text-xs"
                placeholder="Your Exam. Your Dream."
              />
            </div>
            <div>
              <label className="block text-xs font-black text-[#FF005C] mb-1">Highlighted Heading (Pink)</label>
              <input
                type="text"
                value={heroForm.headingHighlight}
                onChange={(e) => setHeroForm({ ...heroForm, headingHighlight: e.target.value })}
                className="w-full p-3 rounded-2xl border border-[#FF005C]/40 bg-[#FFF0F5] dark:bg-[#2A0A17] font-black text-xs text-[#FF005C]"
                placeholder="Our Vouchers."
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">Headline Line 3</label>
              <input
                type="text"
                value={heroForm.headingLine3}
                onChange={(e) => setHeroForm({ ...heroForm, headingLine3: e.target.value })}
                className="w-full p-3 rounded-2xl border border-slate-200 dark:border-[#292929] bg-slate-50 dark:bg-[#1A1A1A] font-bold text-xs"
                placeholder="Your Savings."
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">Hero Subheading Description</label>
            <textarea
              rows="3"
              value={heroForm.descriptionText}
              onChange={(e) => setHeroForm({ ...heroForm, descriptionText: e.target.value })}
              className="w-full p-3 rounded-2xl border border-slate-200 dark:border-[#292929] bg-slate-50 dark:bg-[#1A1A1A] font-medium text-xs"
              placeholder="Get official voucher codes for PTE, IELTS, TOEFL & Duolingo at the best prices..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">Primary CTA Button Text</label>
              <input
                type="text"
                value={heroForm.ctaText}
                onChange={(e) => setHeroForm({ ...heroForm, ctaText: e.target.value })}
                className="w-full p-3 rounded-2xl border border-slate-200 dark:border-[#292929] bg-slate-50 dark:bg-[#1A1A1A] font-bold text-xs"
                placeholder="Browse Vouchers"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">Primary CTA Target Link</label>
              <input
                type="text"
                value={heroForm.ctaLink}
                onChange={(e) => setHeroForm({ ...heroForm, ctaLink: e.target.value })}
                className="w-full p-3 rounded-2xl border border-slate-200 dark:border-[#292929] bg-slate-50 dark:bg-[#1A1A1A] font-bold text-xs"
                placeholder="/#vouchers"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleSaveHeroSettings}
              disabled={savingSettings}
              className="px-6 py-3 rounded-2xl bg-[#FF005C] hover:bg-[#E00052] text-white font-black text-xs shadow-lg shadow-[#FF005C]/20 cursor-pointer transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Hero Slogans
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: ANNOUNCEMENT BAR */}
      {activeSubTab === 'announcement' && (
        <div className="bg-white dark:bg-[#121212] p-6 rounded-3xl border border-[#EAEAEA] dark:border-[#222] space-y-6">
          <div>
            <h3 className="font-heading font-black text-lg text-slate-900 dark:text-white">Top Announcement Bar CMS</h3>
            <p className="text-xs text-neutral-500 font-medium">Manage the top notice bar shown across every page of the website.</p>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-2xl bg-neutral-50 dark:bg-[#1A1A1A] border border-[#EAEAEA] dark:border-[#222]">
            <input
              type="checkbox"
              id="annEnabled"
              checked={announcementForm.enabled}
              onChange={(e) => setAnnouncementForm({ ...announcementForm, enabled: e.target.checked })}
              className="w-4 h-4 accent-[#FF005C]"
            />
            <label htmlFor="annEnabled" className="text-xs font-black text-slate-900 dark:text-white cursor-pointer">
              Enable Top Announcement Bar
            </label>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">Standard Announcement Text</label>
            <input
              type="text"
              value={announcementForm.text}
              onChange={(e) => setAnnouncementForm({ ...announcementForm, text: e.target.value })}
              className="w-full p-3 rounded-2xl border border-slate-200 dark:border-[#292929] bg-slate-50 dark:bg-[#1A1A1A] font-bold text-xs"
              placeholder="⚡ Instant Voucher Delivery in 10s • 100% Genuine Official Vouchers"
            />
          </div>

          <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-50/50 dark:bg-[#2A0A17]/30 border border-[#FF005C]/20">
            <input
              type="checkbox"
              id="annOverride"
              checked={announcementForm.overrideWithCampaign}
              onChange={(e) => setAnnouncementForm({ ...announcementForm, overrideWithCampaign: e.target.checked })}
              className="w-4 h-4 accent-[#FF005C]"
            />
            <label htmlFor="annOverride" className="text-xs font-black text-[#FF005C] cursor-pointer">
              Automatically Override with Active Campaign Banner (e.g. 🇮🇳 Independence Day Sale — 50% OFF)
            </label>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleSaveAnnouncement}
              disabled={savingSettings}
              className="px-6 py-3 rounded-2xl bg-[#FF005C] hover:bg-[#E00052] text-white font-black text-xs shadow-lg shadow-[#FF005C]/20 cursor-pointer transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Announcement Settings
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: VOUCHER PRICES QUICK-EDIT */}
      {activeSubTab === 'prices' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white dark:bg-[#121212] p-5 rounded-3xl border border-[#EAEAEA] dark:border-[#222]">
            <div>
              <h3 className="font-heading font-black text-lg text-slate-900 dark:text-white">Voucher Pricing Quick Controls</h3>
              <p className="text-xs text-neutral-500 font-medium">Update MRP, selling prices, and stock availability instantly across all site pages.</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#121212] rounded-3xl border border-[#EAEAEA] dark:border-[#222] overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 dark:bg-[#171717] border-b border-[#EAEAEA] dark:border-[#222] text-[11px] font-black text-neutral-500 uppercase tracking-wider">
                  <th className="p-4">Voucher Name</th>
                  <th className="p-4">MRP (Original)</th>
                  <th className="p-4">Selling Price (Discounted)</th>
                  <th className="p-4">Savings</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAEAEA] dark:divide-[#222] text-xs font-semibold">
                {productPrices.map((prod, idx) => {
                  const mrp = Number(prod.originalPrice) || 0;
                  const sell = Number(prod.sellingPrice) || 0;
                  const savings = Math.max(0, mrp - sell);
                  const disc = mrp > 0 ? Math.round((savings / mrp) * 100) : 0;

                  return (
                    <tr key={prod._id} className="hover:bg-neutral-50/50 dark:hover:bg-[#171717]/50">
                      <td className="p-4 font-black text-slate-900 dark:text-white">
                        <div>{prod.name}</div>
                        <div className="text-[10px] text-neutral-400 font-medium">{prod.brand}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <span className="text-neutral-400 font-bold">₹</span>
                          <input
                            type="number"
                            value={prod.originalPrice}
                            onChange={(e) => {
                              const val = e.target.value;
                              setProductPrices((prev) =>
                                prev.map((p, i) => (i === idx ? { ...p, originalPrice: val } : p))
                              );
                            }}
                            className="w-24 p-2 rounded-xl border border-slate-200 dark:border-[#292929] bg-slate-50 dark:bg-[#1A1A1A] font-bold text-xs"
                          />
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <span className="text-[#FF005C] font-black">₹</span>
                          <input
                            type="number"
                            value={prod.sellingPrice}
                            onChange={(e) => {
                              const val = e.target.value;
                              setProductPrices((prev) =>
                                prev.map((p, i) => (i === idx ? { ...p, sellingPrice: val } : p))
                              );
                            }}
                            className="w-24 p-2 rounded-xl border border-[#FF005C]/30 bg-rose-50/50 dark:bg-[#2A0A17]/30 font-black text-xs text-[#FF005C]"
                          />
                        </div>
                      </td>
                      <td className="p-4 text-emerald-600 dark:text-emerald-400 font-black">
                        Save ₹{savings.toLocaleString()} ({disc}%)
                      </td>
                      <td className="p-4">
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={prod.inStock}
                            onChange={(e) => {
                              const val = e.target.checked;
                              setProductPrices((prev) =>
                                prev.map((p, i) => (i === idx ? { ...p, inStock: val } : p))
                              );
                            }}
                            className="w-4 h-4 accent-[#FF005C]"
                          />
                          <span className="text-xs font-bold">{prod.inStock ? 'In Stock' : 'Out of Stock'}</span>
                        </label>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleQuickPriceSave(prod)}
                          className="px-4 py-2 rounded-xl bg-[#FF005C] hover:bg-[#E00052] text-white font-black text-xs shadow-md inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" /> Save Price
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: FOOTER & BENEFITS */}
      {activeSubTab === 'footer' && (
        <div className="bg-white dark:bg-[#121212] p-6 rounded-3xl border border-[#EAEAEA] dark:border-[#222] space-y-6">
          <div>
            <h3 className="font-heading font-black text-lg text-slate-900 dark:text-white">Footer Content Management</h3>
            <p className="text-xs text-neutral-500 font-medium">Update footer description, support phone, support email, and copyright text.</p>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">Footer Brand Description</label>
            <textarea
              rows="3"
              value={footerForm.description}
              onChange={(e) => setFooterForm({ ...footerForm, description: e.target.value })}
              className="w-full p-3 rounded-2xl border border-slate-200 dark:border-[#292929] bg-slate-50 dark:bg-[#1A1A1A] font-medium text-xs"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">Support Phone Number</label>
              <input
                type="text"
                value={footerForm.phone}
                onChange={(e) => setFooterForm({ ...footerForm, phone: e.target.value })}
                className="w-full p-3 rounded-2xl border border-slate-200 dark:border-[#292929] bg-slate-50 dark:bg-[#1A1A1A] font-bold text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">Support Email Address</label>
              <input
                type="text"
                value={footerForm.email}
                onChange={(e) => setFooterForm({ ...footerForm, email: e.target.value })}
                className="w-full p-3 rounded-2xl border border-slate-200 dark:border-[#292929] bg-slate-50 dark:bg-[#1A1A1A] font-bold text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">Copyright Line</label>
            <input
              type="text"
              value={footerForm.copyright}
              onChange={(e) => setFooterForm({ ...footerForm, copyright: e.target.value })}
              className="w-full p-3 rounded-2xl border border-slate-200 dark:border-[#292929] bg-slate-50 dark:bg-[#1A1A1A] font-bold text-xs"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleSaveFooterSettings}
              disabled={savingSettings}
              className="px-6 py-3 rounded-2xl bg-[#FF005C] hover:bg-[#E00052] text-white font-black text-xs shadow-lg shadow-[#FF005C]/20 cursor-pointer transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Footer Settings
            </button>
          </div>
        </div>
      )}

      {/* TAB 6: BUSINESS & EMAIL INFO */}
      {activeSubTab === 'business' && (
        <div className="bg-white dark:bg-[#121212] p-6 rounded-3xl border border-[#EAEAEA] dark:border-[#222] space-y-6">
          <div>
            <h3 className="font-heading font-black text-lg text-slate-900 dark:text-white">Centralized Business & Support Details</h3>
            <p className="text-xs text-neutral-500 font-medium">Official business details used across customer emails, admin notifications, customer receipts, header, and footer.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2 border border-slate-800">
            <div className="flex items-center gap-2 text-xs font-black text-[#FF005C]">
              <ShieldCheck className="w-4 h-4" /> 🔒 SECURITY & SECRET MANAGEMENT POLICY
            </div>
            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              SMTP passwords and database credentials are stored <strong>strictly in backend environment variables (.env)</strong>. They are never rendered in the browser, sent over API responses, logged in plain text, or committed to repositories.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">Official Business Name</label>
              <input
                type="text"
                disabled
                value="Apex Vouchers"
                className="w-full p-3 rounded-2xl border border-slate-200 dark:border-[#292929] bg-slate-100 dark:bg-[#1A1A1A] font-bold text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-[#FF005C] mb-1">Official Sender & Support Email</label>
              <input
                type="text"
                disabled
                value="apexvouchers@gmail.com"
                className="w-full p-3 rounded-2xl border border-[#FF005C]/30 bg-rose-50/50 dark:bg-[#2A0A17]/30 font-black text-xs text-[#FF005C]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">Official Support Phone Number</label>
              <input
                type="text"
                disabled
                value="+91 9855926113"
                className="w-full p-3 rounded-2xl border border-slate-200 dark:border-[#292929] bg-slate-100 dark:bg-[#1A1A1A] font-bold text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">Internal Admin Notification Recipient</label>
              <input
                type="text"
                disabled
                value="apexvouchers@gmail.com"
                className="w-full p-3 rounded-2xl border border-slate-200 dark:border-[#292929] bg-slate-100 dark:bg-[#1A1A1A] font-bold text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: LIVE PREVIEW */}
      {activeSubTab === 'preview' && (
        <div className="bg-white dark:bg-[#121212] p-6 rounded-3xl border border-[#EAEAEA] dark:border-[#222] space-y-6">
          <div>
            <h3 className="font-heading font-black text-lg text-slate-900 dark:text-white">Live Campaign & Hero Preview</h3>
            <p className="text-xs text-neutral-500 font-medium">This shows how your campaign and slogans will render to visitors on the homepage.</p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200/80 dark:border-[#292929] space-y-6">
            {activeCampaign ? (
              <div className="p-5 rounded-3xl bg-gradient-to-r from-[#FFF0F5] via-rose-50 to-pink-50 dark:from-[#2A0A17] dark:via-[#1F0811] dark:to-[#16050B] border border-[#FF005C]/30 shadow-lg space-y-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#FF005C] text-white font-black text-xs uppercase">
                  {activeCampaign.badgeText || '🇮🇳 CAMPAIGN ACTIVE'}
                </span>
                <h4 className="text-2xl font-black text-slate-900 dark:text-white">{activeCampaign.title}</h4>
                <p className="text-sm font-bold text-[#FF005C]">{activeCampaign.subtitle}</p>
                <p className="text-xs text-slate-600 dark:text-slate-300">{activeCampaign.description}</p>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFF0F5] border border-[#FF005C]/20 text-xs font-black text-[#FF005C]">
                🎟️ Save on Exam Fees with Apex Vouchers
              </div>
            )}

            <h1 className="font-heading font-black text-3xl sm:text-4xl text-slate-900 dark:text-white leading-tight">
              {heroForm.headingLine1} <br />
              <span className="text-[#FF005C]">{heroForm.headingHighlight}</span> <br />
              {heroForm.headingLine3}
            </h1>

            <p className="text-sm text-slate-600 dark:text-slate-300 font-medium max-w-xl">
              {heroForm.descriptionText}
            </p>

            <button className="px-6 py-3 rounded-full bg-[#FF005C] text-white font-black text-xs shadow-lg">
              {activeCampaign?.ctaText || heroForm.ctaText || 'Browse Vouchers'}
            </button>
          </div>
        </div>
      )}

      {/* CAMPAIGN MODAL (Create / Edit) */}
      {isCampaignModalOpen && (
        <CampaignFormModal
          campaign={editingCampaign}
          products={products}
          onClose={() => {
            setIsCampaignModalOpen(false);
            setEditingCampaign(null);
          }}
          onSave={handleSaveCampaignSubmit}
        />
      )}
    </div>
  );
}

function CampaignFormModal({ campaign, products, onClose, onSave }) {
  const [form, setForm] = useState({
    name: campaign?.name || '',
    status: campaign?.status || 'ACTIVE',
    startDate: campaign?.startDate ? new Date(campaign.startDate).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
    endDate: campaign?.endDate ? new Date(campaign.endDate).toISOString().slice(0, 16) : new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16),
    priority: campaign?.priority || 1,
    badgeText: campaign?.badgeText || '🇮🇳 Independence Day Special',
    title: campaign?.title || '50% OFF EXAM VOUCHERS',
    subtitle: campaign?.subtitle || 'Celebrate & Save Big on Your Exam Fees',
    description: campaign?.description || 'Get official exam vouchers at maximum discount during our special sale.',
    discountType: campaign?.discountType || 'PERCENTAGE',
    discountValue: campaign?.discountValue !== undefined ? campaign.discountValue : 50,
    maxDiscount: campaign?.maxDiscount || 0,
    minOrderAmount: campaign?.minOrderAmount || 0,
    applicableProducts: campaign?.applicableProducts ? campaign.applicableProducts.map((p) => (typeof p === 'object' ? p._id : p)) : [],
    ctaText: campaign?.ctaText || 'Shop Independence Day Offer',
    showCountdown: campaign?.showCountdown !== false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#141414] w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-[#292929] shadow-2xl p-6 space-y-6 my-8">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#252525] pb-4">
          <div>
            <h3 className="font-heading font-black text-xl text-slate-900 dark:text-white">
              {campaign ? 'Edit Campaign' : 'Create New Campaign'}
            </h3>
            <p className="text-xs text-neutral-500 font-medium">Configure festival offers, date ranges, and discounts.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-[#252525]">
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-black">Campaign Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full p-3 rounded-2xl border border-slate-200 dark:border-[#292929] bg-slate-50 dark:bg-[#1A1A1A] font-bold"
                placeholder="Independence Day Sale"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-black">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full p-3 rounded-2xl border border-slate-200 dark:border-[#292929] bg-slate-50 dark:bg-[#1A1A1A] font-bold"
              >
                <option value="ACTIVE">ACTIVE (Live on Site)</option>
                <option value="SCHEDULED">SCHEDULED (Auto-activates on start date)</option>
                <option value="DRAFT">DRAFT</option>
                <option value="PAUSED">PAUSED</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-black">Start Date & Time *</label>
              <input
                type="datetime-local"
                required
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full p-3 rounded-2xl border border-slate-200 dark:border-[#292929] bg-slate-50 dark:bg-[#1A1A1A] font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-black">End Date & Time *</label>
              <input
                type="datetime-local"
                required
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full p-3 rounded-2xl border border-slate-200 dark:border-[#292929] bg-slate-50 dark:bg-[#1A1A1A] font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-black">Discount Type</label>
              <select
                value={form.discountType}
                onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                className="w-full p-3 rounded-2xl border border-slate-200 dark:border-[#292929] bg-slate-50 dark:bg-[#1A1A1A] font-bold"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-[#FF005C] mb-1 font-black">Discount Value *</label>
              <input
                type="number"
                required
                min="0"
                value={form.discountValue}
                onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })}
                className="w-full p-3 rounded-2xl border border-[#FF005C]/40 bg-rose-50/50 dark:bg-[#2A0A17]/30 font-black text-[#FF005C]"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-black">Max Discount Cap (₹)</label>
              <input
                type="number"
                min="0"
                value={form.maxDiscount}
                onChange={(e) => setForm({ ...form, maxDiscount: Number(e.target.value) })}
                className="w-full p-3 rounded-2xl border border-slate-200 dark:border-[#292929] bg-slate-50 dark:bg-[#1A1A1A] font-bold"
                placeholder="0 = No limit"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-black">Badge Text</label>
              <input
                type="text"
                value={form.badgeText}
                onChange={(e) => setForm({ ...form, badgeText: e.target.value })}
                className="w-full p-3 rounded-2xl border border-slate-200 dark:border-[#292929] bg-slate-50 dark:bg-[#1A1A1A] font-bold"
                placeholder="🇮🇳 Independence Day Special"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-black">Promotional Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full p-3 rounded-2xl border border-slate-200 dark:border-[#292929] bg-slate-50 dark:bg-[#1A1A1A] font-bold"
                placeholder="50% OFF EXAM VOUCHERS"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1 font-black">Subtitle / Tagline</label>
            <input
              type="text"
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              className="w-full p-3 rounded-2xl border border-slate-200 dark:border-[#292929] bg-slate-50 dark:bg-[#1A1A1A] font-medium"
              placeholder="Celebrate & Save Big on Your Exam Fees"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1 font-black">Included Products</label>
            <div className="p-3 rounded-2xl border border-slate-200 dark:border-[#292929] bg-slate-50 dark:bg-[#1A1A1A] space-y-2 max-h-36 overflow-y-auto">
              <label className="flex items-center gap-2 text-xs font-bold text-[#FF005C]">
                <input
                  type="checkbox"
                  checked={form.applicableProducts.length === 0}
                  onChange={(e) => {
                    if (e.target.checked) setForm({ ...form, applicableProducts: [] });
                  }}
                  className="w-4 h-4 accent-[#FF005C]"
                />
                Apply to ALL Vouchers (PTE, IELTS, TOEFL, Duolingo)
              </label>
              {products.map((prod) => {
                const prodId = prod._id || prod.id;
                const isSelected = form.applicableProducts.includes(prodId);
                return (
                  <label key={prodId} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setForm({ ...form, applicableProducts: [...form.applicableProducts, prodId] });
                        } else {
                          setForm({
                            ...form,
                            applicableProducts: form.applicableProducts.filter((id) => id !== prodId),
                          });
                        }
                      }}
                      className="w-4 h-4 accent-[#FF005C]"
                    />
                    {prod.name} ({prod.brand || prod.provider})
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-[#252525]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl bg-[#FF005C] hover:bg-[#E00052] text-white font-black shadow-lg shadow-[#FF005C]/20"
            >
              {campaign ? 'Update Campaign' : 'Save & Publish Campaign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
