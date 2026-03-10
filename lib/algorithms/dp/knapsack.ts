import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import type { DPStep } from "./types";

export const knapsackMeta: AlgorithmMeta = {
  id: "knapsack-dp",
  name: "0/1 Knapsack",
  category: "dp",
  description:
    "Given items with weights and values, determine the maximum value that can be carried in a knapsack of fixed capacity. Each item can be taken or left (0/1 choice).",
  timeComplexity: { best: "O(nW)", average: "O(nW)", worst: "O(nW)" },
  spaceComplexity: "O(nW)",
  pseudocode: `function knapsack(weights, values, W):
  for i = 0 to n:
    for w = 0 to W:
      if i == 0 or w == 0:
        dp[i][w] = 0
      else if weights[i-1] <= w:
        dp[i][w] = max(
          values[i-1] + dp[i-1][w - weights[i-1]],
          dp[i-1][w]
        )
      else:
        dp[i][w] = dp[i-1][w]
  return dp[n][W]`,
  presets: [
    {
      name: "Classic (4 items, cap=7)",
      generator: () => ({
        weights: [1, 3, 4, 5],
        values: [1, 4, 5, 7],
        capacity: 7,
      }),
      expectedCase: "average",
    },
    {
      name: "All Fit (cap=15)",
      generator: () => ({
        weights: [2, 3, 4, 5],
        values: [3, 4, 5, 6],
        capacity: 15,
      }),
      expectedCase: "best",
    },
    {
      name: "Tight (cap=5)",
      generator: () => ({
        weights: [2, 3, 4, 5],
        values: [3, 4, 5, 6],
        capacity: 5,
      }),
      expectedCase: "average",
    },
  ],
  misconceptions: [
    {
      myth: "Knapsack can be solved greedily by value/weight ratio.",
      reality:
        "The greedy approach works for the fractional knapsack but not 0/1 knapsack where items cannot be split.",
    },
  ],
  relatedAlgorithms: ["coin-change-dp", "fibonacci-dp"],
};

registerAlgorithm(knapsackMeta);

export function* knapsack(input: {
  weights: number[];
  values: number[];
  capacity: number;
}): AlgorithmGenerator<DPStep> {
  const { weights, values, capacity } = input;
  const n = weights.length;
  const W = capacity;

  const table: (number | null)[][] = Array.from({ length: n + 1 }, () =>
    Array(W + 1).fill(null),
  );
  const filledCells: [number, number][] = [];

  const rowHeaders = [
    "0",
    ...weights.map((w, i) => `Item ${i + 1} (w=${w}, v=${values[i]})`),
  ];
  const colHeaders = Array.from({ length: W + 1 }, (_, i) => `${i}`);

  yield {
    type: "init",
    data: {
      table: table.map((r) => [...r]),
      currentCell: [0, 0],
      dependencies: [],
      filledCells: [],
      rowHeaders,
      colHeaders,
    },
    description: `0/1 Knapsack: ${n} items, capacity=${W}`,
    codeLine: 1,
    variables: { n, W },
  };

  for (let i = 0; i <= n; i++) {
    for (let w = 0; w <= W; w++) {
      if (i === 0 || w === 0) {
        table[i][w] = 0;
        filledCells.push([i, w]);

        yield {
          type: "fill-cell",
          data: {
            table: table.map((r) => [...r]),
            currentCell: [i, w],
            dependencies: [],
            filledCells: [...filledCells],
            subproblemLabel: `dp[${i}][${w}] = 0 (base case)`,
            rowHeaders,
            colHeaders,
          },
          description: `Base case: dp[${i}][${w}] = 0`,
          codeLine: 5,
          variables: { i, w, "dp[i][w]": 0 },
        };
      } else if (weights[i - 1] <= w) {
        const include = values[i - 1] + table[i - 1][w - weights[i - 1]]!;
        const exclude = table[i - 1][w]!;
        const deps: [number, number][] = [
          [i - 1, w - weights[i - 1]],
          [i - 1, w],
        ];

        yield {
          type: "compare",
          data: {
            table: table.map((r) => [...r]),
            currentCell: [i, w],
            dependencies: deps,
            filledCells: [...filledCells],
            subproblemLabel: `dp[${i}][${w}] = max(${values[i - 1]} + dp[${i - 1}][${w - weights[i - 1]}], dp[${i - 1}][${w}]) = max(${include}, ${exclude})`,
            operation: include >= exclude ? "include" : "exclude",
            rowHeaders,
            colHeaders,
          },
          description: `Comparing include(${include}) vs exclude(${exclude}) for item ${i}`,
          codeLine: 7,
          variables: {
            i,
            w,
            include,
            exclude,
            weight: weights[i - 1],
            value: values[i - 1],
          },
        };

        table[i][w] = Math.max(include, exclude);
        filledCells.push([i, w]);

        yield {
          type: "fill-cell",
          data: {
            table: table.map((r) => [...r]),
            currentCell: [i, w],
            dependencies: deps,
            filledCells: [...filledCells],
            subproblemLabel: `dp[${i}][${w}] = ${table[i][w]}`,
            operation: include >= exclude ? "include" : "exclude",
            rowHeaders,
            colHeaders,
          },
          description: `dp[${i}][${w}] = ${table[i][w]} (${include >= exclude ? "include" : "exclude"} item ${i})`,
          codeLine: 8,
          variables: { i, w, "dp[i][w]": table[i][w] },
        };
      } else {
        const deps: [number, number][] = [[i - 1, w]];

        table[i][w] = table[i - 1][w]!;
        filledCells.push([i, w]);

        yield {
          type: "fill-cell",
          data: {
            table: table.map((r) => [...r]),
            currentCell: [i, w],
            dependencies: deps,
            filledCells: [...filledCells],
            subproblemLabel: `dp[${i}][${w}] = dp[${i - 1}][${w}] = ${table[i][w]} (item ${i} too heavy)`,
            operation: "exclude",
            rowHeaders,
            colHeaders,
          },
          description: `Item ${i} too heavy (w=${weights[i - 1]} > ${w}), dp[${i}][${w}] = ${table[i][w]}`,
          codeLine: 11,
          variables: { i, w, "dp[i][w]": table[i][w] },
        };
      }
    }
  }

  // Backtrack to find selected items
  const backtrackPath: [number, number][] = [];
  let wi = W;
  for (let i = n; i > 0; i--) {
    if (table[i][wi] !== table[i - 1][wi]) {
      backtrackPath.push([i, wi]);
      wi -= weights[i - 1];
    }
  }
  backtrackPath.push([0, wi]);
  backtrackPath.reverse();

  yield {
    type: "backtrack",
    data: {
      table: table.map((r) => [...r]),
      currentCell: [n, W],
      dependencies: [],
      filledCells: [...filledCells],
      backtrackPath,
      result: table[n][W]!,
      subproblemLabel: `Optimal value = ${table[n][W]} | Selected items traced`,
      rowHeaders,
      colHeaders,
    },
    description: `Backtracking to find selected items`,
    variables: {
      result: table[n][W],
      selectedItems: backtrackPath.filter(([r]) => r > 0).map(([r]) => r),
    },
  };

  yield {
    type: "done",
    data: {
      table: table.map((r) => [...r]),
      currentCell: [n, W],
      dependencies: [],
      filledCells: [...filledCells],
      backtrackPath,
      result: table[n][W]!,
      subproblemLabel: `Maximum value = ${table[n][W]}`,
      rowHeaders,
      colHeaders,
    },
    description: `Knapsack complete! Maximum value = ${table[n][W]}`,
    variables: { result: table[n][W] },
  };
}
