"use client";

import { useCallback, useRef, useState } from "react";

import { NUMERICAL_GENERATORS } from "@/lib/algorithms/numerical";
import {
  buildCustomNumericalInput,
  isIntegrationInput,
  isMonteCarloInput,
} from "@/lib/algorithms/numerical/input-utils";
import { parseExpression } from "@/lib/utils/math-parser";
import { useVisualizer } from "@/hooks";
import type { AlgorithmStep } from "@/types";

/** Encapsulates state and handlers for numerical method controls. */
export function useNumericalControls() {
  const { algorithmMeta, configure } = useVisualizer();

  const [integrationSegments, setIntegrationSegments] = useState(8);
  const [integrationFunctionId, setIntegrationFunctionId] = useState("sin");
  const [monteCarloNumSamples, setMonteCarloNumSamples] = useState(500);
  const [monteCarloBatchSize, setMonteCarloBatchSize] = useState(10);
  const [customExpr, setCustomExpr] = useState("");
  const [customDomainA, setCustomDomainA] = useState("-5");
  const [customDomainB, setCustomDomainB] = useState("5");
  const [parseError, setParseError] = useState<string | null>(null);
  const exprRef = useRef<HTMLInputElement>(null);

  const currentGen = algorithmMeta
    ? NUMERICAL_GENERATORS[algorithmMeta.id]
    : undefined;

  const syncFromInput = useCallback((input: unknown) => {
    if (isIntegrationInput(input)) {
      setIntegrationSegments(input.segments);
      setIntegrationFunctionId(input.functionId);
    }
    if (isMonteCarloInput(input)) {
      setMonteCarloNumSamples(input.numSamples);
      setMonteCarloBatchSize(input.batchSize);
    }
    setParseError(null);
  }, []);

  const handleSegmentsChange = useCallback(
    (seg: number) => {
      setIntegrationSegments(seg);
      if (algorithmMeta?.id === "numerical-integration" && currentGen) {
        configure(
          algorithmMeta,
          currentGen as (
            input: unknown,
          ) => Generator<AlgorithmStep, void, undefined>,
          { functionId: integrationFunctionId, segments: seg },
        );
      }
    },
    [algorithmMeta, currentGen, configure, integrationFunctionId],
  );

  const handleMonteCarloSamplesChange = useCallback(
    (n: number) => {
      setMonteCarloNumSamples(n);
      if (algorithmMeta?.id === "monte-carlo-pi" && currentGen) {
        const batchSize = Math.max(1, Math.min(monteCarloBatchSize, n));
        configure(
          algorithmMeta,
          currentGen as (
            input: unknown,
          ) => Generator<AlgorithmStep, void, undefined>,
          { numSamples: n, batchSize },
        );
      }
    },
    [algorithmMeta, currentGen, configure, monteCarloBatchSize],
  );

  const handleGenerateNew = useCallback(() => {
    if (!algorithmMeta || !currentGen) return;
    const preset = algorithmMeta.presets?.[0];
    if (preset) {
      configure(
        algorithmMeta,
        currentGen as (
          input: unknown,
        ) => Generator<AlgorithmStep, void, undefined>,
        preset.generator(),
      );
    }
  }, [algorithmMeta, currentGen, configure]);

  const handleApplyCustom = useCallback(() => {
    if (!algorithmMeta || !currentGen || !customExpr.trim()) return;
    const parsed = parseExpression(customExpr);
    if (!parsed) {
      setParseError("Invalid expression");
      return;
    }
    setParseError(null);
    const a = parseFloat(customDomainA) || -5;
    const b = parseFloat(customDomainB) || 5;
    const input = buildCustomNumericalInput(
      algorithmMeta.id,
      customExpr,
      a,
      b,
      integrationSegments,
    );
    if (input) {
      configure(
        algorithmMeta,
        currentGen as (
          input: unknown,
        ) => Generator<AlgorithmStep, void, undefined>,
        input,
      );
    }
  }, [
    algorithmMeta,
    currentGen,
    configure,
    customExpr,
    customDomainA,
    customDomainB,
    integrationSegments,
  ]);

  const isIntegration = algorithmMeta?.id === "numerical-integration";
  const isMonteCarlo = algorithmMeta?.id === "monte-carlo-pi";
  const supportsCustom =
    algorithmMeta?.id === "bisection" ||
    algorithmMeta?.id === "newton-method" ||
    isIntegration;

  return {
    algorithmMeta,
    currentGen,
    syncFromInput,
    integrationSegments,
    monteCarloNumSamples,
    customExpr,
    customDomainA,
    customDomainB,
    parseError,
    exprRef,
    setCustomExpr,
    setParseError,
    handleSegmentsChange,
    handleMonteCarloSamplesChange,
    handleGenerateNew,
    handleApplyCustom,
    setCustomDomainA,
    setCustomDomainB,
    isIntegration,
    isMonteCarlo,
    supportsCustom,
  };
}
