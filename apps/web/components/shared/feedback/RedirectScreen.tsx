"use client";

import * as React from "react";
import { Logo } from "@/components/brand/logo";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface RedirectScreenProps {
  heading?: string;
  description?: string;
  destination?: string;
  showProgress?: boolean;
}

export function RedirectScreen({
  heading = "Preparing your workspace",
  description = "Securely redirecting you to your NURVIA dashboard.",
  destination,
  showProgress = true
}: RedirectScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="flex flex-col items-center gap-6 text-center max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Logo size="md" variant="compact" withLink={false} />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <h1 className="font-brand text-xl font-bold text-foreground">
            {heading}
          </h1>
          <p className="mt-2 text-sm text-foreground-secondary">
            {description}
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-2"
        >
          {showProgress ? (
            <Loader2 className="h-5 w-5 animate-spin text-brand-teal" />
          ) : (
            <div className="h-5 w-5 rounded-full bg-brand-teal"></div>
          )}
          <span className="text-xs text-foreground-muted">
            {destination ? `To: ${destination}` : "Please wait..."}
          </span>
        </motion.div>
      </div>
    </div>
  );
}