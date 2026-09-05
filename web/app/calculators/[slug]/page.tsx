import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CalculatorTool } from '@/components/calculators/calculator-tools';
import { CalculatorShell } from '@/components/calculators/calculator-shell';
import { buildMetadata } from '@/lib/seo';
import { CALCULATORS, SLUG_ALIASES, getCalculator } from '@/lib/calculators';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  const canonical = CALCULATORS.map((c) => ({ slug: c.slug }));
  const aliases = Object.keys(SLUG_ALIASES).map((slug) => ({ slug }));
  return [...canonical, ...aliases];
}

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { slug } = await params;
  const calculator = getCalculator(slug);
  if (!calculator) {
    return buildMetadata({
      title: 'Calculator Not Found',
      description: 'This calculator does not exist.',
      path: `/calculators/${slug}`,
      noindex: true,
    });
  }
  return buildMetadata({
    title: calculator.metaTitle,
    description: calculator.description,
    path: `/calculators/${calculator.slug}`,
  });
}

export default async function CalculatorPage({ params }: RouteParams) {
  const { slug } = await params;
  const calculator = getCalculator(slug);
  if (!calculator) notFound();

  return (
    <CalculatorShell meta={calculator}>
      <CalculatorTool slug={calculator.slug} />
    </CalculatorShell>
  );
}
