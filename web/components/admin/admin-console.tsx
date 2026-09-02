'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard, Package, Ticket, Users, ShoppingCart, Tag, Clock, CalendarCheck, Search as SearchIcon, LogOut, Bell, Crown, ArrowLeft, Film, Megaphone, PencilRuler, ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { ApexLogo } from '@/components/apex-logo';
import { AdminGuard } from '@/components/admin/admin-guard';
import { Dashboard } from '@/components/admin/dashboard';
import { OrdersAdmin } from '@/components/admin/orders';
import { ProductsAdmin } from '@/components/admin/products';
import { VouchersAdmin } from '@/components/admin/vouchers';
import { UsersAdmin } from '@/components/admin/users';
import { FulfillmentsAdmin } from '@/components/admin/fulfillments';
import { VoucherRequestsAdmin } from '@/components/admin/voucher-requests';
import { PTEBookingsAdmin } from '@/components/admin/pte-bookings';
import { PromotionsAdmin } from '@/components/admin/promotions';
import { AuditLogsAdmin } from '@/components/admin/audit-logs';
import { NotificationsDrawer, NotificationToasts, useAdminNotifications } from '@/components/admin/notifications';
import { SEOManager } from '@/components/admin/seo-manager';
import { VideosAdmin } from '@/components/admin/videos-admin';
import { AwardsAdmin } from '@/components/admin/awards-admin';
import { WebsiteCMSAdmin } from '@/components/admin/website-cms-admin';
import { BlogAdmin } from '@/components/admin/blog-admin';
import { AdminSecurity } from '@/components/admin/admin-security';

const TABS = [
  { id: 'dashboard', label: 'Overview & Analytics', icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'products', label: 'Products & Pricing', icon: <Package className="w-4 h-4" /> },
  { id: 'vouchers', label: 'Voucher Inventory', icon: <Ticket className="w-4 h-4" /> },
  { id: 'orders', label: 'Orders', icon: <ShoppingCart className="w-4 h-4" /> },
  { id: 'voucher-requests', label: 'Voucher Requests', icon: <Ticket className="w-4 h-4" /> },
  { id: 'fulfillments', label: 'Fulfillment Requests', icon: <Clock className="w-4 h-4" /> },
  { id: 'pte-bookings', label: 'PTE Booking Requests', icon: <CalendarCheck className="w-4 h-4" /> },
  { id: 'users', label: 'Customers', icon: <Users className="w-4 h-4" /> },
  { id: 'promotions', label: 'Promo Coupons', icon: <Tag className="w-4 h-4" /> },
  { id: 'blog', label: 'Blog Management', icon: <PencilRuler className="w-4 h-4" /> },
  { id: 'seo', label: 'SEO Manager', icon: <SearchIcon className="w-4 h-4" /> },
  { id: 'videos', label: 'Videos & Reels', icon: <Film className="w-4 h-4" /> },
  { id: 'awards-admin', label: 'Awards', icon: <Crown className="w-4 h-4" /> },
  { id: 'cms', label: 'Website CMS', icon: <Megaphone className="w-4 h-4" /> },
  { id: 'security', label: 'Security & Account', icon: <ShieldCheck className="w-4 h-4" /> },
  { id: 'audit-logs', label: 'Audit Logs', icon: <Clock className="w-4 h-4" /> },
];

export function AdminConsole() {
  const [tab, setTab] = useState('dashboard');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { user, logout } = useAuth();
  const { notificationsData, notifLoading, loadNotifications, toasts, acknowledgeAll, dismissToast } = useAdminNotifications();

  const criticalCount = notificationsData?.counts?.critical || 0;
  const salesCount = notificationsData?.counts?.sales || 0;
  const fulfillmentCount = notificationsData?.counts?.fulfillments || 0;
  const voucherRequestCount = notificationsData?.counts?.voucherRequests || 0;
  const tabBadges: Record<string, number> = {
    'fulfillments': fulfillmentCount,
    'voucher-requests': voucherRequestCount,
  };

  const openNotifications = () => {
    setNotificationsOpen(true);
    loadNotifications();
    acknowledgeAll();
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-[#F3EEFF]/30 dark:bg-[#06070B] text-neutral-900 dark:text-white flex flex-col lg:flex-row transition-colors duration-300">
        <aside className="lg:w-72 lg:min-h-screen bg-white dark:bg-[#101010] border-r border-[#EAEAEA] dark:border-[#222] p-5 lg:sticky lg:top-0 shrink-0 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6 lg:mb-8">
              <ApexLogo className="h-7" />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => (notificationsOpen ? setNotificationsOpen(false) : openNotifications())}
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
                  {tabBadges[t.id] > 0 && (
                    <span className={`ml-auto min-w-5 h-5 px-1.5 rounded-full text-[10px] font-black flex items-center justify-center ${tab === t.id ? 'bg-white text-brand-pink' : 'bg-rose-600 text-white'}`}>
                      {tabBadges[t.id]}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-6 pt-5 border-t border-[#EAEAEA] dark:border-[#292929] space-y-2">
            <Link
              href="/"
              className="w-full inline-flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-neutral-50 dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] text-neutral-700 dark:text-neutral-200 font-black text-xs justify-center hover:border-brand-pink transition"
            >
              <ArrowLeft className="w-4 h-4" /> Back to store
            </Link>
            <button
              onClick={() => { logout(); }}
              className="w-full inline-flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-400 font-black text-xs justify-center"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </aside>

        <main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-350 mx-auto w-full relative">
          <NotificationsDrawer
            open={notificationsOpen}
            onClose={() => setNotificationsOpen(false)}
            data={notificationsData}
            loading={notifLoading}
            onRefresh={loadNotifications}
          />
          <NotificationToasts
            toasts={toasts}
            onOpen={() => { openNotifications(); setTab('fulfillments'); }}
            onDismiss={dismissToast}
          />

          {tab === 'dashboard' && <Dashboard onNavigate={setTab} />}
          {tab === 'products' && <ProductsAdmin onNavigate={setTab} />}
          {tab === 'vouchers' && <VouchersAdmin />}
          {tab === 'orders' && <OrdersAdmin />}
          {tab === 'voucher-requests' && <VoucherRequestsAdmin />}
          {tab === 'fulfillments' && <FulfillmentsAdmin />}
          {tab === 'pte-bookings' && <PTEBookingsAdmin />}
          {tab === 'users' && <UsersAdmin />}
    {tab === 'promotions' && <PromotionsAdmin />}
    {tab === 'blog' && <BlogAdmin />}
    {tab === 'seo' && <SEOManager />}
          {tab === 'videos' && <VideosAdmin />}
          {tab === 'awards-admin' && <AwardsAdmin />}
          {tab === 'cms' && <WebsiteCMSAdmin />}
          {tab === 'security' && <AdminSecurity />}
          {tab === 'audit-logs' && <AuditLogsAdmin />}
        </main>
      </div>
    </AdminGuard>
  );
}
