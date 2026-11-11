"use client";

import * as React from "react";
import { NetworkError } from "@/components/shared/feedback/NetworkError";
import { NotFoundPage } from "@/components/shared/feedback/NotFoundPage";
import { useNetworkError } from "@/hooks/use-network-error";
import { classifyApiError, getErrorMessage } from "@/lib/error-utils";

interface ApiErrorHandlerProps {
  error: any;
  onRetry?: () => void;
  onBack?: () => void;
  children: React.ReactNode;
}

export function ApiErrorHandler({ error, onRetry, onBack, children }: ApiErrorHandlerProps) {
  const { setError, clearError } = useNetworkError();
  
  // Handle API error cases
  React.useEffect(() => {
    if (error) {
      const errorType = classifyApiError(error);
      let message = getErrorMessage(error);
      
      // Customize messages for specific error types
      if (errorType === 'not_found') {
        return;
      }
      
      setError(message);
    }
  }, [error, setError]);
  
  // Render error state if there's an error
  if (error) {
    const errorType = classifyApiError(error);
    
    // Special handling for 404
    if (errorType === 'not_found') {
      return <NotFoundPage />;
    }
    
    // Handle network errors
    return (
      <NetworkError
        message={getErrorMessage(error)}
        onRetry={onRetry}
        onBack={onBack}
        showRetry={!!onRetry}
        showBack={!!onBack}
      />
    );
  }
  
  return <>{children}</>;
}