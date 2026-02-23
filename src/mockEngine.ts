/**
 * mockEngine.ts
 *
 * Stub implementation of the quantum circuit executor.
 * This file is coded against the same interface as the real engine
 * (which will live in src/engine/) and will be swapped out once
 * that agent delivers the real implementation.
 *
 * The real engine is expected to export a function with this signature:
 *   executeCircuit(circuit: Circuit): ExecutionStep[]
 */

import type { Circuit, ExecutionStep, Complex } from './types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mag(c: Complex): number {
  return Math.sqrt(c.re * c.re + c.im * c.im);
}

/** Create a normalised state vector with `dim` entries seeded by a value. */
function makeState(dim: number, seed: number): Complex[] {
  const raw: Complex[] = Array.from({ length: dim }, (_, i) => ({
    re: Math.cos(seed * (i + 1) * 0.9),
    im: Math.sin(seed * (i + 1) * 0.7),
  }));

  // Normalise so sum of |amp|² == 1
  const norm = Math.sqrt(raw.reduce((acc, c) => acc + mag(c) ** 2, 0));
  return raw.map(c => ({ re: c.re / norm, im: c.im / norm }));
}

/** Ground state |00…0⟩ */
function groundState(dim: number): Complex[] {
  return Array.from({ length: dim }, (_, i) =>
    i === 0 ? { re: 1, im: 0 } : { re: 0, im: 0 },
  );
}

// ---------------------------------------------------------------------------
// Public API (mirrors the real engine interface)
// ---------------------------------------------------------------------------

/**
 * Execute a circuit and return per-column execution steps with state vectors.
 *
 * This is a MOCK implementation that returns plausible-looking but mathematically
 * fake state vectors. Replace this with a real call to src/engine/ when ready.
 */
export function mockExecuteCircuit(circuit: Circuit): ExecutionStep[] {
  const dim = 2 ** circuit.numQubits;

  // Collect unique, sorted columns that have gates
  const columns = Array.from(
    new Set(circuit.gates.map(g => g.column)),
  ).sort((a, b) => a - b);

  if (columns.length === 0) {
    return [];
  }

  const steps: ExecutionStep[] = [];
  let stateBefore: Complex[] = groundState(dim);

  for (let ci = 0; ci < columns.length; ci++) {
    const col = columns[ci];
    // Fake a "post-gate" state by seeding with column index
    const stateAfter = makeState(dim, col + 1 + ci * 0.3);

    steps.push({ column: col, stateBefore, stateAfter });

    stateBefore = stateAfter;
  }

  return steps;
}

// ---------------------------------------------------------------------------
// When the real engine is ready, replace the body above with:
//
//   import { executeCircuit } from './engine/index';
//   export { executeCircuit as mockExecuteCircuit };
// ---------------------------------------------------------------------------
