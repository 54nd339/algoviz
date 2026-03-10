# Future Ideas

Deferred features from Phase 16 polish. These can be picked up in future sessions as time permits.

## Educational / Gamification

### Challenge / Predict-the-Next-Step Mode
- Toggle-able mode that pauses visualization at random intervals
- Shows 2-3 options: "Which elements are compared next?" / "Which cell does BFS visit next?"
- Correct: green flash + streak counter. Wrong: red flash + explanation
- Streak counter persisted in localStorage

### Bug Hunter / Wrong Implementation
- Shows broken code (off-by-one, wrong comparison, missing base case)
- Visualization runs showing incorrect behavior
- User identifies bug from multiple choice: "Which line is wrong?"
- Curated content: 2-3 broken variants per major algorithm

### Progress Tracker
- localStorage tracks which algorithms user has "explored" (ran at least once)
- Landing page: progress ring per category (e.g., "Sorting: 7/10")
- Overall progress: "42/100 algorithms explored"

### Skill Tree / Prerequisite Graph
- `/learn` route with @xyflow rendering of algorithm dependency tree
- Nodes colored by explored/not-explored
- Click node to navigate to visualizer

### Code Trace Table
- Table view accumulating all steps alongside variable watch
- Columns: step#, variable1, variable2, ...
- Auto-generated from `step.variables` history
- Exportable as CSV

### Asymptotic Notation Playground
- Mini-tool on `/compare` page
- Input: `3n^2 + 2n + 1`, plot each term + total on visx chart
- Drag slider for n (1-10000 log scale)
- Shows Big-O simplification result

### Space Complexity Visualizer
- Side panel showing a memory bar
- Grows/shrinks as algorithm allocates/deallocates
- Labels: "Auxiliary array: 50 elements (200 bytes)"

## Creative / Visual

### Fingerprint Gallery (`app/gallery/page.tsx`)
- Grid of algorithm fingerprint art (generated from execution traces)
- Patterns: access indices -> x/y coordinates, operation types -> colors
- Downloadable as PNG

### Animated Route Transitions
- Framer-motion `AnimatePresence` on layout level
- Page fades/slides out, new page fades/slides in

### Diff Two Runs
- In race mode: run same algorithm on different inputs side-by-side
- Highlights where execution diverges

### Battle Royale
- Bracket tournament mode for sorting
- 8 algorithms seeded, each round two race, winner advances
- Animated bracket filling in

### Pseudocode Diff
- In race mode: side-by-side code panels with highlighted differences

## Stretch

### Custom Algorithm Editor
- User writes their own algorithm generator in a code editor
- Runs in a sandboxed Web Worker

### Semantic Zoom
- Zoom out: overview of all steps as a heat map
- Zoom in: detailed step-by-step view
- Continuous zoom transition

### ASCII Art Mode
- Render algorithm visualizations as ASCII art in a terminal-style view
