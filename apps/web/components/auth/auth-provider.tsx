"use client";

import * as React from "react";
import { nurviaApi } from "@/lib/api-client";
import type { ApiResponse, AuthUserDto } from "@/lib/api-types";

type AuthStatus = "loading" | "authenticated" | "unauthenticated" | "error";

// Upper bound for the session check. fetch() has no timeout of its own, so an API that
// accepts the connection but never answers would otherwise keep status at "loading" (and
// the global splash visible) indefinitely. On timeout the status becomes "error"; the
// user is never treated as authenticated.
const SESSION_CHECK_TIMEOUT_MS = 15000;

interface AuthContextValue {
  status: AuthStatus;
  user: AuthUserDto | null;
  error: string | null;
  signIn: (credentials: { email: string; password: string }) => Promise<ApiResponse<AuthUserDto>>;
  signOut: () => Promise<ApiResponse<string>>;
  updateProfile: (name: string) => Promise<ApiResponse<AuthUserDto>>;
  refresh: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = React.useState<AuthStatus>("loading");
  const [user, setUser] = React.useState<AuthUserDto | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const refresh = React.useCallback(async () => {
    const controller = new AbortController();
    const timer = setTimeout(
      () => controller.abort(new Error("NURVIA took too long to verify your sign-in status. Check your connection and try again.")),
      SESSION_CHECK_TIMEOUT_MS,
    );
    let response: ApiResponse<AuthUserDto>;
    try {
      response = await nurviaApi.getCurrentUser({ signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
    if (response.success && response.data) {
      setUser(response.data);
      setStatus("authenticated");
      setError(null);
    } else if (response.statusCode === 401) {
      setUser(null);
      setStatus("unauthenticated");
      setError(null);
    } else {
      setUser(null);
      setStatus("error");
      setError(response.message || "Unable to verify your sign-in status.");
    }
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const signIn = React.useCallback(async (credentials: { email: string; password: string }) => {
    const response = await nurviaApi.login(credentials);
    if (response.success && response.data) {
      setUser(response.data);
      setStatus("authenticated");
      setError(null);
    }
    return response;
  }, []);

  const signOut = React.useCallback(async () => {
    const response = await nurviaApi.logout();
    if (response.success) {
      setUser(null);
      setStatus("unauthenticated");
      setError(null);
    }
    return response;
  }, []);

  const updateProfile = React.useCallback(async (name: string) => {
    const response = await nurviaApi.updateProfile({ name });
    if (response.success && response.data) {
      setUser(response.data);
    }
    return response;
  }, []);

  const value = React.useMemo(
    () => ({ status, user, error, signIn, signOut, updateProfile, refresh }),
    [status, user, error, signIn, signOut, updateProfile, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }
  return context;
}
