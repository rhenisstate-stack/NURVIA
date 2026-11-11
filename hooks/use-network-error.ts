import * as React from "react";

interface NetworkErrorState {
  hasError: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export function useNetworkError(): NetworkErrorState {
  const [error, setError] = React.useState<string | null>(null);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  return {
    hasError: error !== null,
    error,
    setError,
    clearError
  };
}