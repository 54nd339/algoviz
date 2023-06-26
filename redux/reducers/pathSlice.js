import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // Grid
  grid: [],
  rowCount: 0,
  colCount: 0,
  // Cell
  cellWidth: 0,
  cellHeight: 0,
  // Count Slider
  cellSize: 50,
  minCellSize: 25,
  maxCellSize: 100,
  // Node
  startNode: null,
  finishNode: null,
  // Speed
  speed: 0,
  maxSpeed: 300,
  // Mouse
  isMouseDown: false,
  changeStartNode: false,
  changeFinishNode: false,
  // Status
  isFinding: false,
  isFound: false,
  status: "path-finding not started",
};

const pathSlice = createSlice({
  name: "path",
  initialState,
  reducers: {
    setGrid: (state, action) => {
      state.grid = [];
      state.grid = action.payload;
    },
    setRowCount: (state, action) => {
      state.rowCount = action.payload;
    },
    setColCount: (state, action) => {
      state.colCount = action.payload;
    },
    setCellWidth: (state, action) => {
      state.cellWidth = action.payload;
      state.nodeWidth = action.payload;
    },
    setCellHeight: (state, action) => {
      state.cellHeight = action.payload;
      state.nodeHeight = action.payload;
    },
    setCellSize: (state, action) => {
      state.cellSize = action.payload;
    },
    setStartNode: (state, action) => {
      state.startNode = action.payload;
    },
    setFinishNode: (state, action) => {
      state.finishNode = action.payload;
    },
    setSpeed: (state, action) => {
      state.speed = action.payload;
    },
    setIsFinding: (state, action) => {
      state.isFinding = action.payload;
    },
    setIsFound: (state, action) => {
      state.isFound = action.payload;
    },
    setStatus: (state, action) => {
      state.status = action.payload;
    },
    setIsMouseDown: (state, action) => {
      state.isMouseDown = action.payload;
    },
    setChangeStartNode: (state, action) => {
      state.changeStartNode = action.payload;
    },
    setChangeFinishNode: (state, action) => {
      state.changeFinishNode = action.payload;
    }
  },
});

export const {
  setGrid,
  setRowCount,
  setColCount,
  setCellWidth,
  setCellHeight,
  setCellSize,
  setStartNode,
  setFinishNode,
  setSpeed,
  setIsFinding,
  setIsFound,
  setStatus,
  setIsMouseDown,
  setChangeStartNode,
  setChangeFinishNode
} = pathSlice.actions;

export default pathSlice.reducer;
