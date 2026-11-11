"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";

interface AuthErrorBoundaryProps {
  children: React.ReactNode;
}

interface AuthErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class AuthErrorBoundary extends React.Component<AuthErrorBoundaryProps, AuthErrorBoundaryState> {
  constructor(props: AuthErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): AuthErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("AuthErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="flex flex-col items-center gap-6 text-center max-w-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
                <AlertTriangle className="h-8 w-8" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <h1 className="font-brand text-xl font-bold text-foreground">
                Something went wrong
              </h1>
              <p className="mt-3 text-sm text-foreground-secondary">
                We encountered an error while loading your authentication state. 
                This may be due to a temporary issue with the authentication system.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
              className="flex flex-col sm:flex-row gap-3 w-full"
            >
              <Button onClick={this.handleReset} className="flex items-center justify-center gap-2">
                <RotateCcw className="h-4 w-4" />
                Try Again
              </Button>
            </motion.div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export { AuthErrorBoundary };