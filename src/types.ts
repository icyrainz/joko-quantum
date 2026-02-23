export interface Complex { re: number; im: number }

export interface GateDefinition {
  gateId: string;
  name: string;
  symbol: string;
  numQubits: number;
  description: string;
  color: string;
}

export interface CircuitGate {
  id: string;
  gateId: string; // "H", "X", "CNOT", etc.
  targetQubits: number[];
  column: number;
}

export interface Circuit {
  numQubits: number;
  gates: CircuitGate[];
}

export interface ExecutionStep {
  column: number;
  stateBefore: Complex[];
  stateAfter: Complex[];
}

export const GATE_CATALOG: GateDefinition[] = [
  { gateId: "H", name: "Hadamard", symbol: "H", numQubits: 1, description: "Creates superposition", color: "#4FC3F7" },
  { gateId: "X", name: "Pauli-X", symbol: "X", numQubits: 1, description: "Bit flip (NOT)", color: "#EF5350" },
  { gateId: "Y", name: "Pauli-Y", symbol: "Y", numQubits: 1, description: "Bit + phase flip", color: "#AB47BC" },
  { gateId: "Z", name: "Pauli-Z", symbol: "Z", numQubits: 1, description: "Phase flip", color: "#66BB6A" },
  { gateId: "S", name: "S Gate", symbol: "S", numQubits: 1, description: "π/2 phase", color: "#FFA726" },
  { gateId: "T", name: "T Gate", symbol: "T", numQubits: 1, description: "π/4 phase", color: "#EC407A" },
  { gateId: "CNOT", name: "CNOT", symbol: "CX", numQubits: 2, description: "Controlled NOT", color: "#5C6BC0" },
  { gateId: "SWAP", name: "SWAP", symbol: "SW", numQubits: 2, description: "Swap qubits", color: "#26A69A" },
];
