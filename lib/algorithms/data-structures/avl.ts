import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import type { AVLState, DSOperation, DSStep, TreeNode } from "./types";

export const avlMeta: AlgorithmMeta = {
  id: "avl",
  name: "AVL Tree",
  category: "data-structures",
  description:
    "A self-balancing BST where the heights of the two child subtrees of every node differ by at most one. Rotations restore balance after insertion, guaranteeing O(log n) operations.",
  timeComplexity: { best: "O(log n)", average: "O(log n)", worst: "O(log n)" },
  spaceComplexity: "O(n)",
  pseudocode: `insert(root, value):
  if root == null: return new Node(value)
  if value < root.value:
    root.left = insert(root.left, value)
  else:
    root.right = insert(root.right, value)

  root.height = 1 + max(height(left), height(right))
  balance = getBalance(root)

  // Left Left → right rotate
  if balance > 1 and value < root.left.value:
    return rightRotate(root)
  // Right Right → left rotate
  if balance < -1 and value > root.right.value:
    return leftRotate(root)
  // Left Right → left then right
  if balance > 1 and value > root.left.value:
    root.left = leftRotate(root.left)
    return rightRotate(root)
  // Right Left → right then left
  if balance < -1 and value < root.right.value:
    root.right = rightRotate(root.right)
    return leftRotate(root)
  return root`,
  presets: [
    {
      name: "Balanced Insert",
      generator: () => [
        { op: "insert", args: [30] },
        { op: "insert", args: [20] },
        { op: "insert", args: [40] },
        { op: "insert", args: [10] },
        { op: "insert", args: [25] },
        { op: "insert", args: [35] },
        { op: "insert", args: [50] },
      ],
      expectedCase: "best" as const,
    },
    {
      name: "Force Rotations",
      generator: () => [
        { op: "insert", args: [10] },
        { op: "insert", args: [20] },
        { op: "insert", args: [30] },
        { op: "insert", args: [40] },
        { op: "insert", args: [50] },
        { op: "insert", args: [25] },
      ],
      expectedCase: "worst" as const,
    },
    {
      name: "Left-Right Rotation",
      generator: () => [
        { op: "insert", args: [30] },
        { op: "insert", args: [10] },
        { op: "insert", args: [20] },
      ],
      expectedCase: "average" as const,
    },
  ],
  misconceptions: [
    {
      myth: "AVL trees are always better than Red-Black trees.",
      reality:
        "AVL trees have faster lookups due to stricter balancing, but Red-Black trees have faster insertions/deletions because they require fewer rotations.",
    },
  ],
  relatedAlgorithms: ["bst", "red-black"],
};

registerAlgorithm(avlMeta);

let nid = 0;
function newId(): string {
  return `avl-${nid++}`;
}

function height(node: TreeNode | null): number {
  return node?.height ?? 0;
}

function updateHeight(node: TreeNode): void {
  node.height = 1 + Math.max(height(node.left), height(node.right));
  node.balanceFactor = height(node.left) - height(node.right);
}

function cloneTree(node: TreeNode | null): TreeNode | null {
  if (!node) return null;
  return { ...node, left: cloneTree(node.left), right: cloneTree(node.right) };
}

function makeState(root: TreeNode | null): AVLState {
  return { kind: "avl", root: cloneTree(root) };
}

function rightRotate(y: TreeNode): TreeNode {
  const x = y.left!;
  const t2 = x.right;
  x.right = y;
  y.left = t2;
  updateHeight(y);
  updateHeight(x);
  return x;
}

function leftRotate(x: TreeNode): TreeNode {
  const y = x.right!;
  const t2 = y.left;
  y.left = x;
  x.right = t2;
  updateHeight(x);
  updateHeight(y);
  return y;
}

function getBalance(node: TreeNode | null): number {
  return node ? height(node.left) - height(node.right) : 0;
}

interface InsertResult {
  root: TreeNode;
  steps: Array<{
    type: string;
    nodeId: string;
    message: string;
    codeLine: number;
    vars: Record<string, unknown>;
  }>;
}

function avlInsert(
  root: TreeNode | null,
  value: number,
  steps: InsertResult["steps"],
): TreeNode {
  if (!root) {
    const id = newId();
    steps.push({
      type: "insert",
      nodeId: id,
      message: `Created new node with value ${value}`,
      codeLine: 3,
      vars: { value },
    });
    return { id, value, left: null, right: null, height: 1, balanceFactor: 0 };
  }

  steps.push({
    type: "compare",
    nodeId: root.id,
    message: `Comparing ${value} with ${root.value}`,
    codeLine: value < root.value ? 4 : 6,
    vars: {
      value,
      current: root.value,
      direction: value < root.value ? "left" : "right",
    },
  });

  if (value < root.value) {
    root.left = avlInsert(root.left, value, steps);
  } else if (value > root.value) {
    root.right = avlInsert(root.right, value, steps);
  } else {
    return root; // duplicate
  }

  updateHeight(root);
  const balance = getBalance(root);

  if (balance > 1 && value < root.left!.value) {
    steps.push({
      type: "right-rotate",
      nodeId: root.id,
      message: `Left-Left case: right rotate at ${root.value}`,
      codeLine: 14,
      vars: { balance, node: root.value, rotation: "right" },
    });
    return rightRotate(root);
  }

  if (balance < -1 && value > root.right!.value) {
    steps.push({
      type: "left-rotate",
      nodeId: root.id,
      message: `Right-Right case: left rotate at ${root.value}`,
      codeLine: 17,
      vars: { balance, node: root.value, rotation: "left" },
    });
    return leftRotate(root);
  }

  if (balance > 1 && value > root.left!.value) {
    steps.push({
      type: "left-right-rotate",
      nodeId: root.id,
      message: `Left-Right case: left rotate at ${root.left!.value}, then right rotate at ${root.value}`,
      codeLine: 20,
      vars: { balance, node: root.value, rotation: "left-right" },
    });
    root.left = leftRotate(root.left!);
    return rightRotate(root);
  }

  if (balance < -1 && value < root.right!.value) {
    steps.push({
      type: "right-left-rotate",
      nodeId: root.id,
      message: `Right-Left case: right rotate at ${root.right!.value}, then left rotate at ${root.value}`,
      codeLine: 24,
      vars: { balance, node: root.value, rotation: "right-left" },
    });
    root.right = rightRotate(root.right!);
    return leftRotate(root);
  }

  return root;
}

export function* avl(ops: DSOperation[]): AlgorithmGenerator<DSStep> {
  let root: TreeNode | null = null;
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
      message: "Empty AVL tree initialized",
      comparisons: 0,
    },
    description: "Empty AVL tree initialized",
    codeLine: 1,
    variables: { root: null },
  };

  for (const { op, args } of ops) {
    if (op === "insert") {
      const value = args[0] as number;
      const steps: InsertResult["steps"] = [];
      root = avlInsert(root, value, steps);

      for (const step of steps) {
        if (step.type === "compare") comparisons++;
        yield {
          type: step.type,
          data: {
            structure: makeState(root),
            operation: "insert",
            operationArgs: [value],
            highlightNodes: [step.nodeId],
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
      message: "All AVL operations complete",
      comparisons,
    },
    description: "All AVL operations complete",
    variables: { comparisons },
  };
}
