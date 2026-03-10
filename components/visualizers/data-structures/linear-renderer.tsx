"use client";

import { EmptyCanvasState } from "@/components/visualizers/shared/empty-canvas-state";
import type {
  LinkedListState,
  QueueState,
  StackState,
} from "@/lib/algorithms/data-structures";

import { LinkedListRenderer } from "./renderers/linked-list-renderer";
import { QueueRenderer } from "./renderers/queue-renderer";
import { StackRenderer } from "./renderers/stack-renderer";

interface LinearRendererProps {
  state: StackState | QueueState | LinkedListState | null | undefined;
  highlightNodes?: string[];
  highlightEdges?: [string, string][];
  className?: string;
}

export function LinearRenderer({
  state,
  highlightNodes,
  highlightEdges,
  className,
}: LinearRendererProps) {
  if (state == null) {
    return (
      <div className={className}>
        <EmptyCanvasState message="No structure data" className="py-12" />
      </div>
    );
  }
  switch (state.kind) {
    case "stack":
      return (
        <StackRenderer
          state={state}
          highlightNodes={highlightNodes}
          className={className}
        />
      );
    case "queue":
      return (
        <QueueRenderer
          state={state}
          highlightNodes={highlightNodes}
          className={className}
        />
      );
    case "linked-list":
      return (
        <LinkedListRenderer
          state={state}
          highlightNodes={highlightNodes}
          highlightEdges={highlightEdges}
          className={className}
        />
      );
  }
}
