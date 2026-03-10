import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import type { StringMatchStep } from "./types";

export const kmpMeta: AlgorithmMeta = {
  id: "kmp",
  name: "KMP (Knuth-Morris-Pratt)",
  category: "string",
  description:
    "Preprocesses the pattern to build a failure function (partial match table), then scans the text without ever re-examining characters. On mismatch, the failure table tells us how far to shift the pattern.",
  timeComplexity: { best: "O(n + m)", average: "O(n + m)", worst: "O(n + m)" },
  spaceComplexity: "O(m)",
  pseudocode: `function buildFailure(pattern):
  failure = [0] * pattern.length
  k = 0
  for i = 1 to pattern.length - 1:
    while k > 0 and pattern[k] != pattern[i]:
      k = failure[k - 1]
    if pattern[k] == pattern[i]:
      k++
    failure[i] = k
  return failure

function KMP(text, pattern):
  failure = buildFailure(pattern)
  j = 0
  for i = 0 to text.length - 1:
    while j > 0 and pattern[j] != text[i]:
      j = failure[j - 1]
    if pattern[j] == text[i]:
      j++
    if j == pattern.length:
      report match at i - j + 1
      j = failure[j - 1]`,
  presets: [
    {
      name: "Found at Start",
      generator: () => ({ text: "AABAABAAB", pattern: "AAB" }),
      expectedCase: "best",
    },
    {
      name: "Found in Middle",
      generator: () => ({ text: "AABAACAADAABAABA", pattern: "AABA" }),
      expectedCase: "average",
    },
    {
      name: "Multiple Occurrences",
      generator: () => ({ text: "ABABABABAB", pattern: "ABAB" }),
      expectedCase: "average",
    },
    {
      name: "Not Found",
      generator: () => ({ text: "ABCDEFGHIJ", pattern: "XYZ" }),
      expectedCase: "best",
    },
    {
      name: "Worst Case (many partial)",
      generator: () => ({ text: "AAAAAAAAAAAB", pattern: "AAAAB" }),
      expectedCase: "worst",
    },
  ],
  misconceptions: [
    {
      myth: "KMP is always faster than brute force.",
      reality:
        "KMP has better worst-case guarantees (O(n+m) vs O(nm)), but for random text, brute force is often competitive due to early mismatches.",
    },
  ],
  relatedAlgorithms: ["rabin-karp", "boyer-moore"],
};

registerAlgorithm(kmpMeta);

export function* kmp(input: {
  text: string;
  pattern: string;
}): AlgorithmGenerator<StringMatchStep> {
  const { text, pattern } = input;
  const n = text.length;
  const m = pattern.length;
  const failure = new Array<number>(m).fill(0);
  const found: number[] = [];
  let comparisons = 0;

  yield {
    type: "init",
    data: {
      text,
      pattern,
      textIndex: -1,
      patternIndex: -1,
      patternOffset: 0,
      matchedChars: [],
      found: [],
      table: [...failure],
      comparisons: 0,
      phase: "build-table",
      algorithmId: "kmp",
    },
    description: `KMP: Building failure function for pattern "${pattern}"`,
    codeLine: 1,
    variables: { n, m },
  };

  // Build failure function
  let k = 0;
  for (let i = 1; i < m; i++) {
    while (k > 0 && pattern[k] !== pattern[i]) {
      k = failure[k - 1];
      comparisons++;
    }
    comparisons++;
    if (pattern[k] === pattern[i]) {
      k++;
    }
    failure[i] = k;

    yield {
      type: "build-table",
      data: {
        text,
        pattern,
        textIndex: -1,
        patternIndex: i,
        patternOffset: 0,
        matchedChars: [],
        found: [],
        table: [...failure],
        tableHighlight: i,
        comparisons,
        phase: "build-table",
        algorithmId: "kmp",
      },
      description: `failure[${i}] = ${failure[i]} (pattern[${i}]='${pattern[i]}')`,
      codeLine: 5,
      variables: { i, k, "failure[i]": failure[i] },
    };
  }

  // Search phase
  let j = 0;
  for (let i = 0; i < n; i++) {
    while (j > 0 && pattern[j] !== text[i]) {
      comparisons++;
      j = failure[j - 1];
    }
    comparisons++;

    const matchedChars: number[] = [];
    if (pattern[j] === text[i]) {
      j++;
      for (let x = 0; x < j; x++) {
        matchedChars.push(i - j + 1 + x);
      }
    }

    if (j === m) {
      const matchPos = i - m + 1;
      found.push(matchPos);

      yield {
        type: "match",
        data: {
          text,
          pattern,
          textIndex: i,
          patternIndex: j - 1,
          patternOffset: matchPos,
          matchedChars: Array.from({ length: m }, (_, x) => matchPos + x),
          found: [...found],
          table: [...failure],
          comparisons,
          phase: "search",
          algorithmId: "kmp",
        },
        description: `Pattern found at position ${matchPos}!`,
        codeLine: 18,
        variables: {
          i,
          j,
          matchPosition: matchPos,
          comparisons,
          totalFound: found.length,
        },
      };

      j = failure[j - 1];
    } else {
      const mismatch = pattern[j] !== text[i] ? i : undefined;
      yield {
        type: mismatch !== undefined ? "mismatch" : "compare",
        data: {
          text,
          pattern,
          textIndex: i,
          patternIndex: j > 0 ? j - 1 : 0,
          patternOffset: i - (j > 0 ? j - 1 : 0),
          matchedChars,
          mismatchAt: mismatch,
          found: [...found],
          table: [...failure],
          tableHighlight: j > 0 ? j - 1 : undefined,
          comparisons,
          phase: "search",
          algorithmId: "kmp",
        },
        description:
          mismatch !== undefined
            ? `Mismatch: text[${i}]='${text[i]}' != pattern[${j}]='${pattern[j]}', shift via failure table`
            : `Match: text[${i}]='${text[i]}' == pattern[${j - 1}]='${pattern[j - 1]}', j=${j}`,
        codeLine: mismatch !== undefined ? 15 : 17,
        variables: { i, j, "text[i]": text[i], comparisons },
      };
    }
  }

  yield {
    type: "done",
    data: {
      text,
      pattern,
      textIndex: n,
      patternIndex: 0,
      patternOffset: 0,
      matchedChars: [],
      found: [...found],
      table: [...failure],
      comparisons,
      phase: "search",
      algorithmId: "kmp",
    },
    description:
      found.length > 0
        ? `KMP complete: found ${found.length} occurrence(s) at position(s) [${found.join(", ")}]`
        : "KMP complete: pattern not found",
    codeLine: 20,
    variables: { comparisons, totalFound: found.length, positions: found },
  };
}
