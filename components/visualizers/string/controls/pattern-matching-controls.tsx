"use client";

import { AlgorithmPicker, InputPresets } from "@/components/visualizers/shared";
import { controlInputStyle, controlLabelStyle } from "@/components/visualizers/shared/control-styles";
import { STRING_GENERATORS } from "@/lib/algorithms/string";
import { cn } from "@/lib/utils";
import type { AlgorithmMeta, AlgorithmStep } from "@/types";

const inputStyle = cn(controlInputStyle, "w-40 text-left");
const patternInputStyle = cn(controlInputStyle, "w-24 text-left");
const labelStyle = controlLabelStyle;

interface PatternMatchingControlsProps {
  algorithms: AlgorithmMeta[];
  algorithmMeta: AlgorithmMeta | null;
  textValue: string;
  patternValue: string;
  onTextChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPatternChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSyncFromInput: (input: unknown) => void;
}

export function PatternMatchingControls({
  algorithms,
  algorithmMeta,
  textValue,
  patternValue,
  onTextChange,
  onPatternChange,
  onSyncFromInput,
}: PatternMatchingControlsProps) {
  const currentGen =
    algorithmMeta && algorithmMeta.id !== "regex-nfa"
      ? STRING_GENERATORS[algorithmMeta.id]
      : undefined;

  const allGenerators = {
    ...STRING_GENERATORS,
  } as Record<
    string,
    (input: unknown) => Generator<AlgorithmStep, void, undefined>
  >;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <AlgorithmPicker
        algorithms={algorithms}
        generators={allGenerators}
        defaultInput={{ text: textValue, pattern: patternValue }}
        onConfigure={onSyncFromInput}
        className="w-52"
      />
      {algorithmMeta && currentGen && (
        <InputPresets
          meta={algorithmMeta}
          generatorFn={
            currentGen as (
              input: unknown,
            ) => Generator<AlgorithmStep, void, undefined>
          }
          onPresetApplied={onSyncFromInput}
          className="w-40"
        />
      )}
      <div className="flex items-center gap-1.5">
        <label className={labelStyle}>Text:</label>
        <input
          type="text"
          value={textValue}
          onChange={onTextChange}
          className={inputStyle}
        />
      </div>
      <div className="flex items-center gap-1.5">
        <label className={labelStyle}>Pattern:</label>
        <input
          type="text"
          value={patternValue}
          onChange={onPatternChange}
          className={patternInputStyle}
        />
      </div>
    </div>
  );
}
