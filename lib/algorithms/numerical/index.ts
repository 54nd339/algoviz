export { bisection, bisectionMeta } from "./bisection";
export { monteCarloPi, monteCarloPiMeta } from "./monte-carlo-pi";
export { newtonMethod, newtonMethodMeta } from "./newton-method";
export {
  numericalIntegration,
  numericalIntegrationMeta,
} from "./numerical-integration";
export type {
  IntegrationFunction,
  NumericalStep,
  NumericFunction,
} from "./types";
export { INTEGRATION_FUNCTIONS, NUMERIC_FUNCTIONS } from "./types";

import type { AlgorithmStep } from "@/types";

import { bisection } from "./bisection";
import { monteCarloPi } from "./monte-carlo-pi";
import { newtonMethod } from "./newton-method";
import { numericalIntegration } from "./numerical-integration";
import type { NumericalStep } from "./types";

export const NUMERICAL_GENERATORS: Record<
  string,
  (input: unknown) => Generator<AlgorithmStep<NumericalStep>, void, undefined>
> = {
  "newton-method": (input) =>
    newtonMethod(input as Parameters<typeof newtonMethod>[0]),
  bisection: (input) => bisection(input as Parameters<typeof bisection>[0]),
  "numerical-integration": (input) =>
    numericalIntegration(input as Parameters<typeof numericalIntegration>[0]),
  "monte-carlo-pi": (input) =>
    monteCarloPi(input as Parameters<typeof monteCarloPi>[0]),
};
