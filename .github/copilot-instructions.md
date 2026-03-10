---
description: Algoviz project coding conventions and architecture rules
---

# Algoviz Conventions

## Architecture

- Follow SOLID, DRY, KISS principles. Prefer minimal diffs.
- Optimize for clarity, correctness, and performance first.
- Components are **dumb and presentational only**. No business logic in components.
- Business logic belongs in `lib/`, `utils/`, `hooks/`, `stores/`, or `providers/`.
- Default to **Server Components**. Add `'use client'` only on interactive leaf components that need browser APIs, event handlers, or hooks.
- Use `next/link` instead of `<a>`. Use `next/image` instead of `<img>`.
- Avoid prop drilling. Use Zustand stores, React context, or composition (children/render props).
- **Lazy Step Materialization**: Algorithm generators yield steps lazily. The StepEngine materializes them on-demand (one at a time during playback, batch-forward on `jumpTo`). This avoids computing all steps eagerly for large inputs.
- **Web Worker Offloading**: Only for genuinely CPU-heavy workloads (Mandelbrot/Julia fractals, batch benchmarking). Uses Comlink (installed in Phase 13).
  - Standard algorithm visualizations run on the main thread via lazy generators -- no worker overhead.
  - Simple O(N) iterations should remain synchronous to avoid IPC latency.

## State Management

- Use Zustand for global UI/app state. Keep stores **minimal and atomic** -- one concern per store.
- Export individual selector hooks, never the entire store object.
- Components must subscribe to the smallest slice needed to prevent unnecessary re-renders.
- Prefer `useShallow` from zustand for multi-field selectors.
- Use **xstate v5** for any feature with 3+ states and guarded transitions (engine lifecycle, editor modes, game flows). Simple boolean toggles stay in Zustand.
  - Co-locate machines with their feature (`lib/engine/engine-machine.ts`, not a global machines folder).
  - Wrap xstate actors with Zustand selectors for React consumption.

## Styling

- Use Tailwind CSS v4 utility classes exclusively. No inline styles or CSS modules.
- Order classes logically: **layout -> box model -> visual -> typography**.
  - Example: `flex items-center gap-2 p-4 rounded-lg bg-zinc-900 border border-zinc-800 text-sm font-medium text-zinc-100`
- Use `next-themes` for dark/light mode. Reference theme via `dark:` variant. Default to dark.
- Stick to the project's CSS custom properties defined in `globals.css` for theme colors.
- Use `cn()` helper (`lib/utils/cn.ts`) combining `clsx` + `tailwind-merge` for conditional classes.
- Use `cva` (class-variance-authority) for **variant-driven components** (Button, Badge, etc.). Define variants as a typed config, not inline ternaries.
- **Console & Tech aesthetic**: near-black backgrounds (zinc-950), muted zinc surfaces, neon accent palette (green/cyan/amber), subtle 1px zinc-800 borders, CRT dot-grid on canvas areas, neon glow on focus (`0 0 12px color/20%`), monospace display typography (Geist Mono).

## Module Boundaries

- Do not introduce barrel imports/exports (`index.ts` re-export hubs).
- Prefer direct module imports (for example, `@/components/ui/button`) to keep dev dependency graphs smaller.
- Keep module boundaries explicit and avoid broad re-export surfaces.

## Imports & Bundle

- Zero tolerance for unused imports or dead code. Remove them immediately.
- Order imports in this **standard grouping**:
  1. Third-party packages (`react` > `next` > `lucide-react`, etc.)
  2. Internal aliases (`@/...`)
     - Internal alias precedence: `@/components` > `@/lib` > `@/providers` > `@/stores` > `@/hooks` > `@/types`
  3. Relative imports (`../...`, `./...`)
- Sort paths alphabetically within each group.
- Follow the current ESLint `simple-import-sort` grouping/order inside each group.
- Prefer `import { value, type TypeName } from 'module'` style for type specifiers.
- Heavy libraries must be **dynamically imported** via `next/dynamic` or lazy `import()`.
  - `framer-motion`: lazy inside `'use client'` visualizer shells only.
  - `@xyflow/react`: dynamically imported only on `/graph` route.
  - `visx` packages: dynamically imported only on `/ai`, `/optimization`, `/numerical` routes.
  - `shiki`: dynamically imported inside the collapsible CodePanel.
- Prefer tree-shakable named imports over default imports where possible.
- Offload custom logic to pre-built libraries when a well-maintained one exists.

## Keyboard & Shortcuts

- Use `react-hotkeys-hook` for component-level and global keyboard shortcuts.
- Use `cmdk` for the command palette (Cmd+K / Ctrl+K).
- Global shortcuts: `Space` = play/pause, `ArrowRight/Left` = step fwd/back, `[`/`]` = speed, `F` = fullscreen, `?` = cheatsheet.
- Optional vim keybindings (toggle): `j/k` = list nav, `h/l` = step, `/` = search.

## Animations

- Use `framer-motion` for enter/exit transitions (`AnimatePresence` + `motion.div`).
- Keep durations under **150ms** for UI controls (buttons, toggles, panels).
- Use **300-500ms** eased transitions for visualization step animations.
- Prefer `layoutId` for swap animations (sorting bars) over manual position tweening.
- Respect `prefers-reduced-motion` -- disable visualization animations, keep functional transitions.

## Notifications

- Use `sonner` `toast()` for all user feedback. Never use `window.alert` or `window.confirm`.
- Toast types: `toast.success()` for completions, `toast.error()` for failures, `toast()` for info.

## Icons

- Use `lucide-react` exclusively. No other icon libraries.
- Always use tree-shakable named imports: `import { Play, Pause } from "lucide-react"`.
- Default size: `16px` for inline, `20px` for buttons, `24px` for headers.

## Accessibility

- Build all interactive primitives on `@radix-ui` for keyboard navigation, focus management, and ARIA attributes.
- Use `aria-live="polite"` regions for visualization step announcements (screen reader support).
- All interactive elements must be keyboard-reachable. No click-only interactions.
- Color is never the sole indicator -- pair with icons, labels, or patterns.

## Syntax Highlighting

- Use `shiki` for all code/pseudocode display in the CodePanel.
- Dynamically import the highlighter. Use only the `typescript` grammar to keep bundle lean.
- Create a lazy singleton in `lib/utils/highlighter.ts` -- initialize once, cache the instance.
- Use shiki line transformers for active-line highlighting synced to `step.codeLine`.

## Canvas & Rendering Strategy

- **HTML Canvas** for grids (pathfinding) and arrays (sorting) -- performance at scale.
- **`@xyflow/react`** for interactive node-edge graph editors -- built-in drag, zoom/pan, minimap.
- **`visx` SVG** for data plots (AI/ML scatter, contour, function curves) -- clean axes/scales.
- **DOM + framer-motion** for data structures (trees, stacks, linked lists) -- accessibility + animation.
- Abstract rendering behind typed hooks (`useCanvasRenderer`, `useSvgPlot`) so visualizer components don't couple to rendering strategy.

## Sound

- Use Web Audio API `OscillatorNode` for algorithm sonification (sorting sounds, pathfinding pings).
- Map data values to pitch (lower value = lower frequency, higher = higher).
- Sound is always opt-in (muted by default). Toggle in controls and persist preference in `ui-store`.

## TypeScript

- Strict mode. No `any` unless absolutely unavoidable.
- Define types in `types/index.ts` or co-locate in `lib/algorithms/[category]/types.ts` for domain types.
- Prefer `interface` for object shapes, `type` for unions/intersections.
- Use `as const` for literal arrays and objects used as configuration.

## Comments

- Comments explain **why**, never **what**. If the code needs a "what" comment, refactor for clarity.
- Bad: `// increment counter` Good: `// reset after max retries to avoid infinite loop`

## File Organization

```
app/                      -- Next.js routes, layouts, metadata
  (visualizer)/
    [category]/page.tsx            -- Dynamic category route + generateMetadata
    [category]/page-client.tsx     -- Client module loader by category slug
  compare/page.tsx
components/
  page/                   -- Category page modules (sorting.tsx, searching.tsx, etc.)
  ui/                     -- Design system primitives (Button, Slider, Select, Kbd, Card, etc.)
    index.ts
  layout/                 -- Sidebar, Header, CommandPalette, StatusBar, MobileSheet
    index.ts
  visualizers/
    sorting/              -- SortingCanvas, SortingControls
    searching/
    data-structures/      -- TreeRenderer, StackRenderer, REPL, etc.
    string/
    pathfinding/          -- GridCanvas, GridControls
    graph/                -- GraphEditor, GraphControls
    dp/                   -- DPTable, DependencyArrows
    geometry/             -- GeometryCanvas
    ai/                   -- ScatterPlot, DecisionOverlay
    optimization/
    numerical/
    games/                -- TicTacToeBoard, SudokuGrid, ChessBoard, etc.
    fractals/             -- FractalCanvas
    os/                   -- GanttChart, PageFrames, DiskArm
    crypto/               -- KeyExchange, CipherWheel, HashCompare
    shared/               -- PlayerControls, AlgorithmPicker, ComplexityBadge, CodePanel,
                             VariableWatchPanel, CallStackPanel, PostRunSummary
      index.ts
lib/
  algorithm-entries.ts    -- flat list of all algorithms for command palette & deep links
  algorithms/             -- pure TS generators per algorithm
  categories.ts           -- category metadata (slug, label, icon, count, color)
  engine/                 -- StepEngine + xstate machines
  utils/
    cn.ts                 -- clsx + tailwind-merge helper
    highlighter.ts        -- shiki singleton (lazy-loaded, cached)
    index.ts
  workers/                -- Web Worker entry files + Comlink wrappers
hooks/
  use-visualizer.ts       -- orchestrates engine + store
  use-keyboard.ts         -- global hotkeys registration
  use-sound.ts            -- Web Audio oscillator hook
  index.ts
stores/
  visualizer-store.ts     -- play state, speed, current step, algorithm selection
  ui-store.ts             -- sidebar open, command palette open, theme, sound, vim mode
  index.ts
providers/
  theme-provider.tsx      -- next-themes wrapper
  index.ts
types/
  index.ts                -- AlgorithmStep, AlgorithmMeta, VisualizerState, step data shapes, etc.
public/
  og.png                  -- OG image
```

## SEO & Metadata

- Base metadata template in `app/layout.tsx`: title template `"%s | Algoviz"`, default title, description, openGraph defaults.
- Category routes use `app/(visualizer)/[category]/page.tsx` `generateMetadata` with per-category metadata map.
- Every non-category route page MUST export `metadata` (static) or `generateMetadata` (dynamic) that merges with the template.
- `app/robots.ts` and `app/sitemap.ts` are established in Phase 0 and expanded as routes are added.
- JSON-LD structured data for educational content added in Phase 16 polish.

## PWA

- Uses `@ducanh2912/next-pwa` for service worker generation and offline caching.
- Manifest is generated dynamically in `app/manifest.ts` (must export `dynamic = "force-static"` for `output: "export"`).
- Service worker is output to `public/sw.js` (git-ignored along with `workbox-*.js` and related files).
- PWA is disabled in development (`process.env.NODE_ENV === "development"`).
- Config lives in `next.config.ts` via the `withPWA()` wrapper.

## Algorithm Registry

- `lib/algorithm-entries.ts` contains the flat `ALGORITHM_ENTRIES` array used by the command palette and deep links.
- When adding a new algorithm, add an entry here in addition to the generator and meta registration.
- The `algorithmId` field enables `/<category>?algo=<id>` deep-link navigation.
