import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../../registry";
import type { PageInput, PageStep } from "../types";

export const optimalPageMeta: AlgorithmMeta = {
  id: "os-optimal-page",
  name: "Optimal Page Replacement",
  category: "os",
  description:
    "Belady's Optimal: evicts the page that will not be used for the longest time in the future. Requires future knowledge (oracle) — used as a theoretical lower bound.",
  timeComplexity: { best: "O(k·n)", average: "O(k·n)", worst: "O(k·n)" },
  spaceComplexity: "O(k)",
  pseudocode: `for each page in reference string:
  if page in frames:
    hit++
  else:
    fault++
    if frames full:
      evict page used farthest in future
    add page to frames`,
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
  ],
};

registerAlgorithm(optimalPageMeta);

export function* optimalPage(input: PageInput): AlgorithmGenerator<PageStep> {
  const { referenceString, frameCount } = input;
  const frames: (number | null)[] = Array(frameCount).fill(null);
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
    description: `Optimal Page Replacement: ${referenceString.length} references, ${frameCount} frames`,
    codeLine: 1,
    variables: { frameCount },
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
        description: `Page ${page}: HIT`,
        codeLine: 3,
        variables: { page, hitCount },
      };
    } else {
      faultCount++;
      let evicted: number | null = null;
      const emptyIdx = frames.indexOf(null);

      if (emptyIdx !== -1) {
        frames[emptyIdx] = page;
      } else {
        let farthestPage = frames[0]!;
        let farthestIdx = -1;

        for (let f = 0; f < frameCount; f++) {
          const fp = frames[f]!;
          const nextUse = referenceString.indexOf(fp, i + 1);
          if (nextUse === -1) {
            farthestPage = fp;
            farthestIdx = Infinity;
            break;
          }
          if (nextUse > farthestIdx) {
            farthestIdx = nextUse;
            farthestPage = fp;
          }
        }

        evicted = farthestPage;
        const evictIdx = frames.indexOf(evicted);
        frames[evictIdx] = page;
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
            ? `Page ${page}: FAULT — evicted page ${evicted} (used farthest in future)`
            : `Page ${page}: FAULT — loaded into empty frame`,
        codeLine: 6,
        variables: { page, evicted, faultCount },
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
    description: `Optimal complete: ${faultCount} faults, ${hitCount} hits (theoretical minimum)`,
    codeLine: 7,
    variables: { faultCount, hitCount },
  };
}
