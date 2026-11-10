import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "destructive"
    | "link";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

const baseStyles =
  "inline-flex items-center justify-center font-semibold rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none";

const variantStyles = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm active:translate-y-[0.5px]",
  secondary:
    "bg-surface text-brand-navy border border-border hover:bg-surface-muted shadow-sm dark:bg-surface dark:text-slate-100 dark:border-border",
  outline:
    "border border-border text-foreground hover:bg-surface-muted dark:border-border dark:hover:bg-surface-muted",
  ghost:
    "text-foreground hover:bg-surface-muted hover:text-foreground dark:hover:bg-surface-muted",
  destructive:
    "bg-semantic-error text-white hover:bg-red-700 shadow-sm focus-visible:ring-red-500",
  link: "text-primary underline-offset-4 hover:underline p-0 h-auto font-medium",
};

const sizeStyles = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2.5",
  icon: "h-10 w-10 p-0",
};

/**
 * Returns the Button class list so non-button elements (e.g. Next.js links)
 * can share the design-system button styles without nesting interactive elements.
 */
function buttonVariants({
  variant = "primary",
  size = "md",
  className,
}: Pick<ButtonProps, "variant" | "size" | "className"> = {}) {
  return cn(baseStyles, variantStyles[variant], sizeStyles[size], className);
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={buttonVariants({ variant, size, className })}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
