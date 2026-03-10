import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { AlgorithmOfTheDay } from "@/components/page/algorithm-of-the-day";
import { CATEGORIES, TOTAL_ALGORITHMS } from "@/lib/categories";

import { LandingClient } from "./landing-client";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Interactive algorithm visualizer — explore sorting, pathfinding, graph algorithms, and more with step-by-step animations.",
  openGraph: {
    title: "Algoviz — Algorithm Visualizer",
    description:
      "Interactive algorithm visualizer — explore sorting, pathfinding, graph algorithms, and more with step-by-step animations.",
  },
};

export default function Home() {
  return (
    <div className="relative min-h-screen bg-bg-primary">
      <LandingClient />

      <div className="relative z-10 flex flex-col items-center px-6 pt-32 pb-20">
        <div className="mb-2 font-mono text-xs tracking-[0.3em] text-accent-green uppercase">
          Interactive Algorithm Visualizer
        </div>
        <h1 className="mb-4 font-mono text-5xl font-bold tracking-tight text-text-primary sm:text-6xl">
          ALGOVIZ
        </h1>
        <p className="mb-12 max-w-lg text-center text-sm leading-relaxed text-text-secondary">
          Explore {TOTAL_ALGORITHMS}+ algorithms across {CATEGORIES.length}{" "}
          categories with step-by-step animations, code highlighting, and a
          terminal-inspired interface.
        </p>

        <div
          id="categories"
          className="grid w-full max-w-4xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          {CATEGORIES.map(({ slug, label, icon: Icon, count, color }) => (
            <Link
              key={slug}
              href={`/${slug}`}
              className="group flex items-center gap-4 rounded-lg border border-border bg-bg-surface/50 p-4 transition-all duration-150 hover:border-accent-green/30 hover:bg-bg-surface"
            >
              <div
                className={`${color} transition-colors group-hover:text-accent-green`}
              >
                <Icon size={20} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-text-primary">
                  {label}
                </div>
                <div className="font-mono text-xs text-text-muted">
                  {count} algorithms
                </div>
              </div>
              <div className="font-mono text-xs text-text-muted opacity-0 transition-opacity group-hover:opacity-100">
                &rarr;
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 flex items-center gap-4">
          <Link
            href="/compare"
            className="group inline-flex items-center gap-2 rounded-lg border border-accent-green/20 bg-accent-green/5 px-5 py-2.5 font-mono text-xs text-accent-green transition-all hover:border-accent-green/40 hover:bg-accent-green/10"
          >
            Compare All Algorithms
            <ArrowRight
              size={14}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>

        <AlgorithmOfTheDay />

        <div className="mt-16 font-mono text-[10px] text-text-muted">
          <span className="text-accent-green">$</span> Built with Next.js,
          React, Tailwind CSS, xstate, zustand
        </div>
      </div>
    </div>
  );
}
