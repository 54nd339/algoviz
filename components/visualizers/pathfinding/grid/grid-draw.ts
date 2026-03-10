/**
 * Pure drawing logic for the pathfinding grid.
 * No React, no DOM—only canvas API and data transforms.
 */

import {
  cellKey,
  CellState,
  type PathStep,
  TerrainType,
} from "@/lib/algorithms/pathfinding";
import { PALETTE } from "@/lib/utils/theme-colors";
import type { AlgorithmStep } from "@/types";

import {
  applyIsometricTransform,
  drawIsometricWallExtrusion,
  restoreIsometricTransform,
} from "./grid-isometric";

export type Theme = ReturnType<
  typeof import("@/lib/utils/theme-colors").getThemeColors
>;

export function computeCellSize(
  canvasWidth: number,
  canvasHeight: number,
  rows: number,
  cols: number,
): number {
  if (cols <= 0 || rows <= 0) return 4;
  return Math.max(
    4,
    Math.min(
      Math.floor(canvasWidth / cols),
      Math.floor(canvasHeight / rows),
    ),
  );
}

export function computeGridDimensions(
  cellSize: number,
  rows: number,
  cols: number,
): { gridWidth: number; gridHeight: number } {
  return {
    gridWidth: cellSize * cols,
    gridHeight: cellSize * rows,
  };
}

/**
 * Maps client coordinates to grid cell indices [row, col].
 * Uses gridWidth/gridHeight for correct scaling (e.g. with device pixel ratio).
 * Returns null if the click is outside the grid.
 */
export function getCellFromMouse(
  clientX: number,
  clientY: number,
  canvas: HTMLCanvasElement,
  cellSize: number,
  rows: number,
  cols: number,
  gridWidth: number,
  gridHeight: number,
): [number, number] | null {
  const rect = canvas.getBoundingClientRect();
  const scaleX = gridWidth / rect.width;
  const scaleY = gridHeight / rect.height;
  const x = (clientX - rect.left) * scaleX;
  const y = (clientY - rect.top) * scaleY;
  const col = Math.floor(x / cellSize);
  const row = Math.floor(y / cellSize);
  if (row < 0 || row >= rows || col < 0 || col >= cols) return null;
  return [row, col];
}

function buildCellColors(theme: Theme) {
  return {
    empty: theme.bgElevated,
    wall: theme.textMuted,
    start: theme.accentGreen,
    end: theme.accentRed,
    visited: `${theme.accentCyan}33`,
    visitedForward: `${theme.accentCyan}33`,
    visitedBackward: `${PALETTE.accentA855}33`,
    frontier: theme.accentAmber,
    path: PALETTE.accentGreenLight,
    current: theme.accentCyan,
    grass: `${theme.accentGreen}26`,
    mud: `${theme.accentAmber}33`,
    water: `${theme.accentCyan}33`,
    gridLine: theme.borderSubtle,
    meetingPoint: PALETTE.accentPurpleLight,
  };
}

function resolveCellColor(
  r: number,
  c: number,
  grid: CellState[][],
  weights: Record<string, number>,
  startPos: [number, number],
  endPos: [number, number],
  data: PathStep | undefined,
  visitedSet: Set<string>,
  frontierSet: Set<string>,
  pathSet: Set<string>,
  visitedForwardSet: Set<string>,
  visitedBackwardSet: Set<string>,
  colors: ReturnType<typeof buildCellColors>,
): string {
  const key = cellKey(r, c);
  const cell = grid[r][c];
  let color = colors.empty;

  if (cell === CellState.Wall) {
    color = colors.wall;
  } else {
    const weight = weights[key];
    if (weight === TerrainType.Grass) color = colors.grass;
    else if (weight === TerrainType.Mud) color = colors.mud;
    else if (weight === TerrainType.Water) color = colors.water;

    if (visitedForwardSet.size > 0 && visitedForwardSet.has(key)) {
      color = colors.visitedForward;
    } else if (visitedBackwardSet.size > 0 && visitedBackwardSet.has(key)) {
      color = colors.visitedBackward;
    } else if (visitedSet.has(key)) {
      color = colors.visited;
    }
    if (frontierSet.has(key)) color = colors.frontier;
    if (pathSet.has(key)) color = colors.path;
  }

  if (r === startPos[0] && c === startPos[1]) color = colors.start;
  if (r === endPos[0] && c === endPos[1]) color = colors.end;
  if (data?.current && data.current[0] === r && data.current[1] === c) {
    color = colors.current;
  }
  if (
    data?.meetingPoint &&
    data.meetingPoint[0] === r &&
    data.meetingPoint[1] === c
  ) {
    color = colors.meetingPoint;
  }

  return color;
}

export interface DrawGridOptions {
  ctx: CanvasRenderingContext2D;
  grid: CellState[][];
  rows: number;
  cols: number;
  cellSize: number;
  gridWidth: number;
  gridHeight: number;
  weights: Record<string, number>;
  startPos: [number, number];
  endPos: [number, number];
  step: AlgorithmStep<PathStep> | null;
  isometric: boolean;
  theme: Theme;
}

export function drawGrid(options: DrawGridOptions): void {
  const {
    ctx,
    grid,
    rows,
    cols,
    cellSize,
    gridWidth,
    gridHeight,
    weights,
    startPos,
    endPos,
    step,
    isometric,
    theme,
  } = options;

  const colors = buildCellColors(theme);
  const data = step?.data;
  const visitedSet = new Set(data?.visited ?? []);
  const frontierSet = new Set(data?.frontier ?? []);
  const pathSet = new Set((data?.path ?? []).map(([r, c]) => cellKey(r, c)));
  const visitedForwardSet = new Set(data?.visitedForward ?? []);
  const visitedBackwardSet = new Set(data?.visitedBackward ?? []);

  if (isometric) {
    applyIsometricTransform(ctx, gridWidth);
  }

  ctx.fillStyle = theme.bgPrimary;
  ctx.fillRect(0, 0, gridWidth, gridHeight);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * cellSize;
      const y = r * cellSize;
      const cell = grid[r][c];

      const color = resolveCellColor(
        r,
        c,
        grid,
        weights,
        startPos,
        endPos,
        data,
        visitedSet,
        frontierSet,
        pathSet,
        visitedForwardSet,
        visitedBackwardSet,
        colors,
      );

      ctx.fillStyle = color;
      ctx.fillRect(x + 0.5, y + 0.5, cellSize - 1, cellSize - 1);

      if (isometric && cell === CellState.Wall) {
        drawIsometricWallExtrusion(ctx, x, y, cellSize);
      }
    }
  }

  ctx.strokeStyle = colors.gridLine;
  ctx.lineWidth = 0.5;
  for (let r = 0; r <= rows; r++) {
    ctx.beginPath();
    ctx.moveTo(0, r * cellSize);
    ctx.lineTo(gridWidth, r * cellSize);
    ctx.stroke();
  }
  for (let c = 0; c <= cols; c++) {
    ctx.beginPath();
    ctx.moveTo(c * cellSize, 0);
    ctx.lineTo(c * cellSize, gridHeight);
    ctx.stroke();
  }

  if (isometric) {
    restoreIsometricTransform(ctx);
  }
}
