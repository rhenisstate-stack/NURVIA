// apps/web/lib/config/config.ts
// Centralized config using environment variables with NURVIA-safe fallbacks

// -----------------------------------------------------------------------------
// APP INFO
// -----------------------------------------------------------------------------
export const APP_NAME = process.env.SKEW_LINE_APP_NAME || "Nurvia";
export const APP_TITLE = process.env.SKEW_LINE_APP_TITLE || "NURVIA";
export const APP_ACRONYM = process.env.SKEW_LINE_APP_ACRONNYM || "NV";
export const APP_DESCRIPTION =
  process.env.SKEW_LINE_APP_DESCRIPTION ||
  "Examination Generation and Clinical Learning System for Nursing";
export const APP_VERSION = process.env.SKEW_LINE_APP_VERSION || "8.0.0";
export const APP_ENV = process.env.SKEW_LINE_APP_ENV || "live";
export const APP_DEBUG = process.env.SKEW_LINE_APP_DEBUG === "true";
export const APP_TIMEZONE = process.env.SKEW_LINE_APP_TIMEZONE || "UTC";
export const APP_LOCALE = process.env.SKEW_LINE_APP_LOCALE || "en";
export const APP_DOMAIN =
  process.env.SKEW_LINE_APP_DOMAIN || "https://nurvia-black.vercel.app";
// Server-only application key: never falls back to Qlex identity and never exposed to client bundles.
export const APP_KEY =
  typeof window === "undefined" ? process.env.SKEW_LINE_APP_KEY || "" : "";

// -----------------------------------------------------------------------------
// CONTACT & SOCIAL MEDIA
// -----------------------------------------------------------------------------
export const CONTACT = {
  AREA: process.env.SKEW_LINE_APP_AREA || "",
  ADDRESS: process.env.SKEW_LINE_APP_ADDRESS || "",
  TELLUNO: process.env.SKEW_LINE_APP_TELLUNO || "",
  PHONEUNO: process.env.SKEW_LINE_APP_PHONEUNO || "",
  TELTOS: process.env.SKEW_LINE_APP_TELTOS || "",
  PHONETOS: process.env.SKEW_LINE_APP_PHONETOS || "",
  EMAILUNO: process.env.SKEW_LINE_APP_EMAILUNO || "",
  EMAILTOS: process.env.SKEW_LINE_APP_EMAILTOS || "",
  WHATSAPP: process.env.SKEW_LINE_APP_WHATSAPP || "",
  INSTAGRAM: process.env.SKEW_LINE_APP_INSTAGRAM || "",
  FACEBOOK: process.env.SKEW_LINE_APP_FACEBOOK || "",
  TWITTER: process.env.SKEW_LINE_APP_TWITTER || "",
  LINKEDIN: process.env.SKEW_LINE_APP_LINKEDIN || "",
  TELEGRAM: process.env.SKEW_LINE_APP_TELEGRAM || "",
  TIKTOK: process.env.SKEW_LINE_APP_TIKTOK || "",
  REDDIT: process.env.SKEW_LINE_APP_REDDIT || "",
  YOUTUBE: process.env.SKEW_LINE_APP_YOUTUBE || "",
  PINTEREST: process.env.SKEW_LINE_APP_PINTEREST || "",
  CANONICALLINK:
    process.env.SKEW_LINE_APP_CANONICALLINK || "https://nurvia-black.vercel.app",
  DEVELOPER: process.env.SKEW_LINE_APP_DEVELOPER || "NURVIA",
  DEVLINK:
    process.env.SKEW_LINE_APP_DEVLINK || "https://nurvia-black.vercel.app",
  SENDWHATSAPP: process.env.SKEW_LINE_APP_SENDWHATSAPP || "",
};

// -----------------------------------------------------------------------------
// EMAILS CONFIGURATION
// -----------------------------------------------------------------------------
export const EMAILS = {
  SUPPORT: process.env.SKEW_LINE_SUPPORT_EMAIL || "support@nurvia.app",
  SYSTEM: process.env.SKEW_LINE_SYSTEM_EMAIL || "system@nurvia.app",
  HELP: process.env.SKEW_LINE_HELP_EMAIL || "help@nurvia.app",
};

// -----------------------------------------------------------------------------
// PHONE NUMBERS CONFIGURATION
// -----------------------------------------------------------------------------
export const PHONES = {
  TELL: process.env.SKEW_LINE_TELL_PHONE || "",
  SUPPORT: process.env.SKEW_LINE_SUPPORT_PHONE || "",
  HELP: process.env.SKEW_LINE_HELP_PHONE || "",
};

// -----------------------------------------------------------------------------
// BACKEND API CONFIGURATION
// -----------------------------------------------------------------------------
export const BACKEND = {
  ACTIVE: process.env.SKEW_LINE_ACTIVE_BACKEND || "dotnet",
  LARAVEL_URL: (process.env.SKEW_LINE_LARAVEL_BASE_URL || "").split(","),
  FASTAPI_URL: (process.env.SKEW_LINE_FASTAPI_BASE_URL || "").split(","),
  DOTNET_URL: (process.env.SKEW_LINE_DOTNET_BASE_URL || "").split(","),
};

// -----------------------------------------------------------------------------
// DEVELOPER INFO
// -----------------------------------------------------------------------------
export const DEVELOPER = {
  NAME: process.env.SKEW_LINE_DEVELOPER_NAME || "NURVIA",
  PHONE: process.env.SKEW_LINE_DEVELOPER_PHONE || "",
  EMAIL: process.env.SKEW_LINE_DEVELOPER_EMAIL || "support@nurvia.app",
  WEBSITE:
    process.env.SKEW_LINE_DEVELOPER_WEBSITE || "https://nurvia-black.vercel.app",
  GITHUB:
    process.env.SKEW_LINE_DEVELOPER_GITHUB ||
    "https://github.com/rhenisstate-stack/NURVIA",
};

// -----------------------------------------------------------------------------
// SEO CONFIG
// -----------------------------------------------------------------------------
export const SEO = {
  author: DEVELOPER.NAME || "NURVIA Team",
  keywords:
    "Register, Login, Exam Generation, Nursing Exams, NCLEX, ATI TEAS, HESI A2",
  ogImage: `${CONTACT.CANONICALLINK || "https://nurvia-black.vercel.app"}/images/og-banner.jpg`,
  siteUrl: CONTACT.CANONICALLINK || "https://nurvia-black.vercel.app",
};
