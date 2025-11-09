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
