"use client";

import { useCallback } from "react";
import {
  Box,
  Eraser,
  Flag,
  LayoutGrid,
  MapPin,
  Mountain,
  MousePointer2,
  Pencil,
  RotateCcw,
  RouteOff,
  Trash2,
} from "lucide-react";

import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Slider,
  Switch,
  ToggleGroup,
  ToggleGroupItem,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui";
import { AlgorithmPicker } from "@/components/visualizers/shared";
import { getByCategory } from "@/lib/algorithms";
import { PATHFINDING_GENERATORS } from "@/lib/algorithms/pathfinding";
import { MAZE_GENERATORS } from "@/lib/algorithms/pathfinding/maze";
import type { EditorMode } from "@/lib/engine";
import { cn } from "@/lib/utils";
import { useVisualizer } from "@/hooks";

interface GridControlsProps {
  gridSize: number;
  grid: import("@/lib/algorithms/pathfinding/types").CellState[][];
  startPos: [number, number];
  endPos: [number, number];
  weights: Record<string, number>;
  onGridSizeChange: (size: number) => void;
  editorMode: EditorMode;
  onEditorModeChange: (mode: EditorMode) => void;
  allowDiagonal: boolean;
  onAllowDiagonalChange: (val: boolean) => void;
  heuristic: "manhattan" | "euclidean";
  onHeuristicChange: (val: "manhattan" | "euclidean") => void;
  isometric: boolean;
  onIsometricChange: (val: boolean) => void;
  onGenerateMaze: (generatorId: string) => void;
  onClearWalls: () => void;
  onClearPath: () => void;
  onResetGrid: () => void;
  className?: string;
}

const EDITOR_MODES = [
  { value: "select", label: "Select", icon: MousePointer2 },
  { value: "draw", label: "Draw Wall", icon: Pencil },
  { value: "erase", label: "Erase", icon: Eraser },
  { value: "setStart", label: "Set Start", icon: MapPin },
  { value: "setEnd", label: "Set End", icon: Flag },
  { value: "setWeight", label: "Set Weight", icon: Mountain },
] as const satisfies readonly { value: EditorMode; label: string; icon: React.ElementType }[];

export function GridControls({
  gridSize,
  grid,
  startPos,
  endPos,
  weights,
  onGridSizeChange,
  editorMode,
  onEditorModeChange,
  allowDiagonal,
  onAllowDiagonalChange,
  heuristic,
  onHeuristicChange,
  isometric,
  onIsometricChange,
  onGenerateMaze,
  onClearWalls,
  onClearPath,
  onResetGrid,
  className,
}: GridControlsProps) {
  const { algorithmMeta } = useVisualizer();
  const algorithms = getByCategory("pathfinding");

  const isAStar = algorithmMeta?.id === "pathfinding-a-star";

  const handleMazeSelect = useCallback(
    (value: string) => {
      onGenerateMaze(value);
    },
    [onGenerateMaze],
  );

  const allGenerators = PATHFINDING_GENERATORS as Record<
    string,
    (
      input: unknown,
    ) => Generator<import("@/types").AlgorithmStep, void, undefined>
  >;

  return (
    <div className={cn("space-y-2", className)}>
      {/* Row 1: Algorithm picker + presets + grid size */}
      <div className="flex flex-wrap items-center gap-3">
        <AlgorithmPicker
          algorithms={algorithms}
          generators={allGenerators}
          defaultInput={{
            rows: gridSize,
            cols: gridSize,
            start: startPos,
            end: endPos,
            allowDiagonal,
            weights,
            heuristic,
            grid,
          }}
          className="w-52"
        />

        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-text-muted">
            {gridSize}x{gridSize}
          </span>
          <Slider
            value={[gridSize]}
            min={10}
            max={60}
            step={5}
            onValueChange={([v]) => onGridSizeChange(v)}
            className="w-24"
            aria-label="Grid size"
          />
        </div>

        {/* Maze generator */}
        <Select onValueChange={handleMazeSelect}>
          <SelectTrigger className="h-7 w-44 font-mono text-xs">
            <LayoutGrid size={12} className="mr-1" />
            <SelectValue placeholder="Generate Maze" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(MAZE_GENERATORS).map(([id, { name }]) => (
              <SelectItem key={id} value={id} className="font-mono text-xs">
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Diagonal toggle */}
        <div className="flex items-center gap-1.5">
          <Switch
            checked={allowDiagonal}
            onCheckedChange={onAllowDiagonalChange}
            className="h-4 w-7"
          />
          <span className="font-mono text-[10px] text-text-muted">
            Diagonal
          </span>
        </div>

        {/* Heuristic picker (A* only) */}
        {isAStar && (
          <Select
            value={heuristic}
            onValueChange={(v) =>
              onHeuristicChange(v as "manhattan" | "euclidean")
            }
          >
            <SelectTrigger className="h-7 w-32 font-mono text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manhattan" className="font-mono text-xs">
                Manhattan
              </SelectItem>
              <SelectItem value="euclidean" className="font-mono text-xs">
                Euclidean
              </SelectItem>
            </SelectContent>
          </Select>
        )}

        {/* Isometric toggle */}
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isometric ? "default" : "outline"}
                size="sm"
                onClick={() => onIsometricChange(!isometric)}
                className="h-7 w-7 p-0"
              >
                <Box size={14} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Isometric view</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Row 2: Editor modes + actions */}
      <div className="flex flex-wrap items-center gap-3">
        <TooltipProvider delayDuration={0}>
          <ToggleGroup
            type="single"
            value={editorMode}
            onValueChange={(v) => {
              if (v) onEditorModeChange(v as EditorMode);
            }}
          >
            {EDITOR_MODES.map(({ value, label, icon: Icon }) => (
              <Tooltip key={value}>
                <TooltipTrigger asChild>
                  <ToggleGroupItem value={value} className="h-7 w-7 p-0">
                    <Icon size={14} />
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent>{label}</TooltipContent>
              </Tooltip>
            ))}
          </ToggleGroup>
        </TooltipProvider>

        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={onClearPath}
            className="h-7 gap-1 text-[10px]"
          >
            <RouteOff size={12} /> Clear Path
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onClearWalls}
            className="h-7 gap-1 text-[10px]"
          >
            <Trash2 size={12} /> Clear Walls
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onResetGrid}
            className="h-7 gap-1 text-[10px]"
          >
            <RotateCcw size={12} /> Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
