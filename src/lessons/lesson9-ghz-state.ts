import type { Lesson } from './types';

export const lesson9: Lesson = {
  id: 'lesson9',
  title: 'GHZ State and Three-Qubit Entanglement',
  description: 'Create the GHZ state — three-qubit entanglement that reveals the strongest form of quantum nonlocality.',
  estimatedMinutes: 22,
  prerequisites: ['lesson8'],
  steps: [
    {
      title: 'Beyond Two Qubits',
      content: `## Three-Qubit Entanglement

In Lesson 4 you created Bell states — two qubits entangled so that measuring one instantly determines the other. That was powerful. But our simulator has **three qubits**, and it is time to use all of them.

Three-qubit entanglement is not just "more of the same." The landscape of entanglement becomes qualitatively richer. There are fundamentally **different types** of three-qubit entanglement that cannot be converted into each other — they have different properties, different fragilities, and different uses.

The star of this lesson is the **GHZ state**, named after Greenberger, Horne, and Zeilinger (1989):

\`\`\`
|GHZ⟩ = (1/√2)(|000⟩ + |111⟩)
\`\`\`

Three qubits in a superposition of "all zero" and "all one" — nothing in between. This state has remarkable properties:
- **Perfect three-way correlation** — measuring any qubit tells you the state of the other two
- **Maximum fragility** — lose one qubit and all entanglement vanishes
- **The strongest proof of nonlocality** — contradicts classical physics with certainty, not statistics

Building it requires only gates you already know: H and CNOT.`,
      action: {
        type: 'read',
        description: 'Read the introduction. Click Next.',
      },
    },
    {
      title: 'Constructing the GHZ State',
      content: `## From Bell Pair to GHZ

Recall how you built a Bell state in Lesson 4: apply H to qubit 0, then CNOT from qubit 0 to qubit 1.

\`\`\`
|00⟩ → H on q0 → (1/√2)(|0⟩+|1⟩)|0⟩
     = (1/√2)(|00⟩+|10⟩)
     → CNOT(0,1) → (1/√2)(|00⟩+|11⟩)
\`\`\`

The GHZ state is a natural extension — just add one more CNOT:

\`\`\`
|000⟩ → H on q0 → (1/√2)(|0⟩+|1⟩)|00⟩
      = (1/√2)(|000⟩+|100⟩)
      → CNOT(0,1) → (1/√2)(|000⟩+|110⟩)
      → CNOT(0,2) → (1/√2)(|000⟩+|111⟩) = |GHZ⟩
\`\`\`

Each CNOT "spreads" the superposition to one more qubit. The first CNOT entangles qubit 1 with qubit 0. The second CNOT entangles qubit 2 with the pair. The result: all three qubits are locked in perfect correlation.

**The pattern:** To create an N-qubit GHZ state, apply H to one qubit and then CNOT from that qubit to each of the others. Simple, scalable, elegant.`,
      action: {
        type: 'read',
        description: 'Study the GHZ construction. Click Next to build it.',
      },
    },
    {
      title: 'Build the GHZ Circuit',
      content: `## Step Through the Construction

The circuit is pre-loaded: H on qubit 0, then CNOT from qubit 0 to qubit 1, then CNOT from qubit 0 to qubit 2. Use the **Step** button to execute one gate at a time and watch the state evolve.

\`\`\`
q0: |0⟩ ──[H]──[●]──[●]──
q1: |0⟩ ──────[⊕]────────
q2: |0⟩ ────────────[⊕]──
\`\`\`

Click **Step** and watch the State Inspector after each gate:

**After H (column 0):** Qubit 0 enters superposition. State: (1/√2)(|000⟩ + |100⟩). Only qubit 0 has changed — qubits 1 and 2 are still |0⟩.

**After CNOT(0→1) (column 1):** Qubit 1 becomes entangled with qubit 0. State: (1/√2)(|000⟩ + |110⟩). The CNOT flipped qubit 1 only in the |100⟩ branch (where qubit 0 is |1⟩).

**After CNOT(0→2) (column 2):** All three qubits entangled. State: (1/√2)(|000⟩ + |111⟩). The Bloch sphere for each individual qubit now shows a point at the center — completely mixed when viewed alone, yet perfectly correlated as a group.`,
      action: {
        type: 'click-step',
        description: 'Click Step three times. Watch each qubit join the entanglement.',
      },
      highlightElements: ['playback-controls', 'state-inspector'],
      circuitPreset: {
        numQubits: 3,
        gates: [
          { gateId: 'H', targetQubits: [0], column: 0 },
          { gateId: 'CX', targetQubits: [0, 1], column: 1 },
          { gateId: 'CX', targetQubits: [0, 2], column: 2 },
        ],
      },
    },
    {
      title: 'Measuring the GHZ State',
      content: `## Perfect Three-Way Correlation

Now add a measurement gate to see the GHZ state collapse. Place an **M gate on qubit 0 at column 3**.

After you place it, we will run the circuit to observe the outcome. Since we are measuring only qubit 0, what happens to qubits 1 and 2?

**Prediction:** The GHZ state is (1/√2)(|000⟩ + |111⟩). If qubit 0 measures **0**, the state collapses to |000⟩ — all three qubits are 0. If qubit 0 measures **1**, the state collapses to |111⟩ — all three qubits are 1.

Measuring a single qubit determines the state of all three. This is the Bell-state correlation from Lesson 4, extended to three parties. In the Bell state, Alice's measurement determined Bob's qubit. Here, Alice's measurement determines both Bob's and Charlie's qubits — simultaneously, regardless of distance.`,
      action: {
        type: 'place-gate',
        gateId: 'M',
        targetQubit: 0,
        column: 3,
        description: 'Place an M gate on qubit 0, column 3.',
      },
      highlightElements: ['gate-palette', 'circuit-canvas'],
      circuitPreset: {
        numQubits: 3,
        gates: [
          { gateId: 'H', targetQubits: [0], column: 0 },
          { gateId: 'CX', targetQubits: [0, 1], column: 1 },
          { gateId: 'CX', targetQubits: [0, 2], column: 2 },
        ],
      },
    },
    {
      title: 'Observe: GHZ Collapse',
      content: `## All or Nothing

Click **Play** to run the full circuit and observe the measurement.

Watch the State Inspector: before measurement, you see two bars — |000⟩ and |111⟩, each with 50% probability. After measurement, only one survives.

**Key observation:** Check all three qubits after measurement. They are perfectly correlated: either all 0 or all 1. Click **Reset** and run again — you will get a random outcome each time, but the three qubits always agree.

Compare this to the Bell state from Lesson 4. The structure is identical — perfect correlation — but now across three parties instead of two. The same H + CNOT pattern that built Bell pairs scales directly to multi-qubit entanglement.

**What if we measured qubit 1 or qubit 2 instead?** The same thing happens. The GHZ state is symmetric in this regard — measuring *any* single qubit collapses all three. No qubit is special.`,
      action: {
        type: 'click-play',
        description: 'Click Play. Observe that all three qubits collapse together.',
      },
      highlightElements: ['playback-controls', 'state-inspector'],
      circuitPreset: {
        numQubits: 3,
        gates: [
          { gateId: 'H', targetQubits: [0], column: 0 },
          { gateId: 'CX', targetQubits: [0, 1], column: 1 },
          { gateId: 'CX', targetQubits: [0, 2], column: 2 },
          { gateId: 'M', targetQubits: [0], column: 3 },
        ],
      },
    },
    {
      title: 'GHZ Is Fragile',
      content: `## Lose One Qubit, Lose All Entanglement

The GHZ state has a surprising weakness. Imagine three people — Alice, Bob, and Charlie — each hold one qubit of the GHZ state. Now suppose Charlie's qubit is lost (maybe the photon was absorbed, or the qubit decohered).

What remains between Alice and Bob?

The answer is striking: **no entanglement at all.** The remaining two qubits are in a classical mixture of |00⟩ and |11⟩ — they are correlated (both 0 or both 1), but this is purely **classical correlation**, exactly like two coins that were flipped together and placed in sealed envelopes. There is no superposition, no interference, no quantum advantage.

Mathematically, the reduced state of any two qubits is:

\`\`\`
ρ = (1/2)|00⟩⟨00| + (1/2)|11⟩⟨11|
\`\`\`

This is a **mixed state** — a probabilistic mixture, not a quantum superposition. The Bloch sphere for each individual qubit sits at the center (completely mixed), and no measurement can distinguish this from classical coin correlation.

**Why does this happen?** The GHZ state has all its entanglement in a single "thread" connecting all three qubits. Cut that thread anywhere and the whole structure unravels. This is not true of all three-qubit entangled states, as we will see next.`,
      action: {
        type: 'read',
        description: 'Read about GHZ fragility. Click Next to see the alternative.',
      },
    },
    {
      title: 'The W State: Robust Entanglement',
      content: `## A Different Kind of Three-Qubit Entanglement

There is another famous three-qubit entangled state — the **W state**:

\`\`\`
|W⟩ = (1/√3)(|001⟩ + |010⟩ + |100⟩)
\`\`\`

Exactly one qubit is |1⟩, but you do not know which one. The W state is entangled, but in a fundamentally different way than GHZ.

**The key difference: robustness.** If you lose one qubit of a W state, the remaining two qubits are **still entangled**. Specifically, if Charlie's qubit is lost, Alice and Bob share a state that is a mixture of |00⟩ and the Bell-like state (1/√2)(|01⟩ + |10⟩). The entanglement is degraded but not destroyed.

**GHZ vs W — a comparison:**

| Property | GHZ | W |
|----------|-----|---|
| Form | (1/√2)(|000⟩+|111⟩) | (1/√3)(|001⟩+|010⟩+|100⟩) |
| Lose 1 qubit | All entanglement gone | Entanglement survives |
| Measurement correlation | Perfect 3-way | Partial pairwise |
| Best for | Nonlocality proofs, sensing | Communication, robustness |

These two states cannot be converted into each other using only local operations on individual qubits. They represent genuinely **different classes** of entanglement — a discovery that has no analog in two-qubit systems, where all entangled states are essentially equivalent.

The W state requires rotation gates (Ry) for exact preparation, which our simulator does not have. But the concept is what matters: three-qubit entanglement is richer than just "more entanglement."`,
      action: {
        type: 'read',
        description: 'Compare GHZ and W state properties. Click Next.',
      },
    },
    {
      title: 'The GHZ Theorem',
      content: `## Nonlocality Without Inequalities

In Lesson 4, you learned that entangled qubits violate Bell inequalities — statistical tests that rule out classical explanations. The GHZ state goes further. The **GHZ theorem** (Greenberger-Horne-Zeilinger, 1989; simplified by Mermin, 1990) rules out classical explanations with **certainty**, not statistics.

Here is the argument, simplified:

Imagine Alice, Bob, and Charlie each hold one qubit of |GHZ⟩ = (1/√2)(|000⟩ + |111⟩). Each person can measure in either the X basis or the Y basis. Consider four measurement settings:

- **Setting 1 (XYY):** Alice measures X, Bob measures Y, Charlie measures Y.
- **Setting 2 (YXY):** Alice measures Y, Bob measures X, Charlie measures Y.
- **Setting 3 (YYX):** Alice measures Y, Bob measures Y, Charlie measures X.
- **Setting 4 (XXX):** Everyone measures X.

Quantum mechanics predicts: for settings 1-3, the product of all three results is always **−1**. For setting 4, the product is always **+1**.

**The contradiction:** If you assume each qubit has pre-determined values for both X and Y (the classical hidden variable assumption), then settings 1-3 force the product of X values to be **(−1)³ = −1**. But quantum mechanics says setting 4 gives **+1**.

This is not a statistical violation — it is a **logical contradiction**. A single run of the experiment suffices. No inequalities, no large sample sizes, no loopholes about sample bias. Just one measurement, one contradiction, classical physics ruled out.`,
      action: {
        type: 'read',
        description: 'Study the GHZ theorem argument. Click Next to test it.',
      },
    },
    {
      title: 'GHZ Correlations in the Simulator',
      content: `## Testing XXX Measurement

We cannot directly measure in the X basis with the M gate — it always measures in the computational (Z) basis. But recall from Lesson 6: applying **H before M** converts a Z-basis measurement into an **X-basis measurement**. (H rotates |+⟩ → |0⟩ and |−⟩ → |1⟩, swapping the X and Z bases.)

The circuit is pre-loaded: GHZ creation (H, CNOT, CNOT), then H on all three qubits, then M on all three.

\`\`\`
q0: |0⟩ ──[H]──[●]──[●]──[H]──[M]
q1: |0⟩ ──────[⊕]────────[H]──[M]
q2: |0⟩ ────────────[⊕]──[H]──[M]
\`\`\`

This implements the **XXX measurement** — measuring all three qubits in the X basis.

Click **Play** and check the outcomes.

**The GHZ prediction:** The product of the three X-measurement results should always give an **even number of 1s** (in the computational basis output). Specifically, the outcomes |000⟩, |011⟩, |101⟩, and |110⟩ are the allowed results — all having an even number of 1s. The odd-parity outcomes (|001⟩, |010⟩, |100⟩, |111⟩) should never appear.

This is the quantum prediction that contradicts any classical hidden variable model. Run it, check the parity, and click Reset to try again — every run confirms the prediction.`,
      action: {
        type: 'click-play',
        description: 'Click Play. Check that the outcome has an even number of 1s.',
      },
      highlightElements: ['playback-controls', 'state-inspector'],
      circuitPreset: {
        numQubits: 3,
        gates: [
          { gateId: 'H', targetQubits: [0], column: 0 },
          { gateId: 'CX', targetQubits: [0, 1], column: 1 },
          { gateId: 'CX', targetQubits: [0, 2], column: 2 },
          { gateId: 'H', targetQubits: [0], column: 3 },
          { gateId: 'H', targetQubits: [1], column: 3 },
          { gateId: 'H', targetQubits: [2], column: 3 },
          { gateId: 'M', targetQubits: [0], column: 4 },
          { gateId: 'M', targetQubits: [1], column: 4 },
          { gateId: 'M', targetQubits: [2], column: 4 },
        ],
      },
    },
    {
      title: 'Lesson 9 Summary & Further Reading',
      content: `## Summary

**The GHZ state** |GHZ⟩ = (1/√2)(|000⟩ + |111⟩) is the simplest example of three-qubit entanglement. It extends the Bell pair by one more CNOT: H → CNOT → CNOT.

**Perfect correlation:** Measuring any single qubit of the GHZ state instantly determines the other two. All three always agree.

**Fragility:** If one qubit is lost, **all entanglement vanishes**. The remaining two qubits have only classical correlation. This is unlike the W state, where losing one qubit preserves some entanglement.

**Two classes of entanglement:** GHZ and W states represent fundamentally different types of three-qubit entanglement that cannot be interconverted with local operations. Multi-qubit entanglement is richer than the two-qubit case.

**The GHZ theorem:** The strongest proof of quantum nonlocality. A single measurement on the GHZ state creates a logical contradiction with classical hidden variable theories — no statistics required, no inequalities, just one run.

**Applications:** Quantum secret sharing, quantum error correction, quantum sensing at the Heisenberg limit, and multi-node quantum networks all rely on GHZ-like states.

---

## Further Reading

- [IBM Quantum Learning: Multiple Qubits and Entanglement](https://learning.quantum.ibm.com/course/basics-of-quantum-information/multiple-systems) — Covers GHZ states with Qiskit implementations.
- **Greenberger, Horne, Zeilinger, "Going Beyond Bell's Theorem" (1989)** — The original paper introducing GHZ states and the argument against local realism.
- **N. David Mermin, "Quantum Mysteries Revisited" (1990), American Journal of Physics** — The clearest presentation of the GHZ argument, widely cited as a masterpiece of physics exposition.
- [Qiskit Textbook: GHZ States](https://github.com/Qiskit/textbook/blob/main/notebooks/ch-gates/multiple-qubits-entangled-states.ipynb) — Interactive notebook for building and measuring GHZ states.`,
      action: {
        type: 'read',
        description: 'Review the summary. Click Next to complete Lesson 9.',
      },
    },
  ],
};
