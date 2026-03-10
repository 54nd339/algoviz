# Algoviz

Interactive algorithm visualizer built with Next.js, React, TypeScript, Zustand, and xstate.

## Features

- 100+ algorithms across 15 categories (sorting, searching, graphs, DP, AI/ML, OS, cryptography, and more)
- Step-by-step execution engine with play/pause, step forward/back, and speed controls
- Category-specific visualizers: bar charts, grids, node-edge graphs, scatter plots, Gantt charts, fractal canvases, and more
- Command palette (`Cmd+K`) with instant search and deep links to individual algorithms
- Algorithm comparison table at `/compare`
- PWA support with offline caching via `@ducanh2912/next-pwa`
- Static export (`output: "export"`) for easy deployment behind any CDN or static host
- Docker-ready with included `Dockerfile` and `nginx.conf`
- Dynamic route metadata, sitemap, and robots.txt generation

## Tech Stack

- **Framework:** Next.js 16 (App Router, static export), React 19, TypeScript (strict)
- **State:** Zustand for UI/app state, xstate v5 for complex flow control (engine lifecycle, game flows)
- **Styling:** Tailwind CSS v4, Radix UI primitives, `next-themes` dark/light mode, `framer-motion` animations
- **Rendering:** HTML Canvas, `@xyflow/react` (graphs), `visx` SVG (plots), DOM + framer-motion (trees/structures)
- **PWA:** `@ducanh2912/next-pwa` with Workbox service worker
- **Keyboard:** `react-hotkeys-hook` global shortcuts, `cmdk` command palette
- **Code Display:** `shiki` syntax highlighter (lazy-loaded)

## Project Structure

```text
app/
  (visualizer)/
    [category]/
      page.tsx              # Dynamic category route + generateMetadata
      page-client.tsx       # Client loader mapping category → page module
  compare/page.tsx          # Side-by-side algorithm comparison
  manifest.ts               # PWA manifest (force-static)
  robots.ts                 # /robots.txt
  sitemap.ts                # /sitemap.xml
  layout.tsx                # Root layout + metadata template
  page.tsx                  # Landing page
components/
  page/                     # Category page modules (sorting.tsx, graph.tsx, ...)
  layout/                   # Sidebar, Header, CommandPalette, StatusBar
  ui/                       # Design system primitives (Button, Slider, Badge, ...)
  visualizers/              # Per-category visualizer components
    shared/                 # PlayerControls, AlgorithmPicker, CodePanel, ...
lib/
  algorithms/               # Pure TS generators per category
  algorithm-entries.ts      # Flat list of all algorithms for command palette & deep links
  categories.ts             # Category metadata (slug, label, icon, count, color)
  engine/                   # StepEngine + xstate machines
  utils/                    # cn(), shiki highlighter singleton
  workers/                  # Web Worker entry files + Comlink wrappers
hooks/                      # useVisualizer, useKeyboard, useSound, ...
stores/                     # Zustand stores (visualizer-store, ui-store)
providers/                  # ThemeProvider (next-themes)
types/                      # AlgorithmStep, AlgorithmMeta, AlgorithmCategory, ...
public/                     # PWA icons, og.png
```

## Getting Started

Prerequisites:

- Node.js 20+
- Bun (recommended) or npm

```bash
bun install
bun dev          # http://localhost:3000
bun run lint
bun run build    # static export to out/
bun start        # serve the static build locally
```

### Docker

```bash
docker build -t algoviz .
docker run -p 8080:80 algoviz
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for coding standards, architecture constraints, and step-by-step guides for adding new algorithms or categories.
