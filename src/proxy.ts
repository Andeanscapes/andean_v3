import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

export default createMiddleware({
  ...routing,
  // Disable automatic locale detection from browser headers
  localeDetection: false
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
