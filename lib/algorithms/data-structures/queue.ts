import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import type { DSOperation, DSStep, QueueState } from "./types";

export const queueMeta: AlgorithmMeta = {
  id: "queue",
  name: "Queue",
  category: "data-structures",
  description:
    "A First-In-First-Out (FIFO) data structure. Elements are enqueued at the rear and dequeued from the front. All operations run in O(1) amortized time.",
  timeComplexity: { best: "O(1)", average: "O(1)", worst: "O(1)" },
  spaceComplexity: "O(n)",
  pseudocode: `class Queue:
  items = []

  enqueue(value):
    items.append(value)

  dequeue():
    if isEmpty(): throw "Underflow"
    return items.removeFirst()

  peek():
    if isEmpty(): throw "Underflow"
    return items[0]

  isEmpty():
    return items.length == 0`,
  presets: [
    {
      name: "Enqueue & Dequeue",
      generator: () => [
        { op: "enqueue", args: [10] },
        { op: "enqueue", args: [20] },
        { op: "enqueue", args: [30] },
        { op: "dequeue", args: [] },
        { op: "enqueue", args: [40] },
        { op: "peek", args: [] },
        { op: "dequeue", args: [] },
        { op: "dequeue", args: [] },
      ],
      expectedCase: "average" as const,
    },
    {
      name: "FIFO Order",
      generator: () => [
        { op: "enqueue", args: [1] },
        { op: "enqueue", args: [2] },
        { op: "enqueue", args: [3] },
        { op: "enqueue", args: [4] },
        { op: "enqueue", args: [5] },
        { op: "dequeue", args: [] },
        { op: "dequeue", args: [] },
        { op: "dequeue", args: [] },
        { op: "dequeue", args: [] },
        { op: "dequeue", args: [] },
      ],
      expectedCase: "average" as const,
    },
  ],
  misconceptions: [
    {
      myth: "Dequeue from an array-backed queue is always O(n) because of shifting.",
      reality:
        "A circular buffer or two-pointer approach achieves O(1) dequeue without shifting elements.",
    },
  ],
  relatedAlgorithms: ["stack", "linked-list"],
};

registerAlgorithm(queueMeta);

function makeState(items: number[]): QueueState {
  return {
    kind: "queue",
    items: [...items],
    frontIndex: 0,
    rearIndex: Math.max(0, items.length - 1),
  };
}

export function* queue(ops: DSOperation[]): AlgorithmGenerator<DSStep> {
  const items: number[] = [];
  const comparisons = 0;

  yield {
    type: "init",
    data: {
      structure: makeState(items),
      operation: "init",
      operationArgs: [],
      highlightNodes: [],
      highlightEdges: [],
      message: "Empty queue initialized",
      comparisons: 0,
    },
    description: "Empty queue initialized",
    codeLine: 1,
    variables: { size: 0 },
  };

  for (const { op, args } of ops) {
    switch (op) {
      case "enqueue": {
        const value = args[0] as number;
        items.push(value);
        yield {
          type: "enqueue",
          data: {
            structure: makeState(items),
            operation: "enqueue",
            operationArgs: [value],
            highlightNodes: [String(items.length - 1)],
            highlightEdges: [],
            message: `Enqueued ${value} at the rear`,
            comparisons,
            returnValue: undefined,
          },
          description: `Enqueue ${value} → rear`,
          codeLine: 4,
          variables: {
            value,
            size: items.length,
            front: items[0],
            rear: value,
          },
        };
        break;
      }

      case "dequeue": {
        if (items.length === 0) {
          yield {
            type: "error",
            data: {
              structure: makeState(items),
              operation: "dequeue",
              operationArgs: [],
              highlightNodes: [],
              highlightEdges: [],
              message:
                "Error: Queue underflow — cannot dequeue from empty queue",
              comparisons,
              returnValue: undefined,
            },
            description: "Queue underflow error",
            codeLine: 7,
            variables: { size: 0 },
          };
          break;
        }
        yield {
          type: "dequeue-highlight",
          data: {
            structure: makeState(items),
            operation: "dequeue",
            operationArgs: [],
            highlightNodes: ["0"],
            highlightEdges: [],
            message: `Removing front element ${items[0]}`,
            comparisons,
          },
          description: `Highlighting front element ${items[0]} for removal`,
          codeLine: 8,
          variables: { size: items.length, front: items[0] },
        };
        const removed = items.shift()!;
        yield {
          type: "dequeue",
          data: {
            structure: makeState(items),
            operation: "dequeue",
            operationArgs: [],
            highlightNodes: [],
            highlightEdges: [],
            message: `Dequeued ${removed} from the front`,
            comparisons,
            returnValue: removed,
          },
          description: `Dequeue → ${removed}`,
          codeLine: 8,
          variables: {
            removed,
            size: items.length,
            front: items.length > 0 ? items[0] : "empty",
          },
        };
        break;
      }

      case "peek": {
        if (items.length === 0) {
          yield {
            type: "error",
            data: {
              structure: makeState(items),
              operation: "peek",
              operationArgs: [],
              highlightNodes: [],
              highlightEdges: [],
              message: "Error: Queue is empty — nothing to peek",
              comparisons,
              returnValue: undefined,
            },
            description: "Peek on empty queue",
            codeLine: 11,
            variables: { size: 0 },
          };
          break;
        }
        const frontVal = items[0];
        yield {
          type: "peek",
          data: {
            structure: makeState(items),
            operation: "peek",
            operationArgs: [],
            highlightNodes: ["0"],
            highlightEdges: [],
            message: `Peek → ${frontVal} (queue unchanged)`,
            comparisons,
            returnValue: frontVal,
          },
          description: `Peek → ${frontVal}`,
          codeLine: 12,
          variables: { front: frontVal, size: items.length },
        };
        break;
      }
    }
  }

  yield {
    type: "done",
    data: {
      structure: makeState(items),
      operation: "done",
      operationArgs: [],
      highlightNodes: [],
      highlightEdges: [],
      message: `All operations complete. Queue has ${items.length} element(s).`,
      comparisons,
    },
    description: `Operations complete — ${items.length} element(s) remain`,
    variables: { size: items.length },
  };
}
