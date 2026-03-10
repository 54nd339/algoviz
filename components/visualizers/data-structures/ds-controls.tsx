"use client";

import { useCallback } from "react";
import { Layers, Shuffle } from "lucide-react";

import { Button, Switch } from "@/components/ui";
import { CategoryControlsHeader } from "@/components/visualizers/shared/category-controls-header";
import { getByCategory } from "@/lib/algorithms";
import { DS_GENERATORS } from "@/lib/algorithms/data-structures";
import { cn } from "@/lib/utils";
import { useVisualizer } from "@/hooks";
import type { AlgorithmStep } from "@/types";

interface DSControlsProps {
  showMemoryLayout: boolean;
  onMemoryLayoutChange: (v: boolean) => void;
  className?: string;
}

export function DSControls({
  showMemoryLayout,
  onMemoryLayoutChange,
  className,
}: DSControlsProps) {
  const { algorithmMeta, configure } = useVisualizer();
  const algorithms = getByCategory("data-structures");

  const getDefaultInput = useCallback(
    (id: string) => {
      const meta = algorithms.find((a) => a.id === id);
      if (meta?.presets?.[0]) {
        return meta.presets[0].generator();
      }
      return [];
    },
    [algorithms],
  );

  const handleRandomize = useCallback(() => {
    if (!algorithmMeta) return;
    const gen = DS_GENERATORS[algorithmMeta.id];
    if (!gen) return;

    const preset = algorithmMeta.presets?.[0];
    if (preset) {
      configure(algorithmMeta, gen, preset.generator());
    }
  }, [algorithmMeta, configure]);

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <CategoryControlsHeader
        category="data-structures"
        generators={
          DS_GENERATORS as Record<
            string,
            (input: unknown) => Generator<AlgorithmStep, void, undefined>
          >
        }
        defaultInput={
          algorithmMeta
            ? getDefaultInput(algorithmMeta.id)
            : getDefaultInput(algorithms[0]?.id ?? "stack")
        }
        pickerClassName="w-52"
        presetsClassName="w-40"
      />

      <Button
        variant="outline"
        size="sm"
        onClick={handleRandomize}
        className="gap-1.5"
      >
        <Shuffle size={14} />
        Reset
      </Button>

      <div className="flex items-center gap-1.5">
        <Layers
          size={14}
          className={cn(
            "text-text-muted",
            showMemoryLayout && "text-accent-green",
          )}
        />
        <Switch
          checked={showMemoryLayout}
          onCheckedChange={onMemoryLayoutChange}
          aria-label="Memory layout"
        />
        <span className="font-mono text-[10px] text-text-muted">Memory</span>
      </div>
    </div>
  );
}
