/**
 * Ensures a number is odd (increments if even).
 * Used for maze generation where dimensions must be odd.
 */
export function ensureOdd(n: number): number {
  return n % 2 === 0 ? n + 1 : n;
}
