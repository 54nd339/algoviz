"use client";

import { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import {
  Loader2,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
} from "lucide-react";

import {
  Button,
  Kbd,
  Slider,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import { useVisualizer } from "@/hooks";

const SPEED_MIN = 50;
const SPEED_MAX = 2000;

export function PlayerControls({
  className,
  onBeforePlay,
}: {
  className?: string;
  /** Called before play(); use to sync config (e.g. pathfinding grid) before running. */
  onBeforePlay?: () => void;
}) {
  const {
    isPlaying,
    isPaused,
    isReady,
    isComplete,
    isMaterializing,
    stepIndex,
    totalMaterialized,
    speed,
    algorithmMeta,
    engineState,
    play,
    pause,
    stepForward,
    stepBack,
    reset,
    jumpTo,
    setSpeed,
  } = useVisualizer();

  const [liveAnnouncement, setLiveAnnouncement] = useState("");
  const [prevAlgorithmId, setPrevAlgorithmId] = useState(algorithmMeta?.id);
  const [prevEngineState, setPrevEngineState] = useState(engineState);

  let nextAnnouncement: string | null = null;
  if (algorithmMeta && algorithmMeta.id !== prevAlgorithmId) {
    setPrevAlgorithmId(algorithmMeta.id);
    nextAnnouncement = `Algorithm ${algorithmMeta.name} selected`;
  }
  if (prevEngineState === "materializing" && engineState === "ready") {
    nextAnnouncement = "Configuration applied, materialization complete";
  }
  if (prevEngineState !== engineState) {
    setPrevEngineState(engineState);
  }
  if (nextAnnouncement !== null) {
    setLiveAnnouncement(nextAnnouncement);
  }

  useEffect(() => {
    if (!liveAnnouncement) return;
    const t = setTimeout(() => setLiveAnnouncement(""), 3000);
    return () => clearTimeout(t);
  }, [liveAnnouncement]);

  const canPlay = isReady || isPaused || (isComplete && false);
  const canPause = isPlaying;
  const canStepForward = isReady || isPaused;
  const canStepBack = isPaused || isComplete;
  const canReset = isPaused || isComplete || isReady;

  useHotkeys("space", (e) => {
    e.preventDefault();
    if (isPlaying) pause();
    else if (canPlay) {
      onBeforePlay?.();
      play();
    }
  });

  useHotkeys("right", () => {
    if (canStepForward) stepForward();
  });

  useHotkeys("left", () => {
    if (canStepBack) stepBack();
  });

  useHotkeys("]", () => {
    setSpeed(Math.max(SPEED_MIN, speed - 100));
  });

  useHotkeys("[", () => {
    setSpeed(Math.min(SPEED_MAX, speed + 100));
  });

  const progressPercent =
    totalMaterialized > 0
      ? Math.round(((stepIndex + 1) / totalMaterialized) * 100)
      : 0;

  return (
    <TooltipProvider delayDuration={300}>
      <div
        data-tour="controls"
        className={cn(
          "flex items-center gap-3 rounded-lg border border-border bg-bg-surface/80 px-3 py-2 backdrop-blur-sm",
          className,
        )}
      >
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="recoveryGhost"
                size="icon"
                onClick={reset}
                disabled={!canReset}
                aria-label="Reset"
              >
                <RotateCcw size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reset</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={stepBack}
                disabled={!canStepBack}
                aria-label="Step back"
              >
                <SkipBack size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Step Back <Kbd>←</Kbd>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                data-tour="play"
                variant={isPlaying ? "outline" : "accent"}
                size="icon"
                onClick={
                  isPlaying
                    ? pause
                    : () => {
                        onBeforePlay?.();
                        play();
                      }
                }
                disabled={!canPlay && !canPause}
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isPlaying ? "Pause" : "Play"} <Kbd>Space</Kbd>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={stepForward}
                disabled={!canStepForward}
                aria-label="Step forward"
              >
                <SkipForward size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Step Forward <Kbd>→</Kbd>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="flex flex-1 items-center gap-3">
          <Slider
            value={[stepIndex >= 0 ? stepIndex : 0]}
            min={0}
            max={Math.max(0, totalMaterialized - 1)}
            step={1}
            onValueChange={([v]) => jumpTo(v)}
            disabled={totalMaterialized === 0}
            className="flex-1"
            aria-label="Timeline"
          />
          <span className="min-w-[4.5rem] text-right font-mono text-xs text-text-muted">
            {stepIndex >= 0 ? stepIndex + 1 : 0}/{totalMaterialized}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-text-muted">
                  {speed}ms
                </span>
                <Slider
                  value={[SPEED_MAX - speed + SPEED_MIN]}
                  min={SPEED_MIN}
                  max={SPEED_MAX}
                  step={50}
                  onValueChange={([v]) => setSpeed(SPEED_MAX - v + SPEED_MIN)}
                  className="w-20"
                  aria-label="Speed"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              Speed <Kbd>[</Kbd> <Kbd>]</Kbd>
            </TooltipContent>
          </Tooltip>
        </div>

        {isMaterializing && (
          <span className="flex animate-pulse items-center gap-1.5 font-mono text-xs text-cyan-400">
            <Loader2 size={12} className="animate-spin" />
            Loading…
          </span>
        )}

        {isComplete && (
          <span className="font-mono text-xs text-accent-green">DONE</span>
        )}

        <div className="sr-only" aria-live="polite" role="status">
          {liveAnnouncement || `Step ${stepIndex + 1} of ${totalMaterialized}, ${progressPercent}% complete`}
        </div>
      </div>
    </TooltipProvider>
  );
}
