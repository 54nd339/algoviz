import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../../registry";
import type { DiskInput, DiskStep } from "../types";

export const sstfDiskMeta: AlgorithmMeta = {
  id: "os-sstf-disk",
  name: "SSTF Disk Scheduling",
  category: "os",
  description:
    "Shortest Seek Time First: the request closest to the current head position is serviced next. Reduces total seek time but can cause starvation of distant requests.",
  timeComplexity: { best: "O(n²)", average: "O(n²)", worst: "O(n²)" },
  spaceComplexity: "O(n)",
  pseudocode: `head = initial position
while pending requests:
  pick nearest request to head
  seek to it
  total += distance
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

registerAlgorithm(sstfDiskMeta);

export function* sstfDisk(input: DiskInput): AlgorithmGenerator<DiskStep> {
  const { requests, initialPosition, diskSize } = input;
  let head = initialPosition;
  let totalMovement = 0;
  const pending = [...requests];
  const served: number[] = [];
  const sequence: number[] = [head];

  yield {
    type: "init",
    data: {
      currentPosition: head,
      requestQueue: [...pending],
      servicing: head,
      direction: "up",
      totalHeadMovement: 0,
      servedRequests: [],
      seekSequence: [head],
      diskSize,
    },
    description: `SSTF Disk: head at ${head}, ${requests.length} requests`,
    codeLine: 1,
    variables: { head },
  };

  while (pending.length > 0) {
    let nearestIdx = 0;
    let nearestDist = Math.abs(pending[0] - head);

    for (let i = 1; i < pending.length; i++) {
      const dist = Math.abs(pending[i] - head);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIdx = i;
      }
    }

    const req = pending.splice(nearestIdx, 1)[0];
    totalMovement += nearestDist;
    head = req;
    served.push(req);
    sequence.push(head);

    yield {
      type: "seek",
      data: {
        currentPosition: head,
        requestQueue: [...pending],
        servicing: req,
        direction:
          req > (sequence[sequence.length - 2] ?? head) ? "up" : "down",
        totalHeadMovement: totalMovement,
        servedRequests: [...served],
        seekSequence: [...sequence],
        diskSize,
      },
      description: `Nearest: ${req} (distance=${nearestDist}, total=${totalMovement})`,
      codeLine: 3,
      variables: { head, servicing: req, distance: nearestDist, totalMovement },
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
    description: `SSTF complete. Total head movement: ${totalMovement}`,
    codeLine: 5,
    variables: { totalMovement },
  };
}
