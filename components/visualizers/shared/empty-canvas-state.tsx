"use client";

import { forwardRef } from "react";

import { cn } from "@/lib/utils";

interface EmptyCanvasStateProps {
  message?: string;
  className?: string;
}

export const EmptyCanvasState = forwardRef<
  HTMLDivElement,
  EmptyCanvasStateProps
>(function EmptyCanvasState({ message = "Select an algorithm and press play", className }, ref) {
  return (
    <div
      ref={ref}
      className={cn(
        "flex h-full min-h-[8rem] items-center justify-center rounded-lg border border-dashed border-border",
        className,
      )}
    >
      <p className="font-mono text-xs text-text-muted">{message}</p>
    </div>
  );
});
