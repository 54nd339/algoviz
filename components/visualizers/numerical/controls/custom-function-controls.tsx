"use client";

import type { RefObject } from "react";

import { Button } from "@/components/ui";
import { controlInputStyle, controlLabelStyle } from "@/components/visualizers/shared/control-styles";
import { cn } from "@/lib/utils";

const inputStyle = cn(controlInputStyle, "w-28");
const labelStyle = controlLabelStyle;

interface CustomFunctionControlsProps {
  expr: string;
  domainA: string;
  domainB: string;
  parseError: string | null;
  exprRef: RefObject<HTMLInputElement | null>;
  onExprChange: (value: string) => void;
  onDomainAChange: (value: string) => void;
  onDomainBChange: (value: string) => void;
  onApply: () => void;
}

/** Custom f(x) input for root finding and numerical integration. */
export function CustomFunctionControls({
  expr,
  domainA,
  domainB,
  parseError,
  exprRef,
  onExprChange,
  onDomainAChange,
  onDomainBChange,
  onApply,
}: CustomFunctionControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className={labelStyle}>f(x) =</span>
      <input
        ref={exprRef}
        type="text"
        value={expr}
        onChange={(e) => onExprChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onApply();
        }}
        placeholder="x^2 - 3  or  sin(x)*x"
        className={cn(inputStyle, "w-48", parseError && "border-red-500")}
      />
      <span className={labelStyle}>domain</span>
      <input
        type="number"
        value={domainA}
        onChange={(e) => onDomainAChange(e.target.value)}
        className={cn(inputStyle, "w-16")}
      />
      <span className={labelStyle}>to</span>
      <input
        type="number"
        value={domainB}
        onChange={(e) => onDomainBChange(e.target.value)}
        className={cn(inputStyle, "w-16")}
      />
      <Button variant="outline" size="sm" onClick={onApply}>
        Apply
      </Button>
      {parseError && (
        <span className="font-mono text-[10px] text-red-400">{parseError}</span>
      )}
    </div>
  );
}
