/**
 * Arrow and null-pointer SVG parts used by LinkedListRenderer.
 */

import { cn } from "@/lib/utils";

export function ArrowToNext({
  highlighted,
  doubly,
}: {
  highlighted: boolean;
  doubly?: boolean;
}) {
  return (
    <div className="mx-0.5 flex flex-col items-center">
      <svg width="28" height="12" viewBox="0 0 28 12">
        <line
          x1="0"
          y1="6"
          x2="22"
          y2="6"
          className={cn(
            "stroke-current",
            highlighted ? "text-accent-green" : "text-zinc-600",
          )}
          strokeWidth={highlighted ? 2 : 1}
        />
        <polygon
          points="22,2 28,6 22,10"
          className={cn(
            "fill-current",
            highlighted ? "text-accent-green" : "text-zinc-600",
          )}
        />
      </svg>
      {doubly && (
        <svg width="28" height="12" viewBox="0 0 28 12">
          <line
            x1="6"
            y1="6"
            x2="28"
            y2="6"
            className="stroke-current text-zinc-600"
            strokeWidth={1}
          />
          <polygon
            points="6,2 0,6 6,10"
            className="fill-current text-zinc-600"
          />
        </svg>
      )}
    </div>
  );
}

export function NullPointer() {
  return (
    <div className="ml-0.5 flex items-center">
      <svg width="28" height="12" viewBox="0 0 28 12">
        <line
          x1="0"
          y1="6"
          x2="18"
          y2="6"
          className="stroke-current text-zinc-600"
          strokeWidth={1}
        />
        <line
          x1="20"
          y1="2"
          x2="20"
          y2="10"
          className="stroke-current text-zinc-600"
          strokeWidth={2}
        />
      </svg>
      <span className="ml-0.5 font-mono text-[9px] text-text-muted">null</span>
    </div>
  );
}
