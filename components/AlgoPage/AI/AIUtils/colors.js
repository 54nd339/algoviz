let tailwindConfiger = require("/tailwind.config.js");
let tailwindColors = tailwindConfiger.theme.colors;

// Generic colors for ML visualization
export const PRIMARY_COLOR = tailwindColors["blue"];
export const SECONDARY_COLOR = tailwindColors["red"];
export const GRID_COLOR = tailwindColors["border-1"];
export const AXIS_COLOR = tailwindColors["text-1"];
export const TEXT_COLOR = tailwindColors["text-1"];
export const BG_COLOR = tailwindColors["graphPattern"];

// Backward compatibility
export const DATA_POINTS_COLOR = PRIMARY_COLOR;
export const FIT_LINE_COLOR = SECONDARY_COLOR;

// Color palette for multiple groups/clusters
const PALETTE = [
  "#3B82F6", // blue
  "#EF4444", // red
  "#10B981", // emerald
  "#F59E0B", // amber
  "#8B5CF6", // violet
  "#EC4899", // pink
  "#06B6D4", // cyan
  "#6366F1", // indigo
  "#14B8A6", // teal
  "#F97316", // orange
];

export const getGroupColor = (groupId) => {
  return PALETTE[groupId % PALETTE.length];
};
