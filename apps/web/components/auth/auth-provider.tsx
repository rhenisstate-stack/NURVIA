"use client";

import * as React from "react";
import { nurviaApi } from "@/lib/api-client";
import type { ApiResponse, AuthUserDto } from "@/lib/api-types";

type AuthStatus = "loading" | "authenticated" | "unauthenticated" | "error";

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
    const response = await nurviaApi.getCurrentUser();
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
