import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useVoucher } from '../context/VoucherContext';
import { accountApi, formatPrice, apiBase } from '../lib/api';
import { ApexLogo } from './ApexLogo';
import { PhoneInput } from './PhoneInput';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import {
  Ticket,
  ClipboardList,
  User as UserIcon,
  Package,
  LogOut,
  Crown,
  ArrowRight,
  Copy,
  Check,
  ShieldCheck,
  Send,
  Clock,
  ExternalLink,
  RefreshCw,
  ShoppingBag,
  CheckCircle2,
  TrendingUp,
  Settings,
  Shield,
  Camera,
  X,
  Upload,
  AlertTriangle,
  Mail,
  Phone,
  Calendar,
  Hash,
  Eye,
  EyeOff,
  Loader2,
  ChevronRight,
  Lock,
  Trash2,
  Info,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// ── Tab definitions ───────────────────────────────────────────────────────────

const tabs = [
  { id: 'overview', label: 'Overview', icon: Crown, mobileLabel: 'Overview' },
  { id: 'orders', label: 'My Orders', icon: ClipboardList, mobileLabel: 'Orders' },
  { id: 'vouchers', label: 'My Vouchers', icon: Ticket, mobileLabel: 'Vouchers' },
  { id: 'profile', label: 'Profile', icon: UserIcon, mobileLabel: 'Profile' },
  { id: 'settings', label: 'Account Settings', icon: Settings, mobileLabel: 'Settings' },
  { id: 'security', label: 'Security', icon: Shield, mobileLabel: 'Security' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const statusColor = (s) => {
  const l = String(s || '').toUpperCase();
  if (['ASSIGNED', 'SOLD', 'ACTIVE', 'PAID', 'FULFILLED'].includes(l))
    return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/40';
  if (['USED'].includes(l))
    return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-900/40';
  if (['EXPIRED', 'CANCELLED', 'FAILED', 'REFUNDED'].includes(l))
    return 'bg-neutral-100 text-neutral-500 border-neutral-200 dark:bg-neutral-800/50 dark:text-neutral-400 dark:border-neutral-700';
  if (['REFUND_REQUESTED', 'TRANSFERRED'].includes(l))
    return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/40';
  return 'bg-amber-50 text-amber-700 border-amber-200';
};

const formatDate = (d, includeTime = false) => {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...(includeTime ? { hour: 'numeric', minute: '2-digit' } : {}),
  });
};

const avatarUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${apiBase()}${url}`;
};

// ── Main Component ────────────────────────────────────────────────────────────

export default function AccountHome({ initialTab = 'overview' }) {
  const { user, logout, refreshUser, updateAuthenticatedUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    accountStats,
    accountOrders,
    userVouchers,
    setActiveTab,
    formatPrice,
    transferVoucher,
    markVoucherUsed,
    requestRefund,
    loadAccountData,
    showToast,
  } = useVoucher();

  const [tab, setTab] = useState(initialTab);
  const [copiedId, setCopiedId] = useState(null);
  const [revealedCodes, setRevealedCodes] = useState({});
  const [transferModalId, setTransferModalId] = useState(null);
  const [transferEmail, setTransferEmail] = useState('');
  const [refundConfirmId, setRefundConfirmId] = useState(null);

  // Profile state
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileDataLoading, setProfileDataLoading] = useState(true);
  const [profileLoadError, setProfileLoadError] = useState('');
  const [profileForm, setProfileForm] = useState({ name: '', phone: '', phoneCountry: 'IN' });
  const [profileErrors, setProfileErrors] = useState({});
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarRemoving, setAvatarRemoving] = useState(false);
  const fileInputRef = useRef(null);

  // Email change state
  const [emailChangeOpen, setEmailChangeOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailChangeLoading, setEmailChangeLoading] = useState(false);
  const [emailChangeMessage, setEmailChangeMessage] = useState(null);

  // Password change state
  const [passwordForm, setPasswordForm] = useState({ current: '', newPwd: '', confirm: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);

  // Initialize form from user data
  useEffect(() => {
    if (user) {
      const phone = user.phone || '';
      let phoneCountry = user.phoneCountry || 'IN';
      if (phone) {
        try {
          const parsed = parsePhoneNumberFromString(phone);
          if (parsed?.country) phoneCountry = parsed.country;
        } catch {}
      }
      setProfileForm({ name: user.name || '', phone, phoneCountry });
    }
  }, [user]);

  const loadProfile = useCallback(async () => {
    setProfileDataLoading(true);
    setProfileLoadError('');
    const res = await accountApi.me();
    if (res.success && res.user) {
      updateAuthenticatedUser(res.user);
    } else {
      setProfileLoadError('Unable to load your profile information.');
    }
    setProfileDataLoading(false);
  }, [updateAuthenticatedUser]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Handle emailChanged query param (from email verification redirect)
  useEffect(() => {
    if (searchParams.get('emailChanged') === 'true') {
      setTab('settings');
      showToast?.('✅ Email address updated successfully!');
      refreshUser();
    }
  }, [searchParams]);

  useEffect(() => {
    setActiveTab('dashboard');
    return () => setActiveTab('home');
  }, [setActiveTab]);

  // ── Profile actions ───────────────────────────────────────────────────────

  const profileHasChanges = () => {
    if (!user) return false;
    return profileForm.name !== (user.name || '') || profileForm.phone !== (user.phone || '');
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileErrors({});
    setProfileSuccess(false);
    const errors = {};

    // Name validation
    const name = profileForm.name.trim();
    if (name.length < 2) errors.name = 'Name must be at least 2 characters';
    else if (name.length > 80) errors.name = 'Name must be at most 80 characters';
    else if (!/^[\p{L}\p{M}' \-\.]+$/u.test(name)) errors.name = 'Name contains invalid characters';

    // Phone validation (client-side)
    if (profileForm.phone && profileForm.phone.trim()) {
      try {
        const parsed = parsePhoneNumberFromString(profileForm.phone, profileForm.phoneCountry);
        if (!parsed || !parsed.isValid()) {
          errors.phone = 'Invalid phone number for the selected country';
        }
      } catch {
        errors.phone = 'Could not validate phone number';
      }
    }

    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors);
      return;
    }

    setProfileLoading(true);
    const res = await accountApi.updateProfile({
      name: name,
      phone: profileForm.phone || '',
      phoneCountry: profileForm.phoneCountry,
    });
    setProfileLoading(false);

    if (res.success) {
      updateAuthenticatedUser(res.user);
      setProfileSuccess(true);
      showToast?.('✅ Profile updated successfully');
      loadAccountData();
      setTimeout(() => setProfileSuccess(false), 4000);
    } else {
      if (res.data?.errors) {
        setProfileErrors(res.data.errors);
      } else {
        showToast?.(res.message || 'Failed to update profile');
      }
    }
  };

  // Avatar upload
  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showToast?.('❌ Invalid file type. Use JPG, PNG, or WebP.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast?.('❌ File too large. Maximum size is 5 MB.');
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return;
    setAvatarUploading(true);
    const res = await accountApi.uploadAvatar(avatarFile);
    setAvatarUploading(false);

    if (res.success) {
      updateAuthenticatedUser(res.user);
      showToast?.('✅ Profile picture updated');
      setAvatarFile(null);
      setAvatarPreview(null);
    } else {
      showToast?.(res.message || 'Failed to upload profile picture');
    }
  };

  const removeAvatar = async () => {
    setAvatarRemoving(true);
    const res = await accountApi.removeAvatar();
    setAvatarRemoving(false);

    if (res.success) {
      updateAuthenticatedUser(res.user);
      showToast?.('Profile picture removed');
      setAvatarFile(null);
      setAvatarPreview(null);
    } else {
      showToast?.(res.message || 'Failed to remove profile picture');
    }
  };

  const cancelAvatarPreview = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Email change
  const submitEmailChange = async (e) => {
    e.preventDefault();
    if (!newEmail || !/^\S+@\S+\.\S+$/.test(newEmail)) {
      setEmailChangeMessage({ type: 'error', text: 'Please enter a valid email address' });
      return;
    }
    setEmailChangeLoading(true);
    setEmailChangeMessage(null);
    const res = await accountApi.requestEmailChange(newEmail);
    setEmailChangeLoading(false);

    if (res.success) {
      setEmailChangeMessage({ type: 'success', text: res.message || `Verification email sent to ${newEmail}` });
      setNewEmail('');
    } else {
      setEmailChangeMessage({ type: 'error', text: res.message || 'Failed to send verification email' });
    }
  };

  // Password change
  const submitPasswordChange = async (e) => {
    e.preventDefault();
    setPasswordErrors({});
    setPasswordSuccess(false);
    const errors = {};

    if (!passwordForm.current) errors.current = 'Current password is required';
    if (!passwordForm.newPwd) errors.newPwd = 'New password is required';
    else if (passwordForm.newPwd.length < 6) errors.newPwd = 'Password must be at least 6 characters';
    else if (passwordForm.newPwd.length > 64) errors.newPwd = 'Password must be at most 64 characters';
    if (passwordForm.newPwd !== passwordForm.confirm) errors.confirm = 'Passwords do not match';

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setPasswordLoading(true);
    const res = await accountApi.changePassword(passwordForm.current, passwordForm.newPwd);
    setPasswordLoading(false);

    if (res.success) {
      setPasswordSuccess(true);
      setPasswordForm({ current: '', newPwd: '', confirm: '' });
      showToast?.('✅ Password changed successfully');
      setTimeout(() => setPasswordSuccess(false), 4000);
    } else {
      if (res.code === 'WRONG_PASSWORD' || res.message?.toLowerCase().includes('incorrect')) {
        setPasswordErrors({ current: 'Current password is incorrect' });
      } else {
        showToast?.(res.message || 'Failed to change password');
      }
    }
  };

  // Clipboard & voucher helpers
  const copy = (id, code) => {
    navigator.clipboard?.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const toggleReveal = (id) =>
    setRevealedCodes((p) => ({ ...p, [id]: !p[id] }));

  const submitTransfer = (e) => {
    e.preventDefault();
    if (!transferEmail) return;
    transferVoucher(transferModalId, transferEmail);
    setTransferModalId(null);
    setTransferEmail('');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // ── Stats cards ─────────────────────────────────────────────────────────────

  const stats = [
    {
      label: 'Total Orders', value: accountStats?.totalOrders || 0,
      icon: <ShoppingBag className="w-5 h-5 text-[#FF005C]" strokeWidth={2.3} />,
      bgLight: 'bg-[#FF005C]/10', borderLight: 'border-[#FF005C]/20',
      badge: 'Orders', glow: 'group-hover:shadow-[#FF005C]/10', accentColor: 'text-[#FF005C]',
    },
    {
      label: 'Active Vouchers', value: accountStats?.activeVouchers || 0,
      icon: <Ticket className="w-5 h-5 text-emerald-500" strokeWidth={2.3} />,
      bgLight: 'bg-emerald-500/10', borderLight: 'border-emerald-500/20',
      badge: 'Ready to use', glow: 'group-hover:shadow-emerald-500/10', accentColor: 'text-emerald-500',
    },
    {
      label: 'Used Vouchers', value: accountStats?.usedVouchers || 0,
      icon: <CheckCircle2 className="w-5 h-5 text-sky-500" strokeWidth={2.3} />,
      bgLight: 'bg-sky-500/10', borderLight: 'border-sky-500/20',
      badge: 'Redeemed', glow: 'group-hover:shadow-sky-500/10', accentColor: 'text-sky-500',
    },
    {
      label: 'Expiring Soon', value: accountStats?.expiringSoon || 0,
      icon: <Clock className="w-5 h-5 text-amber-500" strokeWidth={2.3} />,
      bgLight: 'bg-amber-500/10', borderLight: 'border-amber-500/20',
      badge: (accountStats?.expiringSoon || 0) > 0 ? 'Urgent' : 'All valid',
      glow: 'group-hover:shadow-amber-500/10', accentColor: 'text-amber-500',
    },
    {
      label: 'Total Saved', value: formatPrice(accountStats?.totalSaved || 0),
      icon: <TrendingUp className="w-5 h-5 text-indigo-500" strokeWidth={2.3} />,
      bgLight: 'bg-indigo-500/10', borderLight: 'border-indigo-500/20',
      badge: 'Saved', glow: 'group-hover:shadow-indigo-500/10', accentColor: 'text-indigo-500',
    },
  ];

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <section className="py-8 sm:py-12 bg-white dark:bg-[#0A0A0A] min-h-[80vh] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-7">
          <div>
            <button
              onClick={() => { setActiveTab('home'); navigate('/'); }}
              className="flex items-center gap-2 mb-3 text-left focus:outline-none cursor-pointer group"
              aria-label="Go to Apex Vouchers Home"
            >
              <ApexLogo className="h-7" />
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0F5] dark:bg-[#2A0A17] text-[11px] font-black text-[#FF005C] border border-[#FF005C]/20 group-hover:border-[#FF005C]/50 transition-colors">
                <Ticket className="w-3.5 h-3.5" />
                CANDIDATE PORTAL
              </span>
            </button>
            <h1 className="font-heading font-black text-2xl sm:text-3xl tracking-tight text-neutral-900 dark:text-white">
              Hi, {user?.name?.split(' ')[0] || 'Apex User'} 👋
            </h1>
            <p className="text-sm text-neutral-500 dark:text-[#B5B5B5] mt-1">
              Manage your exam vouchers, orders, and account — all in one place.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-[#262626] text-neutral-700 dark:text-neutral-200 text-xs font-black transition hover:bg-neutral-200 dark:hover:bg-neutral-700"
            >
              Browse Vouchers
            </button>
          </div>
        </div>

        {/* Layout: sidebar + content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar (desktop) / Tabs (mobile) */}
          <nav className="lg:w-56 flex-shrink-0">
            {/* Desktop sidebar */}
            <div className="hidden lg:flex flex-col gap-1 sticky top-24">
              {tabs.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all text-left w-full ${
                      tab === t.id
                        ? 'bg-[#FF005C] text-white shadow-lg shadow-[#FF005C]/20'
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-[#1A1A1A] hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-4.5 h-4.5" strokeWidth={2.2} />
                    {t.label}
                  </button>
                );
              })}
              <div className="h-px bg-[#EAEAEA] dark:bg-[#292929] my-2" />
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all text-left w-full"
              >
                <LogOut className="w-4.5 h-4.5" strokeWidth={2.2} />
                Log out
              </button>
            </div>

            {/* Mobile horizontal tabs */}
            <div className="flex lg:hidden gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              {tabs.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-black border whitespace-nowrap transition flex-shrink-0 ${
                      tab === t.id
                        ? 'bg-[#FF005C] text-white border-[#FF005C] shadow-lg'
                        : 'bg-white dark:bg-[#161616] text-neutral-600 dark:text-neutral-300 border-[#EAEAEA] dark:border-[#292929] hover:text-[#FF005C]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" strokeWidth={2.3} />
                    {t.mobileLabel}
                  </button>
                );
              })}
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-black border whitespace-nowrap transition flex-shrink-0 bg-white dark:bg-[#161616] text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/40"
              >
                <LogOut className="w-3.5 h-3.5" strokeWidth={2.3} />
                Logout
              </button>
            </div>
          </nav>

          {/* Content area */}
          <div className="flex-1 min-w-0">
            {/* ── OVERVIEW TAB ──────────────────────────────────────────────── */}
            {tab === 'overview' && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-7">
                  {stats.map((s) => (
                    <div
                      key={s.label}
                      className={`group relative rounded-3xl p-4 sm:p-5 bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] hover:border-neutral-300 dark:hover:border-neutral-700 shadow-sm hover:shadow-xl ${s.glow} transition-all duration-300 flex flex-col justify-between overflow-hidden`}
                    >
                      <div className={`absolute -right-6 -top-6 w-20 h-20 rounded-full ${s.bgLight} blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500`} />
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl ${s.bgLight} border ${s.borderLight} flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-sm`}>
                            {s.icon}
                          </div>
                          <span className={`text-[9px] sm:text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full ${s.bgLight} ${s.accentColor} border ${s.borderLight} hidden sm:inline`}>
                            {s.badge}
                          </span>
                        </div>
                        <div className="text-[11px] sm:text-xs font-bold text-neutral-500 dark:text-[#B5B5B5] tracking-tight">{s.label}</div>
                      </div>
                      <div className="font-heading font-black text-xl sm:text-2xl lg:text-3xl mt-2 tabular-nums text-neutral-900 dark:text-white tracking-tight">
                        {s.value}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2 rounded-3xl p-5 sm:p-6 bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-black text-neutral-900 dark:text-white">Recent Orders</h3>
                      <button onClick={() => setTab('orders')} className="text-xs font-black text-[#FF005C] flex items-center gap-1">
                        View all <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="space-y-3">
                      {accountOrders?.slice(0, 4)?.length === 0 && (
                        <EmptyState icon={<Package className="w-7 h-7 text-neutral-400" />} title="No orders yet" desc="Browse vouchers and place your first discounted exam order." />
                      )}
                      {accountOrders?.slice(0, 4)?.map((o) => (
                        <OrderRow key={o._id} o={o} />
                      ))}
                    </div>
                  </div>
                  <div className="rounded-3xl p-5 sm:p-6 bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-black text-neutral-900 dark:text-white">Voucher Wallet</h3>
                      <button onClick={() => setTab('vouchers')} className="text-xs font-black text-[#FF005C]">See all</button>
                    </div>
                    <div className="space-y-3">
                      {userVouchers?.slice(0, 3)?.length === 0 && (
                        <EmptyState icon={<Ticket className="w-7 h-7 text-neutral-400" />} title="No vouchers yet" desc="Your purchased codes will appear here instantly after payment." />
                      )}
                      {userVouchers?.slice(0, 3)?.map((v) => (
                        <VoucherMini key={v.id} v={v} />
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── ORDERS TAB ────────────────────────────────────────────────── */}
            {tab === 'orders' && (
              <div className="rounded-3xl p-5 sm:p-6 bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm">
                <h3 className="font-black text-xl mb-5 text-neutral-900 dark:text-white">All Orders</h3>
                <div className="space-y-3">
                  {accountOrders?.length === 0 && (
                    <EmptyState icon={<ClipboardList className="w-7 h-7 text-neutral-400" />} title="No orders yet" desc="Place an order and it will appear here." />
                  )}
                  {accountOrders?.map((o) => (
                    <OrderRow key={o._id} o={o} detailed />
                  ))}
                </div>
              </div>
            )}

            {/* ── VOUCHERS TAB ──────────────────────────────────────────────── */}
            {tab === 'vouchers' && (
              <div className="space-y-4">
                {userVouchers?.length === 0 && (
                  <EmptyState icon={<Ticket className="w-7 h-7 text-neutral-400" />} title="Your vault is empty" desc="Buy your first voucher and the code lands here instantly." />
                )}
                {userVouchers?.map((v) => {
                  const isRevealed = revealedCodes[v.id];
                  const isExpired = v.status === 'EXPIRED' || v.daysRemaining <= 0;
                  return (
                    <div key={v.id} className={`rounded-3xl p-5 sm:p-7 bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm ${isExpired ? 'opacity-70' : ''}`}>
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black border ${statusColor(v.status)}`}>
                              {v.status}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-neutral-500 dark:text-[#B5B5B5]">
                              <Clock className="w-3.5 h-3.5" />
                              {v.daysRemaining > 0 ? `${v.daysRemaining} days left` : 'Expired'}
                            </span>
                            {v.transferredTo && <span className="text-[11px] font-bold text-amber-700">Transferred to {v.transferredTo}</span>}
                          </div>
                          <h4 className="font-heading font-black text-lg text-neutral-900 dark:text-white mb-1">{v.productName}</h4>
                          <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs font-bold text-neutral-500 dark:text-[#B5B5B5]">
                            <span>Brand: {v.brand || '—'}</span>
                            <span>Assigned: {new Date(v.assignedAt || v.createdAt).toLocaleDateString()}</span>
                            <span>Expiry: {new Date(v.expiryDate).toLocaleDateString()}</span>
                            {v.orderNo && <span>Order: #{v.orderNo}</span>}
                          </div>

                          <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
                            <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[#F3EEFF] dark:bg-[#1e1638] border border-[#6C3CE0]/20 flex-1 min-w-0">
                              <ShieldCheck className="w-5 h-5 text-[#6C3CE0] flex-shrink-0" />
                              <span className="font-mono font-black tracking-wider text-neutral-900 dark:text-white truncate text-sm">
                                {isRevealed ? v.code : `${v.code?.slice(0, 4) || 'XXXX'}-XXXX-XXXX-XXXX`}
                              </span>
                              <div className="ml-auto flex items-center gap-2 flex-shrink-0">
                                <button onClick={() => toggleReveal(v.id)} className="p-1.5 rounded-lg bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] text-neutral-600 dark:text-neutral-300 text-[10px] font-black">
                                  {isRevealed ? 'HIDE' : 'REVEAL'}
                                </button>
                                <button onClick={() => copy(v.id, v.code)} className="p-2 rounded-lg bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] text-neutral-600 dark:text-neutral-300">
                                  {copiedId === v.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 lg:justify-end">
                          {!['USED', 'EXPIRED', 'CANCELLED', 'REFUNDED'].includes(v.status) && (
                            <>
                              <button onClick={() => markVoucherUsed(v.id)} className="px-3.5 py-2.5 rounded-xl text-xs font-black bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-900/40 flex items-center gap-1.5">
                                <ShieldCheck className="w-4 h-4" /> Mark Used
                              </button>
                              <button onClick={() => setTransferModalId(v.id)} className="px-3.5 py-2.5 rounded-xl text-xs font-black bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40 flex items-center gap-1.5">
                                <Send className="w-4 h-4" /> Transfer
                              </button>
                              <button onClick={() => setRefundConfirmId(v.id)} className="px-3.5 py-2.5 rounded-xl text-xs font-black bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 flex items-center gap-1.5">
                                <RefreshCw className="w-4 h-4" /> Request Refund
                              </button>
                            </>
                          )}
                          <a href="https://pearsonpte.com" target="_blank" rel="noreferrer" className="px-3.5 py-2.5 rounded-xl text-xs font-black bg-[#FF005C] text-white shadow flex items-center gap-1.5">
                            <ExternalLink className="w-4 h-4" /> Redeem on Pearson
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── PROFILE TAB ───────────────────────────────────────────────── */}
            {tab === 'profile' && (
              <>
                {profileDataLoading && (
                  <div className="max-w-3xl rounded-3xl p-8 bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm">
                    <div className="animate-pulse space-y-4">
                      <div className="h-7 w-44 rounded-lg bg-neutral-200 dark:bg-neutral-800" />
                      <div className="h-4 w-64 rounded bg-neutral-200 dark:bg-neutral-800" />
                      <div className="h-24 rounded-2xl bg-neutral-100 dark:bg-neutral-900" />
                    </div>
                    <p className="mt-5 text-sm font-bold text-neutral-500 dark:text-neutral-400">Loading profile...</p>
                  </div>
                )}
                {profileLoadError && !profileDataLoading && (
                  <div className="max-w-3xl rounded-3xl p-8 bg-white dark:bg-[#161616] border border-rose-200 dark:border-rose-900/50 shadow-sm">
                    <p className="text-sm font-bold text-rose-600 dark:text-rose-400">{profileLoadError}</p>
                    <button type="button" onClick={loadProfile} className="mt-4 btn-pink text-white px-4 py-2.5 rounded-xl text-sm font-black">
                      Try Again
                    </button>
                  </div>
                )}
                <div className={`space-y-6 max-w-3xl ${profileDataLoading || profileLoadError ? 'hidden' : ''}`}>
                {/* Profile card header */}
                <div className="rounded-3xl p-5 sm:p-7 bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                    {/* Avatar */}
                    <div className="relative group flex-shrink-0">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl border-2 border-[#EAEAEA] dark:border-[#292929] overflow-hidden bg-neutral-100 dark:bg-[#1A1A1A] flex items-center justify-center">
                        {avatarPreview ? (
                          <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : user?.profileImageUrl ? (
                          <img src={avatarUrl(user.profileImageUrl)} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-4xl font-black text-neutral-300 dark:text-neutral-600 select-none">
                            {(user?.name?.[0] || 'A').toUpperCase()}
                          </span>
                        )}
                      </div>
                      {/* Overlay */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 rounded-3xl bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-all cursor-pointer"
                      >
                        <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleAvatarSelect}
                        className="hidden"
                      />
                    </div>

                    <div className="flex-1 text-center sm:text-left">
                      <h2 className="font-heading font-black text-xl sm:text-2xl text-neutral-900 dark:text-white">{user?.name || 'Apex User'}</h2>
                      <p className="text-sm font-bold text-neutral-500 dark:text-[#B5B5B5] mt-0.5">{user?.email}</p>
                      <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                        {user?.emailVerified && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40">
                            <Check className="w-3 h-3" /> Email verified
                          </span>
                        )}
                        {user?.phone && (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border ${
                            user?.phoneVerified
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40'
                              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/40'
                          }`}>
                            {user?.phoneVerified ? <Check className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                            {user?.phoneVerified ? 'Phone verified' : 'Phone not verified'}
                          </span>
                        )}
                      </div>

                      {/* Avatar action buttons */}
                      <div className="flex flex-wrap gap-2 mt-4 justify-center sm:justify-start">
                        {avatarPreview ? (
                          <>
                            <button
                              onClick={uploadAvatar}
                              disabled={avatarUploading}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-[#FF005C] text-white shadow disabled:opacity-60"
                            >
                              {avatarUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                              {avatarUploading ? 'Uploading...' : 'Save Photo'}
                            </button>
                            <button onClick={cancelAvatarPreview} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-neutral-100 dark:bg-[#262626] text-neutral-700 dark:text-neutral-300">
                              <X className="w-3.5 h-3.5" /> Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-neutral-100 dark:bg-[#262626] text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
                            >
                              <Camera className="w-3.5 h-3.5" /> Change Photo
                            </button>
                            {user?.profileImageUrl && (
                              <button
                                onClick={removeAvatar}
                                disabled={avatarRemoving}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition disabled:opacity-60"
                              >
                                {avatarRemoving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                Remove
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Personal information form */}
                <div className="rounded-3xl p-5 sm:p-7 bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm">
                  <h3 className="font-black text-lg mb-5 text-neutral-900 dark:text-white flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-[#FF005C]" />
                    Personal Information
                  </h3>

                  <form onSubmit={saveProfile} className="space-y-5">
                    <Field
                      label="Full Name"
                      value={profileForm.name}
                      onChange={(e) => { setProfileForm({ ...profileForm, name: e.target.value }); setProfileErrors({ ...profileErrors, name: null }); }}
                      required
                      error={profileErrors.name}
                      icon={<UserIcon className="w-4 h-4" />}
                    />

                    <div>
                      <label className="block">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-500 dark:text-[#B5B5B5] mb-2 block flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5" />
                          Email Address
                        </span>
                        <div className="flex items-center gap-2">
                          <input
                            type="email"
                            value={user?.email || ''}
                            disabled
                            className="flex-1 px-4 py-3 bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] rounded-2xl text-neutral-900 dark:text-white text-sm font-bold opacity-60 cursor-not-allowed"
                          />
                          {user?.emailVerified && (
                            <span className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 flex-shrink-0">
                              <Check className="w-3 h-3" /> Verified
                            </span>
                          )}
                        </div>
                      </label>
                      <button
                        type="button"
                        onClick={() => setEmailChangeOpen(!emailChangeOpen)}
                        className="mt-2 text-xs font-black text-[#FF005C] hover:underline flex items-center gap-1"
                      >
                        <Mail className="w-3 h-3" /> Change Email Address
                        <ChevronRight className={`w-3 h-3 transition-transform ${emailChangeOpen ? 'rotate-90' : ''}`} />
                      </button>

                      {/* Email change form */}
                      {emailChangeOpen && (
                        <div className="mt-3 p-4 rounded-2xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929]">
                          <p className="text-xs font-bold text-neutral-500 dark:text-[#B5B5B5] mb-3">
                            A verification link will be sent to the new email. Your email will only be updated after you verify it.
                          </p>
                          <form onSubmit={submitEmailChange} className="flex flex-col sm:flex-row gap-2">
                            <input
                              type="email"
                              value={newEmail}
                              onChange={(e) => setNewEmail(e.target.value)}
                              placeholder="new@email.com"
                              className="flex-1 px-4 py-2.5 bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] rounded-xl text-neutral-900 dark:text-white text-sm font-bold focus:border-[#FF005C] focus:outline-none focus:ring-2 focus:ring-[#FF005C]/20"
                              required
                            />
                            <button
                              type="submit"
                              disabled={emailChangeLoading}
                              className="px-4 py-2.5 rounded-xl btn-pink text-white text-xs font-black disabled:opacity-60 whitespace-nowrap"
                            >
                              {emailChangeLoading ? 'Sending...' : 'Send Verification'}
                            </button>
                          </form>
                          {emailChangeMessage && (
                            <p className={`mt-2 text-xs font-bold ${emailChangeMessage.type === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                              {emailChangeMessage.type === 'success' ? '✓' : '✗'} {emailChangeMessage.text}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-500 dark:text-[#B5B5B5] mb-2 block flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" />
                        Phone Number
                      </span>
                      <PhoneInput
                        value={profileForm.phone}
                        country={profileForm.phoneCountry}
                        onChange={(phone, country) => {
                          setProfileForm({ ...profileForm, phone, phoneCountry: country });
                          setProfileErrors({ ...profileErrors, phone: null });
                        }}
                        onCountryChange={(country) => setProfileForm(prev => ({ ...prev, phoneCountry: country }))}
                        error={profileErrors.phone}
                      />
                      {user?.phone && (
                        <div className="mt-1.5">
                          {user.phoneVerified ? (
                            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              <Check className="w-3 h-3" /> Verified
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Not verified
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Passport name reminder */}
                    <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 flex gap-3">
                      <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-black text-amber-800 dark:text-amber-300 mb-0.5">Government ID Match Required</p>
                        <p className="text-xs font-bold text-amber-700 dark:text-amber-400/80">
                          Pearson and other exam providers require the name on your exam booking to exactly match your government-issued photo ID (passport, national ID, etc.).
                        </p>
                      </div>
                    </div>

                    {/* Save button */}
                    <div className="flex items-center gap-3 pt-1">
                      <button
                        type="submit"
                        disabled={profileLoading || !profileHasChanges()}
                        className="btn-pink text-white px-6 py-3 rounded-2xl font-black shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {profileLoading ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                        ) : (
                          'Save Changes'
                        )}
                      </button>
                      {profileSuccess && (
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-in fade-in slide-in-from-left-2">
                          <CheckCircle2 className="w-4 h-4" /> Profile updated successfully
                        </span>
                      )}
                    </div>
                  </form>
                </div>
                </div>
              </>
            )}

            {/* ── ACCOUNT SETTINGS TAB ──────────────────────────────────────── */}
            {tab === 'settings' && (
              <div className="space-y-6 max-w-3xl">
                {/* Account information card */}
                <div className="rounded-3xl p-5 sm:p-7 bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm">
                  <h3 className="font-black text-lg mb-5 text-neutral-900 dark:text-white flex items-center gap-2">
                    <Settings className="w-5 h-5 text-[#FF005C]" />
                    Account Information
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InfoItem icon={<Hash className="w-4 h-4" />} label="Account ID" value={user?._id || user?.id || '—'} mono />
                    <InfoItem icon={<Mail className="w-4 h-4" />} label="Email" value={user?.email || '—'} />
                    <InfoItem icon={<Calendar className="w-4 h-4" />} label="Member Since" value={formatDate(user?.createdAt)} />
                    <InfoItem
                      icon={<Mail className="w-4 h-4" />}
                      label="Email Status"
                      value={user?.emailVerified ? '✓ Verified' : 'Not verified'}
                      valueClass={user?.emailVerified ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}
                    />
                    <InfoItem
                      icon={<Phone className="w-4 h-4" />}
                      label="Phone Status"
                      value={user?.phone ? (user?.phoneVerified ? '✓ Verified' : '⚠ Not verified') : 'Not provided'}
                      valueClass={user?.phoneVerified ? 'text-emerald-600 dark:text-emerald-400' : user?.phone ? 'text-amber-600 dark:text-amber-400' : ''}
                    />
                    <InfoItem icon={<Clock className="w-4 h-4" />} label="Last Updated" value={formatDate(user?.updatedAt, true)} />
                  </div>
                </div>

                {/* Quick actions */}
                <div className="rounded-3xl p-5 sm:p-7 bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm">
                  <h3 className="font-black text-lg mb-4 text-neutral-900 dark:text-white">Quick Actions</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <QuickAction icon={<UserIcon className="w-5 h-5" />} label="Edit Profile" desc="Update your name, phone, and photo" onClick={() => setTab('profile')} />
                    <QuickAction icon={<Shield className="w-5 h-5" />} label="Change Password" desc="Update your account password" onClick={() => setTab('security')} />
                    <QuickAction icon={<Ticket className="w-5 h-5" />} label="My Vouchers" desc="View and manage your voucher codes" onClick={() => setTab('vouchers')} />
                    <QuickAction icon={<ClipboardList className="w-5 h-5" />} label="Order History" desc="View all your past orders" onClick={() => setTab('orders')} />
                  </div>
                </div>
              </div>
            )}

            {/* ── SECURITY TAB ──────────────────────────────────────────────── */}
            {tab === 'security' && (
              <div className="space-y-6 max-w-2xl">
                <div className="rounded-3xl p-5 sm:p-7 bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm">
                  <h3 className="font-black text-lg mb-5 text-neutral-900 dark:text-white flex items-center gap-2">
                    <Lock className="w-5 h-5 text-[#FF005C]" />
                    Change Password
                  </h3>

                  <form onSubmit={submitPasswordChange} className="space-y-4">
                    <PasswordField
                      label="Current Password"
                      value={passwordForm.current}
                      onChange={(e) => { setPasswordForm({ ...passwordForm, current: e.target.value }); setPasswordErrors({ ...passwordErrors, current: null }); }}
                      show={showCurrentPwd}
                      onToggle={() => setShowCurrentPwd(!showCurrentPwd)}
                      error={passwordErrors.current}
                      placeholder="Enter your current password"
                    />

                    <PasswordField
                      label="New Password"
                      value={passwordForm.newPwd}
                      onChange={(e) => { setPasswordForm({ ...passwordForm, newPwd: e.target.value }); setPasswordErrors({ ...passwordErrors, newPwd: null }); }}
                      show={showNewPwd}
                      onToggle={() => setShowNewPwd(!showNewPwd)}
                      error={passwordErrors.newPwd}
                      placeholder="Minimum 6 characters"
                    />

                    <Field
                      label="Confirm New Password"
                      type="password"
                      value={passwordForm.confirm}
                      onChange={(e) => { setPasswordForm({ ...passwordForm, confirm: e.target.value }); setPasswordErrors({ ...passwordErrors, confirm: null }); }}
                      error={passwordErrors.confirm}
                      placeholder="Re-enter new password"
                      icon={<Lock className="w-4 h-4" />}
                    />

                    <div className="flex items-center gap-3 pt-1">
                      <button
                        type="submit"
                        disabled={passwordLoading || (!passwordForm.current && !passwordForm.newPwd)}
                        className="btn-pink text-white px-6 py-3 rounded-2xl font-black shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {passwordLoading ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</>
                        ) : (
                          <><Shield className="w-4 h-4" /> Update Password</>
                        )}
                      </button>
                      {passwordSuccess && (
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-in fade-in slide-in-from-left-2">
                          <CheckCircle2 className="w-4 h-4" /> Password changed
                        </span>
                      )}
                    </div>
                  </form>
                </div>

                {/* Security info */}
                <div className="rounded-3xl p-5 sm:p-7 bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929]">
                  <h4 className="font-black text-sm text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#FF005C]" />
                    Security Tips
                  </h4>
                  <ul className="space-y-2 text-xs font-bold text-neutral-500 dark:text-neutral-400">
                    <li className="flex items-start gap-2"><span className="text-[#FF005C] mt-0.5">•</span> Use a strong, unique password for your Apex Vouchers account</li>
                    <li className="flex items-start gap-2"><span className="text-[#FF005C] mt-0.5">•</span> Never share your voucher codes or account credentials</li>
                    <li className="flex items-start gap-2"><span className="text-[#FF005C] mt-0.5">•</span> Keep your phone number and email up to date for order notifications</li>
                    <li className="flex items-start gap-2"><span className="text-[#FF005C] mt-0.5">•</span> Contact support if you notice any unauthorized activity</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Modals ────────────────────────────────────────────────────────── */}

        {transferModalId && (
          <Modal onClose={() => setTransferModalId(null)} title="Transfer Voucher">
            <p className="text-sm text-neutral-500 dark:text-[#B5B5B5] mb-4">Enter the recipient's email. Transfers are logged for security.</p>
            <form onSubmit={submitTransfer} className="space-y-4">
              <Field label="Recipient email" type="email" value={transferEmail} onChange={(e) => setTransferEmail(e.target.value)} required placeholder="friend@example.com" icon={<Mail className="w-4 h-4" />} />
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setTransferModalId(null)} className="px-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-[#262626] text-neutral-700 dark:text-neutral-200 text-xs font-black">Cancel</button>
                <button className="btn-pink text-white px-5 py-2.5 rounded-xl text-xs font-black">Confirm transfer</button>
              </div>
            </form>
          </Modal>
        )}

        {refundConfirmId && (
          <Modal onClose={() => setRefundConfirmId(null)} title="Request Refund">
            <p className="text-sm text-neutral-500 dark:text-[#B5B5B5] mb-4">
              Unused vouchers qualify for 100% refund within 7 days, 80% within 30 days, 50% within 90 days.
            </p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setRefundConfirmId(null)} className="px-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-[#262626] text-neutral-700 dark:text-neutral-200 text-xs font-black">Cancel</button>
              <button
                onClick={() => { requestRefund(refundConfirmId); setRefundConfirmId(null); }}
                className="btn-pink text-white px-5 py-2.5 rounded-xl text-xs font-black"
              >Confirm request</button>
            </div>
          </Modal>
        )}
      </div>
    </section>
  );
}

// ── Shared Components ─────────────────────────────────────────────────────────

function Field({ label, value, onChange, type = 'text', disabled, placeholder, required, error, icon }) {
  return (
    <label className="block">
      <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-500 dark:text-[#B5B5B5] mb-2 block flex items-center gap-1.5">
        {icon}
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        required={required}
        className={`w-full px-4 py-3 bg-neutral-50 dark:bg-[#0E0E0E] border rounded-2xl text-neutral-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#FF005C]/20 disabled:opacity-60 transition-colors ${
          error ? 'border-rose-400 dark:border-rose-500 focus:border-rose-400' : 'border-[#EAEAEA] dark:border-[#292929] focus:border-[#FF005C]'
        }`}
      />
      {error && <p className="mt-1.5 text-xs font-bold text-rose-500">{error}</p>}
    </label>
  );
}

function PasswordField({ label, value, onChange, show, onToggle, error, placeholder }) {
  return (
    <label className="block">
      <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-500 dark:text-[#B5B5B5] mb-2 block flex items-center gap-1.5">
        <Lock className="w-3.5 h-3.5" />
        {label}
      </span>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full px-4 py-3 pr-12 bg-neutral-50 dark:bg-[#0E0E0E] border rounded-2xl text-neutral-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#FF005C]/20 transition-colors ${
            error ? 'border-rose-400 dark:border-rose-500 focus:border-rose-400' : 'border-[#EAEAEA] dark:border-[#292929] focus:border-[#FF005C]'
          }`}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && <p className="mt-1.5 text-xs font-bold text-rose-500">{error}</p>}
    </label>
  );
}

function InfoItem({ icon, label, value, mono = false, valueClass = '' }) {
  return (
    <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929]">
      <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-neutral-500 dark:text-[#B5B5B5] mb-1.5">
        {icon}
        {label}
      </div>
      <div className={`text-sm font-bold text-neutral-900 dark:text-white ${mono ? 'font-mono tracking-wider' : ''} ${valueClass}`}>
        {value}
      </div>
    </div>
  );
}

function QuickAction({ icon, label, desc, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 p-4 rounded-2xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] hover:border-[#FF005C]/40 hover:bg-[#FFF0F5] dark:hover:bg-[#2A0A17] transition-all text-left group w-full"
    >
      <div className="w-10 h-10 rounded-2xl bg-[#FF005C]/10 border border-[#FF005C]/20 flex items-center justify-center text-[#FF005C] group-hover:scale-110 transition-transform flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-black text-sm text-neutral-900 dark:text-white">{label}</div>
        <div className="text-xs font-bold text-neutral-500 dark:text-[#B5B5B5]">{desc}</div>
      </div>
      <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-[#FF005C] transition flex-shrink-0" />
    </button>
  );
}

function OrderRow({ o, detailed = false }) {
  const items = o.items || [];
  return (
    <div className="rounded-2xl p-4 bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div>
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="font-black text-neutral-900 dark:text-white text-sm">#{o.orderNo}</span>
          <span className={`px-2 py-0.5 rounded-full border text-[10px] font-black ${statusColor(o.orderStatus)}`}>{o.orderStatus}</span>
          <span className={`px-2 py-0.5 rounded-full border text-[10px] font-black ${statusColor(o.paymentStatus)}`}>{o.paymentStatus}</span>
        </div>
        <div className="text-xs font-bold text-neutral-500 dark:text-[#B5B5B5]">
          {new Date(o.createdAt).toLocaleString()} · {items.length} {items.length === 1 ? 'item' : 'items'}
          {detailed && o.billingDetails?.email && <> · {o.billingDetails.email}</>}
        </div>
      </div>
      <div className="text-right">
        <div className="font-heading font-black text-lg text-neutral-900 dark:text-white tabular-nums">{formatPrice(o.total)}</div>
        {detailed && o.promoCode && <div className="text-[10px] font-black text-[#FF005C]">Promo: {o.promoCode}</div>}
      </div>
    </div>
  );
}

function VoucherMini({ v }) {
  return (
    <div className="rounded-2xl p-4 bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929]">
      <div className="flex items-center justify-between mb-1.5">
        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-black ${statusColor(v.status)}`}>{v.status}</span>
        <span className="text-[10px] font-black text-neutral-500 dark:text-[#B5B5B5]">{v.daysRemaining}d left</span>
      </div>
      <div className="font-black text-sm text-neutral-900 dark:text-white truncate">{v.productName}</div>
      <div className="font-mono text-[11px] font-bold text-[#6C3CE0] mt-0.5">{v.code?.slice(0, 12) || 'XXXX-XXXX-XX'}…</div>
    </div>
  );
}

function EmptyState({ icon, title, desc }) {
  return (
    <div className="text-center py-10 rounded-2xl border border-dashed border-[#EAEAEA] dark:border-[#292929]">
      <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-neutral-100 dark:bg-[#262626] flex items-center justify-center">{icon}</div>
      <div className="font-black text-neutral-900 dark:text-white">{title}</div>
      <div className="text-xs font-bold text-neutral-500 dark:text-[#B5B5B5] mt-1 max-w-sm mx-auto">{desc}</div>
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-3xl bg-white dark:bg-[#161616] p-7 border border-[#EAEAEA] dark:border-[#292929] shadow-2xl text-neutral-900 dark:text-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-lg">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-xl bg-neutral-100 dark:bg-[#262626] text-neutral-600 dark:text-neutral-200 text-xs font-black">Close</button>
        </div>
        {children}
      </div>
    </div>
  );
}
