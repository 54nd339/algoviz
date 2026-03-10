import * as Comlink from "comlink";

import { AI_GENERATORS } from "@/lib/algorithms/ai";
import { CRYPTO_GENERATORS } from "@/lib/algorithms/crypto";
import { DS_GENERATORS } from "@/lib/algorithms/data-structures";
import { DP_GENERATORS } from "@/lib/algorithms/dp";
import { FRACTAL_GENERATORS } from "@/lib/algorithms/fractals";
import { GAMES_GENERATORS } from "@/lib/algorithms/games";
import { GEOMETRY_GENERATORS } from "@/lib/algorithms/geometry";
import { GRAPH_GENERATORS } from "@/lib/algorithms/graph";
import { NUMERICAL_GENERATORS } from "@/lib/algorithms/numerical";
import { OPTIMIZATION_GENERATORS } from "@/lib/algorithms/optimization";
import { OS_GENERATORS } from "@/lib/algorithms/os";
import { PATHFINDING_GENERATORS } from "@/lib/algorithms/pathfinding";
import { SEARCHING_GENERATORS } from "@/lib/algorithms/searching";
import { SORTING_GENERATORS } from "@/lib/algorithms/sorting";
import {
  REGEX_NFA_GENERATOR,
  STRING_GENERATORS,
} from "@/lib/algorithms/string";
import type { AlgorithmStep } from "@/types";

type GenFn = (input: unknown) => Generator<AlgorithmStep, void, undefined>;

const ALL_GENERATORS: Record<string, GenFn> = {
  ...(SORTING_GENERATORS as Record<string, GenFn>),
  ...(SEARCHING_GENERATORS as Record<string, GenFn>),
  ...(NUMERICAL_GENERATORS as Record<string, GenFn>),
  ...(PATHFINDING_GENERATORS as Record<string, GenFn>),
  ...(GRAPH_GENERATORS as Record<string, GenFn>),
  ...(OPTIMIZATION_GENERATORS as Record<string, GenFn>),
  ...(STRING_GENERATORS as Record<string, GenFn>),
  "regex-nfa": REGEX_NFA_GENERATOR as GenFn,
  ...(GEOMETRY_GENERATORS as Record<string, GenFn>),
  ...(DP_GENERATORS as Record<string, GenFn>),
  ...(AI_GENERATORS as Record<string, GenFn>),
  ...(GAMES_GENERATORS as Record<string, GenFn>),
  ...(FRACTAL_GENERATORS as Record<string, GenFn>),
  ...(OS_GENERATORS as Record<string, GenFn>),
  ...(DS_GENERATORS as Record<string, GenFn>),
  ...(CRYPTO_GENERATORS as Record<string, GenFn>),
};

const engineWorker = {
  materializeSteps(algorithmId: string, input: unknown): AlgorithmStep[] {
    const genFn = ALL_GENERATORS[algorithmId];
    if (!genFn) {
      throw new Error(`Unknown algorithm: ${algorithmId}`);
    }
    const generator = genFn(input);
    const steps: AlgorithmStep[] = [];
    while (true) {
      const result = generator.next();
      if (result.done) break;
      steps.push(result.value);
    }
    return steps;
  },
};

export type EngineWorker = typeof engineWorker;

Comlink.expose(engineWorker);
