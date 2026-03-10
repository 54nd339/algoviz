import type { AlgorithmGenerator } from "@/types";

import { registerAlgorithm } from "../registry";
import { hashTableMeta } from "./hash-table.meta";
import type { DSOperation, DSStep, HashEntry, HashTableState } from "./types";

export { hashTableMeta };
registerAlgorithm(hashTableMeta);

function simpleHash(key: string): number {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function cloneBuckets(buckets: (HashEntry | null)[]): (HashEntry | null)[] {
  return buckets.map((entry) => {
    if (!entry) return null;
    const clone = (e: HashEntry): HashEntry => ({
      key: e.key,
      value: e.value,
      next: e.next ? clone(e.next) : null,
    });
    return clone(entry);
  });
}

function makeState(
  buckets: (HashEntry | null)[],
  size: number,
  capacity: number,
  mode: "chaining" | "open-addressing",
): HashTableState {
  return {
    kind: "hash-table",
    buckets: cloneBuckets(buckets),
    size,
    capacity,
    loadFactor: size / capacity,
    mode,
  };
}

export function* hashTable(
  input:
    | { ops: DSOperation[]; mode?: "chaining" | "open-addressing" }
    | DSOperation[],
): AlgorithmGenerator<DSStep> {
  const ops = Array.isArray(input) ? input : (input?.ops ?? []);
  const mode = Array.isArray(input) ? "chaining" : (input?.mode ?? "chaining");
  let capacity = 7;
  let buckets: (HashEntry | null)[] = new Array(capacity).fill(null);
  let size = 0;
  let comparisons = 0;

  yield {
    type: "init",
    data: {
      structure: makeState(buckets, size, capacity, mode),
      operation: "init",
      operationArgs: [],
      highlightNodes: [],
      highlightEdges: [],
      message: `Hash table initialized (${mode}, capacity=${capacity})`,
      comparisons: 0,
    },
    description: `Hash table initialized (${mode})`,
    codeLine: 1,
    variables: { capacity, size: 0, mode },
  };

  function rehash() {
    const oldBuckets = buckets;
    const oldCapacity = capacity;
    capacity = capacity * 2 + 1;
    buckets = new Array(capacity).fill(null);
    size = 0;

    for (let i = 0; i < oldCapacity; i++) {
      if (mode === "chaining") {
        let entry = oldBuckets[i];
        while (entry) {
          const idx = simpleHash(entry.key) % capacity;
          const newEntry: HashEntry = {
            key: entry.key,
            value: entry.value,
            next: buckets[idx],
          };
          buckets[idx] = newEntry;
          size++;
          entry = entry.next ?? null;
        }
      } else {
        const entry = oldBuckets[i];
        if (entry && entry.key !== "__DELETED__") {
          let idx = simpleHash(entry.key) % capacity;
          while (buckets[idx]) idx = (idx + 1) % capacity;
          buckets[idx] = { key: entry.key, value: entry.value };
          size++;
        }
      }
    }
  }

  for (const { op, args } of ops) {
    switch (op) {
      case "put": {
        const key = args[0] as string;
        const value = args[1] as string;
        const hash = simpleHash(key);
        let idx = hash % capacity;

        yield {
          type: "hash",
          data: {
            structure: makeState(buckets, size, capacity, mode),
            operation: "put",
            operationArgs: [key, value],
            highlightNodes: [String(idx)],
            highlightEdges: [],
            message: `hash("${key}") = ${hash} → bucket ${idx}`,
            comparisons,
          },
          description: `Hash "${key}" → bucket ${idx}`,
          codeLine: 2,
          variables: { key, value, hash, index: idx },
        };

        if (mode === "chaining") {
          // Check for existing key
          let existing = buckets[idx];
          let found = false;
          while (existing) {
            comparisons++;
            if (existing.key === key) {
              existing.value = value;
              found = true;
              break;
            }
            existing = existing.next ?? null;
          }
          if (!found) {
            buckets[idx] = { key, value, next: buckets[idx] };
            size++;
          }

          yield {
            type: "put",
            data: {
              structure: makeState(buckets, size, capacity, mode),
              operation: "put",
              operationArgs: [key, value],
              highlightNodes: [String(idx)],
              highlightEdges: [],
              message: found
                ? `Updated "${key}" = "${value}" in bucket ${idx}`
                : `Inserted "${key}" = "${value}" in bucket ${idx}`,
              comparisons,
            },
            description: found ? `Update "${key}"` : `Insert "${key}"`,
            codeLine: 3,
            variables: {
              key,
              value,
              bucket: idx,
              loadFactor: (size / capacity).toFixed(2),
            },
          };
        } else {
          // Open addressing: linear probing
          const probeSeq: number[] = [idx];
          while (
            buckets[idx] &&
            buckets[idx]!.key !== key &&
            buckets[idx]!.key !== "__DELETED__"
          ) {
            comparisons++;
            idx = (idx + 1) % capacity;
            probeSeq.push(idx);
          }

          if (probeSeq.length > 1) {
            yield {
              type: "probe",
              data: {
                structure: makeState(buckets, size, capacity, mode),
                operation: "put",
                operationArgs: [key, value],
                highlightNodes: probeSeq.map(String),
                highlightEdges: [],
                message: `Linear probe: ${probeSeq.join(" → ")}`,
                comparisons,
              },
              description: `Probe sequence: ${probeSeq.length} slots`,
              codeLine: 4,
              variables: { probeSequence: probeSeq },
            };
          }

          const isUpdate = buckets[idx]?.key === key;
          if (!isUpdate) size++;
          buckets[idx] = { key, value };

          yield {
            type: "put",
            data: {
              structure: makeState(buckets, size, capacity, mode),
              operation: "put",
              operationArgs: [key, value],
              highlightNodes: [String(idx)],
              highlightEdges: [],
              message: `Placed "${key}" = "${value}" at slot ${idx}`,
              comparisons,
            },
            description: isUpdate ? `Update "${key}"` : `Insert "${key}"`,
            codeLine: 3,
            variables: {
              key,
              value,
              slot: idx,
              loadFactor: (size / capacity).toFixed(2),
            },
          };
        }

        // Check resize
        if (size / capacity > 0.75) {
          const oldCap = capacity;
          rehash();
          yield {
            type: "resize",
            data: {
              structure: makeState(buckets, size, capacity, mode),
              operation: "put",
              operationArgs: [key, value],
              highlightNodes: [],
              highlightEdges: [],
              message: `Load factor exceeded 0.75 — resized from ${oldCap} to ${capacity}`,
              comparisons,
            },
            description: `Resize: ${oldCap} → ${capacity}`,
            codeLine: 5,
            variables: {
              oldCapacity: oldCap,
              newCapacity: capacity,
              size,
              loadFactor: (size / capacity).toFixed(2),
            },
          };
        }
        break;
      }

      case "get": {
        const key = args[0] as string;
        const hash = simpleHash(key);
        let idx = hash % capacity;

        yield {
          type: "hash",
          data: {
            structure: makeState(buckets, size, capacity, mode),
            operation: "get",
            operationArgs: [key],
            highlightNodes: [String(idx)],
            highlightEdges: [],
            message: `hash("${key}") = ${hash} → bucket ${idx}`,
            comparisons,
          },
          description: `Hash "${key}" → bucket ${idx}`,
          codeLine: 8,
          variables: { key, hash, index: idx },
        };

        if (mode === "chaining") {
          let entry = buckets[idx];
          let found = false;
          while (entry) {
            comparisons++;
            if (entry.key === key) {
              yield {
                type: "found",
                data: {
                  structure: makeState(buckets, size, capacity, mode),
                  operation: "get",
                  operationArgs: [key],
                  highlightNodes: [String(idx)],
                  highlightEdges: [],
                  message: `Found "${key}" = "${entry.value}"`,
                  comparisons,
                  returnValue: entry.value,
                },
                description: `Found "${key}" = "${entry.value}"`,
                codeLine: 9,
                variables: { key, value: entry.value },
              };
              found = true;
              break;
            }
            entry = entry.next ?? null;
          }
          if (!found) {
            yield {
              type: "not-found",
              data: {
                structure: makeState(buckets, size, capacity, mode),
                operation: "get",
                operationArgs: [key],
                highlightNodes: [String(idx)],
                highlightEdges: [],
                message: `Key "${key}" not found`,
                comparisons,
                returnValue: null,
              },
              description: `"${key}" not found`,
              codeLine: 10,
              variables: { key },
            };
          }
        } else {
          const probeSeq: number[] = [idx];
          while (buckets[idx]) {
            comparisons++;
            if (buckets[idx]!.key === key) {
              yield {
                type: "found",
                data: {
                  structure: makeState(buckets, size, capacity, mode),
                  operation: "get",
                  operationArgs: [key],
                  highlightNodes: probeSeq.map(String),
                  highlightEdges: [],
                  message: `Found "${key}" = "${buckets[idx]!.value}" at slot ${idx}`,
                  comparisons,
                  returnValue: buckets[idx]!.value,
                },
                description: `Found "${key}"`,
                codeLine: 9,
                variables: {
                  key,
                  value: buckets[idx]!.value,
                  probes: probeSeq.length,
                },
              };
              break;
            }
            idx = (idx + 1) % capacity;
            probeSeq.push(idx);
            if (probeSeq.length > capacity) break;
          }
          if (!buckets[idx] || buckets[idx]!.key !== key) {
            yield {
              type: "not-found",
              data: {
                structure: makeState(buckets, size, capacity, mode),
                operation: "get",
                operationArgs: [key],
                highlightNodes: probeSeq.map(String),
                highlightEdges: [],
                message: `Key "${key}" not found (probed ${probeSeq.length} slots)`,
                comparisons,
                returnValue: null,
              },
              description: `"${key}" not found`,
              codeLine: 10,
              variables: { key, probes: probeSeq.length },
            };
          }
        }
        break;
      }

      case "delete": {
        const key = args[0] as string;
        const hash = simpleHash(key);
        let idx = hash % capacity;

        yield {
          type: "hash",
          data: {
            structure: makeState(buckets, size, capacity, mode),
            operation: "delete",
            operationArgs: [key],
            highlightNodes: [String(idx)],
            highlightEdges: [],
            message: `hash("${key}") = ${hash} → bucket ${idx}`,
            comparisons,
          },
          description: `Hash "${key}" → bucket ${idx}`,
          codeLine: 12,
          variables: { key, hash, index: idx },
        };

        if (mode === "chaining") {
          let prev: HashEntry | null = null;
          let entry = buckets[idx];
          let found = false;
          while (entry) {
            comparisons++;
            if (entry.key === key) {
              if (prev) {
                prev.next = entry.next ?? null;
              } else {
                buckets[idx] = entry.next ?? null;
              }
              size--;
              found = true;
              yield {
                type: "delete",
                data: {
                  structure: makeState(buckets, size, capacity, mode),
                  operation: "delete",
                  operationArgs: [key],
                  highlightNodes: [String(idx)],
                  highlightEdges: [],
                  message: `Deleted "${key}" from bucket ${idx}`,
                  comparisons,
                  returnValue: true,
                },
                description: `Deleted "${key}"`,
                codeLine: 14,
                variables: { key, bucket: idx },
              };
              break;
            }
            prev = entry;
            entry = entry.next ?? null;
          }
          if (!found) {
            yield {
              type: "not-found",
              data: {
                structure: makeState(buckets, size, capacity, mode),
                operation: "delete",
                operationArgs: [key],
                highlightNodes: [String(idx)],
                highlightEdges: [],
                message: `Key "${key}" not found — nothing to delete`,
                comparisons,
                returnValue: false,
              },
              description: `"${key}" not found`,
              codeLine: 15,
              variables: { key },
            };
          }
        } else {
          const probeSeq: number[] = [idx];
          let found = false;
          while (buckets[idx]) {
            comparisons++;
            if (buckets[idx]!.key === key) {
              buckets[idx] = { key: "__DELETED__", value: "" };
              size--;
              found = true;
              yield {
                type: "delete",
                data: {
                  structure: makeState(buckets, size, capacity, mode),
                  operation: "delete",
                  operationArgs: [key],
                  highlightNodes: probeSeq.map(String),
                  highlightEdges: [],
                  message: `Deleted "${key}" at slot ${idx} (marked as tombstone)`,
                  comparisons,
                  returnValue: true,
                },
                description: `Deleted "${key}"`,
                codeLine: 14,
                variables: { key, slot: idx, probes: probeSeq.length },
              };
              break;
            }
            idx = (idx + 1) % capacity;
            probeSeq.push(idx);
            if (probeSeq.length > capacity) break;
          }
          if (!found) {
            yield {
              type: "not-found",
              data: {
                structure: makeState(buckets, size, capacity, mode),
                operation: "delete",
                operationArgs: [key],
                highlightNodes: probeSeq.map(String),
                highlightEdges: [],
                message: `Key "${key}" not found`,
                comparisons,
                returnValue: false,
              },
              description: `"${key}" not found`,
              codeLine: 15,
              variables: { key, probes: probeSeq.length },
            };
          }
        }
        break;
      }
    }
  }

  yield {
    type: "done",
    data: {
      structure: makeState(buckets, size, capacity, mode),
      operation: "done",
      operationArgs: [],
      highlightNodes: [],
      highlightEdges: [],
      message: `All operations complete. ${size} entries in ${capacity} buckets.`,
      comparisons,
    },
    description: `Operations complete — ${size} entries`,
    variables: {
      size,
      capacity,
      loadFactor: (size / capacity).toFixed(2),
      comparisons,
    },
  };
}
