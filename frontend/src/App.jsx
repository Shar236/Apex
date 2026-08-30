import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { VoucherProvider, useVoucher } from './context/VoucherContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { Hero3D } from './components/Hero3D';
import { TrustStrip } from './components/TrustStrip';
import { LegalTrustFooter } from './components/LegalTrustFooter';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { SocialProofToast } from './components/SocialProofToast';
import { ExamLogoMarquee } from './components/ExamLogoMarquee';
import { ShoppingBag, X, Trash2, ArrowRight, Lock, Ticket } from 'lucide-react';

const lazyNamed = (loader, exportName) =>
  lazy(() => loader().then((module) => ({ default: module[exportName] })));

const ExamCategorySection = lazyNamed(() => import('./components/ExamCategorySection'), 'ExamCategorySection');
const BestSellingVouchers = lazyNamed(() => import('./components/BestSellingVouchers'), 'BestSellingVouchers');
const PTEBookingAssistance = lazyNamed(() => import('./components/PTEBookingAssistance'), 'PTEBookingAssistance');
const SavingsCalculator = lazyNamed(() => import('./components/SavingsCalculator'), 'SavingsCalculator');
const HowItWorks = lazyNamed(() => import('./components/HowItWorks'), 'HowItWorks');
const WhyApexVoucher = lazyNamed(() => import('./components/WhyApexVoucher'), 'WhyApexVoucher');
const VisualExplainerSection = lazyNamed(() => import('./components/VisualExplainerSection'), 'VisualExplainerSection');
const VideoReelsCarousel = lazyNamed(() => import('./components/VideoReelsCarousel'), 'VideoReelsCarousel');
const RedemptionAndSecurity = lazyNamed(() => import('./components/RedemptionAndSecurity'), 'RedemptionAndSecurity');
const Testimonials = lazyNamed(() => import('./components/Testimonials'), 'Testimonials');
const FAQSection = lazyNamed(() => import('./components/FAQSection'), 'FAQSection');
const ExamGuides = lazyNamed(() => import('./components/ExamGuides'), 'ExamGuides');
const AboutApexVouchers = lazyNamed(() => import('./components/AboutApexVouchers'), 'AboutApexVouchers');
const FinalCTASection = lazyNamed(() => import('./components/FinalCTASection'), 'FinalCTASection');
const AwardsAndAchievements = lazyNamed(() => import('./components/AwardsAndAchievements'), 'AwardsAndAchievements');
const ProductCatalog = lazyNamed(() => import('./components/ProductCatalog'), 'ProductCatalog');
const ProductDetailModal = lazyNamed(() => import('./components/ProductDetailModal'), 'ProductDetailModal');
const CheckoutModal = lazyNamed(() => import('./components/CheckoutModal'), 'CheckoutModal');
const VoucherRequestModal = lazyNamed(() => import('./components/VoucherRequestModal'), 'VoucherRequestModal');
const PTEBookingModal = lazyNamed(() => import('./components/PTEBookingModal'), 'PTEBookingModal');
const PTEExamBookingPage = lazyNamed(() => import('./components/PTEExamBookingPage'), 'PTEExamBookingPage');
const VoucherDetailPage = lazyNamed(() => import('./components/VoucherDetailPage'), 'VoucherDetailPage');
const PTEReschedulingGuidePage = lazyNamed(() => import('./components/PTEReschedulingGuidePage'), 'PTEReschedulingGuidePage');
const RefundPolicyPage = lazyNamed(() => import('./components/RefundPolicyPage'), 'RefundPolicyPage');
const VoucherRefundPolicyPage = lazyNamed(() => import('./components/VoucherRefundPolicyPage'), 'VoucherRefundPolicyPage');
const TermsAndConditionsPage = lazyNamed(() => import('./components/TermsAndConditionsPage'), 'TermsAndConditionsPage');
const PrivacyPolicyPage = lazyNamed(() => import('./components/PrivacyPolicyPage'), 'PrivacyPolicyPage');
const Dashboard = lazyNamed(() => import('./components/Dashboard'), 'Dashboard');
const LiveChatWidget = lazyNamed(() => import('./components/LiveChatWidget'), 'LiveChatWidget');
const FloatingSupportWidget = lazyNamed(() => import('./components/FloatingSupportWidget'), 'FloatingSupportWidget');
const AdminControlDrawer = lazyNamed(() => import('./components/AdminControlDrawer'), 'AdminControlDrawer');
const LoginPage = lazyNamed(() => import('./components/AuthPages'), 'LoginPage');
const AdminLoginPage = lazyNamed(() => import('./components/AuthPages'), 'AdminLoginPage');
const RegisterPage = lazyNamed(() => import('./components/AuthPages'), 'RegisterPage');
const ForgotPasswordPage = lazyNamed(() => import('./components/AuthPages'), 'ForgotPasswordPage');
const ResetPasswordPage = lazyNamed(() => import('./components/AuthPages'), 'ResetPasswordPage');
const PaymentReturnPage = lazyNamed(() => import('./components/PaymentReturnPage'), 'PaymentReturnPage');
const AccountHome = lazy(() => import('./components/AccountPages'));
const AdminConsole = lazy(() => import('./components/AdminConsole'));
const BlogIndexPage = lazyNamed(() => import('./blogs/pages/BlogIndexPage'), 'BlogIndexPage');
const BlogPostPage = lazyNamed(() => import('./blogs/pages/BlogPostPage'), 'BlogPostPage');
const BlogPreviewPage = lazyNamed(() => import('./blogs/pages/BlogPreviewPage'), 'BlogPreviewPage');

const PageFallback = ({ minHeight = 'min-h-80' }) => (
  <div className={`${minHeight} flex items-center justify-center bg-white dark:bg-[#06070B] text-neutral-500 dark:text-neutral-400`}>
    <div className="animate-pulse text-sm font-bold">Loading...</div>
  </div>
);

const ModalSuspense = ({ children }) => (
  <Suspense fallback={null}>
    {children}
  </Suspense>
);

const SectionSuspense = ({ children }) => (
  <Suspense fallback={null}>
    {children}
  </Suspense>
);

const LazyPage = ({ children, minHeight }) => (
  <Suspense fallback={<PageFallback minHeight={minHeight} />}>
    {children}
  </Suspense>
);

const CartDrawer = () => {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, formatPrice, startCheckout } = useVoucher();

  if (!isCartOpen) return null;

  const totalAmount = cart.reduce((acc, item) => acc + item.discountedPrice * item.quantity, 0);
  const totalOriginal = cart.reduce((acc, item) => acc + item.originalPrice * item.quantity, 0);
  const totalSavings = totalOriginal - totalAmount;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-[#161616] border-l border-[#EAEAEA] dark:border-[#292929] p-6 sm:p-7 shadow-2xl overflow-y-auto h-full flex flex-col justify-between text-neutral-900 dark:text-white">
        <div>
          <div className="flex items-center justify-between pb-5 mb-6 border-b border-[#EAEAEA] dark:border-[#292929]">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-brand-pink p-0.5 shadow-sm">
                <div className="w-full h-full bg-white dark:bg-[#161616] rounded-[10px] flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-brand-pink" strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <h3 className="font-heading font-black text-lg text-neutral-900 dark:text-white leading-tight">Your Voucher Cart</h3>
                <p className="text-xs font-bold text-neutral-500 dark:text-[#B5B5B5]">{cart.length} {cart.length === 1 ? 'item' : 'items'}</p>
              </div>
            </div>
            <button onClick={() => setIsCartOpen(false)} className="p-2 rounded-xl bg-neutral-100 dark:bg-[#262626] text-neutral-600 dark:text-neutral-300 transition-colors">
              <X className="w-5 h-5" strokeWidth={2.5} />
            </button>
          </div>

          {cart.length > 0 ? (
            <div className="space-y-3.5">
              {cart.map((item) => (
                <div key={item.id} className="bg-[#FFF0F5] dark:bg-[#2A0A17] p-4 rounded-2xl border border-brand-pink/20 flex items-center justify-between gap-3 group hover:bg-white dark:hover:bg-[#161616] transition-all duration-200">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="inline-flex px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-100 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                        Save {formatPrice(item.savings)}
                      </span>
                    </div>
                    <h4 className="font-heading font-extrabold text-sm text-neutral-900 dark:text-white leading-snug mb-1 line-clamp-2">{item.name}</h4>
                    <span className="font-heading font-black text-lg text-brand-pink leading-none">{formatPrice(item.discountedPrice)}</span>
                  </div>

                  <div className="flex flex-col items-end gap-2.5">
                    <div className="flex items-center gap-1.5 bg-white dark:bg-[#161616] rounded-xl p-1 border border-[#EAEAEA] dark:border-[#292929] shadow-sm">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-[#262626] text-neutral-700 dark:text-neutral-200 font-black text-sm flex items-center justify-center transition-colors"
                      >
                        −
                      </button>
                      <span className="text-sm font-black text-neutral-900 dark:text-white w-6 text-center tabular-nums">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-[#262626] text-neutral-700 dark:text-neutral-200 font-black text-sm flex items-center justify-center transition-colors"
                      >
                        +
                      </button>
                    </div>

                    <button onClick={() => removeFromCart(item.id)} className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors">
                      <Trash2 className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 space-y-4">
              <div className="w-20 h-20 rounded-3xl bg-neutral-100 dark:bg-[#262626] border border-[#EAEAEA] dark:border-[#292929] flex items-center justify-center mx-auto">
                <ShoppingBag className="w-10 h-10 text-neutral-400" strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-heading font-extrabold text-base text-neutral-900 dark:text-white mb-1">Your cart is empty</p>
                <p className="text-sm text-neutral-500 dark:text-[#B5B5B5] font-medium max-w-xs mx-auto">Browse our exam vouchers and add discounted codes to get started.</p>
              </div>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                }}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl btn-pink text-white font-bold text-sm shadow-md"
              >
                Browse Vouchers
                <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="pt-6 border-t border-[#EAEAEA] dark:border-[#292929] space-y-4 mt-4">
            <div className="space-y-2.5 p-4 rounded-2xl bg-[#FFF0F5] dark:bg-[#2A0A17] border border-brand-pink/20">
              <div className="flex justify-between items-center text-sm font-semibold text-neutral-500 dark:text-[#B5B5B5]">
                <span>Subtotal (MRP)</span>
                <span className="line-through">{formatPrice(totalOriginal)}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold text-emerald-600 dark:text-emerald-400">
                <span>🎁 Total Savings</span>
                <span>− {formatPrice(totalSavings)}</span>
              </div>
              <div className="h-px bg-brand-pink/20 my-1" />
              <div className="flex justify-between items-baseline pt-1">
                <span className="text-sm font-black text-neutral-900 dark:text-white uppercase tracking-wider">Total Payable</span>
                <span className="font-heading font-black text-3xl text-neutral-900 dark:text-white tabular-nums">{formatPrice(totalAmount)}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setIsCartOpen(false);
                startCheckout(cart);
              }}
              className="w-full py-4 rounded-2xl btn-pink text-white font-black text-base shadow-xl flex items-center justify-center gap-2.5"
            >
              <Lock className="w-5 h-5" strokeWidth={2.5} />
              <span>Proceed to Secure Checkout</span>
              <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
            </button>

            <p className="text-center text-[11px] font-bold text-neutral-500 dark:text-neutral-400 flex items-center justify-center gap-1.5">
              <Ticket className="w-3.5 h-3.5 text-brand-pink" strokeWidth={2.5} />
              Codes delivered instantly to Email & WhatsApp
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const ToastContainer = () => {
  const { toastMessage } = useVoucher();
  if (!toastMessage) return null;

  return (
    <div className="fixed top-24 right-6 z-50 max-w-sm bg-white dark:bg-[#161616] border-2 border-brand-pink text-neutral-900 dark:text-white px-5 py-3.5 rounded-2xl shadow-xl backdrop-blur-md text-sm font-bold animate-in slide-in-from-top-3 flex items-center gap-3">
      <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-100 flex items-center justify-center shrink-0">
        <span className="text-emerald-600 dark:text-emerald-400 text-lg">✓</span>
      </div>
      <span>{toastMessage}</span>
    </div>
  );
};

const HomePage = () => (
  <>
    <Hero3D />
    <TrustStrip />
    <ExamLogoMarquee />
    <SectionSuspense><ExamCategorySection /></SectionSuspense>
    <SectionSuspense><BestSellingVouchers /></SectionSuspense>
    <SectionSuspense><PTEBookingAssistance /></SectionSuspense>
    <SectionSuspense><SavingsCalculator /></SectionSuspense>
    <SectionSuspense><HowItWorks /></SectionSuspense>
    <SectionSuspense><WhyApexVoucher /></SectionSuspense>
    <SectionSuspense><VisualExplainerSection /></SectionSuspense>
    <SectionSuspense><VideoReelsCarousel /></SectionSuspense>
    <SectionSuspense><RedemptionAndSecurity /></SectionSuspense>
    <SectionSuspense><Testimonials /></SectionSuspense>
    <SectionSuspense><FAQSection /></SectionSuspense>
    <SectionSuspense><ExamGuides /></SectionSuspense>
    <SectionSuspense><AboutApexVouchers /></SectionSuspense>
    <SectionSuspense><FinalCTASection /></SectionSuspense>
  </>
);

const MainContent = () => {
  const { activeTab } = useVoucher();

  if (activeTab === 'dashboard') return <LazyPage><Dashboard /></LazyPage>;
  if (activeTab === 'shop') return <><LazyPage><ProductCatalog /></LazyPage><TrustStrip /></>;
  if (activeTab === 'calculator') return <><LazyPage><SavingsCalculator /></LazyPage><TrustStrip /></>;
  if (activeTab === 'exam-booking') return <LazyPage><PTEExamBookingPage /></LazyPage>;
  if (activeTab === 'how-it-works') return <LazyPage><HowItWorks /><FAQSection /></LazyPage>;
  if (activeTab === 'exam-guides') return <LazyPage><ExamGuides /><FinalCTASection /></LazyPage>;
  if (activeTab === 'testimonials') return <LazyPage><Testimonials /><FinalCTASection /></LazyPage>;
  if (activeTab === 'faq') return <LazyPage><FAQSection /><FinalCTASection /></LazyPage>;
  if (activeTab === 'awards') return <LazyPage><AwardsAndAchievements /><FinalCTASection /></LazyPage>;

  return <HomePage />;
};

const SharedModalsAndWidgets = ({ minimal = false, floating = true, adminDrawer = true }) => {
  const {
    selectedProductDetail,
    isCheckoutOpen,
    checkoutProduct,
    isPTEBookingOpen,
    isVoucherRequestOpen,
    isAdminOpen,
  } = useVoucher();

  return (
    <>
    {selectedProductDetail && (
      <ModalSuspense>
        <ProductDetailModal />
      </ModalSuspense>
    )}
    {isCheckoutOpen && checkoutProduct && (
      <ModalSuspense>
        <CheckoutModal />
      </ModalSuspense>
    )}
    {isPTEBookingOpen && (
      <ModalSuspense>
        <PTEBookingModal />
      </ModalSuspense>
    )}
    {isVoucherRequestOpen && (
      <ModalSuspense>
        <VoucherRequestModal />
      </ModalSuspense>
    )}
    <CartDrawer />
    {!minimal && (
      <>
        <SocialProofToast />
        <ModalSuspense>
          <LiveChatWidget />
        </ModalSuspense>
        <FloatingSupportWidget />
      </>
    )}
    {floating && <FloatingWhatsApp />}
    {adminDrawer && isAdminOpen && (
      <ModalSuspense>
        <AdminControlDrawer />
      </ModalSuspense>
    )}
  </>
  );
};

const MarketingLayout = () => (
  <div className="min-h-screen bg-white dark:bg-[#06070B] text-neutral-900 dark:text-white flex flex-col justify-between antialiased transition-colors duration-300">
    <Navbar />
    <ToastContainer />
    <main className="flex-1">
      <MainContent />
    </main>
    <LegalTrustFooter />
    <SharedModalsAndWidgets />
  </div>
);

const ExamBookingLayout = () => (
  <div className="min-h-screen bg-white dark:bg-[#06070B] text-neutral-900 dark:text-white flex flex-col justify-between antialiased transition-colors duration-300">
    <Navbar />
    <ToastContainer />
    <main className="flex-1">
      <LazyPage><PTEExamBookingPage /></LazyPage>
    </main>
    <LegalTrustFooter />
    <SharedModalsAndWidgets />
  </div>
);

const VoucherDetailLayout = () => (
  <div className="min-h-screen bg-white dark:bg-[#06070B] text-neutral-900 dark:text-white flex flex-col justify-between antialiased transition-colors duration-300">
    <Navbar />
    <ToastContainer />
    <main className="flex-1 pb-20 lg:pb-0">
      <LazyPage><VoucherDetailPage /></LazyPage>
    </main>
    <LegalTrustFooter />
    <SharedModalsAndWidgets />
  </div>
);

const PolicyPageLayout = ({ children }) => (
  <div className="min-h-screen bg-white dark:bg-[#06070B] text-neutral-900 dark:text-white flex flex-col justify-between antialiased transition-colors duration-300">
    <Navbar />
    <ToastContainer />
    <main className="flex-1">
      <LazyPage>{children}</LazyPage>
    </main>
    <LegalTrustFooter />
    <SharedModalsAndWidgets />
  </div>
);

const AccountLayout = () => (
  <div className="min-h-screen bg-white dark:bg-[#06070B] text-neutral-900 dark:text-white flex flex-col justify-between antialiased transition-colors duration-300">
    <Navbar />
    <ToastContainer />
    <main className="flex-1">
      <LazyPage><AccountHome /></LazyPage>
    </main>
    <LegalTrustFooter />
    <SharedModalsAndWidgets />
  </div>
);

const AdminLayout = () => (
  <div className="min-h-screen bg-white dark:bg-[#06070B] text-neutral-900 dark:text-white flex flex-col antialiased transition-colors duration-300">
    <ToastContainer />
    <main className="flex-1">
      <LazyPage><AdminConsole /></LazyPage>
    </main>
    <SharedModalsAndWidgets minimal floating={false} adminDrawer={false} />
  </div>
);

const AuthLayout = ({ children }) => (
  <div className="min-h-screen bg-white dark:bg-[#06070B] text-neutral-900 dark:text-white flex flex-col antialiased transition-colors duration-300">
    <ToastContainer />
    <LazyPage minHeight="min-h-screen">{children}</LazyPage>
    <SharedModalsAndWidgets minimal />
  </div>
);

function RouterContent() {
  return (
    <Routes>
      <Route path="/" element={<MarketingLayout />} />
      <Route path="/exam-booking" element={<ExamBookingLayout />} />
      <Route path="/exam-vouchers/:slug" element={<VoucherDetailLayout />} />

      {/* Dedicated Policy & Guide Routes (Accessible from Footer) */}
      <Route path="/refund-policy" element={<PolicyPageLayout><RefundPolicyPage /></PolicyPageLayout>} />
      <Route path="/policies/refund-cancellation" element={<Navigate to="/refund-policy" replace />} />
      <Route path="/how-to-reschedule-cancel-pte-exam" element={<PolicyPageLayout><PTEReschedulingGuidePage /></PolicyPageLayout>} />
      <Route path="/pte-rescheduling-guide" element={<Navigate to="/how-to-reschedule-cancel-pte-exam" replace />} />
      <Route path="/reschedule-pte-exam" element={<Navigate to="/how-to-reschedule-cancel-pte-exam" replace />} />
      <Route path="/voucher-refund-policy" element={<PolicyPageLayout><VoucherRefundPolicyPage /></PolicyPageLayout>} />
      <Route path="/terms" element={<PolicyPageLayout><TermsAndConditionsPage /></PolicyPageLayout>} />
      <Route path="/terms-and-conditions" element={<Navigate to="/terms" replace />} />
      <Route path="/terms-of-service" element={<Navigate to="/terms" replace />} />
      <Route path="/privacy-policy" element={<PolicyPageLayout><PrivacyPolicyPage /></PolicyPageLayout>} />
      <Route path="/privacy" element={<Navigate to="/privacy-policy" replace />} />

      {/* Blog / Exam Guides Routes */}
      <Route path="/blog" element={<PolicyPageLayout><BlogIndexPage /><FinalCTASection /></PolicyPageLayout>} />
      <Route path="/blog/:slug" element={<PolicyPageLayout><BlogPostPage /></PolicyPageLayout>} />
      <Route path="/guides" element={<Navigate to="/blog" replace />} />
      <Route path="/exam-guides" element={<Navigate to="/blog" replace />} />

      <Route path="/login" element={<AuthLayout><LoginPage /></AuthLayout>} />
      <Route path="/admin/login" element={<AuthLayout><AdminLoginPage /></AuthLayout>} />
      <Route path="/register" element={<AuthLayout><RegisterPage /></AuthLayout>} />
      <Route path="/forgot-password" element={<AuthLayout><ForgotPasswordPage /></AuthLayout>} />
      <Route path="/reset-password" element={<AuthLayout><ResetPasswordPage /></AuthLayout>} />
      <Route path="/payment/return" element={<PaymentReturnPage />} />
      <Route path="/payment/cashfree/return" element={<PaymentReturnPage />} />
      <Route
        path="/account"
        element={
          <ProtectedRoute>
            <AccountLayout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/blog-preview/:id"
        element={
          <ProtectedRoute requireAdmin>
            <PolicyPageLayout><BlogPreviewPage /></PolicyPageLayout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <VoucherProvider>
            <RouterContent />
          </VoucherProvider>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
