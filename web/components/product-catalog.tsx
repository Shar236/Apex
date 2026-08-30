'use client';

import { useMemo, useState } from 'react';
import { Search, ArrowUpDown, LayoutGrid } from 'lucide-react';
import { VoucherCard } from '@/components/voucher-card';
import type { Product } from '@/lib/types';

const SORT_OPTIONS = [
  { id: 'recommended', label: 'Recommended' },
  { id: 'price-asc', label: 'Price: Low to High' },
  { id: 'price-desc', label: 'Price: High to Low' },
] as const;

type SortId = (typeof SORT_OPTIONS)[number]['id'];

/** All products are server-rendered into the initial HTML (no client-side page cap) so the full catalog stays crawlable without JS. */
export function ProductCatalog({ products }: { products: Product[] }) {
  const [activeBrandFilter, setActiveBrandFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortId>('recommended');

  const brands = useMemo(() => {
    const unique = Array.from(new Set(products.map((p) => p.provider || p.brand).filter(Boolean))) as string[];
    return ['All', ...unique.sort()];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = products.filter((product) => {
      const matchesBrand = activeBrandFilter === 'All' || product.provider === activeBrandFilter || product.brand === activeBrandFilter;
      const matchesSearch =
        !q ||
        product.name.toLowerCase().includes(q) ||
        (product.category || '').toLowerCase().includes(q) ||
        (product.provider || '').toLowerCase().includes(q) ||
        (product.brand || '').toLowerCase().includes(q) ||
        (product.badges || []).some((b) => b.toLowerCase().includes(q));
      return matchesBrand && matchesSearch;
    });

    if (sortBy === 'price-asc') {
      list = [...list].sort((a, b) => (a.discountedPrice ?? a.sellingPrice) - (b.discountedPrice ?? b.sellingPrice));
    } else if (sortBy === 'price-desc') {
      list = [...list].sort((a, b) => (b.discountedPrice ?? b.sellingPrice) - (a.discountedPrice ?? a.sellingPrice));
    } else {
      list = [...list].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    }
    return list;
  }, [products, activeBrandFilter, searchQuery, sortBy]);

  return (
    <section className="py-16 sm:py-24 bg-surface-raised border-b border-line transition-colors duration-300 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface border border-line shadow-sm text-xs font-normal text-ink-muted mb-4">
            <LayoutGrid className="w-4 h-4 text-accent" />
            <span>OFFICIAL EXAM VOUCHERS STORE</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-light text-ink tracking-tight">
            Explore All <span className="text-accent">Exam Vouchers</span>
          </h1>
          <p className="text-ink-muted font-medium text-base sm:text-lg mt-3">Choose from our range of official exam vouchers and save on your next test.</p>
        </div>

        <div className="flex flex-col gap-5 mb-10 pb-6 border-b border-line">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {brands.map((b) => (
                <button
                  key={b}
                  onClick={() => setActiveBrandFilter(b)}
                  className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    activeBrandFilter === b ? 'bg-accent text-white shadow-md shadow-accent/20' : 'bg-surface text-ink-muted border border-line hover:border-accent/50 hover:text-accent'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="relative w-full sm:w-72 lg:w-80">
                <Search className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search vouchers, provider, category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-line text-xs font-normal text-ink placeholder:text-ink-muted focus:outline-none focus:border-accent/50 transition-all shadow-sm"
                />
              </div>

              <div className="relative">
                <ArrowUpDown className="w-3.5 h-3.5 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortId)}
                  className="pl-8 pr-4 py-2.5 rounded-xl bg-surface border border-line text-xs font-normal text-ink-muted focus:outline-none focus:border-accent/50 appearance-none cursor-pointer transition-all shadow-sm"
                >
                  {SORT_OPTIONS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <>
            <p className="text-xs font-normal text-ink-muted mb-6">Showing {filteredProducts.length} vouchers</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 items-stretch">
              {filteredProducts.map((p) => (
                <VoucherCard key={p._id || p.id} product={p} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20 bg-surface rounded-3xl border border-line p-8 space-y-3">
            <p className="font-heading font-medium text-lg text-ink">No vouchers match your search criteria</p>
            <p className="text-xs text-ink-muted">Try resetting your filter or search query to see all available vouchers.</p>
            <button
              onClick={() => {
                setActiveBrandFilter('All');
                setSearchQuery('');
              }}
              className="bg-accent hover:bg-accent-hover text-white font-medium text-xs px-6 py-2.5 rounded-full transition-colors cursor-pointer shadow-md"
            >
              Reset Filters
            </button>
          </div>
        )}

        <p className="text-center text-[11px] font-medium text-ink-muted mt-16 max-w-2xl mx-auto leading-relaxed">
          All trademarks and logos belong to their respective owners. Apex Vouchers is an independent voucher/service provider unless otherwise stated.
        </p>
      </div>
    </section>
  );
}
