import { resolveBackendBaseUrl } from './lib/api-config.mjs';

/** @type {import('next').NextConfig} */
resolveBackendBaseUrl(process.env, {
  requireHttps: process.env.NODE_ENV === 'production',
});

const nextConfig = {
  reactStrictMode: true,
  cleanDistDir: false,

  // Additional trusted origins for the development server.
  allowedDevOrigins: ['192.168.8.6'],

  // Reconciled non-secret public configuration from Qlex next.config.ts.
  // SKEW_LINE_APP_KEY is intentionally omitted to keep it strictly server-only.
  env: {
    SKEW_LINE_APP_NAME: process.env.SKEW_LINE_APP_NAME,
    SKEW_LINE_APP_TITLE: process.env.SKEW_LINE_APP_TITLE,
    SKEW_LINE_APP_ACRONNYM: process.env.SKEW_LINE_APP_ACRONNYM,
    SKEW_LINE_APP_DESCRIPTION: process.env.SKEW_LINE_APP_DESCRIPTION,
    SKEW_LINE_APP_VERSION: process.env.SKEW_LINE_APP_VERSION,
    SKEW_LINE_APP_ENV: process.env.SKEW_LINE_APP_ENV,
    SKEW_LINE_APP_DEBUG: process.env.SKEW_LINE_APP_DEBUG,
    SKEW_LINE_APP_TIMEZONE: process.env.SKEW_LINE_APP_TIMEZONE,
    SKEW_LINE_APP_LOCALE: process.env.SKEW_LINE_APP_LOCALE,
    SKEW_LINE_APP_DOMAIN: process.env.SKEW_LINE_APP_DOMAIN,
    SKEW_LINE_APP_AREA: process.env.SKEW_LINE_APP_AREA,
    SKEW_LINE_APP_ADDRESS: process.env.SKEW_LINE_APP_ADDRESS,
    SKEW_LINE_APP_EMAILUNO: process.env.SKEW_LINE_APP_EMAILUNO,
    SKEW_LINE_APP_EMAILTOS: process.env.SKEW_LINE_APP_EMAILTOS,
    SKEW_LINE_APP_CANONICALLINK: process.env.SKEW_LINE_APP_CANONICALLINK,
    SKEW_LINE_APP_DEVELOPER: process.env.SKEW_LINE_APP_DEVELOPER,
    SKEW_LINE_APP_DEVLINK: process.env.SKEW_LINE_APP_DEVLINK,
    SKEW_LINE_SUPPORT_EMAIL: process.env.SKEW_LINE_SUPPORT_EMAIL,
    SKEW_LINE_SYSTEM_EMAIL: process.env.SKEW_LINE_SYSTEM_EMAIL,
    SKEW_LINE_HELP_EMAIL: process.env.SKEW_LINE_HELP_EMAIL,
    SKEW_LINE_DEVELOPER_NAME: process.env.SKEW_LINE_DEVELOPER_NAME,
    SKEW_LINE_DEVELOPER_EMAIL: process.env.SKEW_LINE_DEVELOPER_EMAIL,
    SKEW_LINE_DEVELOPER_WEBSITE: process.env.SKEW_LINE_DEVELOPER_WEBSITE,
    SKEW_LINE_DEVELOPER_GITHUB: process.env.SKEW_LINE_DEVELOPER_GITHUB,
    SKEW_LINE_GOOGLE_CLIENT_ID: process.env.SKEW_LINE_GOOGLE_CLIENT_ID,
    SKEW_LINE_NCLEX_RN_URL: process.env.SKEW_LINE_NCLEX_RN_URL,
    SKEW_LINE_NCLEX_PN_URL: process.env.SKEW_LINE_NCLEX_PN_URL,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
};

export default nextConfig;
