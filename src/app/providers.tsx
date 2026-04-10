'use client';

import { ThemeProvider } from '@/contexts/ThemeContext';
import { NextIntlClientProvider } from 'next-intl';
import { LanguageProvider } from '@/contexts/LanguageContext';
import MetaPixelPageViewTracker from '@/components/MetaPixelPageViewTracker/MetaPixelPageViewTracker';
import WebVitalsReporter from '@/components/MetaPixelPageViewTracker/WebVitalsReporter';
import type { AbstractIntlMessages } from 'next-intl';
import { Suspense } from 'react';

interface ProvidersProps {
  children: React.ReactNode;
  locale: string;
  messages: AbstractIntlMessages;
  hasMetaPixel?: boolean;
}

/**
 * Centralized providers for the application.
 * Keeps layout.tsx clean by nesting all global providers here.
 */
export function Providers({ children, locale, messages, hasMetaPixel = false }: ProvidersProps) {
  return (
    <ThemeProvider>
      <NextIntlClientProvider locale={locale} messages={messages} timeZone="UTC">
        <LanguageProvider>
          <WebVitalsReporter />
          {hasMetaPixel ? (
            <Suspense fallback={null}>
              <MetaPixelPageViewTracker />
            </Suspense>
          ) : null}
          {children}
        </LanguageProvider>
      </NextIntlClientProvider>
    </ThemeProvider>
  );
}
