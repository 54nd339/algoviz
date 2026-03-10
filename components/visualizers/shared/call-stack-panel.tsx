"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Layers } from "lucide-react";

import { CollapsiblePanel } from "@/components/visualizers/shared/collapsible-panel";
import { cn } from "@/lib/utils";
import { useVisualizer } from "@/hooks";

interface CallStackPanelProps {
  className?: string;
}

export function CallStackPanel({ className }: CallStackPanelProps) {
  const shouldReduceMotion = useReducedMotion();
  const { currentStep } = useVisualizer();

  const callStack = currentStep?.callStack ?? [];
  if (callStack.length === 0) return null;

  return (
    <CollapsiblePanel
      title="Call Stack"
      icon={<Layers size={14} />}
      count={callStack.length}
      className={className}
      contentClassName="flex flex-col-reverse gap-0.5 px-3"
    >
      <AnimatePresence initial={false}>
        {callStack.map((frame, i) => {
          const argsStr = Object.entries(frame.args)
            .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
            .join(", ");
          return (
            <motion.div
              key={`${frame.name}-${i}`}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.15 }}
              className={cn(
                "rounded border border-border px-2 py-1 font-mono text-xs",
                i === callStack.length - 1
                  ? "border-accent-green/40 bg-accent-green/5 text-accent-green"
                  : "text-text-secondary",
              )}
            >
              <span className="font-semibold">{frame.name}</span>
              <span className="text-text-muted">({argsStr})</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </CollapsiblePanel>
  );
}
