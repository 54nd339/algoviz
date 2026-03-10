import type { AlgorithmMeta } from "@/types";

/**
 * Returns the algorithm to display for the current day based on epoch day index.
 * Pure function for testability; pass algorithms and optional epoch ms for deterministic results.
 */
export function getAlgorithmOfTheDay(
  algorithms: AlgorithmMeta[],
  nowMs = Date.now()
): AlgorithmMeta | null {
  if (algorithms.length === 0) return null;
  const dayIndex = Math.floor(nowMs / 86_400_000) % algorithms.length;
  return algorithms[dayIndex];
}
