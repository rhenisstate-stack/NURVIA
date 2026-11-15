import { resolveBackendBaseUrl, isHttpsBackendUrl } from './lib/api-config.mjs';

/** @type {import('next').NextConfig} */
const apiBase = resolveBackendBaseUrl(process.env);

if (process.env.NODE_ENV === 'production' && !isHttpsBackendUrl(apiBase)) {
  console.warn(
    '[NURVIA Security Warning] Configured backend URL uses HTTP. Production deployments must place the remote .NET backend behind an HTTPS reverse proxy for secure authentication cookies.'
  );
}

const nextConfig = {
  reactStrictMode: true,
  cleanDistDir: false,

  // Additional trusted origins for the development server.
  allowedDevOrigins: ['192.168.8.6'],

  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: `${apiBase}/api/:path*`,
      },
      {
        source: '/api/avatar/:storageKey',
        destination: `${apiBase}/api/avatar/:storageKey`,
      },
    ];
  },
};

export default nextConfig;
