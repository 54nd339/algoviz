import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import type { DSOperation, DSStep, HuffmanNode, HuffmanState } from "./types";

export const huffmanMeta: AlgorithmMeta = {
  id: "huffman",
  name: "Huffman Coding",
  category: "data-structures",
  description:
    "A greedy algorithm that builds an optimal prefix-free binary code by repeatedly merging the two lowest-frequency nodes into a tree. Frequently used characters get shorter codes, achieving compression.",
  timeComplexity: {
    best: "O(n log n)",
    average: "O(n log n)",
    worst: "O(n log n)",
  },
  spaceComplexity: "O(n)",
  pseudocode: `buildTree(text):
  freq = countFrequencies(text)
  queue = min-priority queue of leaf nodes

  while queue.size > 1:
    left = queue.extractMin()
    right = queue.extractMin()
    merged = new Node(freq=left.freq+right.freq)
    merged.left = left
    merged.right = right
    queue.insert(merged)

  root = queue.extractMin()
  assignCodes(root, "")

assignCodes(node, code):
  if node is leaf:
    node.code = code
  else:
    assignCodes(node.left, code + "0")
    assignCodes(node.right, code + "1")`,
  presets: [
    {
      name: 'Encode "hello world"',
      generator: () => [{ op: "build", args: ["hello world"] }],
      expectedCase: "average" as const,
    },
    {
      name: 'Encode "abracadabra"',
      generator: () => [{ op: "build", args: ["abracadabra"] }],
      expectedCase: "average" as const,
    },
    {
      name: "Custom Frequencies",
      generator: () => [
        {
          op: "build-freq",
          args: [{ a: 45, b: 13, c: 12, d: 16, e: 9, f: 5 }],
        },
      ],
      expectedCase: "average" as const,
    },
  ],
  misconceptions: [
    {
      myth: "Huffman coding always produces the best compression.",
      reality:
        "Huffman coding is optimal among prefix-free codes for known symbol frequencies, but arithmetic coding can achieve better compression in practice by encoding fractional bits.",
    },
  ],
  relatedAlgorithms: ["heap", "trie"],
};

registerAlgorithm(huffmanMeta);

let nid = 0;
function newId(): string {
  return `hf-${nid++}`;
}

function cloneHuffman(node: HuffmanNode | null): HuffmanNode | null {
  if (!node) return null;
  return {
    ...node,
    left: cloneHuffman(node.left),
    right: cloneHuffman(node.right),
  };
}

function makeState(
  root: HuffmanNode | null,
  codes: Record<string, string>,
  encoded: string,
  forest: HuffmanNode[],
): HuffmanState {
  return {
    kind: "huffman",
    root: cloneHuffman(root),
    codes: { ...codes },
    encoded,
    forest: forest.map((n) => cloneHuffman(n)!),
  };
}

function countFrequencies(text: string): Record<string, number> {
  const freq: Record<string, number> = {};
  for (const ch of text) {
    freq[ch] = (freq[ch] || 0) + 1;
  }
  return freq;
}

function assignCodes(
  node: HuffmanNode,
  code: string,
  codes: Record<string, string>,
): void {
  if (node.char !== null) {
    node.code = code || "0"; // single-char edge case
    codes[node.char] = node.code;
    return;
  }
  if (node.left) assignCodes(node.left, code + "0", codes);
  if (node.right) assignCodes(node.right, code + "1", codes);
}

function extractMin(queue: HuffmanNode[]): HuffmanNode {
  let minIdx = 0;
  for (let i = 1; i < queue.length; i++) {
    if (queue[i].freq < queue[minIdx].freq) minIdx = i;
  }
  return queue.splice(minIdx, 1)[0];
}

export function* huffman(ops: DSOperation[]): AlgorithmGenerator<DSStep> {
  nid = 0;

  yield {
    type: "init",
    data: {
      structure: makeState(null, {}, "", []),
      operation: "init",
      operationArgs: [],
      highlightNodes: [],
      highlightEdges: [],
      message: "Huffman coding ready",
      comparisons: 0,
    },
    description: "Huffman coding ready",
    codeLine: 1,
    variables: {},
  };

  for (const { op, args } of ops) {
    let freq: Record<string, number>;

    if (op === "build") {
      const text = args[0] as string;
      freq = countFrequencies(text);
    } else if (op === "build-freq") {
      freq = args[0] as Record<string, number>;
    } else {
      continue;
    }

    const text =
      op === "build" ? (args[0] as string) : Object.keys(freq).join("");

    const queue: HuffmanNode[] = Object.entries(freq).map(([char, f]) => ({
      id: newId(),
      char,
      freq: f,
      left: null,
      right: null,
    }));

    yield {
      type: "frequency",
      data: {
        structure: makeState(null, {}, "", queue),
        operation: op,
        operationArgs: args,
        highlightNodes: queue.map((n) => n.id),
        highlightEdges: [],
        message: `Character frequencies: ${Object.entries(freq)
          .map(([c, f]) => `'${c === " " ? "⎵" : c}':${f}`)
          .join(", ")}`,
        comparisons: 0,
      },
      description: "Computed character frequencies",
      codeLine: 2,
      variables: { frequencies: freq, nodes: queue.length },
    };

    let comparisons = 0;

    while (queue.length > 1) {
      const left = extractMin(queue);
      const right = extractMin(queue);
      comparisons += queue.length + 1;

      yield {
        type: "extract-min",
        data: {
          structure: makeState(null, {}, "", [left, right, ...queue]),
          operation: op,
          operationArgs: args,
          highlightNodes: [left.id, right.id],
          highlightEdges: [],
          message: `Extracted two minimum nodes: '${left.char ?? "⊕"}' (freq=${left.freq}) and '${right.char ?? "⊕"}' (freq=${right.freq})`,
          comparisons,
        },
        description: `Extract min pair: freq ${left.freq} + ${right.freq}`,
        codeLine: 5,
        variables: {
          left: { char: left.char, freq: left.freq },
          right: { char: right.char, freq: right.freq },
          remaining: queue.length,
        },
      };

      const merged: HuffmanNode = {
        id: newId(),
        char: null,
        freq: left.freq + right.freq,
        left,
        right,
      };
      queue.push(merged);

      yield {
        type: "merge",
        data: {
          structure: makeState(merged, {}, "", queue),
          operation: op,
          operationArgs: args,
          highlightNodes: [merged.id, left.id, right.id],
          highlightEdges: [
            [merged.id, left.id],
            [merged.id, right.id],
          ],
          message: `Merged into internal node (freq=${merged.freq})`,
          comparisons,
        },
        description: `Merge → freq ${merged.freq}`,
        codeLine: 8,
        variables: { mergedFreq: merged.freq, nodesLeft: queue.length },
      };
    }

    const root = queue[0];
    const codes: Record<string, string> = {};
    assignCodes(root, "", codes);

    yield {
      type: "assign-codes",
      data: {
        structure: makeState(root, codes, "", []),
        operation: op,
        operationArgs: args,
        highlightNodes: [root.id],
        highlightEdges: [],
        message: `Codes assigned: ${Object.entries(codes)
          .map(([c, code]) => `'${c === " " ? "⎵" : c}'=${code}`)
          .join(", ")}`,
        comparisons,
      },
      description: "Assigned Huffman codes",
      codeLine: 14,
      variables: { codes },
    };

    let encoded = "";
    for (const ch of text) {
      if (codes[ch]) encoded += codes[ch];
    }

    const originalBits = text.length * 8;
    const compressedBits = encoded.length;

    yield {
      type: "encode",
      data: {
        structure: makeState(root, codes, encoded, []),
        operation: op,
        operationArgs: args,
        highlightNodes: [],
        highlightEdges: [],
        message: `Encoded: "${text}" → ${encoded} (${compressedBits} bits vs ${originalBits} ASCII bits, ${((1 - compressedBits / originalBits) * 100).toFixed(1)}% savings)`,
        comparisons,
      },
      description: `Encoded to ${compressedBits} bits`,
      codeLine: 17,
      variables: {
        encoded: encoded.length > 40 ? encoded.slice(0, 40) + "..." : encoded,
        originalBits,
        compressedBits,
        ratio: ((compressedBits / originalBits) * 100).toFixed(1) + "%",
      },
    };
  }

  yield {
    type: "done",
    data: {
      structure: makeState(null, {}, "", []),
      operation: "done",
      operationArgs: [],
      highlightNodes: [],
      highlightEdges: [],
      message: "Huffman coding complete",
      comparisons: 0,
    },
    description: "Huffman coding complete",
    variables: {},
  };
}
