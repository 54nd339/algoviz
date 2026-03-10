import type { AlgorithmMeta } from "@/types";

export const redBlackMeta: AlgorithmMeta = {
  id: "red-black",
  name: "Red-Black Tree",
  category: "data-structures",
  description:
    "A self-balancing BST with one extra bit per node for color (red or black). Balancing rules ensure the tree remains approximately balanced, guaranteeing O(log n) operations with fewer rotations than AVL.",
  timeComplexity: { best: "O(log n)", average: "O(log n)", worst: "O(log n)" },
  spaceComplexity: "O(n)",
  pseudocode: `insert(root, value):
  node = BST insert (color RED)
  fixup(node):
    while node.parent is RED:
      if parent is left child:
        uncle = grandparent.right
        Case 1: uncle is RED
          recolor parent & uncle BLACK
          recolor grandparent RED
          node = grandparent
        Case 2: node is right child
          left-rotate(parent)
          node = parent
        Case 3: node is left child
          recolor parent BLACK
          recolor grandparent RED
          right-rotate(grandparent)
      else: mirror cases
    root.color = BLACK`,
  presets: [
    {
      name: "Insert Sequence",
      generator: () => [
        { op: "insert", args: [10] },
        { op: "insert", args: [20] },
        { op: "insert", args: [30] },
        { op: "insert", args: [15] },
        { op: "insert", args: [25] },
        { op: "insert", args: [5] },
        { op: "insert", args: [1] },
      ],
      expectedCase: "average" as const,
    },
    {
      name: "Sequential (Force Rebalance)",
      generator: () => [
        { op: "insert", args: [1] },
        { op: "insert", args: [2] },
        { op: "insert", args: [3] },
        { op: "insert", args: [4] },
        { op: "insert", args: [5] },
        { op: "insert", args: [6] },
        { op: "insert", args: [7] },
      ],
      expectedCase: "worst" as const,
    },
  ],
  misconceptions: [
    {
      myth: "Red-Black trees are harder to implement than AVL trees.",
      reality:
        "While the insertion fixup has more cases, deletion in AVL trees is actually more complex. Red-Black trees require at most 2 rotations per insert vs up to O(log n) for AVL.",
    },
  ],
  relatedAlgorithms: ["bst", "avl"],
};
