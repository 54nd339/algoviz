"use client";

import { useEffect, useState } from "react";

export interface UseCanvasResizeOptions {
  /** When true, also returns DPI-scaled dimensions for crisp canvas rendering. */
  dpr?: boolean;
}

export interface UseCanvasResizeResult {
  width: number;
  height: number;
  /** devicePixelRatio; only present when `dpr: true`. */
  dpr?: number;
  /** width * dpr; only present when `dpr: true`. */
  canvasWidth?: number;
  /** height * dpr; only present when `dpr: true`. */
  canvasHeight?: number;
}

/**
 * Observes a container element and returns its dimensions for canvas/SVG layout.
 * Handles ResizeObserver setup and cleanup.
 *
 * @param containerRef - Ref to the container element (e.g. a wrapping div)
 * @param options - Optional config; set `dpr: true` for devicePixelRatio-scaled canvas dimensions
 */
export function useCanvasResize(
  containerRef: React.RefObject<HTMLDivElement | null>,
  options?: UseCanvasResizeOptions,
): UseCanvasResizeResult {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = Math.floor(entry.contentRect.width);
        const height = Math.floor(entry.contentRect.height);
        if (width > 0 && height > 0) {
          setSize({ width, height });
        }
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [containerRef]);

  if (options?.dpr) {
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    return {
      ...size,
      dpr,
      canvasWidth: Math.floor(size.width * dpr),
      canvasHeight: Math.floor(size.height * dpr),
    };
  }

  return size;
}
