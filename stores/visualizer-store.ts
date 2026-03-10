import { createActor, type SnapshotFrom } from "xstate";
import { create } from "zustand";

import { type EngineContext, engineMachine } from "@/lib/engine";
import type { AlgorithmMeta, AlgorithmStep } from "@/types";

type EngineSnapshot = SnapshotFrom<typeof engineMachine>;
type EngineStateValue = EngineSnapshot["value"];

interface VisualizerState {
  snapshot: EngineSnapshot;
  send: (
    event: Parameters<
      ReturnType<typeof createActor<typeof engineMachine>>["send"]
    >[0],
  ) => void;
}

const actor = createActor(engineMachine);

export const useVisualizerStore = create<VisualizerState>(() => ({
  snapshot: actor.getSnapshot(),
  send: actor.send.bind(actor),
}));

actor.subscribe((snapshot) => {
  useVisualizerStore.setState({ snapshot });
});

actor.start();

export const useEngineState = (): EngineStateValue =>
  useVisualizerStore((s) => s.snapshot.value);

export const useCurrentStep = (): AlgorithmStep | null =>
  useVisualizerStore((s) => (s.snapshot.context as EngineContext).currentStep);

export const useStepIndex = (): number =>
  useVisualizerStore(
    (s) => (s.snapshot.context as EngineContext).currentStepIndex,
  );

export const useTotalMaterialized = (): number =>
  useVisualizerStore(
    (s) => (s.snapshot.context as EngineContext).totalMaterialized,
  );

export const useIsEngineComplete = (): boolean =>
  useVisualizerStore(
    (s) => (s.snapshot.context as EngineContext).isEngineComplete,
  );

export const useSpeed = (): number =>
  useVisualizerStore((s) => (s.snapshot.context as EngineContext).speed);

export const useAlgorithmMeta = (): AlgorithmMeta | null =>
  useVisualizerStore(
    (s) => (s.snapshot.context as EngineContext).algorithmMeta,
  );

export const useEngineInput = (): unknown =>
  useVisualizerStore((s) => (s.snapshot.context as EngineContext).input);

export const useSend = () => useVisualizerStore((s) => s.send);
