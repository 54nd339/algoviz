"use client";

import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Shuffle } from "lucide-react";

import { Button } from "@/components/ui";
import { CategoryControlsHeader } from "@/components/visualizers/shared/category-controls-header";
import { OPTIMIZATION_GENERATORS } from "@/lib/algorithms/optimization";
import { is1DStart, is2DStart } from "@/lib/algorithms/optimization/types";
import { cn } from "@/lib/utils";
import { useVisualizer } from "@/hooks";
import type { AlgorithmStep } from "@/types";

import "@/lib/algorithms/optimization";

export interface OptimizationControlsHandle {
  applyStart(x: number, y: number): void;
}

interface OptimizationControlsProps {
  className?: string;
}

export const OptimizationControls = forwardRef<
  OptimizationControlsHandle,
  OptimizationControlsProps
>(function OptimizationControls({ className }, ref) {
  const { algorithmMeta, configure } = useVisualizer();

  const [startX, setStartX] = useState(-2);
  const [startY, setStartY] = useState(0);
  const lastInputRef = useRef<unknown>(null);

  const currentGen = algorithmMeta
    ? OPTIMIZATION_GENERATORS[algorithmMeta.id]
    : undefined;

  const is1D =
    algorithmMeta?.id === "hill-climbing" ||
    algorithmMeta?.id === "simulated-annealing";
  const is2D = algorithmMeta?.id === "gradient-descent";
  const showStart = is1D || is2D;

  const syncFromInput = useCallback((input: unknown) => {
    lastInputRef.current = input;
    if (is1DStart(input)) setStartX(input.start);
    if (is2DStart(input)) {
      setStartX(input.start.x);
      setStartY(input.start.y);
    }
  }, []);

  const defaultInput = useCallback(() => {
    if (!algorithmMeta?.presets?.[0]) return undefined;
    return algorithmMeta.presets[0].generator();
  }, [algorithmMeta]);

  const handleGenerateNew = useCallback(() => {
    if (!algorithmMeta || !currentGen) return;
    const preset = algorithmMeta.presets?.[0];
    if (preset) {
      const input = preset.generator() as Record<string, unknown>;
      const withStart =
        showStart && input
          ? is1D
            ? { ...input, start: startX }
            : is2D
              ? { ...input, start: { x: startX, y: startY } }
              : input
          : input;
      lastInputRef.current = withStart;
      configure(
        algorithmMeta,
        currentGen as (
          input: unknown,
        ) => Generator<AlgorithmStep, void, undefined>,
        withStart,
      );
    }
  }, [
    algorithmMeta,
    currentGen,
    configure,
    showStart,
    is1D,
    is2D,
    startX,
    startY,
  ]);

  const applyStart = useCallback(
    (newStartX: number, newStartY: number) => {
      const input = lastInputRef.current;
      if (!algorithmMeta || !currentGen || !input || typeof input !== "object")
        return;
      setStartX(newStartX);
      setStartY(newStartY);
      const next = is1D
        ? { ...(input as Record<string, unknown>), start: newStartX }
        : {
            ...(input as Record<string, unknown>),
            start: { x: newStartX, y: newStartY },
          };
      lastInputRef.current = next;
      configure(
        algorithmMeta,
        currentGen as (
          input: unknown,
        ) => Generator<AlgorithmStep, void, undefined>,
        next,
      );
    },
    [algorithmMeta, currentGen, configure, is1D],
  );

  useImperativeHandle(ref, () => ({ applyStart }), [applyStart]);

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <CategoryControlsHeader
        category="optimization"
        generators={
          OPTIMIZATION_GENERATORS as Record<
            string,
            (input: unknown) => Generator<AlgorithmStep, void, undefined>
          >
        }
        defaultInput={defaultInput()}
        onConfigure={syncFromInput}
        pickerClassName="w-52"
        presetsClassName="w-44"
      />

      {showStart && (
        <>
          <div className="flex items-center gap-2">
            <label className="font-mono text-[10px] text-text-muted">
              Start x
            </label>
            <input
              type="number"
              value={startX}
              onChange={(e) => {
                const v = Number(e.target.value);
                setStartX(v);
                applyStart(v, startY);
              }}
              step={0.5}
              className="h-7 w-20 rounded border border-border bg-bg-primary px-2 font-mono text-xs text-text-primary focus:border-accent-cyan focus:outline-none"
              aria-label="Start x"
            />
          </div>
          {is2D && (
            <div className="flex items-center gap-2">
              <label className="font-mono text-[10px] text-text-muted">
                Start y
              </label>
              <input
                type="number"
                value={startY}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setStartY(v);
                  applyStart(startX, v);
                }}
                step={0.5}
                className="h-7 w-20 rounded border border-border bg-bg-primary px-2 font-mono text-xs text-text-primary focus:border-accent-cyan focus:outline-none"
                aria-label="Start y"
              />
            </div>
          )}
        </>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={handleGenerateNew}
        className="gap-1.5"
      >
        <Shuffle size={14} />
        Restart
      </Button>
    </div>
  );
});
