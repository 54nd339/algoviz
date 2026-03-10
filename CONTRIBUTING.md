# Contributing to Algoviz

Thanks for contributing.

## Dev Setup

1. Install dependencies:
   ```bash
   bun install
   ```
2. Start the app:
   ```bash
   bun dev
   ```
3. Run lint before opening a PR:
   ```bash
   bun run lint
   ```
4. Production build (static export):
   ```bash
   bun run build
   ```
5. Serve the static build locally:
   ```bash
   bun start
   ```

## How to Add a New Algorithm

### Add a new algorithm to an existing category

Using sorting as an example (replace with your target category):

| Step | File | Action |
|------|------|--------|
| 1 | `lib/algorithms/<category>/<algo-name>.ts` | Create the algorithm module: define an `AlgorithmMeta` object, call `registerAlgorithm(meta)`, and export a `function*` generator that yields `AlgorithmStep` values. |
| 2 | `lib/algorithms/<category>/index.ts` | Re-export the generator and meta. Add the generator to the category map (e.g. `SORTING_GENERATORS`). |
| 3 | `lib/algorithm-entries.ts` | Add an entry with `name`, `category`, `slug`, `complexity`, and optionally `algorithmId` (enables `/<category>?algo=<id>` deep links). |
| 4 | `lib/categories.ts` | Increment the `count` for the category. |

The Compare table, Algorithm of the Day, and command palette all derive from `registerAlgorithm` / `getAllAlgorithms` / `ALGORITHM_ENTRIES` -- no extra wiring needed.

#### Algorithm module anatomy

```ts
// lib/algorithms/sorting/example-sort.ts
import { registerAlgorithm } from "@/lib/algorithms/registry";
import type { AlgorithmGenerator, AlgorithmMeta } from "@/types";
import type { SortStep } from "./types";

const meta: AlgorithmMeta = {
  id: "example-sort",
  name: "Example Sort",
  category: "sorting",
  description: "One-line description.",
  timeComplexity: { best: "O(n)", average: "O(n²)", worst: "O(n²)" },
  spaceComplexity: "O(1)",
  stable: true,
  inPlace: true,
  pseudocode: "...",
  presets: [/* optional input presets */],
};

registerAlgorithm(meta);

export function* exampleSort(input: number[]): AlgorithmGenerator<SortStep> {
  // yield steps lazily
}

export { meta as exampleSortMeta };
```

### Add a new category

| Step | File | Action |
|------|------|--------|
| 1 | `types/index.ts` | Add the new slug to the `AlgorithmCategory` union. |
| 2 | `lib/categories.ts` | Add a `CATEGORIES` entry with `slug`, `label`, `icon`, `count`, `color`. |
| 3 | `lib/algorithms/<category>/` | Create algorithm modules, a `types.ts` for step shapes, and an `index.ts` barrel exporting generators + a `*_GENERATORS` map. |
| 4 | `lib/workers/engine-worker.ts` | Import and spread the new `*_GENERATORS` into `ALL_GENERATORS`. |
| 5 | `components/visualizers/<category>/` | Create visualizer components (canvas/controls). |
| 6 | `components/page/<category>.tsx` | Create the category page module (default export). |
| 7 | `app/(visualizer)/[category]/page-client.tsx` | Add `<category>: dynamic(() => import("@/components/page/<category>"))` to `categoryClientMap`. |
| 8 | `app/(visualizer)/[category]/page.tsx` | Add a `CATEGORY_METADATA` entry with `title` and `description`. |
| 9 | `lib/algorithm-entries.ts` | Add entries for each algorithm in the new category. |

### Verify

- The route `/<category>` renders correctly.
- The algorithm appears in the command palette (`Cmd+K`).
- The compare table (`/compare`) includes the new algorithm.
- `bun run lint` passes.
- `bun run build` succeeds (static export).

## Code Style

- Keep changes minimal and focused.
- Follow SOLID, DRY, and KISS.
- Prefer Server Components; use `'use client'` only when needed.
- Use Tailwind utility classes and existing design tokens.
- Use Zustand selectors (small slices) and xstate for complex finite-state flows.
- TypeScript strict mode; avoid `any`.
- Remove unused imports/dead code.
- Keep imports grouped and ordered:
  1. Third-party
  2. `@/` aliases
  3. Relative imports
- Use barrel exports (`index.ts`) for directories with 2+ public exports.

## Pull Requests

- Include a concise summary of what changed and why.
- Mention any route, metadata, or algorithm registry updates.
- If behavior changed, include manual verification notes.
- Ensure lint passes and the build succeeds before requesting review.
