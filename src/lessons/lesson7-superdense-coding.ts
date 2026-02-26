import type { Lesson } from './types';

export const lesson7: Lesson = {
  id: 'lesson7',
  title: 'Superdense Coding',
  description: 'Send two classical bits of information by transmitting just one qubit — using shared entanglement.',
  estimatedMinutes: 22,
  prerequisites: ['lesson6'],
  steps: [
    {
      title: 'Two Bits, One Qubit',
      content: `## Superdense Coding: Beating the Classical Limit

Here is a question that sounds impossible: can you send **two** classical bits of information by transmitting just **one** qubit?

Classically, the answer is no. One bit of physical communication carries at most one bit of information. This is a fundamental limit — no encoding trick can beat it.

Quantum mechanically, the answer is yes — if Alice and Bob share an entangled pair in advance.

**Superdense coding**, discovered by Charles Bennett and Stephen Wiesner in 1992 (actually published before the teleportation protocol from Lesson 5), does exactly this. Alice encodes a 2-bit message by manipulating her half of an entangled pair, sends her qubit to Bob, and Bob decodes the full 2-bit message by measuring both qubits.

The protocol uses gates you already know: H, X, Z, CNOT, and Measure. Every piece of the puzzle is something you have built before. What is new is how they combine.`,
      action: {
        type: 'read',
        description: 'Read the introduction. Click Next to see the protocol.',
      },
    },
    {
      title: 'The Protocol',
      content: `## The Full Protocol

**Setup:** Alice and Bob meet and create a Bell pair: (1/√2)(|00⟩ + |11⟩). Alice takes qubit 0. Bob takes qubit 1. They go their separate ways. The entanglement persists regardless of distance.

**Encoding:** Alice wants to send one of four 2-bit messages. She applies a gate to **her qubit only**:

| Message | Alice's operation | Resulting state |
|---------|-------------------|-----------------|
| 00      | I (do nothing)    | (1/√2)(|00⟩ + |11⟩) = |Φ+⟩ |
| 01      | X (bit flip)      | (1/√2)(|10⟩ + |01⟩) = |Ψ+⟩ |
| 10      | Z (phase flip)    | (1/√2)(|00⟩ − |11⟩) = |Φ−⟩ |
| 11      | X then Z          | (1/√2)(|01⟩ − |10⟩) = |Ψ−⟩ |

These are exactly the **four Bell states** from Lesson 4. Alice's local operation steers the shared state into one of four orthogonal states — without touching Bob's qubit.

**Transmission:** Alice sends her qubit to Bob. Bob now holds both qubits.

**Decoding:** Bob applies CNOT(q0, q1), then H on q0, then measures both qubits. The measurement result is Alice's 2-bit message — deterministically, with no randomness.

The key insight: the four Bell states are orthogonal, so Bob can perfectly distinguish them. His decoder (CNOT + H) is just the reverse of the Bell pair creation circuit from Lesson 4.`,
      action: {
        type: 'read',
        description: 'Study the encoding table and decoding procedure. Click Next to see it work.',
      },
    },
    {
      title: 'Run Message 00',
      content: `## Message 00: The Baseline

The circuit is pre-loaded with the full superdense coding protocol for message **00**.

**Bell pair creation (columns 0–1):** H on qubit 0, then CNOT. This creates (1/√2)(|00⟩ + |11⟩).

**Encoding (column 2):** Nothing — message 00 means "do nothing." The state remains |Φ+⟩.

**Decoding (columns 3–5):** CNOT, then H on qubit 0, then Measure both qubits.

Click **Play** and watch the State Inspector. The circuit should decode deterministically to |00⟩ — Bob reads Alice's message as "00."

**Follow the state step by step:**
- After H: (1/√2)(|00⟩ + |10⟩)
- After first CNOT: (1/√2)(|00⟩ + |11⟩) — the Bell state
- After second CNOT (decoder): (1/√2)(|00⟩ + |10⟩)
- After H (decoder): |00⟩
- After measurement: 00 ✓`,
      action: {
        type: 'click-play',
        description: 'Click Play. Verify the measurement decodes to |00⟩.',
      },
      highlightElements: ['playback-controls', 'state-inspector'],
      circuitPreset: {
        numQubits: 2,
        gates: [
          { gateId: 'H', targetQubits: [0], column: 0 },
          { gateId: 'CX', targetQubits: [0, 1], column: 1 },
          // No encoding gate for message 00
          { gateId: 'CX', targetQubits: [0, 1], column: 3 },
          { gateId: 'H', targetQubits: [0], column: 4 },
          { gateId: 'M', targetQubits: [0], column: 5 },
          { gateId: 'M', targetQubits: [1], column: 5 },
        ],
      },
    },
    {
      title: 'The Decoding Math',
      content: `## Why the Decoder Works: Tracing Message 01

Let us work through one case in detail — message **01**, where Alice applies X.

**After Bell pair creation:** (1/√2)(|00⟩ + |11⟩)

**After Alice applies X to qubit 0:**

\`\`\`
X on qubit 0:  |00⟩ → |10⟩,  |11⟩ → |01⟩
State: (1/√2)(|10⟩ + |01⟩) = |Ψ+⟩
\`\`\`

**Bob's decoder — CNOT(q0, q1):**

\`\`\`
|10⟩ → |11⟩  (control=1, target flipped)
|01⟩ → |01⟩  (control=0, target unchanged)
State: (1/√2)(|11⟩ + |01⟩) = (1/√2)(|1⟩ + |0⟩) ⊗ |1⟩
\`\`\`

**Bob's decoder — H on qubit 0:**

\`\`\`
(1/√2)(|1⟩ + |0⟩) = (1/√2)(|0⟩ + |1⟩) = |+⟩
H|+⟩ = |0⟩
State: |0⟩ ⊗ |1⟩ = |01⟩
\`\`\`

**Measurement:** qubit 0 = 0, qubit 1 = 1. Bob reads "01." Correct.

The same logic works for all four messages. The decoder undoes the Bell pair creation, converting the Bell basis back to the computational basis. Alice's encoding determines which computational basis state emerges.`,
      action: {
        type: 'read',
        description: 'Follow the state tracking step by step. Click Next to run message 01.',
      },
    },
    {
      title: 'Run Message 01',
      content: `## Message 01: Alice Applies X

The circuit now includes Alice's encoding: an **X gate** on qubit 0 at column 2.

This is the case we just traced through mathematically. The X gate flips the Bell state from |Φ+⟩ = (1/√2)(|00⟩+|11⟩) to |Ψ+⟩ = (1/√2)(|10⟩+|01⟩).

Click **Play** and verify that the decoder outputs |01⟩.

**Compare with message 00:** The only difference is one X gate in the encoding column. That single-qubit operation changes the decoded output from 00 to 01. Alice's local manipulation of her qubit — applied to half of an entangled pair — controls what Bob reads when he measures both qubits.

Try **Reset** and **Play** again to confirm the result is deterministic — it is always 01, never random. The measurement here has no quantum randomness because the decoder converts the state to a computational basis state before measuring.`,
      action: {
        type: 'click-play',
        description: 'Click Play. Verify the measurement decodes to |01⟩.',
      },
      highlightElements: ['playback-controls', 'state-inspector'],
      circuitPreset: {
        numQubits: 2,
        gates: [
          { gateId: 'H', targetQubits: [0], column: 0 },
          { gateId: 'CX', targetQubits: [0, 1], column: 1 },
          { gateId: 'X', targetQubits: [0], column: 2 },
          { gateId: 'CX', targetQubits: [0, 1], column: 3 },
          { gateId: 'H', targetQubits: [0], column: 4 },
          { gateId: 'M', targetQubits: [0], column: 5 },
          { gateId: 'M', targetQubits: [1], column: 5 },
        ],
      },
    },
    {
      title: 'Encode Message 11 Yourself',
      content: `## Your Turn: Encode Message 11

To send message **11**, Alice must apply X (bit flip) and then Z (phase flip) to her qubit. This transforms the Bell state into |Ψ−⟩ = (1/√2)(|01⟩ − |10⟩).

The circuit is pre-loaded with the Bell pair creation (columns 0–1), an X gate already placed at column 2, and the decoder (columns 4–6). Column 3 is empty — that is where you need to place Alice's Z gate.

Drag a **Z gate** from the Gate Palette onto **qubit 0, column 3** to complete the encoding.

The math:
\`\`\`
After Bell pair: (1/√2)(|00⟩ + |11⟩)
After X on q0:   (1/√2)(|10⟩ + |01⟩)
After Z on q0:   (1/√2)(−|10⟩ + |01⟩) = |Ψ−⟩
\`\`\`

Z flips the sign of the |1⟩ component of qubit 0, turning |Ψ+⟩ into |Ψ−⟩ — a different Bell state that the decoder can distinguish.`,
      action: {
        type: 'place-gate',
        gateId: 'Z',
        targetQubit: 0,
        column: 3,
        description: 'Place a Z gate on qubit 0, column 3 to complete the encoding for message 11.',
      },
      highlightElements: ['gate-palette', 'circuit-canvas'],
      circuitPreset: {
        numQubits: 2,
        gates: [
          { gateId: 'H', targetQubits: [0], column: 0 },
          { gateId: 'CX', targetQubits: [0, 1], column: 1 },
          { gateId: 'X', targetQubits: [0], column: 2 },
          // Column 3 left empty for user to place Z
          { gateId: 'CX', targetQubits: [0, 1], column: 4 },
          { gateId: 'H', targetQubits: [0], column: 5 },
          { gateId: 'M', targetQubits: [0], column: 6 },
          { gateId: 'M', targetQubits: [1], column: 6 },
        ],
      },
    },
    {
      title: 'Run Message 11',
      content: `## Decode Message 11

Click **Play** to run the full circuit.

**Predict before you play:** Based on the encoding table, what should the measurement result be?

The decoder will transform |Ψ−⟩ back to the computational basis. If the protocol works, Bob should read "11" — both qubits measured as 1.

Watch the State Inspector at each column:

- **After column 0 (H):** Qubit 0 in superposition
- **After column 1 (CNOT):** Bell state |Φ+⟩
- **After column 2 (X):** State becomes |Ψ+⟩ = (1/√2)(|10⟩ + |01⟩)
- **After column 3 (Z):** State becomes |Ψ−⟩ = (1/√2)(|01⟩ − |10⟩). Note the minus sign — the probabilities look the same as |Ψ+⟩, but the phase colour in the State Inspector differs.
- **After column 4 (CNOT decoder):** The CNOT starts disentangling
- **After column 5 (H decoder):** State collapses to |11⟩
- **After column 6 (Measure):** Bob reads 11 ✓

Try **Reset** and **Play** again — always 11.`,
      action: {
        type: 'click-play',
        description: 'Click Play. Verify the measurement decodes to |11⟩.',
      },
      highlightElements: ['playback-controls', 'state-inspector'],
      circuitPreset: {
        numQubits: 2,
        gates: [
          { gateId: 'H', targetQubits: [0], column: 0 },
          { gateId: 'CX', targetQubits: [0, 1], column: 1 },
          { gateId: 'X', targetQubits: [0], column: 2 },
          { gateId: 'Z', targetQubits: [0], column: 3 },
          { gateId: 'CX', targetQubits: [0, 1], column: 4 },
          { gateId: 'H', targetQubits: [0], column: 5 },
          { gateId: 'M', targetQubits: [0], column: 6 },
          { gateId: 'M', targetQubits: [1], column: 6 },
        ],
      },
    },
    {
      title: 'Why This Works: The Bell Basis as an Alphabet',
      content: `## Four Orthogonal States, Four Distinct Messages

The protocol works because the four Bell states form an **orthonormal basis** for the 2-qubit Hilbert space. They are perfectly distinguishable — just like the four computational basis states |00⟩, |01⟩, |10⟩, |11⟩, except rotated.

Alice's local operations (I, X, Z, XZ) act as switches between the four Bell states:

\`\`\`
I  : |Φ+⟩ → |Φ+⟩  (stays)
X  : |Φ+⟩ → |Ψ+⟩  (bit flip → swap Φ and Ψ)
Z  : |Φ+⟩ → |Φ−⟩  (phase flip → swap + and −)
XZ : |Φ+⟩ → |Ψ−⟩  (both flips)
\`\`\`

Bob's decoder (CNOT + H) converts Bell basis → computational basis. This is exactly the reverse of Bell state creation (H + CNOT), which converts computational basis → Bell basis.

**Entanglement as a resource.** The shared Bell pair is consumed by the protocol. Before Alice encodes, the pair contains one ebit (one unit of entanglement). After Bob decodes, the qubits are in a product state — the entanglement is gone. You cannot reuse the pair for a second message. Entanglement is a one-time resource, like a pre-shared secret key in cryptography.

**Why Alice cannot cheat and send 3 bits:** Alice manipulates one qubit using single-qubit gates. There are only four distinguishable transformations of a single qubit that take Bell states to other Bell states (I, X, Z, XZ). Four states encode exactly 2 bits = log₂(4). No local operation can do better.`,
      action: {
        type: 'read',
        description: 'Read about why the protocol works and its limits. Click Next.',
      },
    },
    {
      title: 'Superdense Coding and Teleportation: Duals',
      content: `## Two Sides of the Same Coin

Superdense coding and quantum teleportation (Lesson 5) are mathematical duals — mirror images of each other:

| | Superdense Coding | Teleportation |
|---|---|---|
| **Sends** | 2 classical bits | 1 qubit (unknown state) |
| **Transmits** | 1 qubit | 2 classical bits |
| **Consumes** | 1 shared Bell pair | 1 shared Bell pair |
| **Direction** | Quantum channel → classical info | Classical channel → quantum info |

Both use one Bell pair. Both involve one party performing local operations and sending information to the other. But they trade in opposite currencies: superdense coding converts quantum resources into classical information capacity, while teleportation converts classical resources into quantum state transfer.

**The Holevo bound** says that without entanglement, one qubit can carry at most one classical bit of information. Superdense coding reaches two bits only because of the pre-shared entanglement — the Bell pair effectively "pre-loads" one bit of information capacity into the quantum channel.

**Neither protocol violates physics.** Superdense coding still requires Alice to physically send her qubit to Bob — no faster-than-light communication. The entanglement amplifies the channel's capacity, but the qubit must still travel through space.`,
      action: {
        type: 'read',
        description: 'Read about the duality between superdense coding and teleportation. Click Next.',
      },
    },
    {
      title: 'Lesson 7 Summary & Further Reading',
      content: `## Summary

**Superdense coding** sends 2 classical bits using 1 qubit + 1 shared Bell pair.

**The encoding** uses only local operations on Alice's qubit:
- 00 → I (identity), 01 → X (bit flip), 10 → Z (phase flip), 11 → XZ (both)
- Each operation maps the shared Bell state to a different Bell state

**The decoding** reverses Bell pair creation: CNOT + H converts the Bell basis back to the computational basis. Measurement then reads the 2-bit message deterministically.

**Entanglement is consumed.** The Bell pair is a one-time resource — it cannot be reused after the protocol completes.

**Superdense coding and teleportation are duals:** one sends classical bits via a quantum channel, the other sends quantum states via a classical channel. Both consume one Bell pair.

In **Lesson 8**, we move from communication protocols to computation: the Deutsch algorithm — the first quantum algorithm to demonstrate a provable speedup over any classical approach.

---

## Further Reading

- [IBM Quantum Learning: Entanglement in Action](https://learning.quantum.ibm.com/course/basics-of-quantum-information/entanglement-in-action) — Covers superdense coding alongside teleportation and the CHSH game.
- [Qiskit Textbook: Superdense Coding](https://learning.quantum.ibm.com/tutorial/superdense-coding) — Runnable implementation with circuit diagrams.
- **Bennett & Wiesner, "Communication via one- and two-particle operators on Einstein-Podolsky-Rosen states" (1992)** — The original paper. Short and readable.`,
      action: {
        type: 'read',
        description: 'Review the summary. Click Next to complete Lesson 7.',
      },
    },
  ],
};
