"use client";

import { useCallback, useState } from "react";

import { Button } from "@/components/ui";
import { OS_GENERATORS } from "@/lib/algorithms/os";
import { cn } from "@/lib/utils";
import { useVisualizer } from "@/hooks";
import type { AlgorithmStep } from "@/types";

import type { ProcessInput } from "./os-controls-shared";
import { inputStyle, labelStyle } from "./os-controls-shared";

interface SchedulingControlsProps {
  /** Input from preset/algorithm picker; when set, local state syncs from this. */
  syncedInput?: unknown;
}

export function SchedulingControls({ syncedInput }: SchedulingControlsProps) {
  const { algorithmMeta, configure } = useVisualizer();
  const [processes, setProcesses] = useState<ProcessInput[]>([
    { id: "P1", arrivalTime: 0, burstTime: 7, priority: 1 },
    { id: "P2", arrivalTime: 2, burstTime: 4, priority: 2 },
    { id: "P3", arrivalTime: 4, burstTime: 1, priority: 3 },
    { id: "P4", arrivalTime: 5, burstTime: 4, priority: 4 },
  ]);
  const [timeQuantum, setTimeQuantum] = useState(2);
  const [prevSyncedInput, setPrevSyncedInput] = useState(syncedInput);

  if (syncedInput !== prevSyncedInput) {
    setPrevSyncedInput(syncedInput);
    if (syncedInput && typeof syncedInput === "object") {
      const inp = syncedInput as Record<string, unknown>;
      if (
        Array.isArray(inp.processes) &&
        inp.processes.length > 0 &&
        typeof inp.processes[0] === "object"
      ) {
        setProcesses(inp.processes as ProcessInput[]);
        if (typeof inp.timeQuantum === "number") setTimeQuantum(inp.timeQuantum);
      }
    }
  }

  const applyScheduling = useCallback(() => {
    if (!algorithmMeta) return;
    const gen = OS_GENERATORS[algorithmMeta.id];
    if (!gen) return;
    const input: Record<string, unknown> = { processes };
    if (algorithmMeta.id === "os-round-robin") input.timeQuantum = timeQuantum;
    configure(
      algorithmMeta,
      gen as (input: unknown) => Generator<AlgorithmStep, void, undefined>,
      input,
    );
  }, [algorithmMeta, configure, processes, timeQuantum]);

  const updateProcess = useCallback(
    (idx: number, field: string, value: number) => {
      setProcesses((prev) =>
        prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p)),
      );
    },
    [],
  );

  const addProcess = useCallback(() => {
    setProcesses((prev) => [
      ...prev,
      {
        id: `P${prev.length + 1}`,
        arrivalTime: 0,
        burstTime: 1,
        priority: prev.length + 1,
      },
    ]);
  }, []);

  const removeProcess = useCallback((idx: number) => {
    setProcesses((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const isRoundRobin = algorithmMeta?.id === "os-round-robin";
  const isPriority = algorithmMeta?.id === "os-priority";

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-center gap-2">
        {processes.map((p, i) => (
          <div
            key={p.id}
            className="flex items-center gap-1 rounded border border-border bg-bg-surface px-1.5 py-0.5"
          >
            <span className={cn(labelStyle, "w-5")}>{p.id}</span>
            <span className={labelStyle}>arr:</span>
            <input
              type="number"
              min={0}
              value={p.arrivalTime}
              onChange={(e) =>
                updateProcess(i, "arrivalTime", Number(e.target.value) || 0)
              }
              className={cn(inputStyle, "w-10")}
            />
            <span className={labelStyle}>burst:</span>
            <input
              type="number"
              min={1}
              value={p.burstTime}
              onChange={(e) =>
                updateProcess(
                  i,
                  "burstTime",
                  Math.max(1, Number(e.target.value) || 1),
                )
              }
              className={cn(inputStyle, "w-10")}
            />
            {isPriority && (
              <>
                <span className={labelStyle}>pri:</span>
                <input
                  type="number"
                  min={1}
                  value={p.priority ?? 1}
                  onChange={(e) =>
                    updateProcess(
                      i,
                      "priority",
                      Number(e.target.value) || 1,
                    )
                  }
                  className={cn(inputStyle, "w-10")}
                />
              </>
            )}
            {processes.length > 2 && (
              <button
                onClick={() => removeProcess(i)}
                className="px-1 text-xs text-red-400 hover:text-red-300"
              >
                ×
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addProcess}
          className="h-6 rounded border border-dashed border-border px-2 font-mono text-[10px] text-text-muted transition-colors hover:text-text-primary"
        >
          + Add
        </button>
        {isRoundRobin && (
          <div className="flex items-center gap-1">
            <span className={labelStyle}>Quantum:</span>
            <input
              type="number"
              min={1}
              max={20}
              value={timeQuantum}
              onChange={(e) =>
                setTimeQuantum(Math.max(1, Number(e.target.value) || 2))
              }
              className={cn(inputStyle, "w-10")}
            />
          </div>
        )}
        <Button variant="outline" size="sm" onClick={applyScheduling}>
          Apply
        </Button>
      </div>
    </div>
  );
}
