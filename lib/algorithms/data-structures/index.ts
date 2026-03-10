export { avl, avlMeta } from "./avl";
export { bTree, bTreeMeta } from "./b-tree";
export { bst, bstMeta } from "./bst";
export { hashTable, hashTableMeta } from "./hash-table";
export { heap, heapMeta } from "./heap";
export { huffman, huffmanMeta } from "./huffman";
export { linkedList, linkedListMeta } from "./linked-list";
export { parseCommand } from "./parse-command";
export { queue, queueMeta } from "./queue";
export { redBlack, redBlackMeta } from "./red-black";
export { stack, stackMeta } from "./stack";
export { trie, trieMeta } from "./trie";
export type {
  AVLState,
  BSTState,
  BTreeNode,
  BTreeState,
  DSOperation,
  DSStep,
  DSStructureState,
  HashEntry,
  HashTableState,
  HeapState,
  HuffmanNode,
  HuffmanState,
  LinkedListState,
  LLNode,
  NodeVariant,
  QueueState,
  RBTreeState,
  StackState,
  TreeNode,
  TrieNode,
  TrieState,
  UnionFindState,
} from "./types";
export { unionFind, unionFindMeta } from "./union-find";

import type { AlgorithmStep } from "@/types";

import { avl } from "./avl";
import { bTree } from "./b-tree";
import { bst } from "./bst";
import { hashTable } from "./hash-table";
import { heap } from "./heap";
import { huffman } from "./huffman";
import { linkedList } from "./linked-list";
import { queue } from "./queue";
import { redBlack } from "./red-black";
import { stack } from "./stack";
import { trie } from "./trie";
import type { DSOperation, DSStep } from "./types";
import { unionFind } from "./union-find";

export const DS_GENERATORS: Record<
  string,
  (input: unknown) => Generator<AlgorithmStep<DSStep>, void, undefined>
> = {
  stack: (input) => stack(input as DSOperation[]),
  queue: (input) => queue(input as DSOperation[]),
  "linked-list": (input) =>
    linkedList(input as { ops: DSOperation[]; doubly?: boolean }),
  bst: (input) => bst(input as DSOperation[]),
  avl: (input) => avl(input as DSOperation[]),
  "red-black": (input) => redBlack(input as DSOperation[]),
  heap: (input) => heap(input as { ops: DSOperation[]; isMin?: boolean }),
  "hash-table": (input) =>
    hashTable(
      input as { ops: DSOperation[]; mode?: "chaining" | "open-addressing" },
    ),
  trie: (input) => trie(input as DSOperation[]),
  "b-tree": (input) => bTree(input as DSOperation[]),
  "union-find": (input) => unionFind(input as DSOperation[]),
  huffman: (input) => huffman(input as DSOperation[]),
};

/**
 * Maps algorithm IDs to their renderer category for the page to select
 * the appropriate visualization component.
 */
export const DS_RENDERER_MAP: Record<
  string,
  "linear" | "tree" | "hash" | "union-find"
> = {
  stack: "linear",
  queue: "linear",
  "linked-list": "linear",
  bst: "tree",
  avl: "tree",
  "red-black": "tree",
  heap: "tree",
  "b-tree": "tree",
  trie: "tree",
  huffman: "tree",
  "hash-table": "hash",
  "union-find": "union-find",
};

/**
 * Valid REPL commands per data structure.
 */
export const DS_COMMANDS: Record<string, string[]> = {
  stack: ["push(value)", "pop()", "peek()"],
  queue: ["enqueue(value)", "dequeue()", "peek()"],
  "linked-list": [
    "insertHead(value)",
    "insertTail(value)",
    "insertAt(index, value)",
    "delete(value)",
    "search(value)",
    "reverse()",
  ],
  bst: [
    "insert(value)",
    "delete(value)",
    "search(value)",
    "inorder()",
    "preorder()",
    "postorder()",
  ],
  avl: ["insert(value)"],
  "red-black": ["insert(value)"],
  heap: ["insert(value)", "extract()"],
  "hash-table": ["put(key, value)", "get(key)", "delete(key)"],
  trie: ["insert(word)", "search(word)", "prefix(word)"],
  "b-tree": ["insert(value)"],
  "union-find": ["make(n)", "union(x, y)", "find(x)"],
  huffman: ["build(text)", "build-freq({char: freq, ...})"],
};
