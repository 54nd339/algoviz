"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Kbd,
  ScrollArea,
} from "@/components/ui";
import {
  useKeyboardCheatsheetOpen,
  useToggleKeyboardCheatsheet,
} from "@/stores";

interface Shortcut {
  keys: string[];
  description: string;
}

interface ShortcutGroup {
  title: string;
  shortcuts: Shortcut[];
}

const SHORTCUT_GROUPS = [
  {
    title: "Global",
    shortcuts: [
      { keys: ["Cmd", "K"], description: "Command palette" },
      { keys: ["F"], description: "Toggle fullscreen / immersive mode" },
      { keys: ["?"], description: "Keyboard cheatsheet (this modal)" },
      { keys: ["S"], description: "Toggle sound" },
      { keys: ["V"], description: "Toggle vim mode" },
    ],
  },
  {
    title: "Playback",
    shortcuts: [
      { keys: ["Space"], description: "Play / pause" },
      { keys: ["\u2192"], description: "Step forward" },
      { keys: ["\u2190"], description: "Step backward" },
      { keys: ["["], description: "Decrease speed" },
      { keys: ["]"], description: "Increase speed" },
    ],
  },
  {
    title: "Vim Mode",
    shortcuts: [
      { keys: ["j"], description: "Step forward" },
      { keys: ["k"], description: "Step backward" },
      { keys: ["h"], description: "Decrease speed" },
      { keys: ["l"], description: "Increase speed" },
      { keys: ["g", "g"], description: "Jump to first step" },
      { keys: ["G"], description: "Jump to last step" },
      { keys: ["/"], description: "Open command palette" },
    ],
  },
  {
    title: "Pathfinding Editor",
    shortcuts: [
      { keys: ["1"], description: "Select mode" },
      { keys: ["2"], description: "Draw walls" },
      { keys: ["3"], description: "Erase walls" },
      { keys: ["4"], description: "Set start" },
      { keys: ["5"], description: "Set end" },
      { keys: ["6"], description: "Set weight" },
    ],
  },
] as const satisfies readonly ShortcutGroup[];

export function KeyboardCheatsheet() {
  const open = useKeyboardCheatsheetOpen();
  const toggle = useToggleKeyboardCheatsheet();

  return (
    <Dialog open={open} onOpenChange={toggle}>
      <DialogContent className="max-w-md" aria-describedby="kb-cheatsheet-desc">
        <DialogHeader>
          <DialogTitle className="font-mono text-sm tracking-wider">
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription id="kb-cheatsheet-desc">
            All available keyboard shortcuts grouped by category.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-5 pr-4">
            {SHORTCUT_GROUPS.map((group) => (
              <div key={group.title}>
                <h3 className="mb-2 font-mono text-[10px] tracking-widest text-accent-green uppercase">
                  {group.title}
                </h3>
                <div className="space-y-1">
                  {group.shortcuts.map((shortcut) => (
                    <div
                      key={shortcut.description}
                      className="flex items-center justify-between gap-4 py-1"
                    >
                      <span className="text-xs text-text-secondary">
                        {shortcut.description}
                      </span>
                      <div className="flex shrink-0 items-center gap-0.5">
                        {shortcut.keys.map((key, i) => (
                          <span key={i} className="flex items-center gap-0.5">
                            {i > 0 && (
                              <span className="mx-0.5 text-[10px] text-text-muted">
                                +
                              </span>
                            )}
                            <Kbd>{key}</Kbd>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="border-t border-border pt-2">
          <p className="text-center font-mono text-[10px] text-text-muted">
            Press <Kbd>Esc</Kbd> to dismiss
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
