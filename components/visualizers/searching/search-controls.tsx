"use client";

import { useCallback, useState } from "react";
import { Shuffle } from "lucide-react";

import { Button, Slider } from "@/components/ui";
import { CategoryControlsHeader } from "@/components/visualizers/shared/category-controls-header";
import { SEARCHING_GENERATORS } from "@/lib/algorithms/searching";
import {
  generateSortedArray,
  isSearchInput,
} from "@/lib/algorithms/searching/input-utils";
import { cn } from "@/lib/utils";
import { useVisualizer } from "@/hooks";

interface SearchControlsProps {
  className?: string;
}

export function SearchControls({ className }: SearchControlsProps) {
  const { algorithmMeta, configure, currentStep } = useVisualizer();
  const [arraySize, setArraySize] = useState(20);
  const [targetValue, setTargetValue] = useState(50);
  const [prevAlgoId, setPrevAlgoId] = useState<string | undefined>(undefined);

  if (algorithmMeta?.id !== prevAlgoId) {
    setPrevAlgoId(algorithmMeta?.id);
    const data = currentStep?.data as
      | { array?: number[]; target?: number }
      | undefined;
    if (algorithmMeta?.id && data) {
      if (data.array?.length) setArraySize(data.array.length);
      if (typeof data.target === "number") setTargetValue(data.target);
    }
  }

  const handleGenerateNew = useCallback(() => {
    const arr = generateSortedArray(arraySize);
    const target = arr[Math.floor(Math.random() * arr.length)];
    setTargetValue(target);
    if (algorithmMeta) {
      const gen = SEARCHING_GENERATORS[algorithmMeta.id];
      if (gen) configure(algorithmMeta, gen, { array: arr, target });
    }
  }, [arraySize, algorithmMeta, configure]);

  const handleSizeChange = useCallback(
    ([size]: number[]) => {
      setArraySize(size);
      const arr = generateSortedArray(size);
      const target = arr[Math.floor(Math.random() * arr.length)];
      setTargetValue(target);
      if (algorithmMeta) {
        const gen = SEARCHING_GENERATORS[algorithmMeta.id];
        if (gen) configure(algorithmMeta, gen, { array: arr, target });
      }
    },
    [algorithmMeta, configure],
  );

  const handleTargetChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Number(e.target.value);
      setTargetValue(val);
      if (algorithmMeta) {
        const arr = generateSortedArray(arraySize);
        const gen = SEARCHING_GENERATORS[algorithmMeta.id];
        if (gen) configure(algorithmMeta, gen, { array: arr, target: val });
      }
    },
    [arraySize, algorithmMeta, configure],
  );

  const syncFromInput = useCallback((input: unknown) => {
    if (!isSearchInput(input)) return;
    setArraySize(input.array.length);
    setTargetValue(input.target);
  }, []);

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <CategoryControlsHeader
        category="searching"
        generators={
          SEARCHING_GENERATORS as Record<
            string,
            (
              input: unknown,
            ) => Generator<import("@/types").AlgorithmStep, void, undefined>
          >
        }
        defaultInput={{
          array: generateSortedArray(arraySize),
          target: targetValue,
        }}
        onConfigure={syncFromInput}
        pickerClassName="w-48"
        presetsClassName="w-40"
      />

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
          max={50}
          step={5}
          onValueChange={handleSizeChange}
          className="w-20"
          aria-label="Array size"
        />
      </div>

      <div className="flex items-center gap-1.5">
        <label className="font-mono text-[10px] text-text-muted">Target:</label>
        <input
          type="number"
          value={targetValue}
          onChange={handleTargetChange}
          className="h-7 w-16 rounded border border-border bg-bg-surface px-2 font-mono text-xs text-text-primary focus:border-accent-green focus:outline-none"
        />
      </div>
    </div>
  );
}
