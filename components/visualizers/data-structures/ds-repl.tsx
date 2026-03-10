"use client";

import { ScrollArea } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useDSRepl } from "@/hooks";
import type { ReplLine } from "@/hooks/use-ds-repl";

interface DSReplProps {
  className?: string;
}

export function DSRepl({ className }: DSReplProps) {
  const {
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
    handleKeyDown,
    handleClear,
    handleSuggestionClick,
  } = useDSRepl();

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/50 px-3 py-1.5">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-accent-green" />
          <span className="font-mono text-[10px] text-text-muted">
            DS REPL {algorithmMeta ? `— ${algorithmMeta.name}` : ""}
          </span>
        </div>
        <button
          onClick={handleClear}
          className="font-mono text-[10px] text-text-muted transition-colors hover:text-text-primary"
        >
          clear
        </button>
      </div>

      {/* Output area */}
      <ScrollArea className="max-h-[300px] min-h-[120px] flex-1">
        <div ref={scrollRef} className="space-y-0.5 p-2">
          {lines.length === 0 && (
            <div className="py-2 font-mono text-[11px] text-zinc-600">
              {algorithmMeta
                ? `Type a command: ${commands.slice(0, 3).join(", ")}...`
                : "Select a data structure to begin"}
            </div>
          )}
          {lines.map((line: ReplLine) => (
            <div
              key={line.id}
              className={cn(
                "font-mono text-[11px] leading-relaxed",
                line.type === "input" && "text-accent-cyan",
                line.type === "output" && "text-zinc-400",
                line.type === "error" && "text-red-400",
              )}
            >
              {line.text}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="relative border-t border-zinc-800">
        {/* Autocomplete suggestions */}
        {showSuggestions && suggestions.length > 0 && input.trim() && (
          <div className="absolute right-0 bottom-full left-0 z-10 max-h-[120px] overflow-auto rounded-t-md border border-zinc-800 bg-zinc-900">
            {suggestions.map((cmd: string) => (
              <button
                key={cmd}
                className="w-full px-3 py-1 text-left font-mono text-[11px] text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
                onClick={() => handleSuggestionClick(cmd)}
              >
                {cmd}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 px-3 py-2">
          <span className="font-mono text-[11px] text-accent-green select-none">
            $
          </span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setShowSuggestions(true);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder={
              algorithmMeta
                ? "Type a command..."
                : "Select a data structure first"
            }
            disabled={!algorithmMeta}
            className="flex-1 bg-transparent font-mono text-[11px] text-zinc-200 caret-accent-green outline-none placeholder:text-zinc-600"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}
