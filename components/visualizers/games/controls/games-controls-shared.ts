import { controlBtnStyle, controlInputStyle, controlLabelStyle } from "@/components/visualizers/shared/control-styles";
import { cn } from "@/lib/utils";

/** Shared types and style constants for game control components */
export interface GamesControlsProps {
  className?: string;
  /** Sudoku / Life / Puzzle edit grids */
  editGrid?: unknown;
  onApplyEdit?: () => void;
  hasEdits?: boolean;
}

export const inputStyle = cn(controlInputStyle, "w-14");
export const labelStyle = controlLabelStyle;
export const btnStyle = controlBtnStyle;
