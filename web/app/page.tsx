import type { Metadata } from 'next';
import { HeroSection } from '@/components/hero/hero-section';
import { TrustStrip } from '@/components/trust-strip';
import { ExamLogoMarquee } from '@/components/exam-logo-marquee';
import { FeaturedVouchers } from '@/components/featured-vouchers';
import { HowItWorks } from '@/components/how-it-works';
import { WhyApexVoucher } from '@/components/why-apex-voucher';
import { Testimonials } from '@/components/testimonials';
import { FAQSection } from '@/components/faq-section';
import { FAQ_ITEMS } from '@/lib/faq-data';
import { FinalCTASection } from '@/components/final-cta-section';
import { getWebsiteConfig } from '@/lib/website-config';
import { buildMetadata, JsonLd } from '@/lib/seo';
import { siteConfig } from '@/lib/config';

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
  const config = await getWebsiteConfig();

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
      <FeaturedVouchers products={config.products} />
      <HowItWorks />
      <WhyApexVoucher />
      <Testimonials />
      <FAQSection />
      <FinalCTASection />
    </>
  );
}
