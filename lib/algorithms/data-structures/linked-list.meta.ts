import type { AlgorithmMeta } from "@/types";

export const linkedListMeta: AlgorithmMeta = {
  id: "linked-list",
  name: "Linked List",
  category: "data-structures",
  description:
    "A linear data structure where each node stores a value and a pointer to the next (and optionally previous) node. Supports O(1) insertion/deletion at head/tail and O(n) search.",
  timeComplexity: { best: "O(1)", average: "O(n)", worst: "O(n)" },
  spaceComplexity: "O(n)",
  pseudocode: `class LinkedList:
  head = null; tail = null

  insertHead(value):
    node = new Node(value)
    node.next = head
    if head: head.prev = node  // doubly
    head = node
    if tail == null: tail = node

  insertTail(value):
    node = new Node(value)
    if tail: tail.next = node
    node.prev = tail  // doubly
    tail = node
    if head == null: head = node

  delete(value):
    curr = head
    while curr:
      if curr.value == value:
        remove curr, relink neighbors
        return true
      curr = curr.next
    return false

  search(value):
    curr = head
    while curr:
      if curr.value == value: return curr
      curr = curr.next
    return null`,
  presets: [
    {
      name: "Insert & Delete",
      generator: () => [
        { op: "insertHead", args: [10] },
        { op: "insertTail", args: [20] },
        { op: "insertTail", args: [30] },
        { op: "insertHead", args: [5] },
        { op: "search", args: [20] },
        { op: "delete", args: [20] },
        { op: "insertTail", args: [40] },
        { op: "search", args: [40] },
      ],
      expectedCase: "average" as const,
    },
    {
      name: "Build & Reverse",
      generator: () => [
        { op: "insertTail", args: [1] },
        { op: "insertTail", args: [2] },
        { op: "insertTail", args: [3] },
        { op: "insertTail", args: [4] },
        { op: "insertTail", args: [5] },
        { op: "reverse", args: [] },
      ],
      expectedCase: "average" as const,
    },
    {
      name: "Insert At Index",
      generator: () => [
        { op: "insertTail", args: [10] },
        { op: "insertTail", args: [30] },
        { op: "insertTail", args: [50] },
        { op: "insertAt", args: [1, 20] },
        { op: "insertAt", args: [3, 40] },
      ],
      expectedCase: "average" as const,
    },
  ],
  misconceptions: [
    {
      myth: "Linked lists are always better than arrays for insertion/deletion.",
      reality:
        "While insertion at a known position is O(1), finding that position is O(n). Arrays benefit from cache locality which often makes them faster in practice.",
    },
  ],
  relatedAlgorithms: ["stack", "queue"],
};
