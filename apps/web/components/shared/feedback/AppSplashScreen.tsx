"use client";

import * as React from "react";
import { Logo } from "@/components/brand/logo";
import { motion } from "framer-motion";
import { useAuth } from "@/components/auth/auth-provider";

/**
 * Global splash overlay shown only while the initial session check is in flight.
 * Children are rendered underneath (never withheld); the overlay unmounts as soon as
 * authentication settles as authenticated, unauthenticated, or error. AuthProvider never
 * returns to "loading" after the first check, so the splash cannot reappear.
 */
export function AppInitializationSplash() {
  const { status } = useAuth();
  if (status !== "loading") return null;
  return <AppSplashScreen />;
}

export function AppSplashScreen() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading NURVIA"
      className="fixed inset-0 z-50 flex items-center justify-center bg-background"
    >
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
          Advancing healthcare learning.
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