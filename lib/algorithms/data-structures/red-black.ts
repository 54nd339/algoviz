import type { AlgorithmGenerator } from "@/types";

import { registerAlgorithm } from "../registry";
import { redBlackMeta } from "./red-black.meta";
import type { DSOperation, DSStep, RBTreeState, TreeNode } from "./types";

export { redBlackMeta };
registerAlgorithm(redBlackMeta);

let nid = 0;
function newId(): string {
  return `rb-${nid++}`;
}

interface RBNode {
  id: string;
  value: number;
  color: "red" | "black";
  left: RBNode | null;
  right: RBNode | null;
  parent: RBNode | null;
}

const NIL: RBNode = {
  id: "nil",
  value: 0,
  color: "black",
  left: null,
  right: null,
  parent: null,
};

function toTreeNode(node: RBNode | null): TreeNode | null {
  if (!node || node === NIL) return null;
  return {
    id: node.id,
    value: node.value,
    color: node.color,
    left: toTreeNode(node.left),
    right: toTreeNode(node.right),
  };
}

function makeState(root: RBNode | null): RBTreeState {
  return { kind: "red-black", root: toTreeNode(root) };
}

interface StepInfo {
  type: string;
  nodeId: string;
  message: string;
  codeLine: number;
  vars: Record<string, unknown>;
  highlights?: string[];
}

function leftRotate(root: RBNode, x: RBNode, steps: StepInfo[]): RBNode {
  const y = x.right!;
  x.right = y.left;
  if (y.left && y.left !== NIL) y.left.parent = x;
  y.parent = x.parent;
  if (!x.parent) {
    root = y;
  } else if (x === x.parent.left) {
    x.parent.left = y;
  } else {
    x.parent.right = y;
  }
  y.left = x;
  x.parent = y;

  steps.push({
    type: "left-rotate",
    nodeId: x.id,
    message: `Left rotate at ${x.value}`,
    codeLine: 10,
    vars: { pivot: x.value, newParent: y.value },
    highlights: [x.id, y.id],
  });

  return root;
}

function rightRotate(root: RBNode, y: RBNode, steps: StepInfo[]): RBNode {
  const x = y.left!;
  y.left = x.right;
  if (x.right && x.right !== NIL) x.right.parent = y;
  x.parent = y.parent;
  if (!y.parent) {
    root = x;
  } else if (y === y.parent.left) {
    y.parent.left = x;
  } else {
    y.parent.right = x;
  }
  x.right = y;
  y.parent = x;

  steps.push({
    type: "right-rotate",
    nodeId: y.id,
    message: `Right rotate at ${y.value}`,
    codeLine: 15,
    vars: { pivot: y.value, newParent: x.value },
    highlights: [x.id, y.id],
  });

  return root;
}

function insertFixup(root: RBNode, z: RBNode, steps: StepInfo[]): RBNode {
  while (z.parent && z.parent.color === "red") {
    if (z.parent === z.parent.parent?.left) {
      const uncle = z.parent.parent?.right;
      if (uncle && uncle.color === "red") {
        // Case 1: Uncle is red — recolor
        z.parent.color = "black";
        uncle.color = "black";
        z.parent.parent!.color = "red";
        steps.push({
          type: "recolor",
          nodeId: z.id,
          message: `Case 1: Uncle ${uncle.value} is red — recolor parent ${z.parent.value} & uncle black, grandparent ${z.parent.parent!.value} red`,
          codeLine: 6,
          vars: {
            case: 1,
            parent: z.parent.value,
            uncle: uncle.value,
            grandparent: z.parent.parent!.value,
          },
          highlights: [z.parent.id, uncle.id, z.parent.parent!.id],
        });
        z = z.parent.parent!;
      } else {
        if (z === z.parent.right) {
          // Case 2: Node is right child — left rotate parent
          z = z.parent;
          root = leftRotate(root, z, steps);
        }
        // Case 3: Node is left child — recolor and right rotate grandparent
        z.parent!.color = "black";
        z.parent!.parent!.color = "red";
        steps.push({
          type: "recolor",
          nodeId: z.id,
          message: `Case 3: Recolor parent ${z.parent!.value} black, grandparent ${z.parent!.parent!.value} red`,
          codeLine: 13,
          vars: {
            case: 3,
            parent: z.parent!.value,
            grandparent: z.parent!.parent!.value,
          },
          highlights: [z.parent!.id, z.parent!.parent!.id],
        });
        root = rightRotate(root, z.parent!.parent!, steps);
      }
    } else {
      // Mirror: parent is right child of grandparent
      const uncle = z.parent.parent?.left;
      if (uncle && uncle.color === "red") {
        z.parent.color = "black";
        uncle.color = "black";
        z.parent.parent!.color = "red";
        steps.push({
          type: "recolor",
          nodeId: z.id,
          message: `Case 1 (mirror): Uncle ${uncle.value} is red — recolor`,
          codeLine: 6,
          vars: {
            case: 1,
            parent: z.parent.value,
            uncle: uncle.value,
            grandparent: z.parent.parent!.value,
          },
          highlights: [z.parent.id, uncle.id, z.parent.parent!.id],
        });
        z = z.parent.parent!;
      } else {
        if (z === z.parent.left) {
          z = z.parent;
          root = rightRotate(root, z, steps);
        }
        z.parent!.color = "black";
        z.parent!.parent!.color = "red";
        steps.push({
          type: "recolor",
          nodeId: z.id,
          message: `Case 3 (mirror): Recolor and left rotate at grandparent ${z.parent!.parent!.value}`,
          codeLine: 13,
          vars: {
            case: 3,
            parent: z.parent!.value,
            grandparent: z.parent!.parent!.value,
          },
          highlights: [z.parent!.id, z.parent!.parent!.id],
        });
        root = leftRotate(root, z.parent!.parent!, steps);
      }
    }
  }
  root.color = "black";
  return root;
}

function rbInsert(
  root: RBNode | null,
  value: number,
  steps: StepInfo[],
): RBNode {
  const z: RBNode = {
    id: newId(),
    value,
    color: "red",
    left: NIL,
    right: NIL,
    parent: null,
  };

  let y: RBNode | null = null;
  let x = root;

  while (x && x !== NIL) {
    y = x;
    steps.push({
      type: "compare",
      nodeId: x.id,
      message: `Comparing ${value} with ${x.value}`,
      codeLine: value < x.value ? 4 : 6,
      vars: { value, current: x.value },
    });
    x = value < x.value ? x.left : x.right;
  }

  z.parent = y;
  if (!y) {
    root = z;
  } else if (value < y.value) {
    y.left = z;
  } else {
    y.right = z;
  }

  steps.push({
    type: "insert",
    nodeId: z.id,
    message: `Inserted ${value} as red node`,
    codeLine: 2,
    vars: { value, color: "red" },
    highlights: [z.id],
  });

  root = insertFixup(root!, z, steps);
  return root;
}

export function* redBlack(ops: DSOperation[]): AlgorithmGenerator<DSStep> {
  let root: RBNode | null = null;
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
      message: "Empty Red-Black tree initialized",
      comparisons: 0,
    },
    description: "Empty Red-Black tree initialized",
    codeLine: 1,
    variables: { root: null },
  };

  for (const { op, args } of ops) {
    if (op === "insert") {
      const value = args[0] as number;
      const steps: StepInfo[] = [];
      root = rbInsert(root, value, steps);

      for (const step of steps) {
        if (step.type === "compare") comparisons++;
        yield {
          type: step.type,
          data: {
            structure: makeState(root),
            operation: "insert",
            operationArgs: [value],
            highlightNodes: step.highlights ?? [step.nodeId],
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
      message: "All Red-Black tree operations complete",
      comparisons,
    },
    description: "All Red-Black tree operations complete",
    variables: { comparisons },
  };
}
