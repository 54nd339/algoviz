import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import type { LSystemPreset, LSystemSegment, LSystemStep } from "./types";

export const lSystemMeta: AlgorithmMeta = {
  id: "l-system",
  name: "L-Systems",
  category: "fractals",
  description:
    "Lindenmayer systems use formal grammars (axiom + rewriting rules) and turtle graphics to generate fractal plants, curves, and space-filling patterns. Each iteration applies rules to every character in parallel.",
  timeComplexity: { best: "O(n)", average: "O(n^k)", worst: "O(n^k)" },
  spaceComplexity: "O(n^k)",
  pseudocode: `function lsystem(axiom, rules, iterations):
  string = axiom
  for i = 0 to iterations:
    newString = ""
    for each char c in string:
      newString += rules[c] or c
    string = newString
  turtle(string, angle)

turtle commands:
  F,G,0,1 = forward
  + = turn right
  - = turn left
  [ = push state
  ] = pop state`,
  presets: [
    {
      name: "Plant / Fern",
      generator: () => ({ presetIndex: 3 }),
      expectedCase: "average",
    },
    {
      name: "Dragon Curve",
      generator: () => ({ presetIndex: 2 }),
      expectedCase: "average",
    },
    {
      name: "Sierpinski Triangle",
      generator: () => ({ presetIndex: 1 }),
      expectedCase: "average",
    },
    {
      name: "Fractal Tree",
      generator: () => ({ presetIndex: 0 }),
      expectedCase: "best",
    },
    {
      name: "Koch Curve",
      generator: () => ({ presetIndex: 4 }),
      expectedCase: "average",
    },
    {
      name: "Hilbert Curve",
      generator: () => ({ presetIndex: 5 }),
      expectedCase: "average",
    },
    {
      name: "Penrose Tiling",
      generator: () => ({ presetIndex: 6 }),
      expectedCase: "average",
    },
  ],
};

registerAlgorithm(lSystemMeta);

function applyRules(str: string, rules: Record<string, string>): string {
  let result = "";
  for (const ch of str) {
    result += rules[ch] ?? ch;
  }
  return result;
}

function interpretTurtle(
  str: string,
  angle: number,
  startX: number,
  startY: number,
  stepLength: number,
  startAngle: number = -90,
): LSystemSegment[] {
  const segments: LSystemSegment[] = [];
  let x = startX;
  let y = startY;
  let dir = startAngle;
  const stack: { x: number; y: number; dir: number }[] = [];
  const drawChars = new Set(["F", "G", "0", "1"]);

  for (const ch of str) {
    if (drawChars.has(ch)) {
      const rad = (dir * Math.PI) / 180;
      const nx = x + stepLength * Math.cos(rad);
      const ny = y + stepLength * Math.sin(rad);
      segments.push({ x1: x, y1: y, x2: nx, y2: ny, depth: 0 });
      x = nx;
      y = ny;
    } else if (ch === "+") {
      dir += angle;
    } else if (ch === "-") {
      dir -= angle;
    } else if (ch === "[") {
      stack.push({ x, y, dir });
    } else if (ch === "]") {
      const state = stack.pop();
      if (state) {
        x = state.x;
        y = state.y;
        dir = state.dir;
      }
    }
  }
  return segments;
}

function normalizeSegments(
  segments: LSystemSegment[],
  canvasSize: number,
  padding: number = 30,
): LSystemSegment[] {
  if (segments.length === 0) return segments;

  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;
  for (const s of segments) {
    minX = Math.min(minX, s.x1, s.x2);
    maxX = Math.max(maxX, s.x1, s.x2);
    minY = Math.min(minY, s.y1, s.y2);
    maxY = Math.max(maxY, s.y1, s.y2);
  }

  const w = maxX - minX || 1;
  const h = maxY - minY || 1;
  const scale = (canvasSize - 2 * padding) / Math.max(w, h);
  const offsetX = (canvasSize - w * scale) / 2 - minX * scale;
  const offsetY = (canvasSize - h * scale) / 2 - minY * scale;

  return segments.map((s) => ({
    x1: s.x1 * scale + offsetX,
    y1: s.y1 * scale + offsetY,
    x2: s.x2 * scale + offsetX,
    y2: s.y2 * scale + offsetY,
    depth: s.depth,
  }));
}

// Re-import the presets constant for runtime use
import { L_SYSTEM_PRESETS as PRESETS } from "./types";

export function* lSystem(input: {
  presetIndex?: number;
  axiom?: string;
  rules?: Record<string, string>;
  angle?: number;
  iterations?: number;
}): AlgorithmGenerator<LSystemStep> {
  let preset: LSystemPreset;
  const presetIdx = input.presetIndex ?? 0;

  if (input.axiom && input.rules) {
    preset = {
      name: "Custom",
      axiom: input.axiom,
      rules: input.rules,
      angle: input.angle ?? 25,
      iterations: input.iterations ?? 4,
    };
  } else {
    preset = PRESETS[presetIdx] ?? PRESETS[0];
  }

  const { axiom, rules, angle, iterations } = preset;
  let current = axiom;

  yield {
    type: "init",
    data: {
      axiom,
      rules,
      currentString: current,
      iteration: 0,
      maxIteration: iterations,
      segments: normalizeSegments(
        interpretTurtle(current, angle, 250, 250, 10),
        500,
      ),
      angle,
      presetName: preset.name,
    },
    description: `L-System "${preset.name}" — axiom: ${axiom}`,
    codeLine: 1,
    variables: { axiom, rules, angle, iterations, length: current.length },
  };

  for (let i = 1; i <= iterations; i++) {
    current = applyRules(current, rules);
    const rawSegments = interpretTurtle(current, angle, 0, 0, 10);
    const segments = normalizeSegments(rawSegments, 500);

    yield {
      type: "iterate",
      data: {
        axiom,
        rules,
        currentString:
          current.length > 500 ? current.slice(0, 500) + "…" : current,
        iteration: i,
        maxIteration: iterations,
        segments,
        angle,
        presetName: preset.name,
      },
      description: `Iteration ${i}: string length ${current.length}, ${segments.length} segments`,
      codeLine: 4,
      variables: {
        iteration: i,
        stringLength: current.length,
        segmentCount: segments.length,
      },
    };
  }

  const finalSegments = normalizeSegments(
    interpretTurtle(current, angle, 0, 0, 10),
    500,
  );

  yield {
    type: "done",
    data: {
      axiom,
      rules,
      currentString:
        current.length > 500 ? current.slice(0, 500) + "…" : current,
      iteration: iterations,
      maxIteration: iterations,
      segments: finalSegments,
      angle,
      presetName: preset.name,
    },
    description: `L-System complete: ${finalSegments.length} segments after ${iterations} iterations`,
    codeLine: 8,
    variables: {
      totalSegments: finalSegments.length,
      finalLength: current.length,
    },
  };
}
