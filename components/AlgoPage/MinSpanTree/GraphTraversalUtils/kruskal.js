// Union-Find (Disjoint Set Union) data structure for Kruskal's algorithm
class UnionFind {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = Array(n).fill(0);
  }

  find(x) {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]); // path compression
    }
    return this.parent[x];
  }

  union(x, y) {
    const px = this.find(x);
    const py = this.find(y);
    if (px === py) return false; // already connected

    // union by rank
    if (this.rank[px] < this.rank[py]) {
      this.parent[px] = py;
    } else if (this.rank[px] > this.rank[py]) {
      this.parent[py] = px;
    } else {
      this.parent[py] = px;
      this.rank[px]++;
    }
    return true; // successfully connected
  }
}

// computeKruskal(nodes, edges) -> returns array of edges in MST in order
export default function computeKruskal(nodes = [], edges = []) {
  const n = nodes.length;
  if (n === 0) return [];

  // Sort edges by weight (ascending)
  const sortedEdges = edges
    .map((e, idx) => ({ ...e, originalIdx: idx }))
    .sort((a, b) => a.weight - b.weight);

  const uf = new UnionFind(n);
  const mstEdges = [];

  // Process edges in ascending order of weight
  for (const edge of sortedEdges) {
    // If endpoints are not already connected, add to MST
    if (uf.union(edge.u, edge.v)) {
      mstEdges.push({ ...edge });
      if (mstEdges.length === n - 1) break; // MST complete
    }
  }

  return mstEdges;
}
