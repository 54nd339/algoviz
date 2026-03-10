"use client";

import { motion, useReducedMotion } from "framer-motion";

import { EmptyCanvasState } from "@/components/visualizers/shared/empty-canvas-state";
import type { HanoiStep } from "@/lib/algorithms/games";
import { cn } from "@/lib/utils";
import type { AlgorithmStep } from "@/types";

interface HanoiTowersProps {
  step: AlgorithmStep<HanoiStep> | null;
  className?: string;
}

const DISK_COLORS = [
  "bg-cyan-400",
  "bg-green-400",
  "bg-amber-400",
  "bg-violet-400",
  "bg-pink-400",
  "bg-red-400",
  "bg-blue-400",
  "bg-emerald-400",
];

export function HanoiTowers({ step, className }: HanoiTowersProps) {
  const reducedMotion = useReducedMotion();
  const data = step?.data;

  if (!data) {
    return (
      <EmptyCanvasState
        message="Select Tower of Hanoi and press play"
        className={className}
      />
    );
  }

  const { pegs, movingDisk, from, to, moveNumber, totalMoves } = data;
  const maxDisks = Math.max(...pegs.flat(), 1);
  const maxWidth = 160;
  const pegHeight = (maxDisks + 1) * 24 + 16;

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div className="flex items-end gap-8">
        {pegs.map((peg, pegIdx) => (
          <div key={pegIdx} className="flex flex-col items-center">
            <span className="mb-1 font-mono text-[10px] text-text-muted">
              {pegIdx === 0 ? "Source" : pegIdx === 1 ? "Aux" : "Target"}
            </span>

            <div
              className="relative flex flex-col-reverse items-center gap-0.5 rounded-b-md border border-t-0 border-zinc-700 bg-zinc-900/50 pb-1"
              style={{ width: maxWidth + 32, height: pegHeight }}
            >
              <div className="absolute top-0 left-1/2 h-full w-1 -translate-x-1/2 rounded-t bg-zinc-600" />

              {peg.map((disk, diskIdx) => {
                const widthPct = 0.3 + (disk / maxDisks) * 0.7;
                const isMoving =
                  step.type === "move" && disk === movingDisk && pegIdx === to;

                return (
                  <motion.div
                    key={`${pegIdx}-${diskIdx}-${disk}`}
                    className={cn(
                      "relative z-10 rounded-md border border-white/10",
                      DISK_COLORS[(disk - 1) % DISK_COLORS.length],
                      isMoving && "shadow-[0_0_12px_rgba(34,211,238,0.4)]",
                    )}
                    style={{
                      width: widthPct * maxWidth,
                      height: 20,
                    }}
                    layout
                    initial={isMoving ? { scale: 1.1 } : false}
                    animate={{ scale: 1 }}
                    transition={
                      reducedMotion
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 400, damping: 25 }
                    }
                  >
                    <span className="absolute inset-0 flex items-center justify-center font-mono text-[10px] font-bold text-text-primary/60">
                      {disk}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 font-mono text-xs text-text-muted">
        <span>
          Move: <span className="text-text-primary">{moveNumber}</span> /{" "}
          {totalMoves}
        </span>
        {step.type === "move" && (
          <span>
            Disk <span className="text-cyan-400">{movingDisk}</span>: peg {from}{" "}
            → peg {to}
          </span>
        )}
      </div>
    </div>
  );
}
