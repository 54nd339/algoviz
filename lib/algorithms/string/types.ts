export interface StringMatchStep {
  text: string;
  pattern: string;
  textIndex: number;
  patternIndex: number;
  patternOffset: number;
  matchedChars: number[];
  mismatchAt?: number;
  found: number[];
  table?: number[];
  tableHighlight?: number;
  hashValue?: number;
  patternHash?: number;
  comparisons: number;
  phase?: "build-table" | "search";
  algorithmId?: string;
}

export interface NFAState {
  id: number;
  label?: string;
  isAccepting: boolean;
}

export interface NFATransition {
  from: number;
  to: number;
  symbol: string | null;
}

export function isStringInput(
  input: unknown,
): input is { text: string; pattern: string } {
  return (
    input != null &&
    typeof input === "object" &&
    "text" in input &&
    typeof (input as { text: unknown }).text === "string" &&
    "pattern" in input &&
    typeof (input as { pattern: unknown }).pattern === "string"
  );
}

export interface RegexNFAStep {
  states: NFAState[];
  transitions: NFATransition[];
  currentStates: number[];
  inputIndex: number;
  input: string;
  pattern: string;
  accepted: boolean;
  phase: "build" | "simulate";
  description: string;
}
