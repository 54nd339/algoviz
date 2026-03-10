import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import type { BankerInput, BankerStep } from "./types";

export const bankersMeta: AlgorithmMeta = {
  id: "os-bankers",
  name: "Banker's Algorithm",
  category: "os",
  description:
    "Deadlock avoidance algorithm that checks if granting a resource request leaves the system in a safe state. A state is safe if there exists a sequence in which all processes can complete.",
  timeComplexity: { best: "O(n²·m)", average: "O(n²·m)", worst: "O(n²·m)" },
  spaceComplexity: "O(n·m)",
  pseudocode: `work = available.copy()
finish = [false] * n
safeSeq = []
while safeSeq.length < n:
  found = false
  for each process p:
    if !finish[p] and need[p] <= work:
      work += allocation[p]
      finish[p] = true
      safeSeq.push(p)
      found = true
  if !found: UNSAFE`,
  presets: [
    {
      name: "Safe State",
      generator: () => ({
        available: [3, 3, 2],
        max: [
          [7, 5, 3],
          [3, 2, 2],
          [9, 0, 2],
          [2, 2, 2],
          [4, 3, 3],
        ],
        allocation: [
          [0, 1, 0],
          [2, 0, 0],
          [3, 0, 2],
          [2, 1, 1],
          [0, 0, 2],
        ],
        processNames: ["P0", "P1", "P2", "P3", "P4"],
        resourceNames: ["A", "B", "C"],
      }),
      expectedCase: "average",
    },
    {
      name: "Unsafe State",
      generator: () => ({
        available: [1, 1, 0],
        max: [
          [4, 3, 2],
          [3, 2, 2],
          [5, 3, 3],
        ],
        allocation: [
          [2, 1, 1],
          [2, 1, 1],
          [3, 2, 2],
        ],
        processNames: ["P0", "P1", "P2"],
        resourceNames: ["A", "B", "C"],
      }),
      expectedCase: "worst",
    },
  ],
};

registerAlgorithm(bankersMeta);

export function* bankers(input: BankerInput): AlgorithmGenerator<BankerStep> {
  const { available, max, allocation } = input;
  const n = max.length;
  const m = available.length;
  const processNames =
    input.processNames ?? Array.from({ length: n }, (_, i) => `P${i}`);
  const resourceNames =
    input.resourceNames ?? Array.from({ length: m }, (_, i) => `R${i}`);

  const need: number[][] = [];
  for (let i = 0; i < n; i++) {
    need.push(max[i].map((val, j) => val - allocation[i][j]));
  }

  const work = [...available];
  const finish = Array(n).fill(false);
  const safeSequence: string[] = [];

  yield {
    type: "init",
    data: {
      available: [...work],
      max: max.map((r) => [...r]),
      allocation: allocation.map((r) => [...r]),
      need: need.map((r) => [...r]),
      safeSequence: [],
      currentProcess: null,
      isSafe: true,
      checking: "Starting safety check...",
      processNames,
      resourceNames,
    },
    description: `Banker's Algorithm: ${n} processes, ${m} resources`,
    codeLine: 1,
    variables: { processes: n, resources: m, available: [...work] },
  };

  let changed = true;
  while (safeSequence.length < n && changed) {
    changed = false;

    for (let i = 0; i < n; i++) {
      if (finish[i]) continue;

      const canRun = need[i].every((val, j) => val <= work[j]);
      const checkStr = `Need[${processNames[i]}]=[${need[i]}] <= Available=[${work}]? ${canRun ? "YES" : "NO"}`;

      yield {
        type: "check",
        data: {
          available: [...work],
          max: max.map((r) => [...r]),
          allocation: allocation.map((r) => [...r]),
          need: need.map((r) => [...r]),
          safeSequence: [...safeSequence],
          currentProcess: processNames[i],
          isSafe: true,
          checking: checkStr,
          processNames,
          resourceNames,
        },
        description: checkStr,
        codeLine: 6,
        variables: {
          process: processNames[i],
          need: need[i],
          work: [...work],
          canRun,
        },
      };

      if (canRun) {
        for (let j = 0; j < m; j++) {
          work[j] += allocation[i][j];
        }
        finish[i] = true;
        safeSequence.push(processNames[i]);
        changed = true;

        yield {
          type: "allocate",
          data: {
            available: [...work],
            max: max.map((r) => [...r]),
            allocation: allocation.map((r) => [...r]),
            need: need.map((r) => [...r]),
            safeSequence: [...safeSequence],
            currentProcess: processNames[i],
            isSafe: true,
            checking: `${processNames[i]} can execute. Resources released. Available=[${work}]`,
            processNames,
            resourceNames,
          },
          description: `${processNames[i]} executes and releases resources. Available=[${work}]`,
          codeLine: 8,
          variables: {
            process: processNames[i],
            newAvailable: [...work],
            safeSequence: [...safeSequence],
          },
        };
      }
    }
  }

  const isSafe = safeSequence.length === n;

  yield {
    type: "done",
    data: {
      available: [...work],
      max: max.map((r) => [...r]),
      allocation: allocation.map((r) => [...r]),
      need: need.map((r) => [...r]),
      safeSequence: [...safeSequence],
      currentProcess: null,
      isSafe,
      checking: isSafe
        ? `SAFE STATE! Sequence: <${safeSequence.join(", ")}>`
        : `UNSAFE STATE! No safe sequence exists.`,
      processNames,
      resourceNames,
    },
    description: isSafe
      ? `Safe sequence found: <${safeSequence.join(", ")}>`
      : "System is in an UNSAFE state — deadlock possible",
    codeLine: isSafe ? 11 : 12,
    variables: { isSafe, safeSequence: [...safeSequence] },
  };
}
