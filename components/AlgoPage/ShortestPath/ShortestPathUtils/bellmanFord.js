// Bellman-Ford algorithm for single-source shortest paths
// Handles negative weights but not negative cycles
// Returns { distances, paths, hasNegativeCycle }
export default function computeBellmanFord(nodes = [], edges = [], sourceNode = 0) {
  const n = nodes.length;
  if (n === 0 || sourceNode < 0 || sourceNode >= n) return { distances: {}, paths: {}, hasNegativeCycle: false };

  // Initialize distances and paths
  const distances = {};
  const paths = {};
  nodes.forEach((n) => {
    distances[n.id] = n.id === sourceNode ? 0 : Infinity;
    paths[n.id] = n.id === sourceNode ? [sourceNode] : [];
  });

  // Relax edges n-1 times
  for (let i = 0; i < n - 1; i++) {
    for (const edge of edges) {
      const { u, v, weight } = edge;
      // Handle undirected graph - relax both directions
      if (distances[u] !== Infinity && distances[u] + weight < distances[v]) {
        distances[v] = distances[u] + weight;
        paths[v] = [...paths[u], v];
      }
      if (distances[v] !== Infinity && distances[v] + weight < distances[u]) {
        distances[u] = distances[v] + weight;
        paths[u] = [...paths[v], u];
      }
    }
  }

  // Check for negative cycles
  let hasNegativeCycle = false;
  for (const edge of edges) {
    const { u, v, weight } = edge;
    if ((distances[u] !== Infinity && distances[u] + weight < distances[v]) ||
        (distances[v] !== Infinity && distances[v] + weight < distances[u])) {
      hasNegativeCycle = true;
      break;
    }
  }

  return { distances, paths, hasNegativeCycle };
}
