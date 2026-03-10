import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";

import { registerAlgorithm } from "../registry";
import type { OptimizationStep } from "./types";
import { FUNCTIONS_1D } from "./types";

export const geneticAlgorithmMeta: AlgorithmMeta = {
  id: "genetic-algorithm",
  name: "Genetic Algorithm",
  category: "optimization",
  description:
    "A population of candidate solutions evolves over generations. Selection favors fit individuals, crossover combines parents, and mutation introduces variation. The population converges on the global optimum.",
  timeComplexity: { best: "O(p·g)", average: "O(p·g)", worst: "O(p·g)" },
  spaceComplexity: "O(p)",
  pseudocode: `function geneticAlgorithm(f, popSize, gens, mutRate):
  population = randomInit(popSize)
  for gen = 1 to gens:
    fitness = evaluate(population)
    parents = selection(population, fitness)
    offspring = crossover(parents)
    mutate(offspring, mutRate)
    population = offspring
  return best(population)`,
  presets: [
    {
      name: "Multi-Peak",
      generator: () => ({
        functionId: "multi-peak",
        populationSize: 20,
        generations: 30,
        mutationRate: 0.1,
        mutationSize: 0.5,
      }),
      expectedCase: "average",
    },
    {
      name: "Rastrigin",
      generator: () => ({
        functionId: "rastrigin-1d",
        populationSize: 25,
        generations: 40,
        mutationRate: 0.15,
        mutationSize: 0.3,
      }),
      expectedCase: "average",
    },
  ],
  misconceptions: [
    {
      myth: "Genetic algorithms are always better than simpler methods.",
      reality:
        "GAs have significant overhead from population management. For smooth, low-dimensional problems, gradient-based methods are usually faster.",
    },
  ],
  relatedAlgorithms: ["simulated-annealing", "hill-climbing"],
};

registerAlgorithm(geneticAlgorithmMeta);

export function* geneticAlgorithm(input: {
  functionId: string;
  populationSize: number;
  generations: number;
  mutationRate: number;
  mutationSize: number;
}): AlgorithmGenerator<OptimizationStep> {
  const {
    functionId,
    populationSize,
    generations,
    mutationRate,
    mutationSize,
  } = input;
  const func = FUNCTIONS_1D.find((f) => f.id === functionId) ?? FUNCTIONS_1D[0];
  const [lo, hi] = func.domain;

  let population = Array.from(
    { length: populationSize },
    () => lo + Math.random() * (hi - lo),
  );

  const fitness = (x: number) => func.fn(x);
  const evalPop = () =>
    population.map((x) => ({ x, y: 0, fitness: fitness(x) }));

  let evaluated = evalPop();
  let bestIndiv = evaluated.reduce((a, b) => (a.fitness > b.fitness ? a : b));
  const trail: { x: number; y: number }[] = [{ x: bestIndiv.x, y: 0 }];

  yield {
    type: "init",
    data: {
      position: { x: bestIndiv.x, y: 0 },
      value: bestIndiv.fitness,
      population: [...evaluated],
      best: { x: bestIndiv.x, y: 0, value: bestIndiv.fitness },
      iteration: 0,
      trail: [...trail],
      functionId,
      phase: "init" as const,
    },
    description: `Initialized population of ${populationSize} individuals`,
    codeLine: 2,
    variables: { populationSize, generations, mutationRate },
  };

  for (let gen = 1; gen <= generations; gen++) {
    // Selection (tournament selection, size 3)
    const selected: number[] = [];
    for (let i = 0; i < populationSize; i++) {
      const candidates = Array.from({ length: 3 }, () =>
        Math.floor(Math.random() * populationSize),
      );
      const winner = candidates.reduce((a, b) =>
        fitness(population[a]) > fitness(population[b]) ? a : b,
      );
      selected.push(winner);
    }

    yield {
      type: "select",
      data: {
        position: { x: bestIndiv.x, y: 0 },
        value: bestIndiv.fitness,
        population: [...evaluated],
        best: { x: bestIndiv.x, y: 0, value: bestIndiv.fitness },
        iteration: gen,
        trail: [...trail],
        functionId,
        phase: "select" as const,
      },
      description: `Gen ${gen}: tournament selection complete`,
      codeLine: 5,
      variables: { generation: gen },
    };

    // Crossover (arithmetic)
    const offspring: number[] = [];
    for (let i = 0; i < populationSize; i += 2) {
      const p1 = population[selected[i]];
      const p2 = population[selected[Math.min(i + 1, populationSize - 1)]];
      const alpha = Math.random();
      offspring.push(alpha * p1 + (1 - alpha) * p2);
      if (offspring.length < populationSize) {
        offspring.push((1 - alpha) * p1 + alpha * p2);
      }
    }

    // Mutation
    for (let i = 0; i < offspring.length; i++) {
      if (Math.random() < mutationRate) {
        offspring[i] += (Math.random() - 0.5) * 2 * mutationSize;
        offspring[i] = Math.max(lo, Math.min(hi, offspring[i]));
      }
    }

    population = offspring.slice(0, populationSize);
    evaluated = evalPop();
    const genBest = evaluated.reduce((a, b) => (a.fitness > b.fitness ? a : b));

    if (genBest.fitness > bestIndiv.fitness) {
      bestIndiv = genBest;
      trail.push({ x: bestIndiv.x, y: 0 });
    }

    yield {
      type: "mutate",
      data: {
        position: { x: genBest.x, y: 0 },
        value: genBest.fitness,
        population: [...evaluated],
        best: { x: bestIndiv.x, y: 0, value: bestIndiv.fitness },
        iteration: gen,
        trail: [...trail],
        functionId,
        phase: "mutate" as const,
      },
      description: `Gen ${gen}: best fitness = ${genBest.fitness.toFixed(4)}`,
      codeLine: 7,
      variables: {
        generation: gen,
        bestX: +bestIndiv.x.toFixed(4),
        bestFitness: +bestIndiv.fitness.toFixed(4),
        avgFitness: +(
          evaluated.reduce((s, e) => s + e.fitness, 0) / populationSize
        ).toFixed(4),
      },
    };
  }

  yield {
    type: "done",
    data: {
      position: { x: bestIndiv.x, y: 0 },
      value: bestIndiv.fitness,
      population: [...evaluated],
      best: { x: bestIndiv.x, y: 0, value: bestIndiv.fitness },
      iteration: generations,
      trail: [...trail],
      functionId,
      phase: "done" as const,
    },
    description: `GA complete. Best: x=${bestIndiv.x.toFixed(3)}, f(x)=${bestIndiv.fitness.toFixed(4)}`,
    variables: {
      bestX: +bestIndiv.x.toFixed(4),
      bestFitness: +bestIndiv.fitness.toFixed(4),
    },
  };
}
