// --- CPU Scheduling ---

export interface Process {
  id: string;
  arrivalTime: number;
  burstTime: number;
  remainingTime: number;
  priority?: number;
  startTime?: number;
  completionTime?: number;
  waitingTime?: number;
  turnaroundTime?: number;
  responseTime?: number;
  color: string;
}

export interface GanttBlock {
  processId: string;
  start: number;
  end: number;
}

export interface SchedulingMetrics {
  avgWaiting: number;
  avgTurnaround: number;
  avgResponse: number;
  cpuUtilization: number;
}

export interface SchedulingStep {
  time: number;
  processes: Process[];
  readyQueue: string[];
  running: string | null;
  completed: string[];
  ganttChart: GanttBlock[];
  metrics: SchedulingMetrics;
  timeQuantum?: number;
}

export interface SchedulingInput {
  processes: {
    id: string;
    arrivalTime: number;
    burstTime: number;
    priority?: number;
  }[];
  timeQuantum?: number;
}

// --- Page Replacement ---

export interface PageStep {
  reference: number;
  referenceString: number[];
  frames: (number | null)[];
  pageFault: boolean;
  pageHit: boolean;
  evicted: number | null;
  faultCount: number;
  hitCount: number;
  hitRatio: number;
  referenceIndex: number;
  frameCount: number;
}

export interface PageInput {
  referenceString: number[];
  frameCount: number;
}

// --- Disk Scheduling ---

export interface DiskStep {
  currentPosition: number;
  requestQueue: number[];
  servicing: number;
  direction: "up" | "down";
  totalHeadMovement: number;
  servedRequests: number[];
  seekSequence: number[];
  diskSize: number;
}

export interface DiskInput {
  requests: number[];
  initialPosition: number;
  diskSize: number;
  direction?: "up" | "down";
}

// --- Banker's Algorithm ---

export interface BankerStep {
  available: number[];
  max: number[][];
  allocation: number[][];
  need: number[][];
  safeSequence: string[];
  currentProcess: string | null;
  isSafe: boolean;
  checking: string;
  processNames: string[];
  resourceNames: string[];
}

export interface BankerInput {
  available: number[];
  max: number[][];
  allocation: number[][];
  processNames?: string[];
  resourceNames?: string[];
}

export type OsSubCategory =
  | "scheduling"
  | "page-replacement"
  | "disk-scheduling"
  | "bankers";

const PROCESS_COLORS = [
  "hsl(142, 70%, 55%)",
  "hsl(199, 89%, 55%)",
  "hsl(45, 93%, 55%)",
  "hsl(280, 70%, 60%)",
  "hsl(10, 80%, 58%)",
  "hsl(330, 70%, 55%)",
  "hsl(170, 70%, 50%)",
  "hsl(60, 70%, 50%)",
];

export function getProcessColor(index: number): string {
  return PROCESS_COLORS[index % PROCESS_COLORS.length];
}

export function computeMetrics(processes: Process[]): SchedulingMetrics {
  const completed = processes.filter((p) => p.completionTime !== undefined);
  if (completed.length === 0) {
    return {
      avgWaiting: 0,
      avgTurnaround: 0,
      avgResponse: 0,
      cpuUtilization: 0,
    };
  }

  const totalWaiting = completed.reduce((s, p) => s + (p.waitingTime ?? 0), 0);
  const totalTurnaround = completed.reduce(
    (s, p) => s + (p.turnaroundTime ?? 0),
    0,
  );
  const totalResponse = completed.reduce(
    (s, p) => s + (p.responseTime ?? 0),
    0,
  );
  const maxCompletion = Math.max(
    ...completed.map((p) => p.completionTime ?? 0),
  );
  const totalBurst = completed.reduce((s, p) => s + p.burstTime, 0);

  return {
    avgWaiting: totalWaiting / completed.length,
    avgTurnaround: totalTurnaround / completed.length,
    avgResponse: totalResponse / completed.length,
    cpuUtilization: maxCompletion > 0 ? (totalBurst / maxCompletion) * 100 : 0,
  };
}
