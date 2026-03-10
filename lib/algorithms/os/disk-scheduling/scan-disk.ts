import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../../registry";
import type { DiskInput, DiskStep } from "../types";

export const scanDiskMeta: AlgorithmMeta = {
  id: "os-scan-disk",
  name: "SCAN Disk Scheduling",
  category: "os",
  description:
    "Elevator algorithm: the disk arm moves in one direction servicing requests, then reverses at the disk edge and services requests in the other direction.",
  timeComplexity: {
    best: "O(n log n)",
    average: "O(n log n)",
    worst: "O(n log n)",
  },
  spaceComplexity: "O(n)",
  pseudocode: `sort requests
move in current direction to disk edge
  service requests along the way
reverse direction
move to other edge
  service remaining requests`,
  presets: [
    {
      name: "Standard (up)",
      generator: () => ({
        requests: [98, 183, 37, 122, 14, 124, 65, 67],
        initialPosition: 53,
        diskSize: 200,
        direction: "up" as const,
      }),
      expectedCase: "average",
    },
  ],
};

registerAlgorithm(scanDiskMeta);

export function* scanDisk(input: DiskInput): AlgorithmGenerator<DiskStep> {
  const { requests, initialPosition, diskSize, direction = "up" } = input;
  let head = initialPosition;
  let totalMovement = 0;
  let dir = direction;
  const sorted = [...requests].sort((a, b) => a - b);
  const served: number[] = [];
  const sequence: number[] = [head];

  yield {
    type: "init",
    data: {
      currentPosition: head,
      requestQueue: sorted,
      servicing: head,
      direction: dir,
      totalHeadMovement: 0,
      servedRequests: [],
      seekSequence: [head],
      diskSize,
    },
    description: `SCAN: head at ${head}, direction=${dir}`,
    codeLine: 1,
    variables: { head, direction: dir },
  };

  const above = sorted.filter((r) => r >= head);
  const below = sorted.filter((r) => r < head).reverse();
  const order =
    dir === "up" ? [...above, diskSize - 1, ...below] : [...below, 0, ...above];

  for (const target of order) {
    const isRequest = requests.includes(target) && !served.includes(target);
    const movement = Math.abs(head - target);
    if (movement === 0 && !isRequest) continue;

    totalMovement += movement;

    if (target === 0 || target === diskSize - 1) {
      dir = dir === "up" ? "down" : "up";
    }

    head = target;
    sequence.push(head);

    if (isRequest) {
      served.push(target);
    }

    const pending = sorted.filter((r) => !served.includes(r));

    yield {
      type: isRequest ? "seek" : "edge",
      data: {
        currentPosition: head,
        requestQueue: pending,
        servicing: target,
        direction: dir,
        totalHeadMovement: totalMovement,
        servedRequests: [...served],
        seekSequence: [...sequence],
        diskSize,
      },
      description: isRequest
        ? `Service ${target} (movement=${movement}, total=${totalMovement})`
        : `Reached edge ${target}, reversing direction`,
      codeLine: isRequest ? 4 : 6,
      variables: { head, direction: dir, totalMovement },
    };
  }

  yield {
    type: "done",
    data: {
      currentPosition: head,
      requestQueue: [],
      servicing: head,
      direction: dir,
      totalHeadMovement: totalMovement,
      servedRequests: [...served],
      seekSequence: [...sequence],
      diskSize,
    },
    description: `SCAN complete. Total head movement: ${totalMovement}`,
    codeLine: 7,
    variables: { totalMovement },
  };
}
