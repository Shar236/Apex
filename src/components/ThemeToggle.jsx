import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const ThemeToggle = ({ compact = false, showLabel = false }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  const tooltipText = isDark ? "Switch to light mode" : "Switch to dark mode";

  if (compact) {
    return (
      <button
        onClick={toggleTheme}
        className="relative group p-2 rounded-xl bg-neutral-100 dark:bg-[#161616] text-neutral-800 dark:text-neutral-100 border border border-[#EAEAEA] dark:border-[#292929] hover:border-[#FF005C] transition-all duration-200 cursor-pointer"
        aria-label={tooltipText}
        title={tooltipText}
      >
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-90 duration-300" />
        ) : (
          <Moon className="w-4 h-4 text-neutral-700 animate-in spin-in-90 duration-300" />
        )}
        
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
      className="relative flex items-center gap-2 p-1.5 px-3 rounded-full bg-neutral-100 dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] hover:border-[#FF005C] transition-all duration-200 cursor-pointer group"
      aria-label={tooltipText}
      title={tooltipText}
    >
      <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform duration-300 ${
        isDark ? 'bg-amber-400/20 text-amber-400 translate-x-0' : 'bg-[#FF005C]/10 text-[#FF005C] translate-x-0'
      }`}>
        {isDark ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
      </div>
      
      {showLabel && (
        <span className="text-xs font-bold text-neutral-700 dark:text-neutral-200">
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
