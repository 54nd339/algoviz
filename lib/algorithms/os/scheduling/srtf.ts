import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../../registry";
import type {
  GanttBlock,
  Process,
  SchedulingInput,
  SchedulingStep,
} from "../types";
import { computeMetrics, getProcessColor } from "../types";

export const srtfMeta: AlgorithmMeta = {
  id: "os-srtf",
  name: "SRTF Scheduling",
  category: "os",
  description:
    "Shortest Remaining Time First: preemptive version of SJF. If a new process arrives with a shorter remaining time than the current process, a context switch occurs.",
  timeComplexity: { best: "O(n²)", average: "O(n²)", worst: "O(n²)" },
  spaceComplexity: "O(n)",
  pseudocode: `time = 0
while uncompleted processes:
  ready = arrived & not completed
  pick p with min remaining time
  run p for 1 unit (or until next arrival)
  if new arrival has shorter remaining:
    preempt current process`,
  presets: [
    {
      name: "With Preemption",
      generator: () => ({
        processes: [
          { id: "P1", arrivalTime: 0, burstTime: 8 },
          { id: "P2", arrivalTime: 1, burstTime: 4 },
          { id: "P3", arrivalTime: 2, burstTime: 2 },
          { id: "P4", arrivalTime: 3, burstTime: 1 },
        ],
      }),
      expectedCase: "average",
    },
  ],
};

registerAlgorithm(srtfMeta);

export function* srtf(
  input: SchedulingInput,
): AlgorithmGenerator<SchedulingStep> {
  const procs: Process[] = input.processes.map((p, i) => ({
    ...p,
    remainingTime: p.burstTime,
    color: getProcessColor(i),
  }));

  const gantt: GanttBlock[] = [];
  const completed: string[] = [];
  let time = 0;
  const maxTime =
    procs.reduce((s, p) => s + p.burstTime, 0) +
    Math.max(...procs.map((p) => p.arrivalTime));

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
    description: `SRTF: ${procs.length} processes (preemptive)`,
    codeLine: 1,
    variables: { time: 0 },
  };

  while (completed.length < procs.length && time <= maxTime) {
    const ready = procs
      .filter(
        (p) =>
          p.arrivalTime <= time &&
          p.remainingTime > 0 &&
          !completed.includes(p.id),
      )
      .sort((a, b) => a.remainingTime - b.remainingTime);

    if (ready.length === 0) {
      time++;
      continue;
    }

    const proc = ready[0];
    if (proc.startTime === undefined) {
      proc.startTime = time;
      proc.responseTime = time - proc.arrivalTime;
    }

    // Run until next arrival or completion
    const nextArrival = procs
      .filter((p) => p.arrivalTime > time && !completed.includes(p.id))
      .map((p) => p.arrivalTime)
      .sort((a, b) => a - b)[0];

    const runUntil = Math.min(
      time + proc.remainingTime,
      nextArrival ?? Infinity,
    );

    const startTime = time;
    yield {
      type: "dispatch",
      data: {
        time,
        processes: procs.map((p) => ({ ...p })),
        readyQueue: ready.slice(1).map((p) => p.id),
        running: proc.id,
        completed: [...completed],
        ganttChart: [...gantt],
        metrics: computeMetrics(procs),
      },
      description: `Time ${time}: Running ${proc.id} (remaining=${proc.remainingTime})`,
      codeLine: 4,
      variables: { time, running: proc.id, remaining: proc.remainingTime },
    };

    const elapsed = runUntil - time;
    proc.remainingTime -= elapsed;
    time = runUntil;

    if (gantt.length > 0 && gantt[gantt.length - 1].processId === proc.id) {
      gantt[gantt.length - 1].end = time;
    } else {
      gantt.push({ processId: proc.id, start: startTime, end: time });
    }

    if (proc.remainingTime === 0) {
      proc.completionTime = time;
      proc.turnaroundTime = time - proc.arrivalTime;
      proc.waitingTime = proc.turnaroundTime - proc.burstTime;
      completed.push(proc.id);

      yield {
        type: "complete",
        data: {
          time,
          processes: procs.map((p) => ({ ...p })),
          readyQueue: procs
            .filter(
              (p) =>
                p.arrivalTime <= time &&
                p.remainingTime > 0 &&
                !completed.includes(p.id),
            )
            .map((p) => p.id),
          running: null,
          completed: [...completed],
          ganttChart: [...gantt],
          metrics: computeMetrics(procs),
        },
        description: `Time ${time}: ${proc.id} completed`,
        codeLine: 6,
        variables: { time, completed: proc.id },
      };
    }
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
    description: `SRTF complete. Avg waiting: ${computeMetrics(procs).avgWaiting.toFixed(1)}`,
    codeLine: 7,
    variables: { ...computeMetrics(procs) },
  };
}
