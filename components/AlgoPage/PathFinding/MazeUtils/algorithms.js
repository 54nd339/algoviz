import { store } from "@/redux/store";
import { setGrid } from "@/redux/reducers/pathSlice";

function getUNeighbors(node, grid) {
  const neighbors = [], reN = [];
  const { row, col } = node;
  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
  if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
  if (col > 0) neighbors.push(grid[row][col - 1]);

  for (const neighbor of neighbors) {
    if (!neighbor.isVisited) {
      neighbor.isVisited = true;
      neighbor.previousNode = node;
      reN.push(neighbor);
    }
  }
  return reN;
}

function dfs() {
  const visitedInOrder = [], unvisited = [];
  const { startNode, finishNode, grid } = store.getState().path;
  let newGrid = JSON.parse(JSON.stringify(grid));
  let start = newGrid[startNode.x][startNode.y];
  let finish = newGrid[finishNode.x][finishNode.y];

  unvisited.push(start);
  while (unvisited.length) {
    const node = unvisited.pop();
    if (node.row === finish.row && node.col === finish.col) {
      break;
    }
    if (node.isWall) continue;

    node.isVisited = true;
    visitedInOrder.push(node);
    unvisited.push(...getUNeighbors(node, newGrid));
  }
  store.dispatch(setGrid(newGrid));
  return visitedInOrder;
}

function bfs() {
  const visitedInOrder = [], unvisited = [];
  const { startNode, finishNode, grid } = store.getState().path;
  let newGrid = JSON.parse(JSON.stringify(grid));
  let start = newGrid[startNode.x][startNode.y];
  let finish = newGrid[finishNode.x][finishNode.y];

  unvisited.push(start);
  while (unvisited.length) {
    const node = unvisited.shift();
    if (node.row === finish.row && node.col === finish.col) {
      break;
    }
    if (node.isWall) continue;
  
    node.isVisited = true;
    visitedInOrder.push(node);
    unvisited.push(...getUNeighbors(node, newGrid));
  }
  store.dispatch(setGrid(newGrid));
  return visitedInOrder;
}

function updateUnvisitedNeighbors(closest, grid) {
  const neighbors = [], reN = [];
  const { row, col } = closest;
  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
  if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  
  for (const neighbor of neighbors) {
    if (!neighbor.isVisited && !neighbor.isWall) {
      neighbor.distance = closest.distance + 1;
      neighbor.previousNode = closest;
      neighbor.isVisited = true;
      reN.push(neighbor);
    }
  }
  return reN;
}

function dijkstra() {
  const visitedInOrder = [], unvisited = [];
  const { startNode, finishNode, grid } = store.getState().path;
  let newGrid = JSON.parse(JSON.stringify(grid));
  let start = newGrid[startNode.x][startNode.y];
  let finish = newGrid[finishNode.x][finishNode.y];

  start.distance = 0;
  unvisited.push(start);
  while (unvisited.length) {
    unvisited.sort((a, b) => a.distance - b.distance);
    const closest = unvisited.shift();
    if (closest.row === finish.row && closest.col === finish.col) break;
    if (closest.distance === Infinity) break;

    closest.isVisited = true;
    visitedInOrder.push(closest);
    unvisited.push(...updateUnvisitedNeighbors(closest, newGrid));
  }
  store.dispatch(setGrid(newGrid));
  return visitedInOrder;
}

function manhattanDistance(a, b) {
  let { row: ar, col: ac } = a;
  let { row: br, col: bc } = b;
  return Math.abs(ar - br) + Math.abs(ac - bc);
}
function updateUnvisitedNeighborsStar(cur, grid, finish) {
  const neighbors = [], reN = [];
  const { row, col } = cur;
  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
  if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
  if (col > 0) neighbors.push(grid[row][col - 1]);

  for (const neighbor of neighbors) {
    if (!neighbor.isVisited && !neighbor.isWall) {
      neighbor.distance = cur.distance + 1;
      neighbor.heuristic = manhattanDistance(neighbor, finish);
      neighbor.previousNode = cur;
      neighbor.isVisited = true;
      reN.push(neighbor);
    }
  }
  return reN;
}

function aStar() {
  const visitedInOrder = [], unvisited = [];
  const { startNode, finishNode, grid } = store.getState().path;
  let newGrid = JSON.parse(JSON.stringify(grid));
  let start = newGrid[startNode.x][startNode.y];
  let finish = newGrid[finishNode.x][finishNode.y];

  start.distance = 0;
  start.heuristic = manhattanDistance(start, finish);
  unvisited.push(start);
  while (unvisited.length) {
    unvisited.sort((a, b) => (a.distance + a.heuristic) - (b.distance + b.heuristic));
    const cur = unvisited.shift();
    if (cur.row === finish.row && cur.col === finish.col) break;
    if (cur.distance + cur.heuristic === Infinity) break;
    
    cur.isVisited = true;
    visitedInOrder.push(cur);
    unvisited.push(...updateUnvisitedNeighborsStar(cur, newGrid, finish));
  }
  store.dispatch(setGrid(newGrid));
  return visitedInOrder;
}

function getShortestPath(finish) {
  const path = [];
  let cur = finish;
  while (cur !== null) {
    path.unshift(cur);
    cur = cur.previousNode;
  }
  return path;
}

export { dijkstra, bfs, dfs, aStar, getShortestPath };
