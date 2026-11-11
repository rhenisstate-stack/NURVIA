"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      className,
      checked,
      defaultChecked = false,
      onCheckedChange,
      disabled,
      onClick,
      type = "button",
      ...props
    },
    ref
  ) => {
    const [internalChecked, setInternalChecked] =
      React.useState(defaultChecked);

    const isChecked = checked ?? internalChecked;

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);

      if (event.defaultPrevented || disabled) return;

      const nextChecked = !isChecked;

      if (checked === undefined) {
        setInternalChecked(nextChecked);
      }

      onCheckedChange?.(nextChecked);
    };

    return (
      <button
        {...props}
        ref={ref}
        type={type}
        role="switch"
        aria-checked={isChecked}
        disabled={disabled}
        onClick={handleClick}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          isChecked ? "bg-brand-teal" : "bg-border",
          className
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
            isChecked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
    );
  }
);

Switch.displayName = "Switch";

export { Switch };
