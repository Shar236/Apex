'use client';

import { createContext, useContext, useLayoutEffect, useState, type ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const readStoredTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';
  try {
    const saved = localStorage.getItem('apex_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
};

/**
 * The initial theme class is applied before hydration by the blocking script
 * in app/layout.tsx (see THEME_INIT_SCRIPT). React Strict Mode's dev-only
 * remount resets <html> to only the attributes it manages from JSX, clearing
 * that class — so this also re-applies it in a useLayoutEffect (a no-op in
 * production, where the class is already correct).
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readStoredTheme);

  useLayoutEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    try {
      localStorage.setItem('apex_theme', theme);
    } catch {
      // localStorage unavailable (private mode, blocked) — theme still works for this load.
    }
  }, [theme]);

  const setTheme = (next: Theme) => setThemeState(next);

  const toggleTheme = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    const startViewTransition = (
      document as Document & { startViewTransition?: (cb: () => void) => void }
    ).startViewTransition;
    if (startViewTransition) {
      startViewTransition(() => setThemeState(next));
    } else {
      const root = document.documentElement;
      root.classList.add('theme-transition');
      setThemeState(next);
      setTimeout(() => root.classList.remove('theme-transition'), 300);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

/**
 * Inlined into <head> as a blocking script (see app/layout.tsx) so the
 * correct theme class is on <html> before first paint — avoids a
 * flash-of-wrong-theme that a useEffect-only approach can't prevent under SSR.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('apex_theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}if(t==='dark'){document.documentElement.classList.add('dark');}}catch(e){}})();`;
