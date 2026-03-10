export type ComplexityColor = "green" | "amber" | "red" | "cyan";

/**
 * Maps a time complexity string to a color variant for badges.
 */
export function getComplexityColor(complexity: string): ComplexityColor {
  const c = complexity.toLowerCase();
  if (c.includes("1)") || c.includes("log n)")) return "green";
  if (c.includes("n)") || c.includes("n log n)")) return "cyan";
  if (c.includes("n²)") || c.includes("n^2)")) return "amber";
  return "red";
}
