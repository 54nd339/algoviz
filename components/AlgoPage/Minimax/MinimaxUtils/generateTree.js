import { store } from "@/redux/store";
import {
  resetMetrics,
  setIsRunning,
  setLeafRange,
  setTree,
  setStatus,
  setCurrentNodeId,
} from "@/redux/reducers/minimaxSlice";

const randomInt = (min, max) => {
  const low = Math.ceil(min);
  const high = Math.floor(max);
  return Math.floor(Math.random() * (high - low + 1)) + low;
};

const createNode = (
  depth,
  maxDepth,
  branchingFactor,
  isMaxLayer,
  path,
  minLeafValue,
  maxLeafValue
) => {
  const id = path.join("-");

  if (depth === maxDepth) {
    const leafValue = randomInt(minLeafValue, maxLeafValue);
    return {
      id,
      depth,
      role: "leaf",
      value: leafValue,
      computedValue: leafValue,
      alpha: null,
      beta: null,
      status: "idle",
      children: [],
    };
  }

  const children = [];
  for (let idx = 0; idx < branchingFactor; idx++) {
    const childPath = [...path, idx];
    children.push(
      createNode(
        depth + 1,
        maxDepth,
        branchingFactor,
        !isMaxLayer,
        childPath,
        minLeafValue,
        maxLeafValue
      )
    );
  }

  return {
    id,
    depth,
    role: isMaxLayer ? "max" : "min",
    value: null,
    computedValue: null,
    alpha: Number.NEGATIVE_INFINITY,
    beta: Number.POSITIVE_INFINITY,
    status: "idle",
    children,
  };
};

export const generateTree = (options = {}) => {
  const {
    maxDepth: depthOverride,
    branchingFactor: branchingOverride,
    minLeafValue: minOverride,
    maxLeafValue: maxOverride,
  } = options;

  const state = store.getState().minimax;
  const maxDepth = Math.max(1, depthOverride ?? state.maxDepth);
  const branchingFactor = Math.max(2, branchingOverride ?? state.branchingFactor);
  const minLeafValue = minOverride ?? state.minLeafValue;
  const maxLeafValue = maxOverride ?? state.maxLeafValue;

  const tree = createNode(
    0,
    maxDepth,
    branchingFactor,
    true,
    [0],
    minLeafValue,
    maxLeafValue
  );

  store.dispatch(setLeafRange({ min: minLeafValue, max: maxLeafValue }));
  store.dispatch(setTree(tree));
  store.dispatch(resetMetrics());
  store.dispatch(setIsRunning(false));
  store.dispatch(setCurrentNodeId(null));
  store.dispatch(setStatus("ready"));
};

export default generateTree;

