'use client';

/**
 * Locale-scoped error boundary.
 *
 * Services have no local fallback: an unavailable or schema-invalid remote feed
 * throws. Without this boundary that surfaces as Next's unstyled default error
 * page. This keeps the shell, offers a retry, and stays translated.
 *
 * Must be a Client Component — that is the App Router contract for error.tsx.
 */

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { RefreshCw } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { SectionContainer } from '@/components/ui/SectionContainer/SectionContainer';
import { PrimaryCtaButton } from '@/components/ui/Button/PrimaryCtaButton';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const t = useTranslations('Error');

  useEffect(() => {
    // Surfaces in `wrangler tail` alongside the [RemoteData] lines that usually
    // precede a feed failure, so the two can be correlated.
    console.error('[ErrorBoundary]', error.message, error.digest ?? '');
  }, [error]);

  return (
    <SectionContainer sectionClassName="flex min-h-[60vh] items-center px-4 py-16 md:px-6 lg:px-10">
      <div className="mx-auto max-w-xl text-center">
        <h1 className="text-3xl font-bold leading-tight text-base-content md:text-4xl">
          {t('title')}
        </h1>

        <p className="mt-4 text-base leading-relaxed text-base-content/70">{t('description')}</p>

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <PrimaryCtaButton onClick={reset} fullWidth={false}>
            <RefreshCw size={18} aria-hidden="true" />
            {t('retry')}
          </PrimaryCtaButton>

          <Link
            href="/"
            className="btn btn-ghost min-h-11 font-semibold text-base-content focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-base-100"
          >
            {t('backHome')}
          </Link>
        </div>

        {error.digest ? (
          <p className="mt-8 text-xs text-base-content/50">
            {t('reference')}: <code className="font-mono">{error.digest}</code>
          </p>
        ) : null}
      </div>
    </SectionContainer>
  );
}
