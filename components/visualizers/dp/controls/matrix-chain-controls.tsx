"use client";

interface MatrixChainControlsProps {
  dimensions: string;
  onDimensionsChange: (v: string) => void;
}

export function MatrixChainControls({
  dimensions,
  onDimensionsChange,
}: MatrixChainControlsProps) {
  return (
    <input
      value={dimensions}
      onChange={(e) => onDimensionsChange(e.target.value)}
      className="h-7 w-36 rounded border border-border bg-bg-primary px-2 font-mono text-xs text-text-primary placeholder:text-text-muted focus:border-accent-cyan focus:outline-none"
      placeholder="Dims (e.g. 10,30,5,60)"
      title="Comma-separated matrix dimensions"
    />
  );
}
