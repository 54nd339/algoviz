"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

import { Badge, Card } from "@/components/ui";
import { getAllAlgorithms } from "@/lib/algorithms";
import { getAlgorithmOfTheDay } from "@/lib/utils/algorithm-of-the-day";

export function AlgorithmOfTheDay() {
  const algo = useMemo(() => {
    const all = getAllAlgorithms();
    return getAlgorithmOfTheDay(all);
  }, []);

  if (!algo) return null;

  return (
    <Card
      variant="elevated"
      padding="md"
      className="mx-auto mt-8 max-w-md border-accent-green/20"
    >
      <div className="flex items-start gap-3">
        <Sparkles size={16} className="mt-0.5 shrink-0 text-accent-amber" />
        <div className="space-y-1.5">
          <div className="font-mono text-[10px] tracking-widest text-accent-amber uppercase">
            Algorithm of the Day
          </div>
          <Link
            href={`/${algo.category}?algo=${encodeURIComponent(algo.id)}`}
            className="block text-sm font-semibold text-text-primary transition-colors hover:text-accent-green"
          >
            {algo.name}
          </Link>
          <p className="text-xs leading-relaxed text-text-secondary">
            {algo.description}
          </p>
          <div className="flex gap-1.5">
            <Badge variant="default">{algo.category}</Badge>
            <Badge variant="cyan">{algo.timeComplexity.average}</Badge>
          </div>
        </div>
      </div>
    </Card>
  );
}
