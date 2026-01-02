/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep Next.js in server mode (no `next export`) so Cloudflare Pages can serve
  // Next routes like `/_next/*` (required for <Image /> optimization and future server features).
};

module.exports = nextConfig;