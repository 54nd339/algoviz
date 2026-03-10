"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { MatrixRain } from "@/components/layout";
import { useTheme } from "@/stores";
import { useKeyboard } from "@/hooks";

const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

export function LandingClient() {
  const theme = useTheme();
  const [burstActive, setBurstActive] = useState(false);
  const konamiIdx = useRef(0);

  useKeyboard();

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

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === KONAMI[konamiIdx.current]) {
        konamiIdx.current++;
        if (konamiIdx.current === KONAMI.length) {
          konamiIdx.current = 0;
          setBurstActive(true);
          toast("Matrix mode activated.", {
            description: "You found the Konami code!",
          });
          setTimeout(() => setBurstActive(false), 5000);
        }
      } else {
        konamiIdx.current = 0;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <MatrixRain />
      {burstActive && (
        <div className="pointer-events-none absolute inset-0 z-20 animate-pulse">
          <MatrixRain />
          <MatrixRain />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-bg-primary/30 via-transparent to-bg-primary" />
    </div>
  );
}
