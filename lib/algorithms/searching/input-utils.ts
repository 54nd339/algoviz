/**
 * Generates a sorted array of the given size for search algorithm input.
 * Values are spaced evenly in range 1..100.
 */
export function generateSortedArray(size: number): number[] {
  return Array.from(
    { length: size },
    (_, i) => (i + 1) * Math.floor(100 / size),
  );
}

/**
 * Type guard for search algorithm input: { array: number[]; target: number }.
 */
export function isSearchInput(
  input: unknown,
): input is { array: number[]; target: number } {
  return (
    input != null &&
    typeof input === "object" &&
    "array" in input &&
    Array.isArray((input as { array: unknown }).array) &&
    "target" in input &&
    typeof (input as { target: unknown }).target === "number"
  );
}
