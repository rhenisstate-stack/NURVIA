import * as React from "react";

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

interface LoadingStateOptions {
  /** Initial loading state */
  initialState?: LoadingState;
  /** Whether to automatically reset after success */
  autoReset?: boolean;
}

/**
 * Custom hook to manage loading states
 */
export function useLoadingState(options: LoadingStateOptions = {}) {
  const { initialState = 'idle', autoReset = false } = options;
  const [state, setState] = React.useState<LoadingState>(initialState);
  const [error, setError] = React.useState<unknown | null>(null);

  const setLoading = React.useCallback(() => {
    setState('loading');
    setError(null);
  }, []);

  const setSuccess = React.useCallback(() => {
    setState('success');
    setError(null);
    
    if (autoReset) {
      // Reset after a delay to allow UI to show success state
      setTimeout(() => {
        setState('idle');
      }, 2000);
    }
  }, [autoReset]);

  const setErrorState = React.useCallback((err: unknown) => {
    setState('error');
    setError(err);
  }, []);

  const reset = React.useCallback(() => {
    setState('idle');
    setError(null);
  }, []);

  const isLoading = React.useMemo(() => state === 'loading', [state]);
  const isSuccess = React.useMemo(() => state === 'success', [state]);
  const isError = React.useMemo(() => state === 'error', [state]);

  return {
    state,
    error,
    isLoading,
    isSuccess,
    isError,
    setLoading,
    setSuccess,
    setError: setErrorState,
    reset
  };
}