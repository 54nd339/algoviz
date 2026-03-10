"use client";

import { useEffect } from "react";

import type { SortStep } from "@/lib/algorithms/sorting";
import type { AlgorithmStep } from "@/types";

export function useSortingSound(
  sortStep: AlgorithmStep<SortStep> | null,
  playTone: (freqRatio: number, durationMs: number) => void,
) {
  useEffect(() => {
    if (!sortStep?.data) return;
    const { comparing, swapping, array } = sortStep.data;
    if (!Array.isArray(array)) return;
    const maxVal = Math.max(...array, 1);

    if (Array.isArray(swapping) && swapping.length >= 2) {
      playTone(array[swapping[0]] / maxVal, 60);
      setTimeout(() => playTone(array[swapping[1]] / maxVal, 60), 30);
    } else if (Array.isArray(comparing) && comparing.length >= 1) {
      playTone(array[comparing[0]] / maxVal, 40);
    }
  }, [sortStep, playTone]);
}
