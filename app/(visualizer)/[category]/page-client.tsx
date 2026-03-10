"use client";

import type { ComponentType } from "react";
import dynamic from "next/dynamic";

import type { AlgorithmCategory } from "@/types";

interface CategoryPageClientProps {
  category: AlgorithmCategory;
}

const categoryClientMap: Record<AlgorithmCategory, ComponentType> = {
  sorting: dynamic(() => import("@/components/page/sorting")),
  searching: dynamic(() => import("@/components/page/searching")),
  "data-structures": dynamic(() => import("@/components/page/data-structures")),
  string: dynamic(() => import("@/components/page/string")),
  pathfinding: dynamic(() => import("@/components/page/pathfinding")),
  graph: dynamic(() => import("@/components/page/graph")),
  dp: dynamic(() => import("@/components/page/dp")),
  geometry: dynamic(() => import("@/components/page/geometry")),
  ai: dynamic(() => import("@/components/page/ai")),
  optimization: dynamic(() => import("@/components/page/optimization")),
  numerical: dynamic(() => import("@/components/page/numerical")),
  games: dynamic(() => import("@/components/page/games")),
  fractals: dynamic(() => import("@/components/page/fractals")),
  os: dynamic(() => import("@/components/page/os")),
  crypto: dynamic(() => import("@/components/page/crypto")),
};

export default function CategoryPageClient({
  category,
}: CategoryPageClientProps) {
  const CategoryClient = categoryClientMap[category];
  return <CategoryClient />;
}
