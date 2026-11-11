"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SectionLoaderProps {
  message?: string;
  className?: string;
  children?: React.ReactNode;
}

export function SectionLoader({ 
  message = "Loading content...",
  className,
  children
}: SectionLoaderProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-8", className)}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-brand-teal animate-bounce"></div>
          <div className="h-3 w-3 rounded-full bg-brand-teal animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="h-3 w-3 rounded-full bg-brand-teal animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        
        <p className="text-sm text-foreground-secondary">
          {message}
        </p>
      </motion.div>
      
      {children && (
        <div className="mt-4">
          {children}
        </div>
      )}
    </div>
  );
}