import type { AlgorithmGenerator } from "@/types";

import { registerAlgorithm } from "../registry";
import type { DSOperation, DSStep, UnionFindState } from "./types";
import { unionFindMeta } from "./union-find.meta";

export { unionFindMeta };
registerAlgorithm(unionFindMeta);

function makeState(parent: number[], rank: number[]): UnionFindState {
  let count = 0;
  for (let i = 0; i < parent.length; i++) {
    if (parent[i] === i) count++;
  }
  return { kind: "union-find", parent: [...parent], rank: [...rank], count };
}

export function* unionFind(ops: DSOperation[]): AlgorithmGenerator<DSStep> {
  let parent: number[] = [];
  let rank: number[] = [];
  let comparisons = 0;

  yield {
    type: "init",
    data: {
      structure: makeState(parent, rank),
      operation: "init",
      operationArgs: [],
      highlightNodes: [],
      highlightEdges: [],
      message: "Union-Find not yet initialized — awaiting makeSet",
      comparisons: 0,
    },
    description: "Union-Find awaiting initialization",
    codeLine: 1,
    variables: {},
  };

  for (const { op, args } of ops) {
    switch (op) {
      case "make": {
        const n = args[0] as number;
        parent = Array.from({ length: n }, (_, i) => i);
        rank = new Array(n).fill(0);

        yield {
          type: "make-set",
          data: {
            structure: makeState(parent, rank),
            operation: "make",
            operationArgs: [n],
            highlightNodes: parent.map(String),
            highlightEdges: [],
            message: `Created ${n} singleton sets: {${parent.join("}, {")}}`,
            comparisons,
          },
          description: `MakeSet(${n})`,
          codeLine: 2,
          variables: { n, sets: n },
        };
        break;
      }

      case "find": {
        const x = args[0] as number;
        const pathBeforeCompression: number[] = [];
        let current = x;

        // Trace path to root
        while (parent[current] !== current) {
          pathBeforeCompression.push(current);
          current = parent[current];
        }
        pathBeforeCompression.push(current); // root
        const root = current;

        // Yield each step of the find
        for (let i = 0; i < pathBeforeCompression.length; i++) {
          comparisons++;
          const node = pathBeforeCompression[i];
          yield {
            type: "find-step",
            data: {
              structure: makeState(parent, rank),
              operation: "find",
              operationArgs: [x],
              highlightNodes: pathBeforeCompression.slice(0, i + 1).map(String),
              highlightEdges:
                i > 0
                  ? [[String(pathBeforeCompression[i - 1]), String(node)]]
                  : [],
              message:
                node === root
                  ? `Found root: ${root}`
                  : `find(${x}): following parent pointer ${node} → ${parent[node]}`,
              comparisons,
            },
            description:
              node === root
                ? `Root is ${root}`
                : `Follow ${node} → ${parent[node]}`,
            codeLine: 6,
            variables: {
              x,
              current: node,
              parent: parent[node],
              root: node === root ? root : "...",
            },
          };
        }

        // Path compression
        if (pathBeforeCompression.length > 2) {
          for (const node of pathBeforeCompression) {
            if (node !== root) {
              parent[node] = root;
            }
          }
          yield {
            type: "path-compression",
            data: {
              structure: makeState(parent, rank),
              operation: "find",
              operationArgs: [x],
              highlightNodes: pathBeforeCompression.map(String),
              highlightEdges: pathBeforeCompression
                .filter((n) => n !== root)
                .map((n): [string, string] => [String(n), String(root)]),
              message: `Path compression: all nodes on path now point directly to root ${root}`,
              comparisons,
              returnValue: root,
            },
            description: `Compressed path to root ${root}`,
            codeLine: 7,
            variables: {
              x,
              root,
              compressed: pathBeforeCompression.filter((n) => n !== root),
            },
          };
        } else {
          yield {
            type: "find-result",
            data: {
              structure: makeState(parent, rank),
              operation: "find",
              operationArgs: [x],
              highlightNodes: [String(root)],
              highlightEdges: [],
              message: `find(${x}) = ${root}`,
              comparisons,
              returnValue: root,
            },
            description: `find(${x}) = ${root}`,
            codeLine: 8,
            variables: { x, root },
          };
        }
        break;
      }

      case "union": {
        const x = args[0] as number;
        const y = args[1] as number;

        // Find roots
        let rootX = x;
        while (parent[rootX] !== rootX) rootX = parent[rootX];
        let rootY = y;
        while (parent[rootY] !== rootY) rootY = parent[rootY];

        yield {
          type: "union-find-roots",
          data: {
            structure: makeState(parent, rank),
            operation: "union",
            operationArgs: [x, y],
            highlightNodes: [String(rootX), String(rootY)],
            highlightEdges: [],
            message: `union(${x}, ${y}): root of ${x} is ${rootX}, root of ${y} is ${rootY}`,
            comparisons,
          },
          description: `Roots: ${rootX} and ${rootY}`,
          codeLine: 11,
          variables: {
            x,
            y,
            rootX,
            rootY,
            rankX: rank[rootX],
            rankY: rank[rootY],
          },
        };

        if (rootX === rootY) {
          yield {
            type: "union-same-set",
            data: {
              structure: makeState(parent, rank),
              operation: "union",
              operationArgs: [x, y],
              highlightNodes: [String(rootX)],
              highlightEdges: [],
              message: `${x} and ${y} are already in the same set (root ${rootX})`,
              comparisons,
            },
            description: `Already same set`,
            codeLine: 13,
            variables: { x, y, root: rootX },
          };
          break;
        }

        // Union by rank
        if (rank[rootX] < rank[rootY]) {
          parent[rootX] = rootY;
        } else if (rank[rootX] > rank[rootY]) {
          parent[rootY] = rootX;
        } else {
          parent[rootY] = rootX;
          rank[rootX]++;
        }

        // Path compression for x and y
        let cx = x;
        while (parent[cx] !== cx) {
          const next = parent[cx];
          parent[cx] = parent[rootX] === rootX ? rootX : rootY;
          cx = next;
        }
        let cy = y;
        while (parent[cy] !== cy) {
          const next = parent[cy];
          parent[cy] = parent[rootY] === rootY ? rootY : rootX;
          cy = next;
        }

        const newRoot = parent[rootX] === rootX ? rootX : rootY;

        yield {
          type: "union",
          data: {
            structure: makeState(parent, rank),
            operation: "union",
            operationArgs: [x, y],
            highlightNodes: [String(rootX), String(rootY)],
            highlightEdges: [
              [String(rootX === newRoot ? rootY : rootX), String(newRoot)],
            ],
            message: `Merged set of ${rootX === newRoot ? rootY : rootX} under root ${newRoot} (rank: ${rank[newRoot]})`,
            comparisons,
          },
          description: `Union: ${rootX === newRoot ? rootY : rootX} → ${newRoot}`,
          codeLine: 15,
          variables: {
            newRoot,
            rank: rank[newRoot],
            sets: makeState(parent, rank).count,
          },
        };
        break;
      }
    }
  }

  yield {
    type: "done",
    data: {
      structure: makeState(parent, rank),
      operation: "done",
      operationArgs: [],
      highlightNodes: [],
      highlightEdges: [],
      message: `All operations complete. ${makeState(parent, rank).count} disjoint set(s).`,
      comparisons,
    },
    description: "All Union-Find operations complete",
    variables: { sets: makeState(parent, rank).count, comparisons },
  };
}
