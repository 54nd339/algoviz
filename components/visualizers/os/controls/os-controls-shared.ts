import { controlInputStyle, controlLabelStyle } from "@/components/visualizers/shared/control-styles";

export const inputStyle = controlInputStyle;
export const labelStyle = controlLabelStyle;

/** Process shape used for scheduling form inputs (simplified from full Process). */
export interface ProcessInput {
  id: string;
  arrivalTime: number;
  burstTime: number;
  priority?: number;
}
