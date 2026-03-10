import type { AlgorithmGenerator } from "@/types";

import { registerAlgorithm } from "../registry";
import { trieMeta } from "./trie.meta";
import type { DSOperation, DSStep, TrieNode, TrieState } from "./types";

export { trieMeta };
registerAlgorithm(trieMeta);

let nid = 0;
function newId(): string {
  return `tr-${nid++}`;
}

function createTrieNode(char: string): TrieNode {
  return { id: newId(), char, children: {}, isEnd: false };
}

function cloneTrie(node: TrieNode): TrieNode {
  const clone: TrieNode = {
    id: node.id,
    char: node.char,
    children: {},
    isEnd: node.isEnd,
  };
  for (const [key, child] of Object.entries(node.children)) {
    clone.children[key] = cloneTrie(child);
  }
  return clone;
}

function makeState(root: TrieNode): TrieState {
  return { kind: "trie", root: cloneTrie(root) };
}

function collectWords(node: TrieNode, prefix: string): string[] {
  const words: string[] = [];
  if (node.isEnd) words.push(prefix);
  for (const [char, child] of Object.entries(node.children)) {
    words.push(...collectWords(child, prefix + char));
  }
  return words;
}

export function* trie(ops: DSOperation[]): AlgorithmGenerator<DSStep> {
  const root = createTrieNode("");
  let comparisons = 0;
  nid = 0;

  yield {
    type: "init",
    data: {
      structure: makeState(root),
      operation: "init",
      operationArgs: [],
      highlightNodes: [root.id],
      highlightEdges: [],
      message: "Empty trie initialized (root node)",
      comparisons: 0,
    },
    description: "Empty trie initialized",
    codeLine: 1,
    variables: { words: 0 },
  };

  for (const { op, args } of ops) {
    switch (op) {
      case "insert": {
        const word = args[0] as string;
        let node = root;

        for (let i = 0; i < word.length; i++) {
          const char = word[i];
          comparisons++;
          const existed = char in node.children;

          if (!existed) {
            node.children[char] = createTrieNode(char);
          }

          yield {
            type: existed ? "traverse" : "create-node",
            data: {
              structure: makeState(root),
              operation: "insert",
              operationArgs: [word],
              highlightNodes: [node.children[char].id],
              highlightEdges: [[node.id, node.children[char].id]],
              message: existed
                ? `Traversing to existing node '${char}' (${word.slice(0, i + 1)})`
                : `Created new node '${char}' (${word.slice(0, i + 1)})`,
              comparisons,
            },
            description: existed
              ? `Traverse to '${char}'`
              : `Create node '${char}'`,
            codeLine: existed ? 3 : 5,
            variables: {
              word,
              char,
              index: i,
              path: word.slice(0, i + 1),
              created: !existed,
            },
          };

          node = node.children[char];
        }

        node.isEnd = true;
        yield {
          type: "mark-end",
          data: {
            structure: makeState(root),
            operation: "insert",
            operationArgs: [word],
            highlightNodes: [node.id],
            highlightEdges: [],
            message: `Marked '${word}' as complete word`,
            comparisons,
          },
          description: `Inserted "${word}"`,
          codeLine: 7,
          variables: { word, nodeId: node.id },
        };
        break;
      }

      case "search": {
        const word = args[0] as string;
        let node: TrieNode | null = root;
        let found = true;

        for (let i = 0; i < word.length; i++) {
          const char = word[i];
          comparisons++;

          if (!(char in node!.children)) {
            yield {
              type: "not-found",
              data: {
                structure: makeState(root),
                operation: "search",
                operationArgs: [word],
                highlightNodes: [node!.id],
                highlightEdges: [],
                message: `Character '${char}' not found at position ${i} — "${word}" does not exist`,
                comparisons,
                returnValue: false,
              },
              description: `"${word}" not found (missing '${char}')`,
              codeLine: 12,
              variables: { word, char, index: i },
            };
            found = false;
            break;
          }

          node = node!.children[char];
          yield {
            type: "traverse",
            data: {
              structure: makeState(root),
              operation: "search",
              operationArgs: [word],
              highlightNodes: [node.id],
              highlightEdges: [],
              message: `Found '${char}' — following path (${word.slice(0, i + 1)})`,
              comparisons,
            },
            description: `Search: traverse to '${char}'`,
            codeLine: 13,
            variables: { word, char, index: i, path: word.slice(0, i + 1) },
          };
        }

        if (found) {
          const isWord = node!.isEnd;
          yield {
            type: isWord ? "found" : "not-found",
            data: {
              structure: makeState(root),
              operation: "search",
              operationArgs: [word],
              highlightNodes: [node!.id],
              highlightEdges: [],
              message: isWord
                ? `"${word}" found in trie!`
                : `"${word}" exists as prefix but is not a complete word`,
              comparisons,
              returnValue: isWord,
            },
            description: isWord
              ? `Found "${word}"`
              : `"${word}" is prefix only`,
            codeLine: 15,
            variables: { word, isCompleteWord: isWord },
          };
        }
        break;
      }

      case "prefix": {
        const prefix = args[0] as string;
        let node: TrieNode | null = root;

        for (let i = 0; i < prefix.length; i++) {
          const char = prefix[i];
          comparisons++;

          if (!(char in node!.children)) {
            yield {
              type: "not-found",
              data: {
                structure: makeState(root),
                operation: "prefix",
                operationArgs: [prefix],
                highlightNodes: [node!.id],
                highlightEdges: [],
                message: `Prefix "${prefix}" not found (missing '${char}')`,
                comparisons,
                returnValue: [],
              },
              description: `Prefix "${prefix}" not found`,
              codeLine: 19,
              variables: { prefix, char, index: i },
            };
            node = null;
            break;
          }

          node = node!.children[char];
          yield {
            type: "traverse",
            data: {
              structure: makeState(root),
              operation: "prefix",
              operationArgs: [prefix],
              highlightNodes: [node.id],
              highlightEdges: [],
              message: `Following prefix path: '${char}' (${prefix.slice(0, i + 1)})`,
              comparisons,
            },
            description: `Prefix: traverse to '${char}'`,
            codeLine: 20,
            variables: { prefix, char, index: i },
          };
        }

        if (node) {
          const words = collectWords(node, prefix);
          yield {
            type: "prefix-result",
            data: {
              structure: makeState(root),
              operation: "prefix",
              operationArgs: [prefix],
              highlightNodes: [node.id],
              highlightEdges: [],
              message: `Words with prefix "${prefix}": [${words.join(", ")}]`,
              comparisons,
              returnValue: words,
            },
            description: `Prefix "${prefix}" → ${words.length} words`,
            codeLine: 22,
            variables: { prefix, words, count: words.length },
          };
        }
        break;
      }
    }
  }

  yield {
    type: "done",
    data: {
      structure: makeState(root),
      operation: "done",
      operationArgs: [],
      highlightNodes: [],
      highlightEdges: [],
      message: "All trie operations complete",
      comparisons,
    },
    description: "All trie operations complete",
    variables: { comparisons },
  };
}
