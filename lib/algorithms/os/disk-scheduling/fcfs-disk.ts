import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../../registry";
import type { DiskInput, DiskStep } from "../types";

export const fcfsDiskMeta: AlgorithmMeta = {
  id: "os-fcfs-disk",
  name: "FCFS Disk Scheduling",
  category: "os",
  description:
    "First Come First Served: the disk arm services requests in the order they arrive. Simple but can result in large total head movement.",
  timeComplexity: { best: "O(n)", average: "O(n)", worst: "O(n)" },
  spaceComplexity: "O(1)",
  pseudocode: `head = initial position
for each request in arrival order:
  seek to request
  total += |head - request|
  head = request`,
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

registerAlgorithm(fcfsDiskMeta);

export function* fcfsDisk(input: DiskInput): AlgorithmGenerator<DiskStep> {
  const { requests, initialPosition, diskSize } = input;
  let head = initialPosition;
  let totalMovement = 0;
  const served: number[] = [];
  const sequence: number[] = [head];

  yield {
    type: "init",
    data: {
      currentPosition: head,
      requestQueue: [...requests],
      servicing: head,
      direction: "up",
      totalHeadMovement: 0,
      servedRequests: [],
      seekSequence: [head],
      diskSize,
    },
    description: `FCFS Disk: head at ${head}, ${requests.length} requests`,
    codeLine: 1,
    variables: { head, requests: requests.length },
  };

  for (let i = 0; i < requests.length; i++) {
    const req = requests[i];
    const movement = Math.abs(head - req);
    totalMovement += movement;
    head = req;
    served.push(req);
    sequence.push(head);

    yield {
      type: "seek",
      data: {
        currentPosition: head,
        requestQueue: requests.filter((r, idx) => idx > i),
        servicing: req,
        direction: req > head ? "up" : "down",
        totalHeadMovement: totalMovement,
        servedRequests: [...served],
        seekSequence: [...sequence],
        diskSize,
      },
      description: `Seek to ${req} (movement=${movement}, total=${totalMovement})`,
      codeLine: 3,
      variables: { head, servicing: req, movement, totalMovement },
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
    description: `FCFS Disk complete. Total head movement: ${totalMovement}`,
    codeLine: 5,
    variables: { totalMovement },
  };
}
