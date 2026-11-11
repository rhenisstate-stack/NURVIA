import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SectionLoaderProps {
  className?: string;
  height?: string;
  width?: string;
}

export function SectionLoader({ className, height = "h-32", width = "w-full" }: SectionLoaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn("flex items-center justify-center", className)}
    >
      <div className={cn("animate-pulse", height, width)}>
        <div className="h-full w-full bg-surface-muted rounded-lg"></div>
      </div>
    </motion.div>
  );
}