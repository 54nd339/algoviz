import type { AlgorithmGenerator } from "@/types";

import { registerAlgorithm } from "../registry";
import { bstMeta } from "./bst.meta";
import type { BSTState, DSOperation, DSStep, TreeNode } from "./types";

export { bstMeta };
registerAlgorithm(bstMeta);

let nodeId = 0;
function newId(): string {
  return `bst-${nodeId++}`;
}

function cloneTree(node: TreeNode | null): TreeNode | null {
  if (!node) return null;
  return {
    ...node,
    left: cloneTree(node.left),
    right: cloneTree(node.right),
  };
}

function makeState(root: TreeNode | null): BSTState {
  return { kind: "bst", root: cloneTree(root) };
}

function insertNode(
  root: TreeNode | null,
  value: number,
  path: string[],
): { root: TreeNode; path: string[] } {
  if (!root) {
    const id = newId();
    path.push(id);
    return { root: { id, value, left: null, right: null }, path };
  }
  path.push(root.id);
  if (value < root.value) {
    const result = insertNode(root.left, value, path);
    root.left = result.root;
    return { root, path: result.path };
  } else if (value > root.value) {
    const result = insertNode(root.right, value, path);
    root.right = result.root;
    return { root, path: result.path };
  }
  return { root, path };
}

function findMin(node: TreeNode): TreeNode {
  let current = node;
  while (current.left) current = current.left;
  return current;
}

function deleteNode(root: TreeNode | null, value: number): TreeNode | null {
  if (!root) return null;
  if (value < root.value) {
    root.left = deleteNode(root.left, value);
  } else if (value > root.value) {
    root.right = deleteNode(root.right, value);
  } else {
    if (!root.left) return root.right;
    if (!root.right) return root.left;
    const successor = findMin(root.right);
    root.value = successor.value;
    root.id = successor.id;
    root.right = deleteNode(root.right, successor.value);
  }
  return root;
}

function searchPath(
  root: TreeNode | null,
  value: number,
): { path: string[]; found: boolean } {
  const path: string[] = [];
  let current = root;
  while (current) {
    path.push(current.id);
    if (value === current.value) return { path, found: true };
    current = value < current.value ? current.left : current.right;
  }
  return { path, found: false };
}

function* inorderTraversal(
  node: TreeNode | null,
  order: string[],
): Generator<string> {
  if (!node) return;
  yield* inorderTraversal(node.left, order);
  order.push(node.id);
  yield node.id;
  yield* inorderTraversal(node.right, order);
}

function* preorderTraversal(
  node: TreeNode | null,
  order: string[],
): Generator<string> {
  if (!node) return;
  order.push(node.id);
  yield node.id;
  yield* preorderTraversal(node.left, order);
  yield* preorderTraversal(node.right, order);
}

function* postorderTraversal(
  node: TreeNode | null,
  order: string[],
): Generator<string> {
  if (!node) return;
  yield* postorderTraversal(node.left, order);
  yield* postorderTraversal(node.right, order);
  order.push(node.id);
  yield node.id;
}

function getNodeValue(root: TreeNode | null, id: string): number | undefined {
  if (!root) return undefined;
  if (root.id === id) return root.value;
  return getNodeValue(root.left, id) ?? getNodeValue(root.right, id);
}

export function* bst(ops: DSOperation[]): AlgorithmGenerator<DSStep> {
  let root: TreeNode | null = null;
  let comparisons = 0;
  nodeId = 0;

  yield {
    type: "init",
    data: {
      structure: makeState(root),
      operation: "init",
      operationArgs: [],
      highlightNodes: [],
      highlightEdges: [],
      message: "Empty BST initialized",
      comparisons: 0,
    },
    description: "Empty BST initialized",
    codeLine: 1,
    variables: { root: null },
  };

  for (const { op, args } of ops) {
    switch (op) {
      case "insert": {
        const value = args[0] as number;
        const path: string[] = [];
        const result = insertNode(root, value, path);
        root = result.root;

        for (let i = 0; i < path.length - 1; i++) {
          comparisons++;
          const nodeVal = getNodeValue(root, path[i]);
          yield {
            type: "compare",
            data: {
              structure: makeState(root),
              operation: "insert",
              operationArgs: [value],
              highlightNodes: [path[i]],
              highlightEdges: [],
              message: `Comparing ${value} with node ${nodeVal}`,
              comparisons,
            },
            description: `Insert ${value}: comparing with ${nodeVal}`,
            codeLine: value < (nodeVal ?? 0) ? 3 : 5,
            variables: {
              value,
              current: nodeVal,
              direction: value < (nodeVal ?? 0) ? "left" : "right",
            },
          };
        }

        const insertedId = path[path.length - 1];
        yield {
          type: "insert",
          data: {
            structure: makeState(root),
            operation: "insert",
            operationArgs: [value],
            highlightNodes: [insertedId],
            highlightEdges:
              path.length >= 2 ? [[path[path.length - 2], insertedId]] : [],
            message: `Inserted ${value} into BST`,
            comparisons,
          },
          description: `Inserted ${value}`,
          codeLine: 2,
          variables: { value, depth: path.length - 1 },
        };
        break;
      }

      case "delete": {
        const value = args[0] as number;
        const { path, found } = searchPath(root, value);

        for (const nodeIdStr of path) {
          comparisons++;
          const nodeVal = getNodeValue(root, nodeIdStr);
          yield {
            type: "compare",
            data: {
              structure: makeState(root),
              operation: "delete",
              operationArgs: [value],
              highlightNodes: [nodeIdStr],
              highlightEdges: [],
              message:
                found && nodeVal === value
                  ? `Found node ${value} to delete`
                  : `Searching for ${value}: at node ${nodeVal}`,
              comparisons,
            },
            description: `Delete ${value}: at node ${nodeVal}`,
            codeLine: 17,
            variables: { target: value, current: nodeVal },
          };
        }

        if (found) {
          root = deleteNode(root, value);
          yield {
            type: "delete",
            data: {
              structure: makeState(root),
              operation: "delete",
              operationArgs: [value],
              highlightNodes: [],
              highlightEdges: [],
              message: `Deleted ${value} from BST`,
              comparisons,
              returnValue: true,
            },
            description: `Deleted ${value}`,
            codeLine: 22,
            variables: { deleted: value },
          };
        } else {
          yield {
            type: "not-found",
            data: {
              structure: makeState(root),
              operation: "delete",
              operationArgs: [value],
              highlightNodes: [],
              highlightEdges: [],
              message: `Value ${value} not found in BST`,
              comparisons,
              returnValue: false,
            },
            description: `${value} not found — nothing deleted`,
            codeLine: 16,
            variables: { target: value },
          };
        }
        break;
      }

      case "search": {
        const value = args[0] as number;
        const { path, found } = searchPath(root, value);

        for (let i = 0; i < path.length; i++) {
          comparisons++;
          const nodeVal = getNodeValue(root, path[i]);
          const isLast = i === path.length - 1;
          yield {
            type: isLast && found ? "found" : "compare",
            data: {
              structure: makeState(root),
              operation: "search",
              operationArgs: [value],
              highlightNodes: path.slice(0, i + 1),
              highlightEdges: i > 0 ? [[path[i - 1], path[i]]] : [],
              message:
                isLast && found
                  ? `Found ${value}!`
                  : `Searching for ${value}: comparing with ${nodeVal}`,
              comparisons,
              returnValue: isLast && found ? nodeVal : undefined,
            },
            description:
              isLast && found
                ? `Found ${value}`
                : `Search ${value}: at node ${nodeVal}`,
            codeLine: isLast && found ? 11 : 12,
            variables: { target: value, current: nodeVal, depth: i },
          };
        }

        if (!found) {
          yield {
            type: "not-found",
            data: {
              structure: makeState(root),
              operation: "search",
              operationArgs: [value],
              highlightNodes: [],
              highlightEdges: [],
              message: `Value ${value} not found in BST`,
              comparisons,
              returnValue: null,
            },
            description: `${value} not found in BST`,
            codeLine: 10,
            variables: { target: value, found: false },
          };
        }
        break;
      }

      case "inorder":
      case "preorder":
      case "postorder": {
        const visited: string[] = [];
        const traversalFn =
          op === "inorder"
            ? inorderTraversal
            : op === "preorder"
              ? preorderTraversal
              : postorderTraversal;

        for (const nodeIdStr of traversalFn(root, visited)) {
          const nodeVal = getNodeValue(root, nodeIdStr);
          yield {
            type: "traverse",
            data: {
              structure: makeState(root),
              operation: op,
              operationArgs: [],
              highlightNodes: [...visited],
              highlightEdges: [],
              message: `${op} traversal: visiting ${nodeVal}`,
              comparisons,
            },
            description: `${op}: visit ${nodeVal}`,
            variables: {
              traversal: op,
              visited: visited.length,
              current: nodeVal,
            },
          };
        }

        yield {
          type: "traverse-done",
          data: {
            structure: makeState(root),
            operation: op,
            operationArgs: [],
            highlightNodes: [...visited],
            highlightEdges: [],
            message: `${op} traversal complete: [${visited.map((id) => getNodeValue(root, id)).join(", ")}]`,
            comparisons,
          },
          description: `${op} traversal complete`,
          variables: { order: visited.map((id) => getNodeValue(root, id)) },
        };
        break;
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
      message: "All operations complete",
      comparisons,
    },
    description: "All BST operations complete",
    variables: { comparisons },
  };
}
