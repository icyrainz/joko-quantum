/**
 * JokoQuantum Engine — public API
 *
 * Import everything you need from this single entry point:
 *
 *   import { createInitialState, GATES, applyGate, executeCircuit } from './engine';
 */

// Complex number type and operations
export type { Complex } from './complex.ts';
export {
  ZERO,
  ONE,
  I,
  complex,
  fromPolar,
  add,
  subtract,
  multiply,
  scale,
  conjugate,
  magnitude,
  magnitudeSquared,
  complexToString,
} from './complex.ts';

// State vector operations
export {
  createInitialState,
  getProbabilities,
  getQubitProbability,
  formatKet,
  measure,
} from './stateVector.ts';

// Gate definitions and core application function
export type { GateDefinition } from './gates.ts';
export { GATES, applyGate } from './gates.ts';

// Circuit representation and execution
export type { CircuitGate, Circuit, ExecutionStep } from './circuit.ts';
export { getColumns, executeStep, executeCircuit } from './circuit.ts';
