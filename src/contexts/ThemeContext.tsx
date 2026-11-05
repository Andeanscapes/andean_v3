'use client';

import React, { useState, useEffect } from 'react';
import { createContext, useContextSelector } from 'use-context-selector';

export type Theme = 'light' | 'dark';

export type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const [theme, setThemeState] = useState<Theme>('dark');

  useEffect(() => {
    // THEME_INIT_SCRIPT already set <html data-theme> before paint; adopt it so
    // React state matches what is on screen. Fallback for when the script failed.
    const fromDom = document.documentElement.getAttribute('data-theme');
    const resolved: Theme =
      fromDom === 'light' || fromDom === 'dark'
        ? fromDom
        : window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
    setThemeState(resolved);
    document.documentElement.setAttribute('data-theme', resolved);
  }, []);

  const toggleTheme = () => {
    setThemeState((prev) => {
      const newTheme = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      return newTheme;
    });
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        setTheme
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

const noopToggle = () => {};
const noopSetTheme = (_theme: Theme) => {};

export function useThemeContext() {
  const theme = useContextSelector(
    ThemeContext,
    (value) => value?.theme ?? 'dark'
  );
  const toggleTheme = useContextSelector(
    ThemeContext,
    (value) => value?.toggleTheme ?? noopToggle
  );
  const setTheme = useContextSelector(
    ThemeContext,
    (value) => value?.setTheme ?? noopSetTheme
  );

  return { theme, toggleTheme, setTheme };
}
