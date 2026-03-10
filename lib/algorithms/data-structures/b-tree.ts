import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import type { BTreeNode, BTreeState, DSOperation, DSStep } from "./types";

export const bTreeMeta: AlgorithmMeta = {
  id: "b-tree",
  name: "B-Tree (Order 3)",
  category: "data-structures",
  description:
    "A self-balancing search tree (2-3 tree) where each node can contain 1-2 keys and 2-3 children. Nodes split when they overflow, promoting the median key to the parent. All leaves are at the same depth.",
  timeComplexity: { best: "O(log n)", average: "O(log n)", worst: "O(log n)" },
  spaceComplexity: "O(n)",
  pseudocode: `insert(root, key):
  if root is full:
    newRoot = new Node()
    newRoot.children[0] = root
    splitChild(newRoot, 0)
    insertNonFull(newRoot, key)
    root = newRoot
  else:
    insertNonFull(root, key)

insertNonFull(node, key):
  if node is leaf:
    insert key in sorted position
  else:
    find child to recurse into
    if child is full:
      splitChild(node, childIndex)
      decide which child gets the key
    insertNonFull(child, key)

splitChild(parent, index):
  full = parent.children[index]
  median = full.keys[1]
  left = keys[0], right = keys[2]
  promote median to parent
  split children accordingly`,
  presets: [
    {
      name: "Sequential Insert",
      generator: () => [
        { op: "insert", args: [10] },
        { op: "insert", args: [20] },
        { op: "insert", args: [30] },
        { op: "insert", args: [40] },
        { op: "insert", args: [50] },
        { op: "insert", args: [60] },
        { op: "insert", args: [70] },
      ],
      expectedCase: "average" as const,
    },
    {
      name: "Mixed Insert",
      generator: () => [
        { op: "insert", args: [50] },
        { op: "insert", args: [20] },
        { op: "insert", args: [70] },
        { op: "insert", args: [10] },
        { op: "insert", args: [30] },
        { op: "insert", args: [60] },
        { op: "insert", args: [80] },
        { op: "insert", args: [15] },
        { op: "insert", args: [25] },
      ],
      expectedCase: "average" as const,
    },
  ],
  misconceptions: [
    {
      myth: "B-Trees are only used in databases.",
      reality:
        "B-Trees are also used in file systems (NTFS, HFS+, ext4), indexing structures, and any scenario requiring efficient disk-based search. The 2-3 tree variant is commonly taught as an introduction.",
    },
  ],
  relatedAlgorithms: ["bst", "avl", "red-black"],
};

registerAlgorithm(bTreeMeta);

const ORDER = 3; // 2-3 tree
const MAX_KEYS = ORDER - 1;

let nid = 0;
function newId(): string {
  return `bt-${nid++}`;
}

function cloneNode(node: BTreeNode | null): BTreeNode | null {
  if (!node) return null;
  return {
    id: node.id,
    keys: [...node.keys],
    children: node.children.map((c) => cloneNode(c)!).filter(Boolean),
  };
}

function makeState(root: BTreeNode | null): BTreeState {
  return { kind: "b-tree", root: cloneNode(root), order: ORDER };
}

function isLeaf(node: BTreeNode): boolean {
  return node.children.length === 0;
}

interface StepInfo {
  type: string;
  message: string;
  codeLine: number;
  vars: Record<string, unknown>;
  highlights: string[];
}

function splitChild(parent: BTreeNode, index: number, steps: StepInfo[]): void {
  const full = parent.children[index];
  const medianKey = full.keys[1];
  const leftNode: BTreeNode = {
    id: full.id,
    keys: [full.keys[0]],
    children: [],
  };
  const rightNode: BTreeNode = {
    id: newId(),
    keys: [full.keys[2]],
    children: [],
  };

  if (!isLeaf(full)) {
    leftNode.children = [full.children[0], full.children[1]];
    rightNode.children = [full.children[2], full.children[3]];
  }

  // Insert median into parent
  const insertPos = parent.keys.findIndex((k) => k > medianKey);
  const pos = insertPos === -1 ? parent.keys.length : insertPos;
  parent.keys.splice(pos, 0, medianKey);
  parent.children.splice(index, 1, leftNode, rightNode);

  steps.push({
    type: "split",
    message: `Node overflow! Split: [${full.keys.join(", ")}] → promote ${medianKey}, left=[${leftNode.keys.join(", ")}], right=[${rightNode.keys.join(", ")}]`,
    codeLine: 23,
    vars: {
      median: medianKey,
      leftKeys: leftNode.keys,
      rightKeys: rightNode.keys,
    },
    highlights: [leftNode.id, rightNode.id, parent.id],
  });
}

function insertNonFull(node: BTreeNode, key: number, steps: StepInfo[]): void {
  if (isLeaf(node)) {
    const pos = node.keys.findIndex((k) => k > key);
    const insertPos = pos === -1 ? node.keys.length : pos;
    node.keys.splice(insertPos, 0, key);

    steps.push({
      type: "insert-key",
      message: `Inserted ${key} into leaf node [${node.keys.join(", ")}]`,
      codeLine: 12,
      vars: { key, nodeKeys: [...node.keys] },
      highlights: [node.id],
    });
    return;
  }

  let i = node.keys.findIndex((k) => k > key);
  if (i === -1) i = node.keys.length;

  steps.push({
    type: "descend",
    message: `Descending to child ${i} of node [${node.keys.join(", ")}]`,
    codeLine: 15,
    vars: { key, nodeKeys: node.keys, childIndex: i },
    highlights: [node.id],
  });

  if (node.children[i].keys.length === MAX_KEYS + 1) {
    // This shouldn't happen if we split on the way down, but safety check
    splitChild(node, i, steps);
    if (key > node.keys[i]) i++;
  }

  // Check if child is full before descending
  if (node.children[i].keys.length >= ORDER - 1 + 1) {
    splitChild(node, i, steps);
    if (key > node.keys[i]) i++;
  }

  insertNonFull(node.children[i], key, steps);
}

function bTreeInsert(
  root: BTreeNode | null,
  key: number,
  steps: StepInfo[],
): BTreeNode {
  if (!root) {
    const node: BTreeNode = { id: newId(), keys: [key], children: [] };
    steps.push({
      type: "insert-key",
      message: `Created root node with key ${key}`,
      codeLine: 2,
      vars: { key },
      highlights: [node.id],
    });
    return node;
  }

  if (root.keys.length >= ORDER) {
    // Root is full, need to split
    const newRoot: BTreeNode = { id: newId(), keys: [], children: [root] };
    splitChild(newRoot, 0, steps);
    const i = key > newRoot.keys[0] ? 1 : 0;
    insertNonFull(newRoot.children[i], key, steps);
    return newRoot;
  }

  insertNonFull(root, key, steps);
  return root;
}

export function* bTree(ops: DSOperation[]): AlgorithmGenerator<DSStep> {
  let root: BTreeNode | null = null;
  let comparisons = 0;
  nid = 0;

  yield {
    type: "init",
    data: {
      structure: makeState(root),
      operation: "init",
      operationArgs: [],
      highlightNodes: [],
      highlightEdges: [],
      message: "Empty B-Tree (order 3 / 2-3 tree) initialized",
      comparisons: 0,
    },
    description: "Empty B-Tree initialized",
    codeLine: 1,
    variables: { order: ORDER },
  };

  for (const { op, args } of ops) {
    if (op === "insert") {
      const key = args[0] as number;
      const steps: StepInfo[] = [];
      root = bTreeInsert(root, key, steps);

      for (const step of steps) {
        if (step.type === "descend") comparisons++;
        yield {
          type: step.type,
          data: {
            structure: makeState(root),
            operation: "insert",
            operationArgs: [key],
            highlightNodes: step.highlights,
            highlightEdges: [],
            message: step.message,
            comparisons,
          },
          description: step.message,
          codeLine: step.codeLine,
          variables: step.vars,
        };
      }
    }
  }

  yield {
    type: "done",
    data: {
      structure: makeState(root),
      operation: "done",
      operationArgs: [],
      highlightNodes: [],
      highlightEdges: [],
      message: "All B-Tree operations complete",
      comparisons,
    },
    description: "All B-Tree operations complete",
    variables: { comparisons },
  };
}
