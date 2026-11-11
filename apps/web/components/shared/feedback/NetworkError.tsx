"use client";

import * as React from "react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { WifiOff, RefreshCw } from "lucide-react";
import { retryOperation } from "@/lib/utils/retry-utils";
import { getRetryOptions, shouldRetryRequest } from "@/lib/utils/request-utils";
import { ErrorType, getUserFriendlyMessage } from "@/lib/utils/error-utils";
import { ApiErrorHandler } from "@/components/shared/feedback/ApiErrorHandler";

interface NetworkErrorProps {
  onRetry?: () => Promise<void> | void;
  message?: string;
  title?: string;
  showRetry?: boolean;
  showBack?: boolean;
  onBack?: () => void;
  retryOptions?: {
    maxAttempts?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffMultiplier?: number;
    jitter?: boolean;
  };
  error?: unknown;
}

export function NetworkError({
  onRetry,
  message = "We couldn't reach the NURVIA services. Your internet connection may be unavailable, or the service may be temporarily unreachable.",
  title = "Connection interrupted",
  showRetry = true,
  showBack = false,
  onBack,
  retryOptions = {},
  error
}: NetworkErrorProps) {
  const [isRetrying, setIsRetrying] = React.useState(false);
  const [retryCount, setRetryCount] = React.useState(0);
  
  const handleRetry = React.useCallback(async () => {
    if (!onRetry || isRetrying) return;
    
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    
    try {
      // Attempt retry using the retry infrastructure
      if (shouldRetryRequest(error, { retry: true })) {
        const options = getRetryOptions({ retryOptions });
        const result = await retryOperation(async () => {
          await onRetry();
        }, options);
        
        if (result.error) {
          // Handle retry failure
          console.error("Retry failed:", result.error);
        }
      } else {
        // Simple retry without exponential backoff
        await onRetry();
      }
    } catch (err) {
      console.error("Retry error:", err);
    } finally {
      setIsRetrying(false);
    }
  }, [onRetry, isRetrying, error, retryOptions]);
  
  // If we have an error and it's not just a network error, use the ApiErrorHandler
  if (error && !isRetrying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full">
          <ApiErrorHandler 
            error={error} 
            onRetry={handleRetry}
            title={title}
            showRetry={showRetry}
          />
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="flex flex-col items-center gap-6 text-center max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
            <WifiOff className="h-8 w-8" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <h1 className="font-brand text-xl font-bold text-foreground">
            {title}
          </h1>
          <p className="mt-3 text-sm text-foreground-secondary">
            {message}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 w-full"
        >
          {showRetry && (
            <Button
              onClick={handleRetry}
              disabled={isRetrying}
              className="flex items-center justify-center gap-2"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </>
              )}
            </Button>
          )}

          {showBack && onBack && (
            <Button
              variant="outline"
              onClick={onBack}
              className="flex items-center justify-center gap-2"
            >
              Return to Dashboard
            </Button>
          )}
        </motion.div>
      </div>
    </div>
  );
}