import type { NFAState, NFATransition } from "./types";

export interface LayoutNode {
  state: NFAState;
  x: number;
  y: number;
}

export function layoutStates(
  states: NFAState[],
  transitions: NFATransition[],
): LayoutNode[] {
  const n = states.length;
  if (n === 0) return [];

  // Topological-ish layer assignment via BFS from state 0
  const layers = new Map<number, number>();
  const visited = new Set<number>();
  const queue: number[] = [0];
  layers.set(0, 0);
  visited.add(0);

  while (queue.length > 0) {
    const s = queue.shift()!;
    const layer = layers.get(s)!;
    for (const t of transitions) {
      if (t.from === s && !visited.has(t.to)) {
        visited.add(t.to);
        layers.set(t.to, layer + 1);
        queue.push(t.to);
      }
    }
  }

  // Assign positions to any unvisited states
  for (const st of states) {
    if (!layers.has(st.id)) {
      layers.set(st.id, layers.size > 0 ? Math.max(...layers.values()) + 1 : 0);
    }
  }

  const layerCounts = new Map<number, number>();
  const layerIdx = new Map<number, number>();

  for (const st of states) {
    const l = layers.get(st.id)!;
    const count = layerCounts.get(l) ?? 0;
    layerIdx.set(st.id, count);
    layerCounts.set(l, count + 1);
  }

  const xSpacing = 100;
  const ySpacing = 80;
  const marginX = 60;
  const marginY = 50;

  return states.map((st) => {
    const layer = layers.get(st.id)!;
    const idx = layerIdx.get(st.id)!;
    const count = layerCounts.get(layer)!;
    return {
      state: st,
      x: marginX + layer * xSpacing,
      y:
        marginY +
        idx * ySpacing +
        ((1 - count) * ySpacing) / 2 +
        (count > 1 ? (ySpacing * (count - 1)) / 2 : 0),
    };
  });
}
