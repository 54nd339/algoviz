import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../../registry";
import type {
  GanttBlock,
  Process,
  SchedulingInput,
  SchedulingStep,
} from "../types";
import { computeMetrics, getProcessColor } from "../types";

export const roundRobinMeta: AlgorithmMeta = {
  id: "os-round-robin",
  name: "Round Robin",
  category: "os",
  description:
    "Each process gets a fixed time quantum. If not finished, it goes to the back of the ready queue. Provides fair CPU sharing and bounded response time.",
  timeComplexity: { best: "O(n)", average: "O(n·q)", worst: "O(n·q)" },
  spaceComplexity: "O(n)",
  pseudocode: `time = 0, queue = []
while uncompleted processes:
  add newly arrived to queue
  if queue empty: advance time
  p = dequeue front
  run = min(quantum, p.remaining)
  p.remaining -= run
  time += run
  if p.remaining > 0: enqueue p
  else: p.completion = time`,
  presets: [
    {
      name: "Quantum=2",
      generator: () => ({
        processes: [
          { id: "P1", arrivalTime: 0, burstTime: 5 },
          { id: "P2", arrivalTime: 1, burstTime: 4 },
          { id: "P3", arrivalTime: 2, burstTime: 2 },
          { id: "P4", arrivalTime: 4, burstTime: 1 },
        ],
        timeQuantum: 2,
      }),
      expectedCase: "average",
    },
    {
      name: "Quantum=4",
      generator: () => ({
        processes: [
          { id: "P1", arrivalTime: 0, burstTime: 10 },
          { id: "P2", arrivalTime: 0, burstTime: 6 },
          { id: "P3", arrivalTime: 0, burstTime: 2 },
        ],
        timeQuantum: 4,
      }),
      expectedCase: "average",
    },
  ],
};

registerAlgorithm(roundRobinMeta);

export function* roundRobin(
  input: SchedulingInput,
): AlgorithmGenerator<SchedulingStep> {
  const quantum = input.timeQuantum ?? 2;
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
  const queue: string[] = [];
  const added = new Set<string>();
  let time = 0;

  function enqueueArrivals() {
    for (const p of procs) {
      if (
        p.arrivalTime <= time &&
        !added.has(p.id) &&
        !completed.includes(p.id)
      ) {
        queue.push(p.id);
        added.add(p.id);
      }
    }
  }

  enqueueArrivals();

  yield {
    type: "init",
    data: {
      time,
      processes: procs.map((p) => ({ ...p })),
      readyQueue: [...queue],
      running: null,
      completed: [],
      ganttChart: [],
      metrics: computeMetrics(procs),
      timeQuantum: quantum,
    },
    description: `Round Robin: quantum=${quantum}, ${procs.length} processes`,
    codeLine: 1,
    variables: { time: 0, quantum },
  };

  const maxTime =
    procs.reduce((s, p) => s + p.burstTime, 0) +
    Math.max(...procs.map((p) => p.arrivalTime)) +
    1;

  while (completed.length < procs.length && time <= maxTime) {
    enqueueArrivals();

    if (queue.length === 0) {
      time++;
      continue;
    }

    const procId = queue.shift()!;
    const proc = procs.find((p) => p.id === procId)!;

    if (proc.startTime === undefined) {
      proc.startTime = time;
      proc.responseTime = time - proc.arrivalTime;
    }

    const run = Math.min(quantum, proc.remainingTime);

    yield {
      type: "dispatch",
      data: {
        time,
        processes: procs.map((p) => ({ ...p })),
        readyQueue: [...queue],
        running: proc.id,
        completed: [...completed],
        ganttChart: [...gantt],
        metrics: computeMetrics(procs),
        timeQuantum: quantum,
      },
      description: `Time ${time}: ${proc.id} gets ${run} units (remaining=${proc.remainingTime})`,
      codeLine: 6,
      variables: { time, running: proc.id, run, remaining: proc.remainingTime },
    };

    const start = time;
    proc.remainingTime -= run;
    time += run;
    gantt.push({ processId: proc.id, start, end: time });

    // Enqueue arrivals that came during execution
    enqueueArrivals();

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
          readyQueue: [...queue],
          running: null,
          completed: [...completed],
          ganttChart: [...gantt],
          metrics: computeMetrics(procs),
          timeQuantum: quantum,
        },
        description: `Time ${time}: ${proc.id} completed`,
        codeLine: 10,
        variables: { time, completed: proc.id },
      };
    } else {
      queue.push(proc.id);

      yield {
        type: "quantum-expiry",
        data: {
          time,
          processes: procs.map((p) => ({ ...p })),
          readyQueue: [...queue],
          running: null,
          completed: [...completed],
          ganttChart: [...gantt],
          metrics: computeMetrics(procs),
          timeQuantum: quantum,
        },
        description: `Time ${time}: ${proc.id} quantum expired, re-queued (remaining=${proc.remainingTime})`,
        codeLine: 9,
        variables: { time, preempted: proc.id, remaining: proc.remainingTime },
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
      timeQuantum: quantum,
    },
    description: `Round Robin complete. Avg waiting: ${computeMetrics(procs).avgWaiting.toFixed(1)}`,
    codeLine: 10,
    variables: { ...computeMetrics(procs) },
  };
}
