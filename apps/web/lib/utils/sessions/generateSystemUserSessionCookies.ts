"use client";

const COOKIE_DAYS = 1;
const COOKIE_PATH = "/";
const isProd = process.env.NODE_ENV === "production";
const SAFE_COOKIE_SIZE = 3800;

export const setCookie = (name: string, value: string, days = COOKIE_DAYS) => {
  if (typeof document === "undefined") return;
  const encoded = encodeURIComponent(value);
  if (encoded.length > SAFE_COOKIE_SIZE) {
    console.error(`[setCookie] "${name}" exceeds safe cookie size (${encoded.length} bytes). Aborting write.`);
    return;
  }
  const expires = new Date(Date.now() + days * 86400000).toUTCString();
  document.cookie =
    `${name}=${encoded}; expires=${expires}; path=${COOKIE_PATH}; ` +
    `${isProd ? "Secure; " : ""}SameSite=Strict`;
};

export const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
};

export const deleteCookie = (name: string) => {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${COOKIE_PATH}; SameSite=Strict`;
};

/**
 * Security deviation: NURVIA manages auth sessions exclusively via HttpOnly server cookies
 * (nurvia_casto_line, nurvia_casto_badge, nurvia_casto_dashboard). Client-side JS never
 * writes or reads auth session tokens.
 */
export const clearAuthSessionCookies = () => {
  // No-op on client; server /api/auth/logout clears HttpOnly cookies.
};

export const writeAuthSessionCookies = (_badge: string, _line: string) => {
  // No-op on client; server /api/auth/login sets HttpOnly cookies.
};

const FINGERPRINT_LENGTH = 64;
const FINGERPRINT_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export const generateFingerprint = (): string => {
  const array = new Uint8Array(FINGERPRINT_LENGTH);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((v) => FINGERPRINT_CHARS[v % FINGERPRINT_CHARS.length])
    .join("");
};

export const getOrCreateFingerprint = (): string => {
  const existing = getCookie("nurvia_device_fingerprint");
  if (existing) return existing;
  const fingerprint = generateFingerprint();
  setCookie("nurvia_device_fingerprint", fingerprint);
  return fingerprint;
};

export const getStoredIPAddress = (): string | null =>
  getCookie("nurvia_device_address");

export const storeIPAddress = (ip: string) => {
  if (!getStoredIPAddress()) setCookie("nurvia_device_address", ip);
};

export const resolveAndStoreIPAddress = async (): Promise<string | null> => {
  const existing = getStoredIPAddress();
  if (existing) return existing;
  try {
    const res = await fetch("https://api.ipify.org?format=json");
    if (!res.ok) return null;
    const data: { ip?: string } = await res.json();
    if (data?.ip) {
      storeIPAddress(data.ip);
      return data.ip;
    }
    return null;
  } catch {
    return null;
  }
};
