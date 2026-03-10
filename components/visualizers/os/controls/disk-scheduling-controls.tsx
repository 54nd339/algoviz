"use client";

import { useCallback, useState } from "react";

import { Button } from "@/components/ui";
import { OS_GENERATORS } from "@/lib/algorithms/os";
import { cn } from "@/lib/utils";
import { useVisualizer } from "@/hooks";
import type { AlgorithmStep } from "@/types";

import { inputStyle, labelStyle } from "./os-controls-shared";

interface DiskSchedulingControlsProps {
  /** Input from preset/algorithm picker; when set, local state syncs from this. */
  syncedInput?: unknown;
}

export function DiskSchedulingControls({
  syncedInput,
}: DiskSchedulingControlsProps) {
  const { algorithmMeta, configure } = useVisualizer();
  const [diskReqText, setDiskReqText] = useState(
    "98 183 37 122 14 124 65 67",
  );
  const [diskInitPos, setDiskInitPos] = useState(53);
  const [diskSize, setDiskSize] = useState(200);
  const [prevSyncedInput, setPrevSyncedInput] = useState(syncedInput);

  if (syncedInput !== prevSyncedInput) {
    setPrevSyncedInput(syncedInput);
    if (syncedInput && typeof syncedInput === "object") {
      const inp = syncedInput as Record<string, unknown>;
      if (Array.isArray(inp.requests)) {
        setDiskReqText((inp.requests as number[]).join(" "));
        if (typeof inp.initialPosition === "number")
          setDiskInitPos(inp.initialPosition);
        if (typeof inp.diskSize === "number") setDiskSize(inp.diskSize);
      }
    }
  }

  const applyDisk = useCallback(() => {
    if (!algorithmMeta) return;
    const gen = OS_GENERATORS[algorithmMeta.id];
    if (!gen) return;
    const reqs = diskReqText
      .split(/[\s,]+/)
      .map(Number)
      .filter((n) => !isNaN(n));
    configure(
      algorithmMeta,
      gen as (input: unknown) => Generator<AlgorithmStep, void, undefined>,
      {
        requests: reqs,
        initialPosition: diskInitPos,
        diskSize,
        direction: "up" as const,
      },
    );
  }, [algorithmMeta, configure, diskReqText, diskInitPos, diskSize]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className={labelStyle}>Requests:</span>
      <input
        type="text"
        value={diskReqText}
        onChange={(e) => setDiskReqText(e.target.value)}
        placeholder="98 183 37 122 14 124 65 67"
        className={cn(inputStyle, "w-56 text-left")}
      />
      <span className={labelStyle}>Head:</span>
      <input
        type="number"
        min={0}
        value={diskInitPos}
        onChange={(e) => setDiskInitPos(Number(e.target.value) || 0)}
        className={cn(inputStyle, "w-14")}
      />
      <span className={labelStyle}>Disk:</span>
      <input
        type="number"
        min={1}
        value={diskSize}
        onChange={(e) =>
          setDiskSize(Math.max(1, Number(e.target.value) || 200))
        }
        className={cn(inputStyle, "w-14")}
      />
      <Button variant="outline" size="sm" onClick={applyDisk}>
        Apply
      </Button>
    </div>
  );
}
