import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "secondary"
    | "outline"
    | "success"
    | "warning"
    | "destructive"
    | "info"
    | "teal";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const variantStyles = {
    default:
      "bg-surface-muted text-foreground border-border/80 border font-medium",
    secondary:
      "bg-surface-muted text-foreground-secondary border-border/70 border font-medium",
    teal: "bg-teal-500/10 text-teal-700 border-teal-500/20 border dark:text-teal-300 dark:bg-teal-500/15 font-semibold",
    outline: "border border-border text-foreground bg-transparent font-medium",
    success:
      "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 border dark:text-emerald-300 dark:bg-emerald-500/15 font-semibold",
    warning:
      "bg-amber-500/10 text-amber-800 border-amber-500/20 border dark:text-amber-300 dark:bg-amber-500/15 font-semibold",
    destructive:
      "bg-rose-500/10 text-rose-700 border-rose-500/20 border dark:text-rose-300 dark:bg-rose-500/15 font-semibold",
    info: "bg-blue-500/10 text-blue-700 border-blue-500/20 border dark:text-blue-300 dark:bg-blue-500/15 font-semibold",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs tracking-tight transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
