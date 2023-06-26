import { store } from "@/redux/store";
import { setGrid } from "@/redux/reducers/pathSlice";

function validate(grid, points) {
  let height = grid.length, width = grid[0].length;
  let pRe = [];
  for (let index = 0; index < points.length; index++) {
    let { row, col } = points[index];
    if ((0 <= row && row < height && 0 <= col && col < width)) {
      pRe.push(points[index]);
    }
  }
  return pRe;
}
function isVisited(visited, node) {
  let { row: nr, col: nc } = node;
  for (let index = 0; index < visited.length; index++) {
    let { row: ir, col: ic } = visited[index];
    if (nr === ir && nc === ic) {
      return true;
    }
  }
  return false;
}
function getNeighbors(grid, visited, node) {
  let { row, col } = node;
  let neighbors = [
    { row: row + 2, col: col },
    { row: row - 2, col: col },
    { row: row, col: col + 2 },
    { row: row, col: col - 2 }
  ];
  neighbors = validate(grid, neighbors.slice());
  let connected = [];
  let unconnected = [];
  neighbors.forEach(neighbor => {
    if (isVisited(visited, neighbor)) {
      connected.push(neighbor);
    } else {
      unconnected.push(neighbor);
    }
  });
  return { c: connected, u: unconnected };
}

function makeWall(grid, row, col, isW) {
  const newGrid = grid.map((nodes) => {
    return nodes.map((node) => {
      if (node.row === row && node.col === col) {
        return { ...node, isWall: isW };
      }
      return node;
    });
  })
  store.dispatch(setGrid(newGrid));
}
function connect(grid, a, b) {
  let { row: ar, col: ac } = a;
  let { row: br, col: bc } = b;
  let row = (ar + br) / 2;
  let col = (ac + bc) / 2;
  makeWall(grid, row, col, false);
}
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
function randomSelect(path) {
  return randomInt(0, path.length - 1);
}

function generateMaze() {
  let grid = store.getState().path.grid;
  let height = grid.length, width = grid[0].length;
  let sr = Math.floor(Math.random() * height);
  let sc = Math.floor(Math.random() * width);

  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      makeWall(grid, i, j, false);
      grid = store.getState().path.grid;
    }
  }

  for (let i = 0; i < height; i++) {
    for (let j = i % 2 + 1; j < width; j += i % 2 + 1) {
      makeWall(grid, i, j, true);
      grid = store.getState().path.grid;
    }
  }
  for (let i = 0; i < height; i++) {
    makeWall(grid, i, 0, true);
    grid = store.getState().path.grid;
  }

  let visited = [];
  let path = [{ row: sr, col: sc }];
  while (path.length > 0) {
    const index = randomSelect(path);
    const node = path[index];
    path.splice(index, 1);
    visited = visited.concat([node]);
    const { c: connected, u: unconnected } = getNeighbors(grid, visited, node);
    if (connected.length > 0) {
      let rn = randomSelect(connected);
      connect(grid, node, connected[rn]);
      grid = store.getState().path.grid;
      connected.splice(rn, 1);
    }
    path = path.concat(unconnected);
  }

  // Create a random path from start to finish without walls
}

export default generateMaze;