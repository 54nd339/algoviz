"use client";

import { useCallback, useState } from "react";
import { Shuffle, Volume2, VolumeX } from "lucide-react";

import { Button, Slider } from "@/components/ui";
import { AlgorithmPicker, InputPresets } from "@/components/visualizers/shared";
import { getByCategory } from "@/lib/algorithms";
import { SORTING_GENERATORS } from "@/lib/algorithms/sorting";
import { generateRandomArray } from "@/lib/algorithms/sorting/utils";
import { cn } from "@/lib/utils";
import { useSoundEnabled, useToggleSound } from "@/stores";
import { useVisualizer } from "@/hooks";

interface SortingControlsProps {
  /** When true, only show algorithm picker (e.g. for Art mode). */
  algorithmOnly?: boolean;
  /** Controlled array size. */
  arraySize?: number;
  onArraySizeChange?: (size: number) => void;
  className?: string;
}

export function SortingControls({
  algorithmOnly = false,
  arraySize: arraySizeProp,
  onArraySizeChange,
  className,
}: SortingControlsProps) {
  const { algorithmMeta, configure, reset } = useVisualizer();
  const [internalSize, setInternalSize] = useState(30);
  const arraySize = arraySizeProp ?? internalSize;
  const setArraySize = onArraySizeChange ?? setInternalSize;
  const soundEnabled = useSoundEnabled();
  const toggleSound = useToggleSound();

  const algorithms = getByCategory("sorting");

  const handleGenerateNew = useCallback(() => {
    const newArr = generateRandomArray(arraySize);
    if (algorithmMeta) {
      const gen = SORTING_GENERATORS[algorithmMeta.id];
      if (gen) {
        reset();
        configure(algorithmMeta, gen, newArr);
      }
    }
  }, [arraySize, algorithmMeta, configure, reset]);

  const handleSizeChange = useCallback(
    ([size]: number[]) => {
      setArraySize(size);
      if (algorithmMeta) {
        const newArr = generateRandomArray(size);
        const gen = SORTING_GENERATORS[algorithmMeta.id];
        if (gen) configure(algorithmMeta, gen, newArr);
      }
    },
    [algorithmMeta, configure, setArraySize],
  );

  const currentGen = algorithmMeta
    ? SORTING_GENERATORS[algorithmMeta.id]
    : undefined;

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <AlgorithmPicker
        algorithms={algorithms}
        generators={
          SORTING_GENERATORS as Record<
            string,
            (
              input: unknown,
            ) => Generator<import("@/types").AlgorithmStep, void, undefined>
          >
        }
        defaultInput={generateRandomArray(arraySize)}
        className="w-44"
      />

      {!algorithmOnly && (
        <>
          {algorithmMeta && currentGen && (
            <InputPresets
              meta={algorithmMeta}
              generatorFn={
                currentGen as (
                  input: unknown,
                ) => Generator<import("@/types").AlgorithmStep, void, undefined>
              }
              presetContext={{ arraySize: arraySize }}
              className="w-40"
            />
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateNew}
            className="gap-1.5"
          >
            <Shuffle size={14} />
            New Array
          </Button>

          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-text-muted">
              n={arraySize}
            </span>
            <Slider
              value={[arraySize]}
              min={10}
              max={200}
              step={5}
              onValueChange={handleSizeChange}
              className="w-24"
              aria-label="Array size"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSound}
              className="h-7 w-7"
              aria-label={soundEnabled ? "Mute" : "Unmute"}
            >
              {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
