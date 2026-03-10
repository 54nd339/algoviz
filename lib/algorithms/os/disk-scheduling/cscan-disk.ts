import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../../registry";
import type { DiskInput, DiskStep } from "../types";

export const cscanDiskMeta: AlgorithmMeta = {
  id: "os-cscan-disk",
  name: "C-SCAN Disk Scheduling",
  category: "os",
  description:
    "Circular SCAN: head moves in one direction servicing requests, then jumps to the beginning of the disk and sweeps again. Provides more uniform wait times than SCAN.",
  timeComplexity: {
    best: "O(n log n)",
    average: "O(n log n)",
    worst: "O(n log n)",
  },
  spaceComplexity: "O(n)",
  pseudocode: `sort requests
move up to disk edge, service along the way
jump to cylinder 0 (no service)
move up again, service remaining`,
  presets: [
    {
      name: "Standard",
      generator: () => ({
        requests: [98, 183, 37, 122, 14, 124, 65, 67],
        initialPosition: 53,
        diskSize: 200,
      }),
      expectedCase: "average",
    },
  ],
};

registerAlgorithm(cscanDiskMeta);

export function* cscanDisk(input: DiskInput): AlgorithmGenerator<DiskStep> {
  const { requests, initialPosition, diskSize } = input;
  let head = initialPosition;
  let totalMovement = 0;
  const sorted = [...requests].sort((a, b) => a - b);
  const served: number[] = [];
  const sequence: number[] = [head];

  yield {
    type: "init",
    data: {
      currentPosition: head,
      requestQueue: sorted,
      servicing: head,
      direction: "up",
      totalHeadMovement: 0,
      servedRequests: [],
      seekSequence: [head],
      diskSize,
    },
    description: `C-SCAN: head at ${head}`,
    codeLine: 1,
    variables: { head },
  };

  const above = sorted.filter((r) => r >= head);
  const below = sorted.filter((r) => r < head);
  const order = [...above, diskSize - 1, 0, ...below];

  for (const target of order) {
    const isRequest = requests.includes(target) && !served.includes(target);
    const movement = Math.abs(head - target);
    if (movement === 0 && !isRequest) continue;

    totalMovement += movement;
    head = target;
    sequence.push(head);

    if (isRequest) {
      served.push(target);
    }

    const pending = sorted.filter((r) => !served.includes(r));
    const isEdge = target === 0 || target === diskSize - 1;

    yield {
      type: isRequest ? "seek" : "edge",
      data: {
        currentPosition: head,
        requestQueue: pending,
        servicing: target,
        direction: "up",
        totalHeadMovement: totalMovement,
        servedRequests: [...served],
        seekSequence: [...sequence],
        diskSize,
      },
      description: isEdge
        ? `${target === diskSize - 1 ? "Reached end" : "Jumped to start"} (total=${totalMovement})`
        : `Service ${target} (total=${totalMovement})`,
      codeLine: isRequest ? 3 : 4,
      variables: { head, totalMovement },
    };
  }

  yield {
    type: "done",
    data: {
      currentPosition: head,
      requestQueue: [],
      servicing: head,
      direction: "up",
      totalHeadMovement: totalMovement,
      servedRequests: [...served],
      seekSequence: [...sequence],
      diskSize,
    },
    description: `C-SCAN complete. Total head movement: ${totalMovement}`,
    codeLine: 5,
    variables: { totalMovement },
  };
}
