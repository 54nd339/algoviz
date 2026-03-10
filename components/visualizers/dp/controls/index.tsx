"use client";

import { useCallback, useState } from "react";
import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui";
import { CategoryControlsHeader } from "@/components/visualizers/shared";
import { DP_GENERATORS } from "@/lib/algorithms/dp";
import { cn } from "@/lib/utils";
import { useVisualizer } from "@/hooks";
import type { AlgorithmStep } from "@/types";

import { CoinChangeControls } from "./coin-change-controls";
import {
  defaultInputForAlgorithm,
  isKnapsackInput,
} from "./dp-controls-shared";
import { FibonacciControls } from "./fibonacci-controls";
import { KnapsackControls } from "./knapsack-controls";
import { MatrixChainControls } from "./matrix-chain-controls";
import { StringDPControls } from "./string-dp-controls";

interface DPControlsProps {
  className?: string;
}

export function DPControls({ className }: DPControlsProps) {
  const { algorithmMeta, configure } = useVisualizer();

  const [fibN, setFibN] = useState(7);
  const [fibMode, setFibMode] = useState<"dp" | "naive">("dp");
  const [str1, setStr1] = useState("ABCBDAB");
  const [str2, setStr2] = useState("BDCAB");
  const [coins, setCoins] = useState("1,3,4");
  const [amount, setAmount] = useState(6);
  const [weights, setWeights] = useState("1,3,4,5");
  const [values, setValues] = useState("1,4,5,7");
  const [capacity, setCapacity] = useState(7);
  const [dimensions, setDimensions] = useState("10,30,5,60");

  const syncFromInput = useCallback((input: unknown) => {
    if (!input || typeof input !== "object") return;
    const o = input as Record<string, unknown>;
    if (typeof o.n === "number") setFibN(o.n);
    if (o.mode === "dp" || o.mode === "naive") setFibMode(o.mode);
    if (typeof o.str1 === "string") setStr1(o.str1);
    if (typeof o.str2 === "string") setStr2(o.str2);
    if (Array.isArray(o.coins)) setCoins(o.coins.join(","));
    if (typeof o.amount === "number") setAmount(o.amount);
    if (Array.isArray(o.dimensions)) setDimensions(o.dimensions.join(","));
    if (isKnapsackInput(input)) {
      setWeights(input.weights.join(","));
      setValues(input.values.join(","));
      setCapacity(input.capacity);
    }
  }, []);

  const handleReconfigure = useCallback(() => {
    if (!algorithmMeta) return;
    const gen = DP_GENERATORS[algorithmMeta.id];
    if (!gen) return;

    let input: unknown;
    switch (algorithmMeta.id) {
      case "fibonacci-dp":
        input = { n: fibN, mode: fibMode };
        break;
      case "knapsack-dp":
        input = {
          weights: weights.split(",").map(Number),
          values: values.split(",").map(Number),
          capacity,
        };
        break;
      case "lcs-dp":
      case "edit-distance-dp":
        input = { str1, str2 };
        break;
      case "coin-change-dp":
        input = { coins: coins.split(",").map(Number), amount };
        break;
      case "matrix-chain-dp":
        input = { dimensions: dimensions.split(",").map(Number) };
        break;
      default:
        input = defaultInputForAlgorithm(algorithmMeta.id);
    }

    configure(
      algorithmMeta,
      gen as (input: unknown) => Generator<AlgorithmStep, void, undefined>,
      input,
    );
  }, [
    algorithmMeta,
    fibN,
    fibMode,
    str1,
    str2,
    coins,
    amount,
    weights,
    values,
    capacity,
    dimensions,
    configure,
  ]);

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <CategoryControlsHeader
        category="dp"
        generators={
          DP_GENERATORS as Record<
            string,
            (input: unknown) => Generator<AlgorithmStep, void, undefined>
          >
        }
        defaultInput={
          algorithmMeta
            ? defaultInputForAlgorithm(algorithmMeta.id)
            : { n: 7, mode: "dp" }
        }
        onConfigure={syncFromInput}
        presetsClassName="w-48"
      />

      {algorithmMeta?.id === "fibonacci-dp" && (
        <FibonacciControls
          fibN={fibN}
          onFibNChange={setFibN}
          fibMode={fibMode}
          onFibModeChange={setFibMode}
        />
      )}

      {(algorithmMeta?.id === "lcs-dp" ||
        algorithmMeta?.id === "edit-distance-dp") && (
        <StringDPControls
          str1={str1}
          onStr1Change={setStr1}
          str2={str2}
          onStr2Change={setStr2}
        />
      )}

      {algorithmMeta?.id === "knapsack-dp" && (
        <KnapsackControls
          weights={weights}
          onWeightsChange={setWeights}
          values={values}
          onValuesChange={setValues}
          capacity={capacity}
          onCapacityChange={setCapacity}
        />
      )}

      {algorithmMeta?.id === "coin-change-dp" && (
        <CoinChangeControls
          coins={coins}
          onCoinsChange={setCoins}
          amount={amount}
          onAmountChange={setAmount}
        />
      )}

      {algorithmMeta?.id === "matrix-chain-dp" && (
        <MatrixChainControls
          dimensions={dimensions}
          onDimensionsChange={setDimensions}
        />
      )}

      {algorithmMeta && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleReconfigure}
          className="gap-1.5"
        >
          <RotateCcw size={14} />
          Apply
        </Button>
      )}
    </div>
  );
}
