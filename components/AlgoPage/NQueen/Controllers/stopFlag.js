// Shared module-level state for algorithm interruption
// Prevents duplicate/conflicting flags between SolveButton and ResetButton

let stopped = false;

export const setStopped = (value) => {
  stopped = value;
};

export const getStopped = () => {
  return stopped;
};
