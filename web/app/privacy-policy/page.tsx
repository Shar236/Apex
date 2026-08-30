import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, ShieldCheck, Eye, Server, CreditCard, Cookie, Share2, Clock, ExternalLink, Users, AlertCircle, Mail, Phone } from 'lucide-react';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Privacy Policy',
  description: 'Read the Apex Vouchers Privacy Policy to understand how personal information is collected, used, protected and handled when using our website and services.',
  path: '/privacy-policy',
});

const SUPPORT_PHONE = '+91 98559 26113';
const SUPPORT_EMAIL = 'info@apexvouchers.com';

const COLLECTED = ['Name', 'Email address', 'Mobile / WhatsApp phone number', 'Billing or transaction information', 'Order and voucher information', 'Information provided when contacting customer support', 'Website usage information', 'Device, browser and technical information', 'IP address where technically required for security, fraud prevention or website operations'];
const USES = ['Process voucher orders and deliver purchased products or services', 'Deliver exam voucher codes and transaction receipts instantly to your Email and WhatsApp', 'Respond to customer enquiries and pre-purchase questions', 'Provide customer support, voucher verification, and assistance', 'Process payments securely through applicable payment providers', 'Maintain order, accounting, and transaction records', 'Improve website functionality, performance, and user experience', 'Prevent fraud, abuse, and unauthorized activity', 'Comply with applicable legal, taxation, and regulatory requirements', 'Communicate important information relating to an order or service'];
const SHARED = ['Payment processors to complete transactions', 'Website and cloud hosting infrastructure providers', 'Email or communication providers for delivering order confirmations and vouchers', 'Analytics or security providers to protect site integrity', 'Delivery and service partners where applicable', 'Legal or regulatory authorities where required by applicable law'];
const RETENTION = ['Providing services and delivering vouchers', 'Maintaining transaction records', 'Customer support and warranty', 'Accounting and tax compliance', 'Legal obligations', 'Dispute resolution', 'Security and fraud prevention'];

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-surface-sunken text-ink min-h-screen antialiased transition-colors duration-300">
      <div className="bg-surface border-b border-line">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <nav className="flex items-center gap-2 text-xs font-normal text-ink-muted">
            <Link href="/" className="hover:text-accent transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-neutral-400">Policies</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-accent font-normal">Privacy Policy</span>
          </nav>
        </div>
      </div>

      <header className="bg-surface border-b border-line py-12 sm:py-16 text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-4">
          <h1 className="font-heading font-medium text-3xl sm:text-4xl lg:text-5xl text-ink tracking-tight">Privacy Policy</h1>
          <p className="text-sm sm:text-base text-ink-muted font-medium leading-relaxed">Apex Vouchers respects your privacy and is committed to protecting the personal information provided by customers and visitors when using our website, purchasing PTE exam vouchers, contacting our support team, or using our services.</p>
          <div className="pt-2 text-xs font-mono text-neutral-400 font-normal">Last Updated: January 1, 2026</div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8 text-sm sm:text-base text-ink-muted leading-relaxed">
        <section className="bg-surface p-6 sm:p-8 rounded-3xl border border-line shadow-sm space-y-4">
          <h2 className="font-heading font-medium text-xl sm:text-2xl text-ink flex items-center gap-2.5"><Eye className="w-5 h-5 text-accent shrink-0" /> 1. Information We Collect</h2>
          <p>When you use our website, create an account, purchase discounted examination vouchers, or contact our customer support team, Apex Vouchers may collect information that is reasonably necessary to fulfill your orders and operate our services, such as:</p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm text-ink-muted pt-1">
            {COLLECTED.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-surface-raised p-3 rounded-2xl border border-line">
                <span className="text-accent font-normal mt-0.5">•</span>
                <span className="font-medium text-ink">{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-neutral-500 pt-1">We only collect personal information that is relevant and necessary to deliver your voucher codes, secure your transactions, and provide customer support.</p>
        </section>

        <section className="bg-surface p-6 sm:p-8 rounded-3xl border border-line shadow-sm space-y-4">
          <h2 className="font-heading font-medium text-xl sm:text-2xl text-ink flex items-center gap-2.5"><Server className="w-5 h-5 text-accent shrink-0" /> 2. How We Use Your Information</h2>
          <p>Collected information may be used to:</p>
          <ul className="space-y-2 text-xs sm:text-sm text-ink-muted pl-1">
            {USES.map((use, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                <span className="leading-relaxed">{use}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-surface p-6 sm:p-8 rounded-3xl border border-line shadow-sm space-y-4">
          <h2 className="font-heading font-medium text-xl sm:text-2xl text-ink flex items-center gap-2.5"><CreditCard className="w-5 h-5 text-accent shrink-0" /> 3. Payment Information</h2>
          <p>Payment information is processed securely through authorized third-party payment providers, which maintain certified PCI-DSS Level 1 compliance standards.</p>
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-xs sm:text-sm text-emerald-900 dark:text-emerald-200 font-medium space-y-1">
            <p className="font-normal flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Zero Card Credential Storage:</p>
            <p className="text-xs">Apex Vouchers does not collect, store, or process complete credit/debit card numbers, CVV numbers, or online banking passwords on our servers.</p>
          </div>
        </section>

        <section className="bg-surface p-6 sm:p-8 rounded-3xl border border-line shadow-sm space-y-4">
          <h2 className="font-heading font-medium text-xl sm:text-2xl text-ink flex items-center gap-2.5"><Cookie className="w-5 h-5 text-accent shrink-0" /> 4. Cookies and Similar Technologies</h2>
          <p>The website may use cookies and similar technologies for:</p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm text-ink-muted">
            <li className="p-3 bg-surface-raised rounded-2xl border border-line"><strong className="text-ink block mb-0.5">Website Functionality</strong><span className="text-neutral-500 text-xs">Managing your session, login authentication, and cart items</span></li>
            <li className="p-3 bg-surface-raised rounded-2xl border border-line"><strong className="text-ink block mb-0.5">Preferences</strong><span className="text-neutral-500 text-xs">Remembering dark mode and display preferences</span></li>
            <li className="p-3 bg-surface-raised rounded-2xl border border-line"><strong className="text-ink block mb-0.5">Analytics</strong><span className="text-neutral-500 text-xs">Analyzing aggregated website traffic and popular vouchers</span></li>
            <li className="p-3 bg-surface-raised rounded-2xl border border-line"><strong className="text-ink block mb-0.5">Security & Performance</strong><span className="text-neutral-500 text-xs">Protecting against malicious traffic and improving load times</span></li>
          </ul>
          <p className="text-xs text-neutral-500">Users may control or disable cookies through their browser settings. Note that disabling certain essential cookies may affect some website features.</p>
        </section>

        <section className="bg-surface p-6 sm:p-8 rounded-3xl border border-line shadow-sm space-y-4">
          <h2 className="font-heading font-medium text-xl sm:text-2xl text-ink flex items-center gap-2.5"><Share2 className="w-5 h-5 text-accent shrink-0" /> 5. Sharing of Information</h2>
          <p>Personal information may be shared with trusted service providers only where reasonably necessary to operate our business, such as:</p>
          <ul className="space-y-2 text-xs sm:text-sm text-ink-muted pl-1">
            {SHARED.map((partner, idx) => (
              <li key={idx} className="flex items-start gap-2"><span className="text-accent font-normal">•</span><span>{partner}</span></li>
            ))}
          </ul>
          <p className="text-xs text-neutral-500 pt-1">Apex Vouchers does not sell, rent, or trade customer personal data to third-party marketers or advertisers.</p>
        </section>

        <section className="bg-surface p-6 sm:p-8 rounded-3xl border border-line shadow-sm space-y-4">
          <h2 className="font-heading font-medium text-xl sm:text-2xl text-ink flex items-center gap-2.5"><ShieldCheck className="w-5 h-5 text-accent shrink-0" /> 6. Data Security</h2>
          <p>We implement reasonable technical and organizational measures to protect personal information from unauthorized access, misuse, alteration, or disclosure. All data transmissions are secured with 256-bit TLS/SSL encryption.</p>
          <p className="text-xs text-neutral-500 leading-relaxed">Please note that no method of electronic transmission over the internet or electronic storage system can be guaranteed to be completely secure.</p>
        </section>

        <section className="bg-surface p-6 sm:p-8 rounded-3xl border border-line shadow-sm space-y-4">
          <h2 className="font-heading font-medium text-xl sm:text-2xl text-ink flex items-center gap-2.5"><Clock className="w-5 h-5 text-accent shrink-0" /> 7. Data Retention</h2>
          <p>Personal information may be retained for as long as reasonably necessary for:</p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-ink-muted">
            {RETENTION.map((item, idx) => (
              <li key={idx} className="flex items-center gap-2 bg-surface-raised p-2.5 rounded-2xl border border-line">
                <span className="text-accent font-normal">✓</span>
                <span className="text-xs font-medium">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-surface p-6 sm:p-8 rounded-3xl border border-line shadow-sm space-y-4">
          <h2 className="font-heading font-medium text-xl sm:text-2xl text-ink flex items-center gap-2.5"><ShieldCheck className="w-5 h-5 text-accent shrink-0" /> 8. Your Privacy Rights</h2>
          <p>Subject to applicable law, users may have rights relating to their personal information, including:</p>
          <ul className="space-y-1.5 text-xs sm:text-sm text-ink-muted pl-1 list-disc list-inside">
            <li>Requesting access to the personal data we hold about you</li>
            <li>Requesting correction or updates to inaccurate or incomplete information</li>
            <li>Requesting deletion of your personal data where applicable and permitted by legal and statutory recordkeeping requirements</li>
          </ul>
          <p className="text-xs text-neutral-500 pt-1">To submit a request, please contact our support team using the contact details below.</p>
        </section>

        <section className="bg-surface p-6 sm:p-8 rounded-3xl border border-line shadow-sm space-y-4">
          <h2 className="font-heading font-medium text-xl sm:text-2xl text-ink flex items-center gap-2.5"><ExternalLink className="w-5 h-5 text-accent shrink-0" /> 9. Third-Party Websites</h2>
          <p>Apex Vouchers may contain links to third-party websites, including examination bodies (such as Pearson VUE/myPTE, ETS, or Duolingo), payment providers, or other external services.</p>
          <p className="text-xs text-neutral-500 leading-relaxed">Apex Vouchers is not responsible for the privacy practices or content of third-party websites. Users should review the privacy policies of those websites separately.</p>
        </section>

        <section className="bg-surface p-6 sm:p-8 rounded-3xl border border-line shadow-sm space-y-4">
          <h2 className="font-heading font-medium text-xl sm:text-2xl text-ink flex items-center gap-2.5"><Users className="w-5 h-5 text-accent shrink-0" /> 10. Children&apos;s Privacy</h2>
          <p>The website is not intentionally designed to collect personal information from children in violation of applicable law.</p>
        </section>

        <section className="bg-surface p-6 sm:p-8 rounded-3xl border border-line shadow-sm space-y-4">
          <h2 className="font-heading font-medium text-xl sm:text-2xl text-ink flex items-center gap-2.5"><AlertCircle className="w-5 h-5 text-accent shrink-0" /> 11. Changes to This Privacy Policy</h2>
          <p>Apex Vouchers may update this Privacy Policy from time to time. When changes are made, the updated <strong>&ldquo;Last Updated&rdquo;</strong> date will be displayed at the top of this page.</p>
        </section>

        <section className="p-6 sm:p-8 rounded-3xl bg-[#0B0D12] text-white border border-white/5 space-y-4">
          <h2 className="font-heading font-medium text-xl sm:text-2xl text-white">12. Questions about this Privacy Policy?</h2>
          <p className="text-sm text-neutral-300 leading-relaxed">Customers can contact Apex Vouchers through the official contact and support channels provided on the website:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-neutral-900 border border-white/5 space-y-1">
              <div className="text-xs text-neutral-400 font-normal uppercase tracking-wider flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-accent" /> Official Email</div>
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-accent hover:text-pink-400 font-normal text-sm sm:text-base break-all transition-colors">{SUPPORT_EMAIL}</a>
            </div>
            <div className="p-4 rounded-2xl bg-neutral-900 border border-white/5 space-y-1">
              <div className="text-xs text-neutral-400 font-normal uppercase tracking-wider flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-accent" /> Phone / WhatsApp</div>
              <a href={`tel:${SUPPORT_PHONE.replace(/\s+/g, '')}`} className="text-accent hover:text-pink-400 font-normal text-sm sm:text-base transition-colors">{SUPPORT_PHONE}</a>
            </div>
          </div>
          <div className="pt-2 text-xs text-neutral-400">Website: <a href="https://apexvouchers.com" className="text-accent hover:underline">https://apexvouchers.com</a></div>
        </section>
      </main>
    </div>
  );
}