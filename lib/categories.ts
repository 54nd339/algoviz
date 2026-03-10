import {
  ArrowUpDown,
  Brain,
  Calculator,
  Cpu,
  Database,
  Gamepad2,
  Grid3X3,
  Lock,
  type LucideIcon,
  Search,
  Shapes,
  Share2,
  Snowflake,
  Table2,
  TrendingUp,
  Type,
} from "lucide-react";

import type { AlgorithmCategory } from "@/types";

export interface CategoryMeta {
  slug: AlgorithmCategory;
  label: string;
  icon: LucideIcon;
  count: number;
  color: string;
}

export const CATEGORIES: CategoryMeta[] = [
  {
    slug: "sorting",
    label: "Sorting",
    icon: ArrowUpDown,
    count: 10,
    color: "text-accent-green",
  },
  {
    slug: "searching",
    label: "Searching",
    icon: Search,
    count: 4,
    color: "text-accent-green",
  },
  {
    slug: "data-structures",
    label: "Data Structures",
    icon: Database,
    count: 12,
    color: "text-accent-cyan",
  },
  {
    slug: "string",
    label: "String Matching",
    icon: Type,
    count: 4,
    color: "text-accent-cyan",
  },
  {
    slug: "pathfinding",
    label: "Pathfinding",
    icon: Grid3X3,
    count: 10,
    color: "text-accent-green",
  },
  {
    slug: "graph",
    label: "Graph",
    icon: Share2,
    count: 10,
    color: "text-accent-cyan",
  },
  {
    slug: "dp",
    label: "Dynamic Programming",
    icon: Table2,
    count: 6,
    color: "text-accent-amber",
  },
  {
    slug: "geometry",
    label: "Geometry",
    icon: Shapes,
    count: 5,
    color: "text-accent-amber",
  },
  {
    slug: "ai",
    label: "AI / ML",
    icon: Brain,
    count: 5,
    color: "text-accent-cyan",
  },
  {
    slug: "optimization",
    label: "Optimization",
    icon: TrendingUp,
    count: 4,
    color: "text-accent-amber",
  },
  {
    slug: "numerical",
    label: "Numerical",
    icon: Calculator,
    count: 4,
    color: "text-accent-amber",
  },
  {
    slug: "games",
    label: "Games & Puzzles",
    icon: Gamepad2,
    count: 7,
    color: "text-accent-green",
  },
  {
    slug: "fractals",
    label: "Fractals",
    icon: Snowflake,
    count: 5,
    color: "text-accent-cyan",
  },
  {
    slug: "os",
    label: "OS Algorithms",
    icon: Cpu,
    count: 15,
    color: "text-accent-amber",
  },
  {
    slug: "crypto",
    label: "Cryptography",
    icon: Lock,
    count: 3,
    color: "text-accent-green",
  },
];

export const CATEGORY_SLUGS = CATEGORIES.map((c) => c.slug);

export const TOTAL_ALGORITHMS = CATEGORIES.reduce((sum, c) => sum + c.count, 0);
