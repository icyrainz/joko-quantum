# JokoQuantum

A visual quantum circuit simulator for learning quantum computing. Build circuits by dragging gates, step through execution, and watch quantum states evolve in real time.

**Live:** [jokoquantum.com](https://jokoquantum.com)

## Features

- **Drag-and-drop circuit editor** — place gates on a canvas with 1–3 qubits
- **9 quantum gates** — H, X, Y, Z, S, T, CNOT, SWAP, and Measurement
- **State vector simulation** — accurate 2^n amplitude calculation with complex arithmetic
- **State visualization** — probability bars, phase coloring, Bloch sphere, and Dirac ket notation
- **Playback controls** — play, step forward/back, reset, adjustable speed (0.5x–3x)
- **9 interactive tutorials** (92 steps total) — from classical bits to the GHZ theorem
- **Persistent progress** — circuits and lesson progress saved to localStorage

## Tutorials

| # | Lesson | Duration |
|---|--------|----------|
| 1 | Classical vs Quantum Bits | 15 min |
| 2 | Hadamard Gate & Superposition | 20 min |
| 3 | Phase & Z Gate Family | 18 min |
| 4 | Two Qubits & Entanglement | 25 min |
| 5 | Quantum Teleportation | 30 min |
| 6 | Measurement & the Born Rule | 20 min |
| 7 | Superdense Coding | 22 min |
| 8 | Deutsch's Algorithm | 25 min |
| 9 | GHZ State & Three-Qubit Entanglement | 22 min |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Lint with ESLint |

## Tech Stack

- **React 19** + **TypeScript** — UI
- **Vite 7** — build tooling
- **Konva** / **react-konva** — canvas rendering for circuits
- **Vitest** — testing
- **Vercel** — hosting and analytics

## Project Structure

```
src/
├── engine/          # Quantum simulation (complex math, gates, state vectors, circuit execution)
├── components/      # React UI (GatePalette, CircuitCanvas, StateInspector, BlochSphere, etc.)
├── lessons/         # Tutorial content and lesson loader
└── types.ts         # Shared TypeScript types
```

## License

MIT
