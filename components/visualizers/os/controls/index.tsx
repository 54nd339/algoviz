"use client";

import { useCallback, useState } from "react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui";
import { CategoryControlsHeader } from "@/components/visualizers/shared";
import { getByCategory } from "@/lib/algorithms";
import {
  OS_GENERATORS,
  OS_SUBCATEGORY_IDS,
  type OsSubCategory,
} from "@/lib/algorithms/os";
import { cn } from "@/lib/utils";
import type { AlgorithmStep } from "@/types";

import { BankersControls } from "./bankers-controls";
import { DiskSchedulingControls } from "./disk-scheduling-controls";
import { PageReplacementControls } from "./page-replacement-controls";
import { SchedulingControls } from "./scheduling-controls";

interface OsControlsProps {
  subCategory: OsSubCategory;
  onSubCategoryChange: (sub: OsSubCategory) => void;
  className?: string;
}

/** Routes synced input from presets/picker to the active sub-control. */
function parseAndRouteSync(
  input: unknown,
): {
  scheduling?: unknown;
  pageReplacement?: unknown;
  diskScheduling?: unknown;
  bankers?: unknown;
} | null {
  if (!input || typeof input !== "object") return null;
  const inp = input as Record<string, unknown>;

  if (
    Array.isArray(inp.processes) &&
    inp.processes.length > 0 &&
    typeof inp.processes[0] === "object"
  ) {
    return { scheduling: inp };
  }
  if (Array.isArray(inp.referenceString)) {
    return { pageReplacement: inp };
  }
  if (Array.isArray(inp.requests)) {
    return { diskScheduling: inp };
  }
  if (
    Array.isArray(inp.available) &&
    Array.isArray(inp.max) &&
    Array.isArray(inp.allocation)
  ) {
    return { bankers: inp };
  }
  return null;
}

export function OsControls({
  subCategory,
  onSubCategoryChange,
  className,
}: OsControlsProps) {
  const allAlgorithms = getByCategory("os");
  const filteredAlgorithms = allAlgorithms.filter((a) =>
    OS_SUBCATEGORY_IDS[subCategory]?.includes(a.id),
  );

  const [syncedInput, setSyncedInput] = useState<Record<string, unknown>>({});

  const handleSubCategoryChange = useCallback(
    (val: string) => {
      onSubCategoryChange(val as OsSubCategory);
    },
    [onSubCategoryChange],
  );

  const syncFromInput = useCallback((input: unknown) => {
    const routed = parseAndRouteSync(input);
    if (routed) {
      setSyncedInput((prev) => ({ ...prev, ...routed }));
    }
  }, []);

  return (
    <div className={cn("space-y-2", className)}>
      <Tabs value={subCategory} onValueChange={handleSubCategoryChange}>
        <TabsList>
          <TabsTrigger value="scheduling">CPU Scheduling</TabsTrigger>
          <TabsTrigger value="page-replacement">Page Replacement</TabsTrigger>
          <TabsTrigger value="disk-scheduling">Disk Scheduling</TabsTrigger>
          <TabsTrigger value="bankers">Banker&apos;s</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-wrap items-center gap-3">
        <CategoryControlsHeader
          category="os"
          algorithms={filteredAlgorithms}
          generators={
            OS_GENERATORS as Record<
              string,
              (input: unknown) => Generator<AlgorithmStep, void, undefined>
            >
          }
          defaultInput={{}}
          onConfigure={syncFromInput}
        />
      </div>

      {subCategory === "scheduling" && (
        <SchedulingControls syncedInput={syncedInput.scheduling} />
      )}
      {subCategory === "page-replacement" && (
        <PageReplacementControls syncedInput={syncedInput.pageReplacement} />
      )}
      {subCategory === "disk-scheduling" && (
        <DiskSchedulingControls syncedInput={syncedInput.diskScheduling} />
      )}
      {subCategory === "bankers" && (
        <BankersControls syncedInput={syncedInput.bankers} />
      )}
    </div>
  );
}
