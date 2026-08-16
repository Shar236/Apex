import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard, Package, Ticket, Users, ShoppingCart, Tag, Film, Play, Video as VideoIcon,
  LogOut, Search, Plus, Edit2, Trash2, Upload, Save, RefreshCw, CheckCircle2, AlertTriangle, X, ArrowRight, Crown, Sparkles, Clock, ShieldCheck, Eye, Copy, Download, TrendingUp, TrendingDown, FileSpreadsheet, ShieldAlert
} from 'lucide-react';
import { adminApi, formatPrice } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useVoucher } from '../context/VoucherContext';
import { useNavigate } from 'react-router-dom';
import { ApexLogo } from './ApexLogo';

const TABS = [
  { id: 'dashboard', label: 'Overview & Analytics', icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'products', label: 'Products', icon: <Package className="w-4 h-4" /> },
  { id: 'vouchers', label: 'Voucher Inventory', icon: <Ticket className="w-4 h-4" /> },
  { id: 'orders', label: 'Orders', icon: <ShoppingCart className="w-4 h-4" /> },
  { id: 'users', label: 'Customers', icon: <Users className="w-4 h-4" /> },
  { id: 'promotions', label: 'Promotions', icon: <Tag className="w-4 h-4" /> },
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
        {tab === 'products' && <ProductsAdmin />}
        {tab === 'vouchers' && <VouchersAdmin />}
        {tab === 'orders' && <OrdersAdmin />}
        {tab === 'users' && <UsersAdmin />}
        {tab === 'promotions' && <PromotionsAdmin />}
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

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl tracking-tight">Order Management</h1>
          <p className="text-xs font-bold text-neutral-500 dark:text-[#B5B5B5]">Review customer orders, payment status, and voucher allocation.</p>
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
                <Th>Date</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan="8" className="p-4"><div className="h-8 bg-neutral-100 dark:bg-[#292929] rounded animate-pulse" /></td></tr>}
              {!loading && rows.map(o => (
                <tr key={o._id} className="border-t border-[#EAEAEA] dark:border-[#292929]">
                  <Td className="whitespace-nowrap font-black">#{o.orderNo}</Td>
                  <Td className="whitespace-nowrap">{o.userId?.name || 'Guest'}<div className="text-[10px] text-neutral-400">{o.userId?.email || o.customerSnapshot?.email || ''}</div></Td>
                  <Td className="text-right tabular-nums">{formatPrice(o.total)}</Td>
                  <Td>{(o.items || []).length}</Td>
                  <Td><Pill text={o.orderStatus} /></Td>
                  <Td><Pill text={o.paymentStatus} tint="sky" /></Td>
                  <Td className="whitespace-nowrap">{new Date(o.createdAt).toLocaleDateString()}</Td>
                  <Td className="whitespace-nowrap">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Video Title *" value={draft.title} onChange={(v) => setDraft({ ...draft, title: v })} placeholder="e.g. How to Buy an Exam Voucher" />
                <Field label="Category *" value={draft.category} onChange={(v) => setDraft({ ...draft, category: v })} placeholder="Step-By-Step Guide / PTE Voucher" />
                <Field label="Video Stream URL (MP4 / CDN) *" value={draft.videoUrl} onChange={(v) => setDraft({ ...draft, videoUrl: v })} placeholder="https://..." />
                <Field label="YouTube Embed / Share Link" value={draft.youtubeEmbed || ''} onChange={(v) => setDraft({ ...draft, youtubeEmbed: v })} placeholder="https://www.youtube.com/watch?v=..." />
                <Field label="Thumbnail Image URL *" value={draft.thumbnail} onChange={(v) => setDraft({ ...draft, thumbnail: v })} placeholder="https://images.unsplash.com/..." />
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

            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-white/10 shadow-xl relative">
              <iframe
                className="w-full h-full object-cover"
                src={previewVideo.youtubeEmbed || previewVideo.videoUrl}
                title={previewVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
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
