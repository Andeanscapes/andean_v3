import React from 'react';
import type { Decorator } from '@storybook/react';
import { createContext, useContextSelector } from 'use-context-selector';
import type { Locale } from '@/i18n/routing';
import { languages } from '@/i18n/languages';
import type { HeaderVariant } from '@/types/ui';

// ============================================================================
// Mock Contexts for Storybook
// ============================================================================

// Theme Context Mock
export type Theme = 'light' | 'dark';

export type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
};

const MockThemeContext = createContext<ThemeContextValue | null>(null);

export function useMockThemeContext() {
  const theme = useContextSelector(MockThemeContext, (value) => value?.theme ?? 'dark');
  const toggleTheme = useContextSelector(MockThemeContext, (value) => value?.toggleTheme ?? (() => {}));
  const setTheme = useContextSelector(MockThemeContext, (value) => value?.setTheme ?? (() => {}));
  return { theme, toggleTheme, setTheme };
}

// Language Context Mock
export type LanguageContextValue = {
  currentLocale: Locale;
  availableLanguages: typeof languages;
};

const MockLanguageContext = createContext<LanguageContextValue | null>(null);

export function useMockLanguageContext() {
  const currentLocale = useContextSelector(
    MockLanguageContext,
    (value) => value?.currentLocale ?? 'en'
  );
  const availableLanguages = useContextSelector(
    MockLanguageContext,
    (value) => value?.availableLanguages ?? languages
  );
  return { currentLocale, availableLanguages };
}

// Layout Context Mock
export type LayoutContextValue = {
  variant: HeaderVariant;
  isSticky: boolean;
};

const MockLayoutContext = createContext<LayoutContextValue | null>(null);

export function useMockLayoutContext() {
  const variant = useContextSelector(MockLayoutContext, (value) => value?.variant ?? 'default');
  const isSticky = useContextSelector(MockLayoutContext, (value) => value?.isSticky ?? false);
  return { variant, isSticky };
}

// ============================================================================
// Mock next-intl
// ============================================================================

// Simple translation mock
const mockTranslations: Record<string, Record<string, string>> = {
  navigation: {
    experiences: 'Experiences',
    reviews: 'Reviews',
    help: 'Help',
    book: 'Book Now'
  }
};

export function useMockTranslations(namespace: string = 'navigation') {
  return (key: string) => mockTranslations[namespace]?.[key] || key;
}

// Mock next/navigation
export const mockRouter = {
  push: (href: string) => void href,
  replace: (href: string) => void href,
  refresh: () => void 0,
  prefetch: (href: string) => void href,
  back: () => void 0,
  forward: () => void 0,
};

// ============================================================================
// Provider Components
// ============================================================================

export function MockThemeProvider({ 
  children, 
  initialTheme = 'light' 
}: { 
  children: React.ReactNode;
  initialTheme?: Theme;
}) {
  const [theme, setTheme] = React.useState<Theme>(initialTheme);

  // Sync with initialTheme prop changes
  React.useEffect(() => {
    setTheme(initialTheme);
  }, [initialTheme]);

  const toggleTheme = React.useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  const handleSetTheme = React.useCallback((newTheme: Theme) => {
    setTheme(newTheme);
  }, []);

  // Apply theme to document like the real implementation
  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  return (
    <MockThemeContext.Provider value={{ theme, toggleTheme, setTheme: handleSetTheme }}>
      <div data-theme={theme}>
        {children}
      </div>
    </MockThemeContext.Provider>
  );
}

export function MockLanguageProvider({ 
  children, 
  locale = 'en' 
}: { 
  children: React.ReactNode;
  locale?: Locale;
}) {
  return (
    <MockLanguageContext.Provider
      value={{
        currentLocale: locale,
        availableLanguages: languages
      }}
    >
      {children}
    </MockLanguageContext.Provider>
  );
}

export function MockLayoutProvider({ 
  children,
  variant = 'default',
  isSticky = false
}: { 
  children: React.ReactNode;
  variant?: HeaderVariant;
  isSticky?: boolean;
}) {
  return (
    <MockLayoutContext.Provider value={{ variant, isSticky }}>
      {children}
    </MockLayoutContext.Provider>
  );
}

// ============================================================================
// Combined Provider for Storybook
// ============================================================================

export function StorybookProviders({ 
  children,
  theme = 'light',
  locale = 'en',
  variant = 'default',
  isSticky = false
}: { 
  children: React.ReactNode;
  theme?: Theme;
  locale?: Locale;
  variant?: HeaderVariant;
  isSticky?: boolean;
}) {
  return (
    <MockThemeProvider initialTheme={theme}>
      <MockLanguageProvider locale={locale}>
        <MockLayoutProvider variant={variant} isSticky={isSticky}>
          {children}
        </MockLayoutProvider>
      </MockLanguageProvider>
    </MockThemeProvider>
  );
}

// ============================================================================
// Storybook Decorator
// ============================================================================

export const withMockProviders: Decorator = (Story, context) => {
  const theme = (context.parameters.theme || context.globals.theme || 'light') as Theme;
  const locale = (context.parameters.locale || 'en') as Locale;
  const variant = (context.parameters.variant || 'default') as HeaderVariant;
  const isSticky = context.parameters.isSticky ?? false;

  return (
    <StorybookProviders 
      theme={theme} 
      locale={locale}
      variant={variant}
      isSticky={isSticky}
    >
      <Story />
    </StorybookProviders>
  );
};
