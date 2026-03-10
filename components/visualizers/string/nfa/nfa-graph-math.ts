/**
 * Pure math for NFA graph arrow paths and self-loops.
 * No React or DOM dependencies—safe to use in workers or SSR.
 */

/**
 * Line segment from circle edge to circle edge, avoiding overlap with node circles.
 */
export function getArrowPath(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  radius: number,
): string {
  const dx = toX - fromX;
  const dy = toY - fromY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist === 0) return "";

  const nx = dx / dist;
  const ny = dy / dist;

  const sx = fromX + nx * radius;
  const sy = fromY + ny * radius;
  const ex = toX - nx * (radius + 6);
  const ey = toY - ny * (radius + 6);

  return `M ${sx} ${sy} L ${ex} ${ey}`;
}

/**
 * Quadratic bezier arc for self-loops so the edge doesn't overlap the node.
 * Uses fixed loop radius for consistent visual weight.
 */
export function getSelfLoopPath(x: number, y: number, radius: number): string {
  const startAngle = -Math.PI / 3;
  const endAngle = (-2 * Math.PI) / 3;
  const loopRadius = 20;

  const sx = x + Math.cos(startAngle) * radius;
  const sy = y + Math.sin(startAngle) * radius;
  const ex = x + Math.cos(endAngle) * radius;
  const ey = y + Math.sin(endAngle) * radius;

  const cpx = x;
  const cpy = y - radius - loopRadius;

  return `M ${sx} ${sy} Q ${cpx} ${cpy} ${ex} ${ey}`;
}
