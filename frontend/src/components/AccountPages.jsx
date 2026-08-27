import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useVoucher } from '../context/VoucherContext';
import { accountApi, pteBookingApi, formatPrice, apiBase } from '../lib/api';
import { validatePasswordStrength as validatePasswordStrengthClient } from '../lib/passwordRules';
import { useResendCountdown } from '../lib/useResendCountdown';
import { ApexLogo } from './ApexLogo';
import { PhoneInput } from './PhoneInput';
import { OtpInput } from './OtpInput';
import { PasswordStrengthChecklist } from './PasswordStrengthChecklist';
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
  Shield,
  Camera,
  X,
  Upload,
  AlertTriangle,
  Mail,
  Phone,
  Calendar,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Trash2,
  Info,
  CalendarCheck,
  MessageCircle,
  HelpCircle,
  RotateCcw,
  PhoneCall,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// ── Tab definitions ───────────────────────────────────────────────────────────

const tabs = [
  { id: 'overview', label: 'Overview', icon: Crown, mobileLabel: 'Overview' },
  { id: 'profile', label: 'Personal Information', icon: UserIcon, mobileLabel: 'Profile' },
  { id: 'orders', label: 'My Orders', icon: ClipboardList, mobileLabel: 'Orders' },
  { id: 'vouchers', label: 'My Vouchers', icon: Ticket, mobileLabel: 'Vouchers' },
  { id: 'pte-bookings', label: 'PTE Booking Requests', icon: CalendarCheck, mobileLabel: 'PTE Requests' },
  { id: 'security', label: 'Security', icon: Shield, mobileLabel: 'Security' },
  { id: 'support', label: 'Support', icon: HelpCircle, mobileLabel: 'Support' },
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

const maskEmailForDisplay = (email) => {
  const value = String(email || '');
  const at = value.indexOf('@');
  if (at <= 1) return value;
  return `${value[0]}***${value.slice(at - 1)}`;
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
    footerSettings,
  } = useVoucher();

  const [tab, setTab] = useState(initialTab);
  const [copiedId, setCopiedId] = useState(null);
  const [revealedCodes, setRevealedCodes] = useState({});
  const [transferModalId, setTransferModalId] = useState(null);
  const [transferEmail, setTransferEmail] = useState('');
  const [refundConfirmId, setRefundConfirmId] = useState(null);

  // PTE booking requests
  const [pteBookings, setPteBookings] = useState([]);
  const [pteBookingsLoading, setPteBookingsLoading] = useState(false);
  const [pteBookingsLoaded, setPteBookingsLoaded] = useState(false);

  // Profile state
  const [profileDataLoading, setProfileDataLoading] = useState(true);
  const [profileLoadError, setProfileLoadError] = useState('');
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileNameError, setProfileNameError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarRemoving, setAvatarRemoving] = useState(false);
  const fileInputRef = useRef(null);

  // Contact (email/phone) OTP change modal
  const [contactModalType, setContactModalType] = useState(null); // 'email' | 'phone' | null

  // Password change state
  const [passwordForm, setPasswordForm] = useState({ current: '', newPwd: '', confirm: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);

  // Initialize form from user data
  useEffect(() => {
    if (user) setProfileName(user.name || '');
  }, [user]);

  const profileDirty = editingProfile && profileName.trim() !== (user?.name || '');

  // Warn before leaving the page with unsaved profile edits
  useEffect(() => {
    if (!profileDirty) return;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [profileDirty]);

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

  useEffect(() => {
    setActiveTab('dashboard');
    return () => setActiveTab('home');
  }, [setActiveTab]);

  useEffect(() => {
    if (tab !== 'pte-bookings' || pteBookingsLoaded) return;
    setPteBookingsLoading(true);
    pteBookingApi.mine().then((res) => {
      if (res.success) setPteBookings(Array.isArray(res.data) ? res.data : []);
      setPteBookingsLoaded(true);
      setPteBookingsLoading(false);
    });
  }, [tab, pteBookingsLoaded]);

  // ── Profile actions ───────────────────────────────────────────────────────

  const startEditProfile = () => {
    setProfileName(user?.name || '');
    setProfileNameError('');
    setEditingProfile(true);
  };

  const discardProfileEdit = () => {
    setProfileName(user?.name || '');
    setProfileNameError('');
    setEditingProfile(false);
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileNameError('');
    setProfileSuccess(false);

    const name = profileName.trim();
    if (name.length < 2) return setProfileNameError('Name must be at least 2 characters');
    if (name.length > 80) return setProfileNameError('Name must be at most 80 characters');
    if (!/^[\p{L}\p{M}' \-\.]+$/u.test(name)) return setProfileNameError('Name contains invalid characters');

    setProfileLoading(true);
    const res = await accountApi.updateProfile({ name });
    setProfileLoading(false);

    if (res.success) {
      updateAuthenticatedUser(res.user);
      setProfileSuccess(true);
      setEditingProfile(false);
      showToast?.('✅ Profile updated successfully');
      loadAccountData();
      setTimeout(() => setProfileSuccess(false), 4000);
    } else {
      setProfileNameError(res.data?.errors?.name || res.message || 'Failed to update profile');
    }
  };

  // Avatar upload
  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

  // Password change
  const submitPasswordChange = async (e) => {
    e.preventDefault();
    setPasswordErrors({});
    setPasswordSuccess(false);
    const errors = {};

    if (!passwordForm.current) errors.current = 'Current password is required';
    const strengthError = validatePasswordStrengthClient(passwordForm.newPwd);
    if (!passwordForm.newPwd) errors.newPwd = 'New password is required';
    else if (strengthError) errors.newPwd = strengthError;
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
      icon: <ShoppingBag className="w-5 h-5 text-brand-pink" strokeWidth={2.3} />,
      bgLight: 'bg-brand-pink/10', borderLight: 'border-brand-pink/20',
      badge: 'Orders', glow: 'group-hover:shadow-brand-pink/10', accentColor: 'text-brand-pink',
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
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0F5] dark:bg-[#2A0A17] text-[11px] font-black text-brand-pink border border-brand-pink/20 group-hover:border-brand-pink/50 transition-colors">
                <Ticket className="w-3.5 h-3.5" />
                CANDIDATE PORTAL
              </span>
            </button>
            <h1 className="font-heading font-black text-2xl sm:text-3xl tracking-tight text-neutral-900 dark:text-white">
              Welcome, {user?.name?.split(' ')[0] || 'Apex User'}
            </h1>
            <p className="text-sm text-neutral-500 dark:text-[#B5B5B5] mt-1">
              Manage your account information, contact details, orders and security.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
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
          <nav className="lg:w-56 shrink-0">
            {/* Desktop sidebar */}
            <div className="hidden lg:flex flex-col gap-1 sticky top-24">
              {tabs.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all text-left w-full cursor-pointer ${
                      tab === t.id
                        ? 'bg-brand-pink text-white shadow-lg shadow-brand-pink/20'
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
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all text-left w-full cursor-pointer"
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
                    className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-black border whitespace-nowrap transition shrink-0 ${
                      tab === t.id
                        ? 'bg-brand-pink text-white border-brand-pink shadow-lg'
                        : 'bg-white dark:bg-[#161616] text-neutral-600 dark:text-neutral-300 border-[#EAEAEA] dark:border-[#292929] hover:text-brand-pink'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" strokeWidth={2.3} />
                    {t.mobileLabel}
                  </button>
                );
              })}
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-black border whitespace-nowrap transition shrink-0 bg-white dark:bg-[#161616] text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/40"
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
                {/* Account info summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
                  <AccountInfoCard
                    icon={<Mail className="w-4.5 h-4.5" />}
                    label="Email Address"
                    value={user?.email || '—'}
                    verified={user?.emailVerified}
                    verifiedLabel="Verified"
                    unverifiedLabel="Not verified"
                  />
                  {user?.phone ? (
                    <AccountInfoCard
                      icon={<Phone className="w-4.5 h-4.5" />}
                      label="Phone Number"
                      value={user.phone}
                      verified={user?.phoneVerified}
                      verifiedLabel="Verified"
                      unverifiedLabel="Not verified"
                    />
                  ) : (
                    <div className="rounded-3xl p-4 sm:p-5 bg-white dark:bg-[#161616] border border-dashed border-[#EAEAEA] dark:border-[#292929] flex flex-col justify-between">
                      <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-neutral-400 mb-2">
                        <Phone className="w-4 h-4" /> Phone Number
                      </div>
                      <p className="text-sm font-bold text-neutral-500 dark:text-neutral-400 mb-3">Phone number not added</p>
                      <button
                        onClick={() => setContactModalType('phone')}
                        className="text-xs font-black text-brand-pink hover:underline text-left cursor-pointer"
                      >
                        + Add Phone Number
                      </button>
                    </div>
                  )}
                  <div className="rounded-3xl p-4 sm:p-5 bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929]">
                    <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-neutral-400 mb-2">
                      <Calendar className="w-4 h-4" /> Member Since
                    </div>
                    <div className="text-sm font-black text-neutral-900 dark:text-white">{formatDate(user?.createdAt)}</div>
                  </div>
                  <div className="rounded-3xl p-4 sm:p-5 bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929]">
                    <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-neutral-400 mb-2">
                      <Clock className="w-4 h-4" /> Last Login
                    </div>
                    <div className="text-sm font-black text-neutral-900 dark:text-white">
                      {user?.lastLoginAt ? formatDate(user.lastLoginAt, true) : 'This session'}
                    </div>
                  </div>
                </div>

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
                      <button onClick={() => setTab('orders')} className="text-xs font-black text-brand-pink flex items-center gap-1 cursor-pointer">
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
                      <button onClick={() => setTab('vouchers')} className="text-xs font-black text-brand-pink cursor-pointer">See all</button>
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
                              <ShieldCheck className="w-5 h-5 text-[#6C3CE0] shrink-0" />
                              <span className="font-mono font-black tracking-wider text-neutral-900 dark:text-white truncate text-sm">
                                {isRevealed ? v.code : `${v.code?.slice(0, 4) || 'XXXX'}-XXXX-XXXX-XXXX`}
                              </span>
                              <div className="ml-auto flex items-center gap-2 shrink-0">
                                <button onClick={() => toggleReveal(v.id)} className="p-1.5 rounded-lg bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] text-neutral-600 dark:text-neutral-300 text-[10px] font-black cursor-pointer">
                                  {isRevealed ? 'HIDE' : 'REVEAL'}
                                </button>
                                <button onClick={() => copy(v.id, v.code)} className="p-2 rounded-lg bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] text-neutral-600 dark:text-neutral-300 cursor-pointer">
                                  {copiedId === v.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 lg:justify-end">
                          {!['USED', 'EXPIRED', 'CANCELLED', 'REFUNDED'].includes(v.status) && (
                            <>
                              <button onClick={() => markVoucherUsed(v.id)} className="px-3.5 py-2.5 rounded-xl text-xs font-black bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-900/40 flex items-center gap-1.5 cursor-pointer">
                                <ShieldCheck className="w-4 h-4" /> Mark Used
                              </button>
                              <button onClick={() => setTransferModalId(v.id)} className="px-3.5 py-2.5 rounded-xl text-xs font-black bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40 flex items-center gap-1.5 cursor-pointer">
                                <Send className="w-4 h-4" /> Transfer
                              </button>
                              <button onClick={() => setRefundConfirmId(v.id)} className="px-3.5 py-2.5 rounded-xl text-xs font-black bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 flex items-center gap-1.5 cursor-pointer">
                                <RefreshCw className="w-4 h-4" /> Request Refund
                              </button>
                            </>
                          )}
                          <a href="https://pearsonpte.com" target="_blank" rel="noreferrer" className="px-3.5 py-2.5 rounded-xl text-xs font-black bg-brand-pink text-white shadow flex items-center gap-1.5">
                            <ExternalLink className="w-4 h-4" /> Redeem on Pearson
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── PTE BOOKING REQUESTS TAB ─────────────────────────────────── */}
            {tab === 'pte-bookings' && (
              <div className="rounded-3xl p-5 sm:p-6 bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                  <div>
                    <h3 className="font-black text-xl text-neutral-900 dark:text-white">PTE Booking Requests</h3>
                    <p className="text-xs font-bold text-neutral-500 dark:text-neutral-400 mt-0.5">
                      Track your booking assistance requests, view status updates, and access official Pearson confirmation details.
                    </p>
                  </div>
                  <button
                    onClick={() => { setActiveTab('exam-booking'); navigate('/exam-booking'); }}
                    className="px-4 py-2.5 rounded-xl bg-[#FFF0F5] dark:bg-[#2A0A17] text-brand-pink hover:bg-[#FFE0EB] text-xs font-black border border-brand-pink/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>+ New Booking Request</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {pteBookingsLoading && (
                    <div className="h-24 bg-neutral-100 dark:bg-[#292929] rounded-2xl animate-pulse" />
                  )}
                  {!pteBookingsLoading && pteBookings.length === 0 && (
                    <EmptyState
                      icon={<CalendarCheck className="w-7 h-7 text-neutral-400" />}
                      title="No booking assistance requests yet"
                      desc="Request PTE exam booking assistance and track your schedule progress here."
                      action={
                        <button
                          onClick={() => { setActiveTab('exam-booking'); navigate('/exam-booking'); }}
                          className="btn-pink py-2.5! px-5! text-xs! font-black"
                        >
                          Request Booking Assistance
                        </button>
                      }
                    />
                  )}
                  {!pteBookingsLoading && pteBookings.map((b) => (
                    <div
                      key={b._id}
                      className="rounded-2xl p-5 bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200/60 dark:border-[#202020] pb-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-mono font-black text-xs px-2.5 py-1 rounded-lg bg-neutral-200/80 dark:bg-[#222] text-brand-pink">
                            {b.requestId}
                          </span>
                          <span className="font-black text-neutral-900 dark:text-white text-sm">{b.examType}</span>
                          <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-black ${statusColor(b.status)}`}>
                            {b.status}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-neutral-400">
                          Submitted {formatDate(b.createdAt)}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold">
                        <div>
                          <span className="text-[10px] uppercase text-neutral-400 block">Preferred City</span>
                          <span className="text-neutral-900 dark:text-white">{b.preferredCity}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase text-neutral-400 block">Preferred Date</span>
                          <span className="text-neutral-900 dark:text-white">{b.preferredDate ? formatDate(b.preferredDate) : 'Flexible'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase text-neutral-400 block">Preferred Time</span>
                          <span className="text-neutral-900 dark:text-white">{b.preferredTime || 'Any Time'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase text-neutral-400 block">Test Centre</span>
                          <span className="text-neutral-900 dark:text-white">{b.preferredTestCentre || 'Nearest Available'}</span>
                        </div>
                      </div>

                      {(b.status === 'Booking Confirmed' || b.status === 'Completed') && b.confirmationDetails?.bookingReference && (
                        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/60 space-y-2 text-xs">
                          <div className="flex items-center gap-2 font-black text-emerald-800 dark:text-emerald-300">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Official Pearson Exam Confirmation Details</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-bold pt-1">
                            <div>
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block uppercase">Booking Reference</span>
                              <span className="font-mono text-emerald-900 dark:text-emerald-200">{b.confirmationDetails.bookingReference}</span>
                            </div>
                            {b.confirmationDetails.confirmedCentre && (
                              <div>
                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block uppercase">Confirmed Centre</span>
                                <span className="text-emerald-900 dark:text-emerald-200">{b.confirmationDetails.confirmedCentre}</span>
                              </div>
                            )}
                            {b.confirmationDetails.confirmedDate && (
                              <div>
                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block uppercase">Confirmed Date & Time</span>
                                <span className="text-emerald-900 dark:text-emerald-200">
                                  {formatDate(b.confirmationDetails.confirmedDate)} {b.confirmationDetails.confirmedTime ? `• ${b.confirmationDetails.confirmedTime}` : ''}
                                </span>
                              </div>
                            )}
                          </div>
                          {b.confirmationDetails.importantInstructions && (
                            <p className="text-[11px] text-emerald-700 dark:text-emerald-300 pt-1 border-t border-emerald-200 dark:border-emerald-900/50">
                              <strong>Instructions:</strong> {b.confirmationDetails.importantInstructions}
                            </p>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-end pt-1">
                        <a
                          href={`https://wa.me/919855926113?text=${encodeURIComponent(
                            `Hello Apex Vouchers, I am inquiring about my PTE booking assistance request ${b.requestId}.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-black text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1.5"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Chat on WhatsApp regarding this request</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── PERSONAL INFORMATION TAB ─────────────────────────────────── */}
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
                      <div className="relative group shrink-0">
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
                          <VerifiedBadge verified={user?.emailVerified} verifiedLabel="Email verified" unverifiedLabel="Email not verified" />
                          {user?.phone && (
                            <VerifiedBadge verified={user?.phoneVerified} verifiedLabel="Phone verified" unverifiedLabel="Phone not verified" />
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2 mt-4 justify-center sm:justify-start">
                          {avatarPreview ? (
                            <>
                              <button
                                onClick={uploadAvatar}
                                disabled={avatarUploading}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-brand-pink text-white shadow disabled:opacity-60 cursor-pointer"
                              >
                                {avatarUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                                {avatarUploading ? 'Uploading...' : 'Save Photo'}
                              </button>
                              <button onClick={cancelAvatarPreview} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-neutral-100 dark:bg-[#262626] text-neutral-700 dark:text-neutral-300 cursor-pointer">
                                <X className="w-3.5 h-3.5" /> Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => fileInputRef.current?.click()}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-neutral-100 dark:bg-[#262626] text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition cursor-pointer"
                              >
                                <Camera className="w-3.5 h-3.5" /> Change Photo
                              </button>
                              {user?.profileImageUrl && (
                                <button
                                  onClick={removeAvatar}
                                  disabled={avatarRemoving}
                                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition disabled:opacity-60 cursor-pointer"
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

                  {/* Personal information card */}
                  <div className="rounded-3xl p-5 sm:p-7 bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="font-black text-lg text-neutral-900 dark:text-white flex items-center gap-2">
                        <UserIcon className="w-5 h-5 text-brand-pink" />
                        Personal Information
                      </h3>
                      {!editingProfile && (
                        <button
                          type="button"
                          onClick={startEditProfile}
                          className="text-xs font-black text-brand-pink hover:underline cursor-pointer"
                        >
                          Edit Profile
                        </button>
                      )}
                    </div>

                    {profileDirty && (
                      <div className="mb-5 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <span className="text-xs font-black text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" /> You have unsaved changes.
                        </span>
                        <div className="flex gap-2">
                          <button type="button" onClick={discardProfileEdit} className="px-3 py-1.5 rounded-lg text-[11px] font-black bg-white dark:bg-[#161616] border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 cursor-pointer">
                            Discard Changes
                          </button>
                          <button type="button" onClick={saveProfile} className="px-3 py-1.5 rounded-lg text-[11px] font-black bg-amber-600 text-white cursor-pointer">
                            Save Changes
                          </button>
                        </div>
                      </div>
                    )}

                    <form onSubmit={saveProfile} className="space-y-5">
                      {/* Full Name — read-only or editable */}
                      {editingProfile ? (
                        <Field
                          label="Full Name"
                          value={profileName}
                          onChange={(e) => { setProfileName(e.target.value); setProfileNameError(''); }}
                          required
                          error={profileNameError}
                          icon={<UserIcon className="w-4 h-4" />}
                        />
                      ) : (
                        <ReadOnlyRow icon={<UserIcon className="w-3.5 h-3.5" />} label="Full Name" value={user?.name || '—'} />
                      )}

                      {/* Email — always read-only here, changed via modal */}
                      <div>
                        <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-500 dark:text-[#B5B5B5] mb-2 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5" /> Email Address
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            type="email"
                            value={user?.email || ''}
                            disabled
                            className="flex-1 min-w-0 px-4 py-3 bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] rounded-2xl text-neutral-900 dark:text-white text-sm font-bold opacity-70 cursor-not-allowed"
                          />
                          <VerifiedBadge verified={user?.emailVerified} verifiedLabel="Verified" unverifiedLabel="Not verified" />
                        </div>
                        <button
                          type="button"
                          onClick={() => setContactModalType('email')}
                          className="mt-2 text-xs font-black text-brand-pink hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Mail className="w-3 h-3" /> Change Email
                        </button>
                      </div>

                      {/* Phone — always read-only here, changed via modal */}
                      <div>
                        <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-500 dark:text-[#B5B5B5] mb-2 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5" /> Phone Number
                        </span>
                        {user?.phone ? (
                          <>
                            <div className="flex flex-wrap items-center gap-2">
                              <input
                                type="text"
                                value={user.phone}
                                disabled
                                className="flex-1 min-w-0 px-4 py-3 bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] rounded-2xl text-neutral-900 dark:text-white text-sm font-bold opacity-70 cursor-not-allowed"
                              />
                              <VerifiedBadge verified={user?.phoneVerified} verifiedLabel="Verified" unverifiedLabel="Not verified" />
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                              <button
                                type="button"
                                onClick={() => setContactModalType('phone')}
                                className="text-xs font-black text-brand-pink hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <Phone className="w-3 h-3" /> Change Phone
                              </button>
                              {!user?.phoneVerified && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    showToast?.(
                                      'Phone verification by SMS is currently unavailable. Your phone number can still be updated and will be verified when SMS verification is enabled.'
                                    )
                                  }
                                  className="text-xs font-black text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 flex items-center gap-1 cursor-pointer"
                                >
                                  <ShieldCheck className="w-3 h-3" /> Verify Phone Number
                                </button>
                              )}
                            </div>
                          </>
                        ) : (
                          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#0E0E0E] border border-dashed border-[#EAEAEA] dark:border-[#292929] flex items-center justify-between gap-3">
                            <span className="text-sm font-bold text-neutral-500 dark:text-neutral-400">Phone number not added</span>
                            <button
                              type="button"
                              onClick={() => setContactModalType('phone')}
                              className="text-xs font-black text-brand-pink hover:underline shrink-0 cursor-pointer"
                            >
                              + Add Phone Number
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Passport name reminder */}
                      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 flex gap-3">
                        <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-black text-amber-800 dark:text-amber-300 mb-0.5">Government ID Match Required</p>
                          <p className="text-xs font-bold text-amber-700 dark:text-amber-400/80">
                            Pearson and other exam providers require the name on your exam booking to exactly match your government-issued photo ID (passport, national ID, etc.).
                          </p>
                        </div>
                      </div>

                      {editingProfile && (
                        <div className="flex items-center gap-3 pt-1">
                          <button
                            type="submit"
                            disabled={profileLoading}
                            className="btn-pink text-white px-6 py-3 rounded-2xl font-black shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                          >
                            {profileLoading ? (
                              <><Loader2 className="w-4 h-4 animate-spin" /> Saving changes...</>
                            ) : (
                              'Save Changes'
                            )}
                          </button>
                          <button type="button" onClick={discardProfileEdit} className="px-5 py-3 rounded-2xl text-sm font-black bg-neutral-100 dark:bg-[#262626] text-neutral-700 dark:text-neutral-300 cursor-pointer">
                            Cancel
                          </button>
                        </div>
                      )}
                      {profileSuccess && (
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-in fade-in slide-in-from-left-2">
                          <CheckCircle2 className="w-4 h-4" /> Profile updated successfully
                        </span>
                      )}
                    </form>
                  </div>
                </div>
              </>
            )}

            {/* ── SECURITY TAB ──────────────────────────────────────────────── */}
            {tab === 'security' && (
              <div className="space-y-6 max-w-2xl">
                <div className="rounded-3xl p-5 sm:p-7 bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm">
                  <h3 className="font-black text-lg mb-5 text-neutral-900 dark:text-white flex items-center gap-2">
                    <Lock className="w-5 h-5 text-brand-pink" />
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

                    <div>
                      <PasswordField
                        label="New Password"
                        value={passwordForm.newPwd}
                        onChange={(e) => { setPasswordForm({ ...passwordForm, newPwd: e.target.value }); setPasswordErrors({ ...passwordErrors, newPwd: null }); }}
                        show={showNewPwd}
                        onToggle={() => setShowNewPwd(!showNewPwd)}
                        error={passwordErrors.newPwd}
                        placeholder="Choose a strong new password"
                      />
                      <PasswordStrengthChecklist password={passwordForm.newPwd} />
                    </div>

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
                        className="btn-pink text-white px-6 py-3 rounded-2xl font-black shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
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

                {/* Verification status summary */}
                <div className="rounded-3xl p-5 sm:p-7 bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm">
                  <h4 className="font-black text-sm text-neutral-900 dark:text-white mb-4">Verification Status</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929]">
                      <span className="text-xs font-bold text-neutral-600 dark:text-neutral-300 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email</span>
                      <VerifiedBadge verified={user?.emailVerified} verifiedLabel="Verified" unverifiedLabel="Not verified" />
                    </div>
                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929]">
                      <span className="text-xs font-bold text-neutral-600 dark:text-neutral-300 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Phone</span>
                      {user?.phone ? (
                        <VerifiedBadge verified={user?.phoneVerified} verifiedLabel="Verified" unverifiedLabel="Not verified" />
                      ) : (
                        <span className="text-[10px] font-black text-neutral-400">Not added</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Security tips */}
                <div className="rounded-3xl p-5 sm:p-7 bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929]">
                  <h4 className="font-black text-sm text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-brand-pink" />
                    Security Tips
                  </h4>
                  <ul className="space-y-2 text-xs font-bold text-neutral-500 dark:text-neutral-400">
                    <li className="flex items-start gap-2"><span className="text-brand-pink mt-0.5">•</span> Use a strong, unique password for your Apex Vouchers account</li>
                    <li className="flex items-start gap-2"><span className="text-brand-pink mt-0.5">•</span> Never share your voucher codes or account credentials</li>
                    <li className="flex items-start gap-2"><span className="text-brand-pink mt-0.5">•</span> Keep your phone number and email up to date for order notifications</li>
                    <li className="flex items-start gap-2"><span className="text-brand-pink mt-0.5">•</span> Contact support if you notice any unauthorized activity</li>
                  </ul>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 hover:bg-rose-100 dark:hover:bg-rose-950/50 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" /> Log Out of This Account
                </button>
              </div>
            )}

            {/* ── SUPPORT TAB ───────────────────────────────────────────────── */}
            {tab === 'support' && (
              <div className="space-y-6 max-w-2xl">
                <div className="rounded-3xl p-5 sm:p-7 bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm">
                  <h3 className="font-black text-lg mb-2 text-neutral-900 dark:text-white flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-brand-pink" />
                    Need Help?
                  </h3>
                  <p className="text-xs font-bold text-neutral-500 dark:text-neutral-400 mb-5">
                    Our support team can help with orders, vouchers, account changes, and PTE booking questions.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <a
                      href={`https://wa.me/${(footerSettings?.phone || '+91 9855926113').replace(/\D/g, '')}?text=${encodeURIComponent('Hello Apex Vouchers, I need help with my account.')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 transition"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <MessageCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-black text-sm text-emerald-800 dark:text-emerald-300">WhatsApp Support</div>
                        <div className="text-xs font-bold text-emerald-700/80 dark:text-emerald-400/80">Usually replies within minutes</div>
                      </div>
                    </a>
                    <a
                      href={`tel:${(footerSettings?.phone || '+91 9855926113').replace(/\s+/g, '')}`}
                      className="flex items-center gap-3 p-4 rounded-2xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] hover:border-brand-pink/40 transition"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-brand-pink/10 text-brand-pink flex items-center justify-center shrink-0">
                        <PhoneCall className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-black text-sm text-neutral-900 dark:text-white">Call Support</div>
                        <div className="text-xs font-bold text-neutral-500 dark:text-neutral-400">{footerSettings?.phone || '+91 9855926113'}</div>
                      </div>
                    </a>
                    <a
                      href={`mailto:${footerSettings?.email || 'apexvouchers@gmail.com'}`}
                      className="flex items-center gap-3 p-4 rounded-2xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] hover:border-brand-pink/40 transition"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-brand-pink/10 text-brand-pink flex items-center justify-center shrink-0">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-black text-sm text-neutral-900 dark:text-white">Email Support</div>
                        <div className="text-xs font-bold text-neutral-500 dark:text-neutral-400">{footerSettings?.email || 'apexvouchers@gmail.com'}</div>
                      </div>
                    </a>
                    <button
                      onClick={() => { setActiveTab('faq'); navigate('/'); }}
                      className="flex items-center gap-3 p-4 rounded-2xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] hover:border-brand-pink/40 transition text-left cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-brand-pink/10 text-brand-pink flex items-center justify-center shrink-0">
                        <HelpCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-black text-sm text-neutral-900 dark:text-white">Browse FAQs</div>
                        <div className="text-xs font-bold text-neutral-500 dark:text-neutral-400">Common questions answered</div>
                      </div>
                    </button>
                  </div>
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
                <button type="button" onClick={() => setTransferModalId(null)} className="px-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-[#262626] text-neutral-700 dark:text-neutral-200 text-xs font-black cursor-pointer">Cancel</button>
                <button className="btn-pink text-white px-5 py-2.5 rounded-xl text-xs font-black cursor-pointer">Confirm transfer</button>
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
              <button onClick={() => setRefundConfirmId(null)} className="px-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-[#262626] text-neutral-700 dark:text-neutral-200 text-xs font-black cursor-pointer">Cancel</button>
              <button
                onClick={() => { requestRefund(refundConfirmId); setRefundConfirmId(null); }}
                className="btn-pink text-white px-5 py-2.5 rounded-xl text-xs font-black cursor-pointer"
              >Confirm request</button>
            </div>
          </Modal>
        )}

        {contactModalType === 'email' && (
          <ContactOtpModal
            currentValue={user?.email}
            onClose={() => setContactModalType(null)}
            onSuccess={(nextUser) => updateAuthenticatedUser(nextUser)}
            showToast={showToast}
          />
        )}

        {contactModalType === 'phone' && (
          <PhoneUpdateModal
            currentValue={user?.phone}
            onClose={() => setContactModalType(null)}
            onSuccess={(nextUser) => updateAuthenticatedUser(nextUser)}
            showToast={showToast}
          />
        )}
      </div>
    </section>
  );
}

// ── Change Email OTP modal ──────────────────────────────────────────────────────

function ContactOtpModal({ currentValue, onClose, onSuccess, showToast }) {
  const [step, setStep] = useState(1); // 1 = enter new email, 2 = verify OTP
  const [value, setValue] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [sending, setSending] = useState(false);
  const [maskedDestination, setMaskedDestination] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resendActive, setResendActive] = useState(false);
  const resendSeconds = useResendCountdown(resendActive);

  const validateClientSide = () => {
    if (!value || !/^\S+@\S+\.\S+$/.test(value.trim())) return 'Please enter a valid email address';
    if (value.trim().toLowerCase() === String(currentValue || '').toLowerCase()) return 'This is already your current email';
    return null;
  };

  const doSend = () => accountApi.sendEmailOtp(value.trim().toLowerCase());

  const handleSendOtp = async (e) => {
    e.preventDefault();
    const clientError = validateClientSide();
    if (clientError) {
      setFieldError(clientError);
      return;
    }
    setFieldError('');
    setSending(true);
    const res = await doSend();
    setSending(false);
    if (res.success) {
      setMaskedDestination(res.maskedDestination || '');
      setStep(2);
      setResendActive(true);
    } else {
      setFieldError(res.message || "We couldn't send the verification code. Please try again in a moment.");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setOtpError('');
    if (otp.length !== 6) {
      setOtpError('Enter the 6-digit code');
      return;
    }
    setVerifying(true);
    const res = await accountApi.verifyEmailOtp(otp);
    setVerifying(false);
    if (res.success) {
      onSuccess(res.user);
      showToast?.('✅ Email address updated and verified');
      onClose();
    } else {
      setOtpError(res.message || 'Incorrect verification code. Please try again.');
    }
  };

  const handleResend = async () => {
    if (!resendActive) return;
    setResendActive(false);
    setOtpError('');
    const res = await doSend();
    if (!res.success) setOtpError(res.message || "We couldn't resend the code. Please try again.");
    setTimeout(() => setResendActive(true), 0);
  };

  return (
    <Modal title="Change Email Address" onClose={onClose}>
      {step === 1 && (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <p className="text-xs font-bold text-neutral-500 dark:text-[#B5B5B5]">
            Enter your new email address. We'll send a 6-digit code to verify it before making any change.
          </p>
          <Field
            label="New Email Address"
            type="email"
            value={value}
            onChange={(e) => { setValue(e.target.value); setFieldError(''); }}
            required
            placeholder="new@email.com"
            icon={<Mail className="w-4 h-4" />}
            error={fieldError}
          />
          <div className="flex gap-2 justify-end pt-1">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-[#262626] text-neutral-700 dark:text-neutral-200 text-xs font-black cursor-pointer">
              Cancel
            </button>
            <button
              disabled={sending}
              className="btn-pink text-white px-5 py-2.5 rounded-xl text-xs font-black disabled:opacity-60 flex items-center gap-1.5 cursor-pointer"
            >
              {sending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {sending ? 'Sending OTP…' : 'Send Verification Code'}
            </button>
          </div>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyOtp} className="space-y-5">
          <p className="text-xs text-center font-bold text-neutral-500 dark:text-[#B5B5B5]">
            We've sent a 6-digit code to{' '}
            <strong className="text-neutral-900 dark:text-white">{maskedDestination || maskEmailForDisplay(value)}</strong>
          </p>
          <OtpInput value={otp} onChange={setOtp} error={otpError} disabled={verifying} />
          <button
            disabled={verifying}
            className="w-full btn-pink text-white py-3 rounded-2xl text-sm font-black disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
          >
            {verifying && <Loader2 className="w-4 h-4 animate-spin" />}
            {verifying ? 'Verifying…' : 'Verify OTP'}
          </button>
          <div className="text-center text-xs font-bold">
            {resendActive ? (
              <button type="button" onClick={handleResend} className="text-brand-pink hover:underline flex items-center gap-1 justify-center mx-auto cursor-pointer">
                <RotateCcw className="w-3 h-3" /> Resend Code
              </button>
            ) : (
              <span className="text-neutral-400">Resend available in {resendSeconds}s</span>
            )}
          </div>
        </form>
      )}
    </Modal>
  );
}

// ── Change Phone modal (no SMS verification available — direct, password-confirmed) ────

function PhoneUpdateModal({ currentValue, onClose, onSuccess, showToast }) {
  const [phone, setPhone] = useState('');
  const [phoneCountry, setPhoneCountry] = useState('IN');
  const [currentPassword, setCurrentPassword] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldError('');
    setPasswordError('');

    if (!phone) {
      setFieldError('Please enter a phone number');
      return;
    }
    try {
      const parsed = parsePhoneNumberFromString(phone, phoneCountry);
      if (!parsed || !parsed.isValid()) {
        setFieldError('Invalid phone number for the selected country');
        return;
      }
    } catch {
      setFieldError('Could not validate phone number');
      return;
    }
    if (!currentPassword) {
      setPasswordError('Please confirm your current password');
      return;
    }

    setSaving(true);
    const res = await accountApi.updatePhone(phone, phoneCountry, currentPassword);
    setSaving(false);

    if (res.success) {
      onSuccess(res.user);
      showToast?.('✅ Phone number updated successfully');
      onClose();
    } else if (res.code === 'WRONG_PASSWORD') {
      setPasswordError('Current password is incorrect');
    } else {
      setFieldError(res.message || "We couldn't update your phone number right now. Please try again.");
    }
  };

  return (
    <Modal title={currentValue ? 'Change Phone Number' : 'Add Phone Number'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] flex items-start gap-2.5">
          <Info className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
          <p className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400">
            SMS verification isn't available yet, so this number is saved as <strong>not verified</strong>. It will be
            verified automatically once SMS verification is enabled.
          </p>
        </div>
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-500 dark:text-[#B5B5B5] mb-2 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5" /> New Phone Number
          </span>
          <PhoneInput
            value={phone}
            country={phoneCountry}
            onChange={(v, c) => { setPhone(v); setPhoneCountry(c); setFieldError(''); }}
            onCountryChange={setPhoneCountry}
            error={fieldError}
          />
          {fieldError && <p className="mt-1.5 text-xs font-bold text-rose-500">{fieldError}</p>}
        </div>
        <Field
          label="Current Password"
          type="password"
          value={currentPassword}
          onChange={(e) => { setCurrentPassword(e.target.value); setPasswordError(''); }}
          required
          placeholder="Confirm it's you"
          icon={<Lock className="w-4 h-4" />}
          error={passwordError}
        />
        <div className="flex gap-2 justify-end pt-1">
          <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-[#262626] text-neutral-700 dark:text-neutral-200 text-xs font-black cursor-pointer">
            Cancel
          </button>
          <button
            disabled={saving}
            className="btn-pink text-white px-5 py-2.5 rounded-xl text-xs font-black disabled:opacity-60 flex items-center gap-1.5 cursor-pointer"
          >
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {saving ? 'Updating phone number…' : 'Save Phone Number'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ── Shared Components ─────────────────────────────────────────────────────────

function AccountInfoCard({ icon, label, value, verified, verifiedLabel, unverifiedLabel }) {
  return (
    <div className="rounded-3xl p-4 sm:p-5 bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929]">
      <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-neutral-400 mb-2">
        {icon} {label}
      </div>
      <div className="text-sm font-black text-neutral-900 dark:text-white truncate mb-2">{value}</div>
      <VerifiedBadge verified={verified} verifiedLabel={verifiedLabel} unverifiedLabel={unverifiedLabel} />
    </div>
  );
}

function VerifiedBadge({ verified, verifiedLabel = 'Verified', unverifiedLabel = 'Not verified' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border shrink-0 ${
        verified
          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40'
          : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/40'
      }`}
    >
      {verified ? <Check className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
      {verified ? verifiedLabel : unverifiedLabel}
    </span>
  );
}

function ReadOnlyRow({ icon, label, value }) {
  return (
    <div>
      <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-500 dark:text-[#B5B5B5] mb-2 flex items-center gap-1.5">
        {icon} {label}
      </span>
      <div className="px-4 py-3 bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] rounded-2xl text-neutral-900 dark:text-white text-sm font-bold">
        {value}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', disabled, placeholder, required, error, icon }) {
  return (
    <label className="block">
      <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-500 dark:text-[#B5B5B5] mb-2 flex items-center gap-1.5">
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
        className={`w-full px-4 py-3 bg-neutral-50 dark:bg-[#0E0E0E] border rounded-2xl text-neutral-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-pink/20 disabled:opacity-60 transition-colors ${
          error ? 'border-rose-400 dark:border-rose-500 focus:border-rose-400' : 'border-[#EAEAEA] dark:border-[#292929] focus:border-brand-pink'
        }`}
      />
      {error && <p className="mt-1.5 text-xs font-bold text-rose-500">{error}</p>}
    </label>
  );
}

function PasswordField({ label, value, onChange, show, onToggle, error, placeholder }) {
  return (
    <label className="block">
      <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-500 dark:text-[#B5B5B5] mb-2 flex items-center gap-1.5">
        <Lock className="w-3.5 h-3.5" />
        {label}
      </span>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full px-4 py-3 pr-12 bg-neutral-50 dark:bg-[#0E0E0E] border rounded-2xl text-neutral-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-pink/20 transition-colors ${
            error ? 'border-rose-400 dark:border-rose-500 focus:border-rose-400' : 'border-[#EAEAEA] dark:border-[#292929] focus:border-brand-pink'
          }`}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition cursor-pointer"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && <p className="mt-1.5 text-xs font-bold text-rose-500">{error}</p>}
    </label>
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
        {detailed && o.promoCode && <div className="text-[10px] font-black text-brand-pink">Promo: {o.promoCode}</div>}
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

function EmptyState({ icon, title, desc, action }) {
  return (
    <div className="text-center py-10 rounded-2xl border border-dashed border-[#EAEAEA] dark:border-[#292929]">
      <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-neutral-100 dark:bg-[#262626] flex items-center justify-center">{icon}</div>
      <div className="font-black text-neutral-900 dark:text-white">{title}</div>
      <div className="text-xs font-bold text-neutral-500 dark:text-[#B5B5B5] mt-1 max-w-sm mx-auto">{desc}</div>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-3xl bg-white dark:bg-[#161616] p-7 border border-[#EAEAEA] dark:border-[#292929] shadow-2xl text-neutral-900 dark:text-white max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-lg">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-xl bg-neutral-100 dark:bg-[#262626] text-neutral-600 dark:text-neutral-200 text-xs font-black cursor-pointer">Close</button>
        </div>
        {children}
      </div>
    </div>
  );
}
