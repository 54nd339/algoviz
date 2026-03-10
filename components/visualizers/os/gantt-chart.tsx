"use client";

import { motion, useReducedMotion } from "framer-motion";

import { EmptyCanvasState } from "@/components/visualizers/shared/empty-canvas-state";
import type { SchedulingStep } from "@/lib/algorithms/os";
import { cn } from "@/lib/utils";
import { PALETTE } from "@/lib/utils/theme-colors";
import type { AlgorithmStep } from "@/types";

interface GanttChartProps {
  step: AlgorithmStep<SchedulingStep> | null;
  className?: string;
}

export function GanttChart({ step, className }: GanttChartProps) {
  const reducedMotion = useReducedMotion();
  const d = step?.data;
  if (!d || !Array.isArray(d.ganttChart) || !Array.isArray(d.processes)) {
    return (
      <EmptyCanvasState
        message="Select a CPU scheduling algorithm and press play"
        className={className}
      />
    );
  }

  const { ganttChart, processes, time, readyQueue, running, metrics } = d;
  const maxTime = Math.max(time, ...ganttChart.map((b) => b.end), 1);
  const processMap = new Map(processes.map((p) => [p.id, p]));

  return (
    <div
      className={cn(
        "flex flex-col gap-4 overflow-auto rounded-lg border border-border bg-bg-primary/50 p-4",
        className,
      )}
      data-tour="canvas"
    >
      {/* Gantt Chart */}
      <div className="space-y-1">
        <span className="font-mono text-xs text-text-muted">Gantt Chart</span>
        <div className="relative h-12 overflow-hidden rounded border border-border bg-zinc-900">
          {ganttChart.map((block, i) => {
            const left = (block.start / maxTime) * 100;
            const width = ((block.end - block.start) / maxTime) * 100;
            const proc = processMap.get(block.processId);
            return (
              <motion.div
                key={`${block.processId}-${block.start}-${i}`}
                className="absolute top-1 bottom-1 flex items-center justify-center rounded font-mono text-xs font-bold text-text-primary"
                style={{
                  left: `${left}%`,
                  width: `${width}%`,
                  backgroundColor: proc?.color ?? PALETTE.strokeMuted,
                }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: reducedMotion ? 0 : 0.3 }}
              >
                {width > 4 && block.processId}
              </motion.div>
            );
          })}
          {/* Current time marker */}
          <motion.div
            className="absolute top-0 bottom-0 z-10 w-0.5 bg-accent-green"
            style={{ left: `${(time / maxTime) * 100}%` }}
            animate={{ left: `${(time / maxTime) * 100}%` }}
            transition={{ duration: reducedMotion ? 0 : 0.3 }}
          />
        </div>
        {/* Time axis */}
        <div className="relative h-4">
          {Array.from({ length: Math.min(maxTime + 1, 30) }, (_, i) => {
            const t = Math.round((i / Math.min(maxTime, 29)) * maxTime);
            return (
              <span
                key={t}
                className="absolute -translate-x-1/2 font-mono text-[9px] text-text-muted"
                style={{ left: `${(t / maxTime) * 100}%` }}
              >
                {t}
              </span>
            );
          })}
        </div>
      </div>

      {/* Ready Queue */}
      <div className="flex items-center gap-2">
        <span className="shrink-0 font-mono text-xs text-text-muted">
          Ready Queue:
        </span>
        <div className="flex gap-1">
          {readyQueue.map((id) => {
            const proc = processMap.get(id);
            return (
              <span
                key={id}
                className="rounded px-2 py-0.5 font-mono text-xs font-bold text-text-primary"
                style={{ backgroundColor: proc?.color ?? PALETTE.strokeMuted }}
              >
                {id}
              </span>
            );
          })}
          {readyQueue.length === 0 && (
            <span className="font-mono text-xs text-text-muted">empty</span>
          )}
        </div>
        {running && (
          <span className="ml-2 font-mono text-xs text-accent-green">
            Running: {running}
          </span>
        )}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Avg Wait", value: metrics.avgWaiting.toFixed(1) },
          { label: "Avg Turnaround", value: metrics.avgTurnaround.toFixed(1) },
          { label: "Avg Response", value: metrics.avgResponse.toFixed(1) },
          { label: "CPU Util", value: `${metrics.cpuUtilization.toFixed(0)}%` },
        ].map((m) => (
          <div
            key={m.label}
            className="rounded border border-border bg-zinc-900/50 p-2 text-center"
          >
            <div className="font-mono text-[10px] text-text-muted">
              {m.label}
            </div>
            <div className="font-mono text-sm text-text-primary">{m.value}</div>
          </div>
        ))}
      </div>

      {/* Process Table */}
      <div className="overflow-x-auto">
        <table className="w-full font-mono text-xs">
          <thead>
            <tr className="border-b border-border text-text-muted">
              <th className="p-1 text-left">PID</th>
              <th className="p-1 text-right">Arrival</th>
              <th className="p-1 text-right">Burst</th>
              <th className="p-1 text-right">Start</th>
              <th className="p-1 text-right">End</th>
              <th className="p-1 text-right">Wait</th>
              <th className="p-1 text-right">TAT</th>
            </tr>
          </thead>
          <tbody>
            {processes.map((p) => (
              <tr
                key={p.id}
                className={cn(
                  "border-b border-border/50",
                  running === p.id && "bg-accent-green/10",
                )}
              >
                <td className="flex items-center gap-1 p-1">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: p.color }}
                  />
                  {p.id}
                </td>
                <td className="p-1 text-right">{p.arrivalTime}</td>
                <td className="p-1 text-right">{p.burstTime}</td>
                <td className="p-1 text-right">{p.startTime ?? "—"}</td>
                <td className="p-1 text-right">{p.completionTime ?? "—"}</td>
                <td className="p-1 text-right">{p.waitingTime ?? "—"}</td>
                <td className="p-1 text-right">{p.turnaroundTime ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
