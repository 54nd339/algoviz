import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../../registry";
import type { PageInput, PageStep } from "../types";

export const lruPageMeta: AlgorithmMeta = {
  id: "os-lru-page",
  name: "LRU Page Replacement",
  category: "os",
  description:
    "Least Recently Used: evicts the page that has not been accessed for the longest time. Approximates optimal replacement well in practice.",
  timeComplexity: { best: "O(1)", average: "O(k)", worst: "O(k)" },
  spaceComplexity: "O(k)",
  pseudocode: `for each page in reference string:
  if page in frames:
    hit++, update recency
  else:
    fault++
    if frames full:
      evict least recently used
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
    {
      name: "High Locality",
      generator: () => ({
        referenceString: [1, 2, 1, 3, 2, 1, 4, 1, 2, 3, 1, 2],
        frameCount: 3,
      }),
      expectedCase: "best",
    },
  ],
};

registerAlgorithm(lruPageMeta);

export function* lruPage(input: PageInput): AlgorithmGenerator<PageStep> {
  const { referenceString, frameCount } = input;
  const frames: (number | null)[] = Array(frameCount).fill(null);
  const lastUsed = new Map<number, number>();
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
    description: `LRU Page Replacement: ${referenceString.length} references, ${frameCount} frames`,
    codeLine: 1,
    variables: { frameCount },
  };

  for (let i = 0; i < referenceString.length; i++) {
    const page = referenceString[i];
    const inFrames = frames.includes(page);

    if (inFrames) {
      hitCount++;
      lastUsed.set(page, i);
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
        let lruPage = frames[0]!;
        let lruTime = lastUsed.get(lruPage) ?? -1;
        for (let f = 1; f < frameCount; f++) {
          const fp = frames[f]!;
          const ft = lastUsed.get(fp) ?? -1;
          if (ft < lruTime) {
            lruPage = fp;
            lruTime = ft;
          }
        }
        evicted = lruPage;
        const evictIdx = frames.indexOf(evicted);
        frames[evictIdx] = page;
      }

      lastUsed.set(page, i);

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
            ? `Page ${page}: FAULT — evicted LRU page ${evicted}`
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
    description: `LRU complete: ${faultCount} faults, ${hitCount} hits`,
    codeLine: 7,
    variables: { faultCount, hitCount },
  };
}
