import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import type { DPStep } from "./types";

export const lcsMeta: AlgorithmMeta = {
  id: "lcs-dp",
  name: "Longest Common Subsequence",
  category: "dp",
  description:
    "Finds the longest subsequence common to two strings. Characters need not be contiguous but must appear in the same relative order in both strings.",
  timeComplexity: { best: "O(mn)", average: "O(mn)", worst: "O(mn)" },
  spaceComplexity: "O(mn)",
  pseudocode: `function lcs(X, Y):
  for i = 0 to m:
    for j = 0 to n:
      if i == 0 or j == 0:
        dp[i][j] = 0
      else if X[i-1] == Y[j-1]:
        dp[i][j] = dp[i-1][j-1] + 1
      else:
        dp[i][j] = max(dp[i-1][j], dp[i][j-1])
  backtrack to find LCS string
  return dp[m][n]`,
  presets: [
    {
      name: '"ABCBDAB" vs "BDCAB"',
      generator: () => ({ str1: "ABCBDAB", str2: "BDCAB" }),
      expectedCase: "average",
    },
    {
      name: '"AGGTAB" vs "GXTXAYB"',
      generator: () => ({ str1: "AGGTAB", str2: "GXTXAYB" }),
      expectedCase: "average",
    },
    {
      name: "Identical",
      generator: () => ({ str1: "ABCD", str2: "ABCD" }),
      expectedCase: "best",
    },
  ],
  misconceptions: [
    {
      myth: "LCS is the same as longest common substring.",
      reality:
        "Subsequence characters need not be contiguous, while substring characters must be consecutive.",
    },
  ],
  relatedAlgorithms: ["edit-distance-dp"],
};

registerAlgorithm(lcsMeta);

export function* lcs(input: {
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
    description: `LCS of "${str1}" and "${str2}"`,
    codeLine: 1,
    variables: { m, n, str1, str2 },
  };

  for (let i = 0; i <= m; i++) {
    for (let j = 0; j <= n; j++) {
      if (i === 0 || j === 0) {
        table[i][j] = 0;
        filledCells.push([i, j]);

        yield {
          type: "fill-cell",
          data: {
            table: table.map((r) => [...r]),
            currentCell: [i, j],
            dependencies: [],
            filledCells: [...filledCells],
            subproblemLabel: `dp[${i}][${j}] = 0 (base case)`,
            rowHeaders,
            colHeaders,
          },
          description: `Base case: dp[${i}][${j}] = 0`,
          codeLine: 5,
          variables: { i, j },
        };
      } else if (str1[i - 1] === str2[j - 1]) {
        const deps: [number, number][] = [[i - 1, j - 1]];
        table[i][j] = table[i - 1][j - 1]! + 1;
        filledCells.push([i, j]);

        yield {
          type: "match",
          data: {
            table: table.map((r) => [...r]),
            currentCell: [i, j],
            dependencies: deps,
            filledCells: [...filledCells],
            subproblemLabel: `"${str1[i - 1]}" == "${str2[j - 1]}" → dp[${i}][${j}] = dp[${i - 1}][${j - 1}] + 1 = ${table[i][j]}`,
            operation: "match",
            rowHeaders,
            colHeaders,
          },
          description: `Match! "${str1[i - 1]}" == "${str2[j - 1]}", dp[${i}][${j}] = ${table[i][j]}`,
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
        const up = table[i - 1][j]!;
        const left = table[i][j - 1]!;
        const deps: [number, number][] = [
          [i - 1, j],
          [i, j - 1],
        ];

        table[i][j] = Math.max(up, left);
        filledCells.push([i, j]);

        yield {
          type: "fill-cell",
          data: {
            table: table.map((r) => [...r]),
            currentCell: [i, j],
            dependencies: deps,
            filledCells: [...filledCells],
            subproblemLabel: `"${str1[i - 1]}" ≠ "${str2[j - 1]}" → dp[${i}][${j}] = max(dp[${i - 1}][${j}], dp[${i}][${j - 1}]) = max(${up}, ${left}) = ${table[i][j]}`,
            rowHeaders,
            colHeaders,
          },
          description: `No match, dp[${i}][${j}] = max(${up}, ${left}) = ${table[i][j]}`,
          codeLine: 9,
          variables: {
            i,
            j,
            char1: str1[i - 1],
            char2: str2[j - 1],
            up,
            left,
            "dp[i][j]": table[i][j],
          },
        };
      }
    }
  }

  // Backtrack to find the actual LCS
  const backtrackPath: [number, number][] = [];
  let lcsStr = "";
  let bi = m;
  let bj = n;
  while (bi > 0 && bj > 0) {
    backtrackPath.push([bi, bj]);
    if (str1[bi - 1] === str2[bj - 1]) {
      lcsStr = str1[bi - 1] + lcsStr;
      bi--;
      bj--;
    } else if (table[bi - 1][bj]! >= table[bi][bj - 1]!) {
      bi--;
    } else {
      bj--;
    }
  }
  backtrackPath.push([bi, bj]);
  backtrackPath.reverse();

  yield {
    type: "backtrack",
    data: {
      table: table.map((r) => [...r]),
      currentCell: [m, n],
      dependencies: [],
      filledCells: [...filledCells],
      backtrackPath,
      result: `"${lcsStr}" (length ${table[m][n]})`,
      subproblemLabel: `LCS = "${lcsStr}" | Length = ${table[m][n]}`,
      rowHeaders,
      colHeaders,
    },
    description: `Backtracking: LCS = "${lcsStr}"`,
    variables: { lcs: lcsStr, length: table[m][n] },
  };

  yield {
    type: "done",
    data: {
      table: table.map((r) => [...r]),
      currentCell: [m, n],
      dependencies: [],
      filledCells: [...filledCells],
      backtrackPath,
      result: `"${lcsStr}" (length ${table[m][n]})`,
      subproblemLabel: `LCS = "${lcsStr}"`,
      rowHeaders,
      colHeaders,
    },
    description: `LCS complete! "${lcsStr}" with length ${table[m][n]}`,
    variables: { lcs: lcsStr, length: table[m][n] },
  };
}
