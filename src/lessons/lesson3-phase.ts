import type { Lesson } from './types';

export const lesson3: Lesson = {
  id: 'lesson3',
  title: 'Phase and the Z Gate Family',
  description: 'Discover the hidden dimension of quantum amplitudes — phase — and learn why it drives all interference.',
  estimatedMinutes: 18,
  prerequisites: ['lesson2'],
  steps: [
    {
      title: 'The Hidden Dimension: Phase',
      content: `## Phase: The Invisible Knob That Controls Everything

In Lesson 2 we saw that the Hadamard gate maps |1⟩ to (1/√2)|0⟩ **- (1/√2)|1⟩ — note the minus sign. We used this minus sign to engineer destructive interference on the |1⟩ term. But we glossed over something important: where does that minus sign come from, and is it the only kind of "phase" we can give an amplitude?

Quantum amplitudes are **complex numbers**, not just real numbers. A complex number z = a + bi has:
- A **magnitude** |z| = √(a² + b²)
- A **phase** θ = arctan(b/a) — the angle in the complex plane

In polar form: z = |z| e^(iθ) = |z|(cos θ + i sin θ)

The **probability** of a measurement outcome depends only on the magnitude: P = |z|². The phase θ is completely invisible to a direct measurement of that single term. But — and this is the key — the phase matters enormously when two amplitudes **interfere**, because the resulting magnitude depends on both their individual magnitudes AND their relative phases.

Think of it like waves on water: two waves of equal height will cancel completely if they arrive exactly out of phase (one crests where the other troughs) and double if they are perfectly in phase. The same arithmetic governs quantum amplitudes.

So far we have only used real phases: +1 (phase = 0°) and -1 (phase = 180°). The Z gate family introduces finer phase rotations: 90°, 45°, and arbitrary angles. These give quantum circuits tremendous expressive power.`,
      action: {
        type: 'read',
        description: 'Read about complex amplitudes and phase. Click Next.',
      },
    },
    {
      title: 'The Z Gate: Phase Flip on |1⟩',
      content: `## The Pauli-Z Gate

The **Pauli-Z gate** has the matrix:

**Z = [[1, 0], [0, -1]]**

Its action on the basis states:

\`\`\`
Z|0⟩ = [[1,0],[0,-1]] × [1,0]ᵀ = [1,0]ᵀ = |0⟩

Z|1⟩ = [[1,0],[0,-1]] × [0,1]ᵀ = [0,-1]ᵀ = -|1⟩
\`\`\`

Z leaves |0⟩ unchanged and multiplies the amplitude of |1⟩ by -1 (a 180° phase rotation).

**The measurement paradox:** What is the probability of measuring |1⟩ in the state -|1⟩?

P(|1⟩) = |-1|² = 1

It is still 100%! The minus sign is phase — it contributes nothing to the measurement probability of that individual term. So Z applied to a computational basis state (|0⟩ or |1⟩) changes absolutely nothing measurable.

If phase is invisible, why does Z matter at all?

Because phase becomes **visible through interference**. When an amplitude with a phase of -1 combines with an amplitude of +1 during interference (for example, inside a subsequent Hadamard gate), they cancel rather than reinforce. The circuit's output changes dramatically.

To see this, we need to put the qubit in superposition first, apply Z, and then let the modified phases interfere. That is exactly what the H-Z-H circuit does.`,
      action: {
        type: 'read',
        description: 'Understand why phase is invisible in isolation but powerful in interference. Click Next.',
      },
    },
    {
      title: 'The H-Z-H Circuit',
      content: `## Phase Kickback: H → Z → H

Let us trace the state vector through the circuit H, then Z, then H, starting from |0⟩.

**Step 1: H|0⟩**

\`\`\`
H|0⟩ = (1/√2)|0⟩ + (1/√2)|1⟩
\`\`\`

Both amplitudes are +1/√2.

**Step 2: Z applied to that superposition**

Z only affects the |1⟩ component:

\`\`\`
Z[(1/√2)|0⟩ + (1/√2)|1⟩] = (1/√2)Z|0⟩ + (1/√2)Z|1⟩
                           = (1/√2)|0⟩ + (1/√2)(-|1⟩)
                           = (1/√2)|0⟩ - (1/√2)|1⟩
\`\`\`

The state is now [1/√2, -1/√2]ᵀ. The measurement probabilities are STILL 50/50 — the phase flip is still invisible.

**Step 3: Second H applied to [1/√2, -1/√2]ᵀ**

\`\`\`
H × [1/√2, -1/√2]ᵀ

Top entry:    (1/√2)(1/√2) + (1/√2)(-1/√2)  =  1/2 - 1/2  =  0
Bottom entry: (1/√2)(1/√2) + (-1/√2)(-1/√2) =  1/2 + 1/2  =  1
\`\`\`

Result: [0, 1]ᵀ = **|1⟩**

**Without Z:** HH|0⟩ = |0⟩ (we showed this in Lesson 2 — constructive interference on |0⟩, destructive on |1⟩)

**With Z in between:** HZH|0⟩ = |1⟩ (now constructive on |1⟩, destructive on |0⟩)

A phase flip that changed nothing observable by itself completely reversed the interference outcome. This is the essence of **phase kickback** — a mechanism used in every major quantum algorithm.`,
      action: {
        type: 'read',
        description: 'Work through all three steps of the arithmetic yourself. The reversal is the key insight. Click Next.',
      },
    },
    {
      title: 'Build the H-Z-H Circuit',
      content: `## Your Turn: Build H → Z → H

Let us verify this in the simulator. Click **Reset** to clear the qubit to |0⟩.

Now place three gates in sequence:

1. **H gate** at qubit 0, column 0
2. **Z gate** at qubit 0, column 1
3. **H gate** at qubit 0, column 2

You should see three gates lined up on the qubit wire. Before running, the state is still |0⟩ with 100% probability.

**Your prediction:** Based on the calculation on the previous screen, the final state after HZH should be **|1⟩ with 100% probability**. The intermediate state (after H but before Z) is a 50/50 superposition — only Z can tell the difference between this state and the [1/√2, -1/√2]ᵀ state (they have identical probabilities), but that difference becomes visible after the final H.`,
      action: {
        type: 'place-gate',
        gateId: 'Z',
        targetQubit: 0,
        column: 1,
        description: 'Click Reset. Then place H at column 0, Z at column 1, H at column 2 on qubit 0.',
      },
      highlightElements: ['gate-palette', 'circuit-canvas'],
    },
    {
      title: 'Step Through: Phase Becomes Visible',
      content: `## Click Reset, Then Step Through

Click **Reset** to restore |0⟩. Now click **Step** three times, pausing to observe the State Inspector after each step:

**After Step 1 (H applied):** State is (0.707)|0⟩ + (0.707)|1⟩. Both probabilities ≈ 50%. Amplitudes are equal and positive.

**After Step 2 (Z applied):** The State Inspector should still show ≈ 50% for each outcome! But the amplitude of |1⟩ has flipped sign: the state is now (0.707)|0⟩ - (0.707)|1⟩. The probabilities look the same, but the phase has changed. (Check if the simulator shows the amplitude sign in the display.)

**After Step 3 (second H applied):** State collapses to **|1⟩ with 100% probability**. The phase flip caused the interference to go the other way — constructive on |1⟩ this time, destructive on |0⟩.

This is direct experimental evidence that phase is real and physical. Without it, the two H-H circuits (with and without Z) should behave identically — but they do not. Something must be different about the intermediate state, and that something is phase.`,
      action: {
        type: 'click-step',
        description: 'Click Step three times, watching the State Inspector after each step. Note the phase flip after Z.',
      },
      highlightElements: ['playback-controls', 'state-inspector'],
    },
    {
      title: 'Global Phase vs Relative Phase',
      content: `## A Key Distinction: Global vs Relative Phase

Not all phases are equal in their physical consequences. There is a critical distinction:

**Global phase:** Multiplying the ENTIRE state vector by a complex number e^(iθ). For example, replacing |ψ⟩ with e^(iπ/4)|ψ⟩. This has **no observable consequences whatsoever** — all measurement probabilities and expectation values are unchanged. The states |ψ⟩ and e^(iθ)|ψ⟩ are physically identical. We say they differ only by a global phase and represent the same physical state.

*Why?* Because probability = |amplitude|². If |ψ⟩ has amplitude α for some outcome, then e^(iθ)|ψ⟩ has amplitude e^(iθ)α. But |e^(iθ)α|² = |e^(iθ)|² × |α|² = 1 × |α|² = |α|². The phase cancels out.

**Relative phase:** Different phases on different components of the state. For example, the state α|0⟩ + e^(iθ)β|1⟩ has a relative phase of θ between the |0⟩ and |1⟩ terms. This **does** have observable consequences — specifically, it affects interference, as we just demonstrated with Z.

This distinction matters practically: when you design quantum circuits, you can ignore global phases (they simplify calculations), but you must track relative phases carefully (they determine the output).

The Z gate adds a relative phase of π (a sign flip) to the |1⟩ component relative to |0⟩. That is exactly what caused the interference reversal in HZH.`,
      action: {
        type: 'read',
        description: 'Understand global vs relative phase — a distinction every quantum programmer needs. Click Next.',
      },
    },
    {
      title: 'The S and T Gates: Finer Phase Control',
      content: `## Partial Phase Rotations: S and T

The Z gate does a 180° (π radian) phase rotation on |1⟩. But we can do finer rotations:

**S gate (Phase gate):**

**S = [[1, 0], [0, i]]**

Here i = √(-1) is the imaginary unit. S applies a 90° (π/2 radian) phase rotation to |1⟩:

- S|0⟩ = |0⟩ (unchanged)
- S|1⟩ = i|1⟩ (phase rotated by 90°)

Note: S² = Z (two quarter-turns make a half-turn).

**T gate (π/8 gate):**

**T = [[1, 0], [0, e^(iπ/4)]]**

Where e^(iπ/4) = (1/√2)(1 + i) ≈ 0.707 + 0.707i. This is a 45° (π/4 radian) phase rotation.

- T|0⟩ = |0⟩
- T|1⟩ = e^(iπ/4)|1⟩

Note: T² = S, T⁴ = Z.

**Why do we need these finer rotations?** Two reasons:

1. **Expressiveness:** With H and T alone, you can approximate any single-qubit gate to arbitrary precision (the Solovay-Kitaev theorem). These two gates form a "universal" single-qubit gate set.

2. **Algorithm design:** The Quantum Fourier Transform — the heart of Shor's algorithm — requires controlled phase rotations of exactly π/2^k for various k. T and S gates (and their controlled versions) provide this.

The S and T gates are available in the Gate Palette. Try placing them after an H gate and stepping through to observe how the state inspector shows the complex amplitude.`,
      action: {
        type: 'read',
        description: 'Read about S and T gates. Feel free to experiment with them in the circuit. Click Next when ready.',
      },
    },
    {
      title: 'Phase Kickback: The Mechanism Behind Major Algorithms',
      content: `## Why Phase Matters in Real Quantum Algorithms

The H-Z-H demonstration is the simplest example of a phenomenon called **phase kickback**, which is at the heart of the most important quantum algorithms.

**The general idea:** Suppose you have an "oracle" gate that recognises a particular computational basis state — say, it maps |x⟩ → -|x⟩ for some specific target x, and leaves all other states unchanged. (This is called a "phase oracle" or "phase-kickback oracle.") If you first put your qubit into a superposition with H, then apply the oracle, the relative phase between the target and non-target amplitudes changes. A second H then converts that phase difference into an amplitude difference — making the target more probable.

**Deutsch's algorithm** (the simplest oracle algorithm) demonstrates this: a single query to a quantum oracle can determine whether a one-bit function is "constant" or "balanced," whereas any classical algorithm needs two queries. The mechanism is exactly H → oracle (phase kickback) → H → measure.

**Grover's algorithm** repeats a similar structure (oracle + amplitude amplification) O(√N) times to find a marked item in an unsorted list of N.

**Shor's algorithm** uses the quantum Fourier transform, which is a cascade of Hadamard gates interleaved with controlled phase rotations (including S and T type gates). The phase rotations encode the period of a modular function, and the Fourier transform extracts it.

In all these cases, phase is not a detail — it is the **entire mechanism** by which quantum computation differs from classical computation. A classical computer cannot have negative amplitudes or complex phases, so it cannot engineer destructive interference. That is the core advantage.`,
      action: {
        type: 'read',
        description: 'Read about phase in real algorithms. This is the conceptual core of quantum advantage. Click Next.',
      },
    },
    {
      title: 'Lesson 3 Summary & Further Reading',
      content: `## Summary

**Phase is the imaginary dimension of quantum amplitudes.** Amplitudes are complex numbers z = |z|e^(iθ). The magnitude |z| determines measurement probabilities. The phase θ determines how amplitudes interfere.

**The Z gate** ([[1,0],[0,-1]]) flips the phase of |1⟩ by 180°. Applied alone to a computational basis state, it does nothing measurable. Sandwiched between H gates (H-Z-H), it reverses the interference — turning HH|0⟩ = |0⟩ into HZH|0⟩ = |1⟩.

**Global phase** (e^(iθ) multiplied on the entire state) is physically meaningless. **Relative phase** (different phases on different components) is physically significant — it controls interference.

**S and T gates** provide finer phase rotations: S is a 90° rotation (phase = i), T is a 45° rotation (phase = e^(iπ/4)). Together with H, they form a universal gate set for single-qubit operations.

**Phase kickback** is the mechanism by which quantum oracles encode information as phase differences, which are then extracted by interference. It is the core of Deutsch's algorithm, Grover's algorithm, the QFT, and Shor's algorithm.

In **Lesson 4** we move to two qubits and discover the strangest phenomenon in quantum mechanics: entanglement.

---

## Further Reading

- [Qiskit Textbook: Single-Qubit Gates and Phase](https://github.com/Qiskit/textbook/blob/main/notebooks/ch-states/single-qubit-gates.ipynb) — Detailed treatment of Z, S, T, Rx, Ry, Rz with Bloch sphere visualisations.
- [Brilliant.org Quantum Computing Course](https://brilliant.org/courses/quantum-computing/) — Interactive, step-by-step course that covers phase and interference in depth with guided problems.`,
      action: {
        type: 'read',
        description: 'Review the summary and explore the reading links. Click Next to finish Lesson 3.',
      },
    },
  ],
};
