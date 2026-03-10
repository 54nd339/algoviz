"use client";

import { useMemo } from "react";

import { getByCategory } from "@/lib/algorithms";
import { useVisualizer } from "@/hooks";
import type { AlgorithmCategory, AlgorithmMeta, AlgorithmStep } from "@/types";

import { AlgorithmPicker } from "./algorithm-picker";
import { InputPresets } from "./input-presets";

type GeneratorMap = Record<
  string,
  (input: unknown) => Generator<AlgorithmStep, void, undefined>
>;

interface CategoryControlsHeaderProps {
  category: AlgorithmCategory;
  generators: GeneratorMap;
  /** Subset of algorithms to show (e.g. filtered by sub-category). If omitted, all algorithms in the category are shown. */
  algorithms?: AlgorithmMeta[];
  defaultInput?: unknown;
  onConfigure?: (input: unknown) => void;
  pickerClassName?: string;
  presetsClassName?: string;
  children?: React.ReactNode;
}

/**
 * Renders an AlgorithmPicker + InputPresets pair for a given category.
 * Replaces the repeated boilerplate across 14+ control files.
 */
export function CategoryControlsHeader({
  category,
  generators,
  algorithms: algorithmsProp,
  defaultInput,
  onConfigure,
  pickerClassName = "w-52",
  presetsClassName = "w-44",
  children,
}: CategoryControlsHeaderProps) {
  const { algorithmMeta } = useVisualizer();
  const allAlgorithms = useMemo(() => getByCategory(category), [category]);
  const algorithms = algorithmsProp ?? allAlgorithms;

  const currentGen = algorithmMeta
    ? generators[algorithmMeta.id]
    : undefined;

  return (
    <>
      <AlgorithmPicker
        algorithms={algorithms}
        generators={generators}
        defaultInput={defaultInput}
        onConfigure={onConfigure}
        className={pickerClassName}
      />
      {algorithmMeta && currentGen && (
        <InputPresets
          meta={algorithmMeta}
          generatorFn={currentGen}
          onPresetApplied={onConfigure}
          className={presetsClassName}
        />
      )}
      {children}
    </>
  );
}
