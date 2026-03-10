import { assign, fromCallback, fromPromise, setup } from "xstate";

import { getEngineWorker } from "@/lib/workers/worker-api";
import type { AlgorithmMeta, AlgorithmStep } from "@/types";

import { createStepEngineFromSteps, type StepEngine } from "./step-engine";

export interface EngineContext {
  stepEngine: StepEngine | null;
  currentStep: AlgorithmStep | null;
  currentStepIndex: number;
  totalMaterialized: number;
  isEngineComplete: boolean;
  speed: number;
  algorithmMeta: AlgorithmMeta | null;
  algorithmId: string | null;
  generatorFn:
    | ((input: unknown) => Generator<AlgorithmStep, void, undefined>)
    | null;
  input: unknown;
}

type EngineEvent =
  | {
      type: "CONFIGURE";
      meta: AlgorithmMeta;
      algorithmId: string;
      generatorFn: (
        input: unknown,
      ) => Generator<AlgorithmStep, void, undefined>;
      input: unknown;
    }
  | { type: "PLAY" }
  | { type: "PAUSE" }
  | { type: "STEP_FORWARD" }
  | { type: "STEP_BACK" }
  | { type: "RESET" }
  | { type: "CLEAR" }
  | { type: "SET_SPEED"; speed: number }
  | { type: "JUMP_TO_STEP"; index: number }
  | { type: "TICK" };

const autoPlayActor = fromCallback<EngineEvent, { speed: number }>(
  ({ sendBack, input }) => {
    const id = setInterval(() => {
      sendBack({ type: "TICK" });
    }, input.speed);
    return () => clearInterval(id);
  },
);

const materializeActor = fromPromise<
  AlgorithmStep[],
  { algorithmId: string; input: unknown }
>(async ({ input, signal }) => {
  const worker = getEngineWorker();
  const steps = await worker.materializeSteps(input.algorithmId, input.input);

  if (signal.aborted) throw new Error("aborted");
  return steps as AlgorithmStep[];
});

export const engineMachine = setup({
  types: {
    context: {} as EngineContext,
    events: {} as EngineEvent,
  },
  actors: {
    autoPlay: autoPlayActor,
    materialize: materializeActor,
  },
  guards: {
    hasNextStep: ({ context }) => {
      if (!context.stepEngine) return false;
      return !context.stepEngine.isComplete;
    },
    hasPrevStep: ({ context }) => {
      return context.currentStepIndex > 0;
    },
    hasEngine: ({ context }) => {
      return context.stepEngine !== null;
    },
  },
  actions: {
    storeConfigureIntent: assign(({ event }) => {
      if (event.type !== "CONFIGURE") return {};
      return {
        algorithmMeta: event.meta,
        algorithmId: event.algorithmId,
        generatorFn: event.generatorFn,
        input: event.input,
        stepEngine: null,
        currentStep: null,
        currentStepIndex: -1,
        totalMaterialized: 0,
        isEngineComplete: false,
      };
    }),
    loadSteps: assign(({ event }) => {
      const steps = (event as unknown as { output: AlgorithmStep[] }).output;
      const engine = createStepEngineFromSteps(steps);
      const firstStep = engine.stepForward();
      return {
        stepEngine: engine,
        currentStep: firstStep ?? null,
        currentStepIndex: firstStep ? engine.currentIndex : -1,
        totalMaterialized: engine.totalMaterialized,
        isEngineComplete: engine.isComplete,
      };
    }),
    advanceStep: assign(({ context }) => {
      if (!context.stepEngine) return {};
      const step = context.stepEngine.stepForward();
      if (!step) return { isEngineComplete: true };
      return {
        currentStep: step,
        currentStepIndex: context.stepEngine.currentIndex,
        totalMaterialized: context.stepEngine.totalMaterialized,
        isEngineComplete: context.stepEngine.isComplete,
      };
    }),
    rewindStep: assign(({ context }) => {
      if (!context.stepEngine) return {};
      const step = context.stepEngine.stepBack();
      if (!step) return {};
      return {
        currentStep: step,
        currentStepIndex: context.stepEngine.currentIndex,
        totalMaterialized: context.stepEngine.totalMaterialized,
      };
    }),
    jumpToStep: assign(({ context, event }) => {
      if (!context.stepEngine || event.type !== "JUMP_TO_STEP") return {};
      const step = context.stepEngine.jumpTo(event.index);
      if (!step) return {};
      return {
        currentStep: step,
        currentStepIndex: context.stepEngine.currentIndex,
        totalMaterialized: context.stepEngine.totalMaterialized,
        isEngineComplete: context.stepEngine.isComplete,
      };
    }),
    resetEngine: assign(({ context }) => {
      if (!context.stepEngine) return {};
      context.stepEngine.reset();
      return {
        currentStep: null,
        currentStepIndex: -1,
        totalMaterialized: 0,
        isEngineComplete: false,
      };
    }),
    updateSpeed: assign(({ event }) => {
      if (event.type !== "SET_SPEED") return {};
      return { speed: event.speed };
    }),
    clearEngine: assign(() => ({
      stepEngine: null,
      currentStep: null,
      currentStepIndex: -1,
      totalMaterialized: 0,
      isEngineComplete: false,
      algorithmMeta: null,
      algorithmId: null,
      generatorFn: null,
      input: null,
    })),
  },
}).createMachine({
  id: "engine",
  initial: "idle",
  context: {
    stepEngine: null,
    currentStep: null,
    currentStepIndex: -1,
    totalMaterialized: 0,
    isEngineComplete: false,
    speed: 500,
    algorithmMeta: null,
    algorithmId: null,
    generatorFn: null,
    input: null,
  },
  on: {
    SET_SPEED: { actions: "updateSpeed" },
    CLEAR: { target: ".idle", actions: "clearEngine" },
  },
  states: {
    idle: {
      on: {
        CONFIGURE: {
          target: "materializing",
          actions: "storeConfigureIntent",
        },
      },
    },
    materializing: {
      invoke: {
        id: "materializeWorker",
        src: "materialize",
        input: ({ context }) => ({
          algorithmId: context.algorithmId!,
          input: context.input,
        }),
        onDone: {
          target: "ready",
          actions: "loadSteps",
        },
        onError: {
          target: "idle",
        },
      },
      on: {
        CONFIGURE: {
          target: "materializing",
          actions: "storeConfigureIntent",
          reenter: true,
        },
      },
    },
    ready: {
      on: {
        PLAY: { target: "playing", guard: "hasNextStep" },
        STEP_FORWARD: {
          target: "stepping",
          guard: "hasNextStep",
        },
        JUMP_TO_STEP: {
          target: "paused",
          actions: "jumpToStep",
        },
        CONFIGURE: {
          target: "materializing",
          actions: "storeConfigureIntent",
        },
      },
    },
    playing: {
      invoke: {
        src: "autoPlay",
        input: ({ context }) => ({ speed: context.speed }),
      },
      on: {
        TICK: [
          {
            guard: "hasNextStep",
            actions: "advanceStep",
          },
          { target: "complete" },
        ],
        PAUSE: "paused",
        RESET: { target: "ready", actions: "resetEngine" },
        SET_SPEED: {
          target: "playing",
          actions: "updateSpeed",
          reenter: true,
        },
        CONFIGURE: {
          target: "materializing",
          actions: "storeConfigureIntent",
        },
      },
    },
    paused: {
      on: {
        PLAY: { target: "playing", guard: "hasNextStep" },
        STEP_FORWARD: [
          {
            guard: "hasNextStep",
            actions: "advanceStep",
          },
          { target: "complete" },
        ],
        STEP_BACK: {
          guard: "hasPrevStep",
          actions: "rewindStep",
        },
        JUMP_TO_STEP: {
          actions: "jumpToStep",
        },
        RESET: { target: "ready", actions: "resetEngine" },
        CONFIGURE: {
          target: "materializing",
          actions: "storeConfigureIntent",
        },
      },
    },
    stepping: {
      entry: "advanceStep",
      always: [
        {
          target: "complete",
          guard: ({ context }) => context.isEngineComplete,
        },
        { target: "paused" },
      ],
    },
    complete: {
      on: {
        RESET: { target: "ready", actions: "resetEngine" },
        STEP_BACK: {
          target: "paused",
          guard: "hasPrevStep",
          actions: "rewindStep",
        },
        JUMP_TO_STEP: {
          target: "paused",
          actions: "jumpToStep",
        },
        CONFIGURE: {
          target: "materializing",
          actions: "storeConfigureIntent",
        },
      },
    },
  },
});
