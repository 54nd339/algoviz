"use client";

import { HelpCircle } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useVisualizer } from "@/hooks";

interface WhyTooltipProps {
  className?: string;
}

export function WhyTooltip({ className }: WhyTooltipProps) {
  const { currentStep } = useVisualizer();

  if (!currentStep?.reasoning) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "inline-flex items-center justify-center rounded-full p-1 text-text-muted transition-colors hover:bg-accent-cyan/10 hover:text-accent-cyan",
            className,
          )}
          aria-label="Why this step?"
        >
          <HelpCircle size={14} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-1">
          <p className="font-mono text-xs font-semibold text-accent-cyan">
            Why this step?
          </p>
          <p className="text-xs leading-relaxed text-text-secondary">
            {currentStep.reasoning}
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
