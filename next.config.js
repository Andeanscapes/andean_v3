const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

if (process.env.NODE_ENV === 'development') {
  try {
    const { initOpenNextCloudflareForDev } = require('@opennextjs/cloudflare');
    initOpenNextCloudflareForDev();
  } catch {
    // no-op: OpenNext dev integration is optional
  }
}

/**
 * Keep in sync with `src/utils/mediaUrl.ts`: that module rewrites feed media
 * paths to absolute URLs on this origin, so `next/image` must be allowed to
 * optimize it. Deriving the pattern from the same variable means overriding
 * `NEXT_PUBLIC_CDN_BASE_URL` cannot produce an unconfigured-host runtime error.
 */
const CDN_BASE_URL =
  process.env.NEXT_PUBLIC_CDN_BASE_URL?.trim() || 'https://cdn.andeanscapes.com';

let cdnOrigin;
try {
  cdnOrigin = new URL(CDN_BASE_URL);
} catch {
  throw new Error(
    `NEXT_PUBLIC_CDN_BASE_URL is not a valid absolute URL: "${CDN_BASE_URL}"`,
  );
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Public HTML verification token: inline it for dynamically rendered Worker pages.
  env: {
    GOOGLE_SITE_VERIFICATION: process.env.GOOGLE_SITE_VERIFICATION || '',
  },
  // 1. ADDED: Image Optimization configuration for R2
  images: {
    remotePatterns: [
      {
        protocol: cdnOrigin.protocol.replace(':', ''),
        hostname: cdnOrigin.hostname,
        port: cdnOrigin.port,
        pathname: '/**',
      },
    ],
  },

  reactStrictMode: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,

  allowedDevOrigins:
    process.env.NODE_ENV === "development"
      ? [
          "http://localhost:3000",
          "http://127.0.0.1:3000",
          ...(process.env.NEXT_ALLOWED_DEV_ORIGINS
            ? process.env.NEXT_ALLOWED_DEV_ORIGINS.split(",").map((s) => s.trim()).filter(Boolean)
            : []),
        ]
      : undefined,

  async headers() {
    const headers = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), payment=(), usb=()' }
    ];

    if (process.env.NODE_ENV === 'production') {
      headers.push({
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains; preload'
      });
    }

    return [
      {
        source: '/:path*',
        headers
      }
    ];
  },

  async redirects() {
    const locales = ['en', 'es', 'fr'];
    const legacyExperienceRoutes = [
      {
        source: '/experiences/emerald-mining-adventure',
        destination: '/experiences/chivor-emerald-mine-tour'
      },
      {
        source: '/experiences/emerald-mining-adventure/booking',
        destination: '/experiences/chivor-emerald-mine-tour/booking'
      }
    ];

    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.andeanscapes.com' }],
        destination: 'https://andeanscapes.com/:path*',
        permanent: true
      },
      ...legacyExperienceRoutes.flatMap(({ source, destination }) => [
        { source, destination, permanent: true },
        ...locales.filter((locale) => locale !== 'en').map((locale) => ({
          source: `/${locale}${source}`,
          destination: `/${locale}${destination}`,
          permanent: true
        }))
      ])
    ];
  },
};

module.exports = withNextIntl(nextConfig);
