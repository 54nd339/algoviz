"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { getByCategory } from "@/lib/algorithms";
import type { SortStep } from "@/lib/algorithms/sorting";
import { SORTING_GENERATORS } from "@/lib/algorithms/sorting";
import { createStepEngine, type StepEngine } from "@/lib/engine";
import type { AlgorithmStep } from "@/types";

export interface RunState {
  id: string;
  name: string;
  engine: StepEngine<SortStep>;
  currentStep: AlgorithmStep<SortStep> | null;
  isComplete: boolean;
  stepCount: number;
}

function createRuns(size = 30): RunState[] {
  const algorithms = getByCategory("sorting");
  const arr = Array.from(
    { length: size },
    () => Math.floor(Math.random() * 100) + 1,
  );

  return algorithms
    .map((meta) => {
      const genFn = SORTING_GENERATORS[meta.id];
      if (!genFn) return null;

      const engine = createStepEngine(
        (input: unknown) =>
          genFn(input) as Generator<AlgorithmStep<SortStep>, void, undefined>,
        arr,
      );
      const firstStep = engine.stepForward();

      return {
        id: meta.id,
        name: meta.name,
        engine,
        currentStep: firstStep as AlgorithmStep<SortStep> | null,
        isComplete: engine.isComplete,
        stepCount: firstStep ? engine.currentIndex + 1 : 0,
      };
    })
    .filter(Boolean) as RunState[];
}

export function useSortingRace() {
  const [runs, setRuns] = useState<RunState[]>(() => createRuns());
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(100);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const initRuns = useCallback((size = 30) => {
    setRuns(createRuns(size));
    setPlaying(false);
  }, []);

  useEffect(() => {
    if (!playing) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setRuns((prev) => {
        const allDone = prev.every((r) => r.isComplete);
        if (allDone) {
          setPlaying(false);
          return prev;
        }

        return prev.map((run) => {
          if (run.isComplete) return run;
          const step = run.engine.stepForward();
          if (!step) return { ...run, isComplete: true };
          return {
            ...run,
            currentStep: step as AlgorithmStep<SortStep>,
            isComplete: run.engine.isComplete,
            stepCount: run.engine.currentIndex + 1,
          };
        });
      });
    }, speed);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [playing, speed]);

  const handleReset = useCallback(() => {
    setPlaying(false);
    initRuns();
  }, [initRuns]);

  return {
    runs,
    playing,
    speed,
    setPlaying,
    setSpeed,
    initRuns,
    handleReset,
  };
}
