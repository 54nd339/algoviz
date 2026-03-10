import type {
  AVLState,
  BSTState,
  DSStep,
  NodeVariant,
  RBTreeState,
  TreeNode,
} from "./types";

/**
 * Converts a heap array (0-indexed) to a binary tree structure for visualization.
 */
export function heapArrayToTree(arr: number[], i: number): TreeNode | null {
  if (i >= arr.length) return null;
  return {
    id: String(i),
    value: arr[i],
    left: heapArrayToTree(arr, 2 * i + 1),
    right: heapArrayToTree(arr, 2 * i + 2),
  };
}

/**
 * Returns the tree node variant for the given algorithm ID.
 */
export function getTreeVariant(algoId: string): NodeVariant {
  if (algoId === "red-black") return "colored-circle";
  if (algoId === "b-tree") return "wide-rect";
  if (algoId === "trie") return "small-char";
  return "circle";
}

/**
 * Extracts the tree root from a DS structure (BST, AVL, or Red-Black).
 */
export function getTreeRoot(structure: DSStep["structure"]): TreeNode | null {
  switch (structure.kind) {
    case "bst":
    case "avl":
    case "red-black":
      return (structure as BSTState | AVLState | RBTreeState).root;
    default:
      return null;
  }
}
