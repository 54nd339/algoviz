import type { AlgorithmMeta } from "@/types";

export const trieMeta: AlgorithmMeta = {
  id: "trie",
  name: "Trie (Prefix Tree)",
  category: "data-structures",
  description:
    "A tree-like data structure for storing strings where each edge represents a character. Enables O(m) search, insert, and prefix lookup where m is the key length. Used in autocomplete and spell checkers.",
  timeComplexity: { best: "O(m)", average: "O(m)", worst: "O(m)" },
  spaceComplexity: "O(n × m)",
  pseudocode: `insert(word):
  node = root
  for each char c in word:
    if c not in node.children:
      node.children[c] = new TrieNode(c)
    node = node.children[c]
  node.isEnd = true

search(word):
  node = root
  for each char c in word:
    if c not in node.children:
      return false
    node = node.children[c]
  return node.isEnd

prefixSearch(prefix):
  node = root
  for each char c in prefix:
    if c not in node.children:
      return []
    node = node.children[c]
  return collectWords(node, prefix)`,
  presets: [
    {
      name: "Insert & Search",
      generator: () => [
        { op: "insert", args: ["cat"] },
        { op: "insert", args: ["car"] },
        { op: "insert", args: ["card"] },
        { op: "insert", args: ["care"] },
        { op: "search", args: ["car"] },
        { op: "search", args: ["cab"] },
        { op: "prefix", args: ["car"] },
      ],
      expectedCase: "average" as const,
    },
    {
      name: "Common Prefixes",
      generator: () => [
        { op: "insert", args: ["apple"] },
        { op: "insert", args: ["app"] },
        { op: "insert", args: ["application"] },
        { op: "insert", args: ["apt"] },
        { op: "search", args: ["app"] },
        { op: "prefix", args: ["app"] },
      ],
      expectedCase: "average" as const,
    },
  ],
  misconceptions: [
    {
      myth: "Tries are always more space-efficient than hash tables for strings.",
      reality:
        "Tries can use more memory due to pointer overhead per node. However, they excel at prefix operations and avoid hash collisions entirely.",
    },
  ],
  relatedAlgorithms: ["hash-table", "bst"],
};
