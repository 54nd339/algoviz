import { MakeDelay } from "@/utils";
import { store } from "@/redux/store";
import {
  incrementEvaluated,
  resetMetrics,
  setCurrentNodeId,
  setIsRunning,
  setPrunedCount,
  setSelectedPath,
  setStatus,
  setTree,
} from "@/redux/reducers/minimaxSlice";

const cloneTree = (node) => {
  if (!node) return node;
  return {
    ...node,
    children: node.children ? node.children.map(cloneTree) : [],
  };
};

const markSubtreePruned = (node) => {
  let count = 0;
  const stack = [node];
  while (stack.length) {
    const current = stack.pop();
    if (current.status !== "pruned") {
      current.status = "pruned";
      count += 1;
    }
    if (current.children?.length) {
      stack.push(...current.children);
    }
  }
  return count;
};

const delayStep = async () => {
  const { speed } = store.getState().minimax;
  await MakeDelay(speed);
};

const pushTreeUpdate = async (tree) => {
  store.dispatch(setTree(cloneTree(tree)));
  await delayStep();
};

const minimaxTraversal = async (node, tree, isMaxLayer, alpha, beta) => {
  const state = store.getState().minimax;
  if (!state.isRunning) {
    throw new Error("stopped");
  }

  node.status = "active";
  node.alpha = isMaxLayer ? alpha : alpha;
  node.beta = isMaxLayer ? beta : beta;
  store.dispatch(setCurrentNodeId(node.id));
  await pushTreeUpdate(tree);

  if (node.role === "leaf") {
    node.status = "evaluated";
    node.computedValue = node.value;
    store.dispatch(incrementEvaluated());
    await pushTreeUpdate(tree);
    return { value: node.value, path: [node.id] };
  }

  let bestValue = isMaxLayer ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
  let bestPath = [node.id];

  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    const { value, path } = await minimaxTraversal(
      child,
      tree,
      !isMaxLayer,
      alpha,
      beta
    );

    if (isMaxLayer) {
      if (value > bestValue) {
        bestValue = value;
        bestPath = [node.id, ...path];
      }
      alpha = Math.max(alpha, value);
      node.alpha = alpha;
    } else {
      if (value < bestValue) {
        bestValue = value;
        bestPath = [node.id, ...path];
      }
      beta = Math.min(beta, value);
      node.beta = beta;
    }

    node.computedValue = bestValue;
    await pushTreeUpdate(tree);

    if (beta <= alpha) {
      const prunedNodes = node.children
        .slice(i + 1)
        .map((remaining) => markSubtreePruned(remaining))
        .reduce((acc, count) => acc + count, 0);
      if (prunedNodes > 0) {
        const currentPruned = store.getState().minimax.prunedCount;
        store.dispatch(setPrunedCount(currentPruned + prunedNodes));
        await pushTreeUpdate(tree);
      }
      break;
    }
  }

  node.status = "evaluated";
  store.dispatch(incrementEvaluated());
  await pushTreeUpdate(tree);
  return { value: bestValue, path: bestPath };
};

const markSelectedPath = (node, pathSet) => {
  if (pathSet.has(node.id)) {
    node.status = node.status === "pruned" ? "pruned" : "selected";
  }
  node.children?.forEach((child) => markSelectedPath(child, pathSet));
};

export const runMinimax = async () => {
  const state = store.getState().minimax;
  if (!state.tree || state.isRunning) {
    return;
  }

  const workingTree = cloneTree(state.tree);
  store.dispatch(resetMetrics());
  store.dispatch(setIsRunning(true));
  store.dispatch(setStatus("running"));

  try {
    const { value, path } = await minimaxTraversal(
      workingTree,
      workingTree,
      true,
      Number.NEGATIVE_INFINITY,
      Number.POSITIVE_INFINITY
    );

    const pathSet = new Set(path);
    markSelectedPath(workingTree, pathSet);
    store.dispatch(setSelectedPath(path));
    store.dispatch(setTree(cloneTree(workingTree)));
    store.dispatch(setStatus(`best value: ${value}`));
  } catch (error) {
    if (error.message !== "stopped") {
      console.error(error);
      store.dispatch(setStatus("error"));
    }
  } finally {
    store.dispatch(setIsRunning(false));
    store.dispatch(setCurrentNodeId(null));
  }
};

export default runMinimax;

