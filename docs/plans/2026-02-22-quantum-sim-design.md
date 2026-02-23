# QuantumFlow — Visual Quantum Circuit Simulator

**Date:** 2026-02-22
**Status:** Approved

## Goal

Build a web-based quantum computing simulator that visualizes qubit states flowing through circuits, inspired by Minecraft redstone. The primary purpose is education — a complete beginner should learn quantum computing by building and watching circuits run.

## Constraints

- 1-3 qubits (keeps visualization clear, state space manageable)
- Web browser (React + TypeScript, Vite build)
- Canvas-based rendering (Konva.js / react-konva)
- No backend — everything runs client-side

## Architecture

```
┌─────────────────────────────────────────────────┐
│  React App Shell (TypeScript)                   │
│  ┌───────────┐ ┌─────────────┐ ┌─────────────┐ │
│  │ Gate      │ │ Circuit     │ │ State        │ │
│  │ Palette   │ │ Canvas      │ │ Inspector    │ │
│  │ (sidebar) │ │ (Konva.js)  │ │ (bar chart)  │ │
│  └───────────┘ └─────────────┘ └─────────────┘ │
│  ┌─────────────────────────────────────────────┐ │
│  │ Playback Controls (step / play / reset)     │ │
│  └─────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────┐ │
│  │ Quantum Engine (pure TS, no UI)             │ │
│  │ - State vector math (complex numbers)       │ │
│  │ - Gate matrices (H, X, Y, Z, CNOT, etc.)   │ │
│  │ - Step-by-step execution                    │ │
│  └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

## Core Components

### 1. Quantum Engine (pure TypeScript, no dependencies)

The math core. Completely decoupled from UI.

- **Complex number type:** `{ re: number, im: number }` with add, multiply, magnitude, conjugate
- **State vector:** array of complex amplitudes, length 2^n for n qubits
- **Gate representation:** unitary matrices (2x2 for single-qubit, 4x4 for two-qubit)
- **Core function:** `applyGate(stateVector, gateMatrix, targetQubitIndices) → newStateVector`
  - Uses tensor product to expand single-qubit gates to full state space
  - For multi-qubit gates (CNOT), constructs the full operator via tensor products and permutations
- **Step-by-step execution:** circuit is a list of "columns" (gates applied simultaneously). Execute one column at a time, returning intermediate state vectors for animation.
- **Measurement:** collapse state vector probabilistically, return classical result

### 2. Circuit Canvas (react-konva)

The main interactive area where users build circuits.

- **Grid layout:** rows = qubit wires (horizontal lines), columns = time steps
- **Wire rendering:** horizontal lines with subtle glow, labeled |0⟩ at the left
- **Gate rendering:** rounded rectangles with gate symbol (H, X, Z, etc.) snapped to grid cells
- **Multi-qubit gates:** CNOT shown as control dot (●) on control qubit connected by vertical line to target (⊕)
- **Drag-and-drop:** gates dragged from palette onto grid cells. Snap to nearest valid cell. Highlight valid drop zones.
- **Right-click/long-press:** remove a gate from the circuit
- **Qubit count:** buttons to add/remove qubit wires (1-3 range)

### 3. Flow Animation (the "redstone" part)

The signature visual feature. When "Play" is clicked:

- **Glowing particles** travel along wires from left to right
- **At each gate column:**
  - Particles pause at the gate
  - Gate visually activates (glow pulse, slight scale animation)
  - State vector is recalculated
  - Particles continue with updated visual encoding
- **Visual encoding of quantum state:**
  - **Brightness/size** of particle on each wire = probability of that qubit being |1⟩
  - **Superposition:** particle appears on the wire as a split/dual-stream (bright + dim streams overlapping)
  - **Entanglement:** particles on entangled wires pulse in sync, connected by a subtle glowing arc
  - **Phase:** optional color hue shift (advanced, can be toggled)
- **Between gates:** particles smoothly interpolate along the wire with a trailing glow effect
- **Speed:** configurable via a slider (0.5x to 3x)

### 4. State Inspector (React + mini canvas)

Shows the mathematical state alongside the visual animation.

- **Bar chart** of probabilities for each basis state (|00⟩, |01⟩, |10⟩, |11⟩)
- **Updates in real-time** as animation passes through each gate
- **Phase display:** color of each bar encodes the phase angle (hue wheel mapping)
- **Ket notation:** text display of the state vector in Dirac notation, e.g. `(1/√2)|00⟩ + (1/√2)|11⟩`
- **Highlights:** the basis states with non-zero amplitude glow when the animation reaches a new gate

### 5. Gate Palette (React sidebar)

- **Gate list** with icon, name, and one-line description
- **Tooltip on hover:** explains what the gate does in plain English with the matrix shown
- **Drag handle:** grab a gate to place it on the circuit
- **Categories:** Single-qubit gates, Multi-qubit gates

### 6. Playback Controls

- **Step:** advance one gate column, animate that step only
- **Play/Pause:** auto-advance through all steps with animation
- **Reset:** return circuit to initial state |00...0⟩, particles back to start
- **Speed slider:** control animation speed

## Supported Gates (v1)

| Gate | Qubits | Matrix | Description |
|------|--------|--------|-------------|
| H (Hadamard) | 1 | `1/√2 [[1,1],[1,-1]]` | Creates equal superposition |
| X (Pauli-X) | 1 | `[[0,1],[1,0]]` | Bit flip (quantum NOT) |
| Y (Pauli-Y) | 1 | `[[0,-i],[i,0]]` | Bit + phase flip |
| Z (Pauli-Z) | 1 | `[[1,0],[0,-1]]` | Phase flip |
| S | 1 | `[[1,0],[0,i]]` | π/2 phase gate |
| T | 1 | `[[1,0],[0,e^(iπ/4)]]` | π/4 phase gate |
| CNOT | 2 | 4x4 identity with swapped |10⟩↔|11⟩ | Controlled-NOT, creates entanglement |
| SWAP | 2 | 4x4 permutation | Swap two qubits |

## Tech Stack

- **React 18** + **TypeScript 5**
- **Vite** for dev server and build
- **react-konva** + **konva** for canvas rendering and animation
- **No other major dependencies** — quantum math is hand-written (tiny for 1-3 qubits)
- CSS modules or Tailwind for styling the shell UI

## Implementation Plan

### Phase 1: Foundation
1. Scaffold Vite + React + TypeScript project
2. Build the quantum engine (complex math, state vectors, gate application)
3. Write unit tests for the quantum engine (known circuits with known outputs)

### Phase 2: Circuit Builder UI
4. Create the app layout (sidebar, canvas area, inspector panel, controls bar)
5. Implement the circuit canvas with grid, qubit wires, and gate rendering
6. Implement drag-and-drop from palette to canvas
7. Gate removal (right-click or delete key)

### Phase 3: State Visualization
8. Build the state inspector bar chart
9. Connect circuit → engine: when circuit changes, recalculate full state and update inspector
10. Add ket notation display

### Phase 4: Flow Animation
11. Implement particle animation along wires (basic left-to-right flow)
12. Add gate activation animation (glow/pulse on arrival)
13. Implement superposition visual (split streams, brightness encoding)
14. Implement entanglement visual (synced pulses, connecting arcs)
15. Add playback controls (step, play/pause, reset, speed)

### Phase 5: Tutorial System
16. Build tutorial panel component (collapsible, context-sensitive)
17. Write Lesson 1 content: Classical vs Quantum Bits
18. Write Lesson 2 content: Hadamard Gate and Superposition
19. Write Lesson 3 content: Phase and the Z Gate Family
20. Write Lesson 4 content: Two Qubits and Entanglement
21. Write Lesson 5 content: Quantum Teleportation (capstone)
22. Implement guided lesson flow (spotlight, checkpoints, progress tracking)
23. Add free-play mode toggle (skip/exit tutorials)
24. Gate tooltips with matrix display and plain-English explanations

### Phase 6: Polish
25. Responsive layout, dark theme
26. Preset circuits loadable from lesson menu
27. Save/load circuits to localStorage
28. Add/remove qubit wires (1-3)

## Educational Layer: Interactive Tutorial System

The simulator doubles as a structured learning experience. This is NOT a glossary or tooltip-only approach — it's a guided curriculum built into the app.

### Tutorial Panel

A collapsible right-side panel (or modal) that provides context-sensitive explanations as the user interacts with the simulator. It includes:

- **Concept explanations** written for an intelligent adult beginner — no dumbing down, no skipping nuances
- **Math when it matters** — show the actual matrices and linear algebra, but explain what each number means
- **"Why does this matter?"** sections — connect abstract math to real quantum computing applications
- **"Read more" links** — curated links to high-quality external resources for going deeper

### Guided Lessons (ordered curriculum)

Each lesson walks the user through building a specific circuit, with the tutorial panel providing context at each step.

#### Lesson 1: Classical vs Quantum Bits
- **What you build:** A single wire with no gates → then add an X gate
- **What you learn:**
  - Classical bits: always 0 or 1
  - Qubits: also 0 or 1 when measured, but can be in superposition *between* measurements
  - The state vector: what `[α, β]` means, why |α|² + |β|² = 1
  - The Bloch sphere (conceptual, with a diagram) — but note it only works for 1 qubit
- **Nuances covered:**
  - "Superposition is NOT the qubit being 0 and 1 at the same time" — explain the probability amplitude interpretation
  - Measurement collapses the state — why this is different from classical uncertainty
- **Read more:** Nielsen & Chuang Ch. 1, IBM Quantum Learning "Basics of Quantum Information"

#### Lesson 2: The Hadamard Gate and Superposition
- **What you build:** H gate on a single qubit, observe the state vector change
- **What you learn:**
  - What a quantum gate physically is (unitary transformation)
  - The H matrix: walk through the multiplication `H|0⟩ = (1/√2)|0⟩ + (1/√2)|1⟩`
  - Probability: |1/√2|² = 1/2, so 50% chance of 0, 50% chance of 1
  - Why we need complex numbers (even though H only uses reals)
- **Nuances covered:**
  - Unitary = reversible. Apply H twice and you get back to |0⟩. Show this.
  - This is NOT a random coin flip — the phases are deterministic
- **Read more:** 3Blue1Brown "Quantum Computing" series, Qiskit Textbook Ch. 1

#### Lesson 3: Phase and the Z Gate Family
- **What you build:** H → Z → H on one qubit (shows that Z flips |0⟩ outcome to |1⟩ outcome)
- **What you learn:**
  - Phase: the complex coefficient in front of basis states
  - Z gate doesn't change probabilities but changes the phase
  - Why phase matters: it affects future interference (demonstrate with H→Z→H)
  - S and T gates as "partial" Z rotations
- **Nuances covered:**
  - "Global phase doesn't matter, relative phase does" — explain with examples
  - Connection to wave interference (constructive/destructive)
- **Read more:** Brilliant.org "Quantum Computing" course (phase section), Qiskit Textbook Ch. 2

#### Lesson 4: Two Qubits and Entanglement
- **What you build:** H on qubit 0, then CNOT on qubits 0-1 (Bell state)
- **What you learn:**
  - Tensor product: how two 1-qubit states combine into a 2-qubit state
  - The 4-dimensional state vector: |00⟩, |01⟩, |10⟩, |11⟩
  - CNOT gate: "if control is |1⟩, flip target" — but it works on superpositions!
  - Entanglement: the result CANNOT be written as two separate qubit states
  - Measuring one qubit instantly determines the other
- **Nuances covered:**
  - Entanglement ≠ faster-than-light communication (explain the no-communication theorem briefly)
  - Bell states: all four of them, why they form a basis
  - "Spooky action at a distance" — what Einstein got wrong and right
- **Read more:** Mermin "Quantum Computer Science" Ch. 1, Veritasium "Bell's Theorem" video

#### Lesson 5: Quantum Teleportation (capstone)
- **What you build:** The full quantum teleportation circuit (3 qubits)
- **What you learn:**
  - The teleportation protocol step by step
  - Why it needs classical communication (no FTL!)
  - How measurement + entanglement + classical bits can "move" a quantum state
- **Nuances covered:**
  - "Teleportation" is misleading — it's state transfer, not matter transport
  - The no-cloning theorem: why you can't just copy a qubit
- **Read more:** Original Bennett et al. 1993 paper (accessible), IBM Quantum Lab teleportation tutorial

### Tutorial Content Guidelines

- **Tone:** Knowledgeable adult explaining to a curious adult. No "quantum is weird/spooky!" clickbait framing.
- **Math:** Show it, then explain it. "Here's the matrix multiplication. The top-left entry means..."
- **Analogies:** Use them sparingly and always flag where the analogy breaks down
- **Misconceptions:** Actively address common ones (superposition ≠ "both at once", entanglement ≠ communication)
- **Links:** Every lesson links to 2-3 high-quality external resources (textbooks, Qiskit, 3B1B, papers)

### Implementation Notes

- Tutorial content stored as structured markdown/JSON files, one per lesson
- Tutorial panel highlights relevant UI elements as the user progresses (spotlight effect)
- Each lesson has checkpoints: "Now drag an H gate onto qubit 0" — won't advance until user does it
- Free-play mode available at any time (skip/exit tutorials)
- Lesson progress saved to localStorage

## Example User Flow

1. User sees 2 qubit wires on the canvas
2. Drags an **H gate** onto qubit 0, column 0
3. Drags a **CNOT gate** onto qubits 0-1, column 1
4. Clicks **Play**
5. A glowing particle flows along wire 0, hits H gate → gate pulses, particle splits into two streams (superposition)
6. Both streams hit the CNOT → gate pulses, qubit 1 also gets a stream (entanglement)
7. State inspector shows: |00⟩ = 50%, |11⟩ = 50% — a Bell state
8. User just learned superposition and entanglement visually
