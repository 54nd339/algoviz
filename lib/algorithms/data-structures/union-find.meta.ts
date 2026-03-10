import type { AlgorithmMeta } from "@/types";

export const unionFindMeta: AlgorithmMeta = {
  id: "union-find",
  name: "Union-Find (Disjoint Set)",
  category: "data-structures",
  description:
    "A data structure that tracks a set of elements partitioned into disjoint subsets. Supports near-O(1) union and find operations with path compression and union by rank. Used in Kruskal's MST and network connectivity.",
  timeComplexity: { best: "O(α(n))", average: "O(α(n))", worst: "O(α(n))" },
  spaceComplexity: "O(n)",
  pseudocode: `makeSet(n):
  parent = [0, 1, 2, ..., n-1]
  rank = [0, 0, ..., 0]

find(x):
  if parent[x] != x:
    parent[x] = find(parent[x])  // path compression
  return parent[x]

union(x, y):
  rootX = find(x)
  rootY = find(y)
  if rootX == rootY: return  // same set
  // union by rank
  if rank[rootX] < rank[rootY]:
    parent[rootX] = rootY
  else if rank[rootX] > rank[rootY]:
    parent[rootY] = rootX
  else:
    parent[rootY] = rootX
    rank[rootX]++`,
  presets: [
    {
      name: "Union & Find (8 elements)",
      generator: () => [
        { op: "make", args: [8] },
        { op: "union", args: [0, 1] },
        { op: "union", args: [2, 3] },
        { op: "union", args: [4, 5] },
        { op: "union", args: [0, 2] },
        { op: "find", args: [3] },
        { op: "union", args: [4, 6] },
        { op: "union", args: [0, 4] },
        { op: "find", args: [5] },
      ],
      expectedCase: "average" as const,
    },
    {
      name: "Path Compression Demo",
      generator: () => [
        { op: "make", args: [6] },
        { op: "union", args: [0, 1] },
        { op: "union", args: [1, 2] },
        { op: "union", args: [2, 3] },
        { op: "union", args: [3, 4] },
        { op: "union", args: [4, 5] },
        { op: "find", args: [5] },
      ],
      expectedCase: "average" as const,
    },
  ],
  misconceptions: [
    {
      myth: "Path compression makes all finds O(1) immediately.",
      reality:
        "Path compression flattens the tree for future queries. Combined with union by rank, the amortized complexity is O(α(n)), where α is the inverse Ackermann function — effectively constant but not literally O(1).",
    },
  ],
  relatedAlgorithms: ["bst"],
};
