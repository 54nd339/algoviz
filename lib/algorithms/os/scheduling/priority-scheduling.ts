import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../../registry";
import type {
  GanttBlock,
  Process,
  SchedulingInput,
  SchedulingStep,
} from "../types";
import { computeMetrics, getProcessColor } from "../types";

export const priorityMeta: AlgorithmMeta = {
  id: "os-priority",
  name: "Priority Scheduling",
  category: "os",
  description:
    "Non-preemptive priority scheduling: the process with the highest priority (lowest number) in the ready queue runs next. Can cause starvation of low-priority processes.",
  timeComplexity: { best: "O(n²)", average: "O(n²)", worst: "O(n²)" },
  spaceComplexity: "O(n)",
  pseudocode: `time = 0
while uncompleted processes:
  ready = arrived & not completed
  pick p with highest priority (lowest number)
  p.start = time
  time += p.burst
  p.completion = time`,
  presets: [
    {
      name: "Standard",
      generator: () => ({
        processes: [
          { id: "P1", arrivalTime: 0, burstTime: 5, priority: 3 },
          { id: "P2", arrivalTime: 1, burstTime: 3, priority: 1 },
          { id: "P3", arrivalTime: 2, burstTime: 8, priority: 4 },
          { id: "P4", arrivalTime: 3, burstTime: 2, priority: 2 },
        ],
      }),
      expectedCase: "average",
    },
    {
      name: "Starvation Demo",
      generator: () => ({
        processes: [
          { id: "P1", arrivalTime: 0, burstTime: 10, priority: 5 },
          { id: "P2", arrivalTime: 0, burstTime: 2, priority: 1 },
          { id: "P3", arrivalTime: 2, burstTime: 3, priority: 1 },
          { id: "P4", arrivalTime: 4, burstTime: 2, priority: 2 },
          { id: "P5", arrivalTime: 6, burstTime: 1, priority: 1 },
        ],
      }),
      expectedCase: "worst",
    },
  ],
};

registerAlgorithm(priorityMeta);

export function* priorityScheduling(
  input: SchedulingInput,
): AlgorithmGenerator<SchedulingStep> {
  const procs: Process[] = input.processes.map((p, i) => ({
    ...p,
    priority: p.priority ?? 0,
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
    description: `Priority Scheduling: ${procs.length} processes (lower number = higher priority)`,
    codeLine: 1,
    variables: { time: 0 },
  };

  while (completed.length < procs.length) {
    const ready = procs
      .filter((p) => p.arrivalTime <= time && !completed.includes(p.id))
      .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));

    if (ready.length === 0) {
      const next = procs
        .filter((p) => !completed.includes(p.id))
        .sort((a, b) => a.arrivalTime - b.arrivalTime)[0];
      time = next.arrivalTime;
      continue;
    }

    const proc = ready[0];
    proc.startTime = time;
    proc.responseTime = time - proc.arrivalTime;

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
      description: `Time ${time}: ${proc.id} selected (priority=${proc.priority})`,
      codeLine: 4,
      variables: { time, running: proc.id, priority: proc.priority },
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
      description: `Time ${time}: ${proc.id} completed`,
      codeLine: 6,
      variables: { time, completed: proc.id },
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
    description: `Priority Scheduling complete. Avg waiting: ${computeMetrics(procs).avgWaiting.toFixed(1)}`,
    codeLine: 7,
    variables: { ...computeMetrics(procs) },
  };
}
