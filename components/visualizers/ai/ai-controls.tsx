"use client";

import { useCallback, useState } from "react";
import { Shuffle, Trash2 } from "lucide-react";

import { Button, Slider } from "@/components/ui";
import { CategoryControlsHeader } from "@/components/visualizers/shared/category-controls-header";
import { AI_GENERATORS, type KMeansStep, type KNNStep } from "@/lib/algorithms/ai";
import { cn } from "@/lib/utils";
import { useVisualizer } from "@/hooks";
import type { AlgorithmStep } from "@/types";

import "@/lib/algorithms/ai";

interface AIControlsProps {
  className?: string;
  onClearPoints?: () => void;
  onSyncInput?: (input: unknown) => void;
}

function getKFromInput(input: unknown): number | undefined {
  if (
    input &&
    typeof input === "object" &&
    "k" in input &&
    typeof (input as { k: number }).k === "number"
  ) {
    return (input as { k: number }).k;
  }
  return undefined;
}

export function AIControls({
  className,
  onClearPoints,
  onSyncInput,
}: AIControlsProps) {
  const { algorithmMeta, configure, currentStep } = useVisualizer();
  const [k, setK] = useState(3);

  const currentGen = algorithmMeta
    ? AI_GENERATORS[algorithmMeta.id]
    : undefined;

  const isKNN = algorithmMeta?.id === "knn";
  const isKMeans = algorithmMeta?.id === "k-means";
  const showK = isKNN || isKMeans;

  const syncFromInput = useCallback(
    (input: unknown) => {
      const kVal = getKFromInput(input);
      if (kVal !== undefined) setK(kVal);
      onSyncInput?.(input);
    },
    [onSyncInput],
  );

  const defaultInput = useCallback(() => {
    if (!algorithmMeta) return undefined;
    const preset = algorithmMeta.presets?.[0];
    if (preset) {
      const input = preset.generator();
      if (isKNN || isKMeans) return { ...(input as object), k };
      return input;
    }
    return undefined;
  }, [algorithmMeta, isKNN, isKMeans, k]);

  const handleKChange = useCallback(
    (value: number) => {
      setK(value);
      if (!algorithmMeta || !currentGen) return;
      const stepData = currentStep?.data;
      if (
        isKNN &&
        stepData &&
        typeof stepData === "object" &&
        "points" in stepData &&
        "queryPoint" in stepData
      ) {
        const d = stepData as KNNStep;
        configure(
          algorithmMeta,
          currentGen as (
            input: unknown,
          ) => Generator<AlgorithmStep, void, undefined>,
          {
            points: d.points,
            queryPoint: d.queryPoint,
            k: value,
          },
        );
      } else if (
        isKMeans &&
        stepData &&
        typeof stepData === "object" &&
        "points" in stepData &&
        "centroids" in stepData
      ) {
        const d = stepData as KMeansStep;
        configure(
          algorithmMeta,
          currentGen as (
            input: unknown,
          ) => Generator<AlgorithmStep, void, undefined>,
          {
            points: d.points,
            k: value,
            maxIterations: 20,
          },
        );
      }
    },
    [algorithmMeta, currentGen, configure, currentStep?.data, isKNN, isKMeans],
  );

  const handleGenerateNew = useCallback(() => {
    if (!algorithmMeta || !currentGen) return;
    const preset = algorithmMeta.presets?.[0];
    if (preset) {
      const input = preset.generator();
      const withK =
        showK && typeof input === "object" && input !== null
          ? { ...input, k }
          : input;
      configure(
        algorithmMeta,
        currentGen as (
          input: unknown,
        ) => Generator<AlgorithmStep, void, undefined>,
        withK,
      );
    }
  }, [algorithmMeta, currentGen, configure, showK, k]);

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <CategoryControlsHeader
        category="ai"
        generators={
          AI_GENERATORS as Record<
            string,
            (input: unknown) => Generator<AlgorithmStep, void, undefined>
          >
        }
        defaultInput={defaultInput()}
        onConfigure={syncFromInput}
        pickerClassName="w-48"
        presetsClassName="w-44"
      />

      {showK && (
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-text-muted">k={k}</span>
          <Slider
            value={[k]}
            min={1}
            max={isKMeans ? 10 : 15}
            step={1}
            onValueChange={([v]) => handleKChange(v)}
            className="w-20"
            aria-label="k parameter"
          />
        </div>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={handleGenerateNew}
        className="gap-1.5"
      >
        <Shuffle size={14} />
        New Data
      </Button>

      {onClearPoints && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClearPoints}
          className="gap-1.5"
        >
          <Trash2 size={14} />
          Clear
        </Button>
      )}
    </div>
  );
}
