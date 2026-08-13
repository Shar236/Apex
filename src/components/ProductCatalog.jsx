import React, { useState } from 'react';
import { useVoucher } from '../context/VoucherContext';
import { ProductCard } from './ProductCard';
import { Search, Filter, Sparkles, SlidersHorizontal } from 'lucide-react';

export const ProductCatalog = () => {
  const { products, activeBrandFilter, setActiveBrandFilter } = useVoucher();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter((product) => {
    const matchesBrand = activeBrandFilter === 'All' || product.brand === activeBrandFilter;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBrand && matchesSearch;
  });

  const brands = ['All', 'Pearson PTE', 'ETS GRE', 'ETS TOEFL', 'Duolingo', 'IELTS IDP'];

  return (
    <section className="py-16 sm:py-24 bg-white dark:bg-[#0A0A0A] border-b border-[#EAEAEA] dark:border-[#292929] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#FF005C] bg-[#FFF0F5] dark:bg-[#2A0A17] px-3.5 py-1.5 rounded-full border border-[#FF005C]/20">
            OFFICIAL EXAM VOUCHERS STORE
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-neutral-900 dark:text-white tracking-tight mt-3">
            All Discounted <span className="text-pink-highlight">Exam Vouchers</span>
          </h1>
          <p className="text-neutral-500 dark:text-[#B5B5B5] font-medium text-base mt-3">
            Choose your exam, view instant discounts, and receive your official voucher code in under 10 seconds.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10 pb-6 border-b border-[#EAEAEA] dark:border-[#292929]">
          
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {brands.map((b) => (
              <button
                key={b}
                onClick={() => setActiveBrandFilter(b)}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                  activeBrandFilter === b
                    ? 'btn-pink shadow-md'
                    : 'bg-neutral-100 dark:bg-[#161616] text-neutral-700 dark:text-neutral-300 border border-[#EAEAEA] dark:border-[#292929] hover:border-[#FF005C]'
                }`}
              >
                {b}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search vouchers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] text-xs font-bold text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-[#FF005C]"
            />
          </div>

        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-neutral-50 dark:bg-[#161616] rounded-3xl border border-[#EAEAEA] dark:border-[#292929] p-8 space-y-3">
            <p className="font-heading font-extrabold text-lg text-neutral-900 dark:text-white">No vouchers match your search criteria</p>
            <p className="text-xs text-neutral-500 dark:text-[#B5B5B5]">Try resetting your filter or search query to see all available vouchers.</p>
            <button
              onClick={() => { setActiveBrandFilter('All'); setSearchQuery(''); }}
              className="btn-pink !py-2.5 !px-6 !text-xs font-extrabold"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
