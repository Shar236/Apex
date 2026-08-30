'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Sparkles, Clock, ShoppingCart, Package, Users, Ticket, Tag, AlertTriangle, RefreshCw,
  CalendarCheck, FileSpreadsheet, Download, ShieldAlert, TrendingUp, TrendingDown,
} from 'lucide-react';
import { adminApi, formatPrice } from '@/lib/api';
import { StatCard, Empty } from '@/components/admin/admin-ui';

interface DashboardData {
  kpi?: Record<string, number | null>;
  charts?: { dailyRevenue?: Array<{ _id: string; revenue: number; orders: number }> };
  tables?: {
    bestSellers?: Array<{ id: string; name: string; unitsSold: number; stock: number; revenue: number; sellingPrice: number }>;
    lowStockProducts?: Array<{ id: string; name: string; brand: string; availableStock: number; sellingPrice: number; lowStockThreshold: number }>;
    recentOrders?: Array<Record<string, unknown>>;
  };
  alerts?: Record<string, number>;
}

export function Dashboard({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');
  const [unmaskedExport, setUnmaskedExport] = useState(false);

  const refresh = useCallback(async (p: string) => {
    setLoading(true);
    const res = await adminApi.dashboard({ period: p });
    setData((res.data as DashboardData) || null);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh(period);
  }, [period, refresh]);

  const kpi = data?.kpi || {};
  const charts = data?.charts || {};
  const tables = data?.tables || {};
  const alerts = data?.alerts || {};

  const stats = [
    { label: 'Total Net Revenue', value: formatPrice((kpi.netRevenue as number) || 0), icon: <Sparkles className="w-5 h-5" />, tint: '#FF005C', sub: 'Excludes refunded/cancelled' },
    { label: "Today's Revenue", value: formatPrice((kpi.todayRevenue as number) || 0), icon: <Sparkles className="w-5 h-5" />, tint: '#10B981', growth: (kpi.revenueGrowth as number) ?? null },
    { label: "Yesterday's Revenue", value: formatPrice((kpi.yesterdayRevenue as number) || 0), icon: <Clock className="w-5 h-5" />, tint: '#8B5CF6' },
    { label: 'Total Orders', value: kpi.totalOrders || 0, icon: <ShoppingCart className="w-5 h-5" />, tint: '#EC4899' },
    { label: "Today's Orders", value: kpi.todayOrders || 0, icon: <ShoppingCart className="w-5 h-5" />, tint: '#0EA5E9', growth: (kpi.ordersGrowth as number) ?? null },
    { label: 'Total Products Sold', value: kpi.totalProductsSold || 0, icon: <Package className="w-5 h-5" />, tint: '#6C3CE0' },
    { label: 'Total Customers', value: kpi.totalCustomers || 0, icon: <Users className="w-5 h-5" />, tint: '#14B8A6' },
    { label: 'Available Vouchers', value: kpi.availableVouchers || 0, icon: <Ticket className="w-5 h-5" />, tint: '#F59E0B' },
    { label: 'Active Promotions', value: kpi.activePromotions || 0, icon: <Tag className="w-5 h-5" />, tint: '#3B82F6' },
    { label: 'Pending Orders', value: kpi.pendingOrders || 0, icon: <Clock className="w-5 h-5" />, tint: '#F97316' },
    { label: 'Refunds Processed', value: kpi.refunds || 0, icon: <AlertTriangle className="w-5 h-5" />, tint: '#EF4444' },
    { label: 'New PTE Requests', value: kpi.newPTEBookingRequests || 0, icon: <CalendarCheck className="w-5 h-5" />, tint: '#0EA5E9', onClick: () => onNavigate('pte-bookings') },
    { label: 'Open Voucher Requests', value: kpi.newVoucherRequests || 0, icon: <Ticket className="w-5 h-5" />, tint: '#EA580C', onClick: () => onNavigate('voucher-requests') },
  ];

  const dailyRevenue = charts.dailyRevenue || [];
  const maxRev = Math.max(...dailyRevenue.map((d) => d.revenue || 1), 1);

  return (
    <div className="space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl tracking-tight">Enterprise Business Dashboard</h1>
          <p className="text-xs font-bold text-neutral-500 dark:text-[#B5B5B5]">Real MongoDB revenue metrics, inventory depletion, and analytics.</p>
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
          {(alerts.lowStockCount ?? 0) > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <div>
                <div className="font-black text-xs text-amber-900 dark:text-amber-300">Low Stock Alert</div>
                <div className="text-[11px] font-bold text-amber-700 dark:text-amber-400">{alerts.lowStockCount} products need restocking</div>
              </div>
            </div>
          )}
          {(alerts.pendingOrdersCount ?? 0) > 0 && (
            <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900/40 flex items-center gap-3">
              <Clock className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0" />
              <div>
                <div className="font-black text-xs text-sky-900 dark:text-sky-300">Pending Orders</div>
                <div className="text-[11px] font-bold text-sky-700 dark:text-sky-400">{alerts.pendingOrdersCount} orders awaiting action</div>
              </div>
            </div>
          )}
          {(alerts.failedPaymentsCount ?? 0) > 0 && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
              <div>
                <div className="font-black text-xs text-rose-900 dark:text-rose-300">Failed Payments</div>
                <div className="text-[11px] font-bold text-rose-700 dark:text-rose-400">{alerts.failedPaymentsCount} transaction attempts failed</div>
              </div>
            </div>
          )}
          {(alerts.expiringPromosCount ?? 0) > 0 && (
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
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-3xl p-5 bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] animate-pulse h-32" />
            ))
          : stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* SVG Time-Series Chart */}
      <div className="rounded-3xl p-6 bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-black text-lg text-neutral-900 dark:text-white">Revenue & Sales Trends</h3>
            <p className="text-xs font-bold text-neutral-500 dark:text-[#B5B5B5]">Daily net sales breakdown for selected period ({period})</p>
          </div>
        </div>
        {dailyRevenue.length > 0 ? (
          <div className="pt-4">
            <div className="h-44 flex items-end gap-2 border-b border-[#EAEAEA] dark:border-[#292929] pb-2 px-2">
              {dailyRevenue.map((item, idx) => {
                const heightPct = Math.max(12, Math.round((item.revenue / maxRev) * 100));
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-neutral-900 text-white px-2 py-1 rounded text-[10px] font-mono font-bold transition-opacity whitespace-nowrap z-10">
                      {item._id}: {formatPrice(item.revenue)} ({item.orders} orders)
                    </div>
                    <div className="w-full bg-brand-pink rounded-t-lg transition-all hover:bg-[#6C3CE0]" style={{ height: `${heightPct}%` }} />
                    <span className="text-[9px] font-bold text-neutral-400 truncate w-full text-center">{item._id?.slice(5)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-xs font-bold text-neutral-400">No sales data available for the selected period.</div>
        )}
      </div>

      {/* Best-Selling Products & Low Stock Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                <div className="text-right font-heading font-black text-base text-brand-pink">{formatPrice(p.revenue)}</div>
              </div>
            ))}
            {!tables.bestSellers?.length && <Empty title="No best sellers yet" />}
          </div>
        </div>

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
                  <span className="inline-flex px-3 py-1 rounded-full bg-rose-500 text-white font-black text-xs">{p.availableStock} Left</span>
                </div>
              </div>
            ))}
            {!tables.lowStockProducts?.length && <div className="py-8 text-center text-xs font-bold text-emerald-600 dark:text-emerald-400">✓ All products have sufficient voucher inventory.</div>}
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
            <input type="checkbox" checked={unmaskedExport} onChange={(e) => setUnmaskedExport(e.target.checked)} className="accent-brand-pink" />
            <span>Allow Unmasked Voucher Export</span>
          </label>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Orders CSV', resource: 'orders', tint: '#FF005C' },
            { label: 'Customers CSV', resource: 'customers', tint: '#6C3CE0' },
            { label: 'Vouchers CSV', resource: 'vouchers', tint: '#10B981', unmasked: unmaskedExport },
            { label: 'Sales Summary CSV', resource: 'sales', tint: '#0EA5E9' },
            { label: 'Fulfillments CSV', resource: 'fulfillments', tint: '#8B5CF6' },
          ].map((b) => (
            <button
              key={b.resource}
              onClick={() => adminApi.downloadExport(b.resource, !!b.unmasked)}
              className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] hover:border-brand-pink text-left font-black text-xs flex items-center justify-between transition"
            >
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4" style={{ color: b.tint }} />
                <span>{b.label}</span>
              </div>
              <Download className="w-4 h-4 text-neutral-400" />
            </button>
          ))}
        </div>
      </div>

      {/* Recent Orders List */}
      <div className="rounded-3xl p-6 bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm">
        <h3 className="font-black text-lg mb-4 text-neutral-900 dark:text-white">Recent Orders</h3>
        <div className="space-y-2.5">
          {(tables.recentOrders || []).map((o) => {
            const ord = o as { _id: string; orderNo?: string; total?: number; orderStatus?: string; paymentStatus?: string; createdAt?: string; userId?: { name?: string; email?: string } | null };
            return (
              <div key={ord._id} className="flex items-center justify-between flex-wrap gap-3 p-4 rounded-2xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FFF0F5] dark:bg-[#2A0A17] border border-brand-pink/20 flex items-center justify-center font-black text-brand-pink text-[10px]">
                    {(ord.orderNo || 'ORD').slice(0, 3).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-black text-sm text-neutral-900 dark:text-white">#{ord.orderNo}</div>
                    <div className="text-[11px] font-bold text-neutral-400">{ord.userId?.name || 'Guest'} · {ord.userId?.email || ''}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-neutral-500">{ord.paymentStatus || '—'} / {ord.orderStatus || '—'}</span>
                  <span className="font-heading font-black text-brand-pink">{formatPrice(ord.total)}</span>
                </div>
              </div>
            );
          })}
          {!tables.recentOrders?.length && <Empty title="No recent orders" />}
        </div>
      </div>
    </div>
  );
}
