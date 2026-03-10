import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../../registry";
import type {
  GanttBlock,
  Process,
  SchedulingInput,
  SchedulingStep,
} from "../types";
import { computeMetrics, getProcessColor } from "../types";

export const fcfsMeta: AlgorithmMeta = {
  id: "os-fcfs",
  name: "FCFS Scheduling",
  category: "os",
  description:
    "First Come First Served: processes are executed in the order they arrive. Non-preemptive — once a process starts, it runs to completion. Simple but can cause the convoy effect.",
  timeComplexity: { best: "O(n)", average: "O(n)", worst: "O(n)" },
  spaceComplexity: "O(n)",
  pseudocode: `sort processes by arrival time
time = 0
for each process p in order:
  if time < p.arrival:
    time = p.arrival  // CPU idle
  p.start = time
  time += p.burst
  p.completion = time`,
  presets: [
    {
      name: "3 Processes",
      generator: () => ({
        processes: [
          { id: "P1", arrivalTime: 0, burstTime: 6 },
          { id: "P2", arrivalTime: 2, burstTime: 4 },
          { id: "P3", arrivalTime: 4, burstTime: 2 },
        ],
      }),
      expectedCase: "average",
    },
    {
      name: "Convoy Effect",
      generator: () => ({
        processes: [
          { id: "P1", arrivalTime: 0, burstTime: 20 },
          { id: "P2", arrivalTime: 1, burstTime: 2 },
          { id: "P3", arrivalTime: 2, burstTime: 2 },
          { id: "P4", arrivalTime: 3, burstTime: 2 },
        ],
      }),
      expectedCase: "worst",
    },
  ],
};

registerAlgorithm(fcfsMeta);

export function* fcfs(
  input: SchedulingInput,
): AlgorithmGenerator<SchedulingStep> {
  const procs: Process[] = input.processes
    .slice()
    .sort((a, b) => a.arrivalTime - b.arrivalTime)
    .map((p, i) => ({
      ...p,
      remainingTime: p.burstTime,
      color: getProcessColor(i),
    }));

  const gantt: GanttBlock[] = [];
  const completed: string[] = [];
  let time = 0;

  yield {
    type: "init",
    data: {
      time,
      processes: procs.map((p) => ({ ...p })),
      readyQueue: [],
      running: null,
      completed: [],
      ganttChart: [],
      metrics: computeMetrics(procs),
    },
    description: `FCFS: ${procs.length} processes sorted by arrival`,
    codeLine: 1,
    variables: { time: 0, processCount: procs.length },
  };

  for (const proc of procs) {
    if (time < proc.arrivalTime) {
      time = proc.arrivalTime;
    }

    proc.startTime = time;
    proc.responseTime = time - proc.arrivalTime;

    const readyQueue = procs
      .filter(
        (p) =>
          p.arrivalTime <= time &&
          !completed.includes(p.id) &&
          p.id !== proc.id,
      )
      .map((p) => p.id);

    yield {
      type: "dispatch",
      data: {
        time,
        processes: procs.map((p) => ({ ...p })),
        readyQueue,
        running: proc.id,
        completed: [...completed],
        ganttChart: [...gantt],
        metrics: computeMetrics(procs),
      },
      description: `Time ${time}: Dispatching ${proc.id} (burst=${proc.burstTime})`,
      codeLine: 4,
      variables: { time, running: proc.id, burst: proc.burstTime },
    };

    time += proc.burstTime;
    proc.remainingTime = 0;
    proc.completionTime = time;
    proc.turnaroundTime = time - proc.arrivalTime;
    proc.waitingTime = proc.turnaroundTime - proc.burstTime;
    gantt.push({ processId: proc.id, start: proc.startTime, end: time });
    completed.push(proc.id);

    yield {
      type: "complete",
      data: {
        time,
        processes: procs.map((p) => ({ ...p })),
        readyQueue: procs
          .filter((p) => p.arrivalTime <= time && !completed.includes(p.id))
          .map((p) => p.id),
        running: null,
        completed: [...completed],
        ganttChart: [...gantt],
        metrics: computeMetrics(procs),
      },
      description: `Time ${time}: ${proc.id} completed (turnaround=${proc.turnaroundTime}, waiting=${proc.waitingTime})`,
      codeLine: 6,
      variables: {
        time,
        completed: proc.id,
        turnaround: proc.turnaroundTime,
        waiting: proc.waitingTime,
      },
    };
  }

  yield {
    type: "done",
    data: {
      time,
      processes: procs.map((p) => ({ ...p })),
      readyQueue: [],
      running: null,
      completed: [...completed],
      ganttChart: [...gantt],
      metrics: computeMetrics(procs),
    },
    description: `FCFS complete. Avg waiting: ${computeMetrics(procs).avgWaiting.toFixed(1)}, Avg turnaround: ${computeMetrics(procs).avgTurnaround.toFixed(1)}`,
    codeLine: 7,
    variables: { ...computeMetrics(procs) },
  };
}
