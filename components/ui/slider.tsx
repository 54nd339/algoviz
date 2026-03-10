"use client";

import { forwardRef } from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

const Slider = forwardRef<
  React.ComponentRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none items-center select-none",
      className,
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-bg-elevated">
      <SliderPrimitive.Range className="absolute h-full bg-accent-green" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="glow-green block h-4 w-4 rounded-full border border-accent-green bg-bg-primary transition-colors focus-visible:ring-1 focus-visible:ring-accent-green focus-visible:outline-none" />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
