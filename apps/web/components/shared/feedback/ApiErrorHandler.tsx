"use client";

import * as React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  const isErrorType = error instanceof Error;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>
          <p className="mb-3">{errorMessage}</p>
          
          {isRetryable && showRetry && onRetry && (
            <div className="flex flex-col sm:flex-row gap-2 mt-3">
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
        </AlertDescription>
      </Alert>
    </motion.div>
  );
}