"use client";

import { Pause, Play, RotateCcw, Shuffle } from "lucide-react";

import { Button, Slider } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useSortingRace } from "@/hooks/use-sorting-race";

import { SortingCanvas } from "./sorting-canvas";

export function SortingOverview() {
  const {
    runs,
    playing,
    speed,
    setPlaying,
    setSpeed,
    initRuns,
    handleReset,
  } = useSortingRace();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant={playing ? "outline" : "accent"}
          size="sm"
          onClick={() => setPlaying(!playing)}
        >
          {playing ? <Pause size={14} /> : <Play size={14} />}
          {playing ? "Pause All" : "Run All"}
        </Button>
        <Button variant="ghost" size="sm" onClick={handleReset}>
          <RotateCcw size={14} />
          Reset
        </Button>
        <Button variant="ghost" size="sm" onClick={() => initRuns()}>
          <Shuffle size={14} />
          New Array
        </Button>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-text-muted">
            {speed}ms
          </span>
          <Slider
            value={[200 - speed + 20]}
            min={20}
            max={200}
            step={10}
            onValueChange={([v]) => setSpeed(200 - v + 20)}
            className="w-20"
            aria-label="Overview speed"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {runs.map((run) => (
          <div
            key={run.id}
            className={cn(
              "rounded-lg border border-border bg-bg-surface/50 p-2 transition-colors",
              run.isComplete && "border-green-400/30",
            )}
          >
            <div className="mb-1 flex items-center justify-between">
              <span className="truncate font-mono text-[11px] font-medium text-text-primary">
                {run.name}
              </span>
              {run.isComplete && (
                <span className="font-mono text-[9px] text-green-400">
                  DONE
                </span>
              )}
            </div>
            <SortingCanvas step={run.currentStep} compact />
            <div className="mt-1 font-mono text-[9px] text-text-muted">
              Steps: {run.stepCount}
              {run.currentStep?.data && (
                <>
                  {" · "}
                  {run.currentStep.data.comparisons > 0
                    ? `Cmp: ${run.currentStep.data.comparisons}`
                    : `Accesses: ${run.currentStep.data.arrayAccesses ?? 0}`}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
