"use client";

import { Button } from "@/components/ui";
import { controlInputStyle, controlLabelStyle } from "@/components/visualizers/shared/control-styles";
import { cn } from "@/lib/utils";
import type { AlgorithmMeta } from "@/types";

const regexInputStyle =
  "h-7 w-32 rounded border border-violet-400/30 bg-bg-surface px-2 font-mono text-xs text-violet-400 focus:border-violet-400 focus:outline-none";
const textInputStyle = cn(controlInputStyle, "w-32 text-left");
const labelStyle = controlLabelStyle;

interface RegexControlsProps {
  algorithms: AlgorithmMeta[];
  regexPattern: string;
  regexInput: string;
  onRegexPatternChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRegexInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRunRegex: () => void;
  onPresetClick: (pat: string, inp: string) => void;
}

const REGEX_PRESETS = [
  { pat: "a|b", inp: "a" },
  { pat: "ab*", inp: "abbb" },
  { pat: "(ab)*c", inp: "ababc" },
  { pat: "a?b", inp: "b" },
  { pat: "(a|b)*abb", inp: "aababb" },
];

export function RegexControls({
  regexPattern,
  regexInput,
  onRegexPatternChange,
  onRegexInputChange,
  onRunRegex,
  onPresetClick,
}: RegexControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1.5">
        <label className={labelStyle}>Regex:</label>
        <input
          type="text"
          value={regexPattern}
          onChange={onRegexPatternChange}
          className={regexInputStyle}
          placeholder="ab*"
        />
      </div>
      <div className="flex items-center gap-1.5">
        <label className={labelStyle}>Input:</label>
        <input
          type="text"
          value={regexInput}
          onChange={onRegexInputChange}
          className={textInputStyle}
          placeholder="abbb"
        />
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onRunRegex}
        className="gap-1.5"
      >
        Run NFA
      </Button>
      <div className="flex gap-1">
        {REGEX_PRESETS.map(({ pat, inp }) => (
          <button
            key={pat}
            onClick={() => onPresetClick(pat, inp)}
            className="rounded border border-zinc-700 px-2 py-0.5 font-mono text-[10px] text-text-secondary transition-colors hover:border-violet-400/30 hover:text-violet-400"
          >
            /{pat}/
          </button>
        ))}
      </div>
    </div>
  );
}
