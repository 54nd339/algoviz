import type {
  BTreeNode,
  HuffmanNode,
  NodeVariant,
  TreeNode,
  TrieNode,
} from "@/lib/algorithms/data-structures";

// ── Layout interfaces ────────────────────────────────────────────────────────

export interface LayoutNode {
  id: string;
  label: string;
  sublabel?: string;
  x: number;
  y: number;
  color?: "red" | "black";
  isHighlighted: boolean;
  isEnd?: boolean;
  multiKey?: boolean;
}

export interface LayoutEdge {
  from: string;
  to: string;
  isHighlighted: boolean;
}

// ── Layout constants ────────────────────────────────────────────────────────

export const H_GAP = 56;
export const V_GAP = 72;
export const NODE_SIZE = 40;
export const NODE_HALF_H = NODE_SIZE / 2;
export const WIDE_NODE_W = 72;
export const B_TREE_H_GAP = 88;
export const B_TREE_V_GAP = 80;

// ── Layout functions ───────────────────────────────────────────────────────

export function layoutBinaryTree(
  node: TreeNode | HuffmanNode | null,
  highlightNodes: Set<string>,
  highlightEdges: Set<string>,
  variant: NodeVariant,
  depth = 0,
  offset = 0,
): { nodes: LayoutNode[]; edges: LayoutEdge[]; width: number } {
  if (!node) return { nodes: [], edges: [], width: 0 };

  const left = layoutBinaryTree(
    node.left,
    highlightNodes,
    highlightEdges,
    variant,
    depth + 1,
    offset,
  );
  const rightOffset = offset + Math.max(left.width, 1);
  const right = layoutBinaryTree(
    node.right,
    highlightNodes,
    highlightEdges,
    variant,
    depth + 1,
    rightOffset,
  );

  const x = left.width > 0 ? offset + left.width : rightOffset;
  const y = depth;

  const isHuffman = "freq" in node;
  let label: string;
  let sublabel: string | undefined;
  if (isHuffman) {
    const hn = node as HuffmanNode;
    label = hn.char ? (hn.char === " " ? "⎵" : hn.char) : "⊕";
    sublabel = String(hn.freq);
  } else {
    label = String(node.value);
  }

  const layoutNode: LayoutNode = {
    id: node.id,
    label,
    sublabel,
    x: x * H_GAP,
    y: y * V_GAP,
    color: "color" in node ? (node as TreeNode).color : undefined,
    isHighlighted: highlightNodes.has(node.id),
    isEnd: false,
  };

  const edges: LayoutEdge[] = [...left.edges, ...right.edges];
  if (node.left) {
    const edgeKey = `${node.id}-${node.left.id}`;
    edges.push({
      from: node.id,
      to: node.left.id,
      isHighlighted: highlightEdges.has(edgeKey),
    });
  }
  if (node.right) {
    const edgeKey = `${node.id}-${node.right.id}`;
    edges.push({
      from: node.id,
      to: node.right.id,
      isHighlighted: highlightEdges.has(edgeKey),
    });
  }

  const totalWidth = Math.max(left.width + right.width + 1, 1);

  return {
    nodes: [layoutNode, ...left.nodes, ...right.nodes],
    edges,
    width: totalWidth,
  };
}

export function layoutBTree(
  node: BTreeNode | null,
  highlightNodes: Set<string>,
  highlightEdges: Set<string>,
  depth = 0,
  offset = 0,
): { nodes: LayoutNode[]; edges: LayoutEdge[]; width: number } {
  if (!node) return { nodes: [], edges: [], width: 0 };

  const childLayouts: {
    nodes: LayoutNode[];
    edges: LayoutEdge[];
    width: number;
  }[] = [];
  let childOffset = offset;
  for (const child of node.children) {
    const cl = layoutBTree(
      child,
      highlightNodes,
      highlightEdges,
      depth + 1,
      childOffset,
    );
    childLayouts.push(cl);
    childOffset += Math.max(cl.width, 1);
  }

  const totalChildWidth = childLayouts.reduce(
    (acc, cl) => acc + Math.max(cl.width, 1),
    0,
  );
  const x =
    node.children.length > 0 ? offset + totalChildWidth / 2 : offset + 0.5;
  const y = depth;

  const layoutNode: LayoutNode = {
    id: node.id,
    label: node.keys.join(" | "),
    x: x * B_TREE_H_GAP,
    y: y * B_TREE_V_GAP,
    isHighlighted: highlightNodes.has(node.id),
    multiKey: true,
  };

  const allNodes = [layoutNode];
  const allEdges: LayoutEdge[] = [];

  for (let i = 0; i < childLayouts.length; i++) {
    allNodes.push(...childLayouts[i].nodes);
    allEdges.push(...childLayouts[i].edges);
    const edgeKey = `${node.id}-${node.children[i].id}`;
    allEdges.push({
      from: node.id,
      to: node.children[i].id,
      isHighlighted: highlightEdges.has(edgeKey),
    });
  }

  return {
    nodes: allNodes,
    edges: allEdges,
    width: Math.max(totalChildWidth, 1),
  };
}

export function layoutTrie(
  node: TrieNode | null,
  highlightNodes: Set<string>,
  highlightEdges: Set<string>,
  depth = 0,
  offset = 0,
): { nodes: LayoutNode[]; edges: LayoutEdge[]; width: number } {
  if (!node) return { nodes: [], edges: [], width: 0 };

  const children = Object.values(node.children);
  const childLayouts: {
    nodes: LayoutNode[];
    edges: LayoutEdge[];
    width: number;
  }[] = [];
  let childOffset = offset;
  for (const child of children) {
    const cl = layoutTrie(
      child,
      highlightNodes,
      highlightEdges,
      depth + 1,
      childOffset,
    );
    childLayouts.push(cl);
    childOffset += Math.max(cl.width, 1);
  }

  const totalChildWidth = childLayouts.reduce(
    (acc, cl) => acc + Math.max(cl.width, 1),
    0,
  );
  const x = children.length > 0 ? offset + totalChildWidth / 2 : offset + 0.5;
  const y = depth;

  const layoutNode: LayoutNode = {
    id: node.id,
    label: node.char || "∅",
    x: x * H_GAP,
    y: y * V_GAP,
    isHighlighted: highlightNodes.has(node.id),
    isEnd: node.isEnd,
  };

  const allNodes = [layoutNode];
  const allEdges: LayoutEdge[] = [];

  for (let i = 0; i < children.length; i++) {
    allNodes.push(...childLayouts[i].nodes);
    allEdges.push(...childLayouts[i].edges);
    const edgeKey = `${node.id}-${children[i].id}`;
    allEdges.push({
      from: node.id,
      to: children[i].id,
      isHighlighted: highlightEdges.has(edgeKey),
    });
  }

  return {
    nodes: allNodes,
    edges: allEdges,
    width: Math.max(totalChildWidth, 1),
  };
}
