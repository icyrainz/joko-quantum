import type { Lesson } from './types';

export const lesson8: Lesson = {
  id: 'lesson8',
  title: "Deutsch's Algorithm",
  description: 'Build the first quantum algorithm — a provable speedup over any classical approach using interference and phase kickback.',
  estimatedMinutes: 25,
  prerequisites: ['lesson7'],
  steps: [
    {
      title: 'From Protocols to Algorithms',
      content: `## The First Quantum Algorithm

So far you have learned quantum gates, built entanglement, and implemented two communication protocols (teleportation and superdense coding). Now we cross into new territory: **quantum algorithms** — programs that solve computational problems faster than any classical alternative.

**Deutsch's algorithm** (David Deutsch, 1985; refined by Deutsch and Jozsa, 1992) is the simplest quantum algorithm that demonstrates a genuine speedup. The problem it solves is small — almost trivial — but the principle behind it powers every quantum algorithm that followed.

The key ingredients are things you already know:
- **Superposition** (Lesson 2) — query the function on multiple inputs at once
- **Phase kickback** (Lesson 3) — the function's answer goes into the phase, not a classical register
- **Interference** (Lesson 2) — a final Hadamard extracts the answer through constructive/destructive interference

This lesson builds all four possible instances of Deutsch's problem in the simulator and traces exactly why the quantum solution works.`,
      action: {
        type: 'read',
        description: 'Read the introduction. Click Next.',
      },
    },
    {
      title: 'The Problem: Constant vs Balanced',
      content: `## The Oracle Model

Imagine you are given a function f that takes one bit in and produces one bit out: f: {0,1} → {0,1}. You cannot see inside f — it is a **black box** (called an **oracle**). The only thing you can do is query it: give it an input, get back an output. Each query costs time and resources.

There are exactly four possible functions:

| Function | f(0) | f(1) | Type |
|----------|------|------|------|
| f₁       | 0    | 0    | Constant |
| f₂       | 0    | 1    | Balanced |
| f₃       | 1    | 0    | Balanced |
| f₄       | 1    | 1    | Constant |

**Constant** means f gives the same output regardless of input. **Balanced** means f gives 0 on exactly half the inputs and 1 on the other half.

**The promise problem:** You are told that f is either constant or balanced. Determine which one.

**Classical solution:** You must evaluate f(0) and f(1), then compare. If they are equal → constant. If different → balanced. This requires **2 queries**, and there is no classical shortcut — with just 1 query, you learn f(x) for one input but have no information about the other.

**Quantum solution:** Deutsch's algorithm answers the question with **1 query**. One call to the oracle, and you know whether f is constant or balanced — with certainty, not probability.`,
      action: {
        type: 'read',
        description: 'Understand the four functions and the promise problem. Click Next.',
      },
    },
    {
      title: "Deutsch's Algorithm: The Circuit",
      content: `## The Algorithm

The circuit uses 2 qubits: qubit 0 (input) and qubit 1 (target).

\`\`\`
q0: |0⟩ ──[H]──[ Uf ]──[H]──[M]
q1: |0⟩ ──[X]──[H]──[ Uf ]──────
\`\`\`

**Step 1 — Prepare |−⟩ on qubit 1:** Apply X then H to qubit 1, giving |−⟩ = (1/√2)(|0⟩ − |1⟩). Apply H to qubit 0, giving |+⟩.

Combined state: |+⟩|−⟩ = (1/√2)(|0⟩ + |1⟩) ⊗ (1/√2)(|0⟩ − |1⟩)

**Step 2 — Apply the oracle Uf:** The oracle implements |x⟩|y⟩ → |x⟩|y ⊕ f(x)⟩. When the target is in state |−⟩, something remarkable happens:

\`\`\`
|x⟩|−⟩ → (-1)^f(x) |x⟩|−⟩
\`\`\`

The function value f(x) moves into the **phase** of the input qubit. The target qubit is unchanged. This is **phase kickback** — the same mechanism from Lesson 3.

After the oracle, qubit 0 is in state (1/√2)((-1)^f(0)|0⟩ + (-1)^f(1)|1⟩) and qubit 1 is still |−⟩.

**Step 3 — Apply H to qubit 0 and measure:**
- If f is constant: f(0) = f(1), so the phases are equal. Qubit 0 is ±|+⟩. H gives |0⟩. **Measure 0.**
- If f is balanced: f(0) ≠ f(1), so the phases differ. Qubit 0 is ±|−⟩. H gives |1⟩. **Measure 1.**

One query. One measurement. Done.`,
      action: {
        type: 'read',
        description: 'Study the circuit and the phase kickback mechanism. Click Next to run it.',
      },
    },
    {
      title: 'Run: Constant Oracle f(x) = 0',
      content: `## Oracle f₁: f(x) = 0 — The Identity Oracle

The circuit is pre-loaded with Deutsch's algorithm using the oracle for f(x) = 0.

Since f(x) = 0 for all x, the oracle does nothing — it is the identity. The "oracle region" (column 2) is empty.

\`\`\`
q0: |0⟩ ──[H]──(nothing)──[H]──[M]
q1: |0⟩ ──[X]──[H]──(nothing)──────
\`\`\`

Click **Play** and watch the State Inspector.

**What to expect:** After the final H on qubit 0, the state should collapse so that qubit 0 is |0⟩. The measurement reads **0**, meaning "constant." Correct — f(x) = 0 is indeed constant.

**What about f(x) = 1?** That oracle would use an X gate on qubit 1. But X|−⟩ = −|−⟩ — it only introduces a global phase, which is physically undetectable (Lesson 3). So f(x) = 1 also gives measurement 0. Both constant functions produce the same answer, as the algorithm promises.`,
      action: {
        type: 'click-play',
        description: 'Click Play. Verify qubit 0 measures 0 → constant.',
      },
      highlightElements: ['playback-controls', 'state-inspector'],
      circuitPreset: {
        numQubits: 2,
        gates: [
          { gateId: 'X', targetQubits: [1], column: 0 },
          { gateId: 'H', targetQubits: [0], column: 1 },
          { gateId: 'H', targetQubits: [1], column: 1 },
          // Oracle: identity (no gate) for f(x) = 0
          { gateId: 'H', targetQubits: [0], column: 3 },
          { gateId: 'M', targetQubits: [0], column: 4 },
        ],
      },
    },
    {
      title: 'Run: Balanced Oracle f(x) = x',
      content: `## Oracle f₂: f(x) = x — The CNOT Oracle

Now the oracle encodes f(x) = x, the identity function. When x = 0, do nothing to the target. When x = 1, flip the target. This is exactly a **CNOT gate** with qubit 0 as control and qubit 1 as target.

Click **Play** and watch carefully.

**The state trace:**

After H on both qubits: |+⟩|−⟩

After CNOT (the oracle): Phase kickback applies f(x) = x to the phases.
\`\`\`
(1/√2)((-1)^f(0)|0⟩ + (-1)^f(1)|1⟩)|−⟩
= (1/√2)((-1)^0|0⟩ + (-1)^1|1⟩)|−⟩
= (1/√2)(|0⟩ − |1⟩)|−⟩
= |−⟩|−⟩
\`\`\`

After H on qubit 0: H|−⟩ = |1⟩. **Measure 1** → balanced. Correct.

Compare with the constant oracle: the only difference is a CNOT at column 2. That one gate flips the measurement from 0 to 1 — from "constant" to "balanced." The oracle's answer is fully encoded in the phase.`,
      action: {
        type: 'click-play',
        description: 'Click Play. Verify qubit 0 measures 1 → balanced.',
      },
      highlightElements: ['playback-controls', 'state-inspector'],
      circuitPreset: {
        numQubits: 2,
        gates: [
          { gateId: 'X', targetQubits: [1], column: 0 },
          { gateId: 'H', targetQubits: [0], column: 1 },
          { gateId: 'H', targetQubits: [1], column: 1 },
          { gateId: 'CX', targetQubits: [0, 1], column: 2 },
          { gateId: 'H', targetQubits: [0], column: 3 },
          { gateId: 'M', targetQubits: [0], column: 4 },
        ],
      },
    },
    {
      title: 'The State Trace in Detail',
      content: `## Why the Oracle Leaves Qubit 1 Unchanged

This is the subtlest point in the algorithm, worth dwelling on.

The oracle's formal action is |x⟩|y⟩ → |x⟩|y ⊕ f(x)⟩. It XORs f(x) into the target. Applied to a basis state, it changes the target. So why do we say the target "does not change"?

Because qubit 1 is in state |−⟩ = (1/√2)(|0⟩ − |1⟩), which is an **eigenvector** of X (bit-flip):

\`\`\`
X|−⟩ = (1/√2)(|1⟩ − |0⟩) = −(1/√2)(|0⟩ − |1⟩) = −|−⟩
\`\`\`

When f(x) = 1, the oracle flips the target: |−⟩ → −|−⟩. The state is the same up to a phase factor −1. When f(x) = 0, nothing happens. So for each input |x⟩:

\`\`\`
|x⟩|−⟩ → (-1)^f(x)|x⟩|−⟩
\`\`\`

The function's output has been "kicked" from the target qubit into the **phase** of the input qubit. The target qubit's physical state is unchanged — it remains |−⟩ throughout. This is phase kickback at work.

After the oracle, qubit 0 encodes the answer and qubit 1 is inert. The final H on qubit 0 converts the phase difference into a measurable amplitude difference:

\`\`\`
Constant: ±(1/√2)(|0⟩ + |1⟩) = ±|+⟩ → H → ±|0⟩ → measure 0
Balanced: ±(1/√2)(|0⟩ − |1⟩) = ±|−⟩ → H → ±|1⟩ → measure 1
\`\`\`

The global ± is invisible (Lesson 3). Only the relative phase between |0⟩ and |1⟩ matters — and the final H converts that relative phase into a definite measurement outcome.`,
      action: {
        type: 'read',
        description: 'Study the phase kickback mechanism in detail. Click Next to build your own oracle.',
      },
    },
    {
      title: 'Build: Oracle f(x) = NOT(x)',
      content: `## Your Turn: The Fourth Oracle

The last oracle implements f(x) = NOT(x): f(0) = 1, f(1) = 0. This is balanced (f gives different outputs for different inputs).

How do we encode this as a circuit? We need: "flip the target whenever f(x) = 1." Since f(x) = NOT(x), we flip whenever x = 0, which is the opposite of CNOT. One way: apply CNOT (flip when x=1), then X on the target (flip always). The net effect: flip when x=0, do not flip when x=1. That is f(x) = NOT(x).

The circuit is pre-loaded with the algorithm frame and a **CNOT already placed** at column 2. You need to place an **X gate on qubit 1 at column 3** to complete the oracle.

\`\`\`
q0: |0⟩ ──[H]──[●]──────[H]──[M]
q1: |0⟩ ──[X]──[H]──[⊕]──[?]──────
                  col2  col3
\`\`\`

Because this oracle uses two gates (CNOT + X), it spans columns 2–3 instead of the single column used by the simpler oracles. The final H and Measure gates have shifted to columns 4 and 5 accordingly — the pre-loaded circuit already handles this.

Place the X gate to complete the oracle for f(x) = NOT(x).`,
      action: {
        type: 'place-gate',
        gateId: 'X',
        targetQubit: 1,
        column: 3,
        description: 'Place an X gate on qubit 1, column 3 to complete the NOT(x) oracle.',
      },
      highlightElements: ['gate-palette', 'circuit-canvas'],
      circuitPreset: {
        numQubits: 2,
        gates: [
          { gateId: 'X', targetQubits: [1], column: 0 },
          { gateId: 'H', targetQubits: [0], column: 1 },
          { gateId: 'H', targetQubits: [1], column: 1 },
          { gateId: 'CX', targetQubits: [0, 1], column: 2 },
          // Column 3 left empty for user to place X on q1
          { gateId: 'H', targetQubits: [0], column: 4 },
          { gateId: 'M', targetQubits: [0], column: 5 },
        ],
      },
    },
    {
      title: 'Run: Oracle f(x) = NOT(x)',
      content: `## Verify the NOT(x) Oracle

Click **Play** to run the full circuit.

**Predict:** f(x) = NOT(x) is balanced. So the algorithm should output 1.

**The state trace:**

After H on both: |+⟩|−⟩

After CNOT: |−⟩|−⟩ (same as the f(x) = x case — phase kickback from the CNOT)

After X on qubit 1: |−⟩(−|−⟩) = −|−⟩|−⟩. This is a global phase — physically identical to |−⟩|−⟩.

After H on qubit 0: H|−⟩ = |1⟩. **Measure 1** → balanced. ✓

Notice something: the X gate on qubit 1 only introduced a global phase (−1), which is invisible. The CNOT is what did the real work — it flipped the relative phase of qubit 0 between |0⟩ and |1⟩. The additional X on qubit 1 cannot change the measurement outcome because it only affects qubit 1, which we never measure.

**All four oracles work:**
- f(x) = 0 (constant): measure 0 ✓
- f(x) = 1 (constant): measure 0 ✓
- f(x) = x (balanced): measure 1 ✓
- f(x) = NOT(x) (balanced): measure 1 ✓

One query. Deterministic answer. Quantum advantage demonstrated.`,
      action: {
        type: 'click-play',
        description: 'Click Play. Verify qubit 0 measures 1 → balanced.',
      },
      highlightElements: ['playback-controls', 'state-inspector'],
      circuitPreset: {
        numQubits: 2,
        gates: [
          { gateId: 'X', targetQubits: [1], column: 0 },
          { gateId: 'H', targetQubits: [0], column: 1 },
          { gateId: 'H', targetQubits: [1], column: 1 },
          { gateId: 'CX', targetQubits: [0, 1], column: 2 },
          { gateId: 'X', targetQubits: [1], column: 3 },
          { gateId: 'H', targetQubits: [0], column: 4 },
          { gateId: 'M', targetQubits: [0], column: 5 },
        ],
      },
    },
    {
      title: 'The Anatomy of Quantum Speedup',
      content: `## Three Ingredients, One Template

Every quantum algorithm that achieves a speedup uses the same three ingredients. Deutsch's algorithm is the minimal example:

**1. Superposition — querying on multiple inputs simultaneously.**
The H gate on qubit 0 puts it in |+⟩ = (1/√2)(|0⟩ + |1⟩). The oracle then "sees" both inputs 0 and 1 in a single query. This is not the same as evaluating f(0) and f(1) separately — it is a single coherent quantum operation on a superposition.

**2. Phase kickback — encoding answers into phases.**
The oracle maps f(x) into the phase: |x⟩ → (−1)^f(x)|x⟩. The answer is hidden in the relative phase between |0⟩ and |1⟩, not in any directly measurable register. This is why the target qubit must be prepared in |−⟩ — it enables the kickback.

**3. Interference — extracting the answer.**
The final H gate on qubit 0 converts the relative phase into a definite amplitude. If the phases are the same (constant), constructive interference gives |0⟩. If the phases differ (balanced), destructive interference gives |1⟩. Without interference, the phase information would be invisible.

**Remove any one ingredient and the algorithm fails.** Without superposition, you can only query one input. Without phase kickback, the answer is in the target qubit which provides no useful information. Without the final interference, the phase difference is invisible to measurement.

**Scaling up:** Deutsch's problem has a modest speedup (1 query vs 2). But the Deutsch-Jozsa extension to N-bit inputs achieves 1 query vs 2^(N−1)+1 queries. The same template — superposition, phase oracle, interference — powers Grover's search (quadratic speedup) and Shor's factoring algorithm (exponential speedup). The mechanisms are the same; only the scale changes.`,
      action: {
        type: 'read',
        description: 'Read about the three ingredients of quantum speedup. Click Next for the summary.',
      },
    },
    {
      title: "Lesson 8 Summary & Further Reading",
      content: `## Summary

**Deutsch's algorithm** determines whether a function f: {0,1} → {0,1} is constant or balanced using **1 query** (classical requires 2).

**The circuit:** Prepare qubit 1 in |−⟩ (via X then H). Put qubit 0 in superposition (H). Apply the oracle. Apply H to qubit 0. Measure qubit 0: 0 = constant, 1 = balanced.

**The mechanism is phase kickback.** The oracle maps f(x) into the phase of the input qubit: |x⟩ → (−1)^f(x)|x⟩. The target qubit in |−⟩ is the enabler — it kicks the function value into the phase while remaining unchanged itself.

**The final H converts phase into amplitude.** Equal phases (constant) → constructive interference → |0⟩. Opposite phases (balanced) → destructive interference → |1⟩. This is the same interference you saw in Lesson 2, now deployed as a computational tool.

**Three ingredients of quantum speedup:** superposition (parallel queries), phase encoding (answers in phases), and interference (extracting the result). Every quantum algorithm uses this template.

In **Lesson 9**, we return to entanglement for the capstone: the GHZ state — three-qubit entanglement that reveals the deepest form of quantum nonlocality.

---

## Further Reading

- [IBM Quantum Learning: Quantum Query Algorithms](https://learning.quantum.ibm.com/course/fundamentals-of-quantum-algorithms/quantum-query-algorithms) — Covers Deutsch's algorithm as the first topic in quantum algorithms, with Qiskit implementations.
- **David Deutsch, "Quantum Theory, the Church-Turing Principle and the Universal Quantum Computer" (1985)** — The original paper that introduced quantum computational advantage.
- [Scott Aaronson's Lecture Notes: Lecture 10](https://scottaaronson.com/democritus/lec10.html) — Clear treatment of query complexity and Deutsch-Jozsa in "Quantum Computing Since Democritus."`,
      action: {
        type: 'read',
        description: 'Review the summary. Click Next to complete Lesson 8.',
      },
    },
  ],
};
