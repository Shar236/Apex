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
 * Initial state is always 'light' — matching what the server renders (no
 * `window` there) — so hydration never mismatches. The real theme (already
 * applied to <html> before paint by the blocking script in app/layout.tsx,
 * see THEME_INIT_SCRIPT) is read and synced here in a useLayoutEffect, which
 * runs before the browser paints, so there's still no visible flash. This
 * also covers React Strict Mode's dev-only remount, which resets <html> to
 * only the attributes it manages from JSX and clears the class otherwise.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');

  useLayoutEffect(() => {
    // SSR renders 'light' (no `window`); the real stored/system theme is read and
    // applied here BEFORE paint. This setState is the whole point of the pattern
    // (see the block comment above) — it cannot be a lazy initializer without a
    // hydration mismatch.
    const real = readStoredTheme();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThemeState(real);
    const root = document.documentElement;
    if (real === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, []);

  useLayoutEffect(() => {
    try {
      localStorage.setItem('apex_theme', theme);
    } catch {
      // localStorage unavailable (private mode, blocked) — theme still works for this load.
    }
  }, [theme]);

  const setTheme = (next: Theme) => setThemeState(next);

  const applyTheme = (next: Theme) => {
    const root = document.documentElement;
    if (next === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    setThemeState(next);
  };

  const toggleTheme = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    const doc = document as Document & { startViewTransition?: (cb: () => void) => void };
    if (doc.startViewTransition) {
      doc.startViewTransition(() => applyTheme(next));
    } else {
      const root = document.documentElement;
      root.classList.add('theme-transition');
      applyTheme(next);
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
