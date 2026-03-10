"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";

import { CollapsiblePanel } from "@/components/visualizers/shared/collapsible-panel";
import { cn } from "@/lib/utils";
import { useVisualizer } from "@/hooks";

interface VariableWatchPanelProps {
  className?: string;
}

export function VariableWatchPanel({ className }: VariableWatchPanelProps) {
  const { currentStep } = useVisualizer();
  const [changedKeys, setChangedKeys] = useState<Set<string>>(new Set());
  const [prevVars, setPrevVars] = useState<Record<string, unknown>>({});

  const variables = currentStep?.variables ?? {};

  const changed = new Set<string>();
  for (const [key, value] of Object.entries(variables)) {
    if (prevVars[key] !== value) changed.add(key);
  }
  if (changed.size > 0 || Object.keys(prevVars).length !== Object.keys(variables).length) {
    if (variables !== prevVars) setPrevVars({ ...variables });
    if (changed.size > 0) setChangedKeys(changed);
  }

  useEffect(() => {
    if (changedKeys.size === 0) return;
    const timer = setTimeout(() => setChangedKeys(new Set()), 600);
    return () => clearTimeout(timer);
  }, [changedKeys]);

  const entries = Object.entries(variables);
  if (entries.length === 0) return null;

  return (
    <CollapsiblePanel
      title="Watch"
      icon={<Eye size={14} />}
      count={entries.length}
      className={className}
      contentClassName="space-y-0.5 px-3"
    >
      {entries.map(([key, value]) => (
        <div
          key={key}
          className={cn(
            "flex min-w-0 items-baseline gap-2 rounded px-2 py-0.5 font-mono text-xs transition-colors duration-300",
            changedKeys.has(key) && "bg-accent-green/10",
          )}
        >
          <span className="shrink-0 text-accent-cyan">{key}</span>
          <span className="shrink-0 text-text-muted">=</span>
          <span className="min-w-0 break-all text-text-primary">
            {typeof value === "object"
              ? JSON.stringify(value)
              : String(value)}
          </span>
        </div>
      ))}
    </CollapsiblePanel>
  );
}
