"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronRight, X } from "lucide-react";

import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useTour } from "@/hooks";

interface TourStep {
  target: string;
  title: string;
  description: string;
  position?: "top" | "bottom" | "left" | "right";
}

const DEFAULT_STEPS: TourStep[] = [
  {
    target: "[data-tour='canvas']",
    title: "Visualization Canvas",
    description:
      "This is where the algorithm visualization plays out. Watch data structures transform in real time.",
    position: "top",
  },
  {
    target: "[data-tour='controls']",
    title: "Playback Controls",
    description:
      "Play, pause, step forward/back, and adjust speed. Use Space to play/pause.",
    position: "bottom",
  },
  {
    target: "[data-tour='code']",
    title: "Code Panel",
    description:
      "The highlighted source code follows along with each step, showing which line is executing.",
    position: "left",
  },
  {
    target: "[data-tour='picker']",
    title: "Algorithm Picker",
    description:
      "Choose from multiple algorithms in this category and configure input parameters.",
    position: "bottom",
  },
  {
    target: "[data-tour='play']",
    title: "Ready to Go!",
    description:
      "Select an algorithm, then press Play to start the visualization.",
    position: "bottom",
  },
];

interface GuidedTourProps {
  pageId: string;
  steps?: TourStep[];
}

export function GuidedTour({ pageId, steps = DEFAULT_STEPS }: GuidedTourProps) {
  const { currentStep, isActive, next, skip, finish } = useTour(pageId);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const [visible, setVisible] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const step = steps[currentStep];
  const isLast = currentStep >= steps.length - 1;

  const updatePosition = useCallback(() => {
    if (!step || !isActive) return;
    const el = document.querySelector(step.target);
    if (!el) {
      if (!isLast) next();
      else finish();
      return;
    }

    const rect = el.getBoundingClientRect();
    const pos = step.position ?? "bottom";

    let top = 0;
    let left = 0;

    switch (pos) {
      case "top":
        top = rect.top - 10;
        left = rect.left + rect.width / 2;
        break;
      case "bottom":
        top = rect.bottom + 10;
        left = rect.left + rect.width / 2;
        break;
      case "left":
        top = rect.top + rect.height / 2;
        left = rect.left - 10;
        break;
      case "right":
        top = rect.top + rect.height / 2;
        left = rect.right + 10;
        break;
    }

    setTooltipPos({ top, left });
    setVisible(true);
  }, [step, isActive, isLast, next, finish]);

  useEffect(() => {
    const rafId = requestAnimationFrame(updatePosition);
    window.addEventListener("resize", updatePosition);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", updatePosition);
    };
  }, [updatePosition]);

  useEffect(() => {
    if (visible && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [visible]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        skip();
      }
    };
    if (isActive && visible) {
      window.addEventListener("keydown", handleEscape);
      return () => window.removeEventListener("keydown", handleEscape);
    }
  }, [isActive, visible, skip]);

  if (!isActive || !step || !visible) return null;

  return (
    <>
      <div
        className="pointer-events-auto fixed inset-0 z-[60] bg-black/30"
        onClick={skip}
      />

      <div
        className={cn(
          "fixed z-[61] w-72 max-w-[calc(100vw-2rem)] rounded-lg border border-accent-green/30 bg-bg-surface p-4 shadow-xl",
          "animate-in fade-in-0 zoom-in-95 duration-200",
        )}
        style={{
          top: tooltipPos.top,
          left: tooltipPos.left,
          transform: getTransform(step.position ?? "bottom"),
        }}
      >
        <div className="mb-2 flex items-start justify-between gap-2">
          <h4 className="font-mono text-xs font-semibold text-accent-green">
            {step.title}
          </h4>
          <Button
            ref={closeButtonRef}
            variant="ghost"
            size="icon"
            aria-label="Close tour"
            className="h-5 w-5 shrink-0"
            onClick={skip}
          >
            <X size={12} />
          </Button>
        </div>

        <p className="mb-3 text-xs leading-relaxed text-text-secondary">
          {step.description}
        </p>

        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-text-muted">
            {currentStep + 1} / {steps.length}
          </span>
          <div className="flex gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={skip}
              className="h-6 px-2 text-[10px]"
            >
              Skip tour
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={isLast ? finish : next}
              className="h-6 gap-1 px-2 text-[10px]"
            >
              {isLast ? "Done" : "Next"}
              {!isLast && <ChevronRight size={10} />}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

function getTransform(position: string): string {
  switch (position) {
    case "top":
      return "translate(-50%, -100%)";
    case "bottom":
      return "translate(-50%, 0)";
    case "left":
      return "translate(-100%, -50%)";
    case "right":
      return "translate(0, -50%)";
    default:
      return "translate(-50%, 0)";
  }
}
