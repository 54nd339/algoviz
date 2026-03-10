import type { Metadata } from "next";

import { CompareTable } from "./compare-table";

export const metadata: Metadata = {
  title: "Compare Algorithms",
  description:
    "Side-by-side comparison of 100+ algorithms: time complexity, space complexity, stability, and more.",
};

export default function ComparePage() {
  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div className="space-y-1">
        <h1 className="font-mono text-2xl font-bold text-text-primary">
          Algorithm Comparison
        </h1>
        <p className="text-sm text-text-secondary">
          Browse and filter all registered algorithms by category, complexity,
          and properties.
        </p>
      </div>
      <CompareTable />
    </main>
  );
}
