import { store } from "@/redux/store";
import { batch } from "react-redux";

import {
  setGrid,
  setRowCount,
  setColCount,
  setCellWidth,
  setCellHeight,
  setStartNode,
  setFinishNode,
  setIsFinding,
  setIsFound,
  setIsMouseDown,
  setChangeStartNode,
  setChangeFinishNode,
  setStatus
} from "@/redux/reducers/pathSlice";

const createNode = (x, y, isW, startNode, endNode) => {
  return {
    row: x,
    col: y,
    isWall: isW,
    isStart: x === startNode.x && y === startNode.y,
    isEnd: x === endNode.x && y === endNode.y,
    isVisited: false,
    distance: Infinity,
    heuristic: Infinity,
    previousNode: null,
  };
}

const generateGrid = (clearWall = false) => {
  let size = store.getState().path.cellSize;
  let conWidth = document.getElementById("visualizer-container").clientWidth;
  let conHeight = document.getElementById("visualizer-container").clientHeight;
  
  let noOfRows = Math.floor(conHeight / size);
  let noOfCols = Math.floor(conWidth / size);
  let rowArea = noOfRows * size;
  let colArea = noOfCols * size;
  let extraRowArea = conHeight - rowArea;
  let extraColArea = conWidth - colArea;
  let height = size + (extraRowArea / noOfRows);
  let width = size + (extraColArea / noOfCols);

  let { startNode, finishNode } = store.getState().path
  if (startNode == null || finishNode == null || !clearWall) {
    startNode = {
      x: Math.floor(noOfRows / 2),
      y: Math.floor(noOfCols / 6)
    }
    store.dispatch(setStartNode(startNode));
    finishNode = {
      x: Math.floor(noOfRows / 2),
      y: Math.floor(5 * noOfCols / 6)
    }
    store.dispatch(setFinishNode(finishNode));

  }

  var grid = [];
  for (let row = 0; row < noOfRows; row++) {
    var currentRow = [];
    for (let col = 0; col < noOfCols; col++) {
      let isWall = false;
      const element = document.getElementById(`node-${row}-${col}`);
      if (element && (element.className === 'node node-path' || element.className === 'node node-visited')) {
        element.className = 'node';
      }
      if (!clearWall && element && element.className === 'node node-wall') {
        isWall = true;
      }
      currentRow.push(createNode(row, col, isWall, startNode, finishNode));
    }
    grid.push(currentRow);
  }

  batch(() => {
    store.dispatch(setGrid(grid));
    store.dispatch(setRowCount(noOfRows));
    store.dispatch(setColCount(noOfCols));
    store.dispatch(setCellWidth(width));
    store.dispatch(setCellHeight(height));
    store.dispatch(setIsFinding(false));
    store.dispatch(setIsFound(false));
    store.dispatch(setIsMouseDown(false));
    store.dispatch(setChangeStartNode(false));
    store.dispatch(setChangeFinishNode(false));
    store.dispatch(setStatus("path-finding not started"));
  });
}

export default generateGrid;