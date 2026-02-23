import type { Lesson } from './types';

export const lesson1: Lesson = {
  id: 'lesson1',
  title: 'Classical vs Quantum Bits',
  description: 'Understand the qubit, probability amplitudes, and your first quantum gate.',
  estimatedMinutes: 15,
  prerequisites: [],
  steps: [
    {
      title: 'Welcome to JokoQuantum',
      content: `## Welcome to JokoQuantum

This simulator will guide you through the core ideas of quantum computing by letting you build and run real quantum circuits — no physics degree required.

Over the next five lessons you will go from "what even is a qubit?" all the way to **quantum teleportation**, one of the most counterintuitive results in all of physics. Along the way you will see actual mathematics, debunk popular misconceptions, and interact with a working quantum state engine.

**What this lesson covers:** We start at the very beginning — classical bits versus quantum bits. By the end you will have placed your first gate, watched it transform a quantum state, and understood why that transformation is both trivially similar to and deeply different from what a classical computer does.

A few ground rules before we begin:

- The math is not decoration. Work through each matrix multiplication; it will solidify the intuitions far better than analogies alone.
- Common misconceptions are called out explicitly. Quantum computing is plagued with popular-science half-truths. We will name them and correct them.
- Each lesson ends with curated reading links. Use them — this simulator is a starting point, not a complete education.

Let's begin.`,
      action: {
        type: 'read',
        description: 'Read the introduction, then click Next to continue.',
      },
    },
    {
      title: 'Classical Bits: A Quick Refresher',
      content: `## Classical Bits

At its core, every classical computer operates on **bits** — the smallest unit of information. A bit is a physical system that can be in one of exactly two distinguishable states, conventionally called **0** and **1**.

In modern transistor-based hardware, these states correspond to voltage levels: roughly 0 V represents 0, and roughly 1.8 V (or 3.3 V, or 5 V — it depends on the technology) represents 1. The key point is that the physical system is always in **one definite state or the other**. There is no ambiguity.

Classical logic gates transform bits in deterministic ways:

- A **NOT gate** flips 0 to 1 and 1 to 0.
- An **AND gate** outputs 1 only when both inputs are 1.
- An **OR gate** outputs 1 when at least one input is 1.

Because a bit is always definitively 0 or 1, we can describe the complete state of a classical computer's memory with a single string of 0s and 1s — say, \`01101001\`. This is clean, simple, and the foundation of all classical computing.

Quantum computing keeps the same vocabulary — we still talk about 0 and 1 — but the physical systems underlying those labels behave in a fundamentally richer way. That richness is where the power comes from.`,
      action: {
        type: 'read',
        description: 'Read about classical bits, then click Next.',
      },
    },
    {
      title: 'Introducing the Qubit',
      content: `## The Qubit: A Linear Combination of States

A **qubit** (quantum bit) also has two basis states, written in **Dirac (bra-ket) notation** as **|0⟩** and **|1⟩**. But unlike a classical bit, a qubit can exist in a **superposition** — a linear combination of these basis states:

**|ψ⟩ = α|0⟩ + β|1⟩**

Here α and β are **complex numbers** called **probability amplitudes**. The constraint that probabilities must sum to 1 imposes:

**|α|² + |β|² = 1**

When you **measure** the qubit, you get the outcome |0⟩ with probability |α|² and the outcome |1⟩ with probability |β|². After the measurement, the qubit's state **collapses** to whichever outcome you observed — all the information in the other amplitude is gone.

---

**Critical misconception to address right now:**

It is tempting to say "a qubit in superposition is both 0 and 1 at the same time." You will hear this constantly in popular science. It is wrong — or at best, deeply misleading.

A qubit in superposition is in **one definite quantum state**. That state just happens to be described by a vector in a 2-dimensional complex vector space rather than by a single classical label. The qubit is not secretly 0 or secretly 1 — it genuinely does not have a classical value until a measurement occurs. But "both 0 and 1 simultaneously" implies it somehow has both values at once, which is not what the formalism says.

The correct picture: |ψ⟩ is a single, well-defined mathematical object. It is the **amplitudes**, not vague simultaneous values, that tell you what you will find when you measure.`,
      action: {
        type: 'read',
        description: 'Read carefully about superposition and the misconception. Click Next when ready.',
      },
    },
    {
      title: 'The State Vector',
      content: `## Representing Qubits as Vectors

Because the state |ψ⟩ = α|0⟩ + β|1⟩ is a linear combination of two basis states, we can represent it as a **column vector** in a 2-dimensional complex vector space (called a **Hilbert space**):

**|ψ⟩ = [α, β]ᵀ**  (a 2×1 column vector)

The two **computational basis states** have a particularly clean form:

**|0⟩ = [1, 0]ᵀ**  — all amplitude on the 0 outcome

**|1⟩ = [0, 1]ᵀ**  — all amplitude on the 1 outcome

This is exactly like the standard basis vectors **e₁** and **e₂** in ordinary 2D geometry. The difference is that the entries can be complex numbers, and the "length" of the vector is defined using |α|² + |β|² rather than α² + β².

**Example — the equal superposition state:**

If α = β = 1/√2 ≈ 0.707, then:

|ψ⟩ = (1/√2)|0⟩ + (1/√2)|1⟩ = [1/√2, 1/√2]ᵀ

Checking the constraint: |1/√2|² + |1/√2|² = 1/2 + 1/2 = 1. ✓

Each outcome is equally likely — 50% probability of measuring 0, 50% of measuring 1.

**Example — |0⟩ itself:**

|0⟩ = [1, 0]ᵀ → probability of 0 is |1|² = 1, probability of 1 is |0|² = 0. The qubit is definitely in state 0. This matches classical behaviour exactly.

Quantum gates are **matrices** that act on this vector. Let us meet the first one.`,
      action: {
        type: 'read',
        description: 'Read about the state vector representation, then click Next.',
      },
    },
    {
      title: 'Look at the Circuit Canvas',
      content: `## Your First Qubit in the Simulator

Look at the circuit canvas in the centre of the screen. You should see a single horizontal wire — this represents **qubit 0**, initialised to the state **|0⟩**.

On the right side of the screen, the **State Inspector** shows the current quantum state. Right now it should display:

- **|0⟩** with amplitude 1.000 (100% probability)
- **|1⟩** with amplitude 0.000 (0% probability)

This is the state vector **[1, 0]ᵀ** — qubit 0 is definitively in the |0⟩ state, exactly like a classical bit set to 0.

No gates have been applied yet, so this is just the initial condition. Before you place any gates, make sure you are familiar with the simulator layout:

- **Left panel**: The Gate Palette. Drag gates from here onto the circuit.
- **Centre**: The Circuit Canvas. The horizontal wire is the qubit; vertical positions correspond to different time steps (columns).
- **Right panel**: The State Inspector and this Tutorial Panel.
- **Bottom**: The Playback Controls (Step, Play, Reset).

In the next step we will meet the first quantum gate.`,
      action: {
        type: 'observe',
        description: 'Look at the State Inspector — confirm it shows |0⟩ at 100%. Then click Next.',
      },
      highlightElements: ['state-inspector'],
    },
    {
      title: 'The X Gate (Quantum NOT)',
      content: `## The X Gate: Quantum NOT

Our first gate is the **Pauli-X gate**, often just called the X gate or the quantum NOT gate. Its **matrix** is:

**X = [[0, 1], [1, 0]]**

To find what X does to a state, we **multiply the matrix by the state vector**. Let us try X applied to |0⟩ = [1, 0]ᵀ:

\`\`\`
X|0⟩ = [[0, 1], [1, 0]] × [1, 0]ᵀ
      = [0×1 + 1×0, 1×1 + 0×0]ᵀ
      = [0, 1]ᵀ
      = |1⟩
\`\`\`

X maps |0⟩ → |1⟩.

What about X applied to |1⟩ = [0, 1]ᵀ?

\`\`\`
X|1⟩ = [[0, 1], [1, 0]] × [0, 1]ᵀ
      = [0×0 + 1×1, 1×0 + 0×1]ᵀ
      = [1, 0]ᵀ
      = |0⟩
\`\`\`

X maps |1⟩ → |0⟩. It flips the bit — exactly like a classical NOT gate.

Notice that X is a **unitary matrix**: X†X = I (where X† is the conjugate transpose of X). For a real symmetric matrix like X, this just means X² = I. Unitarity is the quantum analogue of the classical requirement that gates be deterministic: it guarantees that probabilities always sum to 1 after the operation.

The X gate applied to a computational basis state is completely classical — nothing quantum is happening yet. That changes in the next lesson when we introduce gates that can create genuine superpositions.`,
      action: {
        type: 'read',
        description: 'Work through the matrix multiplications. Click Next when you understand the X gate.',
      },
    },
    {
      title: 'Place an X Gate',
      content: `## Your Turn: Place an X Gate

Now let's place an X gate on the circuit and watch it work.

In the **Gate Palette** on the left, find the **Pauli-X** gate (red, labelled "X"). Drag it onto **qubit 0** at **column 0** (the first available position on the wire).

The gate should snap into place on the circuit canvas. You will see the circuit now has one gate scheduled.

**What to expect:** Before executing, the State Inspector still shows |0⟩ at 100% — the gate has been placed but not yet run. The circuit is just a description of what operations to perform; nothing happens until you step through it.`,
      action: {
        type: 'place-gate',
        gateId: 'X',
        targetQubit: 0,
        column: 0,
        description: 'Drag the Pauli-X gate from the Gate Palette onto qubit 0, column 0.',
      },
      highlightElements: ['gate-palette', 'circuit-canvas'],
    },
    {
      title: 'Step Through the Circuit',
      content: `## Executing a Gate: Click Step

Now that the X gate is placed, let's execute it. Find the **Step** button in the Playback Controls at the bottom of the screen. Click it once.

**What Step does:** It advances the simulation by one column — executing every gate in the current column, then updating the state vector. In our case, column 0 contains just the X gate on qubit 0, so clicking Step applies X to qubit 0.

**Watch the State Inspector** on the right as you click Step. The state vector should update.

After stepping, the simulation cursor moves forward. If you click Step again there are no more gates, so the state will remain unchanged.

You can always click **Reset** to go back to the beginning and try again.

**Predict before you step:** Based on the matrix multiplication above, what should the State Inspector show after the X gate is applied to |0⟩? Write down your prediction, then click Step to check.`,
      action: {
        type: 'click-step',
        description: 'Click the Step button in the Playback Controls to execute the X gate.',
      },
      highlightElements: ['playback-controls'],
    },
    {
      title: 'Observe: State Changed from |0⟩ to |1⟩',
      content: `## What Just Happened?

Look at the State Inspector. It should now show:

- **|1⟩** with amplitude 1.000 (100% probability)
- **|0⟩** with amplitude 0.000 (0% probability)

The state changed from |0⟩ to |1⟩ — exactly as the matrix multiplication predicted.

**Notice:** This is completely classical behaviour. We applied a NOT gate to a 0 bit and got a 1 bit. There is nothing uniquely quantum about this step — a classical computer's NOT gate does the same thing.

This is intentional. The first lesson is about establishing the vocabulary: state vectors, probability amplitudes, unitary matrices. The truly quantum phenomena — superposition that actually matters, interference, entanglement — build on this foundation but require different gates.

If you want to see the state go back to |0⟩, click **Reset** and then **Step** again. The circuit is deterministic: every time you apply X to |0⟩ you get |1⟩, no exceptions.

One small but important note: because the X gate maps between computational basis states with amplitude 1 in each case, there is no probabilistic element here. The outcomes are certain. This changes dramatically when we introduce the **Hadamard gate** in Lesson 2.`,
      action: {
        type: 'observe',
        description: 'Confirm the State Inspector shows |1⟩ at 100%. Click Next to continue.',
      },
      highlightElements: ['state-inspector'],
    },
    {
      title: 'Lesson 1 Summary & Further Reading',
      content: `## Summary

Excellent work. Here is what you have learned in Lesson 1:

**Classical bits** are physical systems in one of two definite states, 0 or 1, represented by voltage levels in transistors. Their state is always certain.

**Qubits** have two basis states |0⟩ and |1⟩, but can exist in a superposition α|0⟩ + β|1⟩ where α and β are complex probability amplitudes satisfying |α|² + |β|² = 1. The qubit is in a single definite quantum state — just one that is described by a vector rather than a classical label.

**Measurement** yields |0⟩ with probability |α|² and |1⟩ with probability |β|², and collapses the state to the observed outcome.

**The X gate** (matrix [[0,1],[1,0]]) swaps |0⟩ and |1⟩, just like a classical NOT. Applied to a computational basis state, it is entirely classical in behaviour.

**Quantum gates are unitary matrices** — their conjugate transpose is their inverse. This preserves the total probability of 1.

In **Lesson 2** we introduce the Hadamard gate, which creates genuine superpositions, and explore why those superpositions are fundamentally different from classical randomness.

---

## Further Reading

- [IBM Quantum Learning: Basics of Quantum Information](https://learning.quantum.ibm.com/course/basics-of-quantum-information) — IBM's free, rigorous introduction. Excellent companion to this simulator.
- **Nielsen & Chuang, "Quantum Computation and Quantum Information," Chapter 1** — The standard graduate textbook. Dense but authoritative. Chapter 1 covers exactly the material in this lesson.
- [Qiskit Textbook: Single Systems](https://github.com/Qiskit/textbook/blob/main/notebooks/ch-states/single-systems.ipynb) — Interactive Jupyter notebook covering single-qubit states with worked examples in Python.`,
      action: {
        type: 'read',
        description: 'Review the summary and explore the reading links. Click Next to finish Lesson 1.',
      },
    },
  ],
};
