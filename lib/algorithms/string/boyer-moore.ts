import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import type { StringMatchStep } from "./types";

export const boyerMooreMeta: AlgorithmMeta = {
  id: "boyer-moore",
  name: "Boyer-Moore",
  category: "string",
  description:
    "Compares the pattern from right to left. Uses the bad character rule (and simplified good suffix) to skip large portions of text. Often sub-linear in practice for natural language text.",
  timeComplexity: { best: "O(n/m)", average: "O(n)", worst: "O(nm)" },
  spaceComplexity: "O(k) where k = alphabet size",
  pseudocode: `function buildBadChar(pattern):
  table = {} // char → last occurrence
  for i = 0 to pattern.length - 1:
    table[pattern[i]] = i
  return table

function boyerMoore(text, pattern):
  badChar = buildBadChar(pattern)
  i = 0
  while i <= text.length - pattern.length:
    j = pattern.length - 1
    while j >= 0 and pattern[j] == text[i + j]:
      j--
    if j < 0:
      report match at i
      i += (i + m < n) ? m - badChar[text[i+m]] : 1
    else:
      shift = j - badChar.get(text[i+j], -1)
      i += max(1, shift)`,
  presets: [
    {
      name: "Long Skip",
      generator: () => ({ text: "XXXXXXXXXXXXXXYZ", pattern: "XYZ" }),
      expectedCase: "best",
    },
    {
      name: "Natural Text",
      generator: () => ({
        text: "HERE IS A SIMPLE EXAMPLE",
        pattern: "EXAMPLE",
      }),
      expectedCase: "average",
    },
    {
      name: "Worst Case",
      generator: () => ({ text: "AAAAAAAAAAAA", pattern: "BAAAA" }),
      expectedCase: "worst",
    },
    {
      name: "Multiple Matches",
      generator: () => ({ text: "ABCABCABCABC", pattern: "ABC" }),
      expectedCase: "average",
    },
  ],
  misconceptions: [
    {
      myth: "Boyer-Moore always compares right to left.",
      reality:
        "The pattern comparison is right-to-left, but the pattern slides left-to-right through the text. The right-to-left comparison enables larger shifts on mismatch.",
    },
  ],
  relatedAlgorithms: ["kmp", "rabin-karp"],
};

registerAlgorithm(boyerMooreMeta);

function buildBadCharTable(pattern: string): Map<string, number> {
  const table = new Map<string, number>();
  for (let i = 0; i < pattern.length; i++) {
    table.set(pattern[i], i);
  }
  return table;
}

function badCharToArray(table: Map<string, number>, pattern: string): number[] {
  const chars = new Set([...pattern]);
  const arr: number[] = [];
  for (const ch of chars) {
    arr.push(table.get(ch) ?? -1);
  }
  return arr;
}

export function* boyerMoore(input: {
  text: string;
  pattern: string;
}): AlgorithmGenerator<StringMatchStep> {
  const { text, pattern } = input;
  const n = text.length;
  const m = pattern.length;
  const found: number[] = [];
  let comparisons = 0;

  const badChar = buildBadCharTable(pattern);

  const tableValues = badCharToArray(badChar, pattern);

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
      table: tableValues,
      comparisons: 0,
      phase: "build-table",
      algorithmId: "boyer-moore",
    },
    description: `Boyer-Moore: Built bad character table for "${pattern}"`,
    codeLine: 1,
    variables: {
      badCharTable: Object.fromEntries(badChar),
      n,
      m,
    },
  };

  let i = 0;
  while (i <= n - m) {
    let j = m - 1;
    const matchedChars: number[] = [];

    while (j >= 0 && pattern[j] === text[i + j]) {
      comparisons++;
      matchedChars.unshift(i + j);
      j--;
    }

    if (j < 0) {
      found.push(i);

      yield {
        type: "match",
        data: {
          text,
          pattern,
          textIndex: i + m - 1,
          patternIndex: 0,
          patternOffset: i,
          matchedChars: Array.from({ length: m }, (_, x) => i + x),
          found: [...found],
          table: tableValues,
          comparisons,
          phase: "search",
          algorithmId: "boyer-moore",
        },
        description: `Pattern found at position ${i}!`,
        codeLine: 13,
        variables: { i, comparisons, totalFound: found.length },
      };

      const shiftChar = i + m < n ? text[i + m] : undefined;
      const shift =
        shiftChar !== undefined ? m - (badChar.get(shiftChar) ?? -1) - 1 : 1;
      i += Math.max(1, shift);
    } else {
      comparisons++;
      const mismatchChar = text[i + j];
      const badCharShift = j - (badChar.get(mismatchChar) ?? -1);
      const shift = Math.max(1, badCharShift);

      yield {
        type: "mismatch",
        data: {
          text,
          pattern,
          textIndex: i + j,
          patternIndex: j,
          patternOffset: i,
          matchedChars,
          mismatchAt: i + j,
          found: [...found],
          table: tableValues,
          comparisons,
          phase: "search",
          algorithmId: "boyer-moore",
        },
        description: `Mismatch at text[${i + j}]='${mismatchChar}' != pattern[${j}]='${pattern[j]}', shift by ${shift}`,
        codeLine: 16,
        variables: {
          i,
          j,
          mismatchChar,
          shift,
          "badChar[mismatchChar]": badChar.get(mismatchChar) ?? -1,
          comparisons,
        },
      };

      i += shift;
    }
  }

  yield {
    type: "done",
    data: {
      text,
      pattern,
      textIndex: n,
      patternIndex: 0,
      patternOffset: i,
      matchedChars: [],
      found: [...found],
      table: tableValues,
      comparisons,
      phase: "search",
      algorithmId: "boyer-moore",
    },
    description:
      found.length > 0
        ? `Boyer-Moore complete: ${found.length} occurrence(s) at [${found.join(", ")}]`
        : "Boyer-Moore complete: pattern not found",
    codeLine: 18,
    variables: { comparisons, totalFound: found.length, positions: found },
  };
}
