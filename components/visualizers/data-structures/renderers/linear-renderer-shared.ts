/**
 * Shared utilities for Stack, Queue, and LinkedList renderers.
 * Keeps animation config and node styling consistent across linear data structures.
 */

import { cn } from "@/lib/utils";

export const SPRING_TRANSITION = {
  type: "spring" as const,
  stiffness: 300,
  damping: 25,
};

export const REDUCED_TRANSITION = { duration: 0 };

export function getNodeClasses(highlighted: boolean, baseClasses: string): string {
  return cn(
    baseClasses,
    highlighted
      ? "border-accent-green bg-accent-green/20 text-accent-green shadow-[0_0_12px_var(--color-accent-green)/20%]"
      : "border-zinc-700 bg-zinc-900 text-zinc-300",
  );
}
