import type { FibTreeNode } from "./types";

export interface LayoutNode {
  node: FibTreeNode;
  x: number;
  y: number;
  children: LayoutNode[];
}

export const NODE_R = 18;
export const LEVEL_H = 60;
export const MIN_SPACING = 44;

export function layoutTree(root: FibTreeNode): {
  layout: LayoutNode;
  width: number;
  height: number;
} {
  let nextX = 0;

  function computeLayout(node: FibTreeNode, depth: number): LayoutNode {
    if (node.children.length === 0) {
      const x = nextX;
      nextX += MIN_SPACING;
      return { node, x, y: depth * LEVEL_H + NODE_R + 10, children: [] };
    }

    const childLayouts = node.children.map((c) => computeLayout(c, depth + 1));
    const x =
      (childLayouts[0].x + childLayouts[childLayouts.length - 1].x) / 2;

    return {
      node,
      x,
      y: depth * LEVEL_H + NODE_R + 10,
      children: childLayouts,
    };
  }

  const layout = computeLayout(root, 0);

  function maxDepth(n: LayoutNode): number {
    if (n.children.length === 0) return n.y;
    return Math.max(...n.children.map(maxDepth));
  }

  return { layout, width: nextX, height: maxDepth(layout) + NODE_R + 10 };
}
