"use client";

import { motion, useReducedMotion } from "framer-motion";

import { EmptyCanvasState } from "@/components/visualizers/shared/empty-canvas-state";
import type { MinimaxStep } from "@/lib/algorithms/games";
import { cn } from "@/lib/utils";
import { getThemeColors } from "@/lib/utils/theme-colors";
import type { AlgorithmStep } from "@/types";

import { TicTacToeCell } from "./tic-tac-toe-cell";

interface TicTacToeProps {
  step: AlgorithmStep<MinimaxStep> | null;
  className?: string;
}

const WIN_LINE_COORDS: Record<
  string,
  { x1: string; y1: string; x2: string; y2: string }
> = {
  "0,1,2": { x1: "16.6%", y1: "16.6%", x2: "83.3%", y2: "16.6%" },
  "3,4,5": { x1: "16.6%", y1: "50%", x2: "83.3%", y2: "50%" },
  "6,7,8": { x1: "16.6%", y1: "83.3%", x2: "83.3%", y2: "83.3%" },
  "0,3,6": { x1: "16.6%", y1: "16.6%", x2: "16.6%", y2: "83.3%" },
  "1,4,7": { x1: "50%", y1: "16.6%", x2: "50%", y2: "83.3%" },
  "2,5,8": { x1: "83.3%", y1: "16.6%", x2: "83.3%", y2: "83.3%" },
  "0,4,8": { x1: "16.6%", y1: "16.6%", x2: "83.3%", y2: "83.3%" },
  "2,4,6": { x1: "83.3%", y1: "16.6%", x2: "16.6%", y2: "83.3%" },
};

const PHASE_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; border: string }
> = {
  init: {
    label: "SETUP",
    color: "text-zinc-400",
    bg: "bg-zinc-800/60",
    border: "border-zinc-600/40",
  },
  explore: {
    label: "EXPLORING",
    color: "text-cyan-400",
    bg: "bg-cyan-950/40",
    border: "border-cyan-500/30",
  },
  terminal: {
    label: "LEAF NODE",
    color: "text-amber-400",
    bg: "bg-amber-950/40",
    border: "border-amber-500/30",
  },
  prune: {
    label: "✂ PRUNED",
    color: "text-red-400",
    bg: "bg-red-950/40",
    border: "border-red-500/30",
  },
  backtrack: {
    label: "↩ BACKTRACK",
    color: "text-violet-400",
    bg: "bg-violet-950/40",
    border: "border-violet-500/30",
  },
  "ai-move": {
    label: "AI MOVES",
    color: "text-green-400",
    bg: "bg-green-950/40",
    border: "border-green-500/30",
  },
  "player-move": {
    label: "PLAYER MOVES",
    color: "text-blue-400",
    bg: "bg-blue-950/40",
    border: "border-blue-500/30",
  },
  "game-over": {
    label: "GAME OVER",
    color: "text-amber-400",
    bg: "bg-amber-950/40",
    border: "border-amber-500/30",
  },
};

export function TicTacToe({ step, className }: TicTacToeProps) {
  const reducedMotion = useReducedMotion();
  const theme = getThemeColors();
  const data = step?.data;

  if (!data) {
    return (
      <EmptyCanvasState
        message="Select Minimax and press play"
        className={className}
      />
    );
  }

  const {
    board,
    evaluationScores,
    bestMove,
    pruned,
    winLine,
    phase,
    isMaximizing,
    path,
    score,
  } = data;
  const winKey = winLine?.join(",");
  const phaseKey = phase ?? step?.type ?? "init";
  const phaseInfo = PHASE_CONFIG[phaseKey] ?? PHASE_CONFIG.init;

  return (
    <div
      className={cn("flex flex-col items-center gap-3", className)}
      data-tour="canvas"
    >
      {/* Phase banner */}
      <div
        className={cn(
          "flex w-full max-w-md items-center gap-3 rounded-md border px-3 py-1.5 font-mono text-xs",
          phaseInfo.bg,
          phaseInfo.border,
        )}
      >
        <span className={cn("font-bold tracking-wider", phaseInfo.color)}>
          {phaseInfo.label}
        </span>
        {isMaximizing !== undefined &&
          (phaseKey === "explore" ||
            phaseKey === "backtrack" ||
            phaseKey === "prune") && (
            <span className="text-text-muted">
              {isMaximizing ? "Maximizer (O)" : "Minimizer (X)"}
            </span>
          )}
        {score !== undefined &&
          (phaseKey === "terminal" || phaseKey === "backtrack") && (
            <span
              className={cn(
                "ml-auto font-bold",
                score > 0
                  ? "text-green-400"
                  : score < 0
                    ? "text-red-400"
                    : "text-zinc-400",
              )}
            >
              score: {score > 0 ? `+${score}` : score}
            </span>
          )}
      </div>

      {/* Exploration path breadcrumb */}
      {path && path.length > 0 && (
        <div className="flex max-w-md flex-wrap items-center gap-1 font-mono text-[10px] text-text-muted">
          <span className="text-zinc-500">root</span>
          {path.map((m, idx) => (
            <span key={idx} className="flex items-center gap-1">
              <span className="text-zinc-600">→</span>
              <span
                className={cn(
                  "rounded px-1 py-0.5",
                  m.player === "X"
                    ? "bg-cyan-950/50 text-cyan-400"
                    : "bg-amber-950/50 text-amber-400",
                )}
              >
                {m.player}@{m.pos}
              </span>
            </span>
          ))}
          <span className="ml-1 text-zinc-600">(depth {data.depth})</span>
        </div>
      )}

      <div className="flex items-start gap-6">
        {/* Board */}
        <div className="relative">
          <div className="grid grid-cols-3 gap-1 rounded-lg border border-border bg-bg-surface p-2">
            {board.map((cell, i) => {
              const isWinCell = winLine?.includes(i);
              const cellScore = evaluationScores?.[String(i)];
              const isBest = bestMove === i;
              const isPruned = pruned?.includes(String(i));
              const isExploring =
                phaseKey === "explore" &&
                path &&
                path.length > 0 &&
                path[path.length - 1]?.pos === i;

              return (
                <TicTacToeCell
                  key={i}
                  cell={cell}
                  index={i}
                  isWinCell={!!isWinCell}
                  isExploring={!!isExploring}
                  isBest={!!isBest}
                  isPruned={!!isPruned}
                  cellScore={cellScore}
                  reducedMotion={reducedMotion ?? false}
                />
              );
            })}
          </div>

          {winKey && WIN_LINE_COORDS[winKey] && (
            <svg className="pointer-events-none absolute inset-0 h-full w-full p-2">
              <motion.line
                {...WIN_LINE_COORDS[winKey]}
                stroke={theme.accentGreen}
                strokeWidth="3"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: reducedMotion ? 0 : 0.4 }}
              />
            </svg>
          )}
        </div>

        {/* Move evaluation cards */}
        {evaluationScores && Object.keys(evaluationScores).length > 0 && (
          <div className="flex min-w-[120px] flex-col gap-1">
            <span className="mb-0.5 font-mono text-[10px] text-text-muted">
              Evaluated moves:
            </span>
            {Object.entries(evaluationScores)
              .sort(([, a], [, b]) => (isMaximizing ? b - a : a - b))
              .map(([pos, sc]) => {
                const isBestCard =
                  bestMove !== undefined && String(bestMove) === pos;
                return (
                  <div
                    key={pos}
                    className={cn(
                      "flex items-center justify-between gap-3 rounded border px-2 py-1 font-mono text-[11px]",
                      isBestCard
                        ? "border-cyan-500/40 bg-cyan-950/30 text-cyan-300"
                        : "border-zinc-700/50 bg-zinc-900/50 text-text-muted",
                    )}
                  >
                    <span>cell {pos}</span>
                    <span
                      className={cn(
                        "font-bold",
                        sc > 0
                          ? "text-green-400"
                          : sc < 0
                            ? "text-red-400"
                            : "text-zinc-400",
                      )}
                    >
                      {sc > 0 ? `+${sc}` : sc}
                    </span>
                  </div>
                );
              })}
            {pruned && pruned.length > 0 && (
              <div className="flex items-center gap-1 rounded border border-red-900/30 bg-red-950/20 px-2 py-1 font-mono text-[10px] text-red-400/70">
                <span>✂</span>
                <span>cells {pruned.join(", ")} pruned</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Info bar */}
      <div className="flex items-center gap-4 font-mono text-[11px] text-text-muted">
        <span>
          Turn:{" "}
          <span
            className={cn(
              data.currentPlayer === "X" ? "text-cyan-400" : "text-amber-400",
            )}
          >
            {data.currentPlayer}
          </span>
        </span>
        <span>
          Depth: <span className="text-text-primary">{data.depth}</span>
        </span>
        <span>
          α:{" "}
          <span className="text-green-400">
            {data.alpha === -Infinity ? "-∞" : data.alpha}
          </span>
        </span>
        <span>
          β:{" "}
          <span className="text-red-400">
            {data.beta === Infinity ? "+∞" : data.beta}
          </span>
        </span>
        {data.winner && (
          <span className="font-bold text-amber-400">
            Winner: {data.winner}
          </span>
        )}
      </div>
    </div>
  );
}
