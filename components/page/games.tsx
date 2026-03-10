"use client";

import { VisualizerPageLayout } from "@/components/layout/visualizer-page-layout";
import { ChessBoard } from "@/components/visualizers/games/chess-board";
import { GamesControls } from "@/components/visualizers/games/controls";
import { HanoiTowers } from "@/components/visualizers/games/hanoi-towers";
import { LifeGrid } from "@/components/visualizers/games/life-grid";
import { SlidingPuzzle } from "@/components/visualizers/games/sliding-puzzle";
import { SudokuGrid } from "@/components/visualizers/games/sudoku-grid";
import { TicTacToe } from "@/components/visualizers/games/tic-tac-toe";
import {
  getGameType,
  type HanoiStep,
  type KnightStep,
  type LifeStep,
  type MinimaxStep,
  type PuzzleStep,
  type QueenStep,
  type SudokuStep,
} from "@/lib/algorithms/games";
import { GAMES_GENERATORS } from "@/lib/algorithms/games";
import { useAlgoFromUrl, useVisualizer } from "@/hooks";
import type { AlgorithmStep } from "@/types";

import "@/lib/algorithms/games";

const CANVAS_CONTAINER =
  "flex-1 flex items-center justify-center overflow-auto rounded-lg border border-border bg-bg-primary/50 p-4";
const DOT_GRID = {
  backgroundImage:
    "radial-gradient(circle, var(--border) 1px, transparent 1px)",
  backgroundSize: "16px 16px",
};

function GameCanvas({ step }: { step: AlgorithmStep | null }) {
  if (!step) {
    return (
      <div className={CANVAS_CONTAINER} style={DOT_GRID}>
        <p className="font-mono text-xs text-text-muted">
          Select a game algorithm and press play
        </p>
      </div>
    );
  }

  const algorithmType = getGameType(step);

  return (
    <div className={CANVAS_CONTAINER} style={DOT_GRID}>
      {algorithmType === "minimax" && (
        <TicTacToe step={step as AlgorithmStep<MinimaxStep>} />
      )}
      {algorithmType === "hanoi" && (
        <HanoiTowers step={step as AlgorithmStep<HanoiStep>} />
      )}
      {algorithmType === "sudoku" && (
        <SudokuGrid step={step as AlgorithmStep<SudokuStep>} />
      )}
      {algorithmType === "life" && (
        <LifeGrid
          step={step as AlgorithmStep<LifeStep>}
          className="h-full w-full"
        />
      )}
      {algorithmType === "knight" && (
        <ChessBoard step={step as AlgorithmStep<KnightStep>} mode="knight" />
      )}
      {algorithmType === "queens" && (
        <ChessBoard step={step as AlgorithmStep<QueenStep>} mode="queens" />
      )}
      {algorithmType === "puzzle" && (
        <SlidingPuzzle step={step as AlgorithmStep<PuzzleStep>} />
      )}
    </div>
  );
}

export default function GamesClient() {
  const { currentStep } = useVisualizer();
  useAlgoFromUrl(
    "games",
    GAMES_GENERATORS as Record<
      string,
      (input: unknown) => Generator<import("@/types").AlgorithmStep, void, undefined>
    >,
  );

  return (
    <VisualizerPageLayout
      controls={<GamesControls />}
      canvas={<GameCanvas step={currentStep} />}
      showCallStack
    />
  );
}
