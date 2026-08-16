import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const ThemeToggle = ({ compact = false, showLabel = false }) => {
  const { toggleTheme, isDark } = useTheme();

  const tooltipText = isDark ? "Switch to light mode" : "Switch to dark mode";

  if (compact) {
    return (
      <button
        onClick={toggleTheme}
        className="relative group p-2 rounded-xl bg-neutral-100 dark:bg-[#161616] text-neutral-800 dark:text-neutral-100 border border-[#EAEAEA] dark:border-[#292929] hover:border-[#FF005C] transition-all duration-300 cursor-pointer overflow-hidden"
        aria-label={tooltipText}
        title={tooltipText}
      >
        <div className="relative w-4 h-4 flex items-center justify-center">
          <Sun className={`w-4 h-4 text-amber-400 absolute transition-all duration-500 transform ${
            isDark ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'
          }`} />
          <Moon className={`w-4 h-4 text-neutral-700 dark:text-neutral-200 absolute transition-all duration-500 transform ${
            isDark ? '-rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
          }`} />
        </div>
        
        {/* Tooltip */}
        <span className="absolute top-full right-0 mt-2 hidden group-hover:block px-2.5 py-1 rounded-lg bg-[#161616] dark:bg-white text-white dark:text-neutral-900 text-[10px] font-bold whitespace-nowrap shadow-xl z-50 pointer-events-none border border-[#292929] dark:border-[#EAEAEA]">
          {tooltipText}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center gap-2 p-1.5 px-3 rounded-full bg-neutral-100 dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] hover:border-[#FF005C] transition-all duration-300 cursor-pointer group"
      aria-label={tooltipText}
      title={tooltipText}
    >
      <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 transform ${
        isDark ? 'bg-amber-400/20 text-amber-400 rotate-180' : 'bg-[#FF005C]/10 text-[#FF005C] rotate-0'
      }`}>
        {isDark ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
      </div>
      
      {showLabel && (
        <span className="text-xs font-bold text-neutral-700 dark:text-neutral-200 transition-colors duration-300">
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </span>
      )}

      {/* Tooltip */}
      <span className="absolute top-full right-0 mt-2 hidden group-hover:block px-2.5 py-1 rounded-lg bg-[#161616] dark:bg-white text-white dark:text-neutral-900 text-[10px] font-bold whitespace-nowrap shadow-xl z-50 pointer-events-none border border-[#292929] dark:border-[#EAEAEA]">
        {tooltipText}
      </span>
    </button>
  );
};
