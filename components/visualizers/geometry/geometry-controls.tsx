"use client";

import { useCallback, useState } from "react";
import { Shuffle } from "lucide-react";

import { Button, Slider } from "@/components/ui";
import { CategoryControlsHeader } from "@/components/visualizers/shared/category-controls-header";
import { GEOMETRY_GENERATORS, type Point, type Segment } from "@/lib/algorithms/geometry";
import { cn } from "@/lib/utils";
import { useVisualizer } from "@/hooks";
import type { AlgorithmStep } from "@/types";

interface GeometryControlsProps {
  className?: string;
}

const SWEEP_ALGOS = new Set(["sweep-line-intersection"]);

function generateRandomPoints(n: number): Point[] {
  return Array.from({ length: n }, (_, i) => ({
    x: Math.round(Math.random() * 480 + 60),
    y: Math.round(Math.random() * 380 + 60),
    id: `p${i}`,
  }));
}

function generateRandomSegments(n: number): Segment[] {
  return Array.from({ length: n }, (_, i) => ({
    p1: {
      x: Math.round(Math.random() * 400 + 50),
      y: Math.round(Math.random() * 350 + 50),
      id: `p1_${i}`,
    },
    p2: {
      x: Math.round(Math.random() * 400 + 100),
      y: Math.round(Math.random() * 350 + 50),
      id: `p2_${i}`,
    },
    id: `s${i}`,
  }));
}

function defaultInputForAlgorithm(id: string, count: number): unknown {
  if (SWEEP_ALGOS.has(id)) return generateRandomSegments(count);
  return generateRandomPoints(count);
}

export function GeometryControls({ className }: GeometryControlsProps) {
  const { algorithmMeta, configure } = useVisualizer();
  const [pointCount, setPointCount] = useState(12);

  const isSweep = algorithmMeta ? SWEEP_ALGOS.has(algorithmMeta.id) : false;

  const syncFromInput = useCallback((input: unknown) => {
    if (Array.isArray(input) && input.length > 0) {
      setPointCount(input.length);
    }
  }, []);

  const handleGenerate = useCallback(() => {
    if (!algorithmMeta) return;
    const gen = GEOMETRY_GENERATORS[algorithmMeta.id];
    if (!gen) return;
    const input = defaultInputForAlgorithm(algorithmMeta.id, pointCount);
    configure(
      algorithmMeta,
      gen as (input: unknown) => Generator<AlgorithmStep, void, undefined>,
      input,
    );
  }, [algorithmMeta, pointCount, configure]);

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <CategoryControlsHeader
        category="geometry"
        generators={
          GEOMETRY_GENERATORS as Record<
            string,
            (input: unknown) => Generator<AlgorithmStep, void, undefined>
          >
        }
        defaultInput={defaultInputForAlgorithm(
          algorithmMeta?.id ?? "graham-scan",
          pointCount,
        )}
        onConfigure={syncFromInput}
        pickerClassName="w-52"
        presetsClassName="w-44"
      />

      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] text-text-muted">
          {isSweep ? `segs=${pointCount}` : `pts=${pointCount}`}
        </span>
        <Slider
          value={[pointCount]}
          min={4}
          max={30}
          step={1}
          onValueChange={([v]) => setPointCount(v)}
          className="w-20"
          aria-label={isSweep ? "Segment count" : "Point count"}
        />
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={handleGenerate}
        className="gap-1.5"
      >
        <Shuffle size={14} />
        Generate
      </Button>
    </div>
  );
}
