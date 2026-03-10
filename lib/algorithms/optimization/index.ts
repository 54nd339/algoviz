export { geneticAlgorithm, geneticAlgorithmMeta } from "./genetic-algorithm";
export { gradientDescent, gradientDescentMeta } from "./gradient-descent";
export { hillClimbing, hillClimbingMeta } from "./hill-climbing";
export {
  simulatedAnnealing,
  simulatedAnnealingMeta,
} from "./simulated-annealing";
export type { OptFunction1D, OptFunction2D, OptimizationStep } from "./types";
export { FUNCTIONS_1D, FUNCTIONS_2D } from "./types";

import type { AlgorithmStep } from "@/types";

import { geneticAlgorithm } from "./genetic-algorithm";
import { gradientDescent } from "./gradient-descent";
import { hillClimbing } from "./hill-climbing";
import { simulatedAnnealing } from "./simulated-annealing";
import type { OptimizationStep } from "./types";

export const OPTIMIZATION_GENERATORS: Record<
  string,
  (
    input: unknown,
  ) => Generator<AlgorithmStep<OptimizationStep>, void, undefined>
> = {
  "gradient-descent": (input) =>
    gradientDescent(input as Parameters<typeof gradientDescent>[0]),
  "hill-climbing": (input) =>
    hillClimbing(input as Parameters<typeof hillClimbing>[0]),
  "simulated-annealing": (input) =>
    simulatedAnnealing(input as Parameters<typeof simulatedAnnealing>[0]),
  "genetic-algorithm": (input) =>
    geneticAlgorithm(input as Parameters<typeof geneticAlgorithm>[0]),
};
