"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { useTheme as useNextTheme } from "next-themes";
import { Command, Moon, Sun, Terminal } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import {
  Button,
  Kbd,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import {
  useLayoutStore,
  usePreferencesStore,
} from "@/stores";

const THEMES = [
  { value: "default", label: "Default" },
  { value: "matrix", label: "Matrix" },
  { value: "crt", label: "Amber CRT" },
  { value: "cyberpunk", label: "Cyberpunk" },
  { value: "paper", label: "Paper" },
] as const;

export function Header() {
  const { sidebarOpen, toggleCommandPalette } = useLayoutStore(
    useShallow((s) => ({
      sidebarOpen: s.sidebarOpen,
      toggleCommandPalette: s.toggleCommandPalette,
    })),
  );
  const { immersiveMode, theme, setTheme } = usePreferencesStore(
    useShallow((s) => ({
      immersiveMode: s.immersiveMode,
      theme: s.theme,
      setTheme: s.setTheme,
    })),
  );
  const { resolvedTheme, setTheme: setNextTheme } = useNextTheme();
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const showThemeIcon = mounted && resolvedTheme != null;

  if (immersiveMode) return null;

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-30 flex h-12 items-center justify-between border-b border-border bg-bg-surface/80 px-4 backdrop-blur-sm transition-all duration-200",
        "left-0 sm:left-14",
        sidebarOpen && "sm:left-56",
      )}
    >
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 font-mono text-sm font-bold tracking-wider text-text-primary"
        >
          <Terminal size={16} className="text-accent-green" />
          <span className={cn("hidden sm:inline", sidebarOpen && "sm:hidden")}>
            ALGOVIZ
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleCommandPalette}
          className="gap-2 text-text-muted"
        >
          <Command size={14} />
          <span className="hidden text-xs sm:inline">Search</span>
          <Kbd>&#8984;K</Kbd>
        </Button>

        <Select
          value={theme}
          onValueChange={(v) => setTheme(v as typeof theme)}
        >
          <SelectTrigger className="h-8 w-28 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {THEMES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            setNextTheme(resolvedTheme === "dark" ? "light" : "dark")
          }
          aria-label="Toggle light/dark mode"
          className="h-8 w-8"
        >
          {!showThemeIcon ? (
            <span className="h-4 w-4" aria-hidden />
          ) : resolvedTheme === "dark" ? (
            <Sun size={16} />
          ) : (
            <Moon size={16} />
          )}
        </Button>
      </div>
    </header>
  );
}
