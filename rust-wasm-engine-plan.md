# Plan: Rust WASM Quantum Simulation Engine

## Context

The quantum simulator's computation engine (`src/engine/`) is already cleanly separated from the React UI — pure functions, zero DOM dependencies, one-way data flow. However, it's JavaScript-limited: performance degrades past ~20 qubits, and there's no path to SIMD/parallelism.

This plan replaces the TS engine with a Rust WASM module for near-native math performance while keeping the app fully client-side (no server needed). The existing TS engine is preserved as an automatic fallback.

## Architecture Overview

```
                    ┌─────────────────────────┐
  App.tsx ──────────│  src/engine/index.ts     │
  FlowAnimation ───│  (dispatcher)            │
                    │                          │
                    │  isWasmReady()?           │
                    │  ├─ yes → wasm-adapter   │──→ quantum_engine.wasm
                    │  └─ no  → TS engine      │──→ circuit.ts (existing)
                    └─────────────────────────┘
```

**Zero UI changes.** The dispatcher replaces `executeCircuit` and `getQubitProbability` exports transparently. `App.tsx` and `FlowAnimation.tsx` continue importing from `'./engine'` unchanged.

## WASM Interface Contract (only 2 functions cross the boundary)

| Function | Input | Output | Called from |
|----------|-------|--------|-------------|
| `execute_circuit` | Circuit JSON string | ExecutionStep[] JSON string | App.tsx (via useMemo) |
| `get_qubit_probability` | State vector JSON, qubit_index, num_qubits | f64 | FlowAnimation.tsx (animation loop) |

## Steps

### Step 1: Scaffold the Rust crate

Create `crates/quantum-engine/` with:
```
crates/quantum-engine/
  Cargo.toml          # wasm-bindgen, serde, serde_json, js-sys
  src/
    lib.rs            # wasm_bindgen exports
    complex.rs        # Complex { re: f64, im: f64 } + arithmetic
    state_vector.rs   # create_initial_state, get_qubit_probability, measure
    gates.rs          # gate matrices (H,X,Y,Z,S,T,CNOT,SWAP,M) + apply_gate
    circuit.rs        # execute_circuit, execute_step, get_columns
    types.rs          # Serde boundary types with #[serde(rename = "camelCase")]
```

Key Cargo.toml settings:
- `crate-type = ["cdylib", "rlib"]` (cdylib for WASM, rlib for native tests)
- `opt-level = "s"` + `lto = true` in release profile (minimize WASM size)
- `measure()` accepts `random: f64` parameter — called with `js_sys::Math::random()` from lib.rs, deterministic values in tests

### Step 2: Implement `complex.rs`

Port `src/engine/complex.ts` → Rust struct with `Serialize`/`Deserialize`. Implement `Add`, `Sub`, `Mul` traits.

### Step 3: Implement `state_vector.rs`

Port `src/engine/stateVector.ts`. Key functions:
- `create_initial_state(n)` → `vec![ZERO; 2^n]` with `state[0] = ONE`
- `get_qubit_probability(state, qubit_index, num_qubits)` → sum `|amp|²` where qubit bit is 1
- `measure(state, qubit, num_qubits, random)` → collapse + renormalize

### Step 4: Implement `gates.rs`

Port `src/engine/gates.ts`. Gate matrices as functions returning `Vec<Vec<Complex>>`. Port the amplitude-grouping algorithm from `applyGate` (lines 254-324 of gates.ts) — identical bit manipulation logic.

### Step 5: Implement `types.rs` + `circuit.rs`

Serde boundary types:
```rust
CircuitGate { gate_id, target_qubits, column }  // #[serde(rename = "gateId")] etc.
Circuit { num_qubits, gates }
ExecutionStep { column, state_before, state_after, measurement_results? }
```

`measurement_results` uses `HashMap<String, u8>` (JSON object keys are always strings).

Port `execute_circuit` from `src/engine/circuit.ts` — groups gates by column, applies each column sequentially, records state snapshots.

### Step 6: WASM bindings in `lib.rs`

Two `#[wasm_bindgen]` exports:
```rust
pub fn execute_circuit(circuit_json: &str) -> Result<String, JsValue>
pub fn get_qubit_probability(state_json: &str, qubit_index: usize, num_qubits: usize) -> Result<f64, JsValue>
```

JSON string serialization for v1 (simple, debuggable). Can optimize to `serde-wasm-bindgen` later if profiling warrants it.

### Step 7: Rust unit tests

Port the 20+ test cases from `src/engine/__tests__/engine.test.ts`:
- H|0> = equal superposition, X|0> = |1>, Bell state, H²=I, probability normalization for all gates, SWAP correctness, CNOT truth table, Z phase, S²=Z, T unitarity, executeCircuit step counts

Use deterministic RNG for measurement tests (`|| 0.3` closure).

### Step 8: Vite integration + npm scripts

Install dev dependencies:
- `vite-plugin-wasm`
- `vite-plugin-top-level-await`

Modify `vite.config.ts` — add both plugins before `react()`.

Add npm scripts to `package.json`:
```json
"wasm:build": "cd crates/quantum-engine && wasm-pack build --target web --out-dir ../../src/wasm/quantum-engine",
"wasm:build:dev": "cd crates/quantum-engine && wasm-pack build --dev --target web --out-dir ../../src/wasm/quantum-engine",
"wasm:watch": "cd crates/quantum-engine && cargo watch -s 'wasm-pack build --dev --target web --out-dir ../../src/wasm/quantum-engine'"
```

Add `prebuild` and `predev` hooks to run `wasm:build` / `wasm:build:dev` automatically.

Add `src/wasm/` to `.gitignore`.

### Step 9: TypeScript adapter layer

Create `src/engine/wasm-adapter.ts`:
- Async-load WASM module on import (non-blocking)
- `isWasmReady()` — returns true when module loaded
- `executeCircuitWasm(circuit)` — JSON.stringify → wasm → JSON.parse
- `getQubitProbabilityWasm(state, qubitIndex, numQubits)` — JSON.stringify state → wasm → f64
- Returns `null` when WASM not ready (signals fallback)
- `localStorage.getItem('qf.forceTS')` override for debugging

### Step 10: Modify engine dispatcher

Modify `src/engine/index.ts`:
- Change `executeCircuit` and `getQubitProbability` from re-exports to dispatcher functions
- Try WASM first → fall back to TS engine
- All other exports (complex math, GATES catalog, formatKet, etc.) remain as-is from TS

**Files modified:** `src/engine/index.ts` only. No changes to `App.tsx`, `FlowAnimation.tsx`, or any component.

### Step 11: Cross-validation tests

Create `src/engine/__tests__/wasm-parity.test.ts`:
- Run identical circuits through both TS and WASM engines
- Assert outputs match within `1e-9` tolerance
- Skip gracefully if WASM build artifacts don't exist

## Critical Files

| File | Action |
|------|--------|
| `crates/quantum-engine/` (new) | Create — entire Rust crate |
| `src/engine/wasm-adapter.ts` (new) | Create — WASM loading + adapter |
| `src/engine/index.ts` | Modify — add WASM/TS dispatcher |
| `vite.config.ts` | Modify — add WASM plugins |
| `package.json` | Modify — add deps + scripts |
| `.gitignore` | Modify — add `src/wasm/` |
| `src/engine/__tests__/wasm-parity.test.ts` (new) | Create — cross-validation tests |

Unchanged: `App.tsx`, `FlowAnimation.tsx`, `StateInspector.tsx`, `BlochSphere.tsx`, all existing TS engine files, all existing tests.

## Verification

1. **Rust tests pass:** `cargo test -p quantum-engine`
2. **WASM builds:** `npm run wasm:build` produces `src/wasm/quantum-engine/quantum_engine_bg.wasm`
3. **Existing TS tests still pass:** `npm run test` (unchanged engine tests)
4. **Cross-validation tests pass:** WASM output matches TS output for all test circuits
5. **App runs with WASM:** `npm run dev` → open browser → build circuits → verify StateInspector shows correct states
6. **Fallback works:** Set `localStorage.setItem('qf.forceTS', '1')` → refresh → app still works
7. **Production build:** `npm run build` succeeds, preview serves correctly

## Prerequisites

- Rust toolchain installed (`rustup`)
- `wasm-pack` installed (`cargo install wasm-pack`)
- `wasm32-unknown-unknown` target (`rustup target add wasm32-unknown-unknown`)
- Optional: `cargo-watch` for dev workflow (`cargo install cargo-watch`)
