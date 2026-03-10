import type { AlgorithmGenerator } from "@/types";

import { registerAlgorithm } from "../registry";
import { heapMeta } from "./heap.meta";
import type { DSOperation, DSStep, HeapState } from "./types";

export { heapMeta };
registerAlgorithm(heapMeta);

function makeState(array: number[], isMin: boolean): HeapState {
  return { kind: "heap", array: [...array], isMin };
}

function parentIdx(i: number): number {
  return Math.floor((i - 1) / 2);
}

function leftChild(i: number): number {
  return 2 * i + 1;
}

function rightChild(i: number): number {
  return 2 * i + 2;
}

export function* heap(
  input: { ops: DSOperation[]; isMin?: boolean } | DSOperation[],
): AlgorithmGenerator<DSStep> {
  const ops = Array.isArray(input) ? input : (input?.ops ?? []);
  const isMin = Array.isArray(input) ? true : (input?.isMin ?? true);
  const arr: number[] = [];
  let comparisons = 0;

  const cmp = (a: number, b: number) => (isMin ? a < b : a > b);
  const heapType = isMin ? "min" : "max";

  yield {
    type: "init",
    data: {
      structure: makeState(arr, isMin),
      operation: "init",
      operationArgs: [],
      highlightNodes: [],
      highlightEdges: [],
      message: `Empty ${heapType}-heap initialized`,
      comparisons: 0,
    },
    description: `Empty ${heapType}-heap initialized`,
    codeLine: 1,
    variables: { size: 0, type: heapType },
  };

  for (const { op, args } of ops) {
    switch (op) {
      case "insert": {
        const value = args[0] as number;
        arr.push(value);
        let i = arr.length - 1;

        yield {
          type: "insert",
          data: {
            structure: makeState(arr, isMin),
            operation: "insert",
            operationArgs: [value],
            highlightNodes: [String(i)],
            highlightEdges: [],
            message: `Appended ${value} at index ${i}`,
            comparisons,
          },
          description: `Insert ${value} at end`,
          codeLine: 2,
          variables: { value, index: i, size: arr.length },
        };

        // Bubble up
        while (i > 0) {
          const pi = parentIdx(i);
          comparisons++;

          yield {
            type: "compare",
            data: {
              structure: makeState(arr, isMin),
              operation: "insert",
              operationArgs: [value],
              highlightNodes: [String(i), String(pi)],
              highlightEdges: [[String(pi), String(i)]],
              message: `Bubble up: comparing ${arr[i]} with parent ${arr[pi]}`,
              comparisons,
            },
            description: `Compare ${arr[i]} with parent ${arr[pi]}`,
            codeLine: 8,
            variables: {
              child: arr[i],
              parent: arr[pi],
              childIdx: i,
              parentIdx: pi,
            },
          };

          if (cmp(arr[i], arr[pi])) {
            [arr[i], arr[pi]] = [arr[pi], arr[i]];
            yield {
              type: "swap",
              data: {
                structure: makeState(arr, isMin),
                operation: "insert",
                operationArgs: [value],
                highlightNodes: [String(pi)],
                highlightEdges: [],
                message: `Swapped ${arr[pi]} up to index ${pi}`,
                comparisons,
              },
              description: `Swap up to index ${pi}`,
              codeLine: 9,
              variables: { swapped: [arr[i], arr[pi]], newIndex: pi },
            };
            i = pi;
          } else {
            break;
          }
        }
        break;
      }

      case "extract": {
        if (arr.length === 0) {
          yield {
            type: "error",
            data: {
              structure: makeState(arr, isMin),
              operation: "extract",
              operationArgs: [],
              highlightNodes: [],
              highlightEdges: [],
              message: `Error: Heap is empty — cannot extract`,
              comparisons,
              returnValue: undefined,
            },
            description: "Heap empty error",
            codeLine: 13,
            variables: { size: 0 },
          };
          break;
        }

        const extracted = arr[0];
        yield {
          type: "extract-highlight",
          data: {
            structure: makeState(arr, isMin),
            operation: "extract",
            operationArgs: [],
            highlightNodes: ["0"],
            highlightEdges: [],
            message: `Extracting ${heapType} value: ${extracted}`,
            comparisons,
          },
          description: `Extract ${heapType}: ${extracted}`,
          codeLine: 14,
          variables: { extracted, size: arr.length },
        };

        if (arr.length === 1) {
          arr.pop();
          yield {
            type: "extract",
            data: {
              structure: makeState(arr, isMin),
              operation: "extract",
              operationArgs: [],
              highlightNodes: [],
              highlightEdges: [],
              message: `Extracted ${extracted}. Heap is now empty.`,
              comparisons,
              returnValue: extracted,
            },
            description: `Extracted ${extracted}`,
            codeLine: 15,
            variables: { extracted, size: 0 },
          };
          break;
        }

        arr[0] = arr.pop()!;
        yield {
          type: "move-last",
          data: {
            structure: makeState(arr, isMin),
            operation: "extract",
            operationArgs: [],
            highlightNodes: ["0"],
            highlightEdges: [],
            message: `Moved last element ${arr[0]} to root`,
            comparisons,
          },
          description: `Move ${arr[0]} to root`,
          codeLine: 15,
          variables: { newRoot: arr[0], size: arr.length },
        };

        // Bubble down
        let i = 0;
        const n = arr.length;
        while (true) {
          let target = i;
          const l = leftChild(i);
          const r = rightChild(i);

          if (l < n) {
            comparisons++;
            if (cmp(arr[l], arr[target])) target = l;
          }
          if (r < n) {
            comparisons++;
            if (cmp(arr[r], arr[target])) target = r;
          }

          yield {
            type: "compare",
            data: {
              structure: makeState(arr, isMin),
              operation: "extract",
              operationArgs: [],
              highlightNodes: [
                String(i),
                ...(l < n ? [String(l)] : []),
                ...(r < n ? [String(r)] : []),
              ],
              highlightEdges: [],
              message: `Bubble down: comparing index ${i} (${arr[i]}) with children`,
              comparisons,
            },
            description: `Bubble down at index ${i}`,
            codeLine: 22,
            variables: {
              current: arr[i],
              left: l < n ? arr[l] : "none",
              right: r < n ? arr[r] : "none",
              smallest: arr[target],
            },
          };

          if (target === i) break;

          [arr[i], arr[target]] = [arr[target], arr[i]];
          yield {
            type: "swap",
            data: {
              structure: makeState(arr, isMin),
              operation: "extract",
              operationArgs: [],
              highlightNodes: [String(target)],
              highlightEdges: [],
              message: `Swapped ${arr[target]} down to index ${target}`,
              comparisons,
            },
            description: `Swap down to index ${target}`,
            codeLine: 28,
            variables: { swapped: [arr[i], arr[target]], newIndex: target },
          };
          i = target;
        }

        yield {
          type: "extract",
          data: {
            structure: makeState(arr, isMin),
            operation: "extract",
            operationArgs: [],
            highlightNodes: [],
            highlightEdges: [],
            message: `Extracted ${extracted}. Heap property restored.`,
            comparisons,
            returnValue: extracted,
          },
          description: `Extracted ${extracted}`,
          codeLine: 17,
          variables: { extracted, size: arr.length },
        };
        break;
      }
    }
  }

  yield {
    type: "done",
    data: {
      structure: makeState(arr, isMin),
      operation: "done",
      operationArgs: [],
      highlightNodes: [],
      highlightEdges: [],
      message: `All heap operations complete. ${arr.length} element(s) remain.`,
      comparisons,
    },
    description: `Operations complete — ${arr.length} element(s) remain`,
    variables: { size: arr.length, comparisons },
  };
}
