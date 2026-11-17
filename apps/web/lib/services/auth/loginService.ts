import { apiFetch } from "@/lib/api/api/api";
import {
  getOrCreateFingerprint,
  getStoredIPAddress,
  resolveAndStoreIPAddress,
} from "@/lib/utils/sessions/generateSystemUserSessionCookies";

export type LoginCredentials =
  | {
      email: string;
      password: string;
      pin: string;
      loginMethod: "password";
      challenge?: string;
      LoginProvider: string;
      loginProviderPayload?: string;
      dashboardName?: string;
      role?: string;
      remember?: boolean;
    }
  | {
      email: string;
      password: string;
      pin: string;
      loginMethod: "pin";
      challenge?: string;
      LoginProvider: string;
      loginProviderPayload?: string;
      dashboardName?: string;
      role?: string;
      remember?: boolean;
    };

export interface LoginResponse {
  redirect_url?: string;
  error?: string;
  casto_line?: string;
  casto_badge?: string;
}

/**
 * Security deviation: NURVIA session tokens are stored in HttpOnly server cookies
 * and cannot be read from document.cookie. Use /api/auth/me or /api/auth/session.
 */
export const getSessionFromCookies = (): {
  sessions: Record<string, string>;
  current_user: string | null;
} => ({
  sessions: {},
  current_user: null,
});

export { clearAuthSessionCookies as clearAuthCookies } from "@/lib/utils/sessions/generateSystemUserSessionCookies";

export const login = async (data: LoginCredentials): Promise<LoginResponse> => {
  try {
    const fingerprint = getOrCreateFingerprint();
    const ipAddress = getStoredIPAddress() ?? (await resolveAndStoreIPAddress());

    return await apiFetch<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        ...data,
        fingerprint,
        ipAddress: ipAddress ?? undefined,
      }),
      credentials: "include",
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      try {
        const parsed = JSON.parse(err.message);
        if (parsed?.errors) {
          const messages = Object.entries(parsed.errors)
            .flatMap(([field, msgs]) =>
              (msgs as string[]).map((m) => `${field}: ${m}`)
            )
            .join(" | ");
          return { error: messages };
        }
        if (parsed?.error) return { error: parsed.error };
        if (parsed?.title) return { error: parsed.title };
      } catch {
        // fall through
      }
      return { error: err.message };
    }
    return { error: "Unknown login error" };
  }
};
