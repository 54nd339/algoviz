import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../../registry";
import type { PageInput, PageStep } from "../types";

export const fifoPageMeta: AlgorithmMeta = {
  id: "os-fifo-page",
  name: "FIFO Page Replacement",
  category: "os",
  description:
    "First In First Out: the oldest page in memory is replaced. Simple but can suffer from Belady's anomaly where more frames cause more faults.",
  timeComplexity: { best: "O(1)", average: "O(1)", worst: "O(1)" },
  spaceComplexity: "O(k)",
  pseudocode: `queue = []
for each page in reference string:
  if page in frames:
    hit++
  else:
    fault++
    if frames full:
      evict queue.front
    add page to frames & queue`,
  presets: [
    {
      name: "Standard",
      generator: () => ({
        referenceString: [
          7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1,
        ],
        frameCount: 3,
      }),
      expectedCase: "average",
    },
    {
      name: "Belady's Anomaly (3 frames)",
      generator: () => ({
        referenceString: [1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5],
        frameCount: 3,
      }),
      expectedCase: "worst",
    },
  ],
};

registerAlgorithm(fifoPageMeta);

export function* fifoPage(input: PageInput): AlgorithmGenerator<PageStep> {
  const { referenceString, frameCount } = input;
  const frames: (number | null)[] = Array(frameCount).fill(null);
  const queue: number[] = [];
  let faultCount = 0;
  let hitCount = 0;

  yield {
    type: "init",
    data: {
      reference: -1,
      referenceString,
      frames: [...frames],
      pageFault: false,
      pageHit: false,
      evicted: null,
      faultCount: 0,
      hitCount: 0,
      hitRatio: 0,
      referenceIndex: -1,
      frameCount,
    },
    description: `FIFO Page Replacement: ${referenceString.length} references, ${frameCount} frames`,
    codeLine: 1,
    variables: { frameCount, references: referenceString.length },
  };

  for (let i = 0; i < referenceString.length; i++) {
    const page = referenceString[i];
    const inFrames = frames.includes(page);

    if (inFrames) {
      hitCount++;
      yield {
        type: "hit",
        data: {
          reference: page,
          referenceString,
          frames: [...frames],
          pageFault: false,
          pageHit: true,
          evicted: null,
          faultCount,
          hitCount,
          hitRatio: hitCount / (i + 1),
          referenceIndex: i,
          frameCount,
        },
        description: `Page ${page}: HIT (already in frames)`,
        codeLine: 4,
        variables: { page, hitCount, faultCount },
      };
    } else {
      faultCount++;
      let evicted: number | null = null;
      const emptyIdx = frames.indexOf(null);

      if (emptyIdx !== -1) {
        frames[emptyIdx] = page;
        queue.push(page);
      } else {
        evicted = queue.shift()!;
        const evictIdx = frames.indexOf(evicted);
        frames[evictIdx] = page;
        queue.push(page);
      }

      yield {
        type: "fault",
        data: {
          reference: page,
          referenceString,
          frames: [...frames],
          pageFault: true,
          pageHit: false,
          evicted,
          faultCount,
          hitCount,
          hitRatio: hitCount / (i + 1),
          referenceIndex: i,
          frameCount,
        },
        description:
          evicted !== null
            ? `Page ${page}: FAULT — evicted page ${evicted}`
            : `Page ${page}: FAULT — loaded into empty frame`,
        codeLine: 7,
        variables: { page, evicted, faultCount, hitCount },
      };
    }
  }

  yield {
    type: "done",
    data: {
      reference: -1,
      referenceString,
      frames: [...frames],
      pageFault: false,
      pageHit: false,
      evicted: null,
      faultCount,
      hitCount,
      hitRatio: hitCount / referenceString.length,
      referenceIndex: referenceString.length,
      frameCount,
    },
    description: `FIFO complete: ${faultCount} faults, ${hitCount} hits, ratio ${((hitCount / referenceString.length) * 100).toFixed(1)}%`,
    codeLine: 8,
    variables: {
      faultCount,
      hitCount,
      hitRatio: ((hitCount / referenceString.length) * 100).toFixed(1) + "%",
    },
  };
}
