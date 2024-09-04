import { getRequestConfig } from 'next-intl/server';
import { headers } from 'next/headers';

export default getRequestConfig(async () => {
  // Use Next.js `headers` to get the request headers
  const acceptLanguage = headers().get('accept-language');

  // Extract the primary language from the 'accept-language' header
  const locale = acceptLanguage ? acceptLanguage.split(',')[0].split('-')[0] : 'es';

  // Ensure the locale is supported, fallback to 'es' if not
  const supportedLocales: string[] = ['es', 'en']; // Add your supported locales here
  const selectedLocale = supportedLocales.includes(locale) ? locale : 'es';

  return {
    locale: selectedLocale,
    messages: (await import(`../../messages/${selectedLocale}.json`)).default,
  };
});
