import type { Lesson } from './types';

export const lesson4: Lesson = {
  id: 'lesson4',
  title: 'Two Qubits and Entanglement',
  description: 'Expand to two qubits, learn the CNOT gate, and create entangled Bell states.',
  estimatedMinutes: 25,
  prerequisites: ['lesson3'],
  steps: [
    {
      title: 'Scaling Up: Two Qubits',
      content: `## Two Qubits: A Four-Dimensional State Space

Everything so far has involved a single qubit — a 2-dimensional state vector [α, β]ᵀ. Now we add a second qubit, and the mathematics expands significantly.

With **two qubits**, the computational basis states are all possible combinations of the individual qubit values:

- **|00⟩** — qubit 0 is 0, qubit 1 is 0
- **|01⟩** — qubit 0 is 0, qubit 1 is 1
- **|10⟩** — qubit 0 is 1, qubit 1 is 0
- **|11⟩** — qubit 0 is 1, qubit 1 is 1

The general two-qubit state is a linear combination of all four:

**|ψ⟩ = α₀₀|00⟩ + α₀₁|01⟩ + α₁₀|10⟩ + α₁₁|11⟩**

where |α₀₀|² + |α₀₁|² + |α₁₀|² + |α₁₁|² = 1.

This is a **4-dimensional complex vector**. In general, n qubits require a 2ⁿ-dimensional state vector. This exponential growth is why simulating quantum computers classically is hard: 50 qubits need a vector of 2⁵⁰ ≈ 10¹⁵ complex numbers. For 300 qubits, the state vector would have more entries than there are atoms in the observable universe.

Note: this exponential state space is necessary but not sufficient for quantum advantage. How you exploit it matters just as much as having it.`,
      action: {
        type: 'read',
        description: 'Read about the two-qubit state space. Click Next.',
      },
    },
    {
      title: 'Combining States: The Tensor Product',
      content: `## The Tensor Product: How States Combine

If qubit A is in state |ψ_A⟩ = α|0⟩ + β|1⟩ and qubit B is in state |ψ_B⟩ = γ|0⟩ + δ|1⟩, then the combined two-qubit state is their **tensor product** |ψ_A⟩ ⊗ |ψ_B⟩:

\`\`\`
|ψ_A⟩ ⊗ |ψ_B⟩ = (α|0⟩ + β|1⟩) ⊗ (γ|0⟩ + δ|1⟩)
             = αγ|00⟩ + αδ|01⟩ + βγ|10⟩ + βδ|11⟩
\`\`\`

As a column vector (in the ordered basis {|00⟩, |01⟩, |10⟩, |11⟩}):

\`\`\`
|ψ_A⟩ ⊗ |ψ_B⟩ = [αγ, αδ, βγ, βδ]ᵀ
\`\`\`

A state that can be written in this factored form — as the tensor product of two individual qubit states — is called a **product state** or **separable state**. In a product state, the two qubits are independent: measuring one gives no information about the other.

**Example:** |0⟩ ⊗ |0⟩ = [1,0]ᵀ ⊗ [1,0]ᵀ = [1×1, 1×0, 0×1, 0×0]ᵀ = [1,0,0,0]ᵀ = |00⟩.

**The key question:** Are ALL two-qubit states product states? Could every two-qubit state [a,b,c,d]ᵀ be factored as [αγ, αδ, βγ, βδ]ᵀ?

The answer is **no**. And the states that cannot be factored are called **entangled** — they are the most distinctively quantum objects in the theory. But to create them, we need a two-qubit gate.`,
      action: {
        type: 'read',
        description: 'Work through the tensor product calculation. Click Next to meet the CNOT gate.',
      },
    },
    {
      title: 'The CNOT Gate',
      content: `## The CNOT Gate: Controlled NOT

The **CNOT gate** (Controlled-NOT, also written CX) is the most important two-qubit gate. It has one **control qubit** and one **target qubit**. Its action:

- If the control is **|0⟩**: do nothing to the target.
- If the control is **|1⟩**: flip the target (apply X to it).

As a truth table on computational basis states:

\`\`\`
CNOT|00⟩ = |00⟩  (control=0, target unchanged)
CNOT|01⟩ = |01⟩  (control=0, target unchanged)
CNOT|10⟩ = |11⟩  (control=1, target flipped: 0→1)
CNOT|11⟩ = |10⟩  (control=1, target flipped: 1→0)
\`\`\`

The 4×4 unitary matrix (in the basis |00⟩, |01⟩, |10⟩, |11⟩):

\`\`\`
CNOT = [[1,0,0,0],
        [0,1,0,0],
        [0,0,0,1],
        [0,0,1,0]]
\`\`\`

On classical inputs (all amplitudes 0 or 1), CNOT is just a conditional NOT — nothing surprising. But what happens when the **control is in superposition**? This is where entanglement is born.`,
      action: {
        type: 'read',
        description: 'Read about the CNOT gate and verify the truth table against the matrix. Click Next.',
      },
    },
    {
      title: 'Creating a Bell State: The Math',
      content: `## Creating Entanglement: The Bell State Circuit

The standard circuit for creating entanglement: apply **H to qubit 0**, then **CNOT with qubit 0 as control and qubit 1 as target**.

Starting state: |00⟩ = [1,0,0,0]ᵀ.

**Step 1: H on qubit 0 (qubit 1 untouched)**

H ⊗ I applied to |00⟩:

\`\`\`
(H ⊗ I)|00⟩ = (H|0⟩) ⊗ (I|0⟩)
             = [(1/√2)(|0⟩ + |1⟩)] ⊗ |0⟩
             = (1/√2)|00⟩ + (1/√2)|10⟩
             = [1/√2, 0, 1/√2, 0]ᵀ
\`\`\`

Qubit 0 is in superposition; qubit 1 is still |0⟩. This is still a product state.

**Step 2: CNOT(control=0, target=1)**

\`\`\`
CNOT × [1/√2, 0, 1/√2, 0]ᵀ

= CNOT × [(1/√2)|00⟩ + (1/√2)|10⟩]
= (1/√2)CNOT|00⟩ + (1/√2)CNOT|10⟩
= (1/√2)|00⟩ + (1/√2)|11⟩
= [1/√2, 0, 0, 1/√2]ᵀ
\`\`\`

The state is now **(1/√2)(|00⟩ + |11⟩)**. This is the **Φ+ Bell state**, named after John Bell.

**Can this be written as a product state?** We need α, β, γ, δ such that [αγ, αδ, βγ, βδ] = [1/√2, 0, 0, 1/√2].

From αγ = 1/√2 (non-zero) and αδ = 0: since α ≠ 0, we need δ = 0.
But then βδ = 0 ≠ 1/√2. **Contradiction.** The state cannot be factored — it is genuinely entangled.`,
      action: {
        type: 'read',
        description: 'Work through both steps and the separability argument. Click Next to build the circuit.',
      },
    },
    {
      title: 'Build the Bell State Circuit',
      content: `## Your Turn: Build the Bell State Circuit

The simulator should now be in two-qubit mode. If you see only one qubit wire, look for a way to add a second qubit (the circuit canvas controls should allow this).

Build the following circuit:

1. **H gate** at qubit 0, column 0
2. **CNOT gate** (CX in the palette) with control on qubit 0 and target on qubit 1, at column 1

In the Gate Palette, the CNOT gate (labelled "CX") is a two-qubit gate. Drag it onto the circuit — your simulator should show the control dot on qubit 0 and the target (⊕ symbol) on qubit 1.

This is the most famous two-gate quantum circuit. It produces a Bell state from the |00⟩ initial state. Before running, the state inspector should show |00⟩ at 100%.

The circuit is compact, but what it produces — genuine quantum entanglement — baffled physicists for decades after quantum mechanics was first formulated.`,
      action: {
        type: 'place-gate',
        gateId: 'CX',
        targetQubit: 1,
        column: 1,
        description: 'Place H at qubit 0, column 0. Then place CNOT (CX) with control at qubit 0 and target at qubit 1, column 1.',
      },
      highlightElements: ['gate-palette', 'circuit-canvas'],
      circuitPreset: {
        numQubits: 2,
        gates: [],
      },
    },
    {
      title: 'Step Through: Watch Entanglement Form',
      content: `## Click Reset, Then Step Through

Click **Reset** to return to |00⟩. Then click **Step** twice, watching the state inspector carefully.

**After Step 1 (H on qubit 0):**

The state inspector should show a two-qubit state. In the four-state basis:
- |00⟩ ≈ 50% probability
- |10⟩ ≈ 50% probability
- |01⟩ = 0%
- |11⟩ = 0%

This is still a product state — qubit 0 is in (|0⟩+|1⟩)/√2, qubit 1 is still |0⟩. Qubits are independent here.

**After Step 2 (CNOT):**

- |00⟩ ≈ 50% probability
- |11⟩ ≈ 50% probability
- |01⟩ = 0%
- |10⟩ = 0%

The |10⟩ term (control=1, target=0) became |11⟩ (control=1, target flipped to 1). The |00⟩ term was unchanged (control=0).

The two qubits are now entangled. Notice that **neither qubit individually has a well-defined state** — you cannot describe qubit 0 or qubit 1 alone with a single state vector anymore. The state only has meaning as a property of the **pair together**.`,
      action: {
        type: 'click-step',
        description: 'Click Reset, then Step twice. Watch the state inspector change at each step.',
      },
      highlightElements: ['playback-controls', 'state-inspector'],
    },
    {
      title: 'What Entanglement Really Means',
      content: `## Understanding Entanglement: The Correlations

The Bell state (1/√2)(|00⟩ + |11⟩) has a remarkable property. If you measure qubit 0:

- With probability 1/2 you get **0** — and qubit 1 is **instantly in state |0⟩** (because the |00⟩ term was selected).
- With probability 1/2 you get **1** — and qubit 1 is **instantly in state |1⟩** (because the |11⟩ term was selected).

The outcomes are **perfectly correlated**. Measure qubit 0 first, and you can predict with certainty what you will get when you measure qubit 1 — without touching qubit 1 at all.

This correlation is not like a pair of matching gloves. When you put one red glove in each of two boxes and ship them to opposite ends of the Earth, looking in one box tells you the other colour. But that correlation was there from the start — the gloves always had definite colours.

In quantum mechanics, Bell's theorem (1964) proves mathematically that entangled qubits **cannot** have pre-existing definite values. The correlations are stronger than any classical "hidden variable" model can produce. This has been experimentally confirmed many times (Aspect 1982, and many subsequent loophole-free experiments). The measurement outcomes are genuinely random, and their correlation is not due to pre-existing information.

This is deeply strange, but it is what the universe does.`,
      action: {
        type: 'read',
        description: 'Read about what the correlations mean — and what they do not mean. Click Next.',
      },
    },
    {
      title: 'What Entanglement Does NOT Mean',
      content: `## Entanglement Myths: What It Cannot Do

Entanglement generates a lot of popular science hype, much of it wrong. Let us clear up the two biggest misconceptions.

**Myth 1: "Entanglement allows faster-than-light communication."**

It does not. Here is why: when Alice measures qubit 0, her result is random (50% chance of 0, 50% chance of 1). She cannot control which outcome she gets. Bob, on the other side of the galaxy, also gets a random result. His result is correlated with Alice's — but he does not know that yet. He cannot tell from his local measurement alone whether Alice has measured or not.

To verify the correlation, Alice must communicate her result to Bob through ordinary classical channels (at light speed or slower). Only then can Bob compare notes and confirm the correlation. No information travels faster than light.

This is formalized in the **no-communication theorem**: it is provably impossible to send information using entanglement alone.

**Myth 2: "Measuring one qubit collapses the other one, which is action at a distance."**

This is a matter of interpretation. In the Copenhagen interpretation, yes — measurement collapses the joint state. But no energy or information is transmitted; you just update your knowledge of the correlated system. Alternative interpretations (many-worlds, relational quantum mechanics) do not even use "collapse" as a primitive concept. The physics — the probabilities, the correlations — are the same across all interpretations.

What entanglement DOES enable: **quantum teleportation, superdense coding, quantum key distribution (QKD), and quantum error correction**. These are genuinely remarkable applications, but they all still respect the speed of light.`,
      action: {
        type: 'read',
        description: 'Read carefully — these myths are everywhere. Click Next.',
      },
    },
    {
      title: "Bell's Theorem: Why These Correlations Are Quantum",
      content: `## Bell's Theorem: The Proof That Quantum Correlations Are Genuine

In 1964, physicist John Bell proved something remarkable: no theory based on local hidden variables — no theory where the qubits secretly have pre-determined values, regardless of how the values were set — can reproduce all the predictions of quantum mechanics.

Specifically, Bell derived an inequality (the **CHSH inequality**, in its most tested form) that bounds the correlations any local hidden-variable theory can produce:

**|E(a,b) + E(a,b') + E(a',b) - E(a',b')| ≤ 2**

where E(a,b) is the correlation between measurement outcomes when Alice measures along axis a and Bob along axis b. In quantum mechanics, measuring the Bell state at optimal angles gives:

**|E| = 2√2 ≈ 2.828**

This violates the classical bound of 2. The violation cannot be explained by pre-existing hidden variables.

This has been tested in increasingly loophole-free experiments. The 2022 Nobel Prize in Physics was awarded to Alain Aspect, John Clauser, and Anton Zeilinger for this experimental work. The conclusion: quantum correlations are **genuinely non-classical**. There is no hidden mechanism that secretly pre-determines the outcomes.

You do not need to follow all the math to appreciate the implication: when two entangled particles are measured, neither had a definite value before being measured. The correlation is not due to shared information planted at creation. Quantum mechanics is just stranger than that.`,
      action: {
        type: 'read',
        description: "Read about Bell's theorem — one of the deepest results in 20th-century physics. Click Next.",
      },
    },
    {
      title: 'The Four Bell States',
      content: `## The Four Bell States: A Complete Basis

There are four maximally entangled two-qubit states, collectively called the **Bell basis** (or Bell states). Starting from |00⟩ and using different initial circuits, you can create all four:

**|Φ+⟩ = (1/√2)(|00⟩ + |11⟩)** — created by H on qubit 0 then CNOT. The one we just built.

**|Φ-⟩ = (1/√2)(|00⟩ - |11⟩)** — add a Z gate on qubit 0 before or after the H: HZH = X... or simply apply Z after creating |Φ+⟩.

**|Ψ+⟩ = (1/√2)(|01⟩ + |10⟩)** — apply X to qubit 1 before the entangling circuit. (Or start from |01⟩.)

**|Ψ-⟩ = (1/√2)(|01⟩ - |10⟩)** — combine the X and Z modifications.

These four states form an **orthonormal basis** for the 4-dimensional two-qubit Hilbert space. Any two-qubit state can be written as a linear combination of them. They are also maximally entangled — they contain the maximum possible entanglement (one ebit, the unit of entanglement).

The Bell basis is used throughout quantum information: in quantum teleportation (Lesson 5), in quantum error correction, in quantum key distribution, and in Bell test experiments.

The **SWAP gate** is another useful two-qubit gate — it exchanges the states of two qubits: SWAP|ψ⟩|φ⟩ = |φ⟩|ψ⟩. It can be decomposed into three CNOT gates.`,
      action: {
        type: 'read',
        description: 'Read about the four Bell states. Try building |Φ-⟩ by adding a Z gate to the circuit. Click Next.',
      },
    },
    {
      title: 'Lesson 4 Summary & Further Reading',
      content: `## Summary

**Two-qubit states** live in a 4-dimensional Hilbert space spanned by |00⟩, |01⟩, |10⟩, |11⟩. In general, n qubits need a 2ⁿ-dimensional state vector.

**The tensor product** A ⊗ B describes how two independent qubit states combine into a joint state. States that can be written this way are called product states (separable).

**The CNOT gate** flips the target qubit if and only if the control qubit is |1⟩. Its 4×4 matrix permutes the basis states: |10⟩ ↔ |11⟩.

**Entanglement** is created when a qubit in superposition controls a CNOT gate. The resulting state (like |Φ+⟩ = (1/√2)(|00⟩ + |11⟩)) cannot be written as a product state — the two qubits do not have independent states.

**Bell's theorem** proves that entangled correlations are stronger than any local hidden-variable model can produce. They are experimentally confirmed and genuinely non-classical. This earned the 2022 Nobel Prize.

**Entanglement does NOT allow faster-than-light communication** — the no-communication theorem forbids it. Alice's measurement result is random; information still travels at light speed.

In **Lesson 5** we put everything together for the crown jewel: quantum teleportation.

---

## Further Reading

- [Veritasium: Bell's Theorem — The Quantum Venn Diagram Paradox](https://www.youtube.com/watch?v=zcqZHYo7ONs) — The clearest accessible explanation of Bell's theorem. Essential viewing.
- **N. David Mermin, "Quantum Computer Science: An Introduction," Chapter 1** — Written by a physicist who prioritises clarity. Covers entanglement with great precision.
- [IBM Quantum Learning: Entanglement in Action](https://learning.quantum.ibm.com/course/basics-of-quantum-information/entanglement-in-action) — Runnable examples of Bell state creation and measurement in Qiskit.`,
      action: {
        type: 'read',
        description: 'Review the summary and reading links. Click Next to finish Lesson 4.',
      },
    },
  ],
};
