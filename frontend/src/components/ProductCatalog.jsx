import React, { useEffect, useMemo, useState } from 'react';
import { useVoucher } from '../context/VoucherContext';
import { HomepageVoucherCard } from './HomepageVoucherCard';
import { Search, ArrowUpDown, LayoutGrid } from 'lucide-react';

const SORT_OPTIONS = [
  { id: 'recommended', label: 'Recommended' },
  { id: 'price-asc', label: 'Price: Low to High' },
  { id: 'price-desc', label: 'Price: High to Low' },
  { id: 'newest', label: 'Newest' },
];

const PAGE_SIZE = 24;

export const ProductCatalog = () => {
  const { products, activeBrandFilter, setActiveBrandFilter } = useVoucher();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recommended');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Reset pagination whenever the active filter/search/sort criteria change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeBrandFilter, searchQuery, sortBy]);

  const brands = useMemo(() => {
    const unique = Array.from(new Set(products.map((p) => p.provider || p.brand).filter(Boolean)));
    return ['All', ...unique.sort()];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = products.filter((product) => {
      const matchesBrand =
        activeBrandFilter === 'All' ||
        product.provider === activeBrandFilter ||
        product.brand === activeBrandFilter;
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
      list = [...list].sort((a, b) => a.discountedPrice - b.discountedPrice);
    } else if (sortBy === 'price-desc') {
      list = [...list].sort((a, b) => b.discountedPrice - a.discountedPrice);
    } else if (sortBy === 'newest') {
      list = [...list].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else {
      list = [...list].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    }
    return list;
  }, [products, activeBrandFilter, searchQuery, sortBy]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  return (
    <section className="py-16 sm:py-24 bg-slate-50 dark:bg-[#06080E] border-b border-slate-200 dark:border-slate-800 transition-colors duration-300 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-[#0D1322] border border-slate-200 dark:border-slate-800 shadow-sm text-xs font-bold text-slate-700 dark:text-slate-200 mb-4">
            <LayoutGrid className="w-4 h-4 text-brand-pink" />
            <span>OFFICIAL EXAM VOUCHERS STORE</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Explore All <span className="text-brand-pink">Exam Vouchers</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 font-medium text-base sm:text-lg mt-3">
            Choose from our range of official exam vouchers and save on your next test.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col gap-5 mb-10 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">

            {/* Brand Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {brands.map((b) => (
                <button
                  key={b}
                  onClick={() => setActiveBrandFilter(b)}
                  className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    activeBrandFilter === b
                      ? 'bg-brand-pink text-white shadow-md shadow-brand-pink/20'
                      : 'bg-white dark:bg-[#0D1322] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-brand-pink/50 hover:text-brand-pink dark:hover:text-white'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>

            {/* Search and Sort Controls */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="relative w-full sm:w-72 lg:w-80">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search vouchers, provider, category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#0D1322] border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-brand-pink/50 transition-all shadow-sm"
                />
              </div>

              <div className="relative">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="pl-8 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#0D1322] border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-brand-pink/50 appearance-none cursor-pointer transition-all shadow-sm"
                >
                  {SORT_OPTIONS.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

          </div>
        </div>

        {/* 4-Column White Card Product Grid */}
        {filteredProducts.length > 0 ? (
          <>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-500 mb-6">
              Showing {visibleProducts.length} of {filteredProducts.length} vouchers
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
              {visibleProducts.map((p) => (
                <HomepageVoucherCard key={p.id || p._id} product={p} />
              ))}
            </div>
            {hasMore && (
              <div className="text-center mt-12">
                <button
                  onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white dark:bg-[#0D1322] hover:bg-slate-100 dark:hover:bg-[#1A2338] text-slate-900 dark:text-white font-bold text-xs border border-slate-200 dark:border-slate-800 transition-all cursor-pointer shadow-lg hover:scale-[1.02]"
                >
                  Load More Vouchers
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-[#0D1322] rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
            <p className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">No vouchers match your search criteria</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">Try resetting your filter or search query to see all available vouchers.</p>
            <button
              onClick={() => { setActiveBrandFilter('All'); setSearchQuery(''); }}
              className="bg-brand-pink hover:bg-[#D9004C] text-white font-black text-xs px-6 py-2.5 rounded-full transition-colors cursor-pointer shadow-md"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Brand Disclaimer */}
        <p className="text-center text-[11px] font-medium text-slate-500 dark:text-slate-600 mt-16 max-w-2xl mx-auto leading-relaxed">
          All trademarks and logos belong to their respective owners. Apex Vouchers is an independent voucher/service provider unless otherwise stated.
        </p>

      </div>
    </section>
  );
};
