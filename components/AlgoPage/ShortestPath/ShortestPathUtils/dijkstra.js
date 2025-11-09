// Dijkstra's algorithm for single-source shortest paths
// Returns { distances, paths } where distances[node] = shortest distance from source
// and paths[node] = array of nodes representing the shortest path from source to node
export default function computeDijkstra(nodes = [], edges = [], sourceNode = 0) {
  const n = nodes.length;
  if (n === 0 || sourceNode < 0 || sourceNode >= n) return { distances: {}, paths: {} };

  // Build adjacency list
  const adj = Array.from({ length: n }, () => []);
  edges.forEach((e) => {
    // Handle undirected graph
    adj[e.u].push({ to: e.v, weight: e.weight });
    adj[e.v].push({ to: e.u, weight: e.weight });
  });

  // Initialize distances and paths
  const distances = {};
  const paths = {};
  nodes.forEach((n) => {
    distances[n.id] = n.id === sourceNode ? 0 : Infinity;
    paths[n.id] = n.id === sourceNode ? [sourceNode] : [];
  });

  const visited = new Set();
  const unvisited = nodes.map((n) => n.id);

  while (unvisited.length > 0) {
    // Find unvisited node with minimum distance
    let minIdx = 0;
    let minDist = Infinity;
    for (let i = 0; i < unvisited.length; i++) {
      if (distances[unvisited[i]] < minDist) {
        minDist = distances[unvisited[i]];
        minIdx = i;
      }
    }

    const u = unvisited[minIdx];
    unvisited.splice(minIdx, 1);
    visited.add(u);

    if (distances[u] === Infinity) break; // Remaining nodes unreachable

    // Update distances of neighbors
    for (const { to: v, weight } of adj[u]) {
      if (!visited.has(v)) {
        const newDist = distances[u] + weight;
        if (newDist < distances[v]) {
          distances[v] = newDist;
          paths[v] = [...paths[u], v];
        }
      }
    }
  }

  return { distances, paths };
}
