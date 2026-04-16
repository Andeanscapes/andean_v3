'use client';

import { ThemeProvider } from '@/contexts/ThemeContext';
import { NextIntlClientProvider } from 'next-intl';
import { LanguageProvider } from '@/contexts/LanguageContext';
import WebVitalsReporter from '@/components/WebVitalsReporter/WebVitalsReporter';
import type { AbstractIntlMessages } from 'next-intl';

interface ProvidersProps {
  children: React.ReactNode;
  locale: string;
  messages: AbstractIntlMessages;
}

export function Providers({ children, locale, messages }: ProvidersProps) {
  return (
    <ThemeProvider>
      <NextIntlClientProvider locale={locale} messages={messages} timeZone="UTC">
        <LanguageProvider>
          <WebVitalsReporter />
          {children}
        </LanguageProvider>
      </NextIntlClientProvider>
    </ThemeProvider>
  );
}
