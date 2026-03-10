"use client";

import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";

import type { EngineContext } from "@/lib/engine";
import { useVisualizerStore } from "@/stores";
import type { AlgorithmMeta, AlgorithmStep } from "@/types";

export function useVisualizer() {
  const {
    engineState,
    currentStep,
    stepIndex,
    totalMaterialized,
    isComplete,
    speed,
    algorithmMeta,
    engineInput,
    send,
  } = useVisualizerStore(
    useShallow((s) => {
      const ctx = s.snapshot.context as EngineContext;
      return {
        engineState: s.snapshot.value,
        currentStep: ctx.currentStep,
        stepIndex: ctx.currentStepIndex,
        totalMaterialized: ctx.totalMaterialized,
        isComplete: ctx.isEngineComplete,
        speed: ctx.speed,
        algorithmMeta: ctx.algorithmMeta,
        engineInput: ctx.input,
        send: s.send,
      };
    }),
  );

  const configure = useCallback(
    (
      meta: AlgorithmMeta,
      generatorFn: (
        input: unknown,
      ) => Generator<AlgorithmStep, void, undefined>,
      input: unknown,
    ) => {
      send({
        type: "CONFIGURE",
        meta,
        algorithmId: meta.id,
        generatorFn,
        input,
      });
    },
    [send],
  );

  const isMaterializing = engineState === "materializing";

  const play = useCallback(() => send({ type: "PLAY" }), [send]);
  const pause = useCallback(() => send({ type: "PAUSE" }), [send]);
  const stepForward = useCallback(() => send({ type: "STEP_FORWARD" }), [send]);
  const stepBack = useCallback(() => send({ type: "STEP_BACK" }), [send]);
  const reset = useCallback(() => send({ type: "RESET" }), [send]);
  const clear = useCallback(() => send({ type: "CLEAR" }), [send]);

  const jumpTo = useCallback(
    (index: number) => send({ type: "JUMP_TO_STEP", index }),
    [send],
  );

  const setSpeed = useCallback(
    (newSpeed: number) => send({ type: "SET_SPEED", speed: newSpeed }),
    [send],
  );

  const isPlaying = engineState === "playing";
  const isPaused = engineState === "paused";
  const isReady = engineState === "ready";
  const isIdle = engineState === "idle";

  return {
    engineState,
    currentStep,
    stepIndex,
    totalMaterialized,
    isComplete,
    speed,
    algorithmMeta,
    engineInput,
    isPlaying,
    isPaused,
    isReady,
    isIdle,
    isMaterializing,
    configure,
    play,
    pause,
    stepForward,
    stepBack,
    reset,
    clear,
    jumpTo,
    setSpeed,
  };
}
