/**
 * Isometric projection transforms for the pathfinding grid.
 * Isolated so projection parameters can be tuned without touching draw logic.
 */

import { PALETTE } from "@/lib/utils/theme-colors";

const PROJECTION_Y_OFFSET = 40;
const PROJECTION_SCALE_Y = 0.5;
const ROTATION_DEG = 45;
const WALL_EXTRUSION_HEIGHT = 4;

export function applyIsometricTransform(
  ctx: CanvasRenderingContext2D,
  gridWidth: number,
): void {
  ctx.save();
  ctx.translate(gridWidth / 2, PROJECTION_Y_OFFSET);
  ctx.scale(1, PROJECTION_SCALE_Y);
  ctx.rotate((ROTATION_DEG * Math.PI) / 180);
}

export function restoreIsometricTransform(ctx: CanvasRenderingContext2D): void {
  ctx.restore();
}

/**
 * Draws a small roof-like extrusion above wall cells in isometric view.
 */
export function drawIsometricWallExtrusion(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  cellSize: number,
): void {
  ctx.fillStyle = PALETTE.strokeMuted;
  ctx.fillRect(x + 0.5, y + 0.5 - WALL_EXTRUSION_HEIGHT, cellSize - 1, WALL_EXTRUSION_HEIGHT);
}
