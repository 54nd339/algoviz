import * as Comlink from "comlink";

import type { EngineWorker } from "./engine-worker";
import type { FractalWorker } from "./fractal-worker";

/* ── Fractal worker pool ─────────────────────────────────────────── */

interface PooledWorker {
  raw: Worker;
  proxy: Comlink.Remote<FractalWorker>;
}

let fractalPool: PooledWorker[] = [];
let poolSize = 0;

function getPoolSize(): number {
  if (typeof navigator !== "undefined" && navigator.hardwareConcurrency) {
    return Math.max(2, Math.min(navigator.hardwareConcurrency, 8));
  }
  return 4;
}

function ensureFractalPool(): PooledWorker[] {
  if (typeof Worker === "undefined") return [];
  if (fractalPool.length > 0) return fractalPool;
  poolSize = getPoolSize();
  for (let i = 0; i < poolSize; i++) {
    const raw = new Worker(new URL("./fractal-worker.ts", import.meta.url), {
      type: "module",
    });
    const proxy = Comlink.wrap<FractalWorker>(raw);
    fractalPool.push({ raw, proxy });
  }
  return fractalPool;
}

export function getFractalWorker(): Comlink.Remote<FractalWorker> {
  return ensureFractalPool()[0].proxy;
}

export function getFractalPool(): Comlink.Remote<FractalWorker>[] {
  return ensureFractalPool().map((w) => w.proxy);
}

export function terminateFractalWorker(): void {
  for (const w of fractalPool) {
    w.raw.terminate();
  }
  fractalPool = [];
  poolSize = 0;
}

/* ── Engine worker (materializeSteps) ───────────────────────────── */

let engineWorkerInstance: Worker | null = null;
let engineProxy: Comlink.Remote<EngineWorker> | null = null;

export function getEngineWorker(): Comlink.Remote<EngineWorker> {
  if (engineProxy) return engineProxy;

  engineWorkerInstance = new Worker(
    new URL("./engine-worker.ts", import.meta.url),
    { type: "module" },
  );
  engineProxy = Comlink.wrap<EngineWorker>(engineWorkerInstance);
  return engineProxy;
}

export function terminateEngineWorker(): void {
  if (engineWorkerInstance) {
    engineWorkerInstance.terminate();
    engineWorkerInstance = null;
    engineProxy = null;
  }
}
