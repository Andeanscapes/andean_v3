import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing, type Locale} from './routing';

// Static imports required for Cloudflare Workers — dynamic template-literal
// imports cannot be statically analyzed by the Workers bundler at build time.
const messageLoaders: Record<Locale, () => Promise<{ default: Record<string, unknown> }>> = {
  en: () => import('./messages/en.json'),
  es: () => import('./messages/es.json'),
  fr: () => import('./messages/fr.json'),
};

export default getRequestConfig(async ({locale, requestLocale}) => {
  // In next-intl@4.x, prefer the locale segment resolved by middleware (`requestLocale`).
  // `locale` is only set when you explicitly pass a locale to e.g. getTranslations({locale: 'es'}).
  const segmentLocale = await requestLocale;
  const candidate = (locale ?? segmentLocale) as Locale | undefined;

  const resolvedLocale: Locale =
    candidate && routing.locales.includes(candidate)
      ? candidate
      : routing.defaultLocale;

  if (!routing.locales.includes(resolvedLocale)) notFound();

  return {
    locale: resolvedLocale,
    timeZone: 'UTC',
    messages: (await messageLoaders[resolvedLocale]()).default
  };
});
