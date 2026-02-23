import type { Lesson } from './types';

export const lesson5: Lesson = {
  id: 'lesson5',
  title: 'Quantum Teleportation',
  description: 'Use entanglement and classical communication to transfer an unknown quantum state across any distance.',
  estimatedMinutes: 30,
  prerequisites: ['lesson4'],
  steps: [
    {
      title: 'The Capstone: Quantum Teleportation',
      content: `## Quantum Teleportation

Welcome to the final lesson. Everything you have learned — superposition, phase, interference, entanglement — converges here in one of the most remarkable protocols in quantum information science.

**The problem:** Alice has a qubit in some unknown state |ψ⟩ = α|0⟩ + β|1⟩. She wants to give this quantum state to Bob, who is far away. She cannot simply measure the qubit — measurement destroys superposition and collapses the state to a classical value, discarding α and β. She cannot make a copy — the no-cloning theorem (which we will cover next) proves that is impossible.

**The solution:** Quantum teleportation. Using a pre-shared entangled pair and two classical bits of communication, Alice can transfer the exact quantum state to Bob's qubit — without the original |ψ⟩ travelling through space at all.

When it was first proposed in 1993 by Bennett, Brassard, Crépeau, Jozsa, Peres, and Wootters, it seemed like something out of science fiction. Today it is experimentally demonstrated routinely and is the backbone of quantum network design.

This lesson walks through the complete protocol step by step, with full state tracking.`,
      action: {
        type: 'read',
        description: 'Read the introduction to quantum teleportation. Click Next.',
      },
    },
    {
      title: 'The No-Cloning Theorem',
      content: `## The No-Cloning Theorem: Why You Cannot Copy a Qubit

Before we can appreciate teleportation, we need to understand why it is necessary.

**The no-cloning theorem states:** It is impossible to create an exact copy of an arbitrary unknown quantum state.

The proof is elegant and short. Suppose there exists a unitary gate U that clones: U(|ψ⟩|0⟩) = |ψ⟩|ψ⟩ for any state |ψ⟩.

Let us test this with two specific states |ψ⟩ and |φ⟩:

\`\`\`
U(|ψ⟩|0⟩) = |ψ⟩|ψ⟩
U(|φ⟩|0⟩) = |φ⟩|φ⟩
\`\`\`

Now take the inner product of both equations. Since U is unitary, it preserves inner products:

\`\`\`
⟨φ|⟨0| × U†U × |ψ⟩|0⟩ = ⟨φ|φ⟩ × ⟨φ|ψ⟩ × ⟨ψ|ψ⟩...
\`\`\`

Working through the algebra: **⟨φ|ψ⟩ = (⟨φ|ψ⟩)²**

This equation is only satisfied when ⟨φ|ψ⟩ = 0 (the states are orthogonal) or ⟨φ|ψ⟩ = 1 (the states are identical). A cloning machine can copy states only if it knows in advance that they are either identical or orthogonal — which means it cannot handle arbitrary unknown states. **No universal cloning machine exists.**

This has a consequence: teleportation does not copy the state. It **moves** it. After teleportation is complete, Alice's qubit is in a different state — the original |ψ⟩ is no longer there. The state has transferred from Alice's qubit to Bob's.`,
      action: {
        type: 'read',
        description: 'Read and follow the no-cloning proof. Click Next.',
      },
    },
    {
      title: 'The Setup: Three Qubits',
      content: `## The Setup: Alice, Bob, and Three Qubits

The teleportation protocol uses three qubits:

- **Qubit 0** (Alice's data qubit): in the unknown state |ψ⟩ = α|0⟩ + β|1⟩. Alice wants to teleport this to Bob.
- **Qubit 1** (Alice's half of an entangled pair): initially |0⟩.
- **Qubit 2** (Bob's half of the entangled pair): initially |0⟩.

**Pre-condition:** Qubits 1 and 2 are prepared in the Bell state |Φ+⟩ = (1/√2)(|00⟩ + |11⟩) (subscripts 12). This Bell pair must be created and distributed before the protocol begins — Alice and Bob each hold one qubit of the pair. The pair could have been created in the same lab and Bob's qubit shipped across the world.

**Initial state of all three qubits:**

\`\`\`
|ψ₀⟩ = |ψ⟩₀ ⊗ |Φ+⟩₁₂
      = (α|0⟩ + β|1⟩)₀ ⊗ (1/√2)(|00⟩ + |11⟩)₁₂
      = (1/√2)[α|0⟩(|00⟩ + |11⟩) + β|1⟩(|00⟩ + |11⟩)]₀₁₂
      = (1/√2)[α|000⟩ + α|011⟩ + β|100⟩ + β|111⟩]
\`\`\`

This three-qubit state is our starting point. Note that α and β — which encode the unknown state — appear in all four terms. Alice has to work with this entangled, distributed state to extract and move α and β to Bob's qubit.`,
      action: {
        type: 'read',
        description: 'Read the setup carefully. Understand which qubit belongs to whom. Click Next.',
      },
      circuitPreset: {
        numQubits: 3,
        gates: [
          { gateId: 'H', targetQubits: [1], column: 0 },
          { gateId: 'CX', targetQubits: [1, 2], column: 1 },
        ],
      },
    },
    {
      title: 'The Circuit: Overview',
      content: `## The Teleportation Circuit

We have pre-loaded a partial circuit with 3 qubits. Here is the complete teleportation protocol as a circuit, which we will build step by step:

**Phase 1 — Create the Bell pair (qubits 1 and 2):**
- Column 0: H on qubit 1
- Column 1: CNOT(control=1, target=2)

This creates (1/√2)(|00⟩ + |11⟩) on qubits 1 and 2.

**Phase 2 — Alice's operations (qubits 0 and 1):**
- Column 2: CNOT(control=0, target=1)
- Column 3: H on qubit 0

**Phase 3 — Alice measures qubits 0 and 1** (you can place Measure gates from the Gate Palette to see the probabilistic collapse). Alice gets two classical bits: m₀ (from qubit 0) and m₁ (from qubit 1).

**Phase 4 — Bob's corrections (on qubit 2, based on Alice's bits):**
- If m₁ = 1: apply X to qubit 2
- If m₀ = 1: apply Z to qubit 2

After these corrections, qubit 2 is in the state α|0⟩ + β|1⟩ — the teleported state. The original qubit 0 is no longer in |ψ⟩; it has been measured and collapsed.

The circuit is pre-loaded. Let us trace through the math.`,
      action: {
        type: 'read',
        description: 'Read the circuit overview. Click Next to trace the state through each step.',
      },
      highlightElements: ['circuit-canvas'],
      circuitPreset: {
        numQubits: 3,
        gates: [
          { gateId: 'H', targetQubits: [1], column: 0 },
          { gateId: 'CX', targetQubits: [1, 2], column: 1 },
          { gateId: 'CX', targetQubits: [0, 1], column: 2 },
          { gateId: 'H', targetQubits: [0], column: 3 },
        ],
      },
    },
    {
      title: 'State Tracking: Phase 1 — Bell Pair Creation',
      content: `## Phase 1: Creating the Bell Pair on Qubits 1 and 2

**After H on qubit 1 (column 0):**

\`\`\`
(1/√2)[α|000⟩ + α|010⟩ + β|100⟩ + β|110⟩]
       ↑ qubit 0 unchanged, qubit 1 put in superposition ↑
\`\`\`

Wait — let us redo this carefully. Qubit 0 starts as α|0⟩ + β|1⟩ and qubit 1 as |0⟩. H on qubit 1 takes |0⟩ → (1/√2)(|0⟩+|1⟩):

\`\`\`
(α|0⟩+β|1⟩) ⊗ (1/√2)(|0⟩+|1⟩) ⊗ |0⟩
= (1/√2)(α|000⟩ + α|010⟩ + β|100⟩ + β|110⟩)
\`\`\`

**After CNOT(1→2) (column 1):**

CNOT flips qubit 2 whenever qubit 1 is |1⟩:
- |000⟩ → |000⟩ (q1=0, no flip)
- |010⟩ → |011⟩ (q1=1, q2 flipped 0→1)
- |100⟩ → |100⟩ (q1=0, no flip)
- |110⟩ → |111⟩ (q1=1, q2 flipped 0→1)

\`\`\`
State = (1/√2)(α|000⟩ + α|011⟩ + β|100⟩ + β|111⟩)
\`\`\`

Qubits 1 and 2 are now in the Bell state |Φ+⟩₁₂. This matches the |ψ₀⟩ we wrote in the Setup step. We are ready for Alice's operations.`,
      action: {
        type: 'read',
        description: 'Follow the state vector through Phase 1. Click Next for Phase 2.',
      },
    },
    {
      title: 'State Tracking: Phase 2 — Alice\'s Operations',
      content: `## Phase 2: Alice's CNOT and H

**After CNOT(0→1) (column 2):**

CNOT flips qubit 1 whenever qubit 0 is |1⟩. Let us apply this to each term:

\`\`\`
α|000⟩ → α|000⟩  (q0=0, q1 unchanged)
α|011⟩ → α|011⟩  (q0=0, q1 unchanged)
β|100⟩ → β|110⟩  (q0=1, q1 flipped: 0→1)
β|111⟩ → β|101⟩  (q0=1, q1 flipped: 1→0)
\`\`\`

State after CNOT(0→1):

\`\`\`
(1/√2)(α|000⟩ + α|011⟩ + β|110⟩ + β|101⟩)
\`\`\`

**After H on qubit 0 (column 3):**

H maps: |0⟩ → (1/√2)(|0⟩+|1⟩) and |1⟩ → (1/√2)(|0⟩-|1⟩)

\`\`\`
α|000⟩ → α(1/√2)|000⟩ + α(1/√2)|100⟩
α|011⟩ → α(1/√2)|011⟩ + α(1/√2)|111⟩
β|110⟩ → β(1/√2)|010⟩ - β(1/√2)|110⟩
β|101⟩ → β(1/√2)|001⟩ - β(1/√2)|101⟩
\`\`\`

Full state (multiplying through the overall 1/√2 factor → total 1/2):

\`\`\`
(1/2)[α|000⟩ + α|100⟩ + α|011⟩ + α|111⟩
    + β|010⟩ - β|110⟩ + β|001⟩ - β|101⟩]
\`\`\`

Now group by Alice's qubit values (qubits 0 and 1), to see Bob's qubit 2 in each case.`,
      action: {
        type: 'read',
        description: 'Follow the state tracking through Phase 2. The grouping on the next screen reveals the magic. Click Next.',
      },
    },
    {
      title: 'The Magic: Regrouping by Alice\'s Measurement',
      content: `## The Crucial Regrouping

Let us regroup the full state by the values of qubits 0 and 1 (Alice's qubits), isolating what happens to qubit 2 (Bob's qubit) in each case:

\`\`\`
(1/2)[
  |00⟩₀₁ ⊗ (α|0⟩ + β|1⟩)₂     [terms: α|000⟩ + β|001⟩]
+ |01⟩₀₁ ⊗ (α|1⟩ + β|0⟩)₂     [terms: α|011⟩ + β|010⟩]
+ |10⟩₀₁ ⊗ (α|0⟩ - β|1⟩)₂     [terms: α|100⟩ - β|101⟩]
+ |11⟩₀₁ ⊗ (α|1⟩ - β|0⟩)₂     [terms: α|111⟩ - β|110⟩]
]
\`\`\`

Look at Bob's qubit 2 in each case:

| Alice measures (q0, q1) | Bob's qubit 2 state     | Required correction    |
|-------------------------|-------------------------|------------------------|
| 00                      | α|0⟩ + β|1⟩          | None (already correct) |
| 01                      | α|1⟩ + β|0⟩          | Apply X (swap 0 and 1) |
| 10                      | α|0⟩ - β|1⟩          | Apply Z (flip |1⟩ sign)|
| 11                      | α|1⟩ - β|0⟩          | Apply X then Z         |

In **every** case, Bob can apply simple corrections (X and/or Z) based on Alice's two measurement bits to transform his qubit into **α|0⟩ + β|1⟩** — the original unknown state.

This is the teleportation. Alice never needed to know α or β. She never directly sent the quantum state. She sent two classical bits, and Bob used them to reconstruct the state on his end.`,
      action: {
        type: 'read',
        description: 'Study the regrouping table. This is the heart of the teleportation protocol. Click Next.',
      },
    },
    {
      title: 'Run the Circuit',
      content: `## Run the Teleportation Circuit

Click **Reset** to restore the initial state, then click **Play** to run the circuit.

The circuit that was pre-loaded contains the Bell pair creation (H + CNOT on qubits 1 and 2) and Alice's operations (CNOT on qubits 0 and 1, then H on qubit 0). Watch the State Inspector as each column is executed.

**After column 0 (H on q1):** Qubit 1 enters superposition.

**After column 1 (CNOT q1→q2):** Bell pair formed on qubits 1 and 2.

**After column 2 (CNOT q0→q1):** The data qubit's state starts "mixing into" the entangled structure.

**After column 3 (H on q0):** The full superposition of all four measurement outcomes, as shown in the regrouping table.

The simulator now supports measurement gates — try placing them after column 3 to see Alice's qubits collapse. Each Reset+Play gives a different random outcome, demonstrating the probabilistic nature of measurement. The conditional corrections (X and Z on Bob's qubit based on Alice's results) are not automated, but you can apply them manually after seeing the measurement result.

In a real implementation, Alice would measure her two qubits and call Bob to tell him the results so he could apply his corrections.

**Predict before you step:** After all four columns execute, how many basis states should have non-zero amplitude? Based on the regrouping table, what probability should each have? Write down your predictions, then click Reset and Play to check.`,
      action: {
        type: 'click-play',
        description: 'Click Reset, then Play. Watch the state evolve through all four columns.',
      },
      highlightElements: ['playback-controls', 'state-inspector'],
    },
    {
      title: 'Why Classical Communication Is Necessary',
      content: `## Why Two Classical Bits Are Needed — and Why FTL Is Impossible

At this point, you might wonder: does Bob's qubit "become" α|0⟩ + β|1⟩ the moment Alice makes her measurement? And if so, is information transferred instantaneously?

The answer is subtle. Let us think about what Bob sees **without** Alice's classical communication.

Before Alice measures, Bob's reduced state (tracing out Alice's qubits) is a statistical mixture of all four outcomes, each with probability 1/4. The four Bob states are α|0⟩+β|1⟩, α|1⟩+β|0⟩, α|0⟩-β|1⟩, and α|1⟩-β|0⟩. Without knowing which one it is, Bob cannot do anything useful — he cannot determine α or β, he cannot reconstruct the state, and he has no way to even tell that Alice has measured yet.

After Alice measures and sends her two classical bits, Bob learns which of the four states he has and applies the corresponding correction. **Only then** does he have α|0⟩+β|1⟩.

The classical bits are the bottleneck. They travel at the speed of light (or slower). There is no shortcut. The quantum entanglement coordinates the correlations, but the actual information — the knowledge of which correction to apply — must travel classically.

This is a beautiful and precise example of how quantum mechanics respects causality despite its non-local correlations. The no-communication theorem is not violated.`,
      action: {
        type: 'read',
        description: 'Read the explanation of why FTL communication is impossible here. Click Next.',
      },
    },
    {
      title: 'Applications and Extensions',
      content: `## What Teleportation Enables in Real Quantum Computing

Quantum teleportation is not just a thought experiment. It has practical applications in several areas:

**Quantum Networks:** A quantum internet would connect quantum computers at different locations. Teleportation allows quantum states to be routed through a network without the states physically travelling (and decohering) along optical fibres. Long-distance teleportation over hundreds of kilometres has been experimentally demonstrated.

**Quantum Error Correction:** Many quantum error correction codes use teleportation-like circuits internally to move quantum information without directly touching it, which avoids introducing additional errors.

**Distributed Quantum Computing:** When a quantum computation is too large for a single device, it can be split across multiple quantum processors connected by teleportation links. Alice and Bob become two quantum chips in a data centre.

**Measurement-Based Quantum Computing (MBQC):** A paradigm where computation proceeds entirely through measurements on a pre-entangled cluster state. Gates are "teleported" through the cluster by choosing which qubits to measure and in what basis. The entire computation is driven by classical adaptive measurements.

**Quantum Key Distribution (QKD):** Entanglement-based QKD protocols (E91 by Artur Ekert) use Bell pairs to establish cryptographic keys that are provably secure against any eavesdropper — because any interception disturbs the entanglement in a detectable way.

The 1993 teleportation paper has over 10,000 citations and is one of the most influential results in the last 30 years of physics.`,
      action: {
        type: 'read',
        description: 'Read about the applications of teleportation. Click Next for the course summary.',
      },
    },
    {
      title: 'Course Summary',
      content: `## What You Have Learned: The Full Journey

You started with classical bits and arrived at quantum teleportation. Here is the complete arc:

**Lesson 1 — Classical vs Quantum Bits:**
Qubits are vectors α|0⟩ + β|1⟩ in a 2D complex Hilbert space. The amplitudes are complex numbers satisfying |α|²+|β|²=1. Measurement collapses the state. The X gate swaps basis states like a classical NOT.

**Lesson 2 — Hadamard Gate and Superposition:**
Quantum gates are unitary matrices. The Hadamard gate H creates equal superpositions. Quantum superposition is NOT classical randomness — the proof is the H-H interference experiment, where amplitudes cancel and reinforce deterministically.

**Lesson 3 — Phase and the Z Gate Family:**
Amplitudes are complex — they have magnitude AND phase. The Z gate flips the phase of |1⟩ invisibly in isolation, but the effect becomes visible through interference. Relative phase (between components) matters; global phase does not. The S and T gates provide finer phase control. Phase kickback drives nearly every quantum algorithm.

**Lesson 4 — Two Qubits and Entanglement:**
Multi-qubit systems live in tensor product spaces. The CNOT gate entangles qubits. The Bell states cannot be factored into individual qubit states. Bell's theorem proves these correlations are genuinely quantum, not classical. Entanglement does not enable FTL communication.

**Lesson 5 — Quantum Teleportation:**
The no-cloning theorem forbids copying unknown states. Teleportation uses entanglement + 2 classical bits to move a quantum state. The protocol works by encoding the state into correlations, measuring to fix the correction, and applying classical corrections on the receiving end.

You have seen the mathematical foundations of quantum computing. The path forward is algorithms, error correction, and hardware.`,
      action: {
        type: 'read',
        description: 'Read the complete course summary. You have covered the foundational concepts of quantum computing.',
      },
    },
    {
      title: 'Further Reading & What to Explore Next',
      content: `## Further Reading & Next Steps

This simulator and these five lessons are the beginning. Here is where to go deeper:

---

## Quantum Teleportation References

- [Bennett et al. 1993 — "Teleporting an Unknown Quantum State via Dual Classical and Einstein-Podolsky-Rosen Channels"](https://journals.aps.org/prl/abstract/10.1103/PhysRevLett.70.1895) — The original paper. Remarkably accessible. Worth reading the abstract and conclusion even if the full math is challenging.
- [IBM Quantum Lab: Quantum Teleportation Tutorial](https://learning.quantum.ibm.com/tutorial/quantum-teleportation) — Runnable implementation in Qiskit, with circuit diagrams and state tracking.

## Going Deeper into Quantum Computing

- **Scott Aaronson, "Quantum Computing Since Democritus"** — One of the best books on quantum computing for the mathematically literate non-physicist. Witty, rigorous, and broad in scope. Covers complexity theory, algorithms, and the conceptual foundations.
- **Nielsen & Chuang, "Quantum Computation and Quantum Information"** — The definitive graduate textbook. Chapter 1 for foundations, Chapters 5–6 for algorithms (QFT, Shor, Grover), Chapter 10 for error correction.
- [Qiskit Textbook (qiskit.org/learn)](https://qiskit.org/learn) — Free, comprehensive, runnable. Covers everything from beginner to advanced.

## Running Real Quantum Hardware

- [IBM Quantum (quantum.ibm.com)](https://quantum.ibm.com) — Run circuits on real quantum hardware for free. Start with the basic examples and work up to the Qiskit patterns.
- [Google Quantum AI](https://quantumai.google) — Home of Cirq and the 2019 "quantum supremacy" experiment.

## Conceptual and Philosophical Depth

- [Quantum Country](https://quantum.country/) — Spaced-repetition essays by Nielsen and Matuschak. Excellent for cementing what you have learned.
- **David Deutsch, "The Fabric of Reality"** — Philosophical and visionary. Argues for the many-worlds interpretation and its implications for computation.

You are now equipped to read primary sources, follow tutorials, and use real quantum hardware. The rest is practice.`,
      action: {
        type: 'read',
        description: 'Explore the reading links. You have completed all five lessons. Well done.',
      },
    },
  ],
};
