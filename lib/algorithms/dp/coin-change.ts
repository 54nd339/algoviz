import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import type { FibStep } from "./types";

export const coinChangeMeta: AlgorithmMeta = {
  id: "coin-change-dp",
  name: "Coin Change",
  category: "dp",
  description:
    "Find the minimum number of coins from given denominations that sum to a target amount. A classic 1D dynamic programming problem.",
  timeComplexity: { best: "O(nA)", average: "O(nA)", worst: "O(nA)" },
  spaceComplexity: "O(A)",
  pseudocode: `function coinChange(coins, amount):
  dp[0] = 0
  for i = 1 to amount:
    dp[i] = Infinity
    for coin in coins:
      if coin <= i and dp[i - coin] + 1 < dp[i]:
        dp[i] = dp[i - coin] + 1
  return dp[amount]`,
  presets: [
    {
      name: "Standard (1,5,10,25) → 36",
      generator: () => ({ coins: [1, 5, 10, 25], amount: 36 }),
      expectedCase: "average",
    },
    {
      name: "Simple (1,3,4) → 6",
      generator: () => ({ coins: [1, 3, 4], amount: 6 }),
      expectedCase: "average",
    },
    {
      name: "Impossible (3,7) → 5",
      generator: () => ({ coins: [3, 7], amount: 5 }),
      expectedCase: "worst",
    },
  ],
  misconceptions: [
    {
      myth: "Greedy (always pick the largest coin) gives the optimal answer.",
      reality:
        "Greedy fails for many denomination sets. For example, coins [1,3,4] and amount 6: greedy gives 4+1+1 (3 coins) but optimal is 3+3 (2 coins).",
    },
  ],
  relatedAlgorithms: ["knapsack-dp", "fibonacci-dp"],
};

registerAlgorithm(coinChangeMeta);

export function* coinChange(input: {
  coins: number[];
  amount: number;
}): AlgorithmGenerator<FibStep> {
  const { coins, amount } = input;
  const INF = amount + 1;
  const table: (number | null)[] = Array(amount + 1).fill(null);
  const coinUsedArr: (number | null)[] = Array(amount + 1).fill(null);
  const computedIndices: number[] = [];

  yield {
    type: "init",
    data: {
      table: [...table],
      currentIndex: -1,
      computedIndices: [],
    },
    description: `Coin Change: coins=[${coins.join(",")}], amount=${amount}`,
    codeLine: 1,
    variables: { coins, amount },
  };

  table[0] = 0;
  computedIndices.push(0);

  yield {
    type: "compute",
    data: {
      table: [...table],
      currentIndex: 0,
      computedIndices: [...computedIndices],
      subproblemLabel: "dp[0] = 0 (base case)",
    },
    description: "Base case: 0 coins needed for amount 0",
    codeLine: 2,
    variables: { "dp[0]": 0 },
  };

  for (let i = 1; i <= amount; i++) {
    table[i] = INF;

    for (const coin of coins) {
      if (
        coin <= i &&
        table[i - coin] !== null &&
        table[i - coin]! + 1 < table[i]!
      ) {
        yield {
          type: "try-coin",
          data: {
            table: [...table],
            currentIndex: i,
            computedIndices: [...computedIndices],
            dependencies: [i - coin],
            subproblemLabel: `dp[${i}]: try coin ${coin} → dp[${i - coin}] + 1 = ${table[i - coin]! + 1}`,
            coinUsed: coin,
          },
          description: `Amount ${i}: trying coin ${coin}, dp[${i - coin}]+1 = ${table[i - coin]! + 1}`,
          codeLine: 6,
          variables: {
            i,
            coin,
            "dp[i-coin]": table[i - coin],
            candidate: table[i - coin]! + 1,
          },
        };

        table[i] = table[i - coin]! + 1;
        coinUsedArr[i] = coin;
      }
    }

    if (table[i] === INF) table[i] = -1;
    computedIndices.push(i);

    yield {
      type: "compute",
      data: {
        table: [...table],
        currentIndex: i,
        computedIndices: [...computedIndices],
        subproblemLabel:
          table[i] === -1
            ? `dp[${i}] = ∞ (impossible)`
            : `dp[${i}] = ${table[i]}${coinUsedArr[i] ? ` (used coin ${coinUsedArr[i]})` : ""}`,
        coinUsed: coinUsedArr[i] ?? undefined,
      },
      description:
        table[i] === -1
          ? `dp[${i}] = impossible`
          : `dp[${i}] = ${table[i]} (coin ${coinUsedArr[i]})`,
      codeLine: 7,
      variables: { i, "dp[i]": table[i], coinUsed: coinUsedArr[i] },
    };
  }

  yield {
    type: "done",
    data: {
      table: [...table],
      currentIndex: amount,
      computedIndices: [...computedIndices],
      subproblemLabel:
        table[amount] === -1
          ? `Amount ${amount} is impossible with given coins`
          : `Minimum coins for ${amount} = ${table[amount]}`,
    },
    description:
      table[amount] === -1
        ? `No solution: cannot make amount ${amount}`
        : `Coin Change complete! Minimum coins = ${table[amount]}`,
    variables: { result: table[amount] },
  };
}
