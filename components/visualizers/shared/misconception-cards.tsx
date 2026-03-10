"use client";

import { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronRight } from "lucide-react";

import { Button, Card } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { Misconception } from "@/types";

interface MisconceptionCardsProps {
  misconceptions: Misconception[];
  className?: string;
}

export function MisconceptionCards({
  misconceptions,
  className,
}: MisconceptionCardsProps) {
  const [collapsed, setCollapsed] = useState(true);

  if (misconceptions.length === 0) return null;

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-bg-surface/80 backdrop-blur-sm",
        className,
      )}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setCollapsed((p) => !p)}
        className="flex w-full items-center justify-between px-3 py-2"
      >
        <span className="flex items-center gap-2 font-mono text-xs text-accent-amber">
          <AlertTriangle size={14} />
          Common Misconceptions ({misconceptions.length})
        </span>
        {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
      </Button>

      {!collapsed && (
        <div className="space-y-2 px-3 pb-3">
          {misconceptions.map((m, i) => (
            <Card key={i} variant="elevated" padding="sm">
              <div className="space-y-1.5">
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 rounded bg-accent-red/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-accent-red">
                    MYTH
                  </span>
                  <p className="text-xs text-text-secondary">{m.myth}</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 rounded bg-accent-green/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-accent-green">
                    FACT
                  </span>
                  <p className="text-xs text-text-primary">{m.reality}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
