"use client";

import { useCallback, useState } from "react";

import { CategoryControlsHeader } from "@/components/visualizers/shared";
import { GAMES_GENERATORS } from "@/lib/algorithms/games";
import { cn } from "@/lib/utils";
import { useVisualizer } from "@/hooks";
import type { AlgorithmStep } from "@/types";

import { GameHints } from "../game-hints";
import type { GamesControlsProps } from "./games-controls-shared";
import { KnightControls } from "./knight-controls";
import { LifeControls } from "./life-controls";
import { QueensControls } from "./queens-controls";

export function GamesControls({
  className,
  onApplyEdit,
  hasEdits,
}: GamesControlsProps) {
  const { algorithmMeta, configure } = useVisualizer();
  const algId = algorithmMeta?.id;

  const [knightSize, setKnightSize] = useState(8);
  const [knightRow, setKnightRow] = useState(0);
  const [knightCol, setKnightCol] = useState(0);
  const [queensN, setQueensN] = useState(8);
  const [lifeRows, setLifeRows] = useState(30);
  const [lifeCols, setLifeCols] = useState(30);
  const [lifeGens, setLifeGens] = useState(60);

  const syncFromInput = useCallback((input: unknown) => {
    if (!input || typeof input !== "object") return;
    const inp = input as Record<string, unknown>;

    if ("size" in inp && "startRow" in inp && "startCol" in inp) {
      setKnightSize(inp.size as number);
      setKnightRow(inp.startRow as number);
      setKnightCol(inp.startCol as number);
    }
    if ("n" in inp && !("board" in inp) && !("grid" in inp)) {
      setQueensN(inp.n as number);
    }
    if ("grid" in inp && "generations" in inp) {
      const grid = inp.grid as boolean[][];
      if (grid.length > 0 && typeof grid[0][0] === "boolean") {
        setLifeRows(grid.length);
        setLifeCols(grid[0].length);
        setLifeGens((inp.generations as number) ?? 60);
      }
    }
  }, []);

  const applyKnight = useCallback(() => {
    if (!algorithmMeta) return;
    const gen = GAMES_GENERATORS["knight-tour"];
    if (!gen) return;
    const clampedRow = Math.min(knightRow, knightSize - 1);
    const clampedCol = Math.min(knightCol, knightSize - 1);
    configure(
      algorithmMeta,
      gen as (input: unknown) => Generator<AlgorithmStep, void, undefined>,
      { size: knightSize, startRow: clampedRow, startCol: clampedCol },
    );
  }, [algorithmMeta, configure, knightSize, knightRow, knightCol]);

  const applyQueens = useCallback(
    (n: number) => {
      if (!algorithmMeta) return;
      const gen = GAMES_GENERATORS["n-queens"];
      if (!gen) return;
      configure(
        algorithmMeta,
        gen as (input: unknown) => Generator<AlgorithmStep, void, undefined>,
        { n },
      );
    },
    [algorithmMeta, configure],
  );

  const applyLife = useCallback(() => {
    if (!algorithmMeta) return;
    const gen = GAMES_GENERATORS["game-of-life"];
    if (!gen) return;
    const grid = Array.from({ length: lifeRows }, () =>
      Array.from({ length: lifeCols }, () => false),
    );
    configure(
      algorithmMeta,
      gen as (input: unknown) => Generator<AlgorithmStep, void, undefined>,
      { grid, generations: lifeGens },
    );
  }, [algorithmMeta, configure, lifeRows, lifeCols, lifeGens]);

  if (knightRow >= knightSize) setKnightRow(knightSize - 1);
  if (knightCol >= knightSize) setKnightCol(knightSize - 1);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap items-center gap-3">
        <CategoryControlsHeader
          category="games"
          generators={
            GAMES_GENERATORS as Record<
              string,
              (input: unknown) => Generator<AlgorithmStep, void, undefined>
            >
          }
          onConfigure={syncFromInput}
        />

        {algId === "knight-tour" && (
          <KnightControls
            knightSize={knightSize}
            setKnightSize={setKnightSize}
            knightRow={knightRow}
            setKnightRow={setKnightRow}
            knightCol={knightCol}
            setKnightCol={setKnightCol}
            onApply={applyKnight}
          />
        )}

        {algId === "n-queens" && (
          <QueensControls
            queensN={queensN}
            setQueensN={setQueensN}
            onNChange={applyQueens}
          />
        )}

        {algId === "game-of-life" && (
          <LifeControls
            lifeRows={lifeRows}
            setLifeRows={setLifeRows}
            lifeCols={lifeCols}
            setLifeCols={setLifeCols}
            lifeGens={lifeGens}
            setLifeGens={setLifeGens}
            onApply={applyLife}
          />
        )}

        {hasEdits && onApplyEdit && (
          <button
            onClick={onApplyEdit}
            className="h-7 rounded border border-cyan-500/40 bg-cyan-950/30 px-3 font-mono text-[11px] text-cyan-400 transition-colors hover:bg-cyan-900/40"
          >
            Apply Edits
          </button>
        )}
      </div>

      <GameHints algId={algId} />
    </div>
  );
}

export type { GamesControlsProps } from "./games-controls-shared";
