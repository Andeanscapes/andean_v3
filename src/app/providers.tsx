'use client';

import { ThemeProvider } from '@/contexts/ThemeContext';
import { NextIntlClientProvider } from 'next-intl';
import { LanguageProvider } from '@/contexts/LanguageContext';
import WebVitalsReporter from '@/components/WebVitalsReporter/WebVitalsReporter';
import type { AbstractIntlMessages, IntlErrorCode } from 'next-intl';

interface ProvidersProps {
  children: React.ReactNode;
  locale: string;
  messages: AbstractIntlMessages;
}

function getMessageFallback({ key, error }: { key: string; error: { code: IntlErrorCode } }) {
  // In development, surface the raw key and log the error so it can be fixed.
  if (process.env.NODE_ENV === 'development') {
    console.warn(`[i18n] Missing key: ${key}`, error);
  }
  // Return a human-readable fallback: take the last segment of the key and humanize it.
  const last = key.split('.').pop() ?? key;
  return last
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

export function Providers({ children, locale, messages }: ProvidersProps) {
  return (
    <ThemeProvider>
      <NextIntlClientProvider
        locale={locale}
        messages={messages}
        timeZone="UTC"
        getMessageFallback={getMessageFallback}
      >
        <LanguageProvider>
          <WebVitalsReporter />
          {children}
        </LanguageProvider>
      </NextIntlClientProvider>
    </ThemeProvider>
  );
}
