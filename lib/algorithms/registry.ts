import type { AlgorithmCategory, AlgorithmMeta } from "@/types";

const registry = new Map<string, AlgorithmMeta>();

export function registerAlgorithm(meta: AlgorithmMeta): void {
  registry.set(meta.id, meta);
}

export function getAlgorithm(id: string): AlgorithmMeta | undefined {
  return registry.get(id);
}

export function getByCategory(category: AlgorithmCategory): AlgorithmMeta[] {
  return Array.from(registry.values()).filter((m) => m.category === category);
}

export function getAllAlgorithms(): AlgorithmMeta[] {
  return Array.from(registry.values());
}

export function getAlgorithmCount(): number {
  return registry.size;
}
