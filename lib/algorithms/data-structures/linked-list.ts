import type { AlgorithmGenerator } from "@/types";

import { registerAlgorithm } from "../registry";
import { linkedListMeta } from "./linked-list.meta";
import type { DSOperation, DSStep, LinkedListState, LLNode } from "./types";

export { linkedListMeta };
registerAlgorithm(linkedListMeta);

let nodeIdCounter = 0;
function nextId(): string {
  return `ll-${nodeIdCounter++}`;
}

function makeState(
  nodes: LLNode[],
  head: string | null,
  tail: string | null,
  doubly: boolean,
): LinkedListState {
  return {
    kind: "linked-list",
    nodes: nodes.map((n) => ({ ...n })),
    head,
    tail,
    doubly,
  };
}

function getOrderedNodes(nodes: LLNode[], head: string | null): LLNode[] {
  const ordered: LLNode[] = [];
  let currentId = head;
  const visited = new Set<string>();
  while (currentId && !visited.has(currentId)) {
    visited.add(currentId);
    const node = nodes.find((n) => n.id === currentId);
    if (!node) break;
    ordered.push(node);
    currentId = node.next;
  }
  return ordered;
}

export function* linkedList(
  input: { ops: DSOperation[]; doubly?: boolean } | DSOperation[],
): AlgorithmGenerator<DSStep> {
  const ops = Array.isArray(input) ? input : (input?.ops ?? []);
  const doubly = Array.isArray(input) ? false : (input?.doubly ?? false);
  const nodes: LLNode[] = [];
  let head: string | null = null;
  let tail: string | null = null;
  let comparisons = 0;
  nodeIdCounter = 0;

  yield {
    type: "init",
    data: {
      structure: makeState(nodes, head, tail, doubly),
      operation: "init",
      operationArgs: [],
      highlightNodes: [],
      highlightEdges: [],
      message: `Empty ${doubly ? "doubly" : "singly"} linked list initialized`,
      comparisons: 0,
    },
    description: `Empty ${doubly ? "doubly" : "singly"} linked list initialized`,
    codeLine: 1,
    variables: { head: null, tail: null, size: 0 },
  };

  for (const { op, args } of ops) {
    switch (op) {
      case "insertHead": {
        const value = args[0] as number;
        const id = nextId();
        const node: LLNode = {
          id,
          value,
          next: head,
          prev: doubly ? null : undefined,
        };
        if (head && doubly) {
          const headNode = nodes.find((n) => n.id === head)!;
          headNode.prev = id;
        }
        nodes.push(node);
        head = id;
        if (!tail) tail = id;

        yield {
          type: "insert-head",
          data: {
            structure: makeState(nodes, head, tail, doubly),
            operation: "insertHead",
            operationArgs: [value],
            highlightNodes: [id],
            highlightEdges: node.next ? [[id, node.next]] : [],
            message: `Inserted ${value} at head`,
            comparisons,
          },
          description: `Insert ${value} at head`,
          codeLine: 4,
          variables: { value, head: value, size: nodes.length },
        };
        break;
      }

      case "insertTail": {
        const value = args[0] as number;
        const id = nextId();
        const node: LLNode = {
          id,
          value,
          next: null,
          prev: doubly ? tail : undefined,
        };
        if (tail) {
          const tailNode = nodes.find((n) => n.id === tail)!;
          tailNode.next = id;
        }
        nodes.push(node);
        if (!head) head = id;
        tail = id;

        yield {
          type: "insert-tail",
          data: {
            structure: makeState(nodes, head, tail, doubly),
            operation: "insertTail",
            operationArgs: [value],
            highlightNodes: [id],
            highlightEdges: node.prev ? [[node.prev, id]] : [],
            message: `Inserted ${value} at tail`,
            comparisons,
          },
          description: `Insert ${value} at tail`,
          codeLine: 10,
          variables: { value, tail: value, size: nodes.length },
        };
        break;
      }

      case "insertAt": {
        const index = args[0] as number;
        const value = args[1] as number;
        const ordered = getOrderedNodes(nodes, head);

        if (index <= 0) {
          const id = nextId();
          const node: LLNode = {
            id,
            value,
            next: head,
            prev: doubly ? null : undefined,
          };
          if (head && doubly) {
            const headNode = nodes.find((n) => n.id === head)!;
            headNode.prev = id;
          }
          nodes.push(node);
          head = id;
          if (!tail) tail = id;
          yield {
            type: "insert-at",
            data: {
              structure: makeState(nodes, head, tail, doubly),
              operation: "insertAt",
              operationArgs: [index, value],
              highlightNodes: [id],
              highlightEdges: [],
              message: `Inserted ${value} at index ${index} (head)`,
              comparisons,
            },
            description: `Insert ${value} at index ${index}`,
            codeLine: 4,
            variables: { index, value, size: nodes.length },
          };
        } else if (index >= ordered.length) {
          const id = nextId();
          const node: LLNode = {
            id,
            value,
            next: null,
            prev: doubly ? tail : undefined,
          };
          if (tail) {
            const tailNode = nodes.find((n) => n.id === tail)!;
            tailNode.next = id;
          }
          nodes.push(node);
          if (!head) head = id;
          tail = id;
          yield {
            type: "insert-at",
            data: {
              structure: makeState(nodes, head, tail, doubly),
              operation: "insertAt",
              operationArgs: [index, value],
              highlightNodes: [id],
              highlightEdges: [],
              message: `Inserted ${value} at index ${index} (tail)`,
              comparisons,
            },
            description: `Insert ${value} at index ${index}`,
            codeLine: 10,
            variables: { index, value, size: nodes.length },
          };
        } else {
          const prev = ordered[index - 1];
          const nextNode = ordered[index];

          // Traverse to position
          for (let i = 0; i < index; i++) {
            comparisons++;
            yield {
              type: "traverse",
              data: {
                structure: makeState(nodes, head, tail, doubly),
                operation: "insertAt",
                operationArgs: [index, value],
                highlightNodes: [ordered[i].id],
                highlightEdges: [],
                message: `Traversing to index ${index}: at node ${ordered[i].value} (index ${i})`,
                comparisons,
              },
              description: `Traversing: visiting node ${ordered[i].value}`,
              variables: { currentIndex: i, targetIndex: index },
            };
          }

          const id = nextId();
          const node: LLNode = {
            id,
            value,
            next: nextNode.id,
            prev: doubly ? prev.id : undefined,
          };
          prev.next = id;
          if (doubly) nextNode.prev = id;
          nodes.push(node);

          yield {
            type: "insert-at",
            data: {
              structure: makeState(nodes, head, tail, doubly),
              operation: "insertAt",
              operationArgs: [index, value],
              highlightNodes: [id],
              highlightEdges: [
                [prev.id, id],
                [id, nextNode.id],
              ],
              message: `Inserted ${value} at index ${index} between ${prev.value} and ${nextNode.value}`,
              comparisons,
            },
            description: `Insert ${value} at index ${index}`,
            variables: { index, value, size: nodes.length },
          };
        }
        break;
      }

      case "delete": {
        const value = args[0] as number;
        const ordered = getOrderedNodes(nodes, head);
        let found = false;

        for (let i = 0; i < ordered.length; i++) {
          comparisons++;
          yield {
            type: "search-step",
            data: {
              structure: makeState(nodes, head, tail, doubly),
              operation: "delete",
              operationArgs: [value],
              highlightNodes: [ordered[i].id],
              highlightEdges: [],
              message: `Searching for ${value}: checking node ${ordered[i].value}`,
              comparisons,
            },
            description: `Search for ${value}: checking ${ordered[i].value}`,
            codeLine: 20,
            variables: { target: value, current: ordered[i].value, index: i },
          };

          if (ordered[i].value === value) {
            const node = ordered[i];
            const prevNode = i > 0 ? ordered[i - 1] : null;
            const nextNode = i < ordered.length - 1 ? ordered[i + 1] : null;

            if (prevNode) prevNode.next = nextNode?.id ?? null;
            if (nextNode && doubly) nextNode.prev = prevNode?.id ?? null;
            if (node.id === head) head = nextNode?.id ?? null;
            if (node.id === tail) tail = prevNode?.id ?? null;

            const idx = nodes.findIndex((n) => n.id === node.id);
            if (idx !== -1) nodes.splice(idx, 1);

            yield {
              type: "delete",
              data: {
                structure: makeState(nodes, head, tail, doubly),
                operation: "delete",
                operationArgs: [value],
                highlightNodes: [],
                highlightEdges:
                  prevNode && nextNode ? [[prevNode.id, nextNode.id]] : [],
                message: `Deleted node with value ${value}`,
                comparisons,
                returnValue: true,
              },
              description: `Deleted ${value}`,
              codeLine: 22,
              variables: { deleted: value, size: nodes.length },
            };
            found = true;
            break;
          }
        }

        if (!found) {
          yield {
            type: "not-found",
            data: {
              structure: makeState(nodes, head, tail, doubly),
              operation: "delete",
              operationArgs: [value],
              highlightNodes: [],
              highlightEdges: [],
              message: `Value ${value} not found in list`,
              comparisons,
              returnValue: false,
            },
            description: `${value} not found — nothing deleted`,
            codeLine: 25,
            variables: { target: value, found: false },
          };
        }
        break;
      }

      case "search": {
        const value = args[0] as number;
        const ordered = getOrderedNodes(nodes, head);
        let found = false;

        for (let i = 0; i < ordered.length; i++) {
          comparisons++;
          const isMatch = ordered[i].value === value;
          yield {
            type: isMatch ? "found" : "search-step",
            data: {
              structure: makeState(nodes, head, tail, doubly),
              operation: "search",
              operationArgs: [value],
              highlightNodes: [ordered[i].id],
              highlightEdges: [],
              message: isMatch
                ? `Found ${value} at index ${i}`
                : `Searching for ${value}: checking ${ordered[i].value}`,
              comparisons,
              returnValue: isMatch ? ordered[i] : undefined,
            },
            description: isMatch
              ? `Found ${value} at index ${i}`
              : `Search for ${value}: checking ${ordered[i].value}`,
            codeLine: isMatch ? 30 : 29,
            variables: { target: value, current: ordered[i].value, index: i },
          };
          if (isMatch) {
            found = true;
            break;
          }
        }

        if (!found) {
          yield {
            type: "not-found",
            data: {
              structure: makeState(nodes, head, tail, doubly),
              operation: "search",
              operationArgs: [value],
              highlightNodes: [],
              highlightEdges: [],
              message: `Value ${value} not found in list`,
              comparisons,
              returnValue: null,
            },
            description: `${value} not found in list`,
            codeLine: 31,
            variables: { target: value, found: false },
          };
        }
        break;
      }

      case "reverse": {
        const ordered = getOrderedNodes(nodes, head);
        if (ordered.length <= 1) {
          yield {
            type: "reverse",
            data: {
              structure: makeState(nodes, head, tail, doubly),
              operation: "reverse",
              operationArgs: [],
              highlightNodes: [],
              highlightEdges: [],
              message: "List has 0 or 1 nodes — already reversed",
              comparisons,
            },
            description: "List trivially reversed",
            variables: { size: ordered.length },
          };
          break;
        }

        // Reverse pointers
        for (let i = 0; i < ordered.length; i++) {
          const node = ordered[i];
          const oldNext = node.next;
          node.next = i > 0 ? ordered[i - 1].id : null;
          if (doubly) {
            node.prev = oldNext ? (ordered[i + 1]?.id ?? null) : null;
          }

          yield {
            type: "reverse-step",
            data: {
              structure: makeState(nodes, head, tail, doubly),
              operation: "reverse",
              operationArgs: [],
              highlightNodes: [node.id],
              highlightEdges: [],
              message: `Reversing pointer of node ${node.value}`,
              comparisons,
            },
            description: `Reverse pointer of ${node.value}`,
            variables: {
              current: node.value,
              step: i + 1,
              total: ordered.length,
            },
          };
        }

        const oldHead: string | null = head;
        head = tail;
        tail = oldHead;

        yield {
          type: "reverse",
          data: {
            structure: makeState(nodes, head, tail, doubly),
            operation: "reverse",
            operationArgs: [],
            highlightNodes: [],
            highlightEdges: [],
            message: "List reversed successfully",
            comparisons,
          },
          description: "List reversed",
          variables: {
            size: ordered.length,
            head: ordered[ordered.length - 1].value,
            tail: ordered[0].value,
          },
        };
        break;
      }
    }
  }

  yield {
    type: "done",
    data: {
      structure: makeState(nodes, head, tail, doubly),
      operation: "done",
      operationArgs: [],
      highlightNodes: [],
      highlightEdges: [],
      message: `All operations complete. List has ${nodes.length} node(s).`,
      comparisons,
    },
    description: `Operations complete — ${nodes.length} node(s) remain`,
    variables: { size: nodes.length, comparisons },
  };
}
