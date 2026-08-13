import React from 'react';
import { useVoucher } from '../context/VoucherContext';
import { ProductCard } from './ProductCard';
import { ArrowRight } from 'lucide-react';

export const BestSellingVouchers = () => {
  const { products, setActiveTab } = useVoucher();

  const bestSellers = products.slice(0, 6);

  return (
    <section className="py-16 sm:py-24 bg-slate-50 dark:bg-[#111111] border-b border-slate-200/80 dark:border-[#292929] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2 max-w-2xl">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#FF005C] bg-white dark:bg-[#161616] px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-[#292929] shadow-sm">
              MOST POPULAR VOUCHERS
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-[#0F172A] dark:text-white tracking-tight">
              Best Selling <span className="text-[#FF005C]">Exam Vouchers</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400 font-medium text-base">
              The most requested exam vouchers with maximum savings and instant digital delivery.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('shop')}
            className="btn-pink !py-3 !px-6 !text-xs self-start md:self-auto cursor-pointer shadow-md"
          >
            <span>View All Vouchers</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

      </div>
    </section>
  );
};
