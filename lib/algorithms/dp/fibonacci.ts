import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import type { FibStep, FibTreeNode } from "./types";

export const fibonacciMeta: AlgorithmMeta = {
  id: "fibonacci-dp",
  name: "Fibonacci (DP)",
  category: "dp",
  description:
    "Computes the nth Fibonacci number. Compare naive recursion (exponential, with duplicate sub-problems) against bottom-up dynamic programming (linear time, constant extra work per cell).",
  timeComplexity: { best: "O(n)", average: "O(n)", worst: "O(n)" },
  spaceComplexity: "O(n)",
  pseudocode: `function fib_dp(n):
  dp[0] = 0
  dp[1] = 1
  for i = 2 to n:
    dp[i] = dp[i-1] + dp[i-2]
  return dp[n]`,
  presets: [
    {
      name: "Small (n=7)",
      generator: () => ({ n: 7, mode: "dp" }),
      expectedCase: "average",
    },
    {
      name: "Medium (n=10)",
      generator: () => ({ n: 10, mode: "dp" }),
      expectedCase: "average",
    },
    {
      name: "Naive Tree (n=6)",
      generator: () => ({ n: 6, mode: "naive" }),
      expectedCase: "worst",
    },
    {
      name: "Naive Tree (n=8)",
      generator: () => ({ n: 8, mode: "naive" }),
      expectedCase: "worst",
    },
  ],
  misconceptions: [
    {
      myth: "Recursion is always the best way to compute Fibonacci.",
      reality:
        "Naive recursion is O(2^n) due to recomputing the same sub-problems. DP table-filling is O(n).",
    },
  ],
  relatedAlgorithms: ["coin-change-dp", "knapsack-dp"],
};

registerAlgorithm(fibonacciMeta);

function buildNaiveTree(n: number, seen: Set<number>): FibTreeNode {
  const duplicate = seen.has(n);
  seen.add(n);
  if (n <= 1) {
    return { value: n, children: [], duplicate, computed: true };
  }
  const left = buildNaiveTree(n - 1, seen);
  const right = buildNaiveTree(n - 2, seen);
  return { value: n, children: [left, right], duplicate, computed: true };
}

export function* fibonacciDP(input: {
  n: number;
  mode: "naive" | "dp";
}): AlgorithmGenerator<FibStep> {
  const { n, mode } = input;

  if (mode === "naive") {
    yield* fibonacciNaive(n);
  } else {
    yield* fibonacciTable(n);
  }
}

function* fibonacciTable(n: number): AlgorithmGenerator<FibStep> {
  const table: (number | null)[] = Array(n + 1).fill(null);

  yield {
    type: "init",
    data: {
      table: [...table],
      currentIndex: -1,
      computedIndices: [],
      mode: "dp" as const,
    },
    description: `Computing fib(${n}) using bottom-up DP`,
    codeLine: 1,
    variables: { n },
  };

  table[0] = 0;
  yield {
    type: "compute",
    data: {
      table: [...table],
      currentIndex: 0,
      computedIndices: [0],
      subproblemLabel: "dp[0] = 0",
      mode: "dp" as const,
    },
    description: "Base case: fib(0) = 0",
    codeLine: 2,
    variables: { i: 0, "dp[0]": 0 },
  };

  if (n >= 1) {
    table[1] = 1;
    yield {
      type: "compute",
      data: {
        table: [...table],
        currentIndex: 1,
        computedIndices: [0, 1],
        subproblemLabel: "dp[1] = 1",
        mode: "dp" as const,
      },
      description: "Base case: fib(1) = 1",
      codeLine: 3,
      variables: { i: 1, "dp[1]": 1 },
    };
  }

  const computed = [0, 1];
  for (let i = 2; i <= n; i++) {
    const prev1 = table[i - 1]!;
    const prev2 = table[i - 2]!;

    yield {
      type: "read-deps",
      data: {
        table: [...table],
        currentIndex: i,
        computedIndices: [...computed],
        dependencies: [i - 1, i - 2],
        subproblemLabel: `dp[${i}] = dp[${i - 1}] + dp[${i - 2}] = ${prev1} + ${prev2}`,
        mode: "dp" as const,
      },
      description: `Reading dp[${i - 1}]=${prev1} and dp[${i - 2}]=${prev2}`,
      codeLine: 5,
      variables: { i, "dp[i-1]": prev1, "dp[i-2]": prev2 },
    };

    table[i] = prev1 + prev2;
    computed.push(i);

    yield {
      type: "compute",
      data: {
        table: [...table],
        currentIndex: i,
        computedIndices: [...computed],
        dependencies: [i - 1, i - 2],
        subproblemLabel: `dp[${i}] = ${table[i]}`,
        mode: "dp" as const,
      },
      description: `fib(${i}) = ${table[i]}`,
      codeLine: 5,
      variables: { i, [`dp[${i}]`]: table[i] },
    };
  }

  yield {
    type: "done",
    data: {
      table: [...table],
      currentIndex: n,
      computedIndices: [...computed],
      subproblemLabel: `fib(${n}) = ${table[n]}`,
      mode: "dp" as const,
    },
    description: `Result: fib(${n}) = ${table[n]}`,
    variables: { result: table[n] },
  };
}

function* fibonacciNaive(n: number): AlgorithmGenerator<FibStep> {
  const seen = new Set<number>();
  const tree = buildNaiveTree(n, new Set());

  const table: (number | null)[] = Array(n + 1).fill(null);
  const computedIndices: number[] = [];
  const duplicateWork: number[] = [];

  yield {
    type: "init",
    data: {
      table: [...table],
      currentIndex: -1,
      computedIndices: [],
      recursionTree: tree,
      duplicateWork: [],
      mode: "naive" as const,
    },
    description: `Computing fib(${n}) using naive recursion -- watch for duplicate work`,
    codeLine: 1,
    variables: { n },
  };

  function* recurse(
    k: number,
    currentTree: FibTreeNode,
  ): Generator<
    {
      type: string;
      data: FibStep;
      description: string;
      codeLine?: number;
      variables?: Record<string, unknown>;
    },
    number,
    undefined
  > {
    if (seen.has(k)) {
      duplicateWork.push(k);
    }

    yield {
      type: seen.has(k) ? "duplicate-work" : "compute",
      data: {
        table: [...table],
        currentIndex: k,
        computedIndices: [...computedIndices],
        recursionTree: tree,
        duplicateWork: [...duplicateWork],
        mode: "naive" as const,
        subproblemLabel: seen.has(k)
          ? `fib(${k}) -- RECOMPUTING (already solved)`
          : `Computing fib(${k})`,
      },
      description: seen.has(k)
        ? `Duplicate work: recomputing fib(${k})`
        : `Computing fib(${k})`,
      variables: { k, duplicate: seen.has(k) },
    };

    if (k <= 1) {
      table[k] = k;
      if (!computedIndices.includes(k)) computedIndices.push(k);
      seen.add(k);
      return k;
    }

    const left: number = yield* recurse(k - 1, currentTree.children[0]);
    const right: number = yield* recurse(k - 2, currentTree.children[1]);
    const result = left + right;

    table[k] = result;
    if (!computedIndices.includes(k)) computedIndices.push(k);
    seen.add(k);

    yield {
      type: "compute",
      data: {
        table: [...table],
        currentIndex: k,
        computedIndices: [...computedIndices],
        recursionTree: tree,
        duplicateWork: [...duplicateWork],
        subproblemLabel: `fib(${k}) = fib(${k - 1}) + fib(${k - 2}) = ${left} + ${right} = ${result}`,
        mode: "naive" as const,
      },
      description: `fib(${k}) = ${result}`,
      variables: { k, result },
    };

    return result;
  }

  yield* recurse(n, tree) as unknown as AlgorithmGenerator<FibStep>;

  yield {
    type: "done",
    data: {
      table: [...table],
      currentIndex: n,
      computedIndices: [...computedIndices],
      recursionTree: tree,
      duplicateWork: [...duplicateWork],
      subproblemLabel: `fib(${n}) = ${table[n]} (${duplicateWork.length} duplicate computations)`,
      mode: "naive" as const,
    },
    description: `Result: fib(${n}) = ${table[n]} with ${duplicateWork.length} duplicate computations`,
    variables: { result: table[n], duplicates: duplicateWork.length },
  };
}
