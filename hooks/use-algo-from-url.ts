"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

import { getByCategory } from "@/lib/algorithms";
import type { AlgorithmCategory, AlgorithmMeta, AlgorithmStep } from "@/types";

import { useVisualizer } from "./use-visualizer";

/**
 * Reads `?algo=<id>` from the URL and configures the visualizer engine
 * with the matching algorithm. Works for any category.
 */
export function useAlgoFromUrl(
  category: AlgorithmCategory,
  generators: Record<
    string,
    (input: unknown) => Generator<AlgorithmStep, void, undefined>
  >,
  defaultInputFactory?: (meta: AlgorithmMeta) => unknown,
) {
  const searchParams = useSearchParams();
  const { configure } = useVisualizer();
  const applied = useRef(false);

  useEffect(() => {
    const algoId = searchParams.get("algo");
    if (!algoId || applied.current) return;

    const algorithms = getByCategory(category);
    const meta = algorithms.find((a) => a.id === algoId);
    const gen = meta ? generators[meta.id] : undefined;
    if (!meta || !gen) return;

    applied.current = true;
    const input = defaultInputFactory
      ? defaultInputFactory(meta)
      : meta.presets?.[0]?.generator() ?? {};
    configure(meta, gen, input);
  }, [searchParams, category, generators, defaultInputFactory, configure]);
}
