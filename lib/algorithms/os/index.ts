export { bankers, bankersMeta } from "./bankers";
export { cscanDisk, cscanDiskMeta } from "./disk-scheduling/cscan-disk";
export { fcfsDisk, fcfsDiskMeta } from "./disk-scheduling/fcfs-disk";
export { lookDisk, lookDiskMeta } from "./disk-scheduling/look-disk";
export { scanDisk, scanDiskMeta } from "./disk-scheduling/scan-disk";
export { sstfDisk, sstfDiskMeta } from "./disk-scheduling/sstf-disk";
export { fifoPage, fifoPageMeta } from "./page-replacement/fifo-page";
export { lfuPage, lfuPageMeta } from "./page-replacement/lfu-page";
export { lruPage, lruPageMeta } from "./page-replacement/lru-page";
export { optimalPage, optimalPageMeta } from "./page-replacement/optimal-page";
export { fcfs, fcfsMeta } from "./scheduling/fcfs";
export {
  priorityMeta,
  priorityScheduling,
} from "./scheduling/priority-scheduling";
export { roundRobin, roundRobinMeta } from "./scheduling/round-robin";
export { sjf, sjfMeta } from "./scheduling/sjf";
export { srtf, srtfMeta } from "./scheduling/srtf";
export type {
  BankerInput,
  BankerStep,
  DiskInput,
  DiskStep,
  GanttBlock,
  OsSubCategory,
  PageInput,
  PageStep,
  Process,
  SchedulingInput,
  SchedulingMetrics,
  SchedulingStep,
} from "./types";
export { computeMetrics, getProcessColor } from "./types";

import type { AlgorithmStep } from "@/types";

import { bankers } from "./bankers";
import { cscanDisk } from "./disk-scheduling/cscan-disk";
import { fcfsDisk } from "./disk-scheduling/fcfs-disk";
import { lookDisk } from "./disk-scheduling/look-disk";
import { scanDisk } from "./disk-scheduling/scan-disk";
import { sstfDisk } from "./disk-scheduling/sstf-disk";
import { fifoPage } from "./page-replacement/fifo-page";
import { lfuPage } from "./page-replacement/lfu-page";
import { lruPage } from "./page-replacement/lru-page";
import { optimalPage } from "./page-replacement/optimal-page";
import { fcfs } from "./scheduling/fcfs";
import { priorityScheduling } from "./scheduling/priority-scheduling";
import { roundRobin } from "./scheduling/round-robin";
import { sjf } from "./scheduling/sjf";
import { srtf } from "./scheduling/srtf";
import type { BankerStep, DiskStep, PageStep, SchedulingStep } from "./types";

type OsStep = SchedulingStep | PageStep | DiskStep | BankerStep;

export const OS_GENERATORS: Record<
  string,
  (input: unknown) => Generator<AlgorithmStep<OsStep>, void, undefined>
> = {
  "os-fcfs": (input) => fcfs(input as Parameters<typeof fcfs>[0]),
  "os-sjf": (input) => sjf(input as Parameters<typeof sjf>[0]),
  "os-srtf": (input) => srtf(input as Parameters<typeof srtf>[0]),
  "os-round-robin": (input) =>
    roundRobin(input as Parameters<typeof roundRobin>[0]),
  "os-priority": (input) =>
    priorityScheduling(input as Parameters<typeof priorityScheduling>[0]),
  "os-fifo-page": (input) => fifoPage(input as Parameters<typeof fifoPage>[0]),
  "os-lru-page": (input) => lruPage(input as Parameters<typeof lruPage>[0]),
  "os-lfu-page": (input) => lfuPage(input as Parameters<typeof lfuPage>[0]),
  "os-optimal-page": (input) =>
    optimalPage(input as Parameters<typeof optimalPage>[0]),
  "os-fcfs-disk": (input) => fcfsDisk(input as Parameters<typeof fcfsDisk>[0]),
  "os-sstf-disk": (input) => sstfDisk(input as Parameters<typeof sstfDisk>[0]),
  "os-scan-disk": (input) => scanDisk(input as Parameters<typeof scanDisk>[0]),
  "os-cscan-disk": (input) =>
    cscanDisk(input as Parameters<typeof cscanDisk>[0]),
  "os-look-disk": (input) => lookDisk(input as Parameters<typeof lookDisk>[0]),
  "os-bankers": (input) => bankers(input as Parameters<typeof bankers>[0]),
};

export const OS_SUBCATEGORY_IDS: Record<string, string[]> = {
  scheduling: ["os-fcfs", "os-sjf", "os-srtf", "os-round-robin", "os-priority"],
  "page-replacement": [
    "os-fifo-page",
    "os-lru-page",
    "os-lfu-page",
    "os-optimal-page",
  ],
  "disk-scheduling": [
    "os-fcfs-disk",
    "os-sstf-disk",
    "os-scan-disk",
    "os-cscan-disk",
    "os-look-disk",
  ],
  bankers: ["os-bankers"],
};
