"use client";

import * as React from "react";
import { NetworkError } from "@/components/shared/feedback/NetworkError";
import { RedirectScreen } from "@/components/shared/feedback/RedirectScreen";
import { useAuth } from "@/components/auth/auth-provider";
import { useRouter } from "next/navigation";

interface AuthErrorBoundaryProps {
  children: React.ReactNode;
}

export function AuthErrorBoundary({ children }: AuthErrorBoundaryProps) {
  const { status, error } = useAuth();
  const router = useRouter();
  
  // Handle authentication errors
  if (status === "error" && error) {
    return (
      <NetworkError
        title="Authentication Error"
        message={error}
        showRetry={true}
        onRetry={() => router.refresh()}
      />
    );
  }
  
  // Handle loading state
  if (status === "loading") {
    return <RedirectScreen heading="Verifying your access" description="Please wait while we securely prepare your account." />;
  }
  
  return <>{children}</>;
}