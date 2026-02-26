import type { Lesson } from './types';

export const lesson6: Lesson = {
  id: 'lesson6',
  title: 'Measurement and the Born Rule',
  description: 'Understand the precise rules governing quantum measurement — the bridge between quantum states and classical outcomes.',
  estimatedMinutes: 20,
  prerequisites: ['lesson5'],
  steps: [
    {
      title: 'Formalizing What You Already Know',
      content: `## Measurement: The Rules You Have Been Using

Throughout this course, you have been watching the State Inspector. You have seen probability bars shift, you have seen states collapse after teleportation, and you have placed Measure gates. But we never formally stated the rules.

What determines those probabilities? What exactly happens to the state after a measurement? What if you only measure one qubit of an entangled pair — what happens to the others?

This lesson answers those questions. The rules are precise and mathematical, and they have consequences that matter for everything that follows — superdense coding, quantum algorithms, and beyond.

Here is what is coming:

- **The Born rule** — the single equation that connects quantum amplitudes to classical probabilities
- **Measurement collapse** — what the state looks like after you measure
- **Irreversibility** — why measurement permanently destroys quantum information
- **Partial measurement** — what happens when you measure one qubit of an entangled system`,
      action: {
        type: 'read',
        description: 'Read the introduction. Click Next to begin.',
      },
    },
    {
      title: 'The Born Rule',
      content: `## The Born Rule: Probabilities from Amplitudes

This is the most important equation in quantum measurement. Given a state:

|ψ⟩ = α|0⟩ + β|1⟩

The probability of measuring each outcome is:

\`\`\`
P(0) = |α|²
P(1) = |β|²
\`\`\`

That is it. Square the magnitude of the amplitude, and you get the probability. This is **Max Born's rule** (1926, Nobel Prize 1954).

**Examples you already know:**

The state |0⟩ has α = 1, β = 0. So P(0) = |1|² = 1, P(1) = |0|² = 0. Measuring |0⟩ always gives 0. No surprise.

The state |+⟩ = (1/√2)(|0⟩ + |1⟩) has α = β = 1/√2. So P(0) = |1/√2|² = 1/2, P(1) = 1/2. A 50/50 coin flip.

The state |−⟩ = (1/√2)(|0⟩ − |1⟩) has α = 1/√2, β = −1/√2. So P(0) = |1/√2|² = 1/2, P(1) = |−1/√2|² = 1/2. Also 50/50.

Notice: |+⟩ and |−⟩ have **different phases** but **identical measurement probabilities**. Phase is invisible to measurement in the computational basis. You saw this in Lesson 3 — the Z gate flips phase but does not change probabilities. The Born rule explains why: the magnitude-squared operation discards phase information.

**This is fundamentally different from classical coin flipping.** A classical coin is heads or tails before you look — you just do not know which. A qubit in state |+⟩ is genuinely in both states simultaneously. The randomness is not due to ignorance. It is built into the physics.`,
      action: {
        type: 'read',
        description: 'Study the Born rule and its examples. Click Next to try it in the simulator.',
      },
    },
    {
      title: 'Your First Measurement Gate',
      content: `## Place a Measurement Gate

The circuit is set up with one qubit and a Hadamard gate at column 0. This creates the state |+⟩ = (1/√2)(|0⟩ + |1⟩).

Now drag a **Measure gate** (M) from the Gate Palette onto **qubit 0, column 1**. The M gate is in the "Operations" section of the palette — it is grey, distinct from the coloured unitary gates.

Before you run the circuit, look at the State Inspector. After the H gate executes, it will show 50% probability for |0⟩ and 50% for |1⟩ — exactly what the Born rule predicts. After the M gate executes, one of those will jump to 100% and the other to 0%.

Which one? You cannot know in advance. That is the Born rule at work.`,
      action: {
        type: 'place-gate',
        gateId: 'M',
        targetQubit: 0,
        column: 1,
        description: 'Drag a Measure gate (M) from the Gate Palette onto qubit 0, column 1.',
      },
      highlightElements: ['gate-palette', 'circuit-canvas'],
      circuitPreset: {
        numQubits: 1,
        gates: [
          { gateId: 'H', targetQubits: [0], column: 0 },
        ],
      },
    },
    {
      title: 'Observe: Superposition Collapses',
      content: `## Run the Circuit

Click **Play** (or **Step** twice) to execute the circuit.

**After the H gate (column 0):** The State Inspector shows |0⟩ and |1⟩ each at ~50%. The qubit is in superposition. The Bloch sphere points along the +X axis — the equator, halfway between |0⟩ and |1⟩.

**After the M gate (column 1):** One outcome jumps to 100%. The measurement result banner appears, showing which value was obtained. The Bloch sphere snaps to either the north pole (|0⟩) or south pole (|1⟩).

The superposition is gone. The state has collapsed to a definite classical value.

**Try it again:** Click **Reset**, then **Play** again. You will likely get a different outcome. Each run is an independent random sample from the Born rule distribution. Over many runs, you would see roughly half |0⟩ and half |1⟩.

**Post-measurement state:** After measuring outcome 0, the state is |0⟩. After outcome 1, the state is |1⟩. The state is updated to be consistent with the measurement result — this is called **projection**. All probability amplitude is concentrated on the observed outcome, and everything else is zeroed out and renormalized.`,
      action: {
        type: 'click-play',
        description: 'Click Play to run the circuit. Observe the state collapse. Try Reset + Play multiple times.',
      },
      highlightElements: ['playback-controls', 'state-inspector'],
      circuitPreset: {
        numQubits: 1,
        gates: [
          { gateId: 'H', targetQubits: [0], column: 0 },
          { gateId: 'M', targetQubits: [0], column: 1 },
        ],
      },
    },
    {
      title: 'Measurement Is Irreversible',
      content: `## The Proof: Measurement Destroys Information

In Lesson 2, you learned that H applied twice gives back the original state: H × H = I. Starting from |0⟩, the circuit H → H returns |0⟩ with certainty. Interference is perfect.

What happens if we put a measurement between the two H gates?

The circuit below is **H → M → H**, starting from |0⟩.

\`\`\`
|0⟩ → [H] → [M] → [H] → ?
\`\`\`

**Without measurement (H → H):** |0⟩ → |+⟩ → |0⟩. Deterministic.

**With measurement (H → M → H):**

- H maps |0⟩ to |+⟩ = (1/√2)(|0⟩ + |1⟩)
- M collapses to either |0⟩ (with prob 1/2) or |1⟩ (with prob 1/2)
- If collapsed to |0⟩: the second H gives |+⟩ = (1/√2)(|0⟩ + |1⟩)
- If collapsed to |1⟩: the second H gives |−⟩ = (1/√2)(|0⟩ − |1⟩)

Either way, the final state is a superposition again — but it is **not** |0⟩. The measurement broke the interference. The second H cannot "undo" the first because the measurement destroyed the phase relationship that interference depends on.

Click **Play** and verify. The State Inspector will show ~50/50 for |0⟩ and |1⟩ at the end — not the deterministic 100% |0⟩ that H-H produces. (There is no final Measure gate here, so you are seeing the superposition state after the second H. If the mid-circuit measurement collapsed to |0⟩, the second H produces |+⟩. If it collapsed to |1⟩, the second H produces |−⟩. Either way, the final state is a superposition — not the definite |0⟩ that perfect interference would give.) Measurement is a one-way door.`,
      action: {
        type: 'click-play',
        description: 'Click Play. Compare the final state with the H-H circuit from Lesson 2 — this time you will NOT get |0⟩ deterministically.',
      },
      circuitPreset: {
        numQubits: 1,
        gates: [
          { gateId: 'H', targetQubits: [0], column: 0 },
          { gateId: 'M', targetQubits: [0], column: 1 },
          { gateId: 'H', targetQubits: [0], column: 2 },
        ],
      },
    },
    {
      title: 'Partial Measurement: The Setup',
      content: `## Measuring Part of an Entangled System

So far we have measured single qubits. The Born rule works the same way for multi-qubit systems — but partial measurement (measuring one qubit while leaving others alone) reveals something remarkable.

Start with the Bell state from Lesson 4:

\`\`\`
|Φ+⟩ = (1/√2)(|00⟩ + |11⟩)
\`\`\`

The Born rule for a two-qubit measurement gives:

\`\`\`
P(00) = |1/√2|² = 1/2
P(01) = |0|²    = 0
P(10) = |0|²    = 0
P(11) = |1/√2|² = 1/2
\`\`\`

But what if we only measure **qubit 0**?

We sum over all possibilities for qubit 1:
- P(qubit 0 = 0) = P(00) + P(01) = 1/2 + 0 = 1/2
- P(qubit 0 = 1) = P(10) + P(11) = 0 + 1/2 = 1/2

So qubit 0 gives a random 50/50 result. But here is the key:

**If qubit 0 measures 0:** The only surviving term is |00⟩. After renormalization, the state is |00⟩. Qubit 1 is now **definitely |0⟩**.

**If qubit 0 measures 1:** The only surviving term is |11⟩. After renormalization, the state is |11⟩. Qubit 1 is now **definitely |1⟩**.

Measuring one qubit of an entangled pair **instantly determines** the state of the other. This is entanglement made visible through measurement.`,
      action: {
        type: 'read',
        description: 'Study the partial measurement math. Click Next to build and run it.',
      },
    },
    {
      title: 'Build a Partial Measurement',
      content: `## Measure One Qubit of a Bell Pair

The circuit is pre-loaded with the Bell state creation circuit from Lesson 4: H on qubit 0 at column 0, then CNOT at column 1.

Place a **Measure gate** on **qubit 0 at column 2**. This measures only Alice's qubit — Bob's qubit (qubit 1) is left unmeasured.

After you run this, watch both qubits in the State Inspector:

- After column 0 (H): qubit 0 enters superposition, qubit 1 unchanged
- After column 1 (CNOT): the Bell state forms — |00⟩ and |11⟩ each at 50%
- After column 2 (M on qubit 0): **both** qubits collapse together

Even though we only placed a measurement on qubit 0, the entanglement means qubit 1's fate is sealed the moment qubit 0 is measured. They collapse in unison.`,
      action: {
        type: 'place-gate',
        gateId: 'M',
        targetQubit: 0,
        column: 2,
        description: 'Place a Measure gate (M) on qubit 0, column 2.',
      },
      highlightElements: ['gate-palette', 'circuit-canvas'],
      circuitPreset: {
        numQubits: 2,
        gates: [
          { gateId: 'H', targetQubits: [0], column: 0 },
          { gateId: 'CX', targetQubits: [0, 1], column: 1 },
        ],
      },
    },
    {
      title: 'Observe: Entangled Collapse',
      content: `## Run the Partial Measurement Circuit

Click **Play** and step through all three columns. Watch the State Inspector carefully.

**After column 0 (H on qubit 0):**
- |00⟩: ~50%
- |10⟩: ~50%
- Qubit 0 is in superposition, qubit 1 is still |0⟩. No entanglement yet.

**After column 1 (CNOT):**
- |00⟩: ~50%
- |11⟩: ~50%
- The Bell state. Both qubits are entangled. Check the Bloch sphere for either qubit — the vector is at the **centre of the sphere**, because neither qubit has a well-defined individual state when entangled.

**After column 2 (M on qubit 0):**
- Either |00⟩: 100% or |11⟩: 100%
- The measurement result banner shows qubit 0's value. But look at qubit 1 — it has the **same value**, even though it was not measured.
- The Bloch sphere vectors snap from the centre to a pole. Both qubits now have definite individual states again.

**Click Reset and Play several times.** You will see that the outcomes are always correlated: 00 or 11, never 01 or 10. This is entanglement revealed by measurement.`,
      action: {
        type: 'click-play',
        description: 'Click Play. Watch both qubits collapse together. Try Reset + Play multiple times to see the correlation.',
      },
      highlightElements: ['playback-controls', 'state-inspector'],
      circuitPreset: {
        numQubits: 2,
        gates: [
          { gateId: 'H', targetQubits: [0], column: 0 },
          { gateId: 'CX', targetQubits: [0, 1], column: 1 },
          { gateId: 'M', targetQubits: [0], column: 2 },
        ],
      },
    },
    {
      title: 'What Measurement Does NOT Tell You',
      content: `## The Limits of Measurement

Measurement gives you a classical bit — a 0 or a 1. That is all. It does **not** tell you:

**The amplitudes before measurement.** If you measure |+⟩ and get 0, you cannot tell whether the pre-measurement state was |+⟩ = (1/√2)(|0⟩+|1⟩), or |0⟩ itself, or any other state with non-zero amplitude on |0⟩. The measurement result is consistent with infinitely many pre-measurement states.

**The phase of the state.** States |+⟩ = (1/√2)(|0⟩+|1⟩) and |−⟩ = (1/√2)(|0⟩−|1⟩) give identical measurement statistics: 50/50. A single computational-basis measurement cannot distinguish them. (To detect phase, you must interfere before measuring — exactly what the H-Z-H circuit in Lesson 3 does.)

**Whether the qubit was in a superposition or a mixture.** A qubit that is "50/50 due to superposition" and a qubit that is "50/50 because someone flipped a classical coin and set it to |0⟩ or |1⟩" look the same under a single measurement.

This is why you cannot learn an unknown quantum state |ψ⟩ = α|0⟩ + β|1⟩ from a single measurement — and by the no-cloning theorem (Lesson 5), you cannot make copies to measure many times. Learning a quantum state requires many identically prepared copies, measured in different bases — a process called **quantum state tomography**.

**The deferred measurement principle:** An important practical result. Moving all measurements to the end of a circuit does not change the statistics of any outcome. This is why Lesson 5's teleportation circuit could trace the full state evolution without placing explicit Measure gates — the math works the same whether you measure early or late. Most quantum frameworks and real hardware prefer deferring measurement for exactly this reason.`,
      action: {
        type: 'read',
        description: 'Read about the fundamental limits of quantum measurement. Click Next for the summary.',
      },
    },
    {
      title: 'Lesson 6 Summary & Further Reading',
      content: `## Summary

**The Born rule** is the bridge between quantum states and classical observations:

\`\`\`
P(outcome) = |amplitude|²
\`\`\`

**Measurement is non-unitary.** Unlike quantum gates (which are reversible, deterministic, and preserve all information), measurement is irreversible, probabilistic, and destroys superposition. The H-M-H experiment proves this: inserting a measurement between two Hadamards breaks the interference that would otherwise return |0⟩.

**Post-measurement state.** After measuring outcome k, all amplitudes inconsistent with k are zeroed out and the remaining amplitudes are renormalized. The state "projects" onto the measured outcome.

**Partial measurement.** Measuring one qubit of an entangled pair collapses both qubits. The unmeasured qubit's state is determined by the measurement outcome on the measured qubit. This is entanglement made operational.

**Phase is invisible** to computational-basis measurement. To detect phase differences, you must apply interference (e.g., a Hadamard) before measuring.

In **Lesson 7**, we use measurement as a tool: Alice and Bob will exploit entanglement and measurement to transmit two classical bits by sending a single qubit — the superdense coding protocol.

---

## Further Reading

- [Qiskit Textbook: Single Qubit Gates and Measurement](https://learning.quantum.ibm.com/course/basics-of-quantum-information/single-systems) — IBM's treatment of single-qubit measurement with runnable examples.
- [Quantum Country: Quantum Computing for the Very Curious](https://quantum.country/qcvc) — Nielsen and Matuschak's spaced-repetition essay covers measurement throughout.
- **Nielsen & Chuang, "Quantum Computation and Quantum Information," Section 2.2** — The formal postulates of quantum mechanics, including the measurement postulate.`,
      action: {
        type: 'read',
        description: 'Review the summary. Click Next to complete Lesson 6.',
      },
    },
  ],
};
