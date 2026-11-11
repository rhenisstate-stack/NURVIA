import * as React from "react";
import { ErrorType, isAuthError } from "@/lib/utils/error-utils";

interface NetworkErrorState {
  isConnected: boolean;
  error: unknown | null;
  isRetrying: boolean;
  retryCount: number;
}

/**
 * Custom hook to track network connectivity and handle network errors
 */
export function useNetworkError() {
  const [state, setState] = React.useState<NetworkErrorState>({
    isConnected: navigator.onLine,
    error: null,
    isRetrying: false,
    retryCount: 0
  });

  // Handle online/offline events
  React.useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({
        ...prev,
        isConnected: true,
        error: null
      }));
    };

    const handleOffline = () => {
      setState(prev => ({
        ...prev,
        isConnected: false,
        error: new Error('Network disconnected')
      }));
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle retry logic
  const retry = React.useCallback(async (retryFunction?: () => Promise<void> | void) => {
    if (state.isRetrying || !retryFunction) return;

    setState(prev => ({ ...prev, isRetrying: true, retryCount: prev.retryCount + 1 }));

    try {
      await retryFunction();
      setState(prev => ({ ...prev, error: null, isRetrying: false }));
    } catch (error) {
      setState(prev => ({ ...prev, error, isRetrying: false }));
    }
  }, [state.isRetrying]);

  // Reset error state
  const resetError = React.useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Check if error is authentication-related
  const isAuthErrorState = React.useCallback((error: unknown) => {
    return isAuthError(error);
  }, []);

  return {
    ...state,
    retry,
    resetError,
    isAuthError: isAuthErrorState
  };
}