import * as React from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface InlineLoaderProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export function InlineLoader({ className, size = 'md', text }: InlineLoaderProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn("flex items-center gap-2", className)}
    >
      <Loader2 className={cn(sizeClasses[size], "animate-spin text-brand-teal")} />
      {text && <span className="text-sm text-foreground-secondary">{text}</span>}
    </motion.div>
  );
}