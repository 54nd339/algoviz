import { create } from "zustand";

interface LayoutState {
  sidebarOpen: boolean;
  commandPaletteOpen: boolean;
  keyboardCheatsheetOpen: boolean;

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  toggleKeyboardCheatsheet: () => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
  sidebarOpen: true,
  commandPaletteOpen: false,
  keyboardCheatsheetOpen: false,

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleCommandPalette: () =>
    set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen })),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  toggleKeyboardCheatsheet: () =>
    set((s) => ({ keyboardCheatsheetOpen: !s.keyboardCheatsheetOpen })),
}));

export const useSidebarOpen = () => useLayoutStore((s) => s.sidebarOpen);
export const useCommandPaletteOpen = () =>
  useLayoutStore((s) => s.commandPaletteOpen);
export const useKeyboardCheatsheetOpen = () =>
  useLayoutStore((s) => s.keyboardCheatsheetOpen);

export const useToggleSidebar = () => useLayoutStore((s) => s.toggleSidebar);
export const useSetSidebarOpen = () =>
  useLayoutStore((s) => s.setSidebarOpen);
export const useToggleCommandPalette = () =>
  useLayoutStore((s) => s.toggleCommandPalette);
export const useSetCommandPaletteOpen = () =>
  useLayoutStore((s) => s.setCommandPaletteOpen);
export const useToggleKeyboardCheatsheet = () =>
  useLayoutStore((s) => s.toggleKeyboardCheatsheet);
