"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BarChart3, RotateCcw } from "lucide-react";

import { Badge, Button, Card } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useVisualizer } from "@/hooks";

import { ComplexityBadge } from "./complexity-badge";

interface PostRunSummaryProps {
  className?: string;
}

export function PostRunSummary({ className }: PostRunSummaryProps) {
  const shouldReduceMotion = useReducedMotion();
  const { isComplete, algorithmMeta, totalMaterialized, reset } =
    useVisualizer();

  if (!isComplete || !algorithmMeta) return null;

  return (
    <AnimatePresence>
      {isComplete && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.3 }}
          className={cn("w-full", className)}
        >
          <Card variant="elevated" padding="md">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <BarChart3 size={16} className="text-accent-green" />
                  <span className="font-mono text-sm font-semibold text-text-primary">
                    Run Complete
                  </span>
                </div>

                <div className="space-y-1 font-mono text-xs text-text-secondary">
                  <div>
                    Algorithm:{" "}
                    <span className="text-text-primary">
                      {algorithmMeta.name}
                    </span>
                  </div>
                  <div>
                    Total Steps:{" "}
                    <span className="text-text-primary">
                      {totalMaterialized}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    Complexity: <ComplexityBadge meta={algorithmMeta} />
                  </div>
                  {algorithmMeta.stable !== undefined && (
                    <div>
                      Stable:{" "}
                      <Badge variant={algorithmMeta.stable ? "green" : "amber"}>
                        {algorithmMeta.stable ? "Yes" : "No"}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              <Button variant="recovery" size="sm" onClick={reset}>
                <RotateCcw size={14} />
                Run Again
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
