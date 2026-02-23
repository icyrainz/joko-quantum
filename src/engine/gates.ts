/**
 * Quantum gate definitions and the core gate-application routine.
 *
 * Gate matrices follow the convention that qubit indices increase toward
 * the LSB of the basis-state integer (qubit 0 is the MSB).
 *
 * The `applyGate` function uses the "amplitude-permutation" approach:
 * rather than constructing the full 2^n × 2^n operator, it iterates over
 * groups of basis states that share the same values on all qubits *except*
 * the gate's target qubits, and applies the small gate matrix directly to
 * each group.  This is both memory-efficient and numerically clean.
 */

import { type Complex, add, multiply, ZERO, fromPolar } from './complex.ts';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GateDefinition {
  /** Internal identifier, matches the key in GATES. */
  name: string;
  /** Short symbol shown on a circuit diagram, e.g. "H", "X", "⊕". */
  symbol: string;
  /** 1 for single-qubit gates, 2 for two-qubit gates. */
  numQubits: number;
  /** Unitary matrix in row-major order.  Size: 2^numQubits × 2^numQubits. null for non-unitary ops. */
  matrix: Complex[][] | null;
  /** One-sentence plain-English summary. */
  description: string;
  /** Longer explanation suitable for a tutorial tooltip. */
  detailedDescription: string;
  /** True for non-unitary operations like measurement. */
  isNonUnitary?: boolean;
}

// ---------------------------------------------------------------------------
// Helper to build Complex from real/imaginary literals
// ---------------------------------------------------------------------------

function c(re: number, im: number = 0): Complex {
  return { re, im };
}

const INV_SQRT2 = 1 / Math.sqrt(2);

// ---------------------------------------------------------------------------
// Gate matrix definitions
// ---------------------------------------------------------------------------

/** Hadamard gate — creates superposition. */
const H_MATRIX: Complex[][] = [
  [c(INV_SQRT2), c(INV_SQRT2)],
  [c(INV_SQRT2), c(-INV_SQRT2)],
];

/** Pauli-X (bit-flip / NOT) gate. */
const X_MATRIX: Complex[][] = [
  [ZERO, c(1)],
  [c(1), ZERO],
];

/** Pauli-Y gate. */
const Y_MATRIX: Complex[][] = [
  [ZERO, c(0, -1)],
  [c(0, 1), ZERO],
];

/** Pauli-Z (phase-flip) gate. */
const Z_MATRIX: Complex[][] = [
  [c(1), ZERO],
  [ZERO, c(-1)],
];

/** S (phase) gate — applies a 90° phase. */
const S_MATRIX: Complex[][] = [
  [c(1), ZERO],
  [ZERO, c(0, 1)],
];

/** T gate — applies a 45° (π/4) phase. */
const T_MATRIX: Complex[][] = [
  [c(1), ZERO],
  [ZERO, fromPolar(1, Math.PI / 4)], // e^(iπ/4)
];

/**
 * CNOT (Controlled-NOT) gate.
 *
 * Basis order (control ⊗ target): |00⟩, |01⟩, |10⟩, |11⟩
 *   |00⟩ → |00⟩
 *   |01⟩ → |01⟩
 *   |10⟩ → |11⟩
 *   |11⟩ → |10⟩
 */
const CNOT_MATRIX: Complex[][] = [
  [c(1), ZERO, ZERO, ZERO],
  [ZERO, c(1), ZERO, ZERO],
  [ZERO, ZERO, ZERO, c(1)],
  [ZERO, ZERO, c(1), ZERO],
];

/**
 * SWAP gate.
 *
 * Basis order: |00⟩, |01⟩, |10⟩, |11⟩
 *   |00⟩ → |00⟩
 *   |01⟩ → |10⟩
 *   |10⟩ → |01⟩
 *   |11⟩ → |11⟩
 */
const SWAP_MATRIX: Complex[][] = [
  [c(1), ZERO, ZERO, ZERO],
  [ZERO, ZERO, c(1), ZERO],
  [ZERO, c(1), ZERO, ZERO],
  [ZERO, ZERO, ZERO, c(1)],
];

// ---------------------------------------------------------------------------
// Gate catalogue
// ---------------------------------------------------------------------------

export const GATES: Record<string, GateDefinition> = {
  H: {
    name: 'H',
    symbol: 'H',
    numQubits: 1,
    matrix: H_MATRIX,
    description: 'Hadamard — puts a qubit into an equal superposition of |0⟩ and |1⟩.',
    detailedDescription:
      'The Hadamard gate maps |0⟩ to (|0⟩+|1⟩)/√2 and |1⟩ to (|0⟩-|1⟩)/√2. ' +
      'Applying it twice returns the qubit to its original state (H² = I). ' +
      'It is the cornerstone of quantum algorithms because it generates superposition ' +
      'from a classical basis state.',
  },
  X: {
    name: 'X',
    symbol: 'X',
    numQubits: 1,
    matrix: X_MATRIX,
    description: 'Pauli-X (NOT gate) — flips |0⟩ to |1⟩ and vice versa.',
    detailedDescription:
      'The Pauli-X gate is the quantum analogue of a classical NOT gate. ' +
      'It performs a 180° rotation around the X axis of the Bloch sphere, ' +
      'swapping the |0⟩ and |1⟩ amplitudes.',
  },
  Y: {
    name: 'Y',
    symbol: 'Y',
    numQubits: 1,
    matrix: Y_MATRIX,
    description: 'Pauli-Y — bit-flip combined with a phase rotation.',
    detailedDescription:
      'The Pauli-Y gate rotates 180° around the Y axis of the Bloch sphere. ' +
      'It maps |0⟩ to i|1⟩ and |1⟩ to -i|0⟩, combining a bit-flip with an ' +
      'imaginary phase factor.',
  },
  Z: {
    name: 'Z',
    symbol: 'Z',
    numQubits: 1,
    matrix: Z_MATRIX,
    description: 'Pauli-Z (phase-flip) — leaves |0⟩ unchanged and negates |1⟩.',
    detailedDescription:
      'The Pauli-Z gate performs a 180° rotation around the Z axis of the Bloch sphere. ' +
      'It applies a relative phase of -1 to the |1⟩ component, leaving |0⟩ untouched. ' +
      'Z = HXH, so it is the Hadamard-conjugate of the X gate.',
  },
  S: {
    name: 'S',
    symbol: 'S',
    numQubits: 1,
    matrix: S_MATRIX,
    description: 'S (phase) gate — applies a 90° phase shift to |1⟩.',
    detailedDescription:
      'The S gate is the square root of Z (S² = Z). It leaves |0⟩ unchanged ' +
      'and multiplies the |1⟩ amplitude by i (a 90° counter-clockwise rotation ' +
      'in the complex plane). It is used to prepare the Y basis.',
  },
  T: {
    name: 'T',
    symbol: 'T',
    numQubits: 1,
    matrix: T_MATRIX,
    description: 'T gate — applies a 45° (π/4) phase shift to |1⟩.',
    detailedDescription:
      'The T gate is the fourth root of Z (T⁴ = Z, T² = S). It multiplies the ' +
      '|1⟩ amplitude by e^(iπ/4). Together with H and CNOT, it forms a ' +
      'universal gate set for quantum computing.',
  },
  CNOT: {
    name: 'CNOT',
    symbol: '⊕',
    numQubits: 2,
    matrix: CNOT_MATRIX,
    description: 'CNOT — flips the target qubit when the control qubit is |1⟩.',
    detailedDescription:
      'The Controlled-NOT (CNOT) gate is the most important two-qubit gate. ' +
      'It applies a Pauli-X to the target qubit conditioned on the control qubit ' +
      'being in state |1⟩. Combined with single-qubit gates it can entangle qubits, ' +
      'producing states like the Bell states.',
  },
  SWAP: {
    name: 'SWAP',
    symbol: '×',
    numQubits: 2,
    matrix: SWAP_MATRIX,
    description: 'SWAP — exchanges the states of two qubits.',
    detailedDescription:
      'The SWAP gate exchanges the quantum states of two qubits. ' +
      'It can be decomposed into three CNOT gates and is used in quantum circuit ' +
      'routing to move qubit states when direct two-qubit interactions are not available.',
  },
  M: {
    name: 'M',
    symbol: 'M',
    numQubits: 1,
    matrix: null,
    description: 'Measure — collapses the qubit to |0⟩ or |1⟩ probabilistically.',
    detailedDescription:
      'Measurement projects the qubit onto the computational basis. ' +
      'The outcome is probabilistic: P(0) = |α|², P(1) = |β|². ' +
      'After measurement the qubit is in a definite classical state. ' +
      'This is a non-unitary operation.',
    isNonUnitary: true,
  },
};

// ---------------------------------------------------------------------------
// Core gate application
// ---------------------------------------------------------------------------

/**
 * Apply a unitary gate matrix to a quantum state vector.
 *
 * Algorithm ("amplitude grouping"):
 *
 * Given an n-qubit state and a k-qubit gate acting on `targetQubits`:
 *   - k = 1 or 2 in practice (the gate matrix is 2^k × 2^k)
 *   - There are 2^k amplitudes that the gate mixes together; they differ only
 *     in the bits corresponding to `targetQubits` and agree on all others.
 *   - We iterate over all (n-k)-qubit "context" patterns, extract the 2^k
 *     amplitudes, apply the gate matrix, and write back the results.
 *
 * Bit-index convention: qubit 0 is the most-significant bit of the
 * integer basis-state index.
 *
 * @param state        Current state vector (length 2^numQubits).
 * @param gate         Unitary matrix (2^k × 2^k, row-major).
 * @param targetQubits Indices of qubits the gate acts on (length k).
 * @param numQubits    Total number of qubits in the system.
 * @returns            New state vector after applying the gate.
 */
export function applyGate(
  state: Complex[],
  gate: Complex[][] | null,
  targetQubits: number[],
  numQubits: number,
): Complex[] {
  if (!gate) {
    throw new Error('Cannot apply a gate with no matrix (non-unitary operation).');
  }

  const totalStates = 1 << numQubits; // 2^numQubits
  const k = targetQubits.length;       // gate qubit count
  const gateSize = 1 << k;             // 2^k

  if (gate.length !== gateSize || gate.some((row) => row.length !== gateSize)) {
    throw new Error(
      `Gate matrix size ${gate.length}×${gate[0]?.length} does not match ` +
        `targetQubits count ${k} (expected ${gateSize}×${gateSize})`,
    );
  }

  // Convert qubit indices to bit-positions in the integer state index.
  // Qubit q corresponds to bit (numQubits - 1 - q).
  const bitPositions = targetQubits.map((q) => numQubits - 1 - q);

  // Build a bitmask covering all targeted bits.
  const targetMask = bitPositions.reduce((mask, pos) => mask | (1 << pos), 0);

  // Pre-compute: for gate-sub-index j (0..gateSize-1), what integer
  // offset does it contribute to the state index?
  // We map bit j of the gate sub-index to the appropriate bit in bitPositions.
  // Gate sub-index bit 0 → bitPositions[k-1] (LSB of gate = last target qubit)
  // Gate sub-index bit k-1 → bitPositions[0]  (MSB of gate = first target qubit)
  function subIndexToStateBits(subIdx: number): number {
    let bits = 0;
    for (let b = 0; b < k; b++) {
      // bit b of subIdx maps to bitPositions[k-1-b]
      if ((subIdx >> b) & 1) {
        bits |= 1 << bitPositions[k - 1 - b];
      }
    }
    return bits;
  }

  // Build lookup: gate sub-index → contribution to state integer
  const subIndexBits = Array.from({ length: gateSize }, (_, j) => subIndexToStateBits(j));

  const newState: Complex[] = state.map(() => ({ re: 0, im: 0 }));

  // Iterate over all non-target bit patterns (the "context").
  // We do this by iterating over ALL totalStates indices and skipping those
  // where the target bits are not all zero, so we process each group exactly once.
  for (let base = 0; base < totalStates; base++) {
    // Only process states where all target bits are 0 (start of each group).
    if ((base & targetMask) !== 0) continue;

    // Gather the 2^k amplitudes in this group.
    const amps: Complex[] = subIndexBits.map((bits) => state[base | bits]);

    // Apply the gate matrix: newAmp[row] = sum_col( gate[row][col] * amps[col] )
    for (let row = 0; row < gateSize; row++) {
      let acc: Complex = ZERO;
      for (let col = 0; col < gateSize; col++) {
        acc = add(acc, multiply(gate[row][col], amps[col]));
      }
      newState[base | subIndexBits[row]] = acc;
    }
  }

  return newState;
}
