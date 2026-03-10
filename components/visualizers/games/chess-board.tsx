"use client";

import { motion, useReducedMotion } from "framer-motion";

import { EmptyCanvasState } from "@/components/visualizers/shared/empty-canvas-state";
import type { KnightStep, QueenStep } from "@/lib/algorithms/games";
import { cn } from "@/lib/utils";
import { PALETTE } from "@/lib/utils/theme-colors";
import type { AlgorithmStep } from "@/types";

interface ChessBoardProps {
  step: AlgorithmStep<KnightStep> | AlgorithmStep<QueenStep> | null;
  mode: "knight" | "queens";
  className?: string;
}

function isKnightStep(data: KnightStep | QueenStep): data is KnightStep {
  return "path" in data;
}

export function ChessBoard({ step, mode, className }: ChessBoardProps) {
  const reducedMotion = useReducedMotion();
  const data = step?.data;

  if (!data) {
    return (
      <EmptyCanvasState
        message={`Select ${mode === "knight" ? "Knight's Tour" : "N-Queens"} and press play`}
        className={className}
      />
    );
  }

  if (mode === "knight" && isKnightStep(data)) {
    return (
      <KnightBoard
        step={step as AlgorithmStep<KnightStep>}
        className={className}
        reducedMotion={reducedMotion ?? false}
      />
    );
  }

  return (
    <QueensBoard
      step={step as AlgorithmStep<QueenStep>}
      className={className}
      reducedMotion={reducedMotion ?? false}
    />
  );
}

function KnightBoard({
  step,
  className,
  reducedMotion,
}: {
  step: AlgorithmStep<KnightStep>;
  className?: string;
  reducedMotion: boolean;
}) {
  const { board, currentPos, moveNumber, possibleMoves, backtracking, path } =
    step.data;
  const size = board.length;
  const possibleSet = new Set(possibleMoves.map(([r, c]) => `${r},${c}`));

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div
        className="grid overflow-hidden rounded-lg border border-border"
        style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
      >
        {board.map((row, r) =>
          row.map((val, c) => {
            const isDark = (r + c) % 2 === 1;
            const isCurrent = r === currentPos[0] && c === currentPos[1];
            const isPossible = possibleSet.has(`${r},${c}`);
            const isOnPath = val !== null;

            return (
              <motion.div
                key={`${r}-${c}`}
                className={cn(
                  "relative flex h-12 w-12 items-center justify-center font-mono text-xs transition-colors",
                  isDark ? "bg-zinc-700" : "bg-zinc-800",
                  isCurrent &&
                    "bg-cyan-400/30 shadow-[inset_0_0_12px_rgba(34,211,238,0.3)]",
                  isCurrent && backtracking && "bg-red-400/30",
                  isPossible && "bg-green-400/15",
                )}
                animate={isCurrent ? { scale: [1, 1.02, 1] } : {}}
                transition={{ duration: reducedMotion ? 0 : 0.2 }}
              >
                {isCurrent && <span className="text-lg">♞</span>}
                {!isCurrent && isOnPath && (
                  <span className="text-[10px] text-green-400/70">{val}</span>
                )}
                {isPossible && !isOnPath && (
                  <span className="h-2 w-2 rounded-full bg-green-400/40" />
                )}
              </motion.div>
            );
          }),
        )}
      </div>

      <div className="flex items-center gap-4 font-mono text-xs text-text-muted">
        <span>
          Move: <span className="text-text-primary">{moveNumber}</span> /{" "}
          {size * size - 1}
        </span>
        <span>
          Position:{" "}
          <span className="text-cyan-400">
            ({currentPos[0]},{currentPos[1]})
          </span>
        </span>
        <span>
          Visited: <span className="text-green-400">{path.length}</span> /{" "}
          {size * size}
        </span>
        {backtracking && <span className="text-amber-400">Backtracking</span>}
      </div>
    </div>
  );
}

function QueensBoard({
  step,
  className,
  reducedMotion,
}: {
  step: AlgorithmStep<QueenStep>;
  className?: string;
  reducedMotion: boolean;
}) {
  const { board, currentRow, currentCol, conflicts, placed, backtracking, n } =
    step.data;
  const conflictSet = new Set(conflicts.map(([r, c]) => `${r},${c}`));

  const attackLines: { r1: number; c1: number; r2: number; c2: number }[] = [];
  if (step.type === "try-conflict" || step.type === "try-safe") {
    for (const [pr, pc] of placed) {
      if (
        pc === currentCol ||
        Math.abs(pr - currentRow) === Math.abs(pc - currentCol)
      ) {
        attackLines.push({ r1: pr, c1: pc, r2: currentRow, c2: currentCol });
      }
    }
  }

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div className="relative">
        <div
          className="grid overflow-hidden rounded-lg border border-border"
          style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
        >
          {board.map((row, r) =>
            row.map((hasQueen, c) => {
              const isDark = (r + c) % 2 === 1;
              const isCurrent =
                r === currentRow &&
                c === currentCol &&
                step.type !== "init" &&
                step.type !== "done" &&
                step.type !== "no-solution";
              const isConflict = conflictSet.has(`${r},${c}`);

              return (
                <motion.div
                  key={`${r}-${c}`}
                  className={cn(
                    "flex items-center justify-center font-mono transition-colors",
                    n <= 6 ? "h-14 w-14" : n <= 8 ? "h-12 w-12" : "h-9 w-9",
                    isDark ? "bg-zinc-700" : "bg-zinc-800",
                    isCurrent && !backtracking && "bg-cyan-400/20",
                    isCurrent && backtracking && "bg-red-400/20",
                    isConflict && "bg-red-400/15",
                  )}
                  animate={isConflict ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ duration: reducedMotion ? 0 : 0.2 }}
                >
                  {hasQueen && (
                    <motion.span
                      className={cn(
                        "text-lg",
                        isConflict ? "text-red-400" : "text-green-400",
                      )}
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={
                        reducedMotion
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 500, damping: 25 }
                      }
                    >
                      ♛
                    </motion.span>
                  )}
                  {isCurrent && !hasQueen && (
                    <span className="text-lg text-cyan-400/50">♛</span>
                  )}
                </motion.div>
              );
            }),
          )}
        </div>

        {attackLines.length > 0 && (
          <svg className="pointer-events-none absolute inset-0 h-full w-full">
            {attackLines.map((line, i) => {
              const cellSize = n <= 6 ? 56 : n <= 8 ? 48 : 36;
              return (
                <line
                  key={i}
                  x1={line.c1 * cellSize + cellSize / 2}
                  y1={line.r1 * cellSize + cellSize / 2}
                  x2={line.c2 * cellSize + cellSize / 2}
                  y2={line.r2 * cellSize + cellSize / 2}
                  stroke={PALETTE.accentRedAlpha}
                  strokeWidth="2"
                  strokeDasharray="4 2"
                />
              );
            })}
          </svg>
        )}
      </div>

      <div className="flex items-center gap-4 font-mono text-xs text-text-muted">
        <span>
          Queens: <span className="text-green-400">{placed.length}</span> / {n}
        </span>
        {step.type !== "init" &&
          step.type !== "done" &&
          step.type !== "no-solution" && (
            <span>
              Trying:{" "}
              <span className="text-cyan-400">
                row {currentRow}, col {currentCol}
              </span>
            </span>
          )}
        {conflicts.length > 0 && (
          <span className="text-red-400">{conflicts.length} conflicts</span>
        )}
        {backtracking && <span className="text-amber-400">Backtracking</span>}
      </div>
    </div>
  );
}
