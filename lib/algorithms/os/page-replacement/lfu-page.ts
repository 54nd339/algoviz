import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../../registry";
import type { PageInput, PageStep } from "../types";

export const lfuPageMeta: AlgorithmMeta = {
  id: "os-lfu-page",
  name: "LFU Page Replacement",
  category: "os",
  description:
    "Least Frequently Used: evicts the page accessed the fewest times. Ties broken by LRU. Good for workloads with clear frequency patterns.",
  timeComplexity: { best: "O(1)", average: "O(k)", worst: "O(k)" },
  spaceComplexity: "O(k)",
  pseudocode: `for each page in reference string:
  if page in frames:
    hit++, freq[page]++
  else:
    fault++
    if frames full:
      evict page with min frequency
    add page, freq[page] = 1`,
  presets: [
    {
      name: "Standard",
      generator: () => ({
        referenceString: [
          1, 2, 3, 4, 2, 1, 5, 6, 2, 1, 2, 3, 7, 6, 3, 2, 1, 2, 3, 6,
        ],
        frameCount: 4,
      }),
      expectedCase: "average",
    },
  ],
};

registerAlgorithm(lfuPageMeta);

export function* lfuPage(input: PageInput): AlgorithmGenerator<PageStep> {
  const { referenceString, frameCount } = input;
  const frames: (number | null)[] = Array(frameCount).fill(null);
  const freq = new Map<number, number>();
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
    description: `LFU Page Replacement: ${referenceString.length} references, ${frameCount} frames`,
    codeLine: 1,
    variables: { frameCount },
  };

  for (let i = 0; i < referenceString.length; i++) {
    const page = referenceString[i];
    const inFrames = frames.includes(page);

    if (inFrames) {
      hitCount++;
      freq.set(page, (freq.get(page) ?? 0) + 1);
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
        description: `Page ${page}: HIT (freq=${freq.get(page)})`,
        codeLine: 3,
        variables: { page, frequency: freq.get(page) },
      };
    } else {
      faultCount++;
      let evicted: number | null = null;
      const emptyIdx = frames.indexOf(null);

      if (emptyIdx !== -1) {
        frames[emptyIdx] = page;
      } else {
        let lfuPage = frames[0]!;
        let lfuFreq = freq.get(lfuPage) ?? 0;
        let lfuTime = lastUsed.get(lfuPage) ?? 0;

        for (let f = 1; f < frameCount; f++) {
          const fp = frames[f]!;
          const ff = freq.get(fp) ?? 0;
          const ft = lastUsed.get(fp) ?? 0;
          if (ff < lfuFreq || (ff === lfuFreq && ft < lfuTime)) {
            lfuPage = fp;
            lfuFreq = ff;
            lfuTime = ft;
          }
        }
        evicted = lfuPage;
        const evictIdx = frames.indexOf(evicted);
        frames[evictIdx] = page;
        freq.delete(evicted);
      }

      freq.set(page, 1);
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
            ? `Page ${page}: FAULT — evicted LFU page ${evicted}`
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
    description: `LFU complete: ${faultCount} faults, ${hitCount} hits`,
    codeLine: 7,
    variables: { faultCount, hitCount },
  };
}
