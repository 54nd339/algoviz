"use client";

import { VisualizerPageLayout } from "@/components/layout/visualizer-page-layout";
import { GridCanvas } from "@/components/visualizers/pathfinding/grid-canvas";
import { GridControls } from "@/components/visualizers/pathfinding/grid-controls";
import type { PathStep } from "@/lib/algorithms/pathfinding";
import { PATHFINDING_GENERATORS } from "@/lib/algorithms/pathfinding";
import { useAlgoFromUrl, usePathfindingGrid, useVisualizer } from "@/hooks";
import type { AlgorithmStep } from "@/types";

import "@/lib/algorithms/pathfinding";

export default function PathfindingClient() {
  const { currentStep, algorithmMeta, configure, reset } = useVisualizer();
  useAlgoFromUrl(
    "pathfinding",
    PATHFINDING_GENERATORS as Record<
      string,
      (input: unknown) => Generator<import("@/types").AlgorithmStep, void, undefined>
    >,
  );
  const pathStep = currentStep as AlgorithmStep<PathStep> | null;

  const {
    gridSize,
    grid,
    startPos,
    endPos,
    weights,
    editorMode,
    setEditorMode,
    allowDiagonal,
    heuristic,
    isometric,
    setIsometric,
    handleCellInteraction,
    handleGridSizeChange,
    handleGenerateMaze,
    handleClearWalls,
    handleClearPath,
    handleResetGrid,
    handleAllowDiagonalChange,
    handleHeuristicChange,
    handleBeforePlay,
  } = usePathfindingGrid(configure, reset, algorithmMeta);

  return (
    <VisualizerPageLayout
      controls={
        <GridControls
          gridSize={gridSize}
          grid={grid}
          startPos={startPos}
          endPos={endPos}
          weights={weights}
          onGridSizeChange={handleGridSizeChange}
          editorMode={editorMode}
          onEditorModeChange={setEditorMode}
          allowDiagonal={allowDiagonal}
          onAllowDiagonalChange={handleAllowDiagonalChange}
          heuristic={heuristic}
          onHeuristicChange={handleHeuristicChange}
          isometric={isometric}
          onIsometricChange={setIsometric}
          onGenerateMaze={handleGenerateMaze}
          onClearWalls={handleClearWalls}
          onClearPath={handleClearPath}
          onResetGrid={handleResetGrid}
        />
      }
      canvas={
        <div
          className="flex-1 overflow-hidden rounded-lg border border-border bg-bg-primary/50"
          style={{
            backgroundImage:
              "radial-gradient(circle, var(--border) 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        >
          <GridCanvas
            step={pathStep}
            grid={grid}
            startPos={startPos}
            endPos={endPos}
            weights={weights}
            editorMode={editorMode}
            isometric={isometric}
            onCellInteraction={handleCellInteraction}
            className="h-full w-full"
          />
        </div>
      }
      onBeforePlay={handleBeforePlay}
    />
  );
}
