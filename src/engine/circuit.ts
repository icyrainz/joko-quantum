/**
 * Circuit representation and step-by-step execution.
 *
 * A circuit is a list of gates placed at (qubit, column) positions.
 * Gates in the same column are applied simultaneously (in the same step).
 *
 * Execution model:
 *   1. Start with the initial state |00...0⟩.
 *   2. For each column (time step), apply all gates in that column in
 *      parallel — they must act on disjoint sets of qubits.
 *   3. Record the state before and after each column.
 */

import { type Complex } from './complex.ts';
import { type GateDefinition, GATES, applyGate } from './gates.ts';
import { createInitialState, measure } from './stateVector.ts';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CircuitGate {
  /** Identifier matching a key in the GATES catalogue, e.g. "H", "CNOT". */
  gateId: string;
  /**
   * Qubit indices this gate operates on.
   * For single-qubit gates: [targetQubit].
   * For CNOT: [controlQubit, targetQubit].
   */
  targetQubits: number[];
  /** Time step (0-indexed column) in the circuit diagram. */
  column: number;
}

export interface Circuit {
  numQubits: number;
  gates: CircuitGate[];
}

export interface ExecutionStep {
  /** Which column this step corresponds to. */
  column: number;
  /** All gates applied during this step. */
  gatesApplied: CircuitGate[];
  /** State vector immediately before applying these gates. */
  stateBefore: Complex[];
  /** State vector immediately after applying these gates. */
  stateAfter: Complex[];
  /** If any measurements were performed, maps qubit index → outcome (0 or 1). */
  measurementResults?: Record<number, 0 | 1>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Group circuit gates by column.
 *
 * Returns an array indexed by column number.  Columns with no gates are
 * represented as empty arrays.  The array length equals (maxColumn + 1).
 */
export function getColumns(circuit: Circuit): CircuitGate[][] {
  if (circuit.gates.length === 0) return [];

  const maxColumn = Math.max(...circuit.gates.map((g) => g.column));
  const columns: CircuitGate[][] = Array.from({ length: maxColumn + 1 }, () => []);

  for (const gate of circuit.gates) {
    columns[gate.column].push(gate);
  }

  return columns;
}

/**
 * Apply all gates in a single column to the given state.
 *
 * Gates within a column must act on disjoint sets of qubits (no two gates
 * share a qubit).  They are applied left-to-right in the order provided.
 *
 * @param state     Input state vector.
 * @param gates     Gates to apply (all from the same column).
 * @param numQubits Total number of qubits in the system.
 * @returns         New state vector after all gates have been applied.
 */
export function executeStep(
  state: Complex[],
  gates: CircuitGate[],
  numQubits: number,
): { state: Complex[]; measurementResults?: Record<number, 0 | 1> } {
  let currentState = state;
  let measurementResults: Record<number, 0 | 1> | undefined;

  for (const circuitGate of gates) {
    const gateDef: GateDefinition | undefined = GATES[circuitGate.gateId];
    if (!gateDef) {
      throw new Error(`Unknown gate: "${circuitGate.gateId}"`);
    }

    // Validate that the gate arity matches the provided target qubits.
    if (circuitGate.targetQubits.length !== gateDef.numQubits) {
      throw new Error(
        `Gate "${circuitGate.gateId}" expects ${gateDef.numQubits} qubit(s), ` +
          `but ${circuitGate.targetQubits.length} were provided.`,
      );
    }

    // Validate qubit indices are in range.
    for (const q of circuitGate.targetQubits) {
      if (q < 0 || q >= numQubits) {
        throw new RangeError(
          `Qubit index ${q} is out of range for a ${numQubits}-qubit system.`,
        );
      }
    }

    if (gateDef.isNonUnitary) {
      // Handle measurement: use the measure() function from stateVector
      const qubitIndex = circuitGate.targetQubits[0];
      const { result, newState } = measure(currentState, qubitIndex, numQubits);
      currentState = newState;
      if (!measurementResults) measurementResults = {};
      measurementResults[qubitIndex] = result;
    } else {
      currentState = applyGate(currentState, gateDef.matrix, circuitGate.targetQubits, numQubits);
    }
  }

  return { state: currentState, measurementResults };
}

// ---------------------------------------------------------------------------
// Full circuit execution
// ---------------------------------------------------------------------------

/**
 * Execute a complete quantum circuit and return intermediate snapshots.
 *
 * @param circuit The circuit to execute.
 * @returns       An ordered list of execution steps, one per column that
 *                contains at least one gate.  Each step captures the state
 *                before and after the column's gates are applied.
 */
export function executeCircuit(circuit: Circuit): ExecutionStep[] {
  const columns = getColumns(circuit);
  const steps: ExecutionStep[] = [];

  let currentState: Complex[] = createInitialState(circuit.numQubits);

  for (let col = 0; col < columns.length; col++) {
    const columnGates = columns[col];

    // Skip empty columns — no state change, no step recorded.
    if (columnGates.length === 0) continue;

    const stateBefore = currentState.map((amp) => ({ ...amp })); // deep copy
    const result = executeStep(currentState, columnGates, circuit.numQubits);

    steps.push({
      column: col,
      gatesApplied: columnGates,
      stateBefore,
      stateAfter: result.state,
      ...(result.measurementResults ? { measurementResults: result.measurementResults } : {}),
    });

    currentState = result.state;
  }

  return steps;
}
