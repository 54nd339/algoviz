// Shared stop flag for TouringKnight solving
let isStopped = false;

export const setStopped = (value) => {
  isStopped = value;
};

export const getStopped = () => {
  return isStopped;
};
