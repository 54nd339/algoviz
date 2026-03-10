import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import type { DPStep } from "./types";

export const matrixChainMeta: AlgorithmMeta = {
  id: "matrix-chain-dp",
  name: "Matrix Chain Multiplication",
  category: "dp",
  description:
    "Determine the optimal parenthesization of a chain of matrices to minimize scalar multiplications. An interval DP problem filling an upper-triangular table.",
  timeComplexity: { best: "O(n³)", average: "O(n³)", worst: "O(n³)" },
  spaceComplexity: "O(n²)",
  pseudocode: `function matrixChain(dims):
  n = len(dims) - 1
  for len = 2 to n:
    for i = 1 to n - len + 1:
      j = i + len - 1
      dp[i][j] = Infinity
      for k = i to j - 1:
        cost = dp[i][k] + dp[k+1][j]
             + dims[i-1]*dims[k]*dims[j]
        if cost < dp[i][j]:
          dp[i][j] = cost
  return dp[1][n]`,
  presets: [
    {
      name: "4 Matrices (10×30×5×60)",
      generator: () => ({ dimensions: [10, 30, 5, 60] }),
      expectedCase: "average",
    },
    {
      name: "5 Matrices (40×20×30×10×30)",
      generator: () => ({ dimensions: [40, 20, 30, 10, 30] }),
      expectedCase: "average",
    },
    {
      name: "6 Matrices (30×35×15×5×10×20×25)",
      generator: () => ({ dimensions: [30, 35, 15, 5, 10, 20, 25] }),
      expectedCase: "worst",
    },
  ],
  misconceptions: [
    {
      myth: "Matrix multiplication order doesn't matter for performance.",
      reality:
        "While the result is the same, the number of scalar multiplications varies dramatically with parenthesization.",
    },
  ],
  relatedAlgorithms: ["knapsack-dp", "lcs-dp"],
};

registerAlgorithm(matrixChainMeta);

export function* matrixChain(input: {
  dimensions: number[];
}): AlgorithmGenerator<DPStep> {
  const { dimensions } = input;
  const n = dimensions.length - 1;

  const table: (number | null)[][] = Array.from({ length: n + 1 }, () =>
    Array(n + 1).fill(null),
  );
  const split: number[][] = Array.from({ length: n + 1 }, () =>
    Array(n + 1).fill(0),
  );
  const filledCells: [number, number][] = [];

  const headers = Array.from({ length: n }, (_, i) => `M${i + 1}`);
  const rowHeaders = ["", ...headers];
  const colHeaders = ["", ...headers];

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
    description: `Matrix Chain: ${n} matrices, dims=[${dimensions.join("×")}]`,
    codeLine: 1,
    variables: { n, dimensions },
  };

  for (let i = 1; i <= n; i++) {
    table[i][i] = 0;
    filledCells.push([i, i]);

    yield {
      type: "fill-cell",
      data: {
        table: table.map((r) => [...r]),
        currentCell: [i, i],
        dependencies: [],
        filledCells: [...filledCells],
        subproblemLabel: `dp[${i}][${i}] = 0 (single matrix)`,
        rowHeaders,
        colHeaders,
      },
      description: `Base case: dp[${i}][${i}] = 0`,
      codeLine: 2,
      variables: { i, "dp[i][i]": 0 },
    };
  }

  for (let len = 2; len <= n; len++) {
    for (let i = 1; i <= n - len + 1; i++) {
      const j = i + len - 1;
      table[i][j] = Infinity;

      for (let k = i; k < j; k++) {
        const cost =
          table[i][k]! +
          table[k + 1][j]! +
          dimensions[i - 1] * dimensions[k] * dimensions[j];
        const deps: [number, number][] = [
          [i, k],
          [k + 1, j],
        ];

        yield {
          type: "try-split",
          data: {
            table: table.map((r) => [...r]),
            currentCell: [i, j],
            dependencies: deps,
            filledCells: [...filledCells],
            subproblemLabel: `dp[${i}][${j}]: split k=${k} → dp[${i}][${k}] + dp[${k + 1}][${j}] + ${dimensions[i - 1]}×${dimensions[k]}×${dimensions[j]} = ${cost}`,
            rowHeaders,
            colHeaders,
          },
          description: `Try split k=${k}: cost = ${cost}`,
          codeLine: 8,
          variables: {
            i,
            j,
            k,
            cost,
            "dp[i][k]": table[i][k],
            "dp[k+1][j]": table[k + 1][j],
            mult: dimensions[i - 1] * dimensions[k] * dimensions[j],
          },
        };

        if (cost < table[i][j]!) {
          table[i][j] = cost;
          split[i][j] = k;
        }
      }

      filledCells.push([i, j]);

      yield {
        type: "fill-cell",
        data: {
          table: table.map((r) => [...r]),
          currentCell: [i, j],
          dependencies: [
            [i, split[i][j]],
            [split[i][j] + 1, j],
          ],
          filledCells: [...filledCells],
          subproblemLabel: `dp[${i}][${j}] = ${table[i][j]} (split at k=${split[i][j]})`,
          rowHeaders,
          colHeaders,
        },
        description: `dp[${i}][${j}] = ${table[i][j]} (optimal split at k=${split[i][j]})`,
        codeLine: 11,
        variables: { i, j, "dp[i][j]": table[i][j], bestSplit: split[i][j] },
      };
    }
  }

  function buildParens(i: number, j: number): string {
    if (i === j) return `M${i}`;
    const k = split[i][j];
    return `(${buildParens(i, k)} × ${buildParens(k + 1, j)})`;
  }

  const parens = n > 0 ? buildParens(1, n) : "empty";

  yield {
    type: "done",
    data: {
      table: table.map((r) => [...r]),
      currentCell: [1, n],
      dependencies: [],
      filledCells: [...filledCells],
      result: `${table[1][n]} multiplications`,
      subproblemLabel: `Optimal: ${table[1][n]} multiplications | ${parens}`,
      rowHeaders,
      colHeaders,
    },
    description: `Matrix Chain complete! ${table[1][n]} multiplications, parenthesization: ${parens}`,
    variables: { result: table[1][n], parenthesization: parens },
  };
}
