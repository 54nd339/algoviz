"use client";

import { useCallback, useState } from "react";

import { getByCategory } from "@/lib/algorithms";
import {
  REGEX_NFA_GENERATOR,
  STRING_GENERATORS,
} from "@/lib/algorithms/string";
import { isStringInput } from "@/lib/algorithms/string/types";
import { cn } from "@/lib/utils";
import { useVisualizer } from "@/hooks";

import { PatternMatchingControls } from "./pattern-matching-controls";
import { RegexControls } from "./regex-controls";

interface StringControlsProps {
  className?: string;
  isRegexMode: boolean;
  onToggleRegex: (val: boolean) => void;
}

const DEFAULT_TEXT = "AABAACAADAABAABA";
const DEFAULT_PATTERN = "AABA";

export function StringControls({
  className,
  isRegexMode,
  onToggleRegex,
}: StringControlsProps) {
  const { algorithmMeta, configure, currentStep } = useVisualizer();
  const [textValue, setTextValue] = useState(DEFAULT_TEXT);
  const [patternValue, setPatternValue] = useState(DEFAULT_PATTERN);
  const [regexPattern, setRegexPattern] = useState("ab*");
  const [regexInput, setRegexInput] = useState("abbb");
  const [prevAlgoId, setPrevAlgoId] = useState<string | undefined>(undefined);

  const algorithms = getByCategory("string");
  const patternAlgorithms = algorithms.filter((a) => a.id !== "regex-nfa");

  if (algorithmMeta?.id !== prevAlgoId) {
    setPrevAlgoId(algorithmMeta?.id);
    const data = currentStep?.data as
      | { text?: string; pattern?: string }
      | undefined;
    if (algorithmMeta?.id && data) {
      if (typeof data.text === "string") setTextValue(data.text);
      if (typeof data.pattern === "string") setPatternValue(data.pattern);
    }
  }

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setTextValue(val);
      if (algorithmMeta && algorithmMeta.id !== "regex-nfa") {
        const gen = STRING_GENERATORS[algorithmMeta.id];
        if (gen)
          configure(algorithmMeta, gen, { text: val, pattern: patternValue });
      }
    },
    [algorithmMeta, configure, patternValue],
  );

  const handlePatternChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setPatternValue(val);
      if (algorithmMeta && algorithmMeta.id !== "regex-nfa") {
        const gen = STRING_GENERATORS[algorithmMeta.id];
        if (gen)
          configure(algorithmMeta, gen, { text: textValue, pattern: val });
      }
    },
    [algorithmMeta, configure, textValue],
  );

  const handleRunRegex = useCallback(() => {
    const regexMeta = algorithms.find((a) => a.id === "regex-nfa");
    if (regexMeta) {
      configure(regexMeta, REGEX_NFA_GENERATOR, {
        text: regexInput,
        pattern: regexPattern,
      });
      onToggleRegex(true);
    }
  }, [algorithms, configure, regexInput, regexPattern, onToggleRegex]);

  const handleSwitchToRegex = useCallback(() => {
    onToggleRegex(true);
    const regexMeta = algorithms.find((a) => a.id === "regex-nfa");
    if (regexMeta) {
      configure(regexMeta, REGEX_NFA_GENERATOR, {
        text: regexInput,
        pattern: regexPattern,
      });
    }
  }, [algorithms, configure, regexInput, regexPattern, onToggleRegex]);

  const handleSwitchToPattern = useCallback(() => {
    onToggleRegex(false);
    const firstPatternAlgo = patternAlgorithms[0];
    if (firstPatternAlgo) {
      const gen = STRING_GENERATORS[firstPatternAlgo.id];
      if (gen) {
        configure(firstPatternAlgo, gen, {
          text: textValue,
          pattern: patternValue,
        });
      }
    }
  }, [onToggleRegex, patternAlgorithms, configure, textValue, patternValue]);

  const handlePresetClick = useCallback(
    (pat: string, inp: string) => {
      setRegexPattern(pat);
      setRegexInput(inp);
      const regexMeta = algorithms.find((a) => a.id === "regex-nfa");
      if (regexMeta) {
        configure(regexMeta, REGEX_NFA_GENERATOR, {
          text: inp,
          pattern: pat,
        });
      }
    },
    [algorithms, configure],
  );

  const syncFromInput = useCallback((input: unknown) => {
    if (!isStringInput(input)) return;
    setTextValue(input.text);
    setPatternValue(input.pattern);
  }, []);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2">
        <button
          onClick={handleSwitchToPattern}
          className={cn(
            "rounded-md px-3 py-1.5 font-mono text-xs transition-colors",
            !isRegexMode
              ? "border border-accent-green/30 bg-bg-elevated text-accent-green"
              : "border border-transparent text-text-secondary hover:text-text-primary",
          )}
        >
          Pattern Matching
        </button>
        <button
          onClick={handleSwitchToRegex}
          className={cn(
            "rounded-md px-3 py-1.5 font-mono text-xs transition-colors",
            isRegexMode
              ? "border border-violet-400/30 bg-bg-elevated text-violet-400"
              : "border border-transparent text-text-secondary hover:text-text-primary",
          )}
        >
          Regex NFA
        </button>
      </div>

      {!isRegexMode ? (
        <PatternMatchingControls
          algorithms={patternAlgorithms}
          algorithmMeta={algorithmMeta ?? null}
          textValue={textValue}
          patternValue={patternValue}
          onTextChange={handleTextChange}
          onPatternChange={handlePatternChange}
          onSyncFromInput={syncFromInput}
        />
      ) : (
        <RegexControls
          algorithms={algorithms}
          regexPattern={regexPattern}
          regexInput={regexInput}
          onRegexPatternChange={(e) => setRegexPattern(e.target.value)}
          onRegexInputChange={(e) => setRegexInput(e.target.value)}
          onRunRegex={handleRunRegex}
          onPresetClick={handlePresetClick}
        />
      )}
    </div>
  );
}
