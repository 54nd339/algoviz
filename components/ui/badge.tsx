import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium font-mono",
  {
    variants: {
      variant: {
        default: "bg-bg-elevated text-text-secondary border border-border",
        green:
          "bg-accent-green/10 text-accent-green border border-accent-green/20",
        amber:
          "bg-accent-amber/10 text-accent-amber border border-accent-amber/20",
        red: "bg-accent-red/10 text-accent-red border border-accent-red/20",
        cyan: "bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

interface BadgeProps
  extends
    React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, className }))} {...props} />
  );
}

export { badgeVariants };
export type { BadgeProps };
