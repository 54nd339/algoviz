/**
 * Type guard for numerical integration input.
 */
export function isIntegrationInput(
  input: unknown,
): input is { functionId: string; segments: number } {
  return (
    typeof input === "object" &&
    input !== null &&
    "functionId" in input &&
    "segments" in input &&
    typeof (input as { segments: number }).segments === "number"
  );
}

/**
 * Type guard for Monte Carlo input.
 */
export function isMonteCarloInput(
  input: unknown,
): input is { numSamples: number; batchSize: number } {
  return (
    typeof input === "object" &&
    input !== null &&
    "numSamples" in input &&
    "batchSize" in input &&
    typeof (input as { numSamples: number }).numSamples === "number"
  );
}

export type BisectionCustomInput = {
  functionId: "custom";
  customExpression: string;
  a: number;
  b: number;
  tolerance: number;
  maxIterations: number;
};

export type NewtonCustomInput = {
  functionId: "custom";
  customExpression: string;
  customDomain: [number, number];
  initialGuess: number;
  tolerance: number;
  maxIterations: number;
};

export type IntegrationCustomInput = {
  functionId: "custom";
  customExpression: string;
  customDomain: [number, number];
  segments: number;
};

export type NumericalCustomInput =
  | BisectionCustomInput
  | NewtonCustomInput
  | IntegrationCustomInput;

/**
 * Builds algorithm-specific input config from custom expression and domain.
 * Returns null if the algorithm does not support custom input.
 */
export function buildCustomNumericalInput(
  algoId: string,
  customExpr: string,
  domainA: number,
  domainB: number,
  segments?: number,
): NumericalCustomInput | null {
  const a = domainA;
  const b = domainB;

  if (algoId === "bisection") {
    return {
      functionId: "custom",
      customExpression: customExpr,
      a,
      b,
      tolerance: 1e-8,
      maxIterations: 30,
    };
  }

  if (algoId === "newton-method") {
    const guess = (a + b) / 2;
    return {
      functionId: "custom",
      customExpression: customExpr,
      customDomain: [a, b],
      initialGuess: guess,
      tolerance: 1e-10,
      maxIterations: 20,
    };
  }

  if (algoId === "numerical-integration" && typeof segments === "number") {
    return {
      functionId: "custom",
      customExpression: customExpr,
      customDomain: [a, b],
      segments,
    };
  }

  return null;
}
