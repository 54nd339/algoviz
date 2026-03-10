"use client";

import { Shuffle } from "lucide-react";

import { Button } from "@/components/ui";
import { CategoryControlsHeader } from "@/components/visualizers/shared";
import { NUMERICAL_GENERATORS } from "@/lib/algorithms/numerical";
import { cn } from "@/lib/utils";
import type { AlgorithmStep } from "@/types";

import { CustomFunctionControls } from "./custom-function-controls";
import { IntegrationControls } from "./integration-controls";
import { MonteCarloControls } from "./monte-carlo-controls";
import { useNumericalControls } from "./use-numerical-controls";

import "@/lib/algorithms/numerical";

interface NumericalControlsProps {
  className?: string;
}

/** Orchestrates controls for all numerical methods (Newton, Bisection, Integration, Monte Carlo). */
export function NumericalControls({ className }: NumericalControlsProps) {
  const {
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
  } = useNumericalControls();

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap items-center gap-3">
        <CategoryControlsHeader
          category="numerical"
          generators={
            NUMERICAL_GENERATORS as Record<
              string,
              (input: unknown) => Generator<AlgorithmStep, void, undefined>
            >
          }
          onConfigure={syncFromInput}
        />
        {isIntegration && currentGen && (
          <IntegrationControls
            segments={integrationSegments}
            onSegmentsChange={handleSegmentsChange}
          />
        )}
        {isMonteCarlo && currentGen && (
          <MonteCarloControls
            numSamples={monteCarloNumSamples}
            onSamplesChange={handleMonteCarloSamplesChange}
          />
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={handleGenerateNew}
          className="gap-1.5"
        >
          <Shuffle size={14} />
          Restart
        </Button>
      </div>
      {supportsCustom && (
        <CustomFunctionControls
          expr={customExpr}
          domainA={customDomainA}
          domainB={customDomainB}
          parseError={parseError}
          exprRef={exprRef}
          onExprChange={(v) => {
            setCustomExpr(v);
            setParseError(null);
          }}
          onDomainAChange={setCustomDomainA}
          onDomainBChange={setCustomDomainB}
          onApply={handleApplyCustom}
        />
      )}
    </div>
  );
}
