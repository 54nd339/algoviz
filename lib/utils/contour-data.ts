/**
 * Convert a normalized value (0–1) to an RGB color for heatmap display.
 * Dark blue → cyan → yellow for low → high.
 */
export function valueToColor(norm: number): string {
  const r = Math.round(norm * 255);
  const g = Math.round(norm * 200 + 20);
  const b = Math.round((1 - norm) * 200 + 40);
  return `rgb(${r},${g},${b})`;
}

export interface HeatmapCell {
  x: number;
  y: number;
  w: number;
  h: number;
  value: number;
}

/**
 * Compute a 2D heatmap grid of cells for contour visualization.
 * Returns cells with pixel coordinates and normalized values (0–1).
 */
export function computeHeatmapCells(
  fn: (x: number, y: number) => number,
  domainX: [number, number],
  domainY: [number, number],
  innerWidth: number,
  innerHeight: number,
  resolution: number = 40,
): HeatmapCell[] {
  const [xMin, xMax] = domainX;
  const [yMin, yMax] = domainY;
  const dx = (xMax - xMin) / resolution;
  const dy = (yMax - yMin) / resolution;

  let minVal = Infinity;
  let maxVal = -Infinity;
  const raw: number[][] = [];

  for (let i = 0; i < resolution; i++) {
    raw[i] = [];
    for (let j = 0; j < resolution; j++) {
      const val = fn(
        xMin + i * dx + dx / 2,
        yMin + j * dy + dy / 2,
      );
      raw[i][j] = val;
      if (val < minVal) minVal = val;
      if (val > maxVal) maxVal = val;
    }
  }

  const range = maxVal - minVal || 1;
  const cells: HeatmapCell[] = [];
  const cellW = innerWidth / resolution + 1;
  const cellH = innerHeight / resolution + 1;

  for (let i = 0; i < resolution; i++) {
    for (let j = 0; j < resolution; j++) {
      const norm = (raw[i][j] - minVal) / range;
      const domainXVal = xMin + i * dx;
      const domainYVal = yMin + (j + 1) * dy;
      const pixelX = ((domainXVal - xMin) / (xMax - xMin)) * innerWidth;
      const pixelY =
        ((yMax - domainYVal) / (yMax - yMin)) * innerHeight;
      cells.push({
        x: pixelX,
        y: pixelY,
        w: cellW,
        h: cellH,
        value: norm,
      });
    }
  }

  return cells;
}
