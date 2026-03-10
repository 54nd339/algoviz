"use client";

import { useCallback, useState } from "react";

import { Button } from "@/components/ui";
import { OS_GENERATORS } from "@/lib/algorithms/os";
import { cn } from "@/lib/utils";
import { useVisualizer } from "@/hooks";
import type { AlgorithmStep } from "@/types";

import { inputStyle, labelStyle } from "./os-controls-shared";

interface BankersControlsProps {
  /** Input from preset/algorithm picker; when set, local state syncs from this. */
  syncedInput?: unknown;
}

export function BankersControls({ syncedInput }: BankersControlsProps) {
  const { algorithmMeta, configure } = useVisualizer();
  const [bankerAvailableText, setBankerAvailableText] = useState("3 3 2");
  const [bankerMaxText, setBankerMaxText] = useState(
    "7 5 3, 3 2 2, 9 0 2, 2 2 2, 4 3 3",
  );
  const [bankerAllocText, setBankerAllocText] = useState(
    "0 1 0, 2 0 0, 3 0 2, 2 1 1, 0 0 2",
  );

  const [prevSyncedInput, setPrevSyncedInput] = useState(syncedInput);

  if (syncedInput !== prevSyncedInput) {
    setPrevSyncedInput(syncedInput);
    if (syncedInput && typeof syncedInput === "object") {
      const inp = syncedInput as Record<string, unknown>;
      if (
        Array.isArray(inp.available) &&
        Array.isArray(inp.max) &&
        Array.isArray(inp.allocation)
      ) {
        setBankerAvailableText((inp.available as number[]).join(" "));
        setBankerMaxText(
          (inp.max as number[][]).map((r) => r.join(" ")).join(", "),
        );
        setBankerAllocText(
          (inp.allocation as number[][]).map((r) => r.join(" ")).join(", "),
        );
      }
    }
  }

  const applyBankers = useCallback(() => {
    if (!algorithmMeta) return;
    const gen = OS_GENERATORS[algorithmMeta.id];
    if (!gen) return;
    const available = bankerAvailableText
      .split(/[\s,]+/)
      .map(Number)
      .filter((n) => !isNaN(n));
    const max = bankerMaxText
      .split(",")
      .map((row) => row.trim().split(/\s+/).map(Number));
    const allocation = bankerAllocText
      .split(",")
      .map((row) => row.trim().split(/\s+/).map(Number));
    configure(
      algorithmMeta,
      gen as (input: unknown) => Generator<AlgorithmStep, void, undefined>,
      {
        available,
        max,
        allocation,
      },
    );
  }, [
    algorithmMeta,
    configure,
    bankerAvailableText,
    bankerMaxText,
    bankerAllocText,
  ]);

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-center gap-2">
        <span className={labelStyle}>Available:</span>
        <input
          type="text"
          value={bankerAvailableText}
          onChange={(e) => setBankerAvailableText(e.target.value)}
          placeholder="3 3 2"
          className={cn(inputStyle, "w-28 text-left")}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className={labelStyle}>Max (rows comma-separated):</span>
        <input
          type="text"
          value={bankerMaxText}
          onChange={(e) => setBankerMaxText(e.target.value)}
          placeholder="7 5 3, 3 2 2, 9 0 2"
          className={cn(inputStyle, "w-72 text-left")}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className={labelStyle}>
          Allocation (rows comma-separated):
        </span>
        <input
          type="text"
          value={bankerAllocText}
          onChange={(e) => setBankerAllocText(e.target.value)}
          placeholder="0 1 0, 2 0 0, 3 0 2"
          className={cn(inputStyle, "w-72 text-left")}
        />
        <Button variant="outline" size="sm" onClick={applyBankers}>
          Apply
        </Button>
      </div>
    </div>
  );
}
