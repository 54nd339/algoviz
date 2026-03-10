import type { AlgorithmMeta } from "@/types";

export const heapMeta: AlgorithmMeta = {
  id: "heap",
  name: "Binary Heap",
  category: "data-structures",
  description:
    "A complete binary tree stored in an array where each parent is smaller (min-heap) or larger (max-heap) than its children. Supports O(log n) insert and extract operations.",
  timeComplexity: { best: "O(1)", average: "O(log n)", worst: "O(log n)" },
  spaceComplexity: "O(n)",
  pseudocode: `insert(value):
  array.append(value)
  bubbleUp(array.length - 1)

bubbleUp(i):
  while i > 0:
    parent = (i - 1) / 2
    if array[parent] > array[i]:  // min-heap
      swap(array[parent], array[i])
      i = parent
    else: break

extractMin():
  min = array[0]
  array[0] = array.pop()
  bubbleDown(0)
  return min

bubbleDown(i):
  while 2*i + 1 < array.length:
    smallest = i
    left = 2*i + 1; right = 2*i + 2
    if left < n and array[left] < array[smallest]:
      smallest = left
    if right < n and array[right] < array[smallest]:
      smallest = right
    if smallest == i: break
    swap(array[i], array[smallest])
    i = smallest`,
  presets: [
    {
      name: "Min-Heap Insert & Extract",
      generator: () => [
        { op: "insert", args: [40] },
        { op: "insert", args: [20] },
        { op: "insert", args: [30] },
        { op: "insert", args: [10] },
        { op: "insert", args: [50] },
        { op: "insert", args: [5] },
        { op: "extract", args: [] },
        { op: "extract", args: [] },
      ],
      expectedCase: "average" as const,
    },
    {
      name: "Build Heap (Sorted Input)",
      generator: () => [
        { op: "insert", args: [1] },
        { op: "insert", args: [2] },
        { op: "insert", args: [3] },
        { op: "insert", args: [4] },
        { op: "insert", args: [5] },
        { op: "insert", args: [6] },
        { op: "insert", args: [7] },
      ],
      expectedCase: "best" as const,
    },
  ],
  misconceptions: [
    {
      myth: "A heap is always a sorted array.",
      reality:
        "A heap only guarantees the heap property (parent ≤ children for min-heap). Siblings have no ordering relationship. Only the root is guaranteed to be the minimum.",
    },
  ],
  relatedAlgorithms: ["bst", "avl"],
};
