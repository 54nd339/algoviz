"use client";

import { useMemo, useState } from "react";

import {
  Badge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { getAllAlgorithms } from "@/lib/algorithms";
import { CATEGORIES } from "@/lib/categories";
import type { AlgorithmMeta } from "@/types";

function complexityColor(c: string): "green" | "amber" | "red" | "cyan" {
  const lower = c.toLowerCase();
  if (lower.includes("1)") || lower.includes("log n)")) return "green";
  if (lower.includes("n)") || lower.includes("n log n)")) return "cyan";
  if (lower.includes("n²)") || lower.includes("n^2)")) return "amber";
  return "red";
}

export function CompareTable() {
  const [filter, setFilter] = useState<string>("all");

  const algorithms = useMemo(() => {
    const all = getAllAlgorithms();
    if (filter === "all") return all;
    return all.filter((a) => a.category === filter);
  }, [filter]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs text-text-muted">Filter:</span>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="h-8 w-48 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map(({ slug, label }) => (
              <SelectItem key={slug} value={slug}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="font-mono text-xs text-text-muted">
          {algorithms.length} algorithm{algorithms.length !== 1 && "s"}
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full font-mono text-xs">
          <thead>
            <tr className="border-b border-border bg-bg-elevated">
              <Th>Name</Th>
              <Th>Category</Th>
              <Th>Best</Th>
              <Th>Average</Th>
              <Th>Worst</Th>
              <Th>Space</Th>
              <Th>Stable</Th>
              <Th>In-Place</Th>
            </tr>
          </thead>
          <tbody>
            {algorithms.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-8 text-center text-text-muted"
                >
                  No algorithms registered yet. They will appear here as
                  categories are implemented.
                </td>
              </tr>
            ) : (
              algorithms.map((algo) => (
                <AlgorithmRow key={algo.id} algo={algo} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-3 py-2 text-left text-[10px] font-semibold tracking-wider text-text-muted uppercase">
      {children}
    </th>
  );
}

function AlgorithmRow({ algo }: { algo: AlgorithmMeta }) {
  return (
    <tr className="border-b border-border/50 transition-colors hover:bg-bg-elevated/50">
      <td className="px-3 py-2 font-semibold text-text-primary">{algo.name}</td>
      <td className="px-3 py-2">
        <Badge variant="default">{algo.category}</Badge>
      </td>
      <td className="px-3 py-2">
        <Badge variant={complexityColor(algo.timeComplexity.best)}>
          {algo.timeComplexity.best}
        </Badge>
      </td>
      <td className="px-3 py-2">
        <Badge variant={complexityColor(algo.timeComplexity.average)}>
          {algo.timeComplexity.average}
        </Badge>
      </td>
      <td className="px-3 py-2">
        <Badge variant={complexityColor(algo.timeComplexity.worst)}>
          {algo.timeComplexity.worst}
        </Badge>
      </td>
      <td className="px-3 py-2">
        <Badge variant={complexityColor(algo.spaceComplexity)}>
          {algo.spaceComplexity}
        </Badge>
      </td>
      <td className="px-3 py-2">
        {algo.stable === undefined ? (
          <span className="text-text-muted">--</span>
        ) : (
          <Badge variant={algo.stable ? "green" : "amber"}>
            {algo.stable ? "Yes" : "No"}
          </Badge>
        )}
      </td>
      <td className="px-3 py-2">
        {algo.inPlace === undefined ? (
          <span className="text-text-muted">--</span>
        ) : (
          <Badge variant={algo.inPlace ? "green" : "cyan"}>
            {algo.inPlace ? "Yes" : "No"}
          </Badge>
        )}
      </td>
    </tr>
  );
}
