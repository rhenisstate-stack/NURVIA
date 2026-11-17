import { apiFetch } from "@/lib/api/api/api";
import {
  getOrCreateFingerprint,
  getStoredIPAddress,
  resolveAndStoreIPAddress,
} from "@/lib/utils/sessions/generateSystemUserSessionCookies";

export type SocialProvider =
  | "google"
  | "apple"
  | "facebook"
  | "github"
  | "linkedin"
  | "microsoft";

export type SocialContext = "login" | "register";

export interface SocialRedirectOptions {
  provider: SocialProvider;
  context: SocialContext;
  role?: string;
  dashboardName?: string;
  redirectPath?: string;
}

const SOCIAL_ROUTE_MAP: Record<SocialProvider, string> = {
  google: "/api/auth/social/google",
  apple: "/api/auth/social/apple",
  facebook: "/api/auth/social/facebook",
  github: "/api/auth/social/github",
  linkedin: "/api/auth/social/linkedin",
  microsoft: "/api/auth/social/microsoft",
};

export const buildSocialRedirectUrl = ({
  provider,
  context,
  role = "Learner",
  dashboardName = "web",
  redirectPath,
  fingerprint,
  ipAddress,
}: SocialRedirectOptions & { fingerprint?: string; ipAddress?: string }): string => {
  const base = SOCIAL_ROUTE_MAP[provider];
  const params = new URLSearchParams({
    context,
    role,
    dashboardName,
  });
  if (redirectPath) params.set("redirectPath", redirectPath);
  if (fingerprint) params.set("fingerprint", fingerprint);
  if (ipAddress) params.set("ipAddress", ipAddress);
  return `${base}?${params.toString()}`;
};

export const redirectToSocialProvider = async (
  options: SocialRedirectOptions
): Promise<void> => {
  if (typeof window === "undefined") return;
  const fingerprint = getOrCreateFingerprint();
  const ipAddress = getStoredIPAddress() ?? (await resolveAndStoreIPAddress());
  const url = buildSocialRedirectUrl({
    ...options,
    fingerprint,
    ipAddress: ipAddress ?? undefined,
  });
  window.location.href = url;
};

export interface OneTapLoginParams {
  credential: string;
  select_by?: string;
  context?: SocialContext;
  role?: string;
  dashboardName?: string;
}

export interface OneTapLoginResponse {
  error?: string;
  casto_line?: string;
  casto_badge?: string;
  redirect_url?: string;
}

export const oneTapLogin = async ({
  credential,
  select_by,
  context = "login",
  role = "Learner",
  dashboardName = "web",
}: OneTapLoginParams): Promise<OneTapLoginResponse> => {
  try {
    const fingerprint = getOrCreateFingerprint();
    const ipAddress = getStoredIPAddress() ?? (await resolveAndStoreIPAddress());
    return await apiFetch<OneTapLoginResponse>("/api/auth/social/onetap", {
      method: "POST",
      body: JSON.stringify({
        credential,
        select_by,
        context,
        role,
        dashboardName,
        fingerprint,
        ipAddress: ipAddress ?? undefined,
      }),
      credentials: "include",
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return { error: err.message };
    }
    return { error: "Unknown One Tap login error" };
  }
};
