"use client";

import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

const CELL_LABELS = ["0", "1", "2", "3", "4", "5", "6", "7", "8"];

export interface TicTacToeCellProps {
  cell: string | null;
  index: number;
  isWinCell: boolean;
  isExploring: boolean;
  isBest: boolean;
  isPruned: boolean;
  cellScore?: number;
  reducedMotion?: boolean;
}

/**
 * Single cell in the minimax TicTacToe board.
 * Highlight states (win, exploring, best, pruned) drive styling.
 */
export function TicTacToeCell({
  cell,
  index,
  isWinCell,
  isExploring,
  isBest,
  isPruned,
  cellScore,
  reducedMotion: reducedMotionProp,
}: TicTacToeCellProps) {
  const reducedMotionHook = useReducedMotion();
  const reducedMotion = reducedMotionProp ?? reducedMotionHook ?? false;
  return (
    <motion.div
      className={cn(
        "relative flex h-16 w-16 items-center justify-center rounded-md border font-mono text-2xl font-bold transition-colors",
        isWinCell
          ? "border-green-400/50 bg-green-400/10 shadow-[0_0_12px_rgba(34,197,94,0.3)]"
          : isExploring
            ? "border-cyan-400 bg-cyan-400/15 ring-1 ring-cyan-400/40"
            : isBest
              ? "border-cyan-400/50 bg-cyan-400/10"
              : isPruned
                ? "border-red-900/40 bg-red-950/20"
                : "border-zinc-700 bg-zinc-900/80",
      )}
      layout
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
        duration: reducedMotion ? 0 : undefined,
      }}
    >
      {cell ? (
        <span
          className={cn(
            cell === "X" ? "text-cyan-400" : "text-amber-400",
          )}
        >
          {cell}
        </span>
      ) : (
        <span className="text-[10px] text-zinc-700">
          {CELL_LABELS[index]}
        </span>
      )}

      {/* Score badge - only shown on empty cells when evaluating moves */}
      {cell === null && cellScore !== undefined && (
        <span
          className={cn(
            "absolute -top-1 -right-1 rounded-full px-1 py-0.5 font-mono text-[8px] leading-none font-bold",
            cellScore > 0
              ? "bg-green-500/20 text-green-400"
              : cellScore < 0
                ? "bg-red-500/20 text-red-400"
                : "bg-zinc-500/20 text-zinc-400",
          )}
        >
          {cellScore > 0 ? `+${cellScore}` : cellScore}
        </span>
      )}

      {/* Pruned cells show overlay when not yet filled */}
      {isPruned && cell === null && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg text-red-500/40">✕</span>
        </span>
      )}
    </motion.div>
  );
}
