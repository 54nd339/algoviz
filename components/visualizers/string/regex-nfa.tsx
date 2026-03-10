"use client";

import { useMemo } from "react";

import { EmptyCanvasState } from "@/components/visualizers/shared/empty-canvas-state";
import type { RegexNFAStep } from "@/lib/algorithms/string";
import { layoutStates } from "@/lib/algorithms/string/nfa-layout";
import { cn } from "@/lib/utils";
import { getThemeColors } from "@/lib/utils/theme-colors";
import type { AlgorithmStep } from "@/types";

import { NfaEdge } from "./nfa/nfa-edge";
import { NfaNode } from "./nfa/nfa-node";

interface RegexNFAVisualizerProps {
  step: AlgorithmStep<RegexNFAStep> | null;
  className?: string;
}

export function RegexNFAVisualizer({
  step,
  className,
}: RegexNFAVisualizerProps) {
  const theme = getThemeColors();
  const data = step?.data;

  const layout = useMemo(
    () =>
      data ? layoutStates(data.states, data.transitions) : [],
    [data],
  );

  if (!data) {
    return (
      <EmptyCanvasState
        message="Select a regex pattern and press play"
        className={cn("h-48", className)}
      />
    );
  }

  const {
    states,
    transitions,
    currentStates,
    accepted,
    input,
    inputIndex,
    pattern,
  } = data;
  const currentSet = new Set(currentStates);
  const nodeRadius = 18;

  const maxX = Math.max(...layout.map((n) => n.x), 200) + 80;
  const maxY = Math.max(...layout.map((n) => n.y), 100) + 80;
  const viewBox = `0 0 ${maxX} ${maxY}`;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Pattern + input display */}
      <div className="flex items-center justify-center gap-4">
        <span className="font-mono text-[10px] text-text-muted">
          Pattern: <span className="text-violet-400">/{pattern}/</span>
        </span>
        <span className="font-mono text-[10px] text-text-muted">
          Input:{" "}
          {input.split("").map((ch, i) => (
            <span
              key={i}
              className={cn(
                "inline-block w-4 text-center",
                i === inputIndex
                  ? "font-bold text-cyan-400"
                  : i < inputIndex
                    ? "text-zinc-500"
                    : "text-text-primary",
              )}
            >
              {ch}
            </span>
          ))}
        </span>
        {accepted && (
          <span className="rounded border border-green-500/30 bg-green-500/10 px-2 py-0.5 font-mono text-[10px] text-green-400">
            Accepted
          </span>
        )}
      </div>

      {/* NFA SVG */}
      <div className="flex justify-center overflow-auto rounded-lg border border-border bg-bg-primary/50 p-2">
        <svg
          viewBox={viewBox}
          className="max-h-[300px] w-full"
          style={{ minWidth: maxX }}
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon
                points="0 0, 8 3, 0 6"
                fill="currentColor"
                className="text-zinc-500"
              />
            </marker>
            <marker
              id="arrowhead-epsilon"
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon
                points="0 0, 8 3, 0 6"
                fill="currentColor"
                className="text-zinc-600"
              />
            </marker>
          </defs>

          {/* Transitions */}
          {transitions.map((t, i) => {
            const fromNode = layout.find((n) => n.state.id === t.from);
            const toNode = layout.find((n) => n.state.id === t.to);
            if (!fromNode || !toNode) return null;
            return (
              <NfaEdge
                key={i}
                transition={t}
                fromNode={fromNode}
                toNode={toNode}
                nodeRadius={nodeRadius}
              />
            );
          })}

          {/* States */}
          {layout.map((node) => (
            <NfaNode
              key={node.state.id}
              node={node}
              isCurrent={currentSet.has(node.state.id)}
              nodeRadius={nodeRadius}
            />
          ))}

          {/* Start arrow */}
          {layout.length > 0 && (
            <>
              <line
                x1={layout[0].x - nodeRadius - 20}
                y1={layout[0].y}
                x2={layout[0].x - nodeRadius - 2}
                y2={layout[0].y}
                stroke={theme.textSecondary}
                strokeWidth={1.5}
                markerEnd="url(#arrowhead)"
              />
              <text
                x={layout[0].x - nodeRadius - 30}
                y={layout[0].y - 6}
                textAnchor="middle"
                className="fill-zinc-400 font-mono text-[9px]"
              >
                start
              </text>
            </>
          )}
        </svg>
      </div>

      {/* Active states */}
      <div className="flex items-center justify-center gap-2">
        <span className="font-mono text-[10px] text-text-muted">
          Active states:
        </span>
        {currentStates.length > 0 ? (
          currentStates.map((s) => (
            <span
              key={s}
              className={cn(
                "rounded border px-1.5 py-0.5 font-mono text-[10px]",
                states.find((st) => st.id === s)?.isAccepting
                  ? "border-green-400/30 bg-green-400/10 text-green-400"
                  : "border-cyan-400/30 bg-cyan-400/10 text-cyan-400",
              )}
            >
              q{s}
            </span>
          ))
        ) : (
          <span className="font-mono text-[10px] text-zinc-500">
            none (dead)
          </span>
        )}
      </div>
    </div>
  );
}
