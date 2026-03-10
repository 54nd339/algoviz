import type { DSOperation } from "./types";

export function parseCommand(input: string): DSOperation | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Match: opName(arg1, arg2, ...)
  const match = trimmed.match(/^(\w[\w-]*)(?:\(([^)]*)\))?$/);
  if (!match) return null;

  const op = match[1];
  const argsStr = match[2]?.trim();

  if (!argsStr) return { op, args: [] };

  // Handle object arg for build-freq: {a: 45, b: 13}
  if (argsStr.startsWith("{")) {
    try {
      const jsonStr = argsStr.replace(/(\w+)\s*:/g, '"$1":');
      const obj = JSON.parse(jsonStr);
      return { op, args: [obj] };
    } catch {
      return null;
    }
  }

  const args = argsStr.split(",").map((a) => {
    const t = a.trim();
    // Try number
    const num = Number(t);
    if (!isNaN(num) && t !== "") return num;
    // Strip quotes for strings
    if (
      (t.startsWith('"') && t.endsWith('"')) ||
      (t.startsWith("'") && t.endsWith("'"))
    ) {
      return t.slice(1, -1);
    }
    return t;
  });

  return { op, args };
}
