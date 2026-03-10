"use client";

import { useCallback, useEffect, useRef } from "react";

import { useSoundEnabled } from "@/stores";

const MIN_FREQ = 200;
const MAX_FREQ = 2000;

export function useSound() {
  const soundEnabled = useSoundEnabled();
  const ctxRef = useRef<AudioContext | null>(null);
  const visibleRef = useRef(true);

  useEffect(() => {
    const handleVisibility = () => {
      visibleRef.current = document.visibilityState === "visible";
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  useEffect(() => {
    return () => {
      ctxRef.current?.close();
      ctxRef.current = null;
    };
  }, []);

  const getContext = useCallback(() => {
    if (!ctxRef.current || ctxRef.current.state === "closed") {
      ctxRef.current = new AudioContext();
    }
    if (ctxRef.current.state === "suspended") {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  const playTone = useCallback(
    (value: number, duration = 50) => {
      if (!soundEnabled || !visibleRef.current) return;

      const ctx = getContext();
      const freq =
        MIN_FREQ + (MAX_FREQ - MIN_FREQ) * Math.max(0, Math.min(1, value));

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + duration / 1000,
      );

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration / 1000);
    },
    [soundEnabled, getContext],
  );

  return { playTone };
}
