import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import type { HashStep } from "./types";

export const hashAvalancheMeta: AlgorithmMeta = {
  id: "hash-avalanche",
  name: "Hash Avalanche Effect",
  category: "crypto",
  description:
    "Demonstrates the avalanche effect: changing a single character in the input causes roughly 50% of the output bits to flip. This property is essential for cryptographic hash functions.",
  timeComplexity: { best: "O(n)", average: "O(n)", worst: "O(n)" },
  spaceComplexity: "O(1)",
  pseudocode: `hash_a = fnv1a(input)
for each position i in input:
  modified = input with char at i changed
  hash_b = fnv1a(modified)
  diff = count_different_bits(hash_a, hash_b)
  show diff / total_bits as percentage`,
  presets: [
    {
      name: "Hello",
      generator: () => ({ input: "Hello" }),
      expectedCase: "average",
    },
    {
      name: "password",
      generator: () => ({ input: "password" }),
      expectedCase: "average",
    },
  ],
};

registerAlgorithm(hashAvalancheMeta);

function fnv1a(str: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function toBinary(n: number): string {
  return n.toString(2).padStart(32, "0");
}

function diffBits(a: string, b: string): number[] {
  const positions: number[] = [];
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) positions.push(i);
  }
  return positions;
}

function nextChar(c: string): string {
  return String.fromCharCode(c.charCodeAt(0) + 1);
}

export function* hashAvalanche(input: {
  input: string;
}): AlgorithmGenerator<HashStep> {
  const original = input.input;
  const hashA = fnv1a(original);
  const hexA = hashA.toString(16).padStart(8, "0");
  const binA = toBinary(hashA);

  yield {
    type: "init",
    data: {
      inputA: original,
      inputB: original,
      hashA: hexA,
      hashB: hexA,
      binaryA: binA,
      binaryB: binA,
      differingBits: [],
      totalBits: 32,
      changePercentage: 0,
      currentChar: -1,
      changedChar: "",
    },
    description: `Original: "${original}" → hash: 0x${hexA}`,
    codeLine: 1,
    variables: { input: original, hash: `0x${hexA}` },
  };

  for (let i = 0; i < original.length; i++) {
    const modified =
      original.slice(0, i) + nextChar(original[i]) + original.slice(i + 1);
    const hashB = fnv1a(modified);
    const hexB = hashB.toString(16).padStart(8, "0");
    const binB = toBinary(hashB);
    const diffs = diffBits(binA, binB);
    const pct = (diffs.length / 32) * 100;

    yield {
      type: "compare",
      data: {
        inputA: original,
        inputB: modified,
        hashA: hexA,
        hashB: hexB,
        binaryA: binA,
        binaryB: binB,
        differingBits: diffs,
        totalBits: 32,
        changePercentage: pct,
        currentChar: i,
        changedChar: nextChar(original[i]),
      },
      description: `Change '${original[i]}' → '${nextChar(original[i])}' at position ${i}: ${diffs.length}/32 bits differ (${pct.toFixed(1)}%)`,
      codeLine: 4,
      variables: {
        position: i,
        original: original[i],
        changed: nextChar(original[i]),
        diffBits: diffs.length,
        percentage: pct.toFixed(1) + "%",
      },
    };
  }

  const summary = original.split("").map((_, i) => {
    const mod =
      original.slice(0, i) + nextChar(original[i]) + original.slice(i + 1);
    return diffBits(binA, toBinary(fnv1a(mod))).length;
  });
  const avgDiff = summary.reduce((s, v) => s + v, 0) / summary.length;

  yield {
    type: "done",
    data: {
      inputA: original,
      inputB: original,
      hashA: hexA,
      hashB: hexA,
      binaryA: binA,
      binaryB: binA,
      differingBits: [],
      totalBits: 32,
      changePercentage: (avgDiff / 32) * 100,
      currentChar: original.length,
      changedChar: "",
    },
    description: `Avalanche complete. Average: ${avgDiff.toFixed(1)}/32 bits differ (${((avgDiff / 32) * 100).toFixed(1)}%) per single-char change`,
    codeLine: 6,
    variables: {
      avgDiffBits: avgDiff.toFixed(1),
      avgPercentage: ((avgDiff / 32) * 100).toFixed(1) + "%",
    },
  };
}
