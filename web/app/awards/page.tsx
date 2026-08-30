import type { Metadata } from 'next';
import { listAwards } from '@/lib/award-api';
import { AwardsSection } from '@/components/awards/awards-section';
import { buildMetadata, JsonLd } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Awards & Achievements',
  description:
    'Explore the awards, recognitions, certificates and milestones earned by Apex Vouchers — trusted partner for discounted exam vouchers.',
  path: '/awards',
});

export default async function AwardsPage() {
  const res = await listAwards({ page: 1, limit: 9 });
  const awards = res.data || [];

  const itemListJsonLd = awards.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Apex Vouchers Awards & Achievements',
        itemListElement: awards.slice(0, 12).map((a, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'CreativeWork',
            name: a.title,
            description: a.description,
            datePublished: a.year || undefined,
          },
        })),
      }
    : null;

  return (
    <>
      {itemListJsonLd && <JsonLd data={itemListJsonLd} />}
      <AwardsSection initialAwards={awards} total={res.total} featuredCount={res.featuredCount} />
    </>
  );
}
