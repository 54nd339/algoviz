import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import type { DPStep } from "./types";

export const editDistanceMeta: AlgorithmMeta = {
  id: "edit-distance-dp",
  name: "Edit Distance",
  category: "dp",
  description:
    "Computes the minimum number of single-character operations (insert, delete, replace) to transform one string into another. Also known as Levenshtein distance.",
  timeComplexity: { best: "O(mn)", average: "O(mn)", worst: "O(mn)" },
  spaceComplexity: "O(mn)",
  pseudocode: `function editDistance(s1, s2):
  for i = 0 to m:
    for j = 0 to n:
      if i == 0: dp[i][j] = j
      else if j == 0: dp[i][j] = i
      else if s1[i-1] == s2[j-1]:
        dp[i][j] = dp[i-1][j-1]
      else:
        dp[i][j] = 1 + min(
          dp[i-1][j],     // delete
          dp[i][j-1],     // insert
          dp[i-1][j-1]    // replace
        )
  return dp[m][n]`,
  presets: [
    {
      name: '"kitten" → "sitting"',
      generator: () => ({ str1: "kitten", str2: "sitting" }),
      expectedCase: "average",
    },
    {
      name: '"sunday" → "saturday"',
      generator: () => ({ str1: "sunday", str2: "saturday" }),
      expectedCase: "average",
    },
    {
      name: "Same strings",
      generator: () => ({ str1: "hello", str2: "hello" }),
      expectedCase: "best",
    },
  ],
  misconceptions: [
    {
      myth: "Edit distance only counts substitutions.",
      reality:
        "Levenshtein distance counts insertions, deletions, and substitutions, each costing 1.",
    },
  ],
  relatedAlgorithms: ["lcs-dp"],
};

registerAlgorithm(editDistanceMeta);

export function* editDistance(input: {
  str1: string;
  str2: string;
}): AlgorithmGenerator<DPStep> {
  const { str1, str2 } = input;
  const m = str1.length;
  const n = str2.length;

  const table: (number | null)[][] = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(null),
  );
  const filledCells: [number, number][] = [];

  const rowHeaders = ["∅", ...str1.split("")];
  const colHeaders = ["∅", ...str2.split("")];

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
    description: `Edit Distance: "${str1}" → "${str2}"`,
    codeLine: 1,
    variables: { m, n, str1, str2 },
  };

  for (let i = 0; i <= m; i++) {
    for (let j = 0; j <= n; j++) {
      if (i === 0) {
        table[i][j] = j;
        filledCells.push([i, j]);

        yield {
          type: "fill-cell",
          data: {
            table: table.map((r) => [...r]),
            currentCell: [i, j],
            dependencies: j > 0 ? [[i, j - 1] as [number, number]] : [],
            filledCells: [...filledCells],
            subproblemLabel: `dp[0][${j}] = ${j} (insert ${j} chars)`,
            operation: "insert",
            rowHeaders,
            colHeaders,
          },
          description: `Base case: dp[0][${j}] = ${j} (${j} insertions)`,
          codeLine: 4,
          variables: { i, j, "dp[i][j]": j },
        };
      } else if (j === 0) {
        table[i][j] = i;
        filledCells.push([i, j]);

        yield {
          type: "fill-cell",
          data: {
            table: table.map((r) => [...r]),
            currentCell: [i, j],
            dependencies: i > 0 ? [[i - 1, j] as [number, number]] : [],
            filledCells: [...filledCells],
            subproblemLabel: `dp[${i}][0] = ${i} (delete ${i} chars)`,
            operation: "delete",
            rowHeaders,
            colHeaders,
          },
          description: `Base case: dp[${i}][0] = ${i} (${i} deletions)`,
          codeLine: 5,
          variables: { i, j, "dp[i][j]": i },
        };
      } else if (str1[i - 1] === str2[j - 1]) {
        const deps: [number, number][] = [[i - 1, j - 1]];
        table[i][j] = table[i - 1][j - 1]!;
        filledCells.push([i, j]);

        yield {
          type: "fill-cell",
          data: {
            table: table.map((r) => [...r]),
            currentCell: [i, j],
            dependencies: deps,
            filledCells: [...filledCells],
            subproblemLabel: `"${str1[i - 1]}" == "${str2[j - 1]}" → dp[${i}][${j}] = dp[${i - 1}][${j - 1}] = ${table[i][j]}`,
            operation: "match",
            rowHeaders,
            colHeaders,
          },
          description: `Match "${str1[i - 1]}", no cost: dp[${i}][${j}] = ${table[i][j]}`,
          codeLine: 7,
          variables: {
            i,
            j,
            char1: str1[i - 1],
            char2: str2[j - 1],
            "dp[i][j]": table[i][j],
          },
        };
      } else {
        const del = table[i - 1][j]!;
        const ins = table[i][j - 1]!;
        const rep = table[i - 1][j - 1]!;
        const minVal = Math.min(del, ins, rep);
        const deps: [number, number][] = [
          [i - 1, j],
          [i, j - 1],
          [i - 1, j - 1],
        ];

        let op: "delete" | "insert" | "replace";
        if (minVal === rep) op = "replace";
        else if (minVal === del) op = "delete";
        else op = "insert";

        yield {
          type: "operation",
          data: {
            table: table.map((r) => [...r]),
            currentCell: [i, j],
            dependencies: deps,
            filledCells: [...filledCells],
            subproblemLabel: `"${str1[i - 1]}" ≠ "${str2[j - 1]}" → 1 + min(del=${del}, ins=${ins}, rep=${rep}) = ${1 + minVal}`,
            operation: op,
            rowHeaders,
            colHeaders,
          },
          description: `Mismatch: best is ${op} (cost ${1 + minVal})`,
          codeLine: 9,
          variables: {
            i,
            j,
            delete: del,
            insert: ins,
            replace: rep,
            operation: op,
          },
        };

        table[i][j] = 1 + minVal;
        filledCells.push([i, j]);

        yield {
          type: "fill-cell",
          data: {
            table: table.map((r) => [...r]),
            currentCell: [i, j],
            dependencies: deps,
            filledCells: [...filledCells],
            subproblemLabel: `dp[${i}][${j}] = ${table[i][j]} (${op})`,
            operation: op,
            rowHeaders,
            colHeaders,
          },
          description: `dp[${i}][${j}] = ${table[i][j]} via ${op}`,
          codeLine: 10,
          variables: { i, j, "dp[i][j]": table[i][j], operation: op },
        };
      }
    }
  }

  // Backtrack to find the sequence of operations
  const backtrackPath: [number, number][] = [];
  let bi = m;
  let bj = n;
  while (bi > 0 || bj > 0) {
    backtrackPath.push([bi, bj]);
    if (bi > 0 && bj > 0 && str1[bi - 1] === str2[bj - 1]) {
      bi--;
      bj--;
    } else if (
      bi > 0 &&
      bj > 0 &&
      table[bi][bj] === table[bi - 1][bj - 1]! + 1
    ) {
      bi--;
      bj--;
    } else if (bj > 0 && table[bi][bj] === table[bi][bj - 1]! + 1) {
      bj--;
    } else {
      bi--;
    }
  }
  backtrackPath.push([0, 0]);
  backtrackPath.reverse();

  yield {
    type: "backtrack",
    data: {
      table: table.map((r) => [...r]),
      currentCell: [m, n],
      dependencies: [],
      filledCells: [...filledCells],
      backtrackPath,
      result: table[m][n]!,
      subproblemLabel: `Edit distance = ${table[m][n]} | Transformation path traced`,
      rowHeaders,
      colHeaders,
    },
    description: `Backtracking transformation path`,
    variables: { distance: table[m][n] },
  };

  yield {
    type: "done",
    data: {
      table: table.map((r) => [...r]),
      currentCell: [m, n],
      dependencies: [],
      filledCells: [...filledCells],
      backtrackPath,
      result: table[m][n]!,
      subproblemLabel: `Edit Distance = ${table[m][n]}`,
      rowHeaders,
      colHeaders,
    },
    description: `Edit Distance complete! "${str1}" → "${str2}" requires ${table[m][n]} operations`,
    variables: { distance: table[m][n] },
  };
}
