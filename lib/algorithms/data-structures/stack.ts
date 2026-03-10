import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import type { DSOperation, DSStep, StackState } from "./types";

export const stackMeta: AlgorithmMeta = {
  id: "stack",
  name: "Stack",
  category: "data-structures",
  description:
    "A Last-In-First-Out (LIFO) data structure. Elements are pushed onto and popped from the top. Supports push, pop, and peek operations in O(1) time.",
  timeComplexity: { best: "O(1)", average: "O(1)", worst: "O(1)" },
  spaceComplexity: "O(n)",
  pseudocode: `class Stack:
  items = []

  push(value):
    items.append(value)

  pop():
    if isEmpty(): throw "Underflow"
    return items.removeLast()

  peek():
    if isEmpty(): throw "Underflow"
    return items[items.length - 1]

  isEmpty():
    return items.length == 0`,
  presets: [
    {
      name: "Push & Pop",
      generator: () => [
        { op: "push", args: [10] },
        { op: "push", args: [20] },
        { op: "push", args: [30] },
        { op: "pop", args: [] },
        { op: "push", args: [40] },
        { op: "peek", args: [] },
        { op: "pop", args: [] },
        { op: "pop", args: [] },
      ],
      expectedCase: "average" as const,
    },
    {
      name: "Fill & Drain",
      generator: () => [
        { op: "push", args: [5] },
        { op: "push", args: [15] },
        { op: "push", args: [25] },
        { op: "push", args: [35] },
        { op: "push", args: [45] },
        { op: "pop", args: [] },
        { op: "pop", args: [] },
        { op: "pop", args: [] },
        { op: "pop", args: [] },
        { op: "pop", args: [] },
      ],
      expectedCase: "average" as const,
    },
    {
      name: "Underflow Test",
      generator: () => [
        { op: "push", args: [42] },
        { op: "pop", args: [] },
        { op: "pop", args: [] },
      ],
      expectedCase: "worst" as const,
    },
  ],
  misconceptions: [
    {
      myth: "A stack can only hold a fixed number of elements.",
      reality:
        "Array-backed stacks can dynamically resize. Linked-list stacks have no inherent capacity limit beyond available memory.",
    },
  ],
  relatedAlgorithms: ["queue", "linked-list"],
};

registerAlgorithm(stackMeta);

function makeState(items: number[]): StackState {
  return { kind: "stack", items: [...items], topIndex: items.length - 1 };
}

export function* stack(ops: DSOperation[]): AlgorithmGenerator<DSStep> {
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
      message: "Empty stack initialized",
      comparisons: 0,
    },
    description: "Empty stack initialized",
    codeLine: 1,
    variables: { size: 0 },
  };

  for (const { op, args } of ops) {
    switch (op) {
      case "push": {
        const value = args[0] as number;
        items.push(value);
        yield {
          type: "push",
          data: {
            structure: makeState(items),
            operation: "push",
            operationArgs: [value],
            highlightNodes: [String(items.length - 1)],
            highlightEdges: [],
            message: `Pushed ${value} onto the stack`,
            comparisons,
            returnValue: undefined,
          },
          description: `Push ${value} → top of stack`,
          codeLine: 4,
          variables: { value, size: items.length, top: value },
        };
        break;
      }

      case "pop": {
        if (items.length === 0) {
          yield {
            type: "error",
            data: {
              structure: makeState(items),
              operation: "pop",
              operationArgs: [],
              highlightNodes: [],
              highlightEdges: [],
              message: "Error: Stack underflow — cannot pop from empty stack",
              comparisons,
              returnValue: undefined,
            },
            description: "Stack underflow error",
            codeLine: 7,
            variables: { size: 0 },
          };
          break;
        }
        const topIdx = items.length - 1;
        yield {
          type: "pop-highlight",
          data: {
            structure: makeState(items),
            operation: "pop",
            operationArgs: [],
            highlightNodes: [String(topIdx)],
            highlightEdges: [],
            message: `Removing top element ${items[topIdx]}`,
            comparisons,
          },
          description: `Highlighting top element ${items[topIdx]} for removal`,
          codeLine: 8,
          variables: { size: items.length, top: items[topIdx] },
        };
        const removed = items.pop()!;
        yield {
          type: "pop",
          data: {
            structure: makeState(items),
            operation: "pop",
            operationArgs: [],
            highlightNodes: [],
            highlightEdges: [],
            message: `Popped ${removed} from the stack`,
            comparisons,
            returnValue: removed,
          },
          description: `Pop → ${removed}`,
          codeLine: 8,
          variables: {
            removed,
            size: items.length,
            top: items.length > 0 ? items[items.length - 1] : "empty",
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
              message: "Error: Stack is empty — nothing to peek",
              comparisons,
              returnValue: undefined,
            },
            description: "Peek on empty stack",
            codeLine: 11,
            variables: { size: 0 },
          };
          break;
        }
        const topVal = items[items.length - 1];
        yield {
          type: "peek",
          data: {
            structure: makeState(items),
            operation: "peek",
            operationArgs: [],
            highlightNodes: [String(items.length - 1)],
            highlightEdges: [],
            message: `Peek → ${topVal} (stack unchanged)`,
            comparisons,
            returnValue: topVal,
          },
          description: `Peek → ${topVal}`,
          codeLine: 12,
          variables: { top: topVal, size: items.length },
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
      message: `All operations complete. Stack has ${items.length} element(s).`,
      comparisons,
    },
    description: `Operations complete — ${items.length} element(s) remain`,
    variables: { size: items.length },
  };
}
