"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { DSOperation } from "@/lib/algorithms/data-structures";
import {
  DS_COMMANDS,
  DS_GENERATORS,
} from "@/lib/algorithms/data-structures";
import { parseCommand } from "@/lib/algorithms/data-structures/parse-command";
import { useVisualizer } from "@/hooks/use-visualizer";

export interface ReplLine {
  id: number;
  type: "input" | "output" | "error";
  text: string;
}

export function useDSRepl() {
  const { algorithmMeta, configure, jumpTo } = useVisualizer();
  const [lines, setLines] = useState<ReplLine[]>([]);
  const [input, setInput] = useState("");
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const operationsRef = useRef<DSOperation[]>([]);
  const lineIdRef = useRef(0);
  const inputHistoryRef = useRef<string[]>([]);

  const algoId = algorithmMeta?.id;
  const commands = useMemo(
    () => (algoId ? (DS_COMMANDS[algoId] ?? []) : []),
    [algoId],
  );

  const addLine = useCallback((type: ReplLine["type"], text: string) => {
    setLines((prev) => [...prev, { id: lineIdRef.current++, type, text }]);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  const suggestions = useMemo(() => {
    if (!input.trim()) return commands;
    return commands.filter((cmd) =>
      cmd.toLowerCase().startsWith(input.toLowerCase()),
    );
  }, [input, commands]);

  const handleSubmit = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || !algorithmMeta) return;

    addLine("input", `> ${trimmed}`);
    inputHistoryRef.current.push(trimmed);
    setHistoryIdx(-1);

    const parsed = parseCommand(trimmed);
    if (!parsed) {
      addLine("error", "Parse error: invalid command format");
      setInput("");
      return;
    }

    operationsRef.current = [...operationsRef.current, parsed];

    const gen = DS_GENERATORS[algorithmMeta.id];
    if (!gen) {
      addLine("error", `No generator for ${algorithmMeta.id}`);
      setInput("");
      return;
    }

    let genInput: unknown = operationsRef.current;

    if (algorithmMeta.id === "linked-list") {
      genInput = { ops: operationsRef.current, doubly: false };
    } else if (algorithmMeta.id === "heap") {
      genInput = { ops: operationsRef.current, isMin: true };
    } else if (algorithmMeta.id === "hash-table") {
      genInput = { ops: operationsRef.current, mode: "chaining" as const };
    }

    configure(algorithmMeta, gen, genInput);

    setTimeout(() => {
      jumpTo(9999);
      addLine(
        "output",
        `✓ ${parsed.op}(${parsed.args.map((a) => JSON.stringify(a)).join(", ")})`,
      );
    }, 50);

    setInput("");
    setShowSuggestions(false);
  }, [input, algorithmMeta, addLine, configure, jumpTo]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const history = inputHistoryRef.current;
        if (history.length === 0) return;
        const newIdx =
          historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1);
        setHistoryIdx(newIdx);
        setInput(history[newIdx]);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        const history = inputHistoryRef.current;
        if (historyIdx === -1) return;
        const newIdx = historyIdx + 1;
        if (newIdx >= history.length) {
          setHistoryIdx(-1);
          setInput("");
        } else {
          setHistoryIdx(newIdx);
          setInput(history[newIdx]);
        }
      } else if (e.key === "Tab") {
        e.preventDefault();
        if (suggestions.length === 1) {
          const cmd = suggestions[0];
          const parenIdx = cmd.indexOf("(");
          setInput(parenIdx !== -1 ? cmd.slice(0, parenIdx + 1) : cmd);
        }
        setShowSuggestions(false);
      } else if (e.key === "Escape") {
        setShowSuggestions(false);
      }
    },
    [handleSubmit, historyIdx, suggestions],
  );

  const handleClear = useCallback(() => {
    setLines([]);
    operationsRef.current = [];
  }, []);

  const handleSuggestionClick = useCallback((cmd: string) => {
    const parenIdx = cmd.indexOf("(");
    setInput(parenIdx !== -1 ? cmd.slice(0, parenIdx + 1) : cmd);
    setShowSuggestions(false);
    inputRef.current?.focus();
  }, []);

  return {
    algorithmMeta,
    commands,
    lines,
    input,
    suggestions,
    showSuggestions,
    inputRef,
    scrollRef,
    setInput,
    setShowSuggestions,
    handleSubmit,
    handleKeyDown,
    handleClear,
    handleSuggestionClick,
  };
}
