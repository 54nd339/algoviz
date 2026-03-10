/**
 * Reads a CSS custom property from the document root.
 * Returns the fallback if called during SSR or if the property isn't set.
 */
function cssVar(name: string, fallback: string): string {
  if (typeof document === "undefined") return fallback;
  return (
    getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim() || fallback
  );
}

export function getThemeColors() {
  return {
    bgPrimary: cssVar("--bg-primary", "#09090b"),
    bgSurface: cssVar("--bg-surface", "#18181b"),
    bgElevated: cssVar("--bg-elevated", "#27272a"),
    border: cssVar("--border", "#27272a"),
    borderSubtle: cssVar("--border-subtle", "#1e1e21"),

    textPrimary: cssVar("--text-primary", "#fafafa"),
    textSecondary: cssVar("--text-secondary", "#a1a1aa"),
    textMuted: cssVar("--text-muted", "#71717a"),

    accentGreen: cssVar("--accent-green", "#22c55e"),
    accentCyan: cssVar("--accent-cyan", "#06b6d4"),
    accentAmber: cssVar("--accent-amber", "#f59e0b"),
    accentRed: cssVar("--accent-red", "#ef4444"),
  } as const;
}

// Derived / extended palette not covered by CSS variables
export const PALETTE = {
  accentGreenLight: "#4ade80",
  accentCyanLight: "#22d3ee",
  accentAmberLight: "#fbbf24",
  accentRedLight: "#f87171",
  accentRose: "#f43f5e",
  accentPurple: "#a78bfa",
  accentPurpleLight: "#c084fc",
  accentPink: "#ec4899",
  accentTeal: "#14b8a6",
  accentOrange: "#f97316",
  accentViolet: "#8b5cf6",
  accentA855: "#a855f7",

  strokeDefault: "#3f3f46",
  strokeMuted: "#52525b",

  redLight: "#fca5a5",
  greenLight: "#86efac",

  gridLineLight: "rgba(255,255,255,0.05)",
  gridLineMuted: "rgba(113,113,122,0.15)",
  accentRoseAlpha: "rgba(244,63,94,0.06)",
  accentGreenSolid: "#22c55e",
  accentRedAlpha: "rgba(248,113,113,0.4)",
  accentGreenHsl: "hsl(142, 70%, 55%)",

  white: "#ffffff",
} as const;

export const MONO_FONT_FAMILY = "var(--font-geist-mono), ui-monospace, monospace";
