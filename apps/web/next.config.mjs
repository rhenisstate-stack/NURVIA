/** @type {import('next').NextConfig} */
const apiBase = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5055'
).replace(/\/+$/, '');

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
