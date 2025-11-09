// computePrim(nodes, edges) -> returns array of edges in MST in order
export default function computePrim(nodes = [], edges = []) {
  const n = nodes.length;
  if (n === 0) return [];

  // Build adjacency list mapping node -> list of {edgeId, to, weight}
  const adj = Array.from({ length: n }, () => []);
  edges.forEach((e, idx) => {
    const { u, v, weight } = e;
    adj[u].push({ edgeId: idx, to: v, weight });
    adj[v].push({ edgeId: idx, to: u, weight });
  });

  const visited = new Array(n).fill(false);
  const mstEdges = [];
  visited[0] = true;
  let visitedCount = 1;

  // candidate edges are those where one endpoint is visited
  while (visitedCount < n) {
    let best = null;
    // find minimum weight edge with exactly one endpoint visited
    for (let i = 0; i < n; i++) {
      if (!visited[i]) continue;
      for (const e of adj[i]) {
        if (visited[e.to]) continue;
        if (!best || e.weight < best.weight) {
          best = { ...e, from: i };
        }
      }
    }
    if (!best) break; // graph not connected
    // push the edge object (find original edge)
    const original = edges[best.edgeId];
    mstEdges.push({ ...original });
    visited[best.to] = true;
    visitedCount++;
  }

  return mstEdges;
}
