"use client";

import { useEffect, useRef, useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import { useVisualizer } from "@/hooks";
import type { AlgorithmMeta, AlgorithmStep, PresetContext } from "@/types";

interface InputPresetsProps {
  meta: AlgorithmMeta;
  generatorFn: (input: unknown) => Generator<AlgorithmStep, void, undefined>;
  presetContext?: PresetContext;
  /** Called with the input applied when a preset is selected (e.g. to sync controls). */
  onPresetApplied?: (input: unknown) => void;
  className?: string;
}

/** Replace first (number) in preset name with (n) so label reflects current array size. */
function presetLabel(
  name: string,
  expectedCase: string,
  n: number | undefined,
): string {
  const size = n != null ? String(n) : null;
  const base = size != null ? name.replace(/\s*\(\d+\)/, ` (${size})`) : name;
  return `${base} (${expectedCase})`;
}

export function InputPresets({
  meta,
  generatorFn,
  presetContext,
  onPresetApplied,
  className,
}: InputPresetsProps) {
  const { configure } = useVisualizer();
  const presetContextRef = useRef(presetContext);
  useEffect(() => { presetContextRef.current = presetContext; }, [presetContext]);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [prevMetaId, setPrevMetaId] = useState(meta.id);

  if (prevMetaId !== meta.id) {
    setPrevMetaId(meta.id);
    setSelectedName(null);
  }

  const presets = meta.presets ?? [];
  if (presets.length === 0) return null;

  const arraySize = presetContext?.arraySize;

  function handleChange(name: string) {
    setSelectedName(name);
    const preset = presets.find((p) => p.name === name);
    if (!preset) return;
    const ctx = presetContextRef.current;
    const input = preset.generator(ctx);
    configure(meta, generatorFn, input);
    onPresetApplied?.(input);
  }

  const displayValue = selectedName
    ? presetLabel(
        presets.find((p) => p.name === selectedName)?.name ?? selectedName,
        presets.find((p) => p.name === selectedName)?.expectedCase ?? "average",
        arraySize,
      )
    : "Input preset";

  return (
    <Select value={selectedName ?? undefined} onValueChange={handleChange}>
      <SelectTrigger className={cn("min-w-0 overflow-hidden", className)}>
        <SelectValue placeholder="Input preset" className="min-w-0 truncate">
          <span className="block min-w-0 truncate">{displayValue}</span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {presets.map((p) => (
          <SelectItem key={p.name} value={p.name}>
            {presetLabel(p.name, p.expectedCase, arraySize)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
