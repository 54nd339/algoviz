"use client";

import { VisualizerPageLayout } from "@/components/layout/visualizer-page-layout";
import { CipherWheel } from "@/components/visualizers/crypto/cipher-wheel";
import { CryptoControls } from "@/components/visualizers/crypto/controls";
import { HashCompare } from "@/components/visualizers/crypto/hash-compare";
import { KeyExchange } from "@/components/visualizers/crypto/key-exchange";
import type {
  CipherStep,
  DiffieHellmanStep,
  HashStep,
} from "@/lib/algorithms/crypto";
import { CRYPTO_GENERATORS } from "@/lib/algorithms/crypto";
import { useAlgoFromUrl, useVisualizer } from "@/hooks";
import type { AlgorithmStep } from "@/types";

import "@/lib/algorithms/crypto";

export default function CryptoClient() {
  const { currentStep, algorithmMeta } = useVisualizer();
  useAlgoFromUrl(
    "crypto",
    CRYPTO_GENERATORS as Record<
      string,
      (input: unknown) => Generator<import("@/types").AlgorithmStep, void, undefined>
    >,
  );

  const algoId = algorithmMeta?.id;
  const isDH = algoId === "diffie-hellman";
  const isCipher = algoId === "caesar" || algoId === "vigenere";
  const isHash = algoId === "hash-avalanche";

  return (
    <VisualizerPageLayout
      controls={<CryptoControls />}
      canvas={
        <div className="flex-1 overflow-auto">
          {isDH && (
            <KeyExchange
              step={currentStep as AlgorithmStep<DiffieHellmanStep> | null}
              className="h-full"
            />
          )}
          {isCipher && (
            <CipherWheel
              step={currentStep as AlgorithmStep<CipherStep> | null}
              className="h-full"
            />
          )}
          {isHash && (
            <HashCompare
              step={currentStep as AlgorithmStep<HashStep> | null}
              className="h-full"
            />
          )}
          {!isDH && !isCipher && !isHash && (
            <div className="flex h-full items-center justify-center rounded-lg border border-border bg-bg-primary/50 font-mono text-sm text-text-muted">
              Select a cryptography algorithm and press play
            </div>
          )}
        </div>
      }
    />
  );
}
