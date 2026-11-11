"use client";

import * as React from "react";
import { Logo } from "@/components/brand/logo";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PageLoaderProps {
  isLoading?: boolean;
  message?: string;
  className?: string;
  children?: React.ReactNode;
}

export function PageLoader({ 
  isLoading = true, 
  message = "Loading your workspace...",
  className,
  children
}: PageLoaderProps) {
  if (!isLoading) {
    return <>{children}</>;
  }

  return (
    <div className={cn("fixed inset-0 z-50 flex items-center justify-center bg-background", className)}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-6 text-center"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <Logo size="lg" variant="full" withLink={false} />
        </motion.div>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-sm text-foreground-secondary max-w-md"
        >
          {message}
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center gap-2"
        >
          <div className="h-2 w-2 rounded-full bg-brand-teal animate-bounce"></div>
          <div className="h-2 w-2 rounded-full bg-brand-teal animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="h-2 w-2 rounded-full bg-brand-teal animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </motion.div>
      </motion.div>
    </div>
  );
}