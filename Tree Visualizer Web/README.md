# 🌳 Tree Visualizer Web

An interactive, animated web application for visualizing **Binary Search Tree (BST)** and **AVL Tree** operations in real time. Built with React 19, TypeScript, D3.js, GSAP, and Zustand.

---

## 📸 Overview

Tree Visualizer Web allows users to insert, delete, search, and traverse tree nodes while watching each algorithmic step unfold through smooth animations. It supports both BST and AVL modes, with a dedicated step-by-step mode for educational use.

---

## ✨ Features

### Tree Operations

| Operation          | Description                                                               |
| ------------------ | ------------------------------------------------------------------------- |
| **Insert**         | Add a node and animate the traversal path to its insertion point          |
| **Delete**         | Remove a node with animated rebalancing (AVL mode)                        |
| **Search**         | Highlight the traversal path to the target node                           |
| **Inorder**        | Animate nodes in sorted Left → Root → Right order                         |
| **Preorder**       | Animate nodes in Root → Left → Right order                                |
| **Postorder**      | Animate nodes in Left → Right → Root order                                |
| **Convert to AVL** | Convert an existing BST into a balanced AVL tree with rotation animations |
| **Random Tree**    | Generate a random BST or AVL tree (9 nodes) for instant demo              |
| **Reset**          | Clear the tree and all state                                              |

### AVL Tree Support

- Full self-balancing on every insert and delete
- Live **Balance Factor** badge on each node (`-1`, `0`, `+1` = balanced; `±2` = rotation triggered)
- Four rotation types animated individually:
  - **LL** — Right Rotate
  - **RR** — Left Rotate
  - **LR** — Left-Right Double Rotate
  - **RL** — Right-Left Double Rotate
- In-app **AVL Rotations Guide** toggle (desktop sidebar)

### Animation System

- Three speed levels: **Slow** (1200ms), **Normal** (600ms), **Fast** (200ms)
- **Step-by-Step Mode** — pause between each algorithmic step; advance manually with `→` or the Next button
- **Pause / Resume** mid-animation
- Previously visited nodes retain a `visited` color trail during traversal

### UI & Interaction

- Dark terminal-style theme (`#0d1117` background, GitHub-inspired palette)
- Subtle dot-grid background on the canvas
- Zoomable and pannable tree canvas (scroll to zoom, drag to pan)
- Keyboard hints displayed on desktop (`scroll to zoom`, `drag to pan`, `→ next step`, `Esc stop`)
- **Operation Log** panel — last 50 messages from the current operation
- **Traversal Output** — live array display updating as each node is visited

### Responsiveness

| Breakpoint                 | Behavior                                                            |
| -------------------------- | ------------------------------------------------------------------- |
| `< 1024px` (Mobile/Tablet) | Floating mobile controls button replaces sidebar                    |
| `≥ 1024px` (Desktop)       | Full split layout: left sidebar + center canvas + bottom info panel |

---

## 🗂️ Project Structure

```
Tree Visualizer Web/
├── src/
│   ├── App.tsx                  ← Root layout: Header, Sidebar, Canvas, InfoPanel, MobileControls
│   ├── core/
│   │   ├── TreeNode.ts          ← Node interface: value, left, right, height, balanceFactor, id
│   │   ├── BST.ts               ← BST logic: insert, delete, search, inorder, preorder, postorder
│   │   └── AVL.ts               ← AVL logic: extends BST + rotations + fromBST() converter + random generators
│   ├── store/
│   │   └── treeStore.ts         ← Zustand global store: all tree state + animation engine
│   ├── components/
│   │   ├── Header.tsx           ← App title + BST/AVL mode toggle
│   │   ├── ControlPanel.tsx     ← Input field + operation buttons + speed selector
│   │   ├── TreeCanvas.tsx       ← D3.js SVG tree rendering + GSAP animations
│   │   ├── InfoPanel.tsx        ← Traversal output array + operation log
│   │   ├── StepOverlay.tsx      ← Floating overlay for step-by-step mode controls
│   │   ├── MobileControls.tsx   ← Floating button + drawer for mobile devices
│   │   └── AVLGuide.tsx         ← Collapsible AVL rotation reference guide
│   └── hooks/
│       └── useKeyboardNav.ts    ← Keyboard shortcuts: → (next step), Esc (stop)
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🧠 Architecture

### State Management — `treeStore.ts` (Zustand)

All application state lives in a single Zustand store. Key state slices:

| State              | Type                     | Description                              |
| ------------------ | ------------------------ | ---------------------------------------- |
| `root`             | `TreeNode \| null`       | Current tree root node                   |
| `mode`             | `'BST' \| 'AVL'`         | Active tree mode                         |
| `animationSteps`   | `AnimationStep[]`        | Computed steps for the current operation |
| `currentStepIndex` | `number`                 | Index of the currently displayed step    |
| `isAnimating`      | `boolean`                | Whether an animation is running          |
| `isPaused`         | `boolean`                | Whether animation is paused              |
| `stepMode`         | `boolean`                | Whether step-by-step mode is active      |
| `highlightedNodes` | `Map<string, NodeState>` | Per-node color state during animation    |
| `traversalOutput`  | `number[]`               | Live traversal result array              |
| `operationLog`     | `string[]`               | Last 50 operation messages               |

**Node States:**

- `default` — no highlight
- `active` — currently being compared/traversed
- `visited` — already passed through
- `found` — target node located
- `balanced` / `unbalanced` — AVL balance indicators

### Animation Engine

The animation engine (`runAnimation`) is a recursive `setTimeout` loop inside `treeStore.ts`:

1. Each operation (insert, delete, search, traversal) produces an array of `AnimationStep` objects from the core BST/AVL logic
2. The engine ticks through steps at the configured speed (200–1200ms per step)
3. Each tick updates `highlightedNodes` in the store, which triggers a re-render in `TreeCanvas`
4. In **Step Mode**, ticking is paused and the user advances manually via `nextStep()`

### Core Algorithms — `src/core/`

- **`TreeNode.ts`** — defines the node structure with a unique `id` per node (used for D3 keying and animation targeting)
- **`BST.ts`** — implements insert, delete, search, and all three traversals. Each method returns both the updated tree and a `steps: TraversalStep[]` array for animation
- **`AVL.ts`** — extends BST with height tracking, balance factor calculation, and all four rotations. Includes:
  - `fromBST(root)` — static method that rebuilds a BST as an AVL tree and returns animation steps for the conversion
  - `generateRandomBST(n)` / `generateRandomAVL(n)` — generates random trees with `n` nodes

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### Installation

```bash
# Clone the repository
git clone https://github.com/MousaAlawad1/DataStructerAndAlgorithm.git

# Navigate to the project folder
cd "DataStructerAndAlgorithm/Tree Visualizer Web"

# Install dependencies
npm install
```

### Development

```bash
npm run dev
```

Opens at `http://localhost:5173`

### Production Build

```bash
npm run build
```

Output is in the `dist/` folder. The project uses `vite-plugin-singlefile` which bundles everything into a single self-contained `index.html` — no server required to serve the build.

### Preview Build

```bash
npm run preview
```

---

## 📦 Tech Stack

| Layer            | Technology             | Version |
| ---------------- | ---------------------- | ------- |
| Framework        | React                  | 19.2.3  |
| Language         | TypeScript             | 5.9.3   |
| Tree Rendering   | D3.js                  | ^7.9.0  |
| Animations       | GSAP                   | ^3.15.0 |
| State Management | Zustand                | ^5.0.12 |
| Styling          | Tailwind CSS           | 4.1.17  |
| Build Tool       | Vite                   | 7.2.4   |
| Bundler Plugin   | vite-plugin-singlefile | 2.3.0   |

---

## ⌨️ Keyboard Shortcuts

| Key               | Action                           |
| ----------------- | -------------------------------- |
| `→` (Arrow Right) | Advance to next step (Step Mode) |
| `Esc`             | Stop current animation           |

---

## 🎨 Color Reference

| Element               | Color     |
| --------------------- | --------- |
| Background            | `#0d1117` |
| Node (default)        | `#1f6feb` |
| Node (active)         | `#f78166` |
| Node (balanced/found) | `#3fb950` |
| Edge lines            | `#30363d` |
| Text                  | `#e6edf3` |

---

## 📄 License

This project is part of the **Data Structures and Algorithms** course repository by [@MousaAlawad1](https://github.com/MousaAlawad1).
