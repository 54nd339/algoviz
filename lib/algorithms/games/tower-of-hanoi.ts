import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import type { HanoiStep } from "./types";

export const hanoiMeta: AlgorithmMeta = {
  id: "tower-of-hanoi",
  name: "Tower of Hanoi",
  category: "games",
  description:
    "A classic recursive puzzle: move N disks from the source peg to the target peg using an auxiliary peg, never placing a larger disk on a smaller one. Requires 2^N - 1 moves.",
  timeComplexity: { best: "O(2^n)", average: "O(2^n)", worst: "O(2^n)" },
  spaceComplexity: "O(n)",
  pseudocode: `function hanoi(n, from, to, aux):
  if n == 0: return
  hanoi(n - 1, from, aux, to)
  move disk n from → to
  hanoi(n - 1, aux, to, from)`,
  presets: [
    {
      name: "3 Disks (7 moves)",
      generator: () => ({ numDisks: 3 }),
      expectedCase: "average",
    },
    {
      name: "4 Disks (15 moves)",
      generator: () => ({ numDisks: 4 }),
      expectedCase: "average",
    },
    {
      name: "5 Disks (31 moves)",
      generator: () => ({ numDisks: 5 }),
      expectedCase: "worst",
    },
    {
      name: "6 Disks (63 moves)",
      generator: () => ({ numDisks: 6 }),
      expectedCase: "worst",
    },
  ],
  misconceptions: [
    {
      myth: "There might be a faster solution than 2^n - 1 moves.",
      reality:
        "For the standard 3-peg Tower of Hanoi, 2^n - 1 is provably optimal. No algorithm can do better.",
    },
  ],
  relatedAlgorithms: ["minimax"],
};

registerAlgorithm(hanoiMeta);

export function* towerOfHanoi(input: {
  numDisks: number;
}): AlgorithmGenerator<HanoiStep> {
  const n = Math.min(Math.max(input.numDisks, 1), 8);
  const totalMoves = (1 << n) - 1;
  const pegs: number[][] = [Array.from({ length: n }, (_, i) => n - i), [], []];
  let moveNumber = 0;

  yield {
    type: "init",
    data: {
      pegs: pegs.map((p) => [...p]),
      movingDisk: 0,
      from: 0,
      to: 0,
      moveNumber: 0,
      totalMoves,
    },
    description: `Tower of Hanoi with ${n} disks — ${totalMoves} moves needed`,
    codeLine: 1,
    variables: { n, totalMoves },
    callStack: [{ name: "hanoi", args: { n, from: 0, to: 2, aux: 1 } }],
  };

  function* solve(
    numDisks: number,
    from: number,
    to: number,
    aux: number,
    depth: number,
  ): Generator<
    {
      type: string;
      data: HanoiStep;
      description: string;
      codeLine?: number;
      variables?: Record<string, unknown>;
      callStack?: { name: string; args: Record<string, unknown> }[];
    },
    void,
    undefined
  > {
    if (numDisks === 0) return;

    yield* solve(numDisks - 1, from, aux, to, depth + 1);

    const disk = pegs[from].pop()!;
    pegs[to].push(disk);
    moveNumber++;

    yield {
      type: "move",
      data: {
        pegs: pegs.map((p) => [...p]),
        movingDisk: disk,
        from,
        to,
        moveNumber,
        totalMoves,
      },
      description: `Move disk ${disk} from peg ${from} to peg ${to} (${moveNumber}/${totalMoves})`,
      codeLine: 4,
      variables: { disk, from, to, moveNumber },
      callStack: [{ name: "hanoi", args: { n: numDisks, from, to, aux } }],
    };

    yield* solve(numDisks - 1, aux, to, from, depth + 1);
  }

  yield* solve(n, 0, 2, 1, 0);

  yield {
    type: "done",
    data: {
      pegs: pegs.map((p) => [...p]),
      movingDisk: 0,
      from: 0,
      to: 2,
      moveNumber,
      totalMoves,
    },
    description: `All ${n} disks moved to target peg in ${moveNumber} moves!`,
    variables: { moveNumber, totalMoves },
  };
}
