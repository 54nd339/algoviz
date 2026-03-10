"use client";

import type { OptimizationStep } from "@/lib/algorithms/optimization";
import { cn } from "@/lib/utils";
import { getThemeColors } from "@/lib/utils/theme-colors";

interface PopulationPlotProps {
  step: OptimizationStep | null;
  className?: string;
}

export function PopulationPlot({ step, className }: PopulationPlotProps) {
  const population = step?.population;
  const best = step?.best;
  const theme = getThemeColors();

  if (!population || population.length === 0) return null;

  const avgFitness =
    population.reduce((sum, ind) => sum + ind.fitness, 0) / population.length;

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-bg-surface/50 p-3 font-mono text-[11px]",
        className,
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-text-muted">Population</span>
        <span className="text-text-muted">Gen {step?.iteration ?? 0}</span>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        <div>
          <span className="text-text-muted">Size: </span>
          <span className="text-cyan-400">{population.length}</span>
        </div>
        <div>
          <span className="text-text-muted">Avg Fitness: </span>
          <span className="text-amber-400">{avgFitness.toFixed(4)}</span>
        </div>
        <div>
          <span className="text-text-muted">Best x: </span>
          <span className="text-green-400">{best?.x.toFixed(4)}</span>
        </div>
        <div>
          <span className="text-text-muted">Best f(x): </span>
          <span className="text-green-400">{best?.value.toFixed(4)}</span>
        </div>
      </div>

      {/* Fitness distribution bar */}
      <div className="mt-2 flex h-8 items-end gap-[1px]">
        {population
          .slice()
          .sort((a, b) => a.fitness - b.fitness)
          .map((ind, i) => {
            const minF = Math.min(...population.map((p) => p.fitness));
            const maxF = Math.max(...population.map((p) => p.fitness));
            const range = maxF - minF || 1;
            const norm = (ind.fitness - minF) / range;
            const isBest = best && Math.abs(ind.x - best.x) < 0.01;
            return (
              <div
                key={i}
                className="flex-1 rounded-t-sm"
                style={{
                  height: `${20 + norm * 80}%`,
                  backgroundColor: isBest ? theme.accentGreen : theme.accentAmber,
                  opacity: 0.5 + norm * 0.5,
                }}
              />
            );
          })}
      </div>
    </div>
  );
}
