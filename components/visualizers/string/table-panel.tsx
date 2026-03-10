"use client";

import { ScrollArea, ScrollBar } from "@/components/ui";
import type { StringMatchStep } from "@/lib/algorithms/string";
import { getTableLabel } from "@/lib/algorithms/string/metadata";
import { cn } from "@/lib/utils";
import type { AlgorithmStep } from "@/types";

interface TablePanelProps {
  step: AlgorithmStep<StringMatchStep> | null;
  className?: string;
}

export function TablePanel({ step, className }: TablePanelProps) {
  const data = step?.data;

  if (!data?.table && data?.algorithmId !== "rabin-karp") return null;

  const { title, description } = getTableLabel(data.algorithmId);

  if (data.algorithmId === "rabin-karp") {
    return (
      <div
        className={cn(
          "rounded-lg border border-border bg-bg-surface/50 p-3",
          className,
        )}
      >
        <div className="mb-2">
          <h3 className="font-mono text-xs font-medium text-text-primary">
            {title}
          </h3>
          <p className="font-mono text-[10px] text-text-muted">{description}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-text-muted">
              Pattern hash:
            </span>
            <span className="rounded border border-violet-400/30 bg-violet-400/10 px-2 py-0.5 font-mono text-xs text-violet-400">
              {data.patternHash ?? "—"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-text-muted">
              Window hash:
            </span>
            <span
              className={cn(
                "rounded border px-2 py-0.5 font-mono text-xs",
                data.hashValue === data.patternHash
                  ? "border-green-400/30 bg-green-400/10 text-green-400"
                  : "border-amber-400/30 bg-amber-400/10 text-amber-400",
              )}
            >
              {data.hashValue ?? "—"}
            </span>
          </div>
          {data.hashValue === data.patternHash && (
            <span className="font-mono text-[10px] text-green-400">
              Hash match! Verifying...
            </span>
          )}
        </div>
      </div>
    );
  }

  const table = data.table!;

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-bg-surface/50 p-3",
        className,
      )}
    >
      <div className="mb-2">
        <h3 className="font-mono text-xs font-medium text-text-primary">
          {title}
        </h3>
        <p className="font-mono text-[10px] text-text-muted">{description}</p>
      </div>
      <ScrollArea className="w-full">
        <div className="flex gap-0.5">
          {data.algorithmId === "kmp" &&
            data.pattern.split("").map((ch, i) => (
              <div key={i} className="flex flex-col items-center gap-0.5">
                <div className="flex h-7 w-7 items-center justify-center rounded border border-zinc-700 bg-zinc-800/50 font-mono text-[10px] text-text-secondary">
                  {ch}
                </div>
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded border font-mono text-[10px]",
                    data.tableHighlight === i
                      ? "border-cyan-400 bg-cyan-400/15 text-cyan-400"
                      : "border-zinc-700 bg-zinc-800/50 text-text-primary",
                  )}
                >
                  {table[i]}
                </div>
                <span className="font-mono text-[7px] text-zinc-600">{i}</span>
              </div>
            ))}

          {data.algorithmId === "boyer-moore" && (
            <>
              {[...new Set(data.pattern)].map((ch, i) => (
                <div key={ch} className="flex flex-col items-center gap-0.5">
                  <div className="flex h-7 w-8 items-center justify-center rounded border border-zinc-700 bg-zinc-800/50 font-mono text-[10px] text-text-secondary">
                    &apos;{ch}&apos;
                  </div>
                  <div
                    className={cn(
                      "flex h-7 w-8 items-center justify-center rounded border font-mono text-[10px]",
                      data.tableHighlight === i
                        ? "border-cyan-400 bg-cyan-400/15 text-cyan-400"
                        : "border-zinc-700 bg-zinc-800/50 text-text-primary",
                    )}
                  >
                    {table[i]}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
