// Floyd-Warshall algorithm for all-pairs shortest paths
// Returns { distances, paths } where:
// distances[i][j] = shortest distance from node i to node j
// paths[i][j] = array of nodes representing shortest path from i to j
export default function computeFloydWarshall(nodes = [], edges = []) {
  const n = nodes.length;
  if (n === 0) return { distances: {}, paths: {} };

  // Initialize distance and path matrices
  const distances = {};
  const paths = {};
  const nodeIds = nodes.map((n) => n.id);

  nodeIds.forEach((i) => {
    distances[i] = {};
    paths[i] = {};
    nodeIds.forEach((j) => {
      if (i === j) {
        distances[i][j] = 0;
        paths[i][j] = [i];
      } else {
        distances[i][j] = Infinity;
        paths[i][j] = [];
      }
    });
  });

  // Set direct edge distances
  edges.forEach((e) => {
    const { u, v, weight } = e;
    // Handle undirected graph
    distances[u][v] = Math.min(distances[u][v] || Infinity, weight);
    distances[v][u] = Math.min(distances[v][u] || Infinity, weight);
    paths[u][v] = [u, v];
    paths[v][u] = [v, u];
  });

  // Floyd-Warshall main algorithm
  for (const k of nodeIds) {
    for (const i of nodeIds) {
      for (const j of nodeIds) {
        const newDist = distances[i][k] + distances[k][j];
        if (newDist < distances[i][j]) {
          distances[i][j] = newDist;
          // Combine paths: i -> k -> j
          paths[i][j] = [...paths[i][k].slice(0, -1), ...paths[k][j]];
        }
      }
    }
  }

  return { distances, paths };
}
