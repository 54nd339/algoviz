"use client";

import { useCallback, useEffect, useRef } from "react";

const CHARS = [
  "O(1)",
  "O(n)",
  "O(log n)",
  "O(n²)",
  "O(n!)",
  "BFS",
  "DFS",
  "AVL",
  "BST",
  "DP",
  "MST",
  "KMP",
  "A*",
  "NP",
  "0",
  "1",
  "∞",
  "Θ",
  "Ω",
  "λ",
  "∅",
  "→",
  "⊕",
  "∧",
  "∨",
];

interface Drop {
  x: number;
  y: number;
  speed: number;
  char: string;
  opacity: number;
}

export function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dropsRef = useRef<Drop[]>([]);
  const animFrameRef = useRef<number>(0);
  const prefersReducedMotion = useRef(false);

  const initDrops = useCallback((width: number) => {
    const columnCount = Math.floor(width / 28);
    const drops: Drop[] = [];
    for (let i = 0; i < columnCount; i++) {
      drops.push({
        x: i * 28 + 14,
        y: Math.random() * -500,
        speed: 0.3 + Math.random() * 0.7,
        char: CHARS[Math.floor(Math.random() * CHARS.length)],
        opacity: 0.1 + Math.random() * 0.3,
      });
    }
    return drops;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedMotion.current = mq.matches;

    if (prefersReducedMotion.current) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      dropsRef.current = initDrops(canvas.offsetWidth);
    };

    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;

      ctx.clearRect(0, 0, w, h);

      for (const drop of dropsRef.current) {
        ctx.font = "11px var(--font-geist-mono), monospace";
        ctx.fillStyle = `rgba(34, 197, 94, ${drop.opacity})`;
        ctx.fillText(drop.char, drop.x, drop.y);

        drop.y += drop.speed;

        if (drop.y > h + 20) {
          drop.y = Math.random() * -100;
          drop.char = CHARS[Math.floor(Math.random() * CHARS.length)];
          drop.opacity = 0.1 + Math.random() * 0.3;
        }
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    animFrameRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [initDrops]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
