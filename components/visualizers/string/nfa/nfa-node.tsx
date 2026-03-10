"use client";

import type { LayoutNode } from "@/lib/algorithms/string/nfa-layout";
import { getThemeColors, PALETTE } from "@/lib/utils/theme-colors";

interface NfaNodeProps {
  node: LayoutNode;
  isCurrent: boolean;
  nodeRadius: number;
}

export function NfaNode({ node, isCurrent, nodeRadius }: NfaNodeProps) {
  const theme = getThemeColors();
  const { state, x, y } = node;
  const isAccepting = state.isAccepting;
  const isActive = isCurrent;

  let strokeColor = theme.textMuted;
  let fillColor = `${theme.bgElevated}80`;
  let textColor = theme.textSecondary;

  if (isActive && isAccepting) {
    strokeColor = theme.accentGreen;
    fillColor = `${theme.accentGreen}26`;
    textColor = theme.accentGreen;
  } else if (isActive) {
    strokeColor = theme.accentCyan;
    fillColor = `${theme.accentCyan}26`;
    textColor = theme.accentCyan;
  } else if (isAccepting) {
    strokeColor = PALETTE.accentGreenLight;
    fillColor = `${theme.bgElevated}80`;
    textColor = PALETTE.accentGreenLight;
  }

  return (
    <g>
      <circle
        cx={x}
        cy={y}
        r={nodeRadius}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={isCurrent ? 2 : 1.5}
      />
      {isAccepting && (
        <circle
          cx={x}
          cy={y}
          r={nodeRadius - 4}
          fill="none"
          stroke={strokeColor}
          strokeWidth={1}
        />
      )}
      <text
        x={x}
        y={y + 4}
        textAnchor="middle"
        className="font-mono text-[10px]"
        fill={textColor}
      >
        {state.id}
      </text>
    </g>
  );
}
