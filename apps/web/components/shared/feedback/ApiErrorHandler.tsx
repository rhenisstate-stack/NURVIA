"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { AlertTriangle, RotateCw } from "lucide-react";
import { ErrorType, getUserFriendlyMessage, isRetryableError } from "@/lib/utils/error-utils";

interface ApiErrorHandlerProps {
  error: unknown;
  onRetry?: () => void;
  title?: string;
  showRetry?: boolean;
  className?: string;
}

export function ApiErrorHandler({
  error,
  onRetry,
  title = "Something went wrong",
  showRetry = true,
  className
}: ApiErrorHandlerProps) {
  const errorMessage = getUserFriendlyMessage(error);
  const isRetryable = isRetryableError(error);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <div className="rounded-lg border border-rose-300 bg-rose-50 p-4 text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <div className="ml-3">
            <h3 className="text-sm font-medium">{title}</h3>
            <div className="mt-2 text-sm">
              <p>{errorMessage}</p>
            </div>
            {isRetryable && showRetry && onRetry && (
              <div className="mt-3">
                <Button
                  onClick={onRetry}
                  className="flex items-center justify-center gap-2"
                  variant="outline"
                >
                  <RotateCw className="h-4 w-4" />
                  Try Again
                </Button>
              </div>
            )}
            {!isRetryable && showRetry && onRetry && (
              <div className="mt-3">
                <Button
                  onClick={onRetry}
                  className="flex items-center justify-center gap-2"
                  variant="outline"
                >
                  <RotateCw className="h-4 w-4" />
                  Reload Page
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}