"use client";

import * as React from "react";
import { AppSplashScreen } from "@/components/shared/feedback/AppSplashScreen";
import { RedirectScreen } from "@/components/shared/feedback/RedirectScreen";

interface PageLoaderProps {
  isLoading?: boolean;
  isRedirecting?: boolean;
  redirectHeading?: string;
  redirectDescription?: string;
  redirectDestination?: string;
  children: React.ReactNode;
}

export function PageLoader({
  isLoading = false,
  isRedirecting = false,
  redirectHeading,
  redirectDescription,
  redirectDestination,
  children
}: PageLoaderProps) {
  if (isLoading) {
    return <AppSplashScreen />;
  }
  
  if (isRedirecting) {
    return (
      <RedirectScreen
        heading={redirectHeading}
        description={redirectDescription}
        destination={redirectDestination}
      />
    );
  }
  
  return <>{children}</>;
}