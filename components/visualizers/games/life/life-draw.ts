/**
 * Pure drawing helpers for the Game of Life grid.
 * No React, no hooks - safe to call from useEffect/useCallback.
 */

import { getThemeColors, PALETTE } from "@/lib/utils/theme-colors";

export interface DrawLifeGridOptions {
  grid: boolean[][];
  births?: [number, number][];
  deaths?: [number, number][];
  isEditable: boolean;
  canvasWidth: number;
  canvasHeight: number;
}

/**
 * Draws the full Game of Life grid on the given context.
 * Handles background, grid lines, cell colors (alive/birth/death), and edit overlay.
 */
export function drawLifeGrid(
  ctx: CanvasRenderingContext2D,
  options: DrawLifeGridOptions,
): void {
  const {
    grid,
    births = [],
    deaths = [],
    isEditable,
    canvasWidth,
    canvasHeight,
  } = options;

  const r = grid.length;
  const c = grid[0]?.length ?? 0;
  if (r === 0 || c === 0) return;

  const cellSize = Math.max(
    1,
    Math.floor(Math.min(canvasWidth / c, canvasHeight / r)),
  );
  const totalW = c * cellSize;
  const totalH = r * cellSize;
  const offsetX = Math.floor((canvasWidth - totalW) / 2);
  const offsetY = Math.floor((canvasHeight - totalH) / 2);

  const theme = getThemeColors();
  const birthSet = new Set(births.map(([br, bc]) => `${br},${bc}`));
  const deathSet = new Set(deaths.map(([dr, dc]) => `${dr},${dc}`));

  // Background
  ctx.fillStyle = theme.bgPrimary;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Grid lines - centered layout requires explicit stroke coords
  ctx.strokeStyle = theme.bgElevated;
  ctx.lineWidth = 0.5;
  for (let row = 0; row <= r; row++) {
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY + row * cellSize);
    ctx.lineTo(offsetX + totalW, offsetY + row * cellSize);
    ctx.stroke();
  }
  for (let col = 0; col <= c; col++) {
    ctx.beginPath();
    ctx.moveTo(offsetX + col * cellSize, offsetY);
    ctx.lineTo(offsetX + col * cellSize, offsetY + totalH);
    ctx.stroke();
  }

  // Cells
  for (let row = 0; row < r; row++) {
    for (let col = 0; col < c; col++) {
      const key = `${row},${col}`;
      const x = offsetX + col * cellSize;
      const y = offsetY + row * cellSize;

      if (grid[row][col]) {
        if (!isEditable && birthSet.has(key)) {
          ctx.fillStyle = PALETTE.accentCyanLight;
        } else {
          ctx.fillStyle = PALETTE.accentGreenLight;
        }
        ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
      } else if (!isEditable && deathSet.has(key)) {
        ctx.fillStyle = "rgba(248, 113, 113, 0.4)";
        ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
      }
    }
  }

  // Edit-mode overlay for visual feedback
  if (isEditable) {
    ctx.fillStyle = "rgba(34, 211, 238, 0.08)";
    ctx.fillRect(offsetX, offsetY, totalW, totalH);
  }
}

/**
 * Maps client coordinates to grid cell indices.
 * Returns [row, col] if inside grid, null otherwise.
 */
export function getCellFromMouse(
  clientX: number,
  clientY: number,
  canvas: HTMLCanvasElement,
  rows: number,
  cols: number,
): [number, number] | null {
  if (rows === 0 || cols === 0) return null;

  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const mx = (clientX - rect.left) * scaleX;
  const my = (clientY - rect.top) * scaleY;

  const cellSize = Math.max(
    1,
    Math.floor(Math.min(canvas.width / cols, canvas.height / rows)),
  );
  const totalW = cols * cellSize;
  const totalH = rows * cellSize;
  const offsetX = Math.floor((canvas.width - totalW) / 2);
  const offsetY = Math.floor((canvas.height - totalH) / 2);

  const col = Math.floor((mx - offsetX) / cellSize);
  const row = Math.floor((my - offsetY) / cellSize);

  if (row >= 0 && row < rows && col >= 0 && col < cols) {
    return [row, col];
  }
  return null;
}
