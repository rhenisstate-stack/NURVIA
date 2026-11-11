"use client";

import * as React from "react";
import { Logo } from "@/components/brand/logo";
import { Button, buttonVariants } from "@/components/ui/button";
import { motion } from "framer-motion";
import { SearchX } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface NotFoundPageProps {
  title?: string;
  message?: string;
  showBack?: boolean;
  showDashboard?: boolean;
  /** Explicit destination for "Go Back". When omitted, browser history is used. */
  backHref?: string;
  dashboardHref?: string;
}

export function NotFoundPage({
  title = "404 — Page not found",
  message = "Looks like this page has wandered outside the NURVIA learning environment. The page you're looking for may have been moved, removed, or may no longer be available.",
  showBack = true,
  showDashboard = true,
  backHref,
  dashboardHref = "/"
}: NotFoundPageProps) {
  const router = useRouter();
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="flex flex-col items-center gap-6 text-center max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400">
            <SearchX className="h-8 w-8" />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <h1 className="font-brand text-3xl font-bold text-foreground">
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
          {showBack && (
            backHref ? (
              <Link href={backHref} className={buttonVariants()}>
                Go Back
              </Link>
            ) : (
              <Button type="button" onClick={() => router.back()}>
                Go Back
              </Button>
            )
          )}

          {showDashboard && (
            <Link href={dashboardHref} className={buttonVariants({ variant: "outline" })}>
              Return to Dashboard
            </Link>
          )}
        </motion.div>
      </div>
    </div>
  );
}