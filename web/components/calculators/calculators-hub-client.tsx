'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Calculator,
  Percent,
  School,
  Search,
  BookOpen,
  GraduationCap,
  Award,
} from 'lucide-react';
import type { CalculatorCategoryInfo } from '@/lib/calculators';

const CATEGORY_ICONS = {
  score: Calculator,
  gpa: School,
  converter: Percent,
} as const;

const CALCULATOR_ICONS: Record<string, typeof Calculator> = {
  'pte-score-calculator': Calculator,
  'ielts-band-calculator': GraduationCap,
  'toefl-score-calculator': BookOpen,
  'gre-score-calculator': Calculator,
  'sat-score-calculator': School,
  'act-score-calculator': Award,
  'wes-gpa-calculator': GraduationCap,
  'cgpa-to-gpa-calculator': School,
  'german-grade-calculator': Percent,
  'gre-to-gmat-conversion': Percent,
  'toefl-to-ielts-conversion': Percent,
  'sat-to-act-conversion': Percent,
};

export function CalculatorsHubClient({
  categories,
}: {
  categories: CalculatorCategoryInfo[];
}) {
  const [activeTab, setActiveTab] = useState<'all' | 'score' | 'gpa' | 'converter'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const allCalculators = useMemo(() => {
    return categories.flatMap((cat) =>
      cat.calculators.map((c) => ({
        ...c,
        categoryId: cat.id,
        categoryLabel: cat.label,
      }))
    );
  }, [categories]);

  const filteredCalculators = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allCalculators.filter((c) => {
      const matchesTab = activeTab === 'all' || c.categoryId === activeTab;
      if (!matchesTab) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.tagline.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q)
      );
    });
  }, [allCalculators, activeTab, searchQuery]);

  return (
    <div className="mt-10 space-y-8">
      {/* Search & Category Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 max-w-3xl mx-auto">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 p-1 rounded-2xl bg-surface border border-line shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === 'all'
                ? 'bg-accent text-white shadow-sm'
                : 'text-ink-muted hover:text-ink hover:bg-surface-raised'
            }`}
          >
            All ({allCalculators.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('score')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === 'score'
                ? 'bg-accent text-white shadow-sm'
                : 'text-ink-muted hover:text-ink hover:bg-surface-raised'
            }`}
          >
            Exam Scores
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('gpa')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === 'gpa'
                ? 'bg-accent text-white shadow-sm'
                : 'text-ink-muted hover:text-ink hover:bg-surface-raised'
            }`}
          >
            GPA & Academic
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('converter')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === 'converter'
                ? 'bg-accent text-white shadow-sm'
                : 'text-ink-muted hover:text-ink hover:bg-surface-raised'
            }`}
          >
            Converters
          </button>
        </div>

        {/* Quick Search */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Search calculators..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-2xl bg-surface border border-line text-xs sm:text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition"
          />
        </div>
      </div>

      {/* Grouped Display when No Filter, or Flat Grid when Filtered/Searched */}
      {activeTab === 'all' && !searchQuery.trim() ? (
        <div className="space-y-14">
          {categories.map((category) => {
            const Icon = CATEGORY_ICONS[category.id];
            return (
              <section key={category.id} aria-labelledby={`calculators-${category.id}`}>
                <div className="flex items-start gap-3.5 mb-6">
                  <span className="mt-0.5 inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-accent/10 border border-accent/25 text-accent shrink-0">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h2 id={`calculators-${category.id}`} className="text-[22px] sm:text-[26px] font-bold text-ink">
                      {category.label}
                    </h2>
                    <p className="text-sm text-ink-muted mt-0.5 leading-relaxed">{category.blurb}</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {category.calculators.map((calculator) => {
                    const CalcIcon = CALCULATOR_ICONS[calculator.slug] || Calculator;
                    return (
                      <Link
                        key={calculator.slug}
                        href={`/calculators/${calculator.slug}`}
                        className="group flex flex-col rounded-3xl bg-surface border border-line p-6 hover:border-accent/40 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                      >
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="w-9 h-9 rounded-xl bg-accent/10 text-accent flex items-center justify-center border border-accent/20 group-hover:scale-105 transition">
                            <CalcIcon className="w-4 h-4" />
                          </span>
                          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-surface-raised border border-line text-ink-muted">
                            Free Tool
                          </span>
                        </div>

                        <span className="font-bold text-[16px] text-ink group-hover:text-accent transition-colors">
                          {calculator.name}
                        </span>
                        <span className="text-[13px] text-ink-muted mt-2 leading-relaxed line-clamp-2">
                          {calculator.tagline}
                        </span>

                        <div className="mt-auto pt-5 flex items-center justify-between border-t border-line/60">
                          <span className="text-xs font-bold text-accent">Calculate Score</span>
                          <ArrowRight
                            className="w-4 h-4 text-accent group-hover:translate-x-1 transition-transform"
                            aria-hidden="true"
                          />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div>
          {filteredCalculators.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCalculators.map((calculator) => {
                const CalcIcon = CALCULATOR_ICONS[calculator.slug] || Calculator;
                return (
                  <Link
                    key={calculator.slug}
                    href={`/calculators/${calculator.slug}`}
                    className="group flex flex-col rounded-3xl bg-surface border border-line p-6 hover:border-accent/40 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="w-9 h-9 rounded-xl bg-accent/10 text-accent flex items-center justify-center border border-accent/20 group-hover:scale-105 transition">
                        <CalcIcon className="w-4 h-4" />
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-surface-raised border border-line text-ink-muted">
                        {calculator.categoryLabel}
                      </span>
                    </div>

                    <span className="font-bold text-[16px] text-ink group-hover:text-accent transition-colors">
                      {calculator.name}
                    </span>
                    <span className="text-[13px] text-ink-muted mt-2 leading-relaxed line-clamp-2">
                      {calculator.tagline}
                    </span>

                    <div className="mt-auto pt-5 flex items-center justify-between border-t border-line/60">
                      <span className="text-xs font-bold text-accent">Calculate Score</span>
                      <ArrowRight
                        className="w-4 h-4 text-accent group-hover:translate-x-1 transition-transform"
                        aria-hidden="true"
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="rounded-3xl border border-line bg-surface p-12 text-center max-w-md mx-auto">
              <Calculator className="w-8 h-8 text-ink-muted mx-auto mb-3 opacity-60" />
              <p className="text-base font-bold text-ink">No calculators found</p>
              <p className="text-xs text-ink-muted mt-1">
                No matching tools for &ldquo;{searchQuery}&rdquo;. Try clearing your search.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveTab('all');
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-accent text-white text-xs font-semibold hover:bg-accent-hover transition cursor-pointer"
              >
                Reset Search Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
