import React from 'react';
import { VoucherProvider, useVoucher } from './context/VoucherContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Hero3D } from './components/Hero3D';
import { TrustStrip } from './components/TrustStrip';
import { ExamCategorySection } from './components/ExamCategorySection';
import { BestSellingVouchers } from './components/BestSellingVouchers';
import { SavingsCalculator } from './components/SavingsCalculator';
import { HowItWorks } from './components/HowItWorks';
import { WhyApexVoucher } from './components/WhyApexVoucher';
import { VisualExplainerSection } from './components/VisualExplainerSection';
import { VideoReelsCarousel } from './components/VideoReelsCarousel';
import { RedemptionAndSecurity } from './components/RedemptionAndSecurity';
import { Testimonials } from './components/Testimonials';
import { FAQSection } from './components/FAQSection';
import { ExamGuides } from './components/ExamGuides';
import { AboutApexVouchers } from './components/AboutApexVouchers';
import { FinalCTASection } from './components/FinalCTASection';
import { LegalTrustFooter } from './components/LegalTrustFooter';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { ProductCatalog } from './components/ProductCatalog';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CheckoutModal } from './components/CheckoutModal';
import { Dashboard } from './components/Dashboard';
import { LiveChatWidget } from './components/LiveChatWidget';
import { SocialProofToast } from './components/SocialProofToast';
import { AdminControlDrawer } from './components/AdminControlDrawer';
import { ExamLogoMarquee } from './components/ExamLogoMarquee';
import { FloatingSupportWidget } from './components/FloatingSupportWidget';
import { ShoppingBag, X, Trash2, ArrowRight, Lock, Ticket } from 'lucide-react';
import { ApexLogo } from './components/ApexLogo';

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
              <div className="w-10 h-10 rounded-xl bg-[#FF005C] p-[2px] shadow-sm">
                <div className="w-full h-full bg-white dark:bg-[#161616] rounded-[10px] flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-[#FF005C]" strokeWidth={2.5} />
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
                <div key={item.id} className="bg-[#FFF0F5] dark:bg-[#2A0A17] p-4 rounded-2xl border border-[#FF005C]/20 flex items-center justify-between gap-3 group hover:bg-white dark:hover:bg-[#161616] transition-all duration-200">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="inline-flex px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-100 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                        Save {formatPrice(item.savings)}
                      </span>
                    </div>
                    <h4 className="font-heading font-extrabold text-sm text-neutral-900 dark:text-white leading-snug mb-1 line-clamp-2">{item.name}</h4>
                    <span className="font-heading font-black text-lg text-[#FF005C] leading-none">{formatPrice(item.discountedPrice)}</span>
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
              <div className="w-20 h-20 rounded-[24px] bg-neutral-100 dark:bg-[#262626] border border-[#EAEAEA] dark:border-[#292929] flex items-center justify-center mx-auto">
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
            <div className="space-y-2.5 p-4 rounded-2xl bg-[#FFF0F5] dark:bg-[#2A0A17] border border-[#FF005C]/20">
              <div className="flex justify-between items-center text-sm font-semibold text-neutral-500 dark:text-[#B5B5B5]">
                <span>Subtotal (MRP)</span>
                <span className="line-through">{formatPrice(totalOriginal)}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold text-emerald-600 dark:text-emerald-400">
                <span>🎁 Total Savings</span>
                <span>− {formatPrice(totalSavings)}</span>
              </div>
              <div className="h-px bg-[#FF005C]/20 my-1" />
              <div className="flex justify-between items-baseline pt-1">
                <span className="text-sm font-black text-neutral-900 dark:text-white uppercase tracking-wider">Total Payable</span>
                <span className="font-heading font-black text-3xl text-neutral-900 dark:text-white tabular-nums">{formatPrice(totalAmount)}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setIsCartOpen(false);
                startCheckout(cart[0]);
              }}
              className="w-full py-4 rounded-2xl btn-pink text-white font-black text-base shadow-xl flex items-center justify-center gap-2.5"
            >
              <Lock className="w-5 h-5" strokeWidth={2.5} />
              <span>Proceed to Secure Checkout</span>
              <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
            </button>

            <p className="text-center text-[11px] font-bold text-neutral-500 dark:text-neutral-400 flex items-center justify-center gap-1.5">
              <Ticket className="w-3.5 h-3.5 text-[#FF005C]" strokeWidth={2.5} />
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
    <div className="fixed top-24 right-6 z-50 max-w-sm bg-white dark:bg-[#161616] border-2 border-[#FF005C] text-neutral-900 dark:text-white px-5 py-3.5 rounded-2xl shadow-xl backdrop-blur-md text-sm font-bold animate-in slide-in-from-top-3 flex items-center gap-3">
      <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-100 flex items-center justify-center flex-shrink-0">
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
    <ExamCategorySection />
    <BestSellingVouchers />
    <SavingsCalculator />
    <HowItWorks />
    <WhyApexVoucher />
    <VisualExplainerSection />
    <VideoReelsCarousel />
    <RedemptionAndSecurity />
    <Testimonials />
    <FAQSection />
    <ExamGuides />
    <AboutApexVouchers />
    <FinalCTASection />
  </>
);

const MainContent = () => {
  const { activeTab } = useVoucher();

  if (activeTab === 'dashboard') return <Dashboard />;
  if (activeTab === 'shop') return <><ProductCatalog /><TrustStrip /></>;
  if (activeTab === 'calculator') return <><SavingsCalculator /><TrustStrip /></>;
  if (activeTab === 'how-it-works') return <><HowItWorks /><FAQSection /></>;
  if (activeTab === 'exam-guides') return <><ExamGuides /><FinalCTASection /></>;
  if (activeTab === 'testimonials') return <><Testimonials /><FinalCTASection /></>;
  if (activeTab === 'faq') return <><FAQSection /><FinalCTASection /></>;

  return <HomePage />;
};

export function App() {
  return (
    <ThemeProvider>
      <VoucherProvider>
        <div className="min-h-screen bg-white dark:bg-[#0A0A0A] text-neutral-900 dark:text-white flex flex-col justify-between antialiased transition-colors duration-300">
          <Navbar />
          <ToastContainer />
          <main className="flex-1">
            <MainContent />
          </main>
          <LegalTrustFooter />

          <ProductDetailModal />
          <CheckoutModal />
          <CartDrawer />
          <SocialProofToast />
          <LiveChatWidget />
          <FloatingSupportWidget />
          <FloatingWhatsApp />
          <AdminControlDrawer />
        </div>
      </VoucherProvider>
    </ThemeProvider>
  );
}

export default App;
