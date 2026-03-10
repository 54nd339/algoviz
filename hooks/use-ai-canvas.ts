"use client";

import { useCallback, useMemo, useState } from "react";

import type { AIStep, DataPoint } from "@/lib/algorithms/ai";
import { AI_GENERATORS } from "@/lib/algorithms/ai";
import { buildInputWithPoints } from "@/lib/algorithms/ai/input-utils";
import { useVisualizer } from "@/hooks";
import type { AlgorithmStep } from "@/types";

export function useAICanvas(step: AlgorithmStep<AIStep> | null) {
  const { algorithmMeta, configure } = useVisualizer();
  const algoId = algorithmMeta?.id;
  const isNeuralNet = algoId === "neural-net";

  const [customPoints, setCustomPoints] = useState<DataPoint[] | null>(null);
  const [nextClass, setNextClass] = useState(0);
  const [k, setK] = useState(3);

  const points: DataPoint[] = useMemo(() => {
    if (!step?.data) return [];
    const d = step.data;
    if ("points" in d) return (d as { points: DataPoint[] }).points;
    return [];
  }, [step]);

  const xDomain: [number, number] = useMemo(() => {
    if (points.length === 0) return [0, 100];
    const xs = points.map((p) => p.x);
    return [Math.min(...xs) - 5, Math.max(...xs) + 5];
  }, [points]);

  const handleCanvasClick = useCallback(
    (point: DataPoint) => {
      if (!algorithmMeta || !algoId || isNeuralNet) return;
      const gen = AI_GENERATORS[algoId];
      if (!gen) return;

      const currentPts = customPoints ?? [...points];
      const newPoint: DataPoint = {
        x: Math.round(point.x * 10) / 10,
        y: Math.round(point.y * 10) / 10,
        class: nextClass,
      };
      const newPts = [...currentPts, newPoint];
      setCustomPoints(newPts);

      if (newPts.length >= 2) {
        const input = buildInputWithPoints(algoId, newPts, step, k);
        configure(
          algorithmMeta,
          gen as (input: unknown) => Generator<AlgorithmStep, void, undefined>,
          input,
        );
      }
    },
    [
      algorithmMeta,
      algoId,
      isNeuralNet,
      customPoints,
      points,
      nextClass,
      step,
      k,
      configure,
    ],
  );

  const handleClearPoints = useCallback(() => {
    setCustomPoints(null);
  }, []);

  const handleSyncK = useCallback((input: unknown) => {
    if (input && typeof input === "object" && "k" in input) {
      setK((input as { k: number }).k);
    }
    setCustomPoints(null);
  }, []);

  return {
    points,
    xDomain,
    customPoints,
    nextClass,
    setNextClass,
    k,
    algoId,
    isNeuralNet,
    step,
    handleCanvasClick,
    handleClearPoints,
    handleSyncK,
  };
}
