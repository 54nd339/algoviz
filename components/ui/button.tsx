"use client";

import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-green disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-bg-elevated text-text-primary border border-border hover:bg-bg-surface",
        ghost:
          "hover:bg-bg-elevated text-text-secondary hover:text-text-primary",
        outline:
          "border border-border bg-transparent text-text-primary hover:bg-bg-elevated",
        accent:
          "bg-accent-green text-bg-primary font-semibold hover:bg-accent-green/90 glow-green",
        recovery:
          "border border-accent-amber/40 bg-accent-amber/10 text-accent-amber hover:bg-accent-amber/15 focus-visible:ring-accent-amber",
        recoveryGhost:
          "text-accent-amber border border-transparent hover:border-accent-amber/30 hover:bg-accent-amber/10 focus-visible:ring-accent-amber",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-9 px-4 text-sm",
        lg: "h-10 px-6 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
export type { ButtonProps };
