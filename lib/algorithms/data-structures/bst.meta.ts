import type { AlgorithmMeta } from "@/types";

export const bstMeta: AlgorithmMeta = {
  id: "bst",
  name: "Binary Search Tree",
  category: "data-structures",
  description:
    "A tree where each node's left subtree contains only values less than the node, and the right subtree only values greater. Supports O(log n) average search, insert, and delete.",
  timeComplexity: { best: "O(log n)", average: "O(log n)", worst: "O(n)" },
  spaceComplexity: "O(n)",
  pseudocode: `insert(root, value):
  if root == null: return new Node(value)
  if value < root.value:
    root.left = insert(root.left, value)
  else if value > root.value:
    root.right = insert(root.right, value)
  return root

search(root, value):
  if root == null: return null
  if value == root.value: return root
  if value < root.value:
    return search(root.left, value)
  return search(root.right, value)

delete(root, value):
  if root == null: return null
  if value < root.value:
    root.left = delete(root.left, value)
  else if value > root.value:
    root.right = delete(root.right, value)
  else:
    if no left child: return root.right
    if no right child: return root.left
    successor = minNode(root.right)
    root.value = successor.value
    root.right = delete(root.right, successor.value)
  return root`,
  presets: [
    {
      name: "Insert Sequence",
      generator: () => [
        { op: "insert", args: [50] },
        { op: "insert", args: [30] },
        { op: "insert", args: [70] },
        { op: "insert", args: [20] },
        { op: "insert", args: [40] },
        { op: "insert", args: [60] },
        { op: "insert", args: [80] },
        { op: "search", args: [40] },
      ],
      expectedCase: "average" as const,
    },
    {
      name: "Insert & Delete",
      generator: () => [
        { op: "insert", args: [50] },
        { op: "insert", args: [30] },
        { op: "insert", args: [70] },
        { op: "insert", args: [20] },
        { op: "insert", args: [40] },
        { op: "delete", args: [30] },
        { op: "insert", args: [35] },
        { op: "search", args: [35] },
      ],
      expectedCase: "average" as const,
    },
    {
      name: "Degenerate (Worst Case)",
      generator: () => [
        { op: "insert", args: [10] },
        { op: "insert", args: [20] },
        { op: "insert", args: [30] },
        { op: "insert", args: [40] },
        { op: "insert", args: [50] },
        { op: "search", args: [50] },
      ],
      expectedCase: "worst" as const,
    },
    {
      name: "Traversals",
      generator: () => [
        { op: "insert", args: [50] },
        { op: "insert", args: [30] },
        { op: "insert", args: [70] },
        { op: "insert", args: [20] },
        { op: "insert", args: [40] },
        { op: "inorder", args: [] },
      ],
      expectedCase: "average" as const,
    },
  ],
  misconceptions: [
    {
      myth: "BST operations are always O(log n).",
      reality:
        "A degenerate BST (all nodes on one side) degrades to O(n). Self-balancing trees like AVL and Red-Black guarantee O(log n).",
    },
  ],
  relatedAlgorithms: ["avl", "red-black", "heap"],
};
