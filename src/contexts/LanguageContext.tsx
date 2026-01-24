'use client';

import React, { useState, useEffect } from 'react';
import { createContext, useContextSelector } from 'use-context-selector';
import { useLocale } from 'next-intl';
import type { Locale } from '@/i18n/routing';
import { languages } from '@/i18n/languages';

export type LanguageContextValue = {
  currentLocale: Locale;
  availableLanguages: typeof languages;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const locale = useLocale();
  const [currentLocale, setCurrentLocale] = useState<Locale>((locale as Locale) || 'en');

  useEffect(() => {
    setCurrentLocale((locale as Locale) || 'en');
  }, [locale]);

  return (
    <LanguageContext.Provider
      value={{
        currentLocale,
        availableLanguages: languages
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguageContext() {
  const currentLocale = useContextSelector(
    LanguageContext,
    (value) => value?.currentLocale ?? 'en'
  );
  const availableLanguages = useContextSelector(
    LanguageContext,
    (value) => value?.availableLanguages ?? languages
  );

  return { currentLocale, availableLanguages };
}
