const createNextIntlPlugin = require('next-intl/plugin');
 
const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
};

module.exports = withNextIntl(nextConfig);