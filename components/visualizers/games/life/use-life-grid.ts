"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { GAMES_GENERATORS, type LifeStep } from "@/lib/algorithms/games";
import { useVisualizer } from "@/hooks";
import type { AlgorithmStep } from "@/types";

export function useLifeGrid(step: AlgorithmStep<LifeStep> | null) {
  const {
    algorithmMeta,
    configure,
    engineState,
    totalMaterialized,
    play,
    engineInput,
  } = useVisualizer();
  const data = step?.data;

  const isEditable =
    engineState === "idle" ||
    engineState === "ready" ||
    engineState === "materializing";

  const [drawGrid, setDrawGrid] = useState<boolean[][] | null>(null);
  const [dirty, setDirty] = useState(false);
  const drawingRef = useRef(false);
  const drawValueRef = useRef(true);
  const pendingPlayRef = useRef(false);
  const prevEditableRef = useRef(isEditable);
  const configuredGensRef = useRef(60);

  useEffect(() => {
    if (
      engineInput &&
      typeof engineInput === "object" &&
      "generations" in (engineInput as Record<string, unknown>)
    ) {
      configuredGensRef.current = (
        engineInput as { generations: number }
      ).generations;
    }
  }, [engineInput]);

  useEffect(() => {
    if (data && isEditable && !drawGrid) {
      setDrawGrid(data.grid.map((r) => [...r]));
    }
  }, [data, isEditable, drawGrid]);

  const gridRows = data?.grid?.length ?? 0;
  const gridCols = data?.grid?.[0]?.length ?? 0;
  useEffect(() => {
    if (data && (engineState === "idle" || engineState === "ready")) {
      setDrawGrid(data.grid.map((r) => [...r]));
      setDirty(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [algorithmMeta?.id, totalMaterialized, gridRows, gridCols]);

  useEffect(() => {
    const wasEditable = prevEditableRef.current;
    prevEditableRef.current = isEditable;

    if (wasEditable && !isEditable && dirty && drawGrid && algorithmMeta) {
      const gen = GAMES_GENERATORS["game-of-life"];
      if (!gen) return;
      configure(
        algorithmMeta,
        gen as (input: unknown) => Generator<AlgorithmStep, void, undefined>,
        {
          grid: drawGrid.map((r) => [...r]),
          generations: configuredGensRef.current,
        },
      );
      setDirty(false);
      pendingPlayRef.current = true;
    }
  }, [isEditable, dirty, drawGrid, algorithmMeta, configure]);

  useEffect(() => {
    if (pendingPlayRef.current && engineState === "ready") {
      pendingPlayRef.current = false;
      play();
    }
  }, [engineState, play]);

  const activeGrid = (isEditable || dirty) && drawGrid ? drawGrid : data?.grid;
  const rows = activeGrid?.length ?? 0;
  const cols = rows > 0 ? (activeGrid?.[0]?.length ?? 0) : 0;

  const toggleCell = useCallback(
    (row: number, col: number, value?: boolean) => {
      setDrawGrid((prev) => {
        if (!prev) return prev;
        const newGrid = prev.map((r) => [...r]);
        newGrid[row][col] = value ?? !newGrid[row][col];
        return newGrid;
      });
      setDirty(true);
    },
    [],
  );

  const clearGrid = useCallback(() => {
    if (!drawGrid) return;
    setDrawGrid(drawGrid.map((r) => r.map(() => false)));
    setDirty(true);
  }, [drawGrid]);

  const handleCellPointerDown = useCallback(
    (row: number, col: number) => {
      if (!isEditable || !drawGrid) return;
      drawingRef.current = true;
      drawValueRef.current = !drawGrid[row][col];
      toggleCell(row, col, drawValueRef.current);
    },
    [isEditable, drawGrid, toggleCell],
  );

  const handleCellPointerMove = useCallback(
    (row: number, col: number) => {
      if (!drawingRef.current || !isEditable) return;
      toggleCell(row, col, drawValueRef.current);
    },
    [isEditable, toggleCell],
  );

  const handleCellPointerUp = useCallback(() => {
    drawingRef.current = false;
  }, []);

  return {
    activeGrid,
    data,
    drawGrid,
    rows,
    cols,
    isEditable,
    handleCellPointerDown,
    handleCellPointerMove,
    handleCellPointerUp,
    clearGrid,
  };
}
