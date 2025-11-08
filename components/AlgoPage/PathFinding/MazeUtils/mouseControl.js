import { store } from "@/redux/store";
import {
  setIsMouseDown,
  setChangeStartNode,
  setChangeFinishNode,
  setStartNode,
  setFinishNode,
  setGrid,
} from "@/redux/reducers/pathSlice";

const updateGridWithWall = (grid, row, col) => {
  const newGrid = grid.map((nodes) => {
    return nodes.map((node) => {
      if (node.row === row && node.col === col) {
        return { ...node, isWall: !node.isWall };
      }
      return node;
    });
  });
  store.dispatch(setGrid(newGrid));
}
const clearVisitedAndPath = () => {
  const { rowCount, colCount } = store.getState().path;

  for(let row = 0; row < rowCount; row++){
    for(let col = 0; col < colCount; col++){
      let n = document.getElementById(`node-${row}-${col}`);
      if(n && (n.className === 'node node-visited' || n.className === 'node node-path')){
        n.className = 'node';
      }
    }
  }
}

export const handleMouseDown = (row, col) => {
  const { grid, startNode, finishNode, isFinding } = store.getState().path;

  if (row === startNode.x && col === startNode.y) {
    store.dispatch(setChangeStartNode(true));
  }
  else if (row === finishNode.x && col === finishNode.y) {
    store.dispatch(setChangeFinishNode(true));
  }
  else if (!isFinding) {
    updateGridWithWall(grid, row, col);
    store.dispatch(setIsMouseDown(true));
    clearVisitedAndPath();
  }
}

export const handleMouseEnter = (row, col) => {
  const {
    grid,
    startNode,
    finishNode,
    isFinding,
    isMouseDown,
    changeStartNode,
    changeFinishNode
  } = store.getState().path;

  if (isMouseDown && !isFinding) {
    updateGridWithWall(grid, row, col);
    store.dispatch(setIsMouseDown(true));
  }
  else if (changeStartNode && !isFinding && !(row === finishNode.x && col === finishNode.y)) {
    const start = document.getElementById(`node-${startNode.x}-${startNode.y}`);
    if (start) {
      start.className = 'node';
      start.isStart = false;
      const newGrid = grid.map((nodes) => {
        return nodes.map((node) => {
          if (node.row === startNode.x && node.col === startNode.y) {
            return { ...node, isStart: false };
          }
          return node;
        });
      })
      store.dispatch(setGrid(newGrid));
    }
    const newStart = document.getElementById(`node-${row}-${col}`);
    if (newStart) {
      newStart.className = 'node node-start';
      newStart.isStart = true;
      const newGrid = grid.map((nodes) => {
        return nodes.map((node) => {
          if (node.row === row && node.col === col) {
            return { ...node, isStart: true };
          }
          return node;
        });
      })
      store.dispatch(setGrid(newGrid));
    }
    store.dispatch(setStartNode({ x: row, y: col }));
    clearVisitedAndPath();
  }
  else if (changeFinishNode && !isFinding && !(row === startNode.x && col === startNode.y)) {
    const finish = document.getElementById(`node-${finishNode.x}-${finishNode.y}`);
    if (finish) {
      finish.className = 'node';
      finish.isEnd = false;
      const newGrid = grid.map((nodes) => {
        return nodes.map((node) => {
          if (node.row === finishNode.x && node.col === finishNode.y) {
            return { ...node, isEnd: false };
          }
          return node;
        });
      })
      store.dispatch(setGrid(newGrid));
    }
    const newFinish = document.getElementById(`node-${row}-${col}`);
    if (newFinish) {
      newFinish.className = 'node node-finish';
      newFinish.isEnd = true;
      const newGrid = grid.map((nodes) => {
        return nodes.map((node) => {
          if (node.row === row && node.col === col) {
            return { ...node, isEnd: true };
          }
          return node;
        });
      })
      store.dispatch(setGrid(newGrid));
    }
    store.dispatch(setFinishNode({ x: row, y: col }));
    clearVisitedAndPath();
  }
}

export const handleMouseUp = () => {
  const { changeStartNode, changeFinishNode } = store.getState().path;

  if (changeStartNode) {
    store.dispatch(setChangeStartNode(false));
  }
  else if (changeFinishNode) {
    store.dispatch(setChangeFinishNode(false));
  }
  else {
    store.dispatch(setIsMouseDown(false));
  }
}
