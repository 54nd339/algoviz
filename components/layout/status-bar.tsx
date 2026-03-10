"use client";

import { Activity } from "lucide-react";

import { Badge } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useImmersiveMode, useSidebarOpen } from "@/stores";
import {
  useEngineState,
  useSpeed,
  useStepIndex,
  useTotalMaterialized,
} from "@/stores/visualizer-store";

function useVisualizerStatus() {
  const stepIndex = useStepIndex();
  const totalMaterialized = useTotalMaterialized();
  const speed = useSpeed();
  const engineState = useEngineState();
  const hasEngine = totalMaterialized > 0;
  const stepLabel = hasEngine ? `${stepIndex + 1}/${totalMaterialized}` : "0/0";
  const progressPercent =
    totalMaterialized > 0
      ? Math.round(((stepIndex + 1) / totalMaterialized) * 100)
      : 0;
  const barFilled = Math.round((progressPercent / 100) * 10);
  const barStr = "█".repeat(barFilled) + "░".repeat(10 - barFilled);
  const stateLabel =
    typeof engineState === "string" ? engineState.toUpperCase() : "--";
  return { stepLabel, barStr, speed, stateLabel };
}

export function StatusBar() {
  const sidebarOpen = useSidebarOpen();
  const immersive = useImmersiveMode();
  const { stepLabel, barStr, speed, stateLabel } = useVisualizerStatus();

  if (immersive) return null;

  return (
    <footer
      className={cn(
        "fixed right-0 bottom-0 z-30 flex h-7 items-center justify-between border-t border-border bg-bg-surface/80 px-3 font-mono text-[11px] text-text-muted backdrop-blur-sm transition-all duration-200",
        "left-0 sm:left-14",
        sidebarOpen && "sm:left-56",
      )}
    >
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-green opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-green" />
          </span>
          {stateLabel}
        </span>
        <span className="hidden text-border sm:inline">|</span>
        <span className="hidden items-center gap-1 sm:flex">
          <Activity size={12} />
          <span>{speed > 0 ? `${speed}ms` : "--"}</span>
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span>
          Step <span className="text-text-secondary">{stepLabel}</span>
        </span>
        <span className="hidden text-border sm:inline">|</span>
        <span className="hidden tracking-wider text-text-muted sm:inline">
          [{barStr}]
        </span>
        <span className="text-border">|</span>
        <Badge variant="default" className="h-4 px-1.5 text-[9px]">
          --
        </Badge>
      </div>
    </footer>
  );
}
