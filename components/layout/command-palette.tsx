"use client";

import { useCallback } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  ArrowUpDown,
  Brain,
  Calculator,
  Cpu,
  Database,
  Gamepad2,
  Grid3X3,
  Lock,
  Search,
  Shapes,
  Share2,
  Snowflake,
  Table2,
  TrendingUp,
  Type,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui";
import { ALGORITHM_ENTRIES, type AlgorithmEntry } from "@/lib/algorithm-entries";
import { cn } from "@/lib/utils";
import { useCommandPaletteOpen, useSetCommandPaletteOpen } from "@/stores";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number }>> = {
  sorting: ArrowUpDown,
  searching: Search,
  "data-structures": Database,
  string: Type,
  pathfinding: Grid3X3,
  graph: Share2,
  dp: Table2,
  geometry: Shapes,
  ai: Brain,
  optimization: TrendingUp,
  numerical: Calculator,
  games: Gamepad2,
  fractals: Snowflake,
  os: Cpu,
  crypto: Lock,
};

export function CommandPalette() {
  const open = useCommandPaletteOpen();
  const setOpen = useSetCommandPaletteOpen();
  const router = useRouter();

  useHotkeys("escape", () => setOpen(false), { enabled: open });

  const handleSelect = useCallback(
    (entry: AlgorithmEntry) => {
      setOpen(false);
      const url = entry.algorithmId
        ? `${entry.slug}?algo=${encodeURIComponent(entry.algorithmId)}`
        : entry.slug;
      router.push(url);
    },
    [router, setOpen],
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />
      <div className="relative mx-auto mt-[20vh] w-full max-w-lg">
        <Command
          className="overflow-hidden rounded-lg border border-border bg-bg-surface shadow-2xl"
          loop
        >
          <Command.Input
            placeholder="Search algorithms..."
            className="h-12 w-full border-b border-border bg-transparent px-4 text-sm text-text-primary outline-none placeholder:text-text-muted"
            autoFocus
          />
          <Command.List className="max-h-72 overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-text-muted">
              No algorithms found.
            </Command.Empty>
            {ALGORITHM_ENTRIES.map((algo) => {
              const Icon = ICON_MAP[algo.category];
              return (
                <Command.Item
                  key={`${algo.category}-${algo.name}`}
                  value={`${algo.name} ${algo.category}`}
                  onSelect={() => handleSelect(algo)}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm text-text-secondary transition-colors",
                    "data-[selected=true]:bg-bg-elevated data-[selected=true]:text-text-primary",
                  )}
                >
                  {Icon && <Icon size={14} />}
                  <span className="flex-1">{algo.name}</span>
                  <Badge variant="default" className="text-[10px]">
                    {algo.category}
                  </Badge>
                  <span className="font-mono text-[10px] text-text-muted">
                    {algo.complexity}
                  </span>
                </Command.Item>
              );
            })}
            <Command.Item
              value="42 the answer"
              onSelect={() => {
                setOpen(false);
                toast(
                  "The Answer to the Ultimate Question of Life, the Universe, and Everything.",
                  {
                    description: "-- Deep Thought",
                  },
                );
              }}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm text-text-secondary transition-colors",
                "data-[selected=true]:bg-bg-elevated data-[selected=true]:text-text-primary",
              )}
            >
              <span className="flex-1 font-mono text-accent-amber">42</span>
              <span className="font-mono text-[10px] text-text-muted">???</span>
            </Command.Item>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
