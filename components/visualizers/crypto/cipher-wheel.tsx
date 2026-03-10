"use client";

import { motion, useReducedMotion } from "framer-motion";

import { EmptyCanvasState } from "@/components/visualizers/shared/empty-canvas-state";
import type { CipherStep } from "@/lib/algorithms/crypto";
import { cn } from "@/lib/utils";
import type { AlgorithmStep } from "@/types";

interface CipherWheelProps {
  step: AlgorithmStep<CipherStep> | null;
  className?: string;
}

const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function CipherWheel({ step, className }: CipherWheelProps) {
  const reducedMotion = useReducedMotion();

  if (!step?.data) {
    return (
      <EmptyCanvasState
        message="Select a cipher algorithm and press play"
        className={className}
      />
    );
  }

  const {
    plaintext,
    ciphertext,
    currentIndex,
    key,
    mode,
    currentKeyChar,
  } = step.data;
  const currentShift =
    typeof key === "number"
      ? key
      : currentKeyChar
        ? ALPHA.indexOf(currentKeyChar)
        : 0;
  const radius = 130;
  const innerRadius = 100;
  const cx = 160;
  const cy = 160;

  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-lg border border-border bg-bg-primary/50 p-4",
        className,
      )}
    >
      {/* Key display */}
      <div className="flex items-center justify-center gap-4 font-mono text-sm">
        <span className="text-text-muted">
          Key: <span className="font-bold text-accent-green">{key}</span>
        </span>
        {currentKeyChar && (
          <span className="text-text-muted">
            Current key char:{" "}
            <span className="font-bold text-amber-400">{currentKeyChar}</span>{" "}
            (shift={currentShift})
          </span>
        )}
        <span className="text-text-muted">
          Mode: <span className="text-cyan-400">{mode}</span>
        </span>
      </div>

      {/* Cipher Wheel */}
      <div className="flex justify-center">
        <svg width={320} height={320} viewBox="0 0 320 320">
          {/* Outer ring (plaintext) */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth={1}
          />
          {ALPHA.split("").map((c, i) => {
            const angle = (i / 26) * 2 * Math.PI - Math.PI / 2;
            const x = cx + radius * Math.cos(angle);
            const y = cy + radius * Math.sin(angle);
            const isActive =
              currentIndex >= 0 &&
              currentIndex < plaintext.length &&
              plaintext[currentIndex] === c;
            return (
              <text
                key={`outer-${i}`}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                className={cn(
                  "font-mono text-xs",
                  isActive ? "fill-cyan-400 font-bold" : "fill-text-muted",
                )}
                fontSize={isActive ? 14 : 11}
              >
                {c}
              </text>
            );
          })}

          {/* Inner ring (cipher - rotated) */}
          <circle
            cx={cx}
            cy={cy}
            r={innerRadius}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth={1}
            strokeDasharray="2,2"
          />
          <motion.g
            animate={{ rotate: -(currentShift / 26) * 360 }}
            transition={{ duration: reducedMotion ? 0 : 0.3 }}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          >
            {ALPHA.split("").map((c, i) => {
              const angle = (i / 26) * 2 * Math.PI - Math.PI / 2;
              const x = cx + innerRadius * Math.cos(angle);
              const y = cy + innerRadius * Math.sin(angle);
              const mappedIdx = (i + currentShift) % 26;
              const isActive =
                currentIndex >= 0 &&
                currentIndex < ciphertext.length &&
                ciphertext[currentIndex] === ALPHA[mappedIdx];
              return (
                <text
                  key={`inner-${i}`}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className={cn(
                    "font-mono text-xs",
                    isActive ? "fill-amber-400 font-bold" : "fill-text-primary",
                  )}
                  fontSize={isActive ? 14 : 10}
                >
                  {c}
                </text>
              );
            })}
          </motion.g>

          {/* Center label */}
          <text
            x={cx}
            y={cy - 8}
            textAnchor="middle"
            className="fill-text-muted font-mono"
            fontSize={9}
          >
            shift
          </text>
          <text
            x={cx}
            y={cy + 8}
            textAnchor="middle"
            className="fill-accent-green font-mono font-bold"
            fontSize={16}
          >
            {currentShift}
          </text>
        </svg>
      </div>

      {/* Text Display */}
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <span className="w-16 shrink-0 pt-1 font-mono text-[10px] text-text-muted">
            Plain:
          </span>
          <div className="flex flex-wrap gap-0.5">
            {plaintext.split("").map((c, i) => (
              <span
                key={i}
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded font-mono text-xs",
                  i === currentIndex
                    ? "border border-cyan-500/50 bg-cyan-500/30 font-bold text-cyan-400"
                    : i < currentIndex
                      ? "bg-zinc-800 text-text-muted"
                      : "bg-zinc-900 text-text-primary",
                )}
              >
                {c}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-start gap-2">
          <span className="w-16 shrink-0 pt-1 font-mono text-[10px] text-text-muted">
            Cipher:
          </span>
          <div className="flex flex-wrap gap-0.5">
            {ciphertext.split("").map((c, i) => (
              <motion.span
                key={i}
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded font-mono text-xs",
                  i === currentIndex
                    ? "border border-amber-500/50 bg-amber-500/30 font-bold text-amber-400"
                    : "bg-zinc-800 text-amber-400/70",
                )}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.3 }}
              >
                {c}
              </motion.span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
