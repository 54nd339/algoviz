import type { HighlighterGeneric } from "shiki";

const CONSOLE_THEME = {
  name: "algoviz-console",
  type: "dark" as const,
  settings: [],
  colors: {
    "editor.background": "#09090b",
    "editor.foreground": "#a1a1aa",
  },
  tokenColors: [
    { scope: ["keyword", "storage.type"], settings: { foreground: "#22c55e" } },
    { scope: ["string", "string.quoted"], settings: { foreground: "#f59e0b" } },
    { scope: ["constant.numeric"], settings: { foreground: "#06b6d4" } },
    {
      scope: ["comment"],
      settings: { foreground: "#52525b", fontStyle: "italic" },
    },
    { scope: ["entity.name.function"], settings: { foreground: "#06b6d4" } },
    {
      scope: ["entity.name.type", "support.type"],
      settings: { foreground: "#22c55e" },
    },
    {
      scope: ["variable", "variable.other"],
      settings: { foreground: "#e4e4e7" },
    },
    { scope: ["punctuation"], settings: { foreground: "#71717a" } },
    { scope: ["operator"], settings: { foreground: "#f59e0b" } },
  ],
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let highlighterPromise: Promise<HighlighterGeneric<any, any>> | null = null;

export async function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = import("shiki").then(({ createHighlighter }) =>
      createHighlighter({
        themes: [CONSOLE_THEME],
        langs: ["typescript"],
      }),
    );
  }
  return highlighterPromise;
}

export async function highlightCode(
  code: string,
  activeLine?: number,
): Promise<string> {
  const highlighter = await getHighlighter();
  const html = highlighter.codeToHtml(code, {
    lang: "typescript",
    theme: "algoviz-console",
    transformers: [
      {
        line(node, line) {
          if (activeLine !== undefined && line === activeLine) {
            this.addClassToHast(node, "active-line");
          }
        },
      },
    ],
  });
  return html;
}
