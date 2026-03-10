"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { useVisualizer } from "@/hooks";
import type { AlgorithmMeta, AlgorithmStep } from "@/types";

interface AlgorithmPickerProps {
  algorithms: AlgorithmMeta[];
  generators: Record<
    string,
    (input: unknown) => Generator<AlgorithmStep, void, undefined>
  >;
  defaultInput?: unknown;
  /** Called after configure with the input that was applied (e.g. to sync controls). */
  onConfigure?: (input: unknown) => void;
  className?: string;
}

export function AlgorithmPicker({
  algorithms,
  generators,
  defaultInput,
  onConfigure,
  className,
}: AlgorithmPickerProps) {
  const { configure, algorithmMeta } = useVisualizer();

  function handleChange(id: string) {
    const meta = algorithms.find((a) => a.id === id);
    const gen = generators[id];
    if (!meta || !gen) return;

    const input = meta.presets?.[0]?.generator() ?? defaultInput;
    configure(meta, gen, input);
    onConfigure?.(input);
  }

  return (
    <Select value={algorithmMeta?.id ?? ""} onValueChange={handleChange}>
      <SelectTrigger data-tour="picker" className={className}>
        <SelectValue placeholder="Select algorithm" />
      </SelectTrigger>
      <SelectContent>
        {algorithms.map((algo) => (
          <SelectItem key={algo.id} value={algo.id}>
            {algo.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
