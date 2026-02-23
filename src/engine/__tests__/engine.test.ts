/**
 * Quantum Engine — correctness tests
 *
 * Each test checks a well-known quantum-mechanical identity so that failures
 * immediately point to the faulty math.
 */

import { describe, it, expect } from 'vitest';

import { type Complex, magnitudeSquared, magnitude } from '../complex.ts';
import { createInitialState, getProbabilities, formatKet } from '../stateVector.ts';
import { GATES, applyGate } from '../gates.ts';
import { executeCircuit } from '../circuit.ts';
import type { Circuit } from '../circuit.ts';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const EPSILON = 1e-9;

/** Check that two complex numbers are within floating-point tolerance. */
function complexClose(a: Complex, b: Complex, eps = 1e-9): boolean {
  return Math.abs(a.re - b.re) < eps && Math.abs(a.im - b.im) < eps;
}

/** Sum of all probabilities in a state vector. */
function totalProbability(state: Complex[]): number {
  return state.reduce((sum, amp) => sum + magnitudeSquared(amp), 0);
}

// ---------------------------------------------------------------------------
// 1. H|0⟩ = (1/√2)|0⟩ + (1/√2)|1⟩
// ---------------------------------------------------------------------------

describe('Hadamard on |0⟩', () => {
  it('produces equal superposition', () => {
    const state = createInitialState(1); // |0⟩
    const result = applyGate(state, GATES.H.matrix, [0], 1);

    const INV_SQRT2 = 1 / Math.sqrt(2);
    expect(result).toHaveLength(2);
    expect(result[0].re).toBeCloseTo(INV_SQRT2, 10); // amplitude of |0⟩
    expect(result[0].im).toBeCloseTo(0, 10);
    expect(result[1].re).toBeCloseTo(INV_SQRT2, 10); // amplitude of |1⟩
    expect(result[1].im).toBeCloseTo(0, 10);
  });

  it('probabilities sum to 1', () => {
    const state = createInitialState(1);
    const result = applyGate(state, GATES.H.matrix, [0], 1);
    expect(totalProbability(result)).toBeCloseTo(1, 10);
  });
});

// ---------------------------------------------------------------------------
// 2. X|0⟩ = |1⟩
// ---------------------------------------------------------------------------

describe('Pauli-X on |0⟩', () => {
  it('flips |0⟩ to |1⟩', () => {
    const state = createInitialState(1); // |0⟩
    const result = applyGate(state, GATES.X.matrix, [0], 1);

    // result should be |1⟩: amplitude[0]=0, amplitude[1]=1
    expect(result[0].re).toBeCloseTo(0, 10);
    expect(result[0].im).toBeCloseTo(0, 10);
    expect(result[1].re).toBeCloseTo(1, 10);
    expect(result[1].im).toBeCloseTo(0, 10);
  });

  it('probabilities sum to 1', () => {
    const state = createInitialState(1);
    const result = applyGate(state, GATES.X.matrix, [0], 1);
    expect(totalProbability(result)).toBeCloseTo(1, 10);
  });
});

// ---------------------------------------------------------------------------
// 3. Bell state: H on qubit 0, then CNOT(control=0, target=1)
//    → (1/√2)|00⟩ + (1/√2)|11⟩
// ---------------------------------------------------------------------------

describe('Bell state preparation', () => {
  it('creates |Φ+⟩ = (1/√2)(|00⟩ + |11⟩)', () => {
    const circuit: Circuit = {
      numQubits: 2,
      gates: [
        { gateId: 'H',    targetQubits: [0],    column: 0 },
        { gateId: 'CNOT', targetQubits: [0, 1], column: 1 },
      ],
    };

    const steps = executeCircuit(circuit);
    const finalState = steps[steps.length - 1].stateAfter;

    // Indices: |00⟩=0, |01⟩=1, |10⟩=2, |11⟩=3
    const INV_SQRT2 = 1 / Math.sqrt(2);
    expect(finalState[0].re).toBeCloseTo(INV_SQRT2, 10); // |00⟩
    expect(finalState[1].re).toBeCloseTo(0, 10);          // |01⟩ must be 0
    expect(finalState[2].re).toBeCloseTo(0, 10);          // |10⟩ must be 0
    expect(finalState[3].re).toBeCloseTo(INV_SQRT2, 10); // |11⟩
  });

  it('Bell state is normalised', () => {
    const circuit: Circuit = {
      numQubits: 2,
      gates: [
        { gateId: 'H',    targetQubits: [0],    column: 0 },
        { gateId: 'CNOT', targetQubits: [0, 1], column: 1 },
      ],
    };
    const steps = executeCircuit(circuit);
    const finalState = steps[steps.length - 1].stateAfter;
    expect(totalProbability(finalState)).toBeCloseTo(1, 10);
  });

  it('formatKet shows the Bell state correctly', () => {
    const circuit: Circuit = {
      numQubits: 2,
      gates: [
        { gateId: 'H',    targetQubits: [0],    column: 0 },
        { gateId: 'CNOT', targetQubits: [0, 1], column: 1 },
      ],
    };
    const steps = executeCircuit(circuit);
    const finalState = steps[steps.length - 1].stateAfter;
    const ket = formatKet(finalState, 2);
    // Should mention |00⟩ and |11⟩
    expect(ket).toContain('|00⟩');
    expect(ket).toContain('|11⟩');
    // Should NOT mention |01⟩ or |10⟩ (amplitude ≈ 0)
    expect(ket).not.toContain('|01⟩');
    expect(ket).not.toContain('|10⟩');
  });
});

// ---------------------------------------------------------------------------
// 4. HH|0⟩ = |0⟩  (Hadamard is its own inverse)
// ---------------------------------------------------------------------------

describe('Hadamard is self-inverse', () => {
  it('H²|0⟩ = |0⟩', () => {
    let state = createInitialState(1);
    state = applyGate(state, GATES.H.matrix, [0], 1);
    state = applyGate(state, GATES.H.matrix, [0], 1);

    expect(state[0].re).toBeCloseTo(1, 10);
    expect(state[0].im).toBeCloseTo(0, 10);
    expect(state[1].re).toBeCloseTo(0, 10);
    expect(state[1].im).toBeCloseTo(0, 10);
  });

  it('H²|1⟩ = |1⟩', () => {
    let state = createInitialState(1);
    // Prepare |1⟩ via X
    state = applyGate(state, GATES.X.matrix, [0], 1);
    state = applyGate(state, GATES.H.matrix, [0], 1);
    state = applyGate(state, GATES.H.matrix, [0], 1);

    expect(state[0].re).toBeCloseTo(0, 10);
    expect(state[1].re).toBeCloseTo(1, 10);
  });
});

// ---------------------------------------------------------------------------
// 5. Probabilities always sum to 1
// ---------------------------------------------------------------------------

describe('Probability normalisation after various gates', () => {
  const gateNames = ['H', 'X', 'Y', 'Z', 'S', 'T'] as const;

  for (const name of gateNames) {
    it(`probabilities sum to 1 after ${name}`, () => {
      const state = createInitialState(1);
      const result = applyGate(state, GATES[name].matrix, [0], 1);
      const probs = getProbabilities(result);
      const sum = probs.reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1, 10);
    });
  }

  it('probabilities sum to 1 after CNOT on 2-qubit system', () => {
    let state = createInitialState(2);
    // Put qubit 0 in superposition first
    state = applyGate(state, GATES.H.matrix, [0], 2);
    state = applyGate(state, GATES.CNOT.matrix, [0, 1], 2);
    expect(totalProbability(state)).toBeCloseTo(1, 10);
  });
});

// ---------------------------------------------------------------------------
// 6. SWAP swaps qubit states correctly
// ---------------------------------------------------------------------------

describe('SWAP gate', () => {
  it('SWAP(|10⟩) = |01⟩', () => {
    // Prepare |10⟩: qubit 0 = |1⟩, qubit 1 = |0⟩
    // In 2-qubit basis: |10⟩ is index 2
    let state = createInitialState(2);       // |00⟩
    state = applyGate(state, GATES.X.matrix, [0], 2); // |10⟩

    expect(state[2].re).toBeCloseTo(1, 10); // |10⟩ has amplitude 1 before SWAP

    const swapped = applyGate(state, GATES.SWAP.matrix, [0, 1], 2);

    // After SWAP: |10⟩ → |01⟩, so index 1 should have amplitude 1
    expect(swapped[1].re).toBeCloseTo(1, 10); // |01⟩
    expect(swapped[2].re).toBeCloseTo(0, 10); // |10⟩ should be 0
  });

  it('SWAP(|01⟩) = |10⟩', () => {
    let state = createInitialState(2);       // |00⟩
    state = applyGate(state, GATES.X.matrix, [1], 2); // |01⟩

    expect(state[1].re).toBeCloseTo(1, 10); // |01⟩ before SWAP

    const swapped = applyGate(state, GATES.SWAP.matrix, [0, 1], 2);

    expect(swapped[2].re).toBeCloseTo(1, 10); // |10⟩ after SWAP
    expect(swapped[1].re).toBeCloseTo(0, 10); // |01⟩ should be 0
  });

  it('SWAP²=I — double swap returns to original state', () => {
    let state = createInitialState(2);
    state = applyGate(state, GATES.H.matrix, [0], 2); // superposition on qubit 0

    const original = state.map((a) => ({ ...a }));
    state = applyGate(state, GATES.SWAP.matrix, [0, 1], 2);
    state = applyGate(state, GATES.SWAP.matrix, [0, 1], 2);

    for (let i = 0; i < state.length; i++) {
      expect(complexClose(state[i], original[i])).toBe(true);
    }
  });

  it('SWAP is normalised', () => {
    let state = createInitialState(2);
    state = applyGate(state, GATES.X.matrix, [0], 2);
    const swapped = applyGate(state, GATES.SWAP.matrix, [0, 1], 2);
    expect(totalProbability(swapped)).toBeCloseTo(1, 10);
  });
});

// ---------------------------------------------------------------------------
// 7. Additional correctness checks
// ---------------------------------------------------------------------------

describe('Z gate', () => {
  it('Z|0⟩ = |0⟩ (no phase on ground state)', () => {
    const state = createInitialState(1);
    const result = applyGate(state, GATES.Z.matrix, [0], 1);
    expect(result[0].re).toBeCloseTo(1, 10);
    expect(result[1].re).toBeCloseTo(0, 10);
  });

  it('Z|1⟩ = -|1⟩', () => {
    let state = createInitialState(1);
    state = applyGate(state, GATES.X.matrix, [0], 1); // |1⟩
    const result = applyGate(state, GATES.Z.matrix, [0], 1);
    expect(result[0].re).toBeCloseTo(0, 10);
    expect(result[1].re).toBeCloseTo(-1, 10);
  });
});

describe('CNOT gate', () => {
  it('CNOT|00⟩ = |00⟩ (control=0, no flip)', () => {
    const state = createInitialState(2); // |00⟩
    const result = applyGate(state, GATES.CNOT.matrix, [0, 1], 2);
    expect(result[0].re).toBeCloseTo(1, 10); // |00⟩
    expect(result[1].re).toBeCloseTo(0, 10);
    expect(result[2].re).toBeCloseTo(0, 10);
    expect(result[3].re).toBeCloseTo(0, 10);
  });

  it('CNOT|10⟩ = |11⟩ (control=1, target flipped)', () => {
    // |10⟩ = index 2
    let state = createInitialState(2);
    state = applyGate(state, GATES.X.matrix, [0], 2); // flip qubit 0 → |10⟩
    const result = applyGate(state, GATES.CNOT.matrix, [0, 1], 2);
    expect(result[3].re).toBeCloseTo(1, 10); // |11⟩ = index 3
    expect(result[2].re).toBeCloseTo(0, 10); // |10⟩ = 0
  });
});

describe('Multi-qubit gate on non-zero qubit index', () => {
  it('X on qubit 1 of 2-qubit system flips only qubit 1', () => {
    const state = createInitialState(2); // |00⟩
    const result = applyGate(state, GATES.X.matrix, [1], 2);
    // Should produce |01⟩ (index 1)
    expect(result[0].re).toBeCloseTo(0, 10);
    expect(result[1].re).toBeCloseTo(1, 10);
    expect(result[2].re).toBeCloseTo(0, 10);
    expect(result[3].re).toBeCloseTo(0, 10);
  });

  it('H on qubit 1 of 2-qubit system creates superposition on qubit 1 only', () => {
    const state = createInitialState(2); // |00⟩
    const result = applyGate(state, GATES.H.matrix, [1], 2);
    // Should produce (1/√2)|00⟩ + (1/√2)|01⟩ → indices 0 and 1
    const INV_SQRT2 = 1 / Math.sqrt(2);
    expect(result[0].re).toBeCloseTo(INV_SQRT2, 10);
    expect(result[1].re).toBeCloseTo(INV_SQRT2, 10);
    expect(result[2].re).toBeCloseTo(0, 10);
    expect(result[3].re).toBeCloseTo(0, 10);
  });
});

describe('T gate', () => {
  it('T|0⟩ = |0⟩', () => {
    const state = createInitialState(1);
    const result = applyGate(state, GATES.T.matrix, [0], 1);
    expect(result[0].re).toBeCloseTo(1, 10);
    expect(result[0].im).toBeCloseTo(0, 10);
  });

  it('T|1⟩ has magnitude 1 (T is unitary)', () => {
    let state = createInitialState(1);
    state = applyGate(state, GATES.X.matrix, [0], 1);
    const result = applyGate(state, GATES.T.matrix, [0], 1);
    // amplitude should be e^(iπ/4) which has magnitude 1
    expect(magnitude(result[1])).toBeCloseTo(1, 10);
  });
});

describe('S gate', () => {
  it('S²|1⟩ = Z|1⟩ = -|1⟩', () => {
    let state = createInitialState(1);
    state = applyGate(state, GATES.X.matrix, [0], 1); // |1⟩
    state = applyGate(state, GATES.S.matrix, [0], 1); // S|1⟩ = i|1⟩
    state = applyGate(state, GATES.S.matrix, [0], 1); // S²|1⟩ = -|1⟩
    expect(state[1].re).toBeCloseTo(-1, 10);
    expect(state[1].im).toBeCloseTo(0, 10);
  });
});

describe('createInitialState', () => {
  it('returns a vector of length 2^n', () => {
    for (const n of [1, 2, 3, 4]) {
      expect(createInitialState(n)).toHaveLength(1 << n);
    }
  });

  it('has amplitude 1 at index 0 and 0 elsewhere', () => {
    const state = createInitialState(3);
    expect(state[0].re).toBe(1);
    expect(state[0].im).toBe(0);
    for (let i = 1; i < state.length; i++) {
      expect(state[i].re).toBe(0);
      expect(state[i].im).toBe(0);
    }
  });
});

describe('executeCircuit', () => {
  it('returns one step per non-empty column', () => {
    const circuit: Circuit = {
      numQubits: 1,
      gates: [
        { gateId: 'H', targetQubits: [0], column: 0 },
        { gateId: 'X', targetQubits: [0], column: 1 },
      ],
    };
    const steps = executeCircuit(circuit);
    expect(steps).toHaveLength(2);
    expect(steps[0].column).toBe(0);
    expect(steps[1].column).toBe(1);
  });

  it('stateBefore of step N equals stateAfter of step N-1', () => {
    const circuit: Circuit = {
      numQubits: 1,
      gates: [
        { gateId: 'H', targetQubits: [0], column: 0 },
        { gateId: 'H', targetQubits: [0], column: 1 },
      ],
    };
    const steps = executeCircuit(circuit);
    for (let i = 0; i < steps[1].stateBefore.length; i++) {
      expect(complexClose(steps[1].stateBefore[i], steps[0].stateAfter[i])).toBe(true);
    }
  });

  it('empty circuit returns no steps', () => {
    const circuit: Circuit = { numQubits: 2, gates: [] };
    expect(executeCircuit(circuit)).toHaveLength(0);
  });

  it('gaps in columns are handled — only non-empty columns produce steps', () => {
    const circuit: Circuit = {
      numQubits: 1,
      gates: [
        { gateId: 'H', targetQubits: [0], column: 0 },
        { gateId: 'H', targetQubits: [0], column: 3 }, // skip columns 1 and 2
      ],
    };
    const steps = executeCircuit(circuit);
    expect(steps).toHaveLength(2);
    expect(steps[0].column).toBe(0);
    expect(steps[1].column).toBe(3);
  });
});

describe('EPSILON tolerance: near-zero amplitudes excluded from formatKet', () => {
  it('H²|0⟩ ket is just "(1)|0⟩"', () => {
    let state = createInitialState(1);
    state = applyGate(state, GATES.H.matrix, [0], 1);
    state = applyGate(state, GATES.H.matrix, [0], 1);
    const ket = formatKet(state, 1);
    expect(ket).not.toContain('|1⟩'); // |1⟩ amplitude ≈ 0
    expect(ket).toContain('|0⟩');
  });
});

// Suppress unused-variable lint warning for EPSILON constant used in closure.
void EPSILON;
