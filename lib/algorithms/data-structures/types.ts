// ── Operations ──────────────────────────────────────────────────────────────

export interface DSOperation {
  op: string;
  args: unknown[];
}

// ── Node / entry primitives ─────────────────────────────────────────────────

export interface LLNode {
  id: string;
  value: number;
  next: string | null;
  prev?: string | null; // doubly-linked only
}

export interface TreeNode {
  id: string;
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
  height?: number; // AVL
  balanceFactor?: number; // AVL
  color?: "red" | "black"; // RB-tree
  parent?: string | null;
}

export interface BTreeNode {
  id: string;
  keys: number[];
  children: BTreeNode[];
}

export interface TrieNode {
  id: string;
  char: string;
  children: Record<string, TrieNode>;
  isEnd: boolean;
}

export interface HashEntry {
  key: string;
  value: string;
  next?: HashEntry | null; // chaining
}

export interface HuffmanNode {
  id: string;
  char: string | null;
  freq: number;
  left: HuffmanNode | null;
  right: HuffmanNode | null;
  code?: string;
}

// ── Per-structure state shapes ──────────────────────────────────────────────

export interface StackState {
  kind: "stack";
  items: number[];
  topIndex: number;
}

export interface QueueState {
  kind: "queue";
  items: number[];
  frontIndex: number;
  rearIndex: number;
}

export interface LinkedListState {
  kind: "linked-list";
  nodes: LLNode[];
  head: string | null;
  tail: string | null;
  doubly: boolean;
}

export interface BSTState {
  kind: "bst";
  root: TreeNode | null;
}

export interface AVLState {
  kind: "avl";
  root: TreeNode | null;
}

export interface RBTreeState {
  kind: "red-black";
  root: TreeNode | null;
}

export interface HeapState {
  kind: "heap";
  array: number[];
  isMin: boolean;
}

export interface HashTableState {
  kind: "hash-table";
  buckets: (HashEntry | null)[];
  size: number;
  capacity: number;
  loadFactor: number;
  mode: "chaining" | "open-addressing";
}

export interface TrieState {
  kind: "trie";
  root: TrieNode;
}

export interface BTreeState {
  kind: "b-tree";
  root: BTreeNode | null;
  order: number;
}

export interface UnionFindState {
  kind: "union-find";
  parent: number[];
  rank: number[];
  count: number; // number of disjoint sets
}

export interface HuffmanState {
  kind: "huffman";
  root: HuffmanNode | null;
  codes: Record<string, string>;
  encoded: string;
  forest: HuffmanNode[]; // intermediate state during build
}

// ── Discriminated union of all DS states ────────────────────────────────────

export type DSStructureState =
  | StackState
  | QueueState
  | LinkedListState
  | BSTState
  | AVLState
  | RBTreeState
  | HeapState
  | HashTableState
  | TrieState
  | BTreeState
  | UnionFindState
  | HuffmanState;

// ── Step data ───────────────────────────────────────────────────────────────

export interface DSStep {
  structure: DSStructureState;
  operation: string;
  operationArgs: unknown[];
  highlightNodes: string[];
  highlightEdges: [string, string][];
  message: string;
  comparisons: number;
  returnValue?: unknown;
}

// ── Node variant for tree renderer ──────────────────────────────────────────

export type NodeVariant =
  | "circle"
  | "colored-circle"
  | "wide-rect"
  | "small-char";
