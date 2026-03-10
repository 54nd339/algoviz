"use client";

import { useHotkeys } from "react-hotkeys-hook";
import { useShallow } from "zustand/react/shallow";

import {
  useLayoutStore,
  usePreferencesStore,
} from "@/stores";

export function useKeyboard() {
  const { toggleCommandPalette, toggleKeyboardCheatsheet } = useLayoutStore(
    useShallow((s) => ({
      toggleCommandPalette: s.toggleCommandPalette,
      toggleKeyboardCheatsheet: s.toggleKeyboardCheatsheet,
    })),
  );
  const { toggleImmersiveMode, vimMode } = usePreferencesStore(
    useShallow((s) => ({
      toggleImmersiveMode: s.toggleImmersiveMode,
      vimMode: s.vimMode,
    })),
  );

  useHotkeys("mod+k", (e) => {
    e.preventDefault();
    toggleCommandPalette();
  });

  useHotkeys(
    "f",
    () => {
      toggleImmersiveMode();
    },
    { preventDefault: true },
  );

  useHotkeys("shift+/", () => {
    toggleKeyboardCheatsheet();
  });

  // Vim: `/` to open command palette (search)
  useHotkeys(
    "/",
    (e) => {
      if (!vimMode) return;
      e.preventDefault();
      toggleCommandPalette();
    },
    { enabled: vimMode },
  );
}
