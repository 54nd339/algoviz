"use client";

import {
  GitBranch,
  MousePointer2,
  Plus,
  RotateCcw,
  Shuffle,
  Trash2,
} from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui";
import { AlgorithmPicker } from "@/components/visualizers/shared";
import type { AlgorithmMeta } from "@/types";

import type { EditorMode } from "./graph-editor";

interface GraphControlsProps {
  algorithms: AlgorithmMeta[];
  generators: Record<
    string,
    (input: unknown) => Generator<never, void, undefined>
  >;
  defaultInput: unknown;
  editorMode: EditorMode;
  onEditorModeChange: (mode: EditorMode) => void;
  directed: boolean;
  onDirectedChange: (directed: boolean) => void;
  weighted: boolean;
  onWeightedChange: (weighted: boolean) => void;
  sourceNode: string;
  nodeIds: { id: string; label: string }[];
  onSourceNodeChange: (id: string) => void;
  onPresetLoad: (presetName: string) => void;
  onRandomize: () => void;
  onClear: () => void;
}

const modes: {
  mode: EditorMode;
  icon: typeof MousePointer2;
  label: string;
  tooltip: string;
}[] = [
  {
    mode: "select",
    icon: MousePointer2,
    label: "Select",
    tooltip: "Drag nodes to move them · Middle-click drag to pan",
  },
  {
    mode: "addNode",
    icon: Plus,
    label: "Add Node",
    tooltip: "Click on the canvas to add a new node",
  },
  {
    mode: "addEdge",
    icon: GitBranch,
    label: "Add Edge",
    tooltip: "Drag from one node to another to connect them",
  },
  {
    mode: "delete",
    icon: Trash2,
    label: "Delete",
    tooltip: "Click a node or edge to delete it",
  },
];

const presetNames = [
  "Complete (K5)",
  "Bipartite",
  "Tree",
  "DAG",
  "Cyclic (SCC)",
  "Negative Edges",
  "Random (8 nodes)",
];

export function GraphControls({
  algorithms,
  generators,
  defaultInput,
  editorMode,
  onEditorModeChange,
  directed,
  onDirectedChange,
  weighted,
  onWeightedChange,
  sourceNode,
  nodeIds,
  onSourceNodeChange,
  onPresetLoad,
  onRandomize,
  onClear,
}: GraphControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <AlgorithmPicker
        algorithms={algorithms}
        generators={generators}
        defaultInput={defaultInput}
        className="w-48"
      />

      <TooltipProvider delayDuration={200}>
        <div className="flex items-center overflow-hidden rounded-md border border-border">
          {modes.map(({ mode, icon: Icon, label, tooltip }) => (
            <Tooltip key={mode}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  title={tooltip}
                  onClick={() => onEditorModeChange(mode)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 font-mono text-xs transition-colors ${
                    editorMode === mode
                      ? "bg-zinc-700 text-zinc-100"
                      : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                  }`}
                >
                  <Icon size={14} />
                  <span>{label}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className="z-[100] max-w-[220px] text-xs"
              >
                {tooltip}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>

      <button
        onClick={() => onDirectedChange(!directed)}
        className={`rounded-md border px-2.5 py-1.5 font-mono text-xs transition-colors ${
          directed
            ? "border-cyan-400/50 bg-cyan-950 text-cyan-300"
            : "border-border bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
        }`}
      >
        {directed ? "Directed" : "Undirected"}
      </button>

      <button
        onClick={() => onWeightedChange(!weighted)}
        className={`rounded-md border px-2.5 py-1.5 font-mono text-xs transition-colors ${
          weighted
            ? "border-amber-400/50 bg-amber-950 text-amber-300"
            : "border-border bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
        }`}
      >
        {weighted ? "Weighted" : "Unweighted"}
      </button>

      <select
        value={sourceNode}
        onChange={(e) => onSourceNodeChange(e.target.value)}
        className="rounded-md border border-border bg-zinc-900 px-2 py-1.5 font-mono text-xs text-zinc-300"
        title="Source node"
      >
        {nodeIds.map((n) => (
          <option key={n.id} value={n.id}>
            Source: {n.label}
          </option>
        ))}
      </select>

      <select
        onChange={(e) => {
          if (e.target.value) onPresetLoad(e.target.value);
          e.target.value = "";
        }}
        className="rounded-md border border-border bg-zinc-900 px-2 py-1.5 font-mono text-xs text-zinc-300"
        defaultValue=""
      >
        <option value="" disabled>
          Presets...
        </option>
        {presetNames.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>

      <button
        onClick={onRandomize}
        className="flex items-center gap-1 rounded-md border border-border bg-zinc-900 px-2.5 py-1.5 font-mono text-xs text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
        title="Random graph"
      >
        <Shuffle size={14} />
        <span className="hidden sm:inline">Random</span>
      </button>

      <button
        onClick={onClear}
        className="flex items-center gap-1 rounded-md border border-border bg-zinc-900 px-2.5 py-1.5 font-mono text-xs text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
        title="Clear graph"
      >
        <RotateCcw size={14} />
        <span className="hidden sm:inline">Clear</span>
      </button>
    </div>
  );
}
