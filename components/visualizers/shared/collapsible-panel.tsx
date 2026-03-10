"use client";

import { type ReactNode,useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

interface CollapsiblePanelProps {
  title: string;
  count?: number;
  defaultCollapsed?: boolean;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  children: ReactNode;
  className?: string;
  maxHeight?: string;
  contentClassName?: string;
  icon?: ReactNode;
  "data-tour"?: string;
}

export function CollapsiblePanel({
  title,
  count,
  defaultCollapsed = false,
  children,
  className,
  maxHeight = "max-h-48",
  contentClassName,
  icon,
  "data-tour": dataTour,
}: CollapsiblePanelProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <div
      data-tour={dataTour}
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
        <span className="flex items-center gap-2 font-mono text-xs text-text-secondary">
          {icon}
          {title}
          {count != null && (
            <span className="rounded bg-border px-1.5 py-0.5 text-[10px] font-medium tabular-nums">
              {count}
            </span>
          )}
        </span>
        {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
      </Button>

      {!collapsed && (
        <div
          className={cn(maxHeight, "overflow-y-auto pb-3", contentClassName ?? "px-3")}
        >
          {children}
        </div>
      )}
    </div>
  );
}
