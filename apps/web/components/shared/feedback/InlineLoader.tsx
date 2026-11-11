"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface InlineLoaderProps {
  message?: string;
  className?: string;
}

export function InlineLoader({ 
  message = "Loading...",
  className
}: InlineLoaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn("inline-flex items-center gap-2", className)}
    >
      <div className="flex items-center gap-1">
        <div className="h-2 w-2 rounded-full bg-brand-teal animate-bounce"></div>
        <div className="h-2 w-2 rounded-full bg-brand-teal animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="h-2 w-2 rounded-full bg-brand-teal animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
      
      {message && (
        <span className="text-xs text-foreground-secondary">
          {message}
        </span>
      )}
    </motion.div>
  );
}