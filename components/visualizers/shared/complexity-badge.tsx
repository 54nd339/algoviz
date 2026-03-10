"use client";

import {
  Badge,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui";
import { getComplexityColor } from "@/lib/utils/complexity";
import type { AlgorithmMeta } from "@/types";

interface ComplexityBadgeProps {
  meta: AlgorithmMeta;
  showField?: "best" | "average" | "worst";
  className?: string;
}

export function ComplexityBadge({
  meta,
  showField = "average",
  className,
}: ComplexityBadgeProps) {
  const displayed = meta.timeComplexity[showField];
  const color = getComplexityColor(displayed);

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={color} className={className}>
            {displayed}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1 font-mono text-xs">
            <div>
              <span className="text-text-muted">Best: </span>
              {meta.timeComplexity.best}
            </div>
            <div>
              <span className="text-text-muted">Avg: </span>
              {meta.timeComplexity.average}
            </div>
            <div>
              <span className="text-text-muted">Worst: </span>
              {meta.timeComplexity.worst}
            </div>
            <div>
              <span className="text-text-muted">Space: </span>
              {meta.spaceComplexity}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
