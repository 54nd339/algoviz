import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../../registry";
import type { DiskInput, DiskStep } from "../types";

export const lookDiskMeta: AlgorithmMeta = {
  id: "os-look-disk",
  name: "LOOK Disk Scheduling",
  category: "os",
  description:
    "Like SCAN but the head reverses at the last request in each direction instead of going all the way to the disk edge. More efficient than SCAN.",
  timeComplexity: {
    best: "O(n log n)",
    average: "O(n log n)",
    worst: "O(n log n)",
  },
  spaceComplexity: "O(n)",
  pseudocode: `sort requests
move in direction, service requests
reverse at last request (not edge)
move other direction, service remaining`,
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

registerAlgorithm(lookDiskMeta);

export function* lookDisk(input: DiskInput): AlgorithmGenerator<DiskStep> {
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
    description: `LOOK: head at ${head}, direction=${dir}`,
    codeLine: 1,
    variables: { head, direction: dir },
  };

  const above = sorted.filter((r) => r >= head);
  const below = sorted.filter((r) => r < head).reverse();
  const order = dir === "up" ? [...above, ...below] : [...below, ...above];

  for (let i = 0; i < order.length; i++) {
    const target = order[i];
    const movement = Math.abs(head - target);
    totalMovement += movement;

    const prevDir = dir;
    if (i > 0 && i === (dir === "up" ? above.length : below.length)) {
      dir = dir === "up" ? "down" : "up";
    }

    head = target;
    served.push(target);
    sequence.push(head);

    const pending = sorted.filter((r) => !served.includes(r));

    yield {
      type: dir !== prevDir ? "reverse" : "seek",
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
      description:
        dir !== prevDir
          ? `Reversed at ${order[i - 1] ?? head}, now service ${target} (total=${totalMovement})`
          : `Service ${target} (movement=${movement}, total=${totalMovement})`,
      codeLine: 3,
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
    description: `LOOK complete. Total head movement: ${totalMovement}`,
    codeLine: 5,
    variables: { totalMovement },
  };
}
