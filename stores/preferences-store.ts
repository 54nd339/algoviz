import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "default" | "matrix" | "crt" | "cyberpunk" | "paper";

interface PreferencesState {
  theme: Theme;
  vimMode: boolean;
  soundEnabled: boolean;
  immersiveMode: boolean;

  setTheme: (theme: Theme) => void;
  toggleVimMode: () => void;
  toggleSound: () => void;
  toggleImmersiveMode: () => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      theme: "default",
      vimMode: false,
      soundEnabled: false,
      immersiveMode: false,

      setTheme: (theme) => set({ theme }),
      toggleVimMode: () => set((s) => ({ vimMode: !s.vimMode })),
      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
      toggleImmersiveMode: () =>
        set((s) => ({ immersiveMode: !s.immersiveMode })),
    }),
    { name: "algoviz-preferences" },
  ),
);

export const useTheme = () => usePreferencesStore((s) => s.theme);
export const useVimMode = () => usePreferencesStore((s) => s.vimMode);
export const useSoundEnabled = () =>
  usePreferencesStore((s) => s.soundEnabled);
export const useImmersiveMode = () =>
  usePreferencesStore((s) => s.immersiveMode);

export const useSetTheme = () => usePreferencesStore((s) => s.setTheme);
export const useToggleVimMode = () =>
  usePreferencesStore((s) => s.toggleVimMode);
export const useToggleSound = () =>
  usePreferencesStore((s) => s.toggleSound);
export const useToggleImmersiveMode = () =>
  usePreferencesStore((s) => s.toggleImmersiveMode);
