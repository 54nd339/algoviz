import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../../registry";
import type {
  GanttBlock,
  Process,
  SchedulingInput,
  SchedulingStep,
} from "../types";
import { computeMetrics, getProcessColor } from "../types";

export const sjfMeta: AlgorithmMeta = {
  id: "os-sjf",
  name: "SJF Scheduling",
  category: "os",
  description:
    "Shortest Job First (non-preemptive): selects the process with the smallest burst time from the ready queue. Optimal for minimizing average waiting time among non-preemptive algorithms.",
  timeComplexity: { best: "O(n²)", average: "O(n²)", worst: "O(n²)" },
  spaceComplexity: "O(n)",
  pseudocode: `time = 0
while uncompleted processes:
  ready = arrived & not completed
  pick p with min burst from ready
  p.start = time
  time += p.burst
  p.completion = time`,
  presets: [
    {
      name: "Standard",
      generator: () => ({
        processes: [
          { id: "P1", arrivalTime: 0, burstTime: 7 },
          { id: "P2", arrivalTime: 2, burstTime: 4 },
          { id: "P3", arrivalTime: 4, burstTime: 1 },
          { id: "P4", arrivalTime: 5, burstTime: 4 },
        ],
      }),
      expectedCase: "average",
    },
    {
      name: "All Arrive at 0",
      generator: () => ({
        processes: [
          { id: "P1", arrivalTime: 0, burstTime: 6 },
          { id: "P2", arrivalTime: 0, burstTime: 2 },
          { id: "P3", arrivalTime: 0, burstTime: 8 },
          { id: "P4", arrivalTime: 0, burstTime: 3 },
          { id: "P5", arrivalTime: 0, burstTime: 4 },
        ],
      }),
      expectedCase: "best",
    },
  ],
};

registerAlgorithm(sjfMeta);

export function* sjf(
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
    description: `SJF: ${procs.length} processes`,
    codeLine: 1,
    variables: { time: 0 },
  };

  while (completed.length < procs.length) {
    const ready = procs
      .filter((p) => p.arrivalTime <= time && !completed.includes(p.id))
      .sort((a, b) => a.burstTime - b.burstTime);

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
      description: `Time ${time}: ${proc.id} selected (shortest burst=${proc.burstTime})`,
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
      description: `Time ${time}: ${proc.id} completed`,
      codeLine: 6,
      variables: {
        time,
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
    description: `SJF complete. Avg waiting: ${computeMetrics(procs).avgWaiting.toFixed(1)}`,
    codeLine: 7,
    variables: { ...computeMetrics(procs) },
  };
}
