import type { AlgorithmStep } from "@/types";

export interface StepEngine<T = unknown> {
  stepForward: () => AlgorithmStep<T> | null;
  stepBack: () => AlgorithmStep<T> | null;
  jumpTo: (index: number) => AlgorithmStep<T> | null;
  reset: () => void;
  getCurrentStep: () => AlgorithmStep<T> | null;
  /** Run generator to completion so total step count is known from the start. */
  materializeAll: () => void;
  readonly isComplete: boolean;
  readonly totalMaterialized: number;
  readonly currentIndex: number;
}

export function createStepEngine<T, I>(
  generatorFn: (input: I) => Generator<AlgorithmStep<T>, void, undefined>,
  input: I,
): StepEngine<T> {
  let steps: AlgorithmStep<T>[] = [];
  let generator = generatorFn(input);
  let currentIndex = -1;
  let done = false;

  function materializeTo(targetIndex: number): void {
    while (steps.length <= targetIndex && !done) {
      const result = generator.next();
      if (result.done) {
        done = true;
        break;
      }
      steps.push(result.value);
    }
  }

  const engine: StepEngine<T> = {
    stepForward() {
      const nextIndex = currentIndex + 1;
      materializeTo(nextIndex);
      if (nextIndex < steps.length) {
        currentIndex = nextIndex;
        return steps[currentIndex];
      }
      return null;
    },

    stepBack() {
      if (currentIndex <= 0) return null;
      currentIndex--;
      return steps[currentIndex];
    },

    jumpTo(index: number) {
      if (index < 0) return null;
      materializeTo(index);
      if (index < steps.length) {
        currentIndex = index;
        return steps[currentIndex];
      }
      // If requested index exceeds available steps, go to last
      if (steps.length > 0) {
        currentIndex = steps.length - 1;
        return steps[currentIndex];
      }
      return null;
    },

    reset() {
      steps = [];
      generator = generatorFn(input);
      currentIndex = -1;
      done = false;
    },

    materializeAll() {
      while (!done) {
        const result = generator.next();
        if (result.done) {
          done = true;
          break;
        }
        steps.push(result.value);
      }
    },

    getCurrentStep() {
      if (currentIndex < 0 || currentIndex >= steps.length) return null;
      return steps[currentIndex];
    },

    get isComplete() {
      return done && currentIndex >= steps.length - 1;
    },

    get totalMaterialized() {
      return steps.length;
    },

    get currentIndex() {
      return currentIndex;
    },
  };

  return engine;
}

/** Create a step engine pre-loaded with steps (from a web worker). No generator needed. */
export function createStepEngineFromSteps<T>(
  preloadedSteps: AlgorithmStep<T>[],
): StepEngine<T> {
  let steps = preloadedSteps;
  let currentIndex = -1;

  const engine: StepEngine<T> = {
    stepForward() {
      const nextIndex = currentIndex + 1;
      if (nextIndex < steps.length) {
        currentIndex = nextIndex;
        return steps[currentIndex];
      }
      return null;
    },

    stepBack() {
      if (currentIndex <= 0) return null;
      currentIndex--;
      return steps[currentIndex];
    },

    jumpTo(index: number) {
      if (index < 0) return null;
      if (index < steps.length) {
        currentIndex = index;
        return steps[currentIndex];
      }
      if (steps.length > 0) {
        currentIndex = steps.length - 1;
        return steps[currentIndex];
      }
      return null;
    },

    reset() {
      steps = [];
      currentIndex = -1;
    },

    materializeAll() {
      // Already fully materialized — no-op
    },

    getCurrentStep() {
      if (currentIndex < 0 || currentIndex >= steps.length) return null;
      return steps[currentIndex];
    },

    get isComplete() {
      return currentIndex >= steps.length - 1;
    },

    get totalMaterialized() {
      return steps.length;
    },

    get currentIndex() {
      return currentIndex;
    },
  };

  return engine;
}
