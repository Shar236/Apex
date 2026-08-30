'use client';

import { useEffect, useState } from 'react';
import { Bell, RefreshCw, X, CheckCircle2 } from 'lucide-react';
import { adminApi } from '@/lib/api';

export interface AdminNotification {
  id?: string;
  type?: string;
  severity?: string;
  title?: string;
  message?: string;
  timestamp?: string;
  data?: {
    codeMasked?: string;
    voucherType?: string;
    customerEmail?: string;
    [key: string]: unknown;
  };
}

interface NotificationsData {
  data?: AdminNotification[];
  counts?: {
    total?: number;
    critical?: number;
    sales?: number;
    stockAlerts?: number;
    voucherRequests?: number;
  };
}

/**
 * Real-time admin notification feed — polls the live backend /api/admin/notifications
 * (real sold vouchers, stock alerts, mismatch events, voucher requests). Voucher codes
 * are masked server-side; nothing fake is generated here.
 */
export function useAdminNotifications() {
  const [notificationsData, setNotificationsData] = useState<NotificationsData>({ data: [], counts: {} });
  const [notifLoading, setNotifLoading] = useState(false);

  const loadNotifications = async () => {
    setNotifLoading(true);
    try {
      const res = await adminApi.notifications();
      if (res?.success) {
        setNotificationsData(res as unknown as NotificationsData);
      }
    } catch {
      // silent — the feed refreshes again shortly
    } finally {
      setNotifLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    const timer = setInterval(loadNotifications, 15000);
    return () => clearInterval(timer);
  }, []);

  return { notificationsData, notifLoading, loadNotifications };
}

export function NotificationsDrawer({
  open,
  onClose,
  data,
  loading,
  onRefresh,
}: {
  open: boolean;
  onClose: () => void;
  data: NotificationsData;
  loading: boolean;
  onRefresh: () => void;
}) {
  const items = data?.data || [];
  const counts = data?.counts || {};

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white dark:bg-[#141414] w-full max-w-md h-full shadow-2xl border-l border-neutral-200 dark:border-[#262626] flex flex-col">
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
            <button onClick={onRefresh} className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-[#222]">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-[#222]">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-50" />
              <div className="font-black text-sm text-neutral-600 dark:text-neutral-400">All systems normal</div>
              <div className="text-xs text-neutral-400 font-semibold">No recent alerts or pending mismatch events</div>
            </div>
          ) : (
            items.map((n, idx) => (
              <div
                key={n.id || idx}
                className={`p-4 rounded-2xl border transition-all ${
                  n.severity === 'critical' || n.type === 'MISMATCH_BLOCKED'
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60'
                    : n.type === 'OUT_OF_STOCK'
                    ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40'
                    : n.type === 'LOW_STOCK' || n.type === 'VOUCHER_REQUEST'
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/40'
                    : 'bg-emerald-50/60 dark:bg-[#161f1a] border-emerald-200 dark:border-emerald-900/40'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="font-black text-xs flex items-center gap-1.5">{n.title}</span>
                  <span className="text-[10px] font-mono text-neutral-400">
                    {n.timestamp ? new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
                <p className="text-xs font-semibold leading-relaxed text-neutral-800 dark:text-neutral-200 mb-2">{n.message}</p>

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

        <div className="p-4 border-t border-neutral-200 dark:border-[#262626] flex items-center justify-between text-[10px] font-bold text-neutral-400">
          <span>{counts.total || 0} events · {counts.critical || 0} critical</span>
          <span>Auto-refreshes every 15s</span>
        </div>
      </div>
    </div>
  );
}
