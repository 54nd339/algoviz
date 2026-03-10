"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Lock, Unlock } from "lucide-react";

import { EmptyCanvasState } from "@/components/visualizers/shared/empty-canvas-state";
import type { DiffieHellmanStep } from "@/lib/algorithms/crypto";
import { cn } from "@/lib/utils";
import type { AlgorithmStep } from "@/types";

interface KeyExchangeProps {
  step: AlgorithmStep<DiffieHellmanStep> | null;
  className?: string;
}

export function KeyExchange({ step, className }: KeyExchangeProps) {
  const reducedMotion = useReducedMotion();

  if (!step?.data) {
    return (
      <EmptyCanvasState
        message="Select Diffie-Hellman and press play"
        className={className}
      />
    );
  }

  const { phase, p, g, alice, bob, message, formula } = step.data;

  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-lg border border-border bg-bg-primary/50 p-6",
        className,
      )}
      data-tour="canvas"
    >
      {/* Public Parameters */}
      <div className="text-center">
        <span className="font-mono text-xs text-text-muted">
          Public Parameters
        </span>
        <div className="mt-1 flex justify-center gap-4">
          <span className="rounded border border-border bg-zinc-800 px-3 py-1 font-mono text-sm">
            p = {p}
          </span>
          <span className="rounded border border-border bg-zinc-800 px-3 py-1 font-mono text-sm">
            g = {g}
          </span>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-[1fr,auto,1fr] items-start gap-4">
        {/* Alice */}
        <div className="space-y-3 rounded-lg border-2 border-cyan-500/50 bg-cyan-500/5 p-4">
          <div className="text-center font-mono text-sm font-bold text-cyan-400">
            Alice
          </div>

          {alice.private !== undefined && (
            <motion.div
              className="flex items-center justify-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: reducedMotion ? 0 : 0.3 }}
            >
              <Lock size={12} className="text-cyan-500" />
              <span className="font-mono text-xs text-text-muted">
                private:
              </span>
              <span className="font-mono text-sm text-cyan-400">
                a = {alice.private}
              </span>
            </motion.div>
          )}

          {alice.public !== undefined && (
            <motion.div
              className="flex items-center justify-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: reducedMotion ? 0 : 0.3 }}
            >
              <Unlock size={12} className="text-cyan-400" />
              <span className="font-mono text-xs text-text-muted">public:</span>
              <span className="font-mono text-sm font-bold text-cyan-300">
                A = {alice.public}
              </span>
            </motion.div>
          )}

          {alice.shared !== undefined && (
            <motion.div
              className="flex items-center justify-center gap-2 rounded border border-green-500/30 bg-green-500/10 p-2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: reducedMotion ? 0 : 0.3 }}
            >
              <span className="font-mono text-xs text-text-muted">secret:</span>
              <span className="font-mono text-sm font-bold text-green-400">
                s = {alice.shared}
              </span>
            </motion.div>
          )}
        </div>

        {/* Channel */}
        <div className="flex min-h-[120px] flex-col items-center justify-center gap-2">
          <span className="font-mono text-[10px] text-text-muted">
            Public Channel
          </span>
          <div className="h-8 w-px bg-border" />

          <AnimatePresence>
            {phase === "exchange" && alice.public !== undefined && (
              <motion.div
                className="rounded bg-cyan-500/20 px-2 py-1 font-mono text-xs text-cyan-400"
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 30, opacity: 1 }}
                transition={{ duration: reducedMotion ? 0 : 0.5 }}
              >
                A={alice.public} →
              </motion.div>
            )}
            {phase === "exchange" && bob.public !== undefined && (
              <motion.div
                className="rounded bg-amber-500/20 px-2 py-1 font-mono text-xs text-amber-400"
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: -30, opacity: 1 }}
                transition={{ duration: reducedMotion ? 0 : 0.5 }}
              >
                ← B={bob.public}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="h-8 w-px bg-border" />
        </div>

        {/* Bob */}
        <div className="space-y-3 rounded-lg border-2 border-amber-500/50 bg-amber-500/5 p-4">
          <div className="text-center font-mono text-sm font-bold text-amber-400">
            Bob
          </div>

          {bob.private !== undefined && (
            <motion.div
              className="flex items-center justify-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: reducedMotion ? 0 : 0.3 }}
            >
              <Lock size={12} className="text-amber-500" />
              <span className="font-mono text-xs text-text-muted">
                private:
              </span>
              <span className="font-mono text-sm text-amber-400">
                b = {bob.private}
              </span>
            </motion.div>
          )}

          {bob.public !== undefined && (
            <motion.div
              className="flex items-center justify-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: reducedMotion ? 0 : 0.3 }}
            >
              <Unlock size={12} className="text-amber-400" />
              <span className="font-mono text-xs text-text-muted">public:</span>
              <span className="font-mono text-sm font-bold text-amber-300">
                B = {bob.public}
              </span>
            </motion.div>
          )}

          {bob.shared !== undefined && (
            <motion.div
              className="flex items-center justify-center gap-2 rounded border border-green-500/30 bg-green-500/10 p-2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: reducedMotion ? 0 : 0.3 }}
            >
              <span className="font-mono text-xs text-text-muted">secret:</span>
              <span className="font-mono text-sm font-bold text-green-400">
                s = {bob.shared}
              </span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Match indicator */}
      {phase === "done" &&
        alice.shared !== undefined &&
        bob.shared !== undefined && (
          <motion.div
            className={cn(
              "rounded-lg py-3 text-center font-mono text-sm font-bold",
              alice.shared === bob.shared
                ? "border border-green-500/30 bg-green-500/20 text-green-400"
                : "border border-red-500/30 bg-red-500/20 text-red-400",
            )}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.3 }}
            style={
              alice.shared === bob.shared
                ? { boxShadow: "0 0 20px hsl(142, 70%, 55%, 0.2)" }
                : undefined
            }
          >
            {alice.shared === bob.shared
              ? "MATCH! Shared secret established"
              : "ERROR: Secrets don't match"}
          </motion.div>
        )}

      {/* Formula */}
      {formula && (
        <div className="rounded border border-border bg-zinc-900/50 p-3 font-mono text-xs whitespace-pre-line text-text-muted">
          {formula}
        </div>
      )}

      {/* Message */}
      <div className="text-center font-mono text-xs text-text-secondary">
        {message}
      </div>
    </div>
  );
}
