import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SkeletonLoaderProps {
  className?: string;
  count?: number;
  height?: string;
  width?: string;
  animate?: boolean;
}

export function SkeletonLoader({
  className,
  count = 1,
  height = "h-4",
  width = "w-full",
  animate = true
}: SkeletonLoaderProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={animate ? { opacity: 1 } : {}}
          transition={{ duration: 0.3 }}
          className={cn(
            "animate-pulse rounded bg-surface-muted",
            height,
            width,
            className
          )}
        />
      ))}
    </>
  );
}