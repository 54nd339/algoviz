"use client";

import { useCallback, useState } from "react";

import { Button } from "@/components/ui";
import { OS_GENERATORS } from "@/lib/algorithms/os";
import { cn } from "@/lib/utils";
import { useVisualizer } from "@/hooks";
import type { AlgorithmStep } from "@/types";

import { inputStyle, labelStyle } from "./os-controls-shared";

interface PageReplacementControlsProps {
  /** Input from preset/algorithm picker; when set, local state syncs from this. */
  syncedInput?: unknown;
}

export function PageReplacementControls({
  syncedInput,
}: PageReplacementControlsProps) {
  const { algorithmMeta, configure } = useVisualizer();
  const [refStringText, setRefStringText] = useState(
    "7 0 1 2 0 3 0 4 2 3 0 3 2 1 2 0 1 7 0 1",
  );
  const [frameCount, setFrameCount] = useState(3);
  const [prevSyncedInput, setPrevSyncedInput] = useState(syncedInput);

  if (syncedInput !== prevSyncedInput) {
    setPrevSyncedInput(syncedInput);
    if (syncedInput && typeof syncedInput === "object") {
      const inp = syncedInput as Record<string, unknown>;
      if (Array.isArray(inp.referenceString)) {
        setRefStringText((inp.referenceString as number[]).join(" "));
        if (typeof inp.frameCount === "number") setFrameCount(inp.frameCount);
      }
    }
  }

  const applyPageReplacement = useCallback(() => {
    if (!algorithmMeta) return;
    const gen = OS_GENERATORS[algorithmMeta.id];
    if (!gen) return;
    const nums = refStringText
      .split(/[\s,]+/)
      .map(Number)
      .filter((n) => !isNaN(n));
    configure(
      algorithmMeta,
      gen as (input: unknown) => Generator<AlgorithmStep, void, undefined>,
      {
        referenceString: nums,
        frameCount,
      },
    );
  }, [algorithmMeta, configure, refStringText, frameCount]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className={labelStyle}>Ref string:</span>
      <input
        type="text"
        value={refStringText}
        onChange={(e) => setRefStringText(e.target.value)}
        placeholder="7 0 1 2 0 3 0 4"
        className={cn(inputStyle, "w-64 text-left")}
      />
      <span className={labelStyle}>Frames:</span>
      <input
        type="number"
        min={1}
        max={10}
        value={frameCount}
        onChange={(e) =>
          setFrameCount(
            Math.max(1, Math.min(10, Number(e.target.value) || 3)),
          )
        }
        className={cn(inputStyle, "w-10")}
      />
      <Button variant="outline" size="sm" onClick={applyPageReplacement}>
        Apply
      </Button>
    </div>
  );
}
