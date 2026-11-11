import * as React from "react";

interface LoadingState {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  startLoading: () => void;
  stopLoading: () => void;
}

export function useLoadingState(initialLoading = false): LoadingState {
  const [isLoading, setIsLoading] = React.useState(initialLoading);

  const startLoading = React.useCallback(() => {
    setIsLoading(true);
  }, []);

  const stopLoading = React.useCallback(() => {
    setIsLoading(false);
  }, []);

  return {
    isLoading,
    setIsLoading,
    startLoading,
    stopLoading
  };
}