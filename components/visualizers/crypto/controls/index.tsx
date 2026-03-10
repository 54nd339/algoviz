"use client";

import { useCallback, useState } from "react";

import { CategoryControlsHeader } from "@/components/visualizers/shared";
import { CRYPTO_GENERATORS } from "@/lib/algorithms/crypto";
import { cn } from "@/lib/utils";
import { useVisualizer } from "@/hooks";
import type { AlgorithmStep } from "@/types";

import { CipherControls } from "./cipher-controls";
import { DHControls } from "./dh-controls";
import { HashControls } from "./hash-controls";

interface CryptoControlsProps {
  className?: string;
}

export function CryptoControls({ className }: CryptoControlsProps) {
  const { algorithmMeta, configure } = useVisualizer();
  const algoId = algorithmMeta?.id;

  const [dhP, setDhP] = useState(23);
  const [dhG, setDhG] = useState(5);
  const [dhA, setDhA] = useState(6);
  const [dhB, setDhB] = useState(15);
  const [caesarKey, setCaesarKey] = useState(3);
  const [caesarPlain, setCaesarPlain] = useState("HELLO WORLD");
  const [caesarMode, setCaesarMode] = useState<"encrypt" | "decrypt">(
    "encrypt",
  );
  const [vigKey, setVigKey] = useState("KEY");
  const [vigPlain, setVigPlain] = useState("HELLO WORLD");
  const [vigMode, setVigMode] = useState<"encrypt" | "decrypt">("encrypt");
  const [hashInput, setHashInput] = useState("Hello");

  const syncFromInput = useCallback((input: unknown) => {
    if (!input || typeof input !== "object") return;
    const inp = input as Record<string, unknown>;
    if ("p" in inp && "g" in inp) {
      setDhP(inp.p as number);
      setDhG(inp.g as number);
      if (typeof inp.a === "number") setDhA(inp.a);
      if (typeof inp.b === "number") setDhB(inp.b);
    }
    if ("key" in inp && "plaintext" in inp && typeof inp.key === "number") {
      setCaesarKey(inp.key as number);
      setCaesarPlain(inp.plaintext as string);
      if (inp.mode) setCaesarMode(inp.mode as "encrypt" | "decrypt");
    }
    if ("keyword" in inp && "plaintext" in inp) {
      setVigKey(inp.keyword as string);
      setVigPlain(inp.plaintext as string);
      if (inp.mode) setVigMode(inp.mode as "encrypt" | "decrypt");
    }
    if ("input" in inp && typeof inp.input === "string") {
      setHashInput(inp.input);
    }
  }, []);

  const applyDH = useCallback(() => {
    if (!algorithmMeta) return;
    const gen = CRYPTO_GENERATORS[algorithmMeta.id];
    if (!gen) return;
    configure(
      algorithmMeta,
      gen as (input: unknown) => Generator<AlgorithmStep, void, undefined>,
      { p: dhP, g: dhG, a: dhA, b: dhB },
    );
  }, [algorithmMeta, configure, dhP, dhG, dhA, dhB]);

  const applyCaesar = useCallback(() => {
    if (!algorithmMeta) return;
    const gen = CRYPTO_GENERATORS[algorithmMeta.id];
    if (!gen) return;
    configure(
      algorithmMeta,
      gen as (input: unknown) => Generator<AlgorithmStep, void, undefined>,
      { plaintext: caesarPlain, key: caesarKey, mode: caesarMode },
    );
  }, [algorithmMeta, configure, caesarPlain, caesarKey, caesarMode]);

  const applyVigenere = useCallback(() => {
    if (!algorithmMeta) return;
    const gen = CRYPTO_GENERATORS[algorithmMeta.id];
    if (!gen) return;
    configure(
      algorithmMeta,
      gen as (input: unknown) => Generator<AlgorithmStep, void, undefined>,
      { plaintext: vigPlain, keyword: vigKey, mode: vigMode },
    );
  }, [algorithmMeta, configure, vigPlain, vigKey, vigMode]);

  const applyHash = useCallback(() => {
    if (!algorithmMeta) return;
    const gen = CRYPTO_GENERATORS[algorithmMeta.id];
    if (!gen) return;
    configure(
      algorithmMeta,
      gen as (input: unknown) => Generator<AlgorithmStep, void, undefined>,
      { input: hashInput },
    );
  }, [algorithmMeta, configure, hashInput]);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap items-center gap-3">
        <CategoryControlsHeader
          category="crypto"
          generators={
            CRYPTO_GENERATORS as Record<
              string,
              (input: unknown) => Generator<AlgorithmStep, void, undefined>
            >
          }
          defaultInput={{}}
          onConfigure={syncFromInput}
          pickerClassName="w-56"
        />
      </div>

      <DHControls
        visible={algoId === "diffie-hellman"}
        p={dhP}
        g={dhG}
        a={dhA}
        b={dhB}
        onPChange={setDhP}
        onGChange={setDhG}
        onAChange={setDhA}
        onBChange={setDhB}
        onApply={applyDH}
      />
      <CipherControls
        algoId={algoId}
        caesarKey={caesarKey}
        caesarPlain={caesarPlain}
        caesarMode={caesarMode}
        onCaesarKeyChange={setCaesarKey}
        onCaesarPlainChange={setCaesarPlain}
        onCaesarModeChange={setCaesarMode}
        vigKey={vigKey}
        vigPlain={vigPlain}
        vigMode={vigMode}
        onVigKeyChange={setVigKey}
        onVigPlainChange={setVigPlain}
        onVigModeChange={setVigMode}
        onApplyCaesar={applyCaesar}
        onApplyVigenere={applyVigenere}
      />
      <HashControls
        visible={algoId === "hash-avalanche"}
        input={hashInput}
        onInputChange={setHashInput}
        onApply={applyHash}
      />
    </div>
  );
}
