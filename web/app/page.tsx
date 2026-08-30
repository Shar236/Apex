import type { Metadata } from 'next';
import { HeroSection } from '@/components/hero/hero-section';
import { TrustStrip } from '@/components/trust-strip';
import { ExamLogoMarquee } from '@/components/exam-logo-marquee';
import { ExamCategorySection } from '@/components/exam-category-section';
import { FeaturedVouchers } from '@/components/featured-vouchers';
import { PTEBookingAssistance } from '@/components/pte-booking-assistance';
import { SavingsCalculator } from '@/components/savings-calculator';
import { HowItWorks } from '@/components/how-it-works';
import { WhyApexVoucher } from '@/components/why-apex-voucher';
import { VisualExplainerSection } from '@/components/visual-explainer-section';
import { RedemptionAndSecurity } from '@/components/redemption-and-security';
import { Testimonials } from '@/components/testimonials';
import { FAQSection } from '@/components/faq-section';
import { ExamGuidesSection } from '@/components/exam-guides-section';
import { AboutApexVouchers } from '@/components/about-apex-vouchers';
import { FinalCTASection } from '@/components/final-cta-section';
import { getWebsiteConfig } from '@/lib/website-config';
import { listPublicBlogPosts } from '@/lib/blog-api';
import { buildMetadata, JsonLd } from '@/lib/seo';
import { siteConfig } from '@/lib/config';
import { FAQ_ITEMS } from '@/lib/faq-data';

export async function generateMetadata(): Promise<Metadata> {
  const config = await getWebsiteConfig();
  return buildMetadata({
    title: config.globalSEO.defaultSeoTitle || siteConfig.defaultTitle,
    description: config.globalSEO.defaultMetaDescription || siteConfig.defaultDescription,
    path: '/',
    ogImage: config.globalSEO.defaultOgImage,
  });
}

export default async function HomePage() {
  const [config, blogResult] = await Promise.all([getWebsiteConfig(), listPublicBlogPosts({ limit: 6 })]);

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };

  return (
    <>
      {config.structuredData.organization && Object.keys(config.structuredData.organization).length > 0 && <JsonLd data={config.structuredData.organization} />}
      {config.structuredData.website && Object.keys(config.structuredData.website).length > 0 && <JsonLd data={config.structuredData.website} />}
      <JsonLd data={faqJsonLd} />

      <HeroSection heroSettings={config.heroSettings} activeCampaign={config.activeCampaign} benefitCards={config.benefitCards} />
      <TrustStrip />
      <ExamLogoMarquee />
      <ExamCategorySection products={config.products} />
      <FeaturedVouchers products={config.products} />
      <PTEBookingAssistance products={config.products} />
      <SavingsCalculator products={config.products} />
      <HowItWorks />
      <WhyApexVoucher />
      <VisualExplainerSection />
      <RedemptionAndSecurity />
      <Testimonials />
      <FAQSection />
      <ExamGuidesSection posts={blogResult.data} />
      <AboutApexVouchers />
      <FinalCTASection />
    </>
  );
}
