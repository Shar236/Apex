import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  LayoutDashboard, Package, Ticket, Users, ShoppingCart, Tag, Film, Play, Video as VideoIcon,
  LogOut, Search, Plus, Edit2, Trash2, Upload, Save, RefreshCw, CheckCircle2, AlertTriangle, X, ArrowRight, Crown, Sparkles, Clock, ShieldCheck, Eye, EyeOff, Copy, Download, TrendingUp, TrendingDown, FileSpreadsheet, ShieldAlert, Megaphone, Globe, Calendar, DollarSign, Sliders, Type,
  Search as SearchIcon, ExternalLink, AlertOctagon, Info, ArrowLeftRight, Settings2, FileText, Link2, Image as ImageIcon, Code2, Hash, CheckSquare, ListChecks, Bell, Layers, Check as CheckIcon, ArrowUp, ArrowDown, ChevronUp, ChevronDown,
  CalendarCheck, MapPin, Phone, Mail, StickyNote, GripVertical, Trophy
} from 'lucide-react';

import { adminApi, formatPrice, apiBase, getToken } from '../lib/api';
import { imageUrl } from '../lib/imageUrl.js';
import { useAuth } from '../context/AuthContext';
import { useVoucher } from '../context/VoucherContext';
import { useNavigate } from 'react-router-dom';
import { ApexLogo } from './ApexLogo';
import { DynamicPTELogo, PearsonOfficialLogo } from './OfficialBrandLogos';
import AwardsAdmin from './AwardsAdmin';
import BlogAdmin from '../blogs/admin/BlogAdmin';

const TABS = [
  { id: 'dashboard', label: 'Overview & Analytics', icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'cms', label: 'Website CMS & Campaigns', icon: <Megaphone className="w-4 h-4 text-brand-pink" /> },
  { id: 'products', label: 'Products & Pricing', icon: <Package className="w-4 h-4" /> },
  { id: 'vouchers', label: 'Voucher Inventory', icon: <Ticket className="w-4 h-4" /> },
  { id: 'orders', label: 'Orders', icon: <ShoppingCart className="w-4 h-4" /> },
  { id: 'pte-bookings', label: 'PTE Booking Requests', icon: <CalendarCheck className="w-4 h-4" /> },
  { id: 'users', label: 'Customers', icon: <Users className="w-4 h-4" /> },
  { id: 'promotions', label: 'Promo Coupons', icon: <Tag className="w-4 h-4" /> },
  { id: 'seo', label: 'SEO Manager', icon: <SearchIcon className="w-4 h-4" /> },
  { id: 'videos', label: 'Videos / Reels', icon: <Film className="w-4 h-4" /> },
  { id: 'awards', label: 'Awards & Achievements', icon: <Trophy className="w-4 h-4" /> },
  { id: 'audit-logs', label: 'Audit Logs', icon: <Clock className="w-4 h-4" /> },
];

export default function AdminConsole({ initial = 'dashboard' }) {
  const [tab, setTab] = useState(initial);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsData, setNotificationsData] = useState({ data: [], counts: {} });
  const [notifLoading, setNotifLoading] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const loadNotifications = async () => {
    setNotifLoading(true);
    try {
      const res = await adminApi.notifications();
      if (res?.success) {
        setNotificationsData(res);
      }
    } catch {} finally {
      setNotifLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    const timer = setInterval(loadNotifications, 15000);
    return () => clearInterval(timer);
  }, []);

  const criticalCount = notificationsData?.counts?.critical || 0;
  const salesCount = notificationsData?.counts?.sales || 0;

  return (
    <div className="min-h-screen bg-[#F3EEFF]/30 dark:bg-[#0A0A0A] text-neutral-900 dark:text-white flex flex-col lg:flex-row transition-colors duration-300">
      <aside className="lg:w-72 lg:min-h-screen bg-white dark:bg-[#101010] border-r border-[#EAEAEA] dark:border-[#222] p-5 lg:sticky lg:top-0 shrink-0 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-6 lg:mb-8">
            <ApexLogo className="h-7" />
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setNotificationsOpen(!notificationsOpen); loadNotifications(); }}
                className="relative p-2 rounded-xl bg-neutral-100 dark:bg-[#202020] text-neutral-700 dark:text-neutral-200 hover:text-brand-pink transition"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {(criticalCount > 0 || salesCount > 0) && (
                  <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-black text-white flex items-center justify-center animate-pulse ${criticalCount > 0 ? 'bg-rose-600' : 'bg-emerald-600'}`}>
                    {criticalCount > 0 ? '!' : salesCount}
                  </span>
                )}
              </button>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-pink/10 text-brand-pink border border-brand-pink/20 text-[10px] font-black">
                <Crown className="w-3 h-3" /> ADMIN
              </span>
            </div>
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
                className={`inline-flex items-center gap-2.5 px-4 py-3 rounded-2xl font-black text-xs whitespace-nowrap transition shrink-0 ${
                  tab === t.id ? 'bg-brand-pink text-white shadow-lg' : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[#1e1e1e]'
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-6 pt-5 border-t border-[#EAEAEA] dark:border-[#292929]">
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="w-full inline-flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-400 font-black text-xs justify-center"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-350 mx-auto w-full relative">
        {/* Real-time Notifications Drawer */}
        {notificationsOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
            <div className="bg-white dark:bg-[#141414] w-full max-w-md h-full shadow-2xl border-l border-neutral-200 dark:border-[#262626] flex flex-col animate-in slide-in-from-right duration-200">
              <div className="p-5 border-b border-neutral-200 dark:border-[#262626] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-brand-pink/10 text-brand-pink flex items-center justify-center font-black">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black text-base">Admin Notifications</h3>
                    <p className="text-[11px] font-bold text-neutral-500">Live sold vouchers, low inventory, and security alerts</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={loadNotifications} className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-[#222]">
                    <RefreshCw className={`w-4 h-4 ${notifLoading ? 'animate-spin' : ''}`} />
                  </button>
                  <button onClick={() => setNotificationsOpen(false)} className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-[#222]">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {notificationsData?.data?.length === 0 ? (
                  <div className="text-center py-16">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-50" />
                    <div className="font-black text-sm text-neutral-600 dark:text-neutral-400">All systems normal</div>
                    <div className="text-xs text-neutral-400 font-semibold">No recent alerts or pending mismatch events</div>
                  </div>
                ) : (
                  notificationsData?.data?.map((n, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border transition-all ${
                        n.severity === 'critical' || n.type === 'MISMATCH_BLOCKED'
                          ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60'
                          : n.type === 'OUT_OF_STOCK'
                          ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40'
                          : n.type === 'LOW_STOCK'
                          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/40'
                          : 'bg-emerald-50/60 dark:bg-[#161f1a] border-emerald-200 dark:border-emerald-900/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="font-black text-xs flex items-center gap-1.5">
                          {n.title}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400">
                          {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs font-semibold leading-relaxed text-neutral-800 dark:text-neutral-200 mb-2">
                        {n.message}
                      </p>

                      {n.data && (
                        <div className="p-2.5 rounded-xl bg-white/80 dark:bg-[#0E0E0E]/80 border border-neutral-200/50 dark:border-[#222] font-mono text-[10px] space-y-1">
                          {n.data.codeMasked && (
                            <div className="flex justify-between">
                              <span className="text-neutral-400">Voucher Code:</span>
                              <span className="font-black text-brand-pink">{n.data.codeMasked}</span>
                            </div>
                          )}
                          {n.data.voucherType && (
                            <div className="flex justify-between">
                              <span className="text-neutral-400">Voucher Type:</span>
                              <span className="font-black text-[#6C3CE0]">{n.data.voucherType}</span>
                            </div>
                          )}
                          {n.data.customerEmail && (
                            <div className="flex justify-between">
                              <span className="text-neutral-400">Customer:</span>
                              <span className="truncate max-w-45 font-bold text-neutral-700 dark:text-neutral-300">{n.data.customerEmail}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {tab === 'dashboard' && <AdminOverview onNavigate={setTab} />}
        {tab === 'cms' && <WebsiteCMSAdmin />}
        {tab === 'products' && <ProductsAdmin />}
        {tab === 'vouchers' && <VouchersAdmin />}
        {tab === 'orders' && <OrdersAdmin />}
        {tab === 'pte-bookings' && <PTEBookingsAdmin />}
        {tab === 'users' && <UsersAdmin />}
        {tab === 'promotions' && <PromotionsAdmin />}
        {tab === 'seo' && <SEOManager />}
        {tab === 'videos' && <VideosAdmin />}
        {tab === 'awards' && <AwardsAdmin />}
        {tab === 'audit-logs' && <AuditLogsAdmin />}
      </main>
    </div>
  );
}

function StatCard({ label, value, icon, tint = '#FF005C', growth = null, sub = null, onClick = null }) {
  const Comp = onClick ? 'button' : 'div';
  return (
    <Comp
      onClick={onClick || undefined}
      className={`rounded-3xl p-5 bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm flex flex-col justify-between text-left w-full ${onClick ? 'hover:border-brand-pink transition-colors cursor-pointer' : ''}`}
    >
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
    </Comp>
  );
}

function AdminOverview({ onNavigate }) {
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
    { label: 'New PTE Requests', value: kpi.newPTEBookingRequests || 0, icon: <CalendarCheck className="w-5 h-5" />, tint: '#0EA5E9', onClick: () => onNavigate?.('pte-bookings') },
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
            className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] font-black text-xs shadow-sm focus:outline-none focus:border-brand-pink"
          >
            <option value="today">Today</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <button onClick={() => refresh(period)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] font-black text-xs shadow-sm hover:border-brand-pink">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Real-time Alerts Banner */}
      {(alerts.lowStockCount > 0 || alerts.failedPaymentsCount > 0 || alerts.pendingOrdersCount > 0 || alerts.expiringPromosCount > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {alerts.lowStockCount > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <div>
                <div className="font-black text-xs text-amber-900 dark:text-amber-300">Low Stock Alert</div>
                <div className="text-[11px] font-bold text-amber-700 dark:text-amber-400">{alerts.lowStockCount} products need restocking</div>
              </div>
            </div>
          )}
          {alerts.pendingOrdersCount > 0 && (
            <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900/40 flex items-center gap-3">
              <Clock className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0" />
              <div>
                <div className="font-black text-xs text-sky-900 dark:text-sky-300">Pending Orders</div>
                <div className="text-[11px] font-bold text-sky-700 dark:text-sky-400">{alerts.pendingOrdersCount} orders awaiting action</div>
              </div>
            </div>
          )}
          {alerts.failedPaymentsCount > 0 && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
              <div>
                <div className="font-black text-xs text-rose-900 dark:text-rose-300">Failed Payments</div>
                <div className="text-[11px] font-bold text-rose-700 dark:text-rose-400">{alerts.failedPaymentsCount} transaction attempts failed</div>
              </div>
            </div>
          )}
          {alerts.expiringPromosCount > 0 && (
            <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/40 flex items-center gap-3">
              <Tag className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0" />
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
                      className="w-full bg-brand-pink rounded-t-lg transition-all hover:bg-[#6C3CE0]"
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
                <div className="text-right font-heading font-black text-base text-brand-pink">
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
              className="accent-brand-pink"
            />
            <span>Allow Unmasked Voucher Export</span>
          </label>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => adminApi.downloadExport('orders')}
            className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] hover:border-brand-pink text-left font-black text-xs flex items-center justify-between transition"
          >
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-brand-pink" />
              <span>Orders CSV</span>
            </div>
            <Download className="w-4 h-4 text-neutral-400" />
          </button>
          <button
            onClick={() => adminApi.downloadExport('customers')}
            className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] hover:border-brand-pink text-left font-black text-xs flex items-center justify-between transition"
          >
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-[#6C3CE0]" />
              <span>Customers CSV</span>
            </div>
            <Download className="w-4 h-4 text-neutral-400" />
          </button>
          <button
            onClick={() => adminApi.downloadExport('vouchers', unmaskedExport)}
            className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] hover:border-brand-pink text-left font-black text-xs flex items-center justify-between transition"
          >
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
              <span>Vouchers CSV</span>
            </div>
            <Download className="w-4 h-4 text-neutral-400" />
          </button>
          <button
            onClick={() => adminApi.downloadExport('sales')}
            className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] hover:border-brand-pink text-left font-black text-xs flex items-center justify-between transition"
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
    pink: 'text-brand-pink bg-brand-pink/10 border-brand-pink/20',
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

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const PAGE_SIZE = 50;

  const filtersActive = !!(search || statusFilter || categoryFilter || providerFilter) || pages > 1;

  const refresh = async (targetPage = page) => {
    setLoading(true);
    const params = { sort: 'displayOrder', page: targetPage, limit: PAGE_SIZE };
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    if (categoryFilter) params.category = categoryFilter;
    if (providerFilter) params.provider = providerFilter;

    const res = await adminApi.products(params);
    setRows(res.data || []);
    setKpis(res.kpis || {});
    setPage(res.page || 1);
    setPages(res.pages || 1);
    setTotal(res.total ?? (res.data || []).length);
    setLoading(false);
    if (typeof refreshProducts === 'function') {
      refreshProducts();
    }
  };

  useEffect(() => {
    const t = setTimeout(() => refresh(1), 300);
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
      imagePublicId: '',
      originalPrice: 18900,
      sellingPrice: 15499,
      validityDays: 180,
      validityMonths: 6,
      badge: 'MOST POPULAR',
      badgeEnabled: true,
      badgeType: 'popular',
      badges: '',
      officialWebsiteUrl: '',
      officialProductUrl: '',
      sku: '',
      productCode: '',
      stockType: 'LIMITED',
      deliveryType: 'Instant Delivery',
      comingSoon: false,
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
      badges: Array.isArray(p.badges) ? p.badges.join(', ') : p.badges || '',
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
      if (res.deactivated) alert(`Product archived. Historical records preserved.`);
      refresh();
    } else alert(res.message || 'Action failed');
  };

  const duplicateProduct = async (p) => {
    const res = await adminApi.duplicateProduct(p._id || p.id);
    if (res.success) {
      alert(`Duplicated as "${res.data.name}" (inactive, review before publishing).`);
      refresh();
    } else alert(res.message || 'Failed to duplicate product');
  };

  const archiveProduct = async (p) => {
    if (!confirm(`Archive ${p.name}? It will be hidden from the public site but kept in Admin.`)) return;
    const res = await adminApi.archiveProduct(p._id || p.id);
    if (res.success) refresh();
    else alert(res.message || 'Failed to archive product');
  };

  const restoreProduct = async (p) => {
    const res = await adminApi.restoreProduct(p._id || p.id);
    if (res.success) refresh();
    else alert(res.message || 'Failed to restore product');
  };

  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const reorderTo = async (fromIndex, toIndex) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || filtersActive) return;
    const reordered = [...rows];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    const items = reordered.map((r, i) => ({ id: r._id, order: i + 1 }));
    const res = await adminApi.reorderProducts(items);
    if (res.success) refresh();
    else alert(res.message || 'Failed to reorder products');
  };

  const moveProduct = (index, direction) => reorderTo(index, index + direction);

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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Total Products" value={kpis.totalProducts || 0} icon={<Package className="w-4 h-4" />} tint="#6C3CE0" />
        <StatCard label="Active Products" value={kpis.activeProducts || 0} icon={<CheckCircle2 className="w-4 h-4" />} tint="#10B981" />
        <StatCard label="Inactive Products" value={kpis.inactiveProducts || 0} icon={<X className="w-4 h-4" />} tint="#64748B" />
        <StatCard label="Archived" value={kpis.archivedProducts || 0} icon={<Trash2 className="w-4 h-4" />} tint="#71717A" onClick={() => setStatusFilter('archived')} />
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
              <option value="PTE">PTE</option>
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
            { id: 'archived', label: 'Archived' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setStatusFilter(pill.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition whitespace-nowrap ${
                statusFilter === pill.id
                  ? 'bg-brand-pink text-white shadow-sm'
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
              <h4 className="text-xs font-black text-brand-pink uppercase tracking-wider mb-3">1. Basic Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Product Name *" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} placeholder="e.g. PTE Academic Voucher" />
                <Field label="Exam Provider *" value={draft.provider} onChange={(v) => setDraft({ ...draft, provider: v, brand: v })} placeholder="Pearson / ETS / Duolingo" />
                <Field label="Provider Short Name" value={draft.providerShortName} onChange={(v) => setDraft({ ...draft, providerShortName: v })} placeholder="PTE / GRE / TOEFL" />
                <Field label="Category *" value={draft.category} onChange={(v) => setDraft({ ...draft, category: v })} placeholder="PTE / English Language Test" />
                <Field label="Display Order (Rank)" type="number" value={draft.displayOrder} onChange={(v) => setDraft({ ...draft, displayOrder: v })} placeholder="0" />
                <Field label="CTA Button Text" value={draft.cta || 'Buy Now'} onChange={(v) => setDraft({ ...draft, cta: v })} />
              </div>
            </div>

            {/* Section 2: Pricing & Discounts */}
            <div className="pt-4 border-t border-[#EAEAEA] dark:border-[#292929]">
              <h4 className="text-xs font-black text-brand-pink uppercase tracking-wider mb-3">2. Pricing & Discounts (Single Source of Truth)</h4>
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
              <h4 className="text-xs font-black text-brand-pink uppercase tracking-wider mb-3">3. Customer Card Badges & Branding</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Card Badge Text (legacy, first shown)" value={draft.badge || ''} onChange={(v) => setDraft({ ...draft, badge: v })} placeholder="e.g. MOST POPULAR" />
                <div className="md:col-span-2">
                  <Field label="Badges (comma separated)" value={draft.badges || ''} onChange={(v) => setDraft({ ...draft, badges: v })} placeholder="Best Seller, Canada, Study Abroad" />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {['Best Seller', 'Most Popular', 'Featured', 'New', 'Limited Offer', 'Top Pick', 'Canada', 'UK', 'Australia', 'Study Abroad'].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          const current = String(draft.badges || '').split(',').map((s) => s.trim()).filter(Boolean);
                          if (!current.includes(preset)) setDraft({ ...draft, badges: [...current, preset].join(', ') });
                        }}
                        className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-[#262626] text-neutral-600 dark:text-neutral-300 text-[10px] font-black hover:bg-brand-pink/10 hover:text-brand-pink transition-colors"
                      >
                        + {preset}
                      </button>
                    ))}
                  </div>
                </div>
                <Field label="Validity (Months)" type="number" value={draft.validityMonths} onChange={(v) => setDraft({ ...draft, validityMonths: v })} />
                <Field label="Validity (Days)" type="number" value={draft.validityDays} onChange={(v) => setDraft({ ...draft, validityDays: v })} />
                <Field label="Delivery Type" value={draft.deliveryType || ''} onChange={(v) => setDraft({ ...draft, deliveryType: v })} placeholder="Instant Delivery" />
                <ProductLogoUploader value={draft.logo || ''} onChange={(url) => setDraft({ ...draft, logo: url })} />
                <ProductImageUploader
                  value={draft.image || ''}
                  onChange={(url, publicId) => setDraft({ ...draft, image: url, imagePublicId: publicId ?? draft.imagePublicId })}
                />
                <div>
                  <Label>Stock Type</Label>
                  <select value={draft.stockType || 'LIMITED'} onChange={(e) => setDraft({ ...draft, stockType: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-sm font-bold focus:outline-none focus:border-brand-pink">
                    <option value="LIMITED">Limited (tracked via voucher inventory)</option>
                    <option value="UNLIMITED">Unlimited (always in stock)</option>
                  </select>
                  {draft.stockType === 'UNLIMITED' && (
                    <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400 mt-1.5">
                      ⚠ "Unlimited" only affects the storefront display — voucher delivery still requires real codes in
                      inventory. Keep this product's voucher inventory stocked or checkout will succeed without a
                      voucher to deliver.
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 pt-6 flex-wrap">
                  <Check label="Show Badge on Card" checked={!!draft.badgeEnabled} onChange={(v) => setDraft({ ...draft, badgeEnabled: v })} />
                  <Check label="Featured Product" checked={!!draft.featured} onChange={(v) => setDraft({ ...draft, featured: v })} />
                  <Check label="Active & Visible" checked={!!draft.active} onChange={(v) => setDraft({ ...draft, active: v })} />
                  <Check label="Coming Soon" checked={!!draft.comingSoon} onChange={(v) => setDraft({ ...draft, comingSoon: v })} />
                </div>
              </div>
            </div>

            {/* Section 3B: Official Links & Identifiers */}
            <div className="pt-4 border-t border-[#EAEAEA] dark:border-[#292929]">
              <h4 className="text-xs font-black text-brand-pink uppercase tracking-wider mb-3">3B. Official Links & Identifiers</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Official Website URL" value={draft.officialWebsiteUrl || ''} onChange={(v) => setDraft({ ...draft, officialWebsiteUrl: v })} placeholder="https://www.pearsonpte.com/" />
                <Field label="Official Product Page URL" value={draft.officialProductUrl || ''} onChange={(v) => setDraft({ ...draft, officialProductUrl: v })} placeholder="https://www.pearsonpte.com/pte-academic/" />
                <Field label="SKU" value={draft.sku || ''} onChange={(v) => setDraft({ ...draft, sku: v })} placeholder="Optional internal SKU" />
                <Field label="Product Code" value={draft.productCode || ''} onChange={(v) => setDraft({ ...draft, productCode: v })} placeholder="Optional internal code" />
              </div>
            </div>

            {/* Section 4: Descriptions & Details */}
            <div className="pt-4 border-t border-[#EAEAEA] dark:border-[#292929]">
              <h4 className="text-xs font-black text-brand-pink uppercase tracking-wider mb-3">4. Descriptions & Bullet Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextArea label="Short Description (Shown on Card)" value={draft.shortDescription || ''} onChange={(v) => setDraft({ ...draft, shortDescription: v })} rows={2} />
                <TextArea label="Full Description (Shown in Modal)" value={draft.description || ''} onChange={(v) => setDraft({ ...draft, description: v })} rows={2} />
                <TextArea label="Inclusions (One per line)" value={Array.isArray(draft.inclusions) ? draft.inclusions.join('\n') : draft.inclusions || ''} onChange={(v) => setDraft({ ...draft, inclusions: v })} rows={3} />
                <TextArea label="Redemption Steps (One per line)" value={Array.isArray(draft.redemptionSteps) ? draft.redemptionSteps.join('\n') : draft.redemptionSteps || ''} onChange={(v) => setDraft({ ...draft, redemptionSteps: v })} rows={3} />
              </div>
            </div>

            {/* Section 5: SEO */}
            <div className="pt-4 border-t border-[#EAEAEA] dark:border-[#292929]">
              <h4 className="text-xs font-black text-brand-pink uppercase tracking-wider mb-3">5. SEO Configuration</h4>
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
      {filtersActive && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs font-bold text-amber-700 dark:text-amber-400">
          <GripVertical className="w-3.5 h-3.5 shrink-0" />
          <span>Clear search/filters to reorder products — reordering a filtered subset would corrupt the global display order.</span>
        </div>
      )}
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

              {!loading && rows.map((p, rowIndex) => {
                const isQuickEditing = quickPriceId === p._id;
                const availableCount = p.availableVouchers ?? p.availability ?? 0;
                const stockBadge = availableCount > (p.lowStockThreshold || 10) ? 'emerald' : availableCount > 0 ? 'amber' : 'rose';

                return (
                  <tr
                    key={p._id}
                    draggable={!filtersActive}
                    onDragStart={() => setDragIndex(rowIndex)}
                    onDragOver={(e) => { e.preventDefault(); if (!filtersActive) setDragOverIndex(rowIndex); }}
                    onDragLeave={() => setDragOverIndex((cur) => (cur === rowIndex ? null : cur))}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (dragIndex !== null) reorderTo(dragIndex, rowIndex);
                      setDragIndex(null);
                      setDragOverIndex(null);
                    }}
                    onDragEnd={() => { setDragIndex(null); setDragOverIndex(null); }}
                    className={`border-t transition-colors ${
                      dragOverIndex === rowIndex && dragIndex !== null && dragIndex !== rowIndex
                        ? 'border-t-2 border-t-brand-pink'
                        : 'border-[#EAEAEA] dark:border-[#292929]'
                    } ${dragIndex === rowIndex ? 'opacity-40' : ''} hover:bg-neutral-50/50 dark:hover:bg-[#111111]`}
                  >
                    {/* Product & Branding */}
                    <Td>
                      <div className="flex items-center gap-3">
                        <div
                          className={`text-neutral-300 dark:text-neutral-600 shrink-0 ${filtersActive ? 'cursor-not-allowed opacity-40' : 'cursor-grab active:cursor-grabbing hover:text-brand-pink'}`}
                          title={filtersActive ? 'Clear search/filters to reorder' : 'Drag to reorder'}
                        >
                          <GripVertical className="w-4 h-4" />
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-[#FFF0F5] dark:bg-[#2A0A17] border border-brand-pink/20 flex items-center justify-center font-black text-brand-pink shrink-0">
                          {p.providerShortName || p.brand?.slice(0, 3) || 'APX'}
                        </div>
                        <div>
                          <div className="font-black text-sm text-neutral-900 dark:text-white flex items-center gap-2">
                            <span>{p.name}</span>
                            {p.badge && (
                              <span className="px-2 py-0.5 rounded-md bg-brand-pink/10 text-brand-pink border border-brand-pink/20 text-[9px] font-black">
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
                        <div className="inline-flex items-center gap-1 bg-white dark:bg-[#161616] p-1 rounded-xl border border-brand-pink">
                          <input
                            type="number"
                            value={quickPrices.sellingPrice}
                            onChange={(e) => setQuickPrices({ ...quickPrices, sellingPrice: Number(e.target.value) })}
                            className="w-20 px-2 py-1 rounded bg-neutral-100 dark:bg-[#0E0E0E] text-xs font-black outline-none"
                          />
                          <button onClick={() => handleQuickPriceSave(p._id)} className="p-1 rounded bg-brand-pink text-white text-[10px] font-black">Save</button>
                          <button onClick={() => setQuickPriceId(null)} className="p-1 rounded bg-neutral-200 dark:bg-[#262626] text-neutral-700 dark:text-neutral-300 text-[10px]">✕</button>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5">
                          <span className="font-black text-sm text-brand-pink">{formatPrice(p.sellingPrice)}</span>
                          <button
                            onClick={() => {
                              setQuickPriceId(p._id);
                              setQuickPrices({ sellingPrice: p.sellingPrice, originalPrice: p.originalPrice });
                            }}
                            className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-[#262626] text-neutral-400 hover:text-brand-pink"
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
                      {p.archived ? (
                        <Pill text="ARCHIVED" tint="neutral" />
                      ) : (
                        <button onClick={() => toggleStatus(p)} className="cursor-pointer">
                          <Pill text={p.active ? 'ACTIVE' : 'INACTIVE'} tint={p.active ? 'emerald' : 'neutral'} />
                        </button>
                      )}
                    </Td>

                    {/* Featured Toggle */}
                    <Td className="text-center whitespace-nowrap">
                      <button
                        onClick={() => toggleFeatured(p)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black border cursor-pointer ${
                          p.featured
                            ? 'bg-brand-pink/10 text-brand-pink border-brand-pink/30'
                            : 'bg-neutral-100 text-neutral-400 border-neutral-200 dark:bg-[#262626]'
                        }`}
                      >
                        {p.featured ? '★ Featured' : '☆ Standard'}
                      </button>
                    </Td>

                    {/* Actions */}
                    <Td className="text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <div className="flex flex-col mr-1">
                          <button onClick={() => moveProduct(rowIndex, -1)} disabled={rowIndex === 0 || filtersActive} className="text-neutral-400 hover:text-brand-pink disabled:opacity-30 disabled:cursor-not-allowed" title={filtersActive ? 'Clear search/filters to reorder' : 'Move up'}>
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => moveProduct(rowIndex, 1)} disabled={rowIndex === rows.length - 1 || filtersActive} className="text-neutral-400 hover:text-brand-pink disabled:opacity-30 disabled:cursor-not-allowed" title={filtersActive ? 'Clear search/filters to reorder' : 'Move down'}>
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

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
                          onClick={() => duplicateProduct(p)}
                          className="p-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border border-purple-200"
                          title="Duplicate product"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        {p.archived ? (
                          <button
                            onClick={() => restoreProduct(p)}
                            className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200"
                            title="Restore product"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => archiveProduct(p)}
                            className="p-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200"
                            title="Archive product"
                          >
                            <AlertOctagon className="w-3.5 h-3.5" />
                          </button>
                        )}

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

      {!loading && total > 0 && (
        <div className="flex items-center justify-between gap-3 px-1">
          <span className="text-xs font-bold text-neutral-500 dark:text-[#B5B5B5]">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => refresh(page - 1)}
              disabled={page <= 1}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] text-xs font-black disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-xs font-bold text-neutral-500">Page {page} of {pages}</span>
            <button
              onClick={() => refresh(page + 1)}
              disabled={page >= pages}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] text-xs font-black disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function VouchersAdmin() {
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [productId, setProductId] = useState('');
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState([]);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulk, setBulk] = useState({ productId: '', codes: '', expiryDate: '' });
  const [revealedCodes, setRevealedCodes] = useState({});
  const [copiedId, setCopiedId] = useState(null);
  const [revealingId, setRevealingId] = useState(null);

  const refresh = async () => {
    setLoading(true);
    const params = {};
    if (status) params.status = status;
    if (productId) params.productId = productId;
    if (search) params.search = search;

    try {
      const [vRes, pRes, sRes] = await Promise.all([
        adminApi.vouchers(params),
        adminApi.products(),
        adminApi.voucherSummaryByProduct(),
      ]);
      setRows(vRes?.data || []);
      setProducts(pRes?.data || []);
      setSummary(sRes?.data || []);
    } catch (err) {
      console.error('Failed to load vouchers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [status, productId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    refresh();
  };

  const handleReveal = async (voucherId) => {
    if (revealedCodes[voucherId]) {
      // Toggle off
      setRevealedCodes((prev) => {
        const next = { ...prev };
        delete next[voucherId];
        return next;
      });
      return;
    }

    setRevealingId(voucherId);
    try {
      const res = await adminApi.revealVoucherCode(voucherId);
      if (res?.success && res.data?.code) {
        setRevealedCodes((prev) => ({
          ...prev,
          [voucherId]: res.data.code,
        }));
      } else {
        alert(res?.message || 'Failed to reveal voucher code');
      }
    } catch (err) {
      alert('Error revealing code: ' + err.message);
    } finally {
      setRevealingId(null);
    }
  };

  const handleCopy = (id, code) => {
    navigator.clipboard?.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const selectedProductObj = products.find((p) => p._id === bulk.productId);

  const submitBulk = async () => {
    const codes = bulk.codes.split(/[\n,]/).map((s) => s.trim()).filter(Boolean);
    if (!bulk.productId || codes.length === 0 || !bulk.expiryDate) {
      alert('Please choose a product, paste at least one code, and set expiry date.');
      return;
    }
    const res = await adminApi.addVouchersBulk({
      productId: bulk.productId,
      codes,
      expiryDate: new Date(bulk.expiryDate),
    });
    if (res?.success) {
      setBulkOpen(false);
      setBulk({ productId: '', codes: '', expiryDate: '' });
      refresh();
    } else {
      alert(res?.message || 'Failed to add vouchers');
    }
  };

  const STATUS_FILTERS = [
    { label: 'All Inventory', value: '' },
    { label: 'Available', value: 'AVAILABLE', tint: 'emerald' },
    { label: 'Reserved', value: 'RESERVED', tint: 'amber' },
    { label: 'Sold', value: 'SOLD', tint: 'purple' },
    { label: 'Assigned', value: 'ASSIGNED', tint: 'sky' },
    { label: 'Used', value: 'USED', tint: 'neutral' },
    { label: 'Expired', value: 'EXPIRED', tint: 'rose' },
    { label: 'Invalid / Cancelled', value: 'CANCELLED', tint: 'rose' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl tracking-tight">Voucher Inventory Management</h1>
          <p className="text-xs font-bold text-neutral-500 dark:text-[#B5B5B5]">
            Strict product-to-voucher inventory mapping, atomic allocations, and masked code security.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            className="p-2.5 rounded-xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] hover:border-brand-pink transition shadow-sm"
            title="Refresh Inventory"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setBulkOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl btn-pink text-white font-black text-xs shadow-lg"
          >
            <Upload className="w-4 h-4" /> Add Voucher Codes
          </button>
        </div>
      </div>

      {/* Product-Separated Inventory Summary Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-black text-xs uppercase tracking-wider text-neutral-400">Inventory Breakdown by Product</h3>
          {productId && (
            <button
              onClick={() => setProductId('')}
              className="text-xs font-black text-brand-pink hover:underline"
            >
              Clear Product Filter (Show All)
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {summary.map((item) => {
            const p = item.product;
            const c = item.counts || {};
            const isSelected = productId === p._id;
            return (
              <div
                key={p._id}
                onClick={() => setProductId(isSelected ? '' : p._id)}
                className={`p-4 rounded-3xl border cursor-pointer transition-all duration-200 shadow-sm ${
                  isSelected
                    ? 'bg-[#FFF0F5] dark:bg-[#2A0A17] border-brand-pink ring-2 ring-brand-pink/20 shadow-md'
                    : 'bg-white dark:bg-[#161616] border-[#EAEAEA] dark:border-[#292929] hover:border-brand-pink/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-[#6C3CE0]/10 text-[#6C3CE0] dark:text-[#A78BFA] font-mono text-[9px] font-black uppercase mb-1">
                      {p.voucherType || 'EXAM'}
                    </span>
                    <h4 className="font-black text-sm truncate text-neutral-900 dark:text-white" title={p.name}>
                      {p.name}
                    </h4>
                  </div>
                  {item.isOutOfStock ? (
                    <span className="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 font-black text-[9px] whitespace-nowrap">
                      OUT OF STOCK
                    </span>
                  ) : item.isLowStock ? (
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-black text-[9px] whitespace-nowrap">
                      LOW STOCK
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-black text-[9px] whitespace-nowrap">
                      IN STOCK
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 mt-2 border-t border-[#EAEAEA] dark:border-[#292929] text-center font-mono">
                  <div>
                    <div className="text-[10px] text-neutral-400 font-bold">Avail</div>
                    <div className="font-black text-sm text-emerald-600 dark:text-emerald-400">{c.available || 0}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-neutral-400 font-bold">Sold</div>
                    <div className="font-black text-sm text-purple-600 dark:text-purple-400">{(c.sold || 0) + (c.assigned || 0)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-neutral-400 font-bold">Total</div>
                    <div className="font-black text-sm text-neutral-700 dark:text-neutral-300">{c.total || 0}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Voucher Codes Modal */}
      {bulkOpen && (
        <FormCard title="Add Voucher Codes to Inventory" onClose={() => setBulkOpen(false)} onSave={submitBulk}>
          <div className="space-y-4">
            <div>
              <Label>Select Product *</Label>
              <select
                value={bulk.productId}
                onChange={(e) => setBulk({ ...bulk, productId: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-sm font-bold focus:outline-none focus:border-brand-pink"
              >
                <option value="">— Select Target Product —</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.voucherType || p.brand})
                  </option>
                ))}
              </select>
              {selectedProductObj && (
                <div className="mt-2 p-3 rounded-xl bg-[#FFF0F5] dark:bg-[#2A0A17] border border-brand-pink/20 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-brand-pink">Bound Voucher Type:</span>{' '}
                    <strong className="font-black">{selectedProductObj.voucherType || selectedProductObj.brand}</strong>
                  </div>
                  <span className="text-[10px] font-bold text-neutral-400">
                    Codes will ONLY be delivered for this exact product
                  </span>
                </div>
              )}
            </div>

            <Field
              label="Expiry Date *"
              type="date"
              value={bulk.expiryDate}
              onChange={(v) => setBulk({ ...bulk, expiryDate: v })}
            />

            <div>
              <Label>Voucher Codes (one per line or comma-separated) *</Label>
              <textarea
                value={bulk.codes}
                onChange={(e) => setBulk({ ...bulk, codes: e.target.value })}
                rows={7}
                placeholder={'APX-DUOL-1234-ABC\nAPX-DUOL-5678-DEF\nAPX-DUOL-9012-GHI'}
                className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-sm font-bold focus:outline-none focus:border-brand-pink font-mono uppercase"
              />
            </div>
          </div>
        </FormCard>
      )}

      {/* Filter Toolbar & Status Sub-Tabs */}
      <div className="rounded-3xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] p-4 shadow-sm space-y-4">
        {/* Status Sub-Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {STATUS_FILTERS.map((sf) => (
            <button
              key={sf.value}
              onClick={() => setStatus(sf.value)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition ${
                status === sf.value
                  ? 'bg-brand-pink text-white shadow-md'
                  : 'bg-neutral-100 dark:bg-[#202020] text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'
              }`}
            >
              {sf.label}
            </button>
          ))}
        </div>

        {/* Search & Product Dropdown */}
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-60">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by code, customer email, or order #..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-xs font-bold focus:outline-none focus:border-brand-pink"
            />
          </div>

          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-xs font-bold"
          >
            <option value="">All products</option>
            {products.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-black font-black text-xs"
          >
            Filter
          </button>
        </form>
      </div>

      {/* Vouchers Table */}
      <div className="rounded-3xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-bold">
            <thead className="bg-neutral-50 dark:bg-[#0E0E0E] text-neutral-500">
              <tr>
                <Th>Voucher Code</Th>
                <Th>Assigned Product</Th>
                <Th>Voucher Type</Th>
                <Th>Status</Th>
                <Th>Sold / Assigned To</Th>
                <Th>Order ID</Th>
                <Th>Expiry Date</Th>
                <Th>Sale Timestamp</Th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="8" className="p-6">
                    <div className="h-10 bg-neutral-100 dark:bg-[#292929] rounded-xl animate-pulse" />
                  </td>
                </tr>
              )}
              {!loading &&
                rows.map((v) => {
                  const isRevealed = !!revealedCodes[v._id];
                  const displayCode = isRevealed ? revealedCodes[v._id] : v.codeDisplay || v.code;
                  const isCopied = copiedId === v._id;

                  return (
                    <tr
                      key={v._id}
                      className="border-t border-[#EAEAEA] dark:border-[#292929] hover:bg-neutral-50/50 dark:hover:bg-[#111111] transition"
                    >
                      {/* Code with Security Mask & Reveal */}
                      <Td className="whitespace-nowrap font-mono font-black">
                        <div className="flex items-center gap-2">
                          <span
                            className={`${
                              isRevealed ? 'text-brand-pink bg-[#FFF0F5] dark:bg-[#2A0A17] px-2 py-0.5 rounded-md' : 'text-[#6C3CE0]'
                            }`}
                          >
                            {displayCode}
                          </span>
                          <button
                            onClick={() => handleReveal(v._id)}
                            disabled={revealingId === v._id}
                            className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-[#262626] text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition"
                            title={isRevealed ? 'Mask Code' : 'Reveal Full Code (Audit Logged)'}
                          >
                            {revealingId === v._id ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : isRevealed ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleCopy(v._id, isRevealed ? revealedCodes[v._id] : v.code)}
                            className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-[#262626] text-neutral-400 hover:text-brand-pink transition"
                            title="Copy Code"
                          >
                            {isCopied ? <CheckIcon className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </Td>

                      {/* Product Name */}
                      <Td className="font-bold">{v.productId?.name || '—'}</Td>

                      {/* Voucher Type */}
                      <Td>
                        <span className="inline-flex px-2 py-0.5 rounded-md bg-[#6C3CE0]/10 text-[#6C3CE0] dark:text-[#A78BFA] font-mono text-[10px] font-black">
                          {v.voucherType || v.productId?.voucherType || 'EXAM'}
                        </span>
                      </Td>

                      {/* Status */}
                      <Td>
                        {v.status === 'AVAILABLE' ? (
                          <Pill text="AVAILABLE" tint="emerald" />
                        ) : v.status === 'RESERVED' ? (
                          <Pill text="RESERVED" tint="amber" />
                        ) : v.status === 'SOLD' ? (
                          <Pill text="SOLD" tint="purple" />
                        ) : v.status === 'ASSIGNED' ? (
                          <Pill text="ASSIGNED" tint="sky" />
                        ) : v.status === 'USED' ? (
                          <Pill text="USED" tint="neutral" />
                        ) : (
                          <Pill text={v.status} tint="rose" />
                        )}
                      </Td>

                      {/* Customer */}
                      <Td className="whitespace-nowrap">
                        {v.soldTo ? (
                          <span className="text-neutral-700 dark:text-neutral-300">{v.soldTo}</span>
                        ) : v.userId ? (
                          <span>
                            {v.userId.name} {v.userId.email && `<${v.userId.email}>`}
                          </span>
                        ) : (
                          <span className="text-neutral-400 italic">—</span>
                        )}
                      </Td>

                      {/* Order No */}
                      <Td className="whitespace-nowrap font-mono text-[11px]">
                        {v.orderId?.orderNo ? (
                          <span className="text-brand-pink">#{v.orderId.orderNo}</span>
                        ) : (
                          <span className="text-neutral-400">—</span>
                        )}
                      </Td>

                      {/* Expiry */}
                      <Td className="whitespace-nowrap">{new Date(v.expiryDate).toLocaleDateString()}</Td>

                      {/* Sold At */}
                      <Td className="whitespace-nowrap text-neutral-400">
                        {v.soldAt
                          ? new Date(v.soldAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
                          : v.assignedAt
                          ? new Date(v.assignedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
                          : '—'}
                      </Td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
        {!loading && rows.length === 0 && (
          <Empty title="No matching vouchers" desc="Try adjusting your filter or add voucher inventory codes." />
        )}
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
                      <button onClick={() => handleResendEmail(o._id, o.orderNo)} className="mr-1 px-2.5 py-1 rounded-lg bg-pink-50 dark:bg-pink-950/40 text-brand-pink border border-brand-pink/30 text-[10px] font-black">Resend Email</button>
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

const PTE_BOOKING_STATUSES = [
  'New',
  'Contacted',
  'Processing',
  'Booking In Progress',
  'Waiting for Customer',
  'Booking Confirmed',
  'Completed',
  'Cancelled',
  'Rejected',
];
const PTE_EXAM_TYPES = ['PTE Academic', 'PTE Core', 'PTE Academic UKVI'];

function PTEStatusPill({ status }) {
  const tintMap = {
    New: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-900/40',
    Contacted: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/40',
    Processing: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900/40',
    'Booking In Progress': 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900/40',
    'Waiting for Customer': 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-900/40',
    'Booking Confirmed': 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/40',
    Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/40',
    Cancelled: 'bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700',
    Rejected: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/40',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-black whitespace-nowrap ${tintMap[status] || 'bg-neutral-100 text-neutral-600 border-neutral-200'}`}>
      {status}
    </span>
  );
}

function fmtPTEDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function PTEBookingsAdmin() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [examType, setExamType] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [statusDraft, setStatusDraft] = useState('');
  const [notesDraft, setNotesDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Confirmation Details Draft
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  const [confirmedCentre, setConfirmedCentre] = useState('');
  const [confirmedDate, setConfirmedDate] = useState('');
  const [confirmedTime, setConfirmedTime] = useState('');
  const [instructions, setInstructions] = useState('');

  const refresh = async () => {
    setLoading(true);
    const params = {};
    if (status) params.status = status;
    if (examType) params.examType = examType;
    if (search) params.search = search;
    const res = await adminApi.pteBookings(params);
    setRows(res.data || []);
    setLoading(false);
  };

  useEffect(() => {
    const t = setTimeout(refresh, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, examType, search]);

  const openDetail = (row) => {
    setSelected(row);
    setStatusDraft(row.status);
    setNotesDraft(row.adminNotes || '');
    setBookingRef(row.confirmationDetails?.bookingReference || '');
    setConfirmedCentre(row.confirmationDetails?.confirmedCentre || '');
    setConfirmedDate(row.confirmationDetails?.confirmedDate ? new Date(row.confirmationDetails.confirmedDate).toISOString().slice(0, 10) : '');
    setConfirmedTime(row.confirmationDetails?.confirmedTime || '');
    setInstructions(row.confirmationDetails?.importantInstructions || '');
    setShowConfirmModal(false);
  };

  const closeDetail = () => {
    setSelected(null);
    setShowConfirmModal(false);
  };

  const saveDetail = async () => {
    if (!selected) return;
    setSaving(true);
    const payload = {
      status: statusDraft,
      adminNotes: notesDraft,
    };
    if (statusDraft === 'Booking Confirmed') {
      payload.confirmationDetails = {
        bookingReference: bookingRef,
        confirmedCentre,
        confirmedDate: confirmedDate || null,
        confirmedTime,
        importantInstructions: instructions,
      };
    }
    const res = await adminApi.updatePTEBooking(selected._id, payload);
    setSaving(false);
    if (res.success) {
      closeDetail();
      refresh();
    } else {
      alert(res.message || 'Failed to update request');
    }
  };

  const quickStatus = async (row, newStatus) => {
    const res = await adminApi.updatePTEBooking(row._id, { status: newStatus });
    if (res.success) refresh();
    else alert(res.message);
  };

  const handleExport = async () => {
    setExporting(true);
    const params = {};
    if (status) params.status = status;
    if (examType) params.examType = examType;
    if (search) params.search = search;
    await adminApi.downloadExport('pte-bookings', false, params);
    setExporting(false);
  };

  // Stats calculation
  const totalCount = rows.length;
  const newCount = rows.filter((r) => r.status === 'New').length;
  const inProgressCount = rows.filter((r) => ['Processing', 'Booking In Progress'].includes(r.status)).length;
  const waitingCustomerCount = rows.filter((r) => r.status === 'Waiting for Customer').length;
  const confirmedCount = rows.filter((r) => ['Booking Confirmed', 'Completed'].includes(r.status)).length;

  return (
    <div className="space-y-6">
      {/* Header & Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-black text-2xl sm:text-3xl tracking-tight">PTE Booking Requests</h1>
            <PearsonOfficialLogo className="h-4" />
          </div>
          <p className="text-xs font-bold text-neutral-500 dark:text-[#B5B5B5] mt-1">
            Review customer PTE booking assistance requests, contact them, update timelines, and dispatch official confirmation details.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] hover:border-brand-pink text-xs font-black flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-brand-pink" />
            <span>{exporting ? 'Exporting...' : 'Export CSV'}</span>
          </button>
          <button
            type="button"
            onClick={refresh}
            className="p-2.5 rounded-xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] hover:border-brand-pink text-xs font-black transition-colors shadow-sm"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 text-neutral-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total Requests', count: totalCount, tint: '#6C3CE0' },
          { label: 'New Unassigned', count: newCount, tint: '#0284C7' },
          { label: 'In Progress', count: inProgressCount, tint: '#8B5CF6' },
          { label: 'Waiting for Customer', count: waitingCustomerCount, tint: '#EA580C' },
          { label: 'Confirmed / Done', count: confirmedCount, tint: '#10B981' },
        ].map((kpi, idx) => (
          <div key={idx} className="p-4 rounded-2xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">{kpi.label}</div>
            <div className="font-heading font-black text-2xl mt-1" style={{ color: kpi.tint }}>
              {kpi.count}
            </div>
          </div>
        ))}
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-55 px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929]">
          <Search className="w-4 h-4 text-neutral-400 shrink-0" />
          <input
            placeholder="Search request ID, name, email, phone, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-xs font-bold w-full"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={examType}
            onChange={(e) => setExamType(e.target.value)}
            className="px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-xs font-bold"
          >
            <option value="">All Exam Types</option>
            {PTE_EXAM_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-xs font-bold"
          >
            <option value="">All Statuses</option>
            {PTE_BOOKING_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Detail Modal */}
      {selected && (
        <FormCard title={`Request ${selected.requestId}`} onClose={closeDetail} onSave={saveDetail}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Col (5 cols): Customer & Booking info */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Customer Contact Card */}
              <div>
                <Label>Customer Contact</Label>
                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] space-y-2.5 text-xs font-bold">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-900 dark:text-white font-black text-sm">{selected.fullName}</span>
                    <span className="text-[10px] font-mono font-bold text-neutral-400">{selected.requestId}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-neutral-200/60 dark:border-[#252525]">
                    <a href={`mailto:${selected.email}`} className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300 hover:text-brand-pink">
                      <Mail className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{selected.email}</span>
                    </a>
                  </div>
                  <div className="flex items-center justify-between">
                    <a href={`tel:${selected.phone}`} className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300 hover:text-brand-pink">
                      <Phone className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{selected.phone}</span>
                    </a>
                    <a
                      href={`https://wa.me/${selected.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                        `Hello ${selected.fullName}, this is Apex Vouchers regarding your PTE Booking Assistance request (${selected.requestId}).`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black flex items-center gap-1"
                    >
                      WhatsApp
                    </a>
                  </div>
                </div>
              </div>

              {/* Exam & Preferences */}
              <div>
                <Label>Exam & Slot Preferences</Label>
                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] space-y-2 text-xs font-bold">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Exam:</span>
                    <span className="font-black text-brand-pink">{selected.examType}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">City:</span>
                    <span className="text-neutral-900 dark:text-white">{selected.preferredCity}</span>
                  </div>
                  {selected.preferredTestCentre && (
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Centre:</span>
                      <span className="text-neutral-900 dark:text-white">{selected.preferredTestCentre}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Date:</span>
                    <span className="text-neutral-900 dark:text-white">{fmtPTEDate(selected.preferredDate)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Preferred Time:</span>
                    <span className="text-neutral-900 dark:text-white">{selected.preferredTime || 'Any Time'}</span>
                  </div>
                  {selected.alternativeDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Alt Date:</span>
                      <span className="text-neutral-900 dark:text-white">{fmtPTEDate(selected.alternativeDate)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Notes */}
              {selected.message && (
                <div>
                  <Label>Customer Notes</Label>
                  <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-xs font-medium text-neutral-600 dark:text-neutral-300 whitespace-pre-wrap">
                    {selected.message}
                  </div>
                </div>
              )}

              {/* Activity History Timeline */}
              <div>
                <Label>Request Activity History</Label>
                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] space-y-3 max-h-48 overflow-y-auto">
                  {selected.activityHistory?.length ? (
                    selected.activityHistory.map((act, i) => (
                      <div key={i} className="text-[11px] font-bold border-l-2 border-brand-pink pl-2.5 py-0.5 space-y-0.5">
                        <div className="flex items-center justify-between text-neutral-400">
                          <span>{new Date(act.timestamp).toLocaleString()}</span>
                          <span className="text-[10px] text-neutral-500">{act.adminEmail?.split('@')[0]}</span>
                        </div>
                        <div className="text-neutral-900 dark:text-white font-black">{act.action}</div>
                        {act.notes && <div className="text-neutral-500 font-medium">{act.notes}</div>}
                      </div>
                    ))
                  ) : (
                    <div className="text-[11px] font-bold text-neutral-400">
                      ● Request Submitted on {new Date(selected.createdAt).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Right Col (7 cols): Status management & confirmation fields */}
            <div className="lg:col-span-7 space-y-4">
              
              <div>
                <Label>Request Status</Label>
                <select
                  value={statusDraft}
                  onChange={(e) => setStatusDraft(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-sm font-bold focus:outline-none focus:border-brand-pink"
                >
                  {PTE_BOOKING_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Fast Status Chips */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Contacted',
                  'Processing',
                  'Booking In Progress',
                  'Waiting for Customer',
                  'Booking Confirmed',
                  'Completed',
                  'Cancelled',
                  'Rejected',
                ].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusDraft(st)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black border transition-colors ${
                      statusDraft === st
                        ? 'bg-brand-pink text-white border-brand-pink'
                        : 'bg-neutral-50 dark:bg-[#0E0E0E] text-neutral-600 dark:text-neutral-300 border-[#EAEAEA] dark:border-[#292929]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* If status is Booking Confirmed, show Confirmation Details Inputs */}
              {statusDraft === 'Booking Confirmed' && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-black text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Official Confirmation Details for Candidate</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                    These details will be included in the official status update email dispatched to the customer.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-neutral-500 mb-1">
                        Pearson Booking Reference / Candidate ID
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. PTE-89218274"
                        value={bookingRef}
                        onChange={(e) => setBookingRef(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#121212] border border-emerald-300 dark:border-emerald-800 text-xs font-bold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-neutral-500 mb-1">
                        Confirmed Test Centre Name & Address
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Pearson Professional Centres-Bangalore"
                        value={confirmedCentre}
                        onChange={(e) => setConfirmedCentre(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#121212] border border-emerald-300 dark:border-emerald-800 text-xs font-bold outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-neutral-500 mb-1">
                        Confirmed Exam Date
                      </label>
                      <input
                        type="date"
                        value={confirmedDate}
                        onChange={(e) => setConfirmedDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#121212] border border-emerald-300 dark:border-emerald-800 text-xs font-bold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-neutral-500 mb-1">
                        Confirmed Time Slot
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 09:30 AM IST"
                        value={confirmedTime}
                        onChange={(e) => setConfirmedTime(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#121212] border border-emerald-300 dark:border-emerald-800 text-xs font-bold outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase text-neutral-500 mb-1">
                      Important Candidate Instructions
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Please carry original valid passport and arrive 30 minutes before exam time."
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#121212] border border-emerald-300 dark:border-emerald-800 text-xs font-medium outline-none"
                    />
                  </div>
                </div>
              )}

              <TextArea
                label="Admin Internal Notes (tracked in request history)"
                value={notesDraft}
                onChange={setNotesDraft}
                rows={4}
              />

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-[11px] font-bold text-amber-700 dark:text-amber-400 flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>Only mark "Booking Confirmed" once the appointment is finalized through official Pearson channels.</span>
              </div>

              <div className="text-[11px] font-bold text-neutral-400">
                Originally Submitted: {new Date(selected.createdAt).toLocaleString()}
              </div>

            </div>
          </div>
        </FormCard>
      )}

      {/* Requests Table */}
      <div className="rounded-3xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-bold">
            <thead className="bg-neutral-50 dark:bg-[#0E0E0E] text-neutral-500">
              <tr>
                <Th>Request ID & Name</Th>
                <Th>Contact</Th>
                <Th>Exam Type</Th>
                <Th>City / Centre</Th>
                <Th>Preferred Slot</Th>
                <Th>Status</Th>
                <Th>Submitted</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="8" className="p-4">
                    <div className="h-8 bg-neutral-100 dark:bg-[#292929] rounded animate-pulse" />
                  </td>
                </tr>
              )}
              {!loading &&
                rows.map((b) => (
                  <tr key={b._id} className="border-t border-[#EAEAEA] dark:border-[#292929] hover:bg-neutral-50/50 dark:hover:bg-[#1A1A1A]">
                    <Td className="whitespace-nowrap font-black">
                      <div className="font-mono text-[11px] text-brand-pink">{b.requestId}</div>
                      <div className="text-neutral-900 dark:text-white">{b.fullName}</div>
                    </Td>
                    <Td className="whitespace-nowrap">
                      <div>{b.email}</div>
                      <div className="text-[10px] text-neutral-400">{b.phone}</div>
                    </Td>
                    <Td className="whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-[#222] text-neutral-800 dark:text-neutral-200 text-[10px] font-black">
                        {b.examType}
                      </span>
                    </Td>
                    <Td className="whitespace-nowrap">
                      <div>{b.preferredCity}</div>
                      {b.preferredTestCentre && <div className="text-[10px] text-neutral-400">{b.preferredTestCentre}</div>}
                    </Td>
                    <Td className="whitespace-nowrap">
                      <div>{fmtPTEDate(b.preferredDate)}</div>
                      <div className="text-[10px] text-neutral-400">{b.preferredTime || 'Any Time'}</div>
                    </Td>
                    <Td>
                      <PTEStatusPill status={b.status} />
                    </Td>
                    <Td className="whitespace-nowrap text-neutral-400">
                      {new Date(b.createdAt).toLocaleDateString()}
                    </Td>
                    <Td className="whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => openDetail(b)}
                          className="px-2.5 py-1 rounded-lg bg-pink-50 dark:bg-pink-950/40 text-brand-pink border border-brand-pink/30 text-[10px] font-black hover:bg-brand-pink hover:text-white transition-colors"
                        >
                          View Details
                        </button>
                        {b.status === 'New' && (
                          <button
                            onClick={() => quickStatus(b, 'Contacted')}
                            className="px-2 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border border-sky-200 text-[10px] font-black"
                          >
                            Mark Contacted
                          </button>
                        )}
                      </div>
                    </Td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {!loading && rows.length === 0 && (
          <Empty
            title="No PTE booking requests found"
            desc="Try changing your search terms or filter criteria."
          />
        )}
      </div>
    </div>
  );
}

function UserIconInline() {
  return <Users className="w-3.5 h-3.5 text-neutral-400" />;
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
                  <Td><span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${u.role === 'admin' ? 'bg-brand-pink/10 text-brand-pink border-brand-pink/20' : 'bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300'}`}>{u.role}</span></Td>
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
              <select value={draft.discountType} onChange={(e) => setDraft({ ...draft, discountType: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-sm font-bold focus:outline-none focus:border-brand-pink">
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
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FFF0F5] dark:bg-[#2A0A17] text-brand-pink border border-brand-pink/20 font-black">
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
        <button onClick={refresh} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] font-black text-xs shadow-sm hover:border-brand-pink">
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
        className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-sm font-bold focus:outline-none focus:border-brand-pink transition"
      />
    </label>
  );
}
function TextArea({ label, value, onChange, rows = 3 }) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <textarea rows={rows} value={value ?? ''} onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-sm font-bold focus:outline-none focus:border-brand-pink transition whitespace-pre-wrap"
      />
    </label>
  );
}
function Check({ label, checked, onChange }) {
  return (
    <label className="inline-flex items-center gap-2.5 px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 accent-brand-pink" />
      <span className="text-xs font-black text-neutral-700 dark:text-neutral-200">{label}</span>
    </label>
  );
}

const LOGO_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const LOGO_MAX_SIZE = 5 * 1024 * 1024;

function ProductLogoUploader({ value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(value || '');
  const fileInputRef = useRef(null);

  useEffect(() => { setPreview(value || ''); }, [value]);

  const handleFile = (file) => {
    if (!file || uploading) return;
    setError('');
    if (!LOGO_ALLOWED_TYPES.includes(file.type)) {
      setError('Unsupported format. Use JPG, PNG, or WebP.');
      return;
    }
    if (file.size > LOGO_MAX_SIZE) {
      setError('File too large. Maximum size is 5MB.');
      return;
    }

    setPreview(URL.createObjectURL(file));
    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('logo', file);
    const token = getToken();
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${apiBase()}/api/admin/products/logo-upload`);
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      setUploading(false);
      try {
        const data = JSON.parse(xhr.responseText || '{}');
        if (xhr.status >= 200 && xhr.status < 300 && data.success) {
          onChange(data.url);
          setPreview(data.url);
        } else {
          setError(data.message || 'Upload failed');
        }
      } catch {
        setError('Upload failed');
      }
    };
    xhr.onerror = () => {
      setUploading(false);
      setError('Network error during upload');
    };
    xhr.send(formData);
  };

  const removeLogo = () => {
    onChange('');
    setPreview('');
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div>
      <Label>Product Logo</Label>
      <div className="flex items-center gap-3">
        <div className="w-16 h-16 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] flex items-center justify-center overflow-hidden shrink-0">
          {preview ? (
            <img src={preview} alt="Logo preview" className="w-full h-full object-contain" />
          ) : (
            <ImageIcon className="w-6 h-6 text-neutral-300" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          {uploading ? (
            <div>
              <div className="text-xs font-bold text-neutral-500 mb-1">Uploading... {progress}%</div>
              <div className="h-2 rounded-full bg-neutral-200 dark:bg-[#292929] overflow-hidden">
                <div className="h-full bg-brand-pink transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border border-sky-200 text-[11px] font-black"
              >
                {preview ? 'Replace Logo' : 'Upload Logo'}
              </button>
              {preview && (
                <button
                  type="button"
                  onClick={removeLogo}
                  className="px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 text-[11px] font-black"
                >
                  Remove
                </button>
              )}
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          {error && <p className="text-[11px] font-bold text-rose-500 mt-1.5">{error}</p>}
          {!error && preview && !uploading && <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1.5">✓ Logo ready</p>}
        </div>
      </div>
    </div>
  );
}

// Primary product photo. Uploads straight to Cloudinary via the backend
// (apex_products/images) and stores both the delivery URL and the public_id so
// the old asset can be cleaned up on replace. A manual URL field remains for
// pasting an external image.
function ProductImageUploader({ value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(value || '');
  const fileInputRef = useRef(null);

  useEffect(() => { setPreview(value || ''); }, [value]);

  const handleFile = (file) => {
    if (!file || uploading) return;
    setError('');
    if (!LOGO_ALLOWED_TYPES.includes(file.type)) {
      setError('Unsupported format. Use JPG, PNG, or WebP.');
      return;
    }
    if (file.size > LOGO_MAX_SIZE) {
      setError('File too large. Maximum size is 5MB.');
      return;
    }

    setPreview(URL.createObjectURL(file));
    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('image', file);
    const token = getToken();
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${apiBase()}/api/admin/products/image-upload`);
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      setUploading(false);
      try {
        const data = JSON.parse(xhr.responseText || '{}');
        if (xhr.status >= 200 && xhr.status < 300 && data.success) {
          onChange(data.url, data.publicId || '');
          setPreview(data.url);
        } else {
          setError(data.message || 'Upload failed');
        }
      } catch {
        setError('Upload failed');
      }
    };
    xhr.onerror = () => {
      setUploading(false);
      setError('Network error during upload');
    };
    xhr.send(formData);
  };

  const removeImage = () => {
    onChange('', '');
    setPreview('');
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div>
      <Label>Product Image</Label>
      <div className="flex items-center gap-3">
        <div className="w-16 h-16 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] flex items-center justify-center overflow-hidden shrink-0">
          {preview ? (
            <img src={preview} alt="Product image preview" className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="w-6 h-6 text-neutral-300" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          {uploading ? (
            <div>
              <div className="text-xs font-bold text-neutral-500 mb-1">Uploading... {progress}%</div>
              <div className="h-2 rounded-full bg-neutral-200 dark:bg-[#292929] overflow-hidden">
                <div className="h-full bg-brand-pink transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border border-sky-200 text-[11px] font-black"
              >
                {preview ? 'Replace Image' : 'Upload Image'}
              </button>
              {preview && (
                <button
                  type="button"
                  onClick={removeImage}
                  className="px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 text-[11px] font-black"
                >
                  Remove
                </button>
              )}
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          {error && <p className="text-[11px] font-bold text-rose-500 mt-1.5">{error}</p>}
          {!error && preview && !uploading && <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1.5">✓ Image ready</p>}
        </div>
      </div>
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value, '')}
        placeholder="…or paste an image URL"
        className="mt-2 w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-xs font-bold focus:outline-none focus:border-brand-pink"
      />
    </div>
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
  const safeImage = imageUrl(image, { width: 800 }) || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=420&fit=crop&auto=format';
  const isTwitter = variant === 'twitter';
  return (
    <div className={`rounded-2xl border border-[#EAEAEA] dark:border-[#292929] overflow-hidden bg-white dark:bg-[#0E0E0E] ${isTwitter ? 'max-w-sm' : ''}`}>
      <div className="aspect-1200/630 bg-neutral-100 dark:bg-[#161616] relative overflow-hidden">
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
          className="px-2 py-1 rounded-lg text-[10px] font-black bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] text-neutral-700 dark:text-neutral-200 hover:border-brand-pink hover:text-brand-pink transition">
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
      const faqBlocks = form.faqs ? form.faqs.split('\n---\n').map(block => {
        const [q, ...rest] = block.split('\n');
        return { question: (q || '').trim(), answer: rest.join('\n').trim() };
      }).filter(f => f.question) : [];
      const relatedIds = form.relatedProducts ? form.relatedProducts.split(',').filter(Boolean) : [];
      const res = await adminApi.seo.analyzeInline({
        productName: product?.name || '',
        seoTitle: form.seo.title,
        metaDescription: form.seo.description,
        slug: form.seo.slug || form.slug,
        focusKeyword: form.seo.focusKeyword,
        secondaryKeywords: sks,
        canonicalUrl: form.seo.canonicalUrl,
        description: form.description,
        richDescription: form.richDescription,
        imageAltText: form.imageSeo?.altText,
        productImage: product?.image || product?.logo || '',
        faqs: faqBlocks,
        relatedProducts: relatedIds,
        noindex: form.seo.noindex,
        ogImage: form.seo.ogImage,
      });
      if (res?.success) setAnalysis(res.data || null);
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
          <SEOScoreBadge score={analysis?.score ?? 0} grade={analysis?.grade} gradeColor={{ green: '#10B981', yellow: '#F59E0B', red: '#EF4444' }[analysis?.gradeColor] || analysis?.gradeColor || '#10B981'} size="lg" />
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
              seoSubTab === t.id ? 'bg-brand-pink text-white shadow-sm' : 'text-neutral-600 dark:text-neutral-300 hover:bg-white dark:hover:bg-[#161616]'
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
                  className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-sm font-bold focus:outline-none focus:border-brand-pink" />
                <CharCounter value={form.seo.title} idealMin={30} idealMax={60} max={100} />
              </div>
              <div>
                <Label>Meta Description</Label>
                <textarea rows={3} value={form.seo.description} onChange={e => setForm({ ...form, seo: { ...form.seo, description: e.target.value } })}
                  placeholder="Buy PTE Academic exam vouchers at discounted prices. 10-second WhatsApp + email delivery, 6-12 month validity, 100% genuine official codes from Apex Vouchers."
                  className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-sm font-bold focus:outline-none focus:border-brand-pink" />
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
                    className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-sm font-bold focus:outline-none focus:border-brand-pink" />
                  <div className="mt-1.5 text-[10px] font-bold text-neutral-400">Leave empty to auto-generate from slug.</div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Focus Keyword</Label>
                  <input value={form.seo.focusKeyword} onChange={e => setForm({ ...form, seo: { ...form.seo, focusKeyword: e.target.value } })}
                    placeholder="e.g. PTE Academic Voucher"
                    className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-sm font-bold focus:outline-none focus:border-brand-pink" />
                </div>
                <div>
                  <Label>Secondary Keywords (one per line)</Label>
                  <textarea rows={4} value={form.seo.secondaryKeywords} onChange={e => setForm({ ...form, seo: { ...form.seo, secondaryKeywords: e.target.value } })}
                    placeholder="PTE voucher&#10;PTE exam voucher India&#10;PTE Academic discount"
                    className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-[11px] font-mono focus:outline-none focus:border-brand-pink" />
                </div>
              </div>
            </div>
          )}

          {seoSubTab === 'content' && (
            <div className="space-y-4">
              <div>
                <Label>Short Description (legacy card text)</Label>
                <textarea rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-sm font-bold focus:outline-none focus:border-brand-pink" />
              </div>
              <div>
                <Label>Long-form Rich Description (H2/H3 allowed)</Label>
                <RichTextToolbar onFormat={insertFormatting} />
                <textarea id="rich-desc-ta" rows={14} value={form.richDescription} onChange={e => setForm({ ...form, richDescription: e.target.value })}
                  placeholder="<h2>What is a PTE Academic Voucher?</h2>&#10;<p>A PTE Academic voucher is a pre-paid exam code...</p>"
                  className="w-full px-4 py-3 rounded-b-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-[11px] font-mono leading-relaxed focus:outline-none focus:border-brand-pink whitespace-pre-wrap" />
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
                  <Label className="mb-0!">Facebook / Open Graph</Label>
                  <span className="text-[9px] font-black uppercase tracking-wider text-[#1877F2]">OG</span>
                </div>
                <Field label="OG Title" value={form.seo.ogTitle} onChange={v => setForm({ ...form, seo: { ...form.seo, ogTitle: v } })} placeholder="Falls back to SEO title" />
                <TextArea label="OG Description" value={form.seo.ogDescription} onChange={v => setForm({ ...form, seo: { ...form.seo, ogDescription: v } })} rows={2} />
                <Field label="OG Image URL (1200×630)" value={form.seo.ogImage} onChange={v => setForm({ ...form, seo: { ...form.seo, ogImage: v } })} placeholder="https://..." />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="mb-0!">Twitter / X Card</Label>
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
                {product?.image ? <img src={imageUrl(product.image, { width: 192 })} alt="" className="w-24 h-24 rounded-xl object-cover shrink-0 border border-[#6C3CE0]/30" /> : <div className="w-24 h-24 rounded-xl bg-white dark:bg-[#161616] flex items-center justify-center font-black text-[10px] text-neutral-400 border border-dashed border-[#6C3CE0]/30">No Image</div>}
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
                  className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-[11px] font-mono leading-relaxed focus:outline-none focus:border-brand-pink whitespace-pre-wrap" />
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
              <SEOScoreBadge score={analysis?.score ?? 0} grade={analysis?.grade} gradeColor={{ green: '#10B981', yellow: '#F59E0B', red: '#EF4444' }[analysis?.gradeColor] || analysis?.gradeColor || '#10B981'} />
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
      if (res?.success) setOverviewData(res.data || null);
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
  const loadGlobal = async () => {
    setGlobalLoading(true);
    try { const res = await adminApi.seo.globalSettings(); if (res?.success) setGlobalForm(res.data || {}); } finally { setGlobalLoading(false); }
  };
  useEffect(() => {
    if (subTab === 'overview') loadOverview();
    if (subTab === 'pages') loadPages();
    if (subTab === 'redirects') loadRedirects();
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
          <button onClick={loadOverview} className="px-4 py-2.5 rounded-xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] font-black text-[11px] inline-flex items-center gap-1.5 hover:border-brand-pink">
            <RefreshCw className={`w-4 h-4 ${loadingOverview ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      <div className="flex overflow-x-auto gap-1 p-1.5 bg-white dark:bg-[#161616] rounded-2xl border border-[#EAEAEA] dark:border-[#292929]">
        {subTabs.map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id)}
            className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-[11px] font-black whitespace-nowrap transition ${
              subTab === t.id ? 'bg-brand-pink text-white shadow-sm' : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[#262626]'
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
                    <h4 className="font-black text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Issues ({overviewData?.issuesCount || 0})</h4>
                  </div>
                  <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                    {(overviewData?.topIssues || []).slice(0, 25).map((it, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40">
                        <AlertOctagon className="w-3 h-3 text-rose-500 shrink-0 mt-0.5" />
                        <div className="text-[10px] font-bold text-rose-700 dark:text-rose-300 leading-snug flex-1">{it.text || it}</div>
                      </div>
                    ))}
                    {(!overviewData?.topIssues?.length) && <div className="text-[10px] font-bold text-emerald-600">✓ No critical issues detected.</div>}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-black text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400">Warnings ({overviewData?.warningsCount || 0})</h4>
                  </div>
                  <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                    {(overviewData?.topWarnings || []).slice(0, 25).map((it, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40">
                        <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                        <div className="text-[10px] font-bold text-amber-700 dark:text-amber-300 leading-snug flex-1">{it.text || it}</div>
                      </div>
                    ))}
                    {(!overviewData?.topWarnings?.length) && <div className="text-[10px] font-bold text-neutral-400">No warnings.</div>}
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
                        <div className="text-[9px] opacity-70 mt-0.5">{g.items?.length || 0} items</div>
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
                        <div className="text-[9px] opacity-70 mt-0.5">{g.items?.length || 0} items</div>
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
                <button key={q.l} onClick={q.action} className="flex items-center gap-3 p-4 rounded-2xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-left hover:border-brand-pink transition">
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
                    const a = ps.analysis || {};
                    const colorMap = { green: '#10B981', yellow: '#F59E0B', red: '#EF4444' };
                    return (
                      <tr key={ps.id || ps._id} className="border-t border-[#EAEAEA] dark:border-[#292929] hover:bg-neutral-50/50 dark:hover:bg-[#111111]">
                        <Td>
                          <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-lg bg-[#FFF0F5] dark:bg-[#2A0A17] border border-brand-pink/20 flex items-center justify-center font-black text-[9px] text-brand-pink">
                              APX
                            </div>
                            <div>
                              <div className="font-black text-sm">{ps.name}</div>
                              <div className="text-[10px] font-bold text-neutral-400">{ps.slug}</div>
                            </div>
                          </div>
                        </Td>
                        <Td className="max-w-xs">
                          <div className="text-[11px] leading-snug line-clamp-2">{a.checks?.find(c => c.key === 'seoTitlePresent' && c.status === 'good') ? <span>{ps.name}</span> : <span className="text-neutral-400 italic">not set</span>}</div>
                        </Td>
                        <Td><span className="font-mono text-[10px]">{ps.slug}</span></Td>
                        <Td className="text-center">
                          <span className="text-neutral-400 text-[10px]">—</span>
                        </Td>
                        <Td className="text-center">
                          <div className="flex justify-center"><SEOScoreBadge score={a.score || 0} grade={a.grade} gradeColor={colorMap[a.gradeColor] || a.gradeColor || '#10B981'} size="sm" /></div>
                        </Td>
                        <Td className="text-center whitespace-nowrap">
                          {ps.active ? <Pill text="INDEXABLE" tint="emerald" /> : <Pill text="INACTIVE" tint="neutral" />}
                        </Td>
                        <Td className="text-right whitespace-nowrap">
                          <button onClick={() => setProductSEOEditing(ps)} className="px-3 py-1.5 rounded-xl bg-[#6C3CE0]/10 text-[#6C3CE0] border border-[#6C3CE0]/20 font-black text-[10px] inline-flex items-center gap-1 hover:bg-[#6C3CE0] hover:text-white transition">
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
                    className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-sm font-bold focus:outline-none focus:border-brand-pink" />
                  <CharCounter value={pageDraft.seo?.title} idealMin={30} idealMax={60} max={100} />
                </div>
                <div>
                  <Label>Meta Description</Label>
                  <textarea rows={3} value={pageDraft.seo?.description || ''} onChange={e => setPageDraft({ ...pageDraft, seo: { ...pageDraft.seo, description: e.target.value } })}
                    className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-sm font-bold focus:outline-none focus:border-brand-pink" />
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

      {subTab === 'blogs' && <BlogAdmin />}

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
                      className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-sm font-bold focus:outline-none focus:border-brand-pink">
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
                  <Field label="Website URL (Canonical Base)" value={globalForm.websiteUrl || ''} onChange={v => setGlobalForm({ ...globalForm, websiteUrl: v })} placeholder="https://apexvouchers.com" />
                </div>
                <div className="space-y-4">
                  <Field label="Default OG Image URL (1200×630)" value={globalForm.defaultOgImage || ''} onChange={v => setGlobalForm({ ...globalForm, defaultOgImage: v })} placeholder="https://..." />
                  <Field label="Default Social Sharing Image" value={globalForm.defaultSocialImage || ''} onChange={v => setGlobalForm({ ...globalForm, defaultSocialImage: v })} />
                  <div className="pt-4 border-t border-[#EAEAEA] dark:border-[#292929]" />
                  <Field label="Organization / Brand Name" value={globalForm.organizationName || ''} onChange={v => setGlobalForm({ ...globalForm, organizationName: v })} placeholder="Apex Vouchers" />
                  <Field label="Organization Logo URL" value={globalForm.organizationLogo || ''} onChange={v => setGlobalForm({ ...globalForm, organizationLogo: v })} placeholder="https://.../logo.png" />
                  <div className="pt-4 border-t border-[#EAEAEA] dark:border-[#292929]" />
                  <Field label="Google Search Console (Verification Meta Tag content)" value={globalForm.gscVerificationCode || ''} onChange={v => setGlobalForm({ ...globalForm, gscVerificationCode: v })} placeholder="google-site-verification value" />
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
        if (type === 'video') {
          setDraft((prev) => ({
            ...prev,
            videoUrl: res.videoUrl || prev.videoUrl,
            cloudinaryPublicId: res.cloudinaryPublicId || prev.cloudinaryPublicId || '',
            thumbnail: res.thumbnailUrl || prev.thumbnail,
            thumbnailUrl: res.thumbnailUrl || prev.thumbnailUrl,
            duration: res.duration || prev.duration || '15s',
          }));
        } else if (type === 'thumbnail') {
          setDraft((prev) => ({
            ...prev,
            thumbnail: res.thumbnailUrl || prev.thumbnail,
            thumbnailUrl: res.thumbnailUrl || prev.thumbnailUrl,
          }));
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

    const res = await adminApi.reels(params);
    setRows(res.data || []);
    setKpis(res.kpis || {});
    if (res.settings) setSettings(res.settings);
    setLoading(false);
  };

  useEffect(() => {
    const t = setTimeout(refresh, 300);
    return () => clearTimeout(t);
  }, [search, statusFilter, categoryFilter]);

  const setCloudinaryId = (id) => {
    const clean = id.trim();
    setDraft((prev) => ({
      ...prev,
      cloudinaryPublicId: clean,
      videoUrl: clean ? `https://res.cloudinary.com/nbcbpuql/video/upload/${clean}.mp4` : prev.videoUrl,
      thumbnail: clean ? `https://res.cloudinary.com/nbcbpuql/video/upload/so_0/${clean}.jpg` : prev.thumbnail,
      thumbnailUrl: clean ? `https://res.cloudinary.com/nbcbpuql/video/upload/so_0/${clean}.jpg` : prev.thumbnailUrl,
    }));
  };

  const startCreate = () => {
    const nextOrder = (rows.length || 0) + 1;
    setDraft({
      title: '',
      description: '',
      cloudinaryPublicId: 'v1',
      videoUrl: 'https://res.cloudinary.com/nbcbpuql/video/upload/v1.mp4',
      youtubeEmbed: '',
      thumbnail: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80',
      category: 'Step-By-Step Guide',
      duration: '15s',
      badgeColor: 'bg-amber-400 text-slate-950',
      icon: '🎬',
      displayOrder: nextOrder,
      order: nextOrder,
      viewsCount: 0,
      views: 0,
      featured: false,
      published: true,
      isActive: true,
    });
    setEditing(null);
    setIsCreating(true);
  };

  const startEdit = (v) => {
    setEditing(v);
    setIsCreating(false);
    setDraft({
      ...v,
      cloudinaryPublicId: v.cloudinaryPublicId || '',
      thumbnail: v.thumbnailUrl || v.thumbnail || '',
      thumbnailUrl: v.thumbnailUrl || v.thumbnail || '',
      order: v.order ?? v.displayOrder ?? 0,
      displayOrder: v.displayOrder ?? v.order ?? 0,
      isActive: v.isActive ?? v.published ?? true,
      published: v.published ?? v.isActive ?? true,
      views: v.views ?? v.viewsCount ?? 0,
      viewsCount: v.viewsCount ?? v.views ?? 0,
    });
  };

  const saveVideo = async () => {
    if (!draft.title || (!draft.videoUrl && !draft.cloudinaryPublicId)) {
      alert('Video title and video URL or Cloudinary Public ID are required.');
      return;
    }
    const orderVal = Number(draft.order ?? draft.displayOrder) || 0;
    const viewsVal = Number(draft.views ?? draft.viewsCount) || 0;
    const payload = {
      ...draft,
      order: orderVal,
      displayOrder: orderVal,
      views: viewsVal,
      viewsCount: viewsVal,
      isActive: draft.isActive !== undefined ? !!draft.isActive : !!draft.published,
      published: draft.published !== undefined ? !!draft.published : !!draft.isActive,
    };
    let res;
    if (isCreating) res = await adminApi.createReel(payload);
    else res = await adminApi.updateReel(editing?._id || editing?.id, payload);

    if (res.success) {
      setIsCreating(false);
      setEditing(null);
      refresh();
    } else alert(res.message || 'Failed to save video');
  };

  const moveOrder = async (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= rows.length) return;

    const newRows = [...rows];
    const temp = newRows[index];
    newRows[index] = newRows[targetIdx];
    newRows[targetIdx] = temp;

    const items = newRows.map((r, idx) => ({ id: r._id || r.id, order: idx + 1 }));
    setRows(newRows);
    const res = await adminApi.bulkReorderReels(items);
    if (res.success) refresh();
  };

  const toggleSectionEnabled = async () => {
    const nextVal = !settings.videoSectionEnabled;
    const res = await adminApi.updateReelSettings({ videoSectionEnabled: nextVal });
    if (res.success) {
      setSettings((prev) => ({ ...prev, videoSectionEnabled: nextVal }));
      refresh();
    }
  };

  const toggleMovieModeEnabled = async () => {
    const nextVal = !settings.movieReelModeEnabled;
    const res = await adminApi.updateReelSettings({ movieReelModeEnabled: nextVal });
    if (res.success) {
      setSettings((prev) => ({ ...prev, movieReelModeEnabled: nextVal }));
      refresh();
    }
  };

  const toggleFeatured = async (v) => {
    const res = await adminApi.quickToggleFeaturedReel(v._id || v.id, !v.featured);
    if (res.success) refresh();
  };

  const togglePublished = async (v) => {
    const isPub = v.published !== undefined ? !v.published : !v.isActive;
    const res = await adminApi.quickTogglePublishReel(v._id || v.id, isPub);
    if (res.success) refresh();
  };

  const removeVideo = async (v) => {
    if (!confirm(`Are you sure you want to delete reel "${v.title}"?`)) return;
    const res = await adminApi.deleteReel(v._id || v.id);
    if (res.success) refresh();
    else alert(res.message || 'Failed to delete reel');
  };

  return (
    <div className="space-y-6">
      {/* Header & Global Settings Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl tracking-tight">Videos & Reels Management</h1>
          <p className="text-xs font-bold text-neutral-500 dark:text-[#B5B5B5]">Manage Cloudinary-hosted reels, carousel order, live card previews, durations, and view analytics.</p>
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
            <Film className="w-4 h-4" /> Reel Section: {settings.videoSectionEnabled ? 'ON (Visible)' : 'OFF (Hidden)'}
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

          <button onClick={startCreate} className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl btn-pink text-white font-black text-xs shadow-lg cursor-pointer">
            <Plus className="w-4 h-4" /> Add New Reel
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard label="Total Reels" value={kpis.totalVideos || rows.length} icon={<Film className="w-4 h-4" />} tint="#FF005C" />
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
              placeholder="Search reels by title, description, category, Cloudinary ID..."
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
            <option value="Save Money">Save Money</option>
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
            { id: '', label: 'All Reels' },
            { id: 'published', label: 'Published / Active' },
            { id: 'draft', label: 'Drafts / Inactive' },
            { id: 'featured', label: 'Center Featured' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setStatusFilter(pill.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition whitespace-nowrap cursor-pointer ${
                statusFilter === pill.id
                  ? 'bg-brand-pink text-white shadow-sm'
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
          title={isCreating ? '🎬 Add New Video Reel (Cloudinary)' : `✏️ Edit Reel: ${editing?.title}`}
          onClose={() => { setIsCreating(false); setEditing(null); }}
          onSave={saveVideo}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Inputs */}
            <div className="lg:col-span-2 space-y-4">
              
              {/* Cloudinary Presets & Upload Dropzones */}
              <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/20 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 text-[10px] font-black uppercase">
                      Cloudinary ID
                    </span>
                    <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                      Select or type a Cloudinary Public ID:
                    </span>
                  </div>
                  {/* Quick Preset Buttons */}
                  <div className="flex items-center gap-1.5">
                    {['v1', 'v2', 'v3', 'v4', 'v5'].map((id) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setCloudinaryId(id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-black transition cursor-pointer ${
                          draft.cloudinaryPublicId === id
                            ? 'bg-amber-400 text-slate-950 shadow-md scale-105'
                            : 'bg-white dark:bg-[#222] text-neutral-700 dark:text-neutral-300 border border-[#EAEAEA] dark:border-[#333] hover:border-amber-400'
                        }`}
                      >
                        {id}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                      Cloudinary Public ID
                    </label>
                    <input
                      type="text"
                      value={draft.cloudinaryPublicId || ''}
                      onChange={(e) => setCloudinaryId(e.target.value)}
                      placeholder="e.g. v1, v2, my_reel_01"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#121212] border border-[#EAEAEA] dark:border-[#292929] text-xs font-bold text-neutral-900 dark:text-white outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                      Auto-Generated Poster Frame
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        if (draft.cloudinaryPublicId) {
                          const poster = `https://res.cloudinary.com/nbcbpuql/video/upload/so_0/${draft.cloudinaryPublicId}.jpg`;
                          setDraft((prev) => ({ ...prev, thumbnail: poster, thumbnailUrl: poster }));
                        }
                      }}
                      disabled={!draft.cloudinaryPublicId}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-100 dark:bg-[#222] text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-amber-400 hover:text-slate-950 transition cursor-pointer disabled:opacity-50"
                    >
                      ⚡ Use Cloudinary Keyframe Snapshot (so_0)
                    </button>
                  </div>
                </div>
              </div>

              {/* File Upload Dropzones */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#292929]">
                {/* Video File Upload */}
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-900 dark:text-white">
                    🎬 Upload Video to Cloudinary (.mp4, .webm, .mov)
                  </label>
                  <label className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-brand-pink/30 bg-rose-50/30 dark:bg-[#2A0A17]/20 hover:border-brand-pink cursor-pointer transition">
                    <span className="text-xs font-black text-brand-pink">Click to Upload MP4 Video</span>
                    <span className="text-[10px] text-slate-400 font-medium mt-0.5">Direct Cloudinary Stream • Max 100MB</span>
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
                    🖼️ Upload Custom Poster (.jpg, .png, .webp)
                  </label>
                  <label className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-amber-500/30 bg-amber-50/30 dark:bg-amber-950/20 hover:border-amber-500 cursor-pointer transition">
                    <span className="text-xs font-black text-amber-600 dark:text-amber-400">Click to Upload Poster Image</span>
                    <span className="text-[10px] text-slate-400 font-medium mt-0.5">9:16 Aspect Ratio Recommended</span>
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
                  <span>Uploading video to Cloudinary storage...</span>
                  <span>{uploadProgress}%</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Reel Title *" value={draft.title} onChange={(v) => setDraft({ ...draft, title: v })} placeholder="e.g. How to Buy an Exam Voucher" />
                <Field label="Category *" value={draft.category} onChange={(v) => setDraft({ ...draft, category: v })} placeholder="Step-By-Step Guide / PTE Voucher" />
                <Field label="Direct Video Stream URL (MP4) *" value={draft.videoUrl} onChange={(v) => setDraft({ ...draft, videoUrl: v })} placeholder="https://res.cloudinary.com/..." />
                <Field label="Poster / Thumbnail Image URL *" value={draft.thumbnailUrl || draft.thumbnail} onChange={(v) => setDraft({ ...draft, thumbnail: v, thumbnailUrl: v })} placeholder="https://..." />
                <Field label="Duration" value={draft.duration} onChange={(v) => setDraft({ ...draft, duration: v })} placeholder="15s" />
                <Field label="Display Order (Rank)" type="number" value={draft.order ?? draft.displayOrder} onChange={(v) => setDraft({ ...draft, order: v, displayOrder: v })} />
                <Field label="View Count" type="number" value={draft.views ?? draft.viewsCount} onChange={(v) => setDraft({ ...draft, views: v, viewsCount: v })} />
                <Field label="Badge Text Style" value={draft.badgeColor} onChange={(v) => setDraft({ ...draft, badgeColor: v })} placeholder="bg-amber-400 text-slate-950" />
              </div>

              <TextArea label="Short Description (Shown on Reel Card)" value={draft.description} onChange={(v) => setDraft({ ...draft, description: v })} rows={2} />

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Check label="Center Featured Video (Large Card Highlight)" checked={!!draft.featured} onChange={(v) => setDraft({ ...draft, featured: v })} />
                <Check label="Active & Visible on Public Website" checked={draft.isActive !== undefined ? !!draft.isActive : !!draft.published} onChange={(v) => setDraft({ ...draft, isActive: v, published: v })} />
              </div>
            </div>

            {/* Right Col: Live Card Preview */}
            <div className="space-y-2">
              <Label>Live Customer Card Preview</Label>
              <div className="w-full aspect-9/16 rounded-2xl bg-[#161616] border-2 border-amber-400 p-4 relative overflow-hidden flex flex-col justify-between text-white shadow-xl">
                <img 
                  src={draft.thumbnailUrl || draft.thumbnail || (draft.cloudinaryPublicId ? `https://res.cloudinary.com/nbcbpuql/video/upload/so_0/${draft.cloudinaryPublicId}.jpg` : 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600')} 
                  alt="preview" 
                  className="absolute inset-0 w-full h-full object-cover opacity-60" 
                />
                <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-transparent to-slate-950/70" />

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
                    <h4 className="font-heading font-black text-xs text-white leading-tight truncate">{draft.title || 'Untitled Reel'}</h4>
                    <span className="text-[9px] font-bold text-slate-400 shrink-0">{(Number(draft.views ?? draft.viewsCount) || 0).toLocaleString()} views</span>
                  </div>
                  <p className="text-[10px] text-slate-300 font-medium line-clamp-2">{draft.description || 'Description will appear on reel card...'}</p>
                </div>
              </div>
            </div>
          </div>
        </FormCard>
      )}

      {/* Main Reel Table */}
      <div className="rounded-3xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-bold">
            <thead className="bg-neutral-50 dark:bg-[#0E0E0E] text-neutral-500">
              <tr>
                <Th>Thumbnail & Reel Details</Th>
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

              {!loading && rows.map((v, index) => (
                <tr key={v._id || v.id} className="border-t border-[#EAEAEA] dark:border-[#292929] hover:bg-neutral-50/50 dark:hover:bg-[#111111] transition-colors">
                  {/* Thumbnail & Title */}
                  <Td>
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-10 rounded-xl bg-neutral-900 overflow-hidden relative border border-[#EAEAEA] dark:border-[#292929] shrink-0">
                        <img src={v.thumbnailUrl || v.thumbnail || v.poster} alt={v.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <Play className="w-3.5 h-3.5 fill-white text-white" />
                        </div>
                      </div>
                      <div>
                        <div className="font-black text-sm text-neutral-900 dark:text-white flex items-center gap-2">
                          <span>{v.title}</span>
                          {v.cloudinaryPublicId && (
                            <span className="px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-500 border border-sky-500/20 text-[9px] font-mono font-bold">
                              {v.cloudinaryPublicId}
                            </span>
                          )}
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
                    {(v.views ?? v.viewsCount ?? 0).toLocaleString()}
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
                      <Pill
                        text={(v.isActive ?? v.published) ? 'ACTIVE' : 'INACTIVE'}
                        tint={(v.isActive ?? v.published) ? 'emerald' : 'neutral'}
                      />
                    </button>
                  </Td>

                  {/* Display Order with Up/Down Controls */}
                  <Td className="text-center whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => moveOrder(index, -1)}
                        className="p-1 rounded-lg bg-neutral-100 dark:bg-[#222] hover:bg-amber-400 hover:text-slate-950 transition disabled:opacity-30 cursor-pointer"
                        title="Move Up in Carousel"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-mono font-black text-xs px-1.5">{v.order ?? v.displayOrder ?? index + 1}</span>
                      <button
                        type="button"
                        disabled={index === rows.length - 1}
                        onClick={() => moveOrder(index, 1)}
                        className="p-1 rounded-lg bg-neutral-100 dark:bg-[#222] hover:bg-amber-400 hover:text-slate-950 transition disabled:opacity-30 cursor-pointer"
                        title="Move Down in Carousel"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </Td>

                  {/* Actions */}
                  <Td className="text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => setPreviewVideo(v)}
                        className="p-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border border-purple-200 cursor-pointer"
                        title="Preview Native Reel Player"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => startEdit(v)}
                        className="px-2.5 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border border-sky-200 text-[11px] font-black flex items-center gap-1 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>

                      <button
                        onClick={() => removeVideo(v)}
                        className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 cursor-pointer"
                        title="Delete Reel"
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
        {!loading && rows.length === 0 && <Empty title="No reels found" desc="Add your first Cloudinary video reel to populate the website carousel." />}
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
              {previewVideo.cloudinaryPublicId && (
                <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30 text-[10px] font-mono font-bold">
                  Public ID: {previewVideo.cloudinaryPublicId}
                </span>
              )}
              <ApexLogo className="h-5" whiteText={true} />
            </div>

            <h3 className="font-heading font-black text-xl text-white">{previewVideo.title}</h3>

            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-[#0A0A0A] border border-white/10 shadow-xl relative flex items-center justify-center">
              <video
                src={previewVideo.videoUrl || (previewVideo.cloudinaryPublicId ? `https://res.cloudinary.com/nbcbpuql/video/upload/${previewVideo.cloudinaryPublicId}.mp4` : '')}
                poster={previewVideo.thumbnailUrl || previewVideo.thumbnail}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            </div>

            <p className="text-xs text-slate-300 font-medium">{previewVideo.description}</p>
            <div className="pt-2 flex justify-between items-center">
              <span className="text-xs text-amber-400 font-mono font-bold">
                ▶ {previewVideo.duration || '15s'} • {(Number(previewVideo.views ?? previewVideo.viewsCount) || 0).toLocaleString()} views
              </span>
              <button onClick={() => setPreviewVideo(null)} className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-black text-xs cursor-pointer">
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

  const [policyForm, setPolicyForm] = useState({
    apexRefund: {
      enabled: true,
      effectiveDate: '2026-01-01',
      eligibilityCriteria: 'Vouchers that are 100% unredeemed and unallocated on the Pearson / ETS portal within the allowable refund window.',
      cancellationPeriodDays: 7,
      refundPercentage: 100,
      processingFeePercent: 0,
      voucherValidityPeriod: '6 to 11 months from date of purchase (check voucher specification)',
      cancellationRules: 'Once a voucher refund is issued, the alphanumeric code is permanently deactivated in our database and cannot be applied to any exam booking.',
      reschedulingRules: 'Vouchers cannot be used to pay Pearson rescheduling fees. Rescheduling is managed directly via the student\'s myPTE account.',
      exceptionalCircumstances: 'For medical or family emergencies, official documentation may be submitted to support for expedited case-by-case review.',
      refundProcessingTime: '24 to 48 business hours via source payment method.',
      supportEmail: 'info@apexvouchers.com',
      supportPhone: '+91 98559 26113',
      whatsappNumber: '9855926113',
    },
    guideSettings: {
      pageTitle: 'How to Reschedule or Cancel a PTE Exam in 2026',
      subtitle: 'Complete Guide to PTE Rescheduling, Cancellation, Refunds & Voucher Bookings',
      ctaTitle: 'Planning to Book a New PTE Exam?',
      ctaSubtitle: 'Purchase your official PTE voucher from Apex Vouchers and save instantly on your exam fee.',
      ctaButtonText: 'BUY PTE VOUCHER ONLINE',
      ctaButtonLink: 'https://apexvouchers.com/',
      ctaEmail: 'info@apexvouchers.com',
      ctaPhone: '98559 26113',
      isPublished: true,
      disclaimerText: 'Disclaimer: This article is for general informational purposes and is not affiliated with or endorsed by Pearson. PTE fees, cancellation rules, refund policies, voucher terms and booking procedures may change. Students should verify the latest information directly with Pearson and review the terms of their voucher provider before making a cancellation, rescheduling request or refund claim.',
    },
    faqs: [
      {
        question: 'Can I change my PTE exam date?',
        answer: 'Yes. Eligible appointments can generally be rescheduled through your myPTE account under My Activity.',
      },
      {
        question: 'Is PTE rescheduling free?',
        answer: 'Under Pearson\'s current policy, rescheduling is generally free when more than 14 full calendar days remain before the test date.',
      },
      {
        question: 'Can I cancel my PTE exam and get a refund?',
        answer: 'Where applicable, the refund depends on how many full calendar days remain before the appointment. Cancellations made 14 or more full days before the test are generally eligible for a 100% refund, while cancellations made 13–8 full calendar days before the test are generally eligible for a 50% refund.',
      },
      {
        question: 'What refund do I get if I cancel 14 or more days before my PTE exam?',
        answer: 'Generally 100%, subject to Pearson\'s current terms and policies.',
      },
      {
        question: 'What if I cancel 10 days before my PTE exam?',
        answer: 'A cancellation made 13–8 full calendar days before the test date is generally eligible for a 50% refund under Pearson\'s published schedule.',
      },
      {
        question: 'What if I cancel fewer than 7 days before my PTE exam?',
        answer: 'Under Pearson\'s current published schedule, cancellations made fewer than 7 full calendar days before the test are generally not refundable.',
      },
      {
        question: 'What if I bought my PTE voucher from a third-party provider?',
        answer: 'Contact the provider from which the voucher was purchased and check that provider\'s applicable refund policy. Cancelling a Pearson exam appointment does not automatically refund payments made to a third-party voucher vendor.',
      },
      {
        question: 'Can I use a voucher to pay a rescheduling fee?',
        answer: 'Pearson states that PTE vouchers can be applied toward the test fee but cannot be used to pay a rescheduling fee.',
      },
    ],
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
        if (sRes.data.policySettings) setPolicyForm((prev) => ({ ...prev, ...sRes.data.policySettings }));
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

  const handleSavePolicySettings = async () => {
    setSavingSettings(true);
    try {
      await adminApi.updateWebsiteSettings({ policySettings: policyForm });
      await refreshWebsiteConfig?.();
      showToast?.('Policy and Guide settings updated successfully!', 'success');
    } catch (err) {
      showToast?.(err.message || 'Failed to update policy settings', 'error');
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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-pink/10 text-brand-pink font-black text-xs border border-brand-pink/20 mb-2">
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
          { id: 'policies', label: '📜 Policy & Legal CMS' },
          { id: 'footer', label: '🛡️ Benefits & Footer CMS' },
          { id: 'business', label: '📧 Business & Email Info' },
          { id: 'preview', label: '👁️ Live Homepage Preview' },
        ].map((sub) => (
          <button
            key={sub.id}
            onClick={() => setActiveSubTab(sub.id)}
            className={`px-4 py-2.5 rounded-xl font-black text-xs whitespace-nowrap transition flex items-center gap-2 ${
              activeSubTab === sub.id
                ? 'bg-brand-pink text-white shadow-md'
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
              className="px-5 py-3 rounded-2xl bg-brand-pink hover:bg-[#E00052] text-white font-black text-xs shadow-lg shadow-brand-pink/20 inline-flex items-center gap-2 cursor-pointer transition"
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
                            <span className="inline-flex items-center px-2 py-0.5 rounded bg-rose-50 text-brand-pink font-extrabold text-[10px] border border-rose-200">
                              {c.badgeText || 'Offer'}
                            </span>
                          </td>
                          <td className="p-4 font-black text-brand-pink">
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
              <label className="block text-xs font-black text-brand-pink mb-1">Highlighted Heading (Pink)</label>
              <input
                type="text"
                value={heroForm.headingHighlight}
                onChange={(e) => setHeroForm({ ...heroForm, headingHighlight: e.target.value })}
                className="w-full p-3 rounded-2xl border border-brand-pink/40 bg-[#FFF0F5] dark:bg-[#2A0A17] font-black text-xs text-brand-pink"
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
              className="px-6 py-3 rounded-2xl bg-brand-pink hover:bg-[#E00052] text-white font-black text-xs shadow-lg shadow-brand-pink/20 cursor-pointer transition flex items-center gap-2"
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
              className="w-4 h-4 accent-brand-pink"
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

          <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-50/50 dark:bg-[#2A0A17]/30 border border-brand-pink/20">
            <input
              type="checkbox"
              id="annOverride"
              checked={announcementForm.overrideWithCampaign}
              onChange={(e) => setAnnouncementForm({ ...announcementForm, overrideWithCampaign: e.target.checked })}
              className="w-4 h-4 accent-brand-pink"
            />
            <label htmlFor="annOverride" className="text-xs font-black text-brand-pink cursor-pointer">
              Automatically Override with Active Campaign Banner (e.g. 🇮🇳 Independence Day Sale — 50% OFF)
            </label>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleSaveAnnouncement}
              disabled={savingSettings}
              className="px-6 py-3 rounded-2xl bg-brand-pink hover:bg-[#E00052] text-white font-black text-xs shadow-lg shadow-brand-pink/20 cursor-pointer transition flex items-center gap-2"
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
                          <span className="text-brand-pink font-black">₹</span>
                          <input
                            type="number"
                            value={prod.sellingPrice}
                            onChange={(e) => {
                              const val = e.target.value;
                              setProductPrices((prev) =>
                                prev.map((p, i) => (i === idx ? { ...p, sellingPrice: val } : p))
                              );
                            }}
                            className="w-24 p-2 rounded-xl border border-brand-pink/30 bg-rose-50/50 dark:bg-[#2A0A17]/30 font-black text-xs text-brand-pink"
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
                            className="w-4 h-4 accent-brand-pink"
                          />
                          <span className="text-xs font-bold">{prod.inStock ? 'In Stock' : 'Out of Stock'}</span>
                        </label>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleQuickPriceSave(prod)}
                          className="px-4 py-2 rounded-xl bg-brand-pink hover:bg-[#E00052] text-white font-black text-xs shadow-md inline-flex items-center gap-1.5 cursor-pointer"
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

      {/* TAB: POLICY & LEGAL CMS */}
      {activeSubTab === 'policies' && (
        <div className="space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-[#121212] p-6 rounded-3xl border border-[#EAEAEA] dark:border-[#222]">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-pink/10 text-brand-pink text-xs font-black uppercase">
                  📜 Dynamic Legal & Policy System
                </span>
                <span className="text-xs text-neutral-400 font-mono">Footer Accessible Only</span>
              </div>
              <h3 className="font-heading font-black text-xl text-slate-900 dark:text-white mt-1">
                Refund, Rescheduling, Voucher & Legal Policies
              </h3>
              <p className="text-xs text-neutral-500 font-medium max-w-2xl">
                Configure Apex Vouchers refund terms, cancellation windows, Pearson rescheduling guide copy, live CTA banner, FAQ items, and non-affiliation disclaimers without modifying application code.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSavePolicySettings}
                disabled={savingSettings}
                className="px-6 py-3 rounded-2xl bg-brand-pink hover:bg-[#E00052] text-white font-black text-xs shadow-lg shadow-brand-pink/20 cursor-pointer transition inline-flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{savingSettings ? 'Saving Policies...' : 'Save All Policies'}</span>
              </button>
            </div>
          </div>

          {/* Quick Page Links */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: 'Refund Policy', path: '/refund-policy' },
              { label: 'PTE Reschedule Guide', path: '/how-to-reschedule-cancel-pte-exam' },
              { label: 'Voucher Policy', path: '/voucher-refund-policy' },
              { label: 'Terms & Conditions', path: '/terms' },
              { label: 'Privacy Policy', path: '/privacy-policy' },
            ].map((p, idx) => (
              <a
                key={idx}
                href={p.path}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-2xl bg-white dark:bg-[#141414] border border-[#EAEAEA] dark:border-[#262626] hover:border-brand-pink text-xs font-bold text-neutral-700 dark:text-neutral-300 flex items-center justify-between transition group"
              >
                <span className="truncate">{p.label}</span>
                <ExternalLink className="w-3.5 h-3.5 text-neutral-400 group-hover:text-brand-pink shrink-0" />
              </a>
            ))}
          </div>

          {/* SECTION 1: APEX VOUCHERS ACTUAL REFUND RULES */}
          <div className="bg-white dark:bg-[#121212] p-6 sm:p-7 rounded-3xl border border-[#EAEAEA] dark:border-[#222] space-y-6">
            <div className="flex items-center justify-between border-b border-[#EAEAEA] dark:border-[#222] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-black">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-heading font-black text-base text-slate-900 dark:text-white">
                    Apex Vouchers Refund & Cancellation Rules
                  </h4>
                  <p className="text-xs text-neutral-500 font-medium">Controls actual business terms rendered across all policy pages and trust sections.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">Effective Date</label>
                <input
                  type="date"
                  value={policyForm.apexRefund?.effectiveDate || '2026-01-01'}
                  onChange={(e) =>
                    setPolicyForm((prev) => ({
                      ...prev,
                      apexRefund: { ...prev.apexRefund, effectiveDate: e.target.value },
                    }))
                  }
                  className="w-full p-3 rounded-2xl border border-slate-200 dark:border-[#292929] bg-slate-50 dark:bg-[#1A1A1A] font-bold text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">Cancellation Window (Days)</label>
                <input
                  type="number"
                  value={policyForm.apexRefund?.cancellationPeriodDays ?? 7}
                  onChange={(e) =>
                    setPolicyForm((prev) => ({
                      ...prev,
                      apexRefund: { ...prev.apexRefund, cancellationPeriodDays: Number(e.target.value) },
                    }))
                  }
                  className="w-full p-3 rounded-2xl border border-slate-200 dark:border-[#292929] bg-slate-50 dark:bg-[#1A1A1A] font-bold text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">Refund Percentage (%)</label>
                <input
                  type="number"
                  value={policyForm.apexRefund?.refundPercentage ?? 100}
                  onChange={(e) =>
                    setPolicyForm((prev) => ({
                      ...prev,
                      apexRefund: { ...prev.apexRefund, refundPercentage: Number(e.target.value) },
                    }))
                  }
                  className="w-full p-3 rounded-2xl border border-slate-200 dark:border-[#292929] bg-slate-50 dark:bg-[#1A1A1A] font-bold text-xs text-emerald-600 dark:text-emerald-400 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">Refund Eligibility Statement</label>
              <textarea
                rows="2"
                value={policyForm.apexRefund?.eligibilityCriteria || ''}
                onChange={(e) =>
                  setPolicyForm((prev) => ({
                    ...prev,
                    apexRefund: { ...prev.apexRefund, eligibilityCriteria: e.target.value },
                  }))
                }
                className="w-full p-3 rounded-2xl border border-slate-200 dark:border-[#292929] bg-slate-50 dark:bg-[#1A1A1A] font-medium text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">Voucher Validity Term</label>
                <input
                  type="text"
                  value={policyForm.apexRefund?.voucherValidityPeriod || ''}
                  onChange={(e) =>
                    setPolicyForm((prev) => ({
                      ...prev,
                      apexRefund: { ...prev.apexRefund, voucherValidityPeriod: e.target.value },
                    }))
                  }
                  className="w-full p-3 rounded-2xl border border-slate-200 dark:border-[#292929] bg-slate-50 dark:bg-[#1A1A1A] font-medium text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">Refund Processing Turnaround Time</label>
                <input
                  type="text"
                  value={policyForm.apexRefund?.refundProcessingTime || ''}
                  onChange={(e) =>
                    setPolicyForm((prev) => ({
                      ...prev,
                      apexRefund: { ...prev.apexRefund, refundProcessingTime: e.target.value },
                    }))
                  }
                  className="w-full p-3 rounded-2xl border border-slate-200 dark:border-[#292929] bg-slate-50 dark:bg-[#1A1A1A] font-medium text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">Code Deactivation / Invalidation Rules</label>
                <textarea
                  rows="2"
                  value={policyForm.apexRefund?.cancellationRules || ''}
                  onChange={(e) =>
                    setPolicyForm((prev) => ({
                      ...prev,
                      apexRefund: { ...prev.apexRefund, cancellationRules: e.target.value },
                    }))
                  }
                  className="w-full p-3 rounded-2xl border border-slate-200 dark:border-[#292929] bg-slate-50 dark:bg-[#1A1A1A] font-medium text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">Rescheduling Limitation Note</label>
                <textarea
                  rows="2"
                  value={policyForm.apexRefund?.reschedulingRules || ''}
                  onChange={(e) =>
                    setPolicyForm((prev) => ({
                      ...prev,
                      apexRefund: { ...prev.apexRefund, reschedulingRules: e.target.value },
                    }))
                  }
                  className="w-full p-3 rounded-2xl border border-slate-200 dark:border-[#292929] bg-slate-50 dark:bg-[#1A1A1A] font-medium text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">Exceptional Circumstances (Medical/Emergencies)</label>
              <textarea
                rows="2"
                value={policyForm.apexRefund?.exceptionalCircumstances || ''}
                onChange={(e) =>
                  setPolicyForm((prev) => ({
                    ...prev,
                    apexRefund: { ...prev.apexRefund, exceptionalCircumstances: e.target.value },
                  }))
                }
                className="w-full p-3 rounded-2xl border border-slate-200 dark:border-[#292929] bg-slate-50 dark:bg-[#1A1A1A] font-medium text-xs"
              />
            </div>
          </div>

          {/* SECTION 2: PTE RESCHEDULING GUIDE & CTA BANNER CMS */}
          <div className="bg-white dark:bg-[#121212] p-6 sm:p-7 rounded-3xl border border-[#EAEAEA] dark:border-[#222] space-y-6">
            <div className="flex items-center justify-between border-b border-[#EAEAEA] dark:border-[#222] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-brand-pink/10 text-brand-pink flex items-center justify-center font-black">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-heading font-black text-base text-slate-900 dark:text-white">
                    PTE Rescheduling Guide & CTA Controls
                  </h4>
                  <p className="text-xs text-neutral-500 font-medium">Customize article headings, bottom CTA text, link target, and non-affiliation disclaimer.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">Guide Main H1 Title</label>
                <input
                  type="text"
                  value={policyForm.guideSettings?.pageTitle || ''}
                  onChange={(e) =>
                    setPolicyForm((prev) => ({
                      ...prev,
                      guideSettings: { ...prev.guideSettings, pageTitle: e.target.value },
                    }))
                  }
                  className="w-full p-3 rounded-2xl border border-slate-200 dark:border-[#292929] bg-slate-50 dark:bg-[#1A1A1A] font-bold text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">Guide Subtitle</label>
                <input
                  type="text"
                  value={policyForm.guideSettings?.subtitle || ''}
                  onChange={(e) =>
                    setPolicyForm((prev) => ({
                      ...prev,
                      guideSettings: { ...prev.guideSettings, subtitle: e.target.value },
                    }))
                  }
                  className="w-full p-3 rounded-2xl border border-slate-200 dark:border-[#292929] bg-slate-50 dark:bg-[#1A1A1A] font-medium text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">CTA Heading Title</label>
                <input
                  type="text"
                  value={policyForm.guideSettings?.ctaTitle || ''}
                  onChange={(e) =>
                    setPolicyForm((prev) => ({
                      ...prev,
                      guideSettings: { ...prev.guideSettings, ctaTitle: e.target.value },
                    }))
                  }
                  className="w-full p-3 rounded-2xl border border-slate-200 dark:border-[#292929] bg-slate-50 dark:bg-[#1A1A1A] font-bold text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">CTA Subtitle Copy</label>
                <input
                  type="text"
                  value={policyForm.guideSettings?.ctaSubtitle || ''}
                  onChange={(e) =>
                    setPolicyForm((prev) => ({
                      ...prev,
                      guideSettings: { ...prev.guideSettings, ctaSubtitle: e.target.value },
                    }))
                  }
                  className="w-full p-3 rounded-2xl border border-slate-200 dark:border-[#292929] bg-slate-50 dark:bg-[#1A1A1A] font-medium text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">CTA Button Text</label>
                <input
                  type="text"
                  value={policyForm.guideSettings?.ctaButtonText || 'BUY PTE VOUCHER ONLINE'}
                  onChange={(e) =>
                    setPolicyForm((prev) => ({
                      ...prev,
                      guideSettings: { ...prev.guideSettings, ctaButtonText: e.target.value },
                    }))
                  }
                  className="w-full p-3 rounded-2xl border border-brand-pink/30 bg-rose-50/50 dark:bg-[#2A0A17]/30 font-black text-xs text-brand-pink"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">CTA Target URL</label>
                <input
                  type="text"
                  value={policyForm.guideSettings?.ctaButtonLink || 'https://apexvouchers.com/'}
                  onChange={(e) =>
                    setPolicyForm((prev) => ({
                      ...prev,
                      guideSettings: { ...prev.guideSettings, ctaButtonLink: e.target.value },
                    }))
                  }
                  className="w-full p-3 rounded-2xl border border-slate-200 dark:border-[#292929] bg-slate-50 dark:bg-[#1A1A1A] font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">Official Non-Affiliation Disclaimer</label>
              <textarea
                rows="3"
                value={policyForm.guideSettings?.disclaimerText || ''}
                onChange={(e) =>
                  setPolicyForm((prev) => ({
                    ...prev,
                    guideSettings: { ...prev.guideSettings, disclaimerText: e.target.value },
                  }))
                }
                className="w-full p-3 rounded-2xl border border-slate-200 dark:border-[#292929] bg-slate-50 dark:bg-[#1A1A1A] font-medium text-xs"
              />
            </div>
          </div>

          {/* SECTION 3: FAQ ACCORDION MANAGER */}
          <div className="bg-white dark:bg-[#121212] p-6 sm:p-7 rounded-3xl border border-[#EAEAEA] dark:border-[#222] space-y-6">
            <div className="flex items-center justify-between border-b border-[#EAEAEA] dark:border-[#222] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-black">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-heading font-black text-base text-slate-900 dark:text-white">
                    PTE Rescheduling & Cancellation FAQs
                  </h4>
                  <p className="text-xs text-neutral-500 font-medium">Add, update, or remove question and answer items shown in the guide.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setPolicyForm((prev) => ({
                    ...prev,
                    faqs: [
                      ...(prev.faqs || []),
                      { question: 'New Question?', answer: 'Detailed helpful answer.' },
                    ],
                  }))
                }
                className="px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-[#202020] hover:bg-neutral-200 dark:hover:bg-[#2A2A2A] text-xs font-black text-neutral-800 dark:text-neutral-200 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-brand-pink" /> Add FAQ Item
              </button>
            </div>

            <div className="space-y-4">
              {(policyForm.faqs || []).map((faq, fIdx) => (
                <div key={fIdx} className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#181818] border border-[#EAEAEA] dark:border-[#282828] space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-black text-neutral-400 uppercase">Question #{fIdx + 1}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setPolicyForm((prev) => ({
                          ...prev,
                          faqs: prev.faqs.filter((_, idx) => idx !== fIdx),
                        }))
                      }
                      className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold"
                      title="Delete question"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <input
                    type="text"
                    value={faq.question}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPolicyForm((prev) => ({
                        ...prev,
                        faqs: prev.faqs.map((f, i) => (i === fIdx ? { ...f, question: val } : f)),
                      }));
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#333] bg-white dark:bg-[#141414] font-bold text-xs"
                    placeholder="Enter question"
                  />

                  <textarea
                    rows="2"
                    value={faq.answer}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPolicyForm((prev) => ({
                        ...prev,
                        faqs: prev.faqs.map((f, i) => (i === fIdx ? { ...f, answer: val } : f)),
                      }));
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#333] bg-white dark:bg-[#141414] font-medium text-xs text-neutral-600 dark:text-neutral-300"
                    placeholder="Enter answer"
                  />
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleSavePolicySettings}
                disabled={savingSettings}
                className="px-6 py-3 rounded-2xl bg-brand-pink hover:bg-[#E00052] text-white font-black text-xs shadow-lg shadow-brand-pink/20 cursor-pointer transition flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Save Policy Settings
              </button>
            </div>
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
              className="px-6 py-3 rounded-2xl bg-brand-pink hover:bg-[#E00052] text-white font-black text-xs shadow-lg shadow-brand-pink/20 cursor-pointer transition flex items-center gap-2"
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
            <div className="flex items-center gap-2 text-xs font-black text-brand-pink">
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
              <label className="block text-xs font-black text-brand-pink mb-1">Official Sender & Support Email</label>
              <input
                type="text"
                disabled
                value="apexvouchers@gmail.com"
                className="w-full p-3 rounded-2xl border border-brand-pink/30 bg-rose-50/50 dark:bg-[#2A0A17]/30 font-black text-xs text-brand-pink"
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
              <div className="p-5 rounded-3xl bg-linear-to-r from-[#FFF0F5] via-rose-50 to-pink-50 dark:from-[#2A0A17] dark:via-[#1F0811] dark:to-[#16050B] border border-brand-pink/30 shadow-lg space-y-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-brand-pink text-white font-black text-xs uppercase">
                  {activeCampaign.badgeText || '🇮🇳 CAMPAIGN ACTIVE'}
                </span>
                <h4 className="text-2xl font-black text-slate-900 dark:text-white">{activeCampaign.title}</h4>
                <p className="text-sm font-bold text-brand-pink">{activeCampaign.subtitle}</p>
                <p className="text-xs text-slate-600 dark:text-slate-300">{activeCampaign.description}</p>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFF0F5] border border-brand-pink/20 text-xs font-black text-brand-pink">
                🎟️ Save on Exam Fees with Apex Vouchers
              </div>
            )}

            <h1 className="font-heading font-black text-3xl sm:text-4xl text-slate-900 dark:text-white leading-tight">
              {heroForm.headingLine1} <br />
              <span className="text-brand-pink">{heroForm.headingHighlight}</span> <br />
              {heroForm.headingLine3}
            </h1>

            <p className="text-sm text-slate-600 dark:text-slate-300 font-medium max-w-xl">
              {heroForm.descriptionText}
            </p>

            <button className="px-6 py-3 rounded-full bg-brand-pink text-white font-black text-xs shadow-lg">
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
              <label className="block text-brand-pink mb-1 font-black">Discount Value *</label>
              <input
                type="number"
                required
                min="0"
                value={form.discountValue}
                onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })}
                className="w-full p-3 rounded-2xl border border-brand-pink/40 bg-rose-50/50 dark:bg-[#2A0A17]/30 font-black text-brand-pink"
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
              <label className="flex items-center gap-2 text-xs font-bold text-brand-pink">
                <input
                  type="checkbox"
                  checked={form.applicableProducts.length === 0}
                  onChange={(e) => {
                    if (e.target.checked) setForm({ ...form, applicableProducts: [] });
                  }}
                  className="w-4 h-4 accent-brand-pink"
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
                      className="w-4 h-4 accent-brand-pink"
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
              className="px-6 py-2.5 rounded-2xl bg-brand-pink hover:bg-[#E00052] text-white font-black shadow-lg shadow-brand-pink/20"
            >
              {campaign ? 'Update Campaign' : 'Save & Publish Campaign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
