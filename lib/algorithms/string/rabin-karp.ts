import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import type { StringMatchStep } from "./types";

export const rabinKarpMeta: AlgorithmMeta = {
  id: "rabin-karp",
  name: "Rabin-Karp",
  category: "string",
  description:
    "Uses a rolling hash function to quickly filter positions. Computes the hash of the pattern and slides a window over the text, updating the hash in O(1). On hash match, performs character-by-character verification.",
  timeComplexity: { best: "O(n + m)", average: "O(n + m)", worst: "O(nm)" },
  spaceComplexity: "O(1)",
  pseudocode: `function rabinKarp(text, pattern):
  base = 256, mod = 101
  patHash = hash(pattern)
  winHash = hash(text[0..m-1])
  h = base^(m-1) mod mod
  for i = 0 to n - m:
    if winHash == patHash:
      verify character by character
      if match: report i
    if i < n - m:
      winHash = (winHash - text[i]*h) * base + text[i+m]
      winHash = winHash mod mod`,
  presets: [
    {
      name: "Single Match",
      generator: () => ({ text: "ABCXABCDABCY", pattern: "ABCY" }),
      expectedCase: "average",
    },
    {
      name: "Spurious Hits",
      generator: () => ({ text: "AAAAAAAAAB", pattern: "AAAB" }),
      expectedCase: "worst",
    },
    {
      name: "No Match",
      generator: () => ({ text: "ABCDEFGHIJ", pattern: "XYZ" }),
      expectedCase: "best",
    },
    {
      name: "Multiple Matches",
      generator: () => ({ text: "ABABABABAB", pattern: "ABAB" }),
      expectedCase: "average",
    },
  ],
  misconceptions: [
    {
      myth: "Rabin-Karp is always O(n+m).",
      reality:
        "The average case is O(n+m), but hash collisions (spurious hits) can degrade it to O(nm) in the worst case.",
    },
  ],
  relatedAlgorithms: ["kmp", "boyer-moore"],
};

registerAlgorithm(rabinKarpMeta);

const BASE = 256;
const MOD = 101;

function charCode(c: string): number {
  return c.charCodeAt(0);
}

export function* rabinKarp(input: {
  text: string;
  pattern: string;
}): AlgorithmGenerator<StringMatchStep> {
  const { text, pattern } = input;
  const n = text.length;
  const m = pattern.length;
  const found: number[] = [];
  let comparisons = 0;

  if (m > n) {
    yield {
      type: "done",
      data: {
        text,
        pattern,
        textIndex: 0,
        patternIndex: 0,
        patternOffset: 0,
        matchedChars: [],
        found: [],
        comparisons: 0,
        algorithmId: "rabin-karp",
      },
      description: "Pattern longer than text -- no match possible",
      codeLine: 1,
      variables: { n, m },
    };
    return;
  }

  // Compute h = BASE^(m-1) % MOD
  let h = 1;
  for (let i = 0; i < m - 1; i++) {
    h = (h * BASE) % MOD;
  }

  // Compute initial hashes
  let patHash = 0;
  let winHash = 0;
  for (let i = 0; i < m; i++) {
    patHash = (patHash * BASE + charCode(pattern[i])) % MOD;
    winHash = (winHash * BASE + charCode(text[i])) % MOD;
  }

  yield {
    type: "init",
    data: {
      text,
      pattern,
      textIndex: 0,
      patternIndex: 0,
      patternOffset: 0,
      matchedChars: [],
      found: [],
      hashValue: winHash,
      patternHash: patHash,
      comparisons: 0,
      algorithmId: "rabin-karp",
    },
    description: `Rabin-Karp: patternHash=${patHash}, initial windowHash=${winHash}`,
    codeLine: 2,
    variables: { patHash, winHash, base: BASE, mod: MOD, h },
  };

  for (let i = 0; i <= n - m; i++) {
    if (winHash === patHash) {
      // Verify character by character
      let match = true;
      const matchedChars: number[] = [];
      for (let j = 0; j < m; j++) {
        comparisons++;
        if (text[i + j] === pattern[j]) {
          matchedChars.push(i + j);
        } else {
          match = false;

          yield {
            type: "spurious-hit",
            data: {
              text,
              pattern,
              textIndex: i + j,
              patternIndex: j,
              patternOffset: i,
              matchedChars,
              mismatchAt: i + j,
              found: [...found],
              hashValue: winHash,
              patternHash: patHash,
              comparisons,
              algorithmId: "rabin-karp",
            },
            description: `Hash match at ${i} but chars differ at offset ${j}: '${text[i + j]}' != '${pattern[j]}' (spurious hit)`,
            codeLine: 7,
            variables: { i, j, winHash, patHash, comparisons },
          };
          break;
        }
      }

      if (match) {
        found.push(i);
        yield {
          type: "match",
          data: {
            text,
            pattern,
            textIndex: i + m - 1,
            patternIndex: m - 1,
            patternOffset: i,
            matchedChars: Array.from({ length: m }, (_, x) => i + x),
            found: [...found],
            hashValue: winHash,
            patternHash: patHash,
            comparisons,
            algorithmId: "rabin-karp",
          },
          description: `Pattern found at position ${i}! (hash=${winHash})`,
          codeLine: 8,
          variables: {
            i,
            winHash,
            patHash,
            comparisons,
            totalFound: found.length,
          },
        };
      }
    } else {
      comparisons++;
      yield {
        type: "hash-compare",
        data: {
          text,
          pattern,
          textIndex: i,
          patternIndex: 0,
          patternOffset: i,
          matchedChars: [],
          found: [...found],
          hashValue: winHash,
          patternHash: patHash,
          comparisons,
          algorithmId: "rabin-karp",
        },
        description: `Window at ${i}: hash=${winHash} != patternHash=${patHash}, skip`,
        codeLine: 6,
        variables: { i, winHash, patHash, comparisons },
      };
    }

    // Roll the hash
    if (i < n - m) {
      winHash =
        ((winHash - charCode(text[i]) * h) * BASE + charCode(text[i + m])) %
        MOD;
      if (winHash < 0) winHash += MOD;

      yield {
        type: "roll-hash",
        data: {
          text,
          pattern,
          textIndex: i + 1,
          patternIndex: 0,
          patternOffset: i + 1,
          matchedChars: [],
          found: [...found],
          hashValue: winHash,
          patternHash: patHash,
          comparisons,
          algorithmId: "rabin-karp",
        },
        description: `Roll hash: remove '${text[i]}', add '${text[i + m]}' → hash=${winHash}`,
        codeLine: 10,
        variables: { i: i + 1, winHash, removed: text[i], added: text[i + m] },
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
      hashValue: winHash,
      patternHash: patHash,
      comparisons,
      algorithmId: "rabin-karp",
    },
    description:
      found.length > 0
        ? `Rabin-Karp complete: ${found.length} occurrence(s) at [${found.join(", ")}]`
        : "Rabin-Karp complete: pattern not found",
    codeLine: 12,
    variables: { comparisons, totalFound: found.length, positions: found },
  };
}
