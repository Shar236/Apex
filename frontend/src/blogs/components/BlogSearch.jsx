import React from 'react';
import { Search } from 'lucide-react';

/** Search box shown in the /blog hero. Controlled by the page. */
export default function BlogSearch({ value, onChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="mt-6 max-w-md mx-auto relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search articles by topic, keyword…"
        aria-label="Search articles"
        className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/10 dark:bg-[#161616] border border-[#292929] text-white text-sm font-bold placeholder:text-neutral-500 focus:outline-none focus:border-brand-pink transition"
      />
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
    </form>
  );
}
