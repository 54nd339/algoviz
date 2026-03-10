"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useShallow } from "zustand/react/shallow";

import {
  CommandPalette,
  Header,
  KeyboardCheatsheet,
  MobileSheet,
  Sidebar,
  StatusBar,
} from "@/components/layout";
import { cn } from "@/lib/utils";
import {
  useLayoutStore,
  usePreferencesStore,
  useVisualizerStore,
} from "@/stores";
import { useKeyboard } from "@/hooks";

export default function VisualizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarOpen } = useLayoutStore(
    useShallow((s) => ({ sidebarOpen: s.sidebarOpen })),
  );
  const { theme } = usePreferencesStore(
    useShallow((s) => ({ theme: s.theme })),
  );
  const pathname = usePathname();
  const { send } = useVisualizerStore(
    useShallow((s) => ({ send: s.send })),
  );
  const prevPathRef = useRef(pathname);
  useKeyboard();

  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      send({ type: "CLEAR" });
      prevPathRef.current = pathname;
    }
  }, [pathname, send]);

  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove(
      "theme-matrix",
      "theme-crt",
      "theme-cyberpunk",
      "theme-paper",
    );
    if (theme !== "default") {
      html.classList.add(`theme-${theme}`);
    }
  }, [theme]);

  return (
    <>
      <Sidebar />
      <MobileSheet />
      <Header />
      <CommandPalette />
      <KeyboardCheatsheet />
      <main
        className={cn(
          "min-h-screen pt-12 pb-7 transition-all duration-200",
          "pl-0 sm:pl-14",
          sidebarOpen && "sm:pl-56",
        )}
      >
        {children}
      </main>
      <StatusBar />
    </>
  );
}
