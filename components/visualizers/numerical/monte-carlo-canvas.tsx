"use client";

import { useCallback, useMemo, useRef, useState } from "react";

import type { NumericalStep } from "@/lib/algorithms/numerical";
import { cn } from "@/lib/utils";
import { getThemeColors, PALETTE } from "@/lib/utils/theme-colors";

interface MonteCarloCanvasProps {
  step: NumericalStep | null;
  className?: string;
}

export function MonteCarloCanvas({ step, className }: MonteCarloCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(400);

  const resizeObserver = useRef<ResizeObserver | null>(null);
  const containerCallback = useCallback((node: HTMLDivElement | null) => {
    if (resizeObserver.current) resizeObserver.current.disconnect();
    if (!node) return;
    containerRef.current = node;
    const obs = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setSize(Math.min(width, height));
    });
    obs.observe(node);
    resizeObserver.current = obs;
  }, []);

  const theme = getThemeColors();
  const points = useMemo(() => step?.points ?? [], [step?.points]);
  const piEstimate = step?.piEstimate ?? 0;
  const total = points.length;
  const inside = points.filter((p) => p.inside).length;
  const error = Math.abs(piEstimate - Math.PI);

  const maxRender = 2000;
  const renderedPoints = useMemo(
    () => (points.length > maxRender ? points.slice(-maxRender) : points),
    [points],
  );

  return (
    <div
      ref={containerCallback}
      className={cn(
        "relative flex h-full min-h-[300px] w-full flex-col items-center gap-3",
        className,
      )}
    >
      {/* Pi estimate display */}
      <div className="flex items-baseline gap-4 font-mono">
        <div className="text-2xl font-bold tracking-wider text-green-400">
          π ≈ {piEstimate > 0 ? piEstimate.toFixed(6) : "—"}
        </div>
        {piEstimate > 0 && (
          <div className="text-sm text-text-muted">
            |error| = {error.toFixed(6)}
          </div>
        )}
      </div>

      {/* Canvas */}
      <div
        className="relative overflow-hidden rounded-lg border border-border bg-zinc-950"
        style={{ width: size, height: size }}
      >
        <svg width={size} height={size} viewBox="0 0 1 1">
          {/* Quarter circle arc */}
          <path
            d="M 0 1 L 1 1 A 1 1 0 0 0 0 0 L 0 1 Z"
            fill={`${theme.accentCyan}1f`}
            stroke={theme.accentCyan}
            strokeWidth={0.004}
            strokeOpacity={0.6}
          />

          {/* Grid */}
          {[0.25, 0.5, 0.75].map((v) => (
            <g key={v}>
              <line
                x1={v}
                y1={0}
                x2={v}
                y2={1}
                stroke={theme.bgElevated}
                strokeWidth={0.001}
              />
              <line
                x1={0}
                y1={v}
                x2={1}
                y2={v}
                stroke={theme.bgElevated}
                strokeWidth={0.001}
              />
            </g>
          ))}

          {/* Darts */}
          {renderedPoints.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={1 - p.y}
              r={0.004}
              fill={p.inside ? PALETTE.accentGreenLight : PALETTE.accentRedLight}
              opacity={0.7}
            />
          ))}
        </svg>
      </div>

      {/* Stats */}
      <div className="flex gap-6 font-mono text-[11px] text-text-muted">
        <span>
          Darts: <span className="text-zinc-300">{total}</span>
        </span>
        <span>
          Inside: <span className="text-green-400">{inside}</span>
        </span>
        <span>
          Outside: <span className="text-red-400">{total - inside}</span>
        </span>
        {piEstimate > 0 && (
          <span>
            Accuracy:{" "}
            <span className="text-cyan-400">
              {((1 - error / Math.PI) * 100).toFixed(2)}%
            </span>
          </span>
        )}
      </div>
    </div>
  );
}
