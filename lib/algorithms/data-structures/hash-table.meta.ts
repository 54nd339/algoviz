import type { AlgorithmMeta } from "@/types";

export const hashTableMeta: AlgorithmMeta = {
  id: "hash-table",
  name: "Hash Table",
  category: "data-structures",
  description:
    "A data structure that maps keys to values using a hash function. Handles collisions via chaining (linked lists per bucket) or open addressing (linear probing). Amortized O(1) operations with good hash distribution.",
  timeComplexity: { best: "O(1)", average: "O(1)", worst: "O(n)" },
  spaceComplexity: "O(n)",
  pseudocode: `put(key, value):
  index = hash(key) % capacity
  // Chaining: append to bucket's list
  // Open addressing: probe until empty slot
  if loadFactor > 0.75: resize()

get(key):
  index = hash(key) % capacity
  // Chaining: search bucket's list
  // Open addressing: probe until found or empty

delete(key):
  index = hash(key) % capacity
  // Chaining: remove from bucket's list
  // Open addressing: mark as deleted

hash(key):
  sum = 0
  for each char c in key:
    sum = sum * 31 + charCode(c)
  return sum`,
  presets: [
    {
      name: "Chaining Mode",
      generator: () => [
        { op: "put", args: ["apple", "red"] },
        { op: "put", args: ["banana", "yellow"] },
        { op: "put", args: ["cherry", "red"] },
        { op: "put", args: ["date", "brown"] },
        { op: "get", args: ["banana"] },
        { op: "put", args: ["elderberry", "purple"] },
        { op: "delete", args: ["cherry"] },
        { op: "get", args: ["cherry"] },
      ],
      expectedCase: "average" as const,
    },
    {
      name: "Open Addressing",
      generator: () => [
        { op: "put", args: ["cat", "meow"] },
        { op: "put", args: ["dog", "woof"] },
        { op: "put", args: ["cow", "moo"] },
        { op: "put", args: ["pig", "oink"] },
        { op: "get", args: ["cow"] },
        { op: "delete", args: ["dog"] },
        { op: "get", args: ["dog"] },
        { op: "put", args: ["hen", "cluck"] },
      ],
      expectedCase: "average" as const,
    },
    {
      name: "Force Resize",
      generator: () => [
        { op: "put", args: ["a", "1"] },
        { op: "put", args: ["b", "2"] },
        { op: "put", args: ["c", "3"] },
        { op: "put", args: ["d", "4"] },
        { op: "put", args: ["e", "5"] },
        { op: "put", args: ["f", "6"] },
      ],
      expectedCase: "worst" as const,
    },
  ],
  misconceptions: [
    {
      myth: "Hash tables always have O(1) operations.",
      reality:
        "O(1) is the average case with a good hash function. In the worst case (all keys hash to the same bucket), operations degrade to O(n).",
    },
  ],
  relatedAlgorithms: ["trie"],
};
