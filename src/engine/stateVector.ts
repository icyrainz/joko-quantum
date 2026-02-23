/**
 * Quantum state vector operations.
 *
 * A state vector for n qubits is an array of 2^n complex amplitudes.
 * Index i corresponds to the computational basis state whose binary
 * representation is i (most-significant bit = qubit 0).
 *
 * Example (2 qubits):
 *   index 0 → |00⟩
 *   index 1 → |01⟩
 *   index 2 → |10⟩
 *   index 3 → |11⟩
 */

import { type Complex, ZERO, magnitudeSquared, scale } from './complex.ts';

// ---------------------------------------------------------------------------
// Initialisation
// ---------------------------------------------------------------------------

/**
 * Create the all-zeros computational basis state |00...0⟩.
 *
 * The returned array has length 2^numQubits.  Only the first element
 * (index 0, the |00...0⟩ basis state) is set to amplitude 1; all others
 * are 0.
 */
export function createInitialState(numQubits: number): Complex[] {
  if (numQubits < 1) {
    throw new RangeError(`numQubits must be >= 1, got ${numQubits}`);
  }
  const size = 1 << numQubits; // 2^numQubits
  const state: Complex[] = new Array<Complex>(size).fill(ZERO).map(() => ({ re: 0, im: 0 }));
  state[0] = { re: 1, im: 0 }; // |00...0⟩ has amplitude 1
  return state;
}

// ---------------------------------------------------------------------------
// Measurement probabilities
// ---------------------------------------------------------------------------

/**
 * Compute the probability of each basis state: P(|i⟩) = |amplitude_i|².
 *
 * The returned array has the same length as `state`.
 */
export function getProbabilities(state: Complex[]): number[] {
  return state.map(magnitudeSquared);
}

/**
 * Probability of measuring qubit `qubitIndex` in the |1⟩ state,
 * marginalised over all other qubits.
 *
 * We sum |amplitude_i|² for all basis-state indices where the bit at
 * position `qubitIndex` (MSB = qubit 0) is 1.
 */
export function getQubitProbability(
  state: Complex[],
  qubitIndex: number,
  numQubits: number,
): number {
  const size = 1 << numQubits;
  // The bit position in the integer index: qubit 0 is the most-significant bit.
  const bitPosition = numQubits - 1 - qubitIndex;
  let prob = 0;
  for (let i = 0; i < size; i++) {
    if ((i >> bitPosition) & 1) {
      prob += magnitudeSquared(state[i]);
    }
  }
  return prob;
}

// ---------------------------------------------------------------------------
// Dirac notation
// ---------------------------------------------------------------------------

/**
 * Represent the state vector as a Dirac ket string.
 *
 * Terms with amplitude close to zero are omitted.
 * Example: "(0.7071)|00⟩ + (0.7071)|11⟩"
 */
export function formatKet(state: Complex[], numQubits: number): string {
  const EPSILON = 1e-9;
  const terms: string[] = [];

  for (let i = 0; i < state.length; i++) {
    const amp = state[i];
    if (magnitudeSquared(amp) < EPSILON) continue;

    // Binary label padded to numQubits bits
    const label = i.toString(2).padStart(numQubits, '0');
    const re = parseFloat(amp.re.toFixed(4));
    const im = parseFloat(amp.im.toFixed(4));

    let ampStr: string;
    if (im === 0) {
      ampStr = `${re}`;
    } else if (re === 0) {
      ampStr = `${im}i`;
    } else {
      const sign = im < 0 ? '-' : '+';
      ampStr = `${re}${sign}${Math.abs(im)}i`;
    }

    terms.push(`(${ampStr})|${label}⟩`);
  }

  return terms.length === 0 ? '0' : terms.join(' + ');
}

// ---------------------------------------------------------------------------
// Measurement / collapse
// ---------------------------------------------------------------------------

/**
 * Perform a projective measurement of qubit `qubitIndex`.
 *
 * 1. Calculate P(result=1) for the chosen qubit.
 * 2. Sample outcome probabilistically (using Math.random()).
 * 3. Project (collapse) the state to the measured subspace and renormalise.
 *
 * Returns the measurement outcome (0 or 1) and the post-measurement state.
 */
export function measure(
  state: Complex[],
  qubitIndex: number,
  numQubits: number,
): { result: 0 | 1; newState: Complex[] } {
  const prob1 = getQubitProbability(state, qubitIndex, numQubits);
  const result: 0 | 1 = Math.random() < prob1 ? 1 : 0;

  const bitPosition = numQubits - 1 - qubitIndex;
  const keepBit = result; // 1 or 0
  const size = 1 << numQubits;

  // Zero out amplitudes inconsistent with the measurement outcome.
  const newState: Complex[] = state.map((amp, i) => {
    const bit = (i >> bitPosition) & 1;
    return bit === keepBit ? { ...amp } : { re: 0, im: 0 };
  });

  // Renormalise so total probability = 1.
  const norm = Math.sqrt(result === 1 ? prob1 : 1 - prob1);
  if (norm > 1e-12) {
    for (let i = 0; i < size; i++) {
      newState[i] = scale(newState[i], 1 / norm);
    }
  }

  return { result, newState };
}
