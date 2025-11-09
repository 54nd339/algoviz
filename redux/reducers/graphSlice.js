import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  nodes: [],
  edges: [],
  nodeCount: 8,
  speed: 200,
  maxSpeed: 1000,
  status: "idle",
  isRunning: false,
  mstEdges: [],
  mstWeight: 0,
  nodeStatuses: {}, // { nodeId: "idle" | "active" | "visited" | "selected" }
  edgeStatuses: {}, // { edgeId: "idle" | "active" | "visited" | "animating" }
  animatingEdges: [], // edge IDs currently animating
  // Shortest path algorithm state
  sourceNode: null, // source node for shortest path
  targetNode: null, // target node for shortest path
  shortestPath: [], // array of node IDs in shortest path
  shortestPathDistance: 0, // total distance of shortest path
  distances: {}, // { nodeId: distance } from source
  allDistances: {}, // { sourceNodeId: { targetNodeId: distance } } for Floyd-Warshall
};

const graphSlice = createSlice({
  name: "graph",
  initialState,
  reducers: {
    setNodes: (state, action) => {
      state.nodes = action.payload;
    },
    setEdges: (state, action) => {
      state.edges = action.payload;
    },
    setNodeCount: (state, action) => {
      state.nodeCount = action.payload;
    },
    setSpeed: (state, action) => {
      state.speed = action.payload;
    },
    setIsRunning: (state, action) => {
      state.isRunning = action.payload;
      state.status = action.payload ? "running" : "idle";
    },
    setMstEdges: (state, action) => {
      state.mstEdges = action.payload;
      state.mstWeight = action.payload.reduce((s, e) => s + e.weight, 0);
    },
    resetGraphStats: (state) => {
      state.mstEdges = [];
      state.mstWeight = 0;
      state.isRunning = false;
      state.status = "idle";
    },
    setNodeStatus: (state, action) => {
      const { nodeId, status } = action.payload;
      state.nodeStatuses[nodeId] = status;
    },
    setEdgeStatus: (state, action) => {
      const { edgeId, status } = action.payload;
      state.edgeStatuses[edgeId] = status;
    },
    setAnimatingEdges: (state, action) => {
      state.animatingEdges = action.payload;
    },
    resetNodeStatuses: (state) => {
      state.nodeStatuses = {};
    },
    resetEdgeStatuses: (state) => {
      state.edgeStatuses = {};
      state.animatingEdges = [];
    },
    setSourceNode: (state, action) => {
      state.sourceNode = action.payload;
    },
    setTargetNode: (state, action) => {
      state.targetNode = action.payload;
    },
    setShortestPath: (state, action) => {
      const { path, distance } = action.payload;
      state.shortestPath = path;
      state.shortestPathDistance = distance;
    },
    setDistances: (state, action) => {
      state.distances = action.payload;
    },
    setAllDistances: (state, action) => {
      state.allDistances = action.payload;
    },
    resetShortestPathStats: (state) => {
      state.sourceNode = null;
      state.targetNode = null;
      state.shortestPath = [];
      state.shortestPathDistance = 0;
      state.distances = {};
      state.allDistances = {};
    },
  },
});

export const {
  setNodes,
  setEdges,
  setNodeCount,
  setSpeed,
  setIsRunning,
  setMstEdges,
  resetGraphStats,
  setNodeStatus,
  setEdgeStatus,
  setAnimatingEdges,
  resetNodeStatuses,
  resetEdgeStatuses,
  setSourceNode,
  setTargetNode,
  setShortestPath,
  setDistances,
  setAllDistances,
  resetShortestPathStats,
} = graphSlice.actions;

export default graphSlice.reducer;
