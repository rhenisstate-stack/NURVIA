import { resolveBackendBaseUrl } from './lib/api-config.mjs';

/** @type {import('next').NextConfig} */
const apiBase = resolveBackendBaseUrl(process.env, {
  requireHttps: process.env.NODE_ENV === 'production',
});

const nextConfig = {
  reactStrictMode: true,
  cleanDistDir: false,

  // Additional trusted origins for the development server.
  allowedDevOrigins: ['192.168.8.6'],

  async rewrites() {
    return [
      {
        source: '/api/avatar/:storageKey',
        destination: `${apiBase}/api/avatar/:storageKey`,
      },
    ];
  },
};

export default nextConfig;
