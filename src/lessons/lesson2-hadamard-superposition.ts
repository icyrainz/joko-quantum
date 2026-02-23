import type { Lesson } from './types';

export const lesson2: Lesson = {
  id: 'lesson2',
  title: 'The Hadamard Gate and Superposition',
  description: 'Create genuine quantum superpositions and discover interference between probability amplitudes.',
  estimatedMinutes: 20,
  prerequisites: ['lesson1'],
  steps: [
    {
      title: 'Recap and What Is Coming',
      content: `## Recap: Where We Left Off

In Lesson 1 you learned that a qubit's state is a vector α|0⟩ + β|1⟩ in a 2-dimensional complex Hilbert space, and that quantum gates are unitary matrices acting on that vector. The X gate — matrix [[0,1],[1,0]] — swaps |0⟩ and |1⟩ just like a classical NOT.

But that was entirely classical in spirit. Real quantum computing power comes from **superposition** — states where the amplitudes for both |0⟩ and |1⟩ are non-zero simultaneously — and from the ability of those amplitudes to **interfere** with each other.

This lesson introduces the **Hadamard gate**, which is arguably the most important single-qubit gate in all of quantum computing. Nearly every quantum algorithm begins with Hadamard gates. You will:

1. Understand what it means for a quantum gate to be **unitary** and why that matters.
2. Work through the Hadamard gate's action on |0⟩ and |1⟩ with full matrix arithmetic.
3. Discover that quantum superposition is **not** the same as classical randomness — a distinction that is philosophically important and computationally essential.
4. Build a two-gate circuit that demonstrates **quantum interference**: amplitudes cancelling and reinforcing like waves.

Let's go.`,
      action: {
        type: 'read',
        description: 'Read the recap and lesson overview. Click Next to continue.',
      },
    },
    {
      title: 'What Is a Quantum Gate?',
      content: `## Quantum Gates as Unitary Transformations

A quantum gate on n qubits is a **unitary matrix** — a 2ⁿ × 2ⁿ complex matrix U satisfying:

**U†U = I**

where U† (read "U dagger") is the **conjugate transpose** of U (take the transpose, then complex-conjugate every entry), and I is the identity matrix.

This single condition does a great deal of work. It guarantees three things:

**1. Probability is preserved.** If the input state |ψ⟩ satisfies ⟨ψ|ψ⟩ = 1 (probabilities sum to 1), then U|ψ⟩ also satisfies ⟨ψ|U†U|ψ⟩ = ⟨ψ|I|ψ⟩ = 1. The gate cannot create or destroy probability.

**2. The operation is reversible.** Because U†U = I, the inverse of U is U†. Every quantum gate can be undone by applying its conjugate transpose. This is a profound difference from classical computing: classical gates like AND and OR are **irreversible** (you cannot recover both inputs from the output). Quantum computation is inherently reversible.

**3. Information is preserved.** As a consequence of reversibility, no information about the input state is lost. The gate is a distance-preserving rotation/reflection in Hilbert space.

For single-qubit gates on real matrices, unitary simply means **orthogonal**: the columns (and rows) form an orthonormal set. For complex matrices, the condition is richer — it includes phase rotations that have no classical analogue.

Now let's look at the gate that creates superposition.`,
      action: {
        type: 'read',
        description: 'Read about unitary transformations. Click Next to meet the Hadamard gate.',
      },
    },
    {
      title: 'The Hadamard Gate: Matrix and Action',
      content: `## The Hadamard Gate

The **Hadamard gate** H has the matrix:

**H = (1/√2) × [[1, 1], [1, -1]]**

Or writing out the entries explicitly:

**H = [[1/√2, 1/√2], [1/√2, -1/√2]]**

Let us verify it is unitary. H is a real symmetric matrix, so H† = H. Then:

\`\`\`
H†H = H² = (1/√2)[[1,1],[1,-1]] × (1/√2)[[1,1],[1,-1]]
    = (1/2) × [[1+1, 1-1], [1-1, 1+1]]
    = (1/2) × [[2, 0], [0, 2]]
    = [[1, 0], [0, 1]]
    = I  ✓
\`\`\`

Good. Now let us compute H|0⟩:

\`\`\`
H|0⟩ = [[1/√2, 1/√2], [1/√2, -1/√2]] × [1, 0]ᵀ
      = [1/√2 × 1 + 1/√2 × 0,  1/√2 × 1 + (-1/√2) × 0]ᵀ
      = [1/√2, 1/√2]ᵀ
      = (1/√2)|0⟩ + (1/√2)|1⟩
\`\`\`

This is the **equal superposition state** — amplitudes of 1/√2 ≈ 0.707 on both |0⟩ and |1⟩.

And H|1⟩:

\`\`\`
H|1⟩ = [[1/√2, 1/√2], [1/√2, -1/√2]] × [0, 1]ᵀ
      = [1/√2, -1/√2]ᵀ
      = (1/√2)|0⟩ - (1/√2)|1⟩
\`\`\`

Note the minus sign! H|0⟩ and H|1⟩ differ by a **relative phase** on the |1⟩ component. This minus sign is invisible in a single measurement — both states give 50/50 outcomes — but it has dramatic consequences for interference, as you will see shortly.`,
      action: {
        type: 'read',
        description: 'Work through the matrix arithmetic carefully. The minus sign in H|1⟩ matters enormously. Click Next.',
      },
    },
    {
      title: 'Place an H Gate',
      content: `## Build the Superposition Circuit

Let us see the Hadamard gate in action. First, click **Reset** to make sure the circuit is cleared and the qubit is back in |0⟩.

Then, drag an **H gate** from the Gate Palette on the left and drop it onto **qubit 0, column 0**.

You should see a blue "H" gate appear on the qubit wire. Before you step through it, look at the State Inspector — the qubit is still |0⟩ with 100% probability. The gate is placed but not yet applied.

**Prediction before you step:** Based on the matrix arithmetic in the last step, after applying H to |0⟩ the state should become (1/√2)|0⟩ + (1/√2)|1⟩. The State Inspector should show both |0⟩ and |1⟩ at approximately 50% probability each.`,
      action: {
        type: 'place-gate',
        gateId: 'H',
        targetQubit: 0,
        column: 0,
        description: 'Click Reset first, then drag an H gate from the Gate Palette onto qubit 0, column 0.',
      },
      highlightElements: ['gate-palette', 'circuit-canvas'],
    },
    {
      title: 'Step Through: Enter Superposition',
      content: `## Click Step: Enter Superposition

Click the **Step** button in the Playback Controls. The H gate on qubit 0 is applied.

Watch the State Inspector update. After stepping, you should see:

- **|0⟩** with amplitude ≈ 0.707 and probability ≈ 50%
- **|1⟩** with amplitude ≈ 0.707 and probability ≈ 50%

The ket notation now reads: **(0.707)|0⟩ + (0.707)|1⟩**

This is the **|+⟩ state** — the equal superposition of |0⟩ and |1⟩. It is one of the most important states in quantum computing.

Notice that the two amplitudes are completely **equal and positive**. There is no reason, in this state, to prefer |0⟩ over |1⟩ — the state is perfectly balanced. If you were to measure the qubit right now, you would get 0 or 1 with exactly equal probability, and the result would be completely random.

But here is the crucial next question: is this just like flipping a coin?`,
      action: {
        type: 'click-step',
        description: 'Click the Step button to apply the H gate. Watch the State Inspector.',
      },
      highlightElements: ['playback-controls', 'state-inspector'],
    },
    {
      title: 'Superposition Is NOT Classical Randomness',
      content: `## A Critical Distinction: Quantum vs Classical Randomness

After applying H to |0⟩, we have a qubit with 50% probability of being measured as 0 and 50% as 1. This looks identical to a coin flip. But the resemblance is superficial and the difference is fundamental.

**A classical random coin** is in a definite state — heads or tails — but we do not know which. The randomness is **epistemic**: it is about our ignorance of the actual state. If we could track every molecule in the coin, we could predict the outcome deterministically (in principle).

**A qubit in superposition** is NOT in a definite state that we are ignorant of. This is the content of Bell's theorem (which you will see in Lesson 4): no "hidden variable" model where the qubit secretly has a definite value can reproduce all quantum predictions. The indeterminacy is **ontic** — it is a feature of reality, not of our knowledge.

But there is a more immediately practical way to see the difference: **interference**.

If the qubit were simply secretly 0 or secretly 1, then the two H gates would independently flip each case. The result would still be random. But we can demonstrate that the qubit must "know" about both amplitudes at once by applying a second H gate and showing that the state returns deterministically to |0⟩ — through amplitude cancellation.

The coin flip cannot do this. Once you flip a coin, a second flip does not undo the first. But a second H gate exactly undoes the first. That is the signature of genuine quantum superposition: **coherence** — the amplitudes maintain their relative phase and can interfere.`,
      action: {
        type: 'read',
        description: 'Read carefully — this distinction is fundamental. Click Next to see interference in action.',
      },
    },
    {
      title: 'H is Its Own Inverse: H² = I',
      content: `## The Magic of Double Hadamard: Interference

We showed algebraically that H² = I, meaning H is its own inverse. Let us trace through what happens in terms of amplitudes when we apply H twice to |0⟩.

**After the first H:** State is (1/√2)|0⟩ + (1/√2)|1⟩ = [1/√2, 1/√2]ᵀ

**Applying the second H:**

\`\`\`
H × [1/√2, 1/√2]ᵀ

= [[1/√2, 1/√2], [1/√2, -1/√2]] × [1/√2, 1/√2]ᵀ

Top entry:    (1/√2)(1/√2) + (1/√2)(1/√2)  =  1/2 + 1/2  =  1
Bottom entry: (1/√2)(1/√2) + (-1/√2)(1/√2) =  1/2 - 1/2  =  0
\`\`\`

Result: [1, 0]ᵀ = |0⟩

**The |0⟩ component:** Both terms were positive, so they **added** (constructive interference).

**The |1⟩ component:** The terms had opposite signs (one positive from |0⟩ path, one negative from |1⟩ path), so they **cancelled** (destructive interference).

This is the central mechanism of quantum computing. Amplitudes are like wave amplitudes — they can add together or cancel depending on their relative signs (phases). By engineering a circuit, we can make the amplitude for wrong answers cancel out and the amplitude for correct answers build up. That is the abstract core of algorithms like Grover's search and Shor's factoring algorithm.`,
      action: {
        type: 'read',
        description: 'Work through the second H gate multiplication yourself. Confirm the interference. Click Next.',
      },
    },
    {
      title: 'Add a Second H Gate and Run',
      content: `## Build the H-H Circuit

Let us verify this interference experimentally in the simulator. Your circuit currently has one H gate at column 0. Now drag a **second H gate** from the Gate Palette and place it on **qubit 0, column 1** (the next column to the right).

After placing it, click **Reset** to bring the qubit back to |0⟩ (the gates stay in place; Reset only resets the quantum state).

Then click **Play** (or click **Step** twice) to run both gates.

Watch the State Inspector carefully:

- After the first H (column 0): you should see the 50/50 superposition.
- After the second H (column 1): the state should return to |0⟩ with 100% probability.

The qubit went into superposition and then came back — deterministically — because of amplitude interference. This would be impossible if the qubit were simply a coin with a hidden classical value.`,
      action: {
        type: 'place-gate',
        gateId: 'H',
        targetQubit: 0,
        column: 1,
        description: 'Drag a second H gate onto qubit 0, column 1. Then click Reset followed by Play.',
      },
      highlightElements: ['gate-palette', 'circuit-canvas'],
    },
    {
      title: 'Observe: Interference Returns |0⟩',
      content: `## Click Reset, Then Play

Click **Reset** to restore the qubit to |0⟩, then click **Play** to run the full two-gate circuit.

After running both H gates, the State Inspector should show **|0⟩ at 100% probability**.

The sequence was:
1. Start: |0⟩ — certain outcome 0.
2. After H: (1/√2)|0⟩ + (1/√2)|1⟩ — 50/50, outcome uncertain.
3. After second H: |0⟩ — certain outcome 0 again.

You just observed **quantum interference**. The qubit was in a genuine superposition between steps 1 and 2, with both amplitudes non-zero. But the second H gate exploited the relative phase relationship between those amplitudes to make them cancel on the |1⟩ term and reinforce on the |0⟩ term.

A useful geometric picture: think of the Bloch sphere (a 3D sphere where the poles are |0⟩ and |1⟩). The first H rotates the state from the north pole to the equator. The second H rotates it back to the north pole. The specific rotation axes are chosen so that the equatorial state maps back to |0⟩ exactly. Phase plays the role of the azimuthal angle on the Bloch sphere.`,
      action: {
        type: 'click-play',
        description: 'Click Reset, then click Play. Confirm the final state is |0⟩ at 100%.',
      },
      highlightElements: ['playback-controls', 'state-inspector'],
    },
    {
      title: 'Why This Matters for Quantum Algorithms',
      content: `## Interference: The Engine of Quantum Computing

The H-H example is the simplest possible demonstration of quantum interference, but the underlying mechanism powers the most important quantum algorithms.

**Grover's Search Algorithm** searches an unsorted list of N items in roughly √N steps (classical algorithms need O(N) steps in the worst case). It works by:
1. Starting in an equal superposition of all N possibilities (using Hadamard gates on log₂(N) qubits).
2. Applying an "oracle" that adds a phase flip to the correct answer.
3. Applying a "diffusion operator" that amplifies the amplitude of the correct answer through constructive interference while reducing all others through destructive interference.
4. Repeating steps 2–3 roughly √N times.

**Shor's Algorithm** for factoring large integers — the algorithm that would break RSA encryption — uses the **Quantum Fourier Transform**, which is essentially a highly efficient application of Hadamard gates and phase gates. The QFT makes the periodic structure of modular exponentiation appear as constructive interference at the right frequency.

In both cases, the algorithm succeeds not because a quantum computer "tries all answers at once" (the popular myth), but because it carefully engineers interference so that wrong answers cancel and right answers add up.

You have now seen the core mechanism. Let us move on.`,
      action: {
        type: 'read',
        description: 'Read about how interference powers real quantum algorithms. Click Next.',
      },
    },
    {
      title: 'Lesson 2 Summary & Further Reading',
      content: `## Summary

**Quantum gates are unitary matrices** (U†U = I). Unitarity preserves probabilities, makes every gate reversible, and means no information is lost.

**The Hadamard gate** H = (1/√2)[[1,1],[1,-1]] takes |0⟩ to the equal superposition (1/√2)(|0⟩ + |1⟩) and |1⟩ to (1/√2)(|0⟩ - |1⟩). The minus sign in H|1⟩ is invisible to a single measurement but critical for interference.

**Superposition is not classical randomness.** A coin flip is ignorance about a definite hidden state. A qubit in superposition has no definite pre-measurement value — the indeterminacy is real. The proof: interference (the H-H experiment) is impossible for a hidden classical system.

**Interference** occurs when amplitudes from different "paths" through a circuit combine: same sign → constructive (amplitude grows); opposite sign → destructive (amplitude cancels). Quantum algorithms amplify correct answers through constructive interference and suppress wrong answers through destructive interference.

In **Lesson 3** we explore **phase** more deeply — the invisible dimension of a quantum amplitude that drives all interference.

---

## Further Reading

- [3Blue1Brown: Some Light Quantum Mechanics](https://www.youtube.com/watch?v=MzRCDLre1b4) — An outstanding visual introduction to quantum superposition and wave-like behaviour, by one of the best math communicators online.
- [Qiskit Textbook: The Atoms of Computation](https://github.com/Qiskit/textbook/blob/main/notebooks/ch-states/atoms-of-computation.ipynb) — Covers Hadamard, superposition, and interference with runnable Python code.
- [Quantum Country by Andy Matuschak & Michael Nielsen](https://quantum.country/) — A beautifully written essay-style introduction with built-in spaced-repetition flashcards. Highly recommended for consolidating these concepts.`,
      action: {
        type: 'read',
        description: 'Review the summary and check out the reading links. Click Next to finish Lesson 2.',
      },
    },
  ],
};
