'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useTheme } from '@/components/theme-provider';
import { formatPrice } from '@/lib/api';

/**
 * Dashboard analytics charts.
 *
 * Every series comes from the existing `/api/admin/dashboard` response
 * (`charts.dailyRevenue`, `charts.dailyVouchersSold`, `charts.dailyNewCustomers`),
 * which already honours the 7d / 30d / 90d `period` parameter — no new endpoint
 * and no second request. Nothing here is hardcoded or sampled: an empty series
 * renders an empty state rather than invented data.
 */

export interface RevenuePoint { _id: string; revenue: number; orders: number }
export interface CountPoint { _id: string; vouchers?: number; customers?: number }

const PALETTE = {
  accent: '#FF005C',
  violet: '#6C3CE0',
  emerald: '#12B76A',
  sky: '#0EA5E9',
};

/** Merge the three series onto one date axis so they share an x-scale. */
const useSeries = (revenue: RevenuePoint[], vouchers: CountPoint[], customers: CountPoint[]) =>
  useMemo(() => {
    const byDate = new Map<string, { date: string; revenue: number; orders: number; vouchers: number; customers: number }>();
    const touch = (d: string) => {
      if (!byDate.has(d)) byDate.set(d, { date: d, revenue: 0, orders: 0, vouchers: 0, customers: 0 });
      return byDate.get(d)!;
    };
    for (const r of revenue || []) {
      const row = touch(r._id);
      row.revenue = r.revenue || 0;
      row.orders = r.orders || 0;
    }
    for (const v of vouchers || []) touch(v._id).vouchers = v.vouchers || 0;
    for (const c of customers || []) touch(c._id).customers = c.customers || 0;
    return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
  }, [revenue, vouchers, customers]);

const shortDate = (d: string) => (d || '').slice(5).replace('-', '/');

const CHART_HEIGHT = 224; // matches the h-56 slot

/**
 * Measures the chart slot and hands Recharts explicit pixel dimensions.
 *
 * Recharts' own `ResponsiveContainer` measures once on mount and, in this admin
 * console, a section mounts while its tab is still laying out — so it read a
 * width of 0 and never drew anything. Observing the element ourselves means the
 * chart appears as soon as the slot has a real width, and follows it on resize.
 */
function useMeasuredWidth<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(0);

  const measure = useCallback(() => {
    const w = ref.current?.getBoundingClientRect().width ?? 0;
    setWidth((prev) => (Math.abs(prev - w) > 1 ? w : prev));
  }, []);

  useEffect(() => {
    measure();
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);

  return { ref, width };
}

function ChartCard({
  title,
  subtitle,
  children,
  empty,
}: {
  title: string;
  subtitle: string;
  children: (width: number) => React.ReactNode;
  empty: boolean;
}) {
  const { ref, width } = useMeasuredWidth<HTMLDivElement>();
  return (
    <section className="rounded-3xl border border-[#EAEAEA] dark:border-[#292929] bg-white dark:bg-[#161616] p-5 shadow-sm">
      <header className="mb-4">
        <h3 className="font-heading text-base font-black text-neutral-900 dark:text-white">{title}</h3>
        <p className="text-[11px] font-bold text-neutral-500 dark:text-[#B5B5B5]">{subtitle}</p>
      </header>
      {empty ? (
        <div className="flex h-56 items-center justify-center rounded-2xl border border-dashed border-[#EAEAEA] dark:border-[#292929] text-xs font-bold text-neutral-400">
          No data recorded in this period.
        </div>
      ) : (
        <div ref={ref} className="h-56 w-full overflow-hidden">
          {width > 0 && children(width)}
        </div>
      )}
    </section>
  );
}

export function DashboardCharts({
  dailyRevenue = [],
  dailyVouchersSold = [],
  dailyNewCustomers = [],
  period,
  loading,
}: {
  dailyRevenue?: RevenuePoint[];
  dailyVouchersSold?: CountPoint[];
  dailyNewCustomers?: CountPoint[];
  period: string;
  loading?: boolean;
}) {
  const { isDark } = useTheme();
  const data = useSeries(dailyRevenue, dailyVouchersSold, dailyNewCustomers);

  const grid = isDark ? '#292929' : '#EAEAEA';
  const axis = isDark ? '#8A8A8A' : '#94A3B8';
  const tooltipStyle = {
    background: isDark ? '#0E0E0E' : '#FFFFFF',
    border: `1px solid ${grid}`,
    borderRadius: 14,
    fontSize: 12,
    fontWeight: 700,
    color: isDark ? '#F5F7FC' : '#0B1020',
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className={`h-80 animate-pulse rounded-3xl border border-[#EAEAEA] bg-white dark:border-[#292929] dark:bg-[#161616] motion-reduce:animate-none ${i === 0 ? 'xl:col-span-2' : ''}`}
          />
        ))}
      </div>
    );
  }

  const noRevenue = data.every((d) => !d.revenue);
  const noOrders = data.every((d) => !d.orders);
  const noVouchers = data.every((d) => !d.vouchers && !d.customers);

  const axisProps = {
    stroke: axis,
    tickLine: false,
    axisLine: false,
    tick: { fontSize: 10, fontWeight: 700 },
  };

  // 'today' contains a 'd' — the old period.replace('d', ' days') rendered
  // "to days ay". Map the periods explicitly instead.
  const PERIOD_LABELS: Record<string, string> = {
    today: 'today',
    '7d': 'last 7 days',
    '30d': 'last 30 days',
    '90d': 'last 90 days',
  };
  const periodLabel = PERIOD_LABELS[period] || `last ${period}`;

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <div className="xl:col-span-2">
        <ChartCard
          title="Revenue"
          subtitle={`Net paid revenue per day · ${periodLabel}`}
          empty={noRevenue}
        >
          {(w) => (
            <AreaChart width={w} height={CHART_HEIGHT} data={data} margin={{ top: 6, right: 8, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="apexRevenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={PALETTE.accent} stopOpacity={0.32} />
                  <stop offset="100%" stopColor={PALETTE.accent} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={grid} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tickFormatter={shortDate} {...axisProps} />
              <YAxis tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))} {...axisProps} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v) => [formatPrice(Number(v)), 'Revenue']}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke={PALETTE.accent}
                strokeWidth={2}
                fill="url(#apexRevenueFill)"
                isAnimationActive={false}
              />
            </AreaChart>
          )}
        </ChartCard>
      </div>

      <ChartCard title="Orders" subtitle="Paid orders placed per day" empty={noOrders}>
        {(w) => (
          <BarChart width={w} height={CHART_HEIGHT} data={data} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid stroke={grid} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tickFormatter={shortDate} {...axisProps} />
            <YAxis allowDecimals={false} {...axisProps} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => [Number(v), 'Orders']} cursor={{ fill: `${PALETTE.violet}14` }} />
            <Bar dataKey="orders" fill={PALETTE.violet} radius={[6, 6, 0, 0]} isAnimationActive={false} />
          </BarChart>
        )}
      </ChartCard>

      <ChartCard title="Vouchers & customers" subtitle="Codes delivered and new sign-ups per day" empty={noVouchers}>
        {(w) => (
          <LineChart width={w} height={CHART_HEIGHT} data={data} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid stroke={grid} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tickFormatter={shortDate} {...axisProps} />
            <YAxis allowDecimals={false} {...axisProps} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 11, fontWeight: 700 }} />
            <Line
              type="monotone"
              dataKey="vouchers"
              name="Vouchers delivered"
              stroke={PALETTE.emerald}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="customers"
              name="New customers"
              stroke={PALETTE.sky}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        )}
      </ChartCard>
    </div>
  );
}
