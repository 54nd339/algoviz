"use client";

import { useMemo } from "react";
import { LinePath } from "@visx/shape";

import type { NeuralNetStep } from "@/lib/algorithms/ai";
import { cn } from "@/lib/utils";
import { getThemeColors, PALETTE } from "@/lib/utils/theme-colors";

const LAYER_SIZES = [2, 3, 1];
const LAYER_LABELS = ["Input", "Hidden", "Output"];
const NODE_RADIUS = 18;

interface NeuralNetDiagramProps {
  step: NeuralNetStep | null;
  className?: string;
}

export function NeuralNetDiagram({ step, className }: NeuralNetDiagramProps) {
  const theme = getThemeColors();
  const width = 400;
  const height = 260;
  const layerSpacing = width / (LAYER_SIZES.length + 1);

  const nodes = useMemo(() => {
    return LAYER_SIZES.map((size, layerIdx) => {
      const x = layerSpacing * (layerIdx + 1);
      return Array.from({ length: size }, (_, nodeIdx) => {
        const totalHeight = (size - 1) * 60;
        const y = height / 2 - totalHeight / 2 + nodeIdx * 60;
        return { x, y, layer: layerIdx, index: nodeIdx };
      });
    });
  }, [layerSpacing]);

  const getActivation = (layer: number, node: number): number | null => {
    const v = step?.activations?.[layer]?.[node];
    if (v === undefined) return null;
    return v;
  };

  const getWeight = (
    fromLayer: number,
    fromNode: number,
    toNode: number,
  ): number | null => {
    if (
      !step?.weights?.[fromLayer]?.[fromNode]?.[toNode] &&
      step?.weights?.[fromLayer]?.[fromNode]?.[toNode] !== 0
    )
      return null;
    return step.weights[fromLayer][fromNode][toNode];
  };

  const getError = (layer: number, node: number): number | null => {
    if (!step?.errors?.[layer]?.[node]) return null;
    return step.errors[layer][node];
  };

  const isForward = step?.phase === "forward";
  const isBackward = step?.phase === "backward";

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="rounded-lg border border-border bg-bg-surface/50 p-3">
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="h-auto w-full"
        >
          {/* Edges */}
          {nodes.slice(0, -1).map((layerNodes, layerIdx) =>
            layerNodes.map((fromNode) =>
              nodes[layerIdx + 1].map((toNode) => {
                const w = getWeight(layerIdx, fromNode.index, toNode.index);
                const absW = w !== null ? Math.min(Math.abs(w), 3) : 0.5;
                const strokeWidth = 0.5 + absW * 1.2;
                const isPositive = w !== null ? w >= 0 : true;
                return (
                  <line
                    key={`${layerIdx}-${fromNode.index}-${toNode.index}`}
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke={isPositive ? theme.accentGreen : theme.accentRed}
                    strokeWidth={strokeWidth}
                    strokeOpacity={0.3 + absW * 0.15}
                  />
                );
              }),
            ),
          )}

          {/* Nodes */}
          {nodes.map((layerNodes, layerIdx) =>
            layerNodes.map((node) => {
              const activation = getActivation(layerIdx, node.index);
              const error = getError(layerIdx, node.index);
              const intensity = activation !== null ? Math.abs(activation) : 0;

              let fillColor = theme.bgElevated;
              if (isForward && activation !== null) {
                fillColor = `rgba(6,182,212,${0.15 + intensity * 0.6})`;
              } else if (isBackward && error !== null) {
                fillColor = `rgba(239,68,68,${0.15 + Math.min(Math.abs(error), 1) * 0.6})`;
              }

              return (
                <g key={`n-${layerIdx}-${node.index}`}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={NODE_RADIUS}
                    fill={fillColor}
                    stroke={PALETTE.strokeMuted}
                    strokeWidth={1.5}
                  />
                  {activation !== null && (
                    <text
                      x={node.x}
                      y={node.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill={theme.textPrimary}
                      fontSize={10}
                      fontWeight={500}
                      className="font-mono"
                    >
                      {activation.toFixed(2)}
                    </text>
                  )}
                </g>
              );
            }),
          )}

          {/* Layer labels */}
          {LAYER_LABELS.map((label, i) => (
            <text
              key={label}
              x={layerSpacing * (i + 1)}
              y={height - 8}
              textAnchor="middle"
              fill={theme.textMuted}
              fontSize={10}
              className="font-mono"
            >
              {label}
            </text>
          ))}
        </svg>
      </div>

      {/* Loss curve */}
      {step?.lossHistory && step.lossHistory.length > 1 && (
        <div className="rounded-lg border border-border bg-bg-surface/50 p-3">
          <p className="mb-1 font-mono text-[10px] text-text-muted">
            Loss: {step.loss.toFixed(6)} | Epoch: {step.epoch}
          </p>
          <svg
            width="100%"
            height={60}
            viewBox={`0 0 360 60`}
            preserveAspectRatio="none"
          >
            <LinePath
              data={step.lossHistory.map((l, i) => ({ x: i, y: l }))}
              x={(d) => (d.x / Math.max(step.lossHistory.length - 1, 1)) * 360}
              y={(d) => {
                const maxLoss = Math.max(...step.lossHistory, 0.01);
                return 55 - (d.y / maxLoss) * 50;
              }}
              stroke={theme.accentAmber}
              strokeWidth={1.5}
              fill="none"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
