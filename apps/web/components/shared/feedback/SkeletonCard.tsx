import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  className?: string;
  children?: React.ReactNode;
  animate?: boolean;
}

export function SkeletonCard({ className, children, animate = true }: SkeletonCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={animate ? { opacity: 1 } : {}}
      transition={{ duration: 0.3 }}
      className={cn(
        "rounded-xl border border-border bg-surface p-4 shadow-sm",
        className
      )}
    >
      {children}
    </motion.div>
  );
}