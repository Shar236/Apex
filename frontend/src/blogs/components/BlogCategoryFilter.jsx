import React from 'react';

/**
 * Horizontal category pills for /blog. `categories` is the API count list
 * ([{ name, count }]); `options` is the fixed display order.
 */
export default function BlogCategoryFilter({ options, categories = [], active, onSelect }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-6 sm:pt-8 mb-8 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
      {options.map((cat) => {
        const hit = cat !== 'All' && categories.find((c) => c.name?.toLowerCase() === cat.toLowerCase());
        return (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition whitespace-nowrap cursor-pointer ${
              active === cat
                ? 'bg-brand-pink text-white shadow-sm'
                : 'bg-neutral-100 dark:bg-[#262626] text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-[#333]'
            }`}
          >
            {cat} {hit ? `(${hit.count})` : ''}
          </button>
        );
      })}
    </div>
  );
}
