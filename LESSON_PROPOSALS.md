# Lesson Proposals: Lessons 6-9

Reference document for implementing new lessons in JokoQuantum simulator.

## Pedagogical Review Notes

Reviewed against curricula from IBM Quantum Learning, MIT 8.370x, Brilliant.org, Quantum Country,
and research papers on quantum computing education (arxiv 2511.02844, EPJ Quantum Technology, Phys. Rev. Phys. Educ. Res.).

**Key findings:**
- The ordering 6→7→8→9 matches established curricula (measurement → protocols → algorithms → advanced entanglement)
- Measurement (Lesson 6) ideally comes before protocols, but since Lessons 1-5 already used measurement intuitively, Lesson 6 should be framed as **formalizing what students already know** ("just-in-time formalization"), not introducing a new concept
- Deutsch's algorithm is widely accepted as the "hello world" of quantum algorithms — appropriate at this stage
- GHZ as capstone is well-supported; enhanced with W state comparison per educator recommendations
- Optional future addition: CHSH Game (IBM teaches alongside teleportation/superdense coding as a core "entanglement in action" topic)

## Overview

| Lesson | Title | Est. Time | Prerequisites | Key Gates |
|--------|-------|-----------|---------------|-----------|
| 6 | Measurement and the Born Rule | ~20 min | lesson5 | H, X, CX, M |
| 7 | Superdense Coding | ~22 min | lesson6 | H, X, Z, CX, M |
| 8 | Deutsch's Algorithm | ~25 min | lesson7 | H, X, CX, M |
| 9 | GHZ State and Three-Qubit Entanglement | ~22 min | lesson8 | H, X, CX, M |

---

## Lesson 6: Measurement and the Born Rule

**Why this lesson:** The M gate exists in the simulator and students have seen measurement outcomes throughout Lessons 1-5 — but always informally. They know measurement gives 0 or 1, but they haven't formally learned *why* certain probabilities appear, what happens to the state after measurement, or what partial measurement does to entangled systems. This lesson formalizes that intuition. Without it, protocols like superdense coding (Lesson 7) and algorithms like Deutsch's (Lesson 8) can't land properly.

**Pedagogical framing:** "Now let's formally understand what we've been doing." This is retrospective formalization — building the formal framework around intuition students already have.

### Step-by-step outline

**Step 1: Introduction — Formalizing What You Already Know**
- You have been using measurement throughout this course — every time you checked the state inspector, every time you saw probabilities
- But we never formally explained the rules. What determines those probabilities? What happens to the state after you measure? What if you only measure part of an entangled system?
- This lesson answers all of that. The rules are precise, and they have consequences that will matter for everything that follows.
- Preview: Born rule, partial measurement, post-measurement states, irreversibility

**Step 2: The Born Rule — Probabilities from Amplitudes**
- State |ψ⟩ = α|0⟩ + β|1⟩
- P(0) = |α|², P(1) = |β|²
- Work through concrete examples:
  - |0⟩ → P(0)=1, P(1)=0
  - |+⟩ = (1/√2)(|0⟩+|1⟩) → P(0)=0.5, P(1)=0.5
  - H applied to |0⟩ then Z → (1/√2)(|0⟩−|1⟩) = |−⟩ → still P(0)=0.5, P(1)=0.5
- Key insight: phase is invisible to measurement (callback to Lesson 3)
- This is NOT the same as classical coin flipping — the amplitudes are real, the randomness is fundamental

**Step 3: Your First Measurement — Measuring |0⟩**
- *Circuit preset:* 1 qubit, empty
- *Action:* place M gate at qubit 0, column 0
- *Action:* click-step
- Observe: deterministic outcome (100% |0⟩)
- Point: measuring a basis state is boring but confirms the rule

**Step 4: Measuring a Superposition**
- *Circuit preset:* 1 qubit, H at column 0
- *Action:* place M gate at qubit 0, column 1
- *Action:* click-step twice (first H, then M)
- Observe: state collapses to either |0⟩ or |1⟩ (random, ~50/50)
- Key point: before measurement, the state inspector showed 50/50 probabilities. After measurement, one outcome is 100%. The superposition is destroyed.
- Compare: without M, the state remains in superposition

**Step 5: Measurement Is Irreversible — The Proof**
- What if we apply H after measurement?
- *Circuit preset:* 1 qubit, H at col 0, M at col 1, H at col 2
- *Action:* click-play
- Observe: final state is NOT |0⟩ (unlike H-H which gives |0⟩)
- If measurement collapsed to |0⟩, then H gives |+⟩. If to |1⟩, H gives |−⟩.
- Either way, you DON'T get back to |0⟩ deterministically
- Measurement broke the interference. The information about the original superposition is gone.
- Contrast with Lesson 2 where H-H = I (no measurement in between)

**Step 6: Partial Measurement — Measuring One Qubit of Two**
- The real power: what happens when you measure part of an entangled system?
- Math: start with Bell state (1/√2)(|00⟩+|11⟩)
- Measure qubit 0: P(0)=0.5, P(1)=0.5
  - If outcome is 0: post-measurement state is |00⟩ (qubit 1 is now |0⟩)
  - If outcome is 1: post-measurement state is |11⟩ (qubit 1 is now |1⟩)
- Measuring one qubit instantly determines the other — this is entanglement in action

**Step 7: Build and Measure a Bell State**
- *Circuit preset:* 2 qubits, H at q0 col 0, CX at q0→q1 col 1
- *Action:* place M at qubit 0, column 2
- *Action:* click-step through all three columns
- Observe step by step:
  1. After H: qubit 0 in superposition, qubit 1 still |0⟩
  2. After CX: entangled Bell state (50% |00⟩, 50% |11⟩)
  3. After M on qubit 0: both qubits collapse to same value
- The state inspector should show either |00⟩ or |11⟩ at 100%

**Step 8: What Measurement Does NOT Tell You**
- Measurement gives you a classical bit. It does NOT tell you:
  - What the amplitudes were before measurement
  - Whether the qubit was in a superposition or a mixture
  - The phase of the state
- Single-shot measurement is fundamentally limited
- To learn about a quantum state, you need many identical copies (quantum state tomography)
- This is why we can't measure |ψ⟩ to learn α and β — connect back to no-cloning (Lesson 5)

**Step 9: The Deferred Measurement Principle**
- Key theorem: moving measurements to the end of the circuit doesn't change the outcome statistics
- Implication: you can always reason about circuits by "deferring" measurement
- This is why Lesson 5 (teleportation) could show the full circuit without explicit measurement gates for Alice's qubits — the math works the same
- Practical note: many quantum frameworks and real hardware prefer deferred measurement

**Step 10: Summary and Further Reading**
- Born rule: P(outcome) = |amplitude|²
- Measurement is irreversible, non-unitary, destroys superposition
- Partial measurement on entangled states collapses the whole system
- Phase is invisible to computational-basis measurement
- Further reading: Qiskit Textbook (measurement), Quantum Country, Nielsen & Chuang Ch. 2.2

### Missing capabilities needed
- **None critical** — all gates (H, X, CX, M) exist, 2 qubits sufficient
- **Nice to have:** Multi-shot histogram (run N times, show distribution) would make Steps 4 and 7 much more impactful. Currently each run gives one random outcome, requiring trust that "if you ran this many times, you'd see ~50/50."

---

## Lesson 7: Superdense Coding

**Why this lesson:** Superdense coding is the "reverse" of teleportation — where teleportation sends 1 qubit using 2 classical bits + entanglement, superdense coding sends 2 classical bits using 1 qubit + entanglement. It's a clean, buildable protocol that uses only existing gates and deeply reinforces Bell states and measurement.

### Step-by-step outline

**Step 1: Introduction — Beating the Classical Limit**
- Can you send 2 bits of information by transmitting just 1 qubit?
- Classically: 1 bit of information requires at minimum 1 bit of communication. No exceptions.
- Quantum: with shared entanglement, Alice can send Bob 2 classical bits by sending 1 qubit
- Discovered by Bennett & Wiesner (1992) — actually published before teleportation
- Preview: build the full protocol in the simulator

**Step 2: The Setup — Shared Entanglement**
- Alice and Bob meet and create a Bell pair: (1/√2)(|00⟩+|11⟩)
- Alice takes qubit 0, Bob takes qubit 1. They separate.
- The entanglement persists regardless of distance (but was created locally)
- Key: the Bell pair is a shared resource, like a pre-shared encryption key

**Step 3: The Encoding — Four Messages, Four Operations**
- Alice wants to send one of four 2-bit messages: 00, 01, 10, 11
- She applies a gate to her qubit ONLY:
  - Message 00: Apply I (do nothing) → state stays (1/√2)(|00⟩+|11⟩) = |Φ+⟩
  - Message 01: Apply X → state becomes (1/√2)(|10⟩+|01⟩) = |Ψ+⟩
  - Message 10: Apply Z → state becomes (1/√2)(|00⟩−|11⟩) = |Φ−⟩
  - Message 11: Apply X then Z → state becomes (1/√2)(|01⟩−|10⟩) = |Ψ−⟩
- These are exactly the four Bell states from Lesson 4!
- Alice sends her qubit to Bob

**Step 4: The Decoding — Reverse the Bell Circuit**
- Bob now has both qubits. He applies: CNOT(q0, q1), then H on q0, then measures both
- This is the reverse of creating a Bell pair (Lesson 4)
- The measurements give Bob Alice's 2-bit message deterministically
- Walk through the math for one case (e.g., message 01):
  - State: (1/√2)(|10⟩+|01⟩)
  - After CNOT: (1/√2)(|11⟩+|01⟩) = (1/√2)(|1⟩+|0⟩)|1⟩
  - After H on q0: |0⟩|1⟩ = |01⟩
  - Measurement: 0 on q0, 1 on q1 → message "01" ✓

**Step 5: Build Superdense Coding — Message 00**
- *Circuit preset:* 2 qubits, H at q0 col 0, CX at q0→q1 col 1 (Bell pair creation), then CX at q0→q1 col 3, H at q0 col 4, M at q0 col 5, M at q1 col 5
- (Column 2 is empty — that's where Alice's encoding would go, but for message 00 it's Identity)
- *Action:* click-play
- Observe: measurement gives |00⟩ → message "00" decoded correctly

**Step 6: Build Superdense Coding — Message 01**
- *Circuit preset:* Same as above but with X at q0 col 2 (Alice's encoding)
- *Action:* click-play
- Observe: measurement gives |01⟩ → message "01" decoded correctly

**Step 7: Build Superdense Coding — Message 10**
- *Circuit preset:* Same but with Z at q0 col 2
- *Action:* click-play
- Observe: measurement gives |10⟩ → message "10" decoded correctly

**Step 8: Try Message 11 Yourself**
- *Circuit preset:* 2 qubits, Bell pair (H col 0, CX col 1), decoder shifted to cols 4-6 (CX col 4, H col 5, M col 6, M col 6). Columns 2-3 empty for Alice's encoding.
- *Action:* place X at q0 col 2
- *Action:* place Z at q0 col 3
- *Action:* click-play
- Observe: measurement gives |11⟩ → message "11" decoded correctly

**Step 9: Why This Works — Bell Basis as an Alphabet**
- The four Bell states are orthogonal — they can be perfectly distinguished
- Alice's local operations (I, X, Z, XZ) rotate between the four Bell states
- Bob's decoding circuit (CNOT + H) converts Bell basis to computational basis
- Deep point: entanglement is a resource. It was "consumed" by the protocol.

**Step 10: Superdense Coding vs Teleportation — Dual Protocols**
- Teleportation: sends 1 qubit using 2 classical bits + 1 Bell pair
- Superdense coding: sends 2 classical bits using 1 qubit + 1 Bell pair
- They are mathematical duals (one is the adjoint of the other)
- Neither violates physics: no FTL (Alice still has to physically send her qubit)
- Holevo bound: without entanglement, 1 qubit can carry at most 1 classical bit

**Step 11: Summary and Further Reading**
- Superdense coding sends 2 classical bits using 1 qubit + shared entanglement
- The four Bell states serve as the encoding alphabet
- Encoding uses only local operations on one qubit (I, X, Z, XZ)
- Decoding reverses Bell pair creation (CNOT + H + measurement)
- Further reading: Qiskit Textbook, original Bennett & Wiesner 1992, IBM Quantum Lab

### Missing capabilities needed
- **None** — all gates exist (H, X, Z, CX, M), 2 qubits sufficient
- Steps 5-8 need careful circuit preset design to fit encoding + decoding in 12 columns

---

## Lesson 8: Deutsch's Algorithm

**Why this lesson:** This is the first quantum algorithm — the simplest concrete proof that a quantum computer can solve certain problems faster than any classical computer. It's been heavily referenced in Lessons 2-3 (interference, phase kickback) but never built. Students finally get to see quantum advantage demonstrated in the simulator.

### Step-by-step outline

**Step 1: Introduction — From Gates to Algorithms**
- So far: individual gates, state manipulation, protocols (teleportation, superdense coding)
- Now: an actual algorithm that solves a problem faster than classical
- Deutsch's algorithm (1985, refined by Deutsch & Jozsa 1992) — historically the first quantum algorithm
- The speedup is modest (1 query vs 2) but the principle is profound

**Step 2: The Oracle Model — Black-Box Functions**
- Computational model: you have access to a function f(x) only through a "black box" (oracle)
- You can query the oracle: give it input, get output. Each query costs resources.
- Goal: learn something about f using as few queries as possible
- This is the right way to compare quantum and classical — it removes implementation details
- For Deutsch's problem: f maps 1 bit to 1 bit, so f: {0,1} → {0,1}

**Step 3: The Problem — Constant vs Balanced**
- There are exactly 4 possible functions f: {0,1} → {0,1}:
  - f₁(x) = 0 (constant) — always outputs 0
  - f₂(x) = 1 (constant) — always outputs 1
  - f₃(x) = x (balanced) — identity
  - f₄(x) = NOT(x) (balanced) — negation
- **Promise:** f is either constant OR balanced. Which is it?
- **Classical:** Must evaluate f(0) and f(1). If they're equal → constant. If different → balanced. Needs 2 queries minimum.
- **Quantum:** Solves this with 1 query. How?

**Step 4: The Quantum Oracle — Phase Kickback**
- Quantum version of the oracle: operates on 2 qubits
- |x⟩|y⟩ → |x⟩|y ⊕ f(x)⟩
- If the target qubit is in state |−⟩ = (1/√2)(|0⟩−|1⟩):
  - |x⟩|−⟩ → (-1)^f(x) |x⟩|−⟩
- The function value moves into the phase! (Phase kickback from Lesson 3)
- The target qubit doesn't change — it "kicks" the answer into the control qubit's phase

**Step 5: The Circuit — Deutsch's Algorithm**
- Setup: qubit 0 = input (starts |0⟩), qubit 1 = target (starts |0⟩)
- Step 1: X on qubit 1 (prepare |1⟩), then H on both qubits
  - State: |+⟩|−⟩ = (1/√2)(|0⟩+|1⟩) ⊗ (1/√2)(|0⟩−|1⟩)
- Step 2: Apply oracle Uf
  - State: (1/√2)((-1)^f(0)|0⟩ + (-1)^f(1)|1⟩) ⊗ |−⟩
- Step 3: H on qubit 0, then measure qubit 0
  - If f constant: (-1)^f(0) · |0⟩ → measure 0
  - If f balanced: (-1)^f(0) · |1⟩ → measure 1
- One query. Done.

**Step 6: Building Oracle f₁ (Constant 0)**
- f(x) = 0: oracle does nothing (identity)
- *Circuit preset:* 2 qubits, X at q1 col 0, H at q0 col 1, H at q1 col 1, [empty col 2 = oracle], H at q0 col 3, M at q0 col 4
- *Action:* click-play
- Observe: qubit 0 measures 0 → constant ✓

**Step 7: Building Oracle f₃ (Balanced — Identity)**
- f(x) = x: oracle is CNOT (if x=1, flip target)
- *Circuit preset:* Same frame but with CX at q0→q1 col 2
- *Action:* click-play
- Observe: qubit 0 measures 1 → balanced ✓

**Step 8: Build Oracle f₄ Yourself (Balanced — NOT)**
- f(x) = NOT(x): flip target always, then flip if x=1... or equivalently, X on target then CNOT
- Simpler: CNOT then X on target qubit (at col 2)
- *Circuit preset:* Frame with CNOT at col 2 pre-placed
- *Action:* place X at q1 col 3 (and shift H, M to cols 4, 5)
- Actually simpler approach: preset the frame leaving oracle area empty, have user place CX and X
- *Action:* click-play
- Observe: qubit 0 measures 1 → balanced ✓

**Step 9: Why This Matters — Quantum Speedup Is Real**
- Deutsch's problem: 1 query vs 2. A 2x speedup. Modest.
- But the principle scales: Deutsch-Jozsa (N bits) → 1 query vs 2^(N-1)+1 queries
- Same interference mechanism powers Grover (√N speedup) and Shor (exponential speedup)
- The "trick" every time: encode information into phases, then use interference to extract it
- Not about "trying all answers at once" — about constructive/destructive interference

**Step 10: Anatomy of Quantum Speedup**
- Three ingredients present in every quantum algorithm:
  1. **Superposition** — query the oracle with multiple inputs simultaneously
  2. **Phase kickback** — the oracle's answer goes into phases, not classical bits
  3. **Interference** — final Hadamard makes the answer constructively interfere
- If any one is missing, the algorithm fails
- This is the template. Grover and Shor use exactly these three ingredients at larger scale.

**Step 11: Summary and Further Reading**
- Deutsch's algorithm: determines constant vs balanced in 1 query (classical needs 2)
- Core mechanism: superposition → phase kickback → interference
- Oracle model isolates the quantum advantage cleanly
- Further reading: Deutsch's original 1985 paper, Qiskit Textbook, Scott Aaronson's lecture notes

### Missing capabilities needed
- **None critical** — H, X, CX, M on 2 qubits covers all 4 oracles
- **Nice to have:** Controlled-Z (CZ) gate for an alternative balanced oracle construction

---

## Lesson 9: GHZ State and Three-Qubit Entanglement

**Why this lesson:** The GHZ state is a natural capstone for the 3-qubit system. It extends entanglement concepts from 2 qubits (Lesson 4) to 3, introduces the strongest form of quantum nonlocality (GHZ theorem — contradicts local realism without inequalities, stronger than Bell), and gives students a satisfying use of all 3 available qubits.

### Step-by-step outline

**Step 1: Introduction — Beyond Two Qubits**
- Lesson 4 covered Bell states: 2-qubit entanglement
- What happens with 3 qubits? The landscape of entanglement gets richer
- Not all multi-qubit entanglement is the same — there are qualitatively different types
- Preview: GHZ state, its remarkable nonlocality properties, comparison with other 3-qubit states

**Step 2: The GHZ State — Construction**
- Named after Greenberger, Horne, and Zeilinger (1989)
- |GHZ⟩ = (1/√2)(|000⟩ + |111⟩)
- Construction: H on qubit 0, CNOT(0,1), CNOT(0,2)
- Step-by-step math:
  - |000⟩ → (1/√2)(|0⟩+|1⟩)|00⟩ → (1/√2)(|000⟩+|100⟩)
  - After CNOT(0,1): (1/√2)(|000⟩+|110⟩)
  - After CNOT(0,2): (1/√2)(|000⟩+|111⟩) ✓
- Three qubits maximally entangled

**Step 3: Build the GHZ State**
- *Circuit preset:* 3 qubits, H at q0 col 0, CX at q0→q1 col 1, CX at q0→q2 col 2
- *Action:* click-step three times
- Observe at each step:
  1. After H: qubit 0 in superposition, qubits 1,2 in |0⟩
  2. After first CNOT: qubits 0,1 entangled, qubit 2 still |0⟩
  3. After second CNOT: all three entangled — only |000⟩ and |111⟩ have nonzero probability

**Step 4: Measuring the GHZ State**
- *Action:* place M at q0 col 3
- *Action:* click-step (one more step to execute measurement)
- Observe: all three qubits collapse together — either |000⟩ or |111⟩
- Measuring any one qubit determines the other two instantly
- Compare with Bell state: same correlation structure but now across 3 parties

**Step 5: GHZ Is Fragile — Lose One, Lose All**
- What if we trace out (lose) one qubit of a GHZ state?
- The remaining 2 qubits are in a mixed state — NO entanglement remains
- Mathematically: reduced density matrix of any 2 qubits = (1/2)(|00⟩⟨00| + |11⟩⟨11|) — classical correlation only, no quantum entanglement
- The Bloch sphere for any individual qubit shows: center of sphere (completely mixed)
- This fragility is NOT universal to all 3-qubit entangled states (see next step)

**Step 6: The W State — A Different Kind of Entanglement**
- The W state: |W⟩ = (1/√3)(|001⟩ + |010⟩ + |100⟩)
- Also entangled across 3 qubits, but with fundamentally different properties
- **Key contrast with GHZ:** If you lose one qubit of a W state, the remaining 2 qubits are STILL entangled
- This makes W states more robust for communication, GHZ states better for sensing/nonlocality proofs
- Mathematically: GHZ and W states cannot be converted into each other using only local operations — they represent genuinely different classes of entanglement (SLOCC classification)
- Note: W state is harder to construct with just H and CNOT (requires rotation gates for exact preparation), but the concept is what matters here

**Step 7: The GHZ Theorem — Nonlocality Without Inequalities**
- Bell's theorem (Lesson 4): uses statistical inequalities to rule out local hidden variables
- GHZ theorem: rules out local hidden variables with a SINGLE measurement (no statistics needed!)
- The argument (Mermin's version, simplified):
  - Consider measuring each qubit in either X or Y basis
  - Quantum mechanics predicts specific correlations for XXX, XYY, YXY, YYX measurements
  - Any local hidden variable theory that reproduces the XYY, YXY, YYX results necessarily predicts the WRONG answer for XXX
  - Not a statistical violation — a logical contradiction
- "The most dramatic departure from classical physics" — not probabilistic, absolute

**Step 8: GHZ Correlations in the Simulator**
- We can't directly measure in X/Y bases with the current M gate (computational basis only)
- But we CAN rotate before measuring: H converts Z-basis to X-basis measurement
- *Circuit preset:* 3 qubits, GHZ creation (H, CX, CX), then H on all three, M on all three
- This implements XXX measurement
- *Action:* click-play
- Observe: outcomes should satisfy the GHZ parity constraint (even number of 1s)
- Note: this demonstrates the quantum prediction that contradicts local hidden variables

**Step 9: Multipartite Entanglement in Practice**
- GHZ states are used in:
  - **Quantum secret sharing:** Split a quantum secret among 3 parties, need all to reconstruct
  - **Quantum error correction:** Stabilizer formalism uses GHZ-like states
  - **Quantum sensing:** GHZ states achieve Heisenberg limit for precision measurement
  - **Quantum networks:** Multi-node entanglement distribution
- Current experimental record: GHZ states with dozens of qubits (trapped ions, photons)

**Step 10: Summary and Further Reading**
- GHZ state = (1/√2)(|000⟩+|111⟩): maximally entangled 3-qubit state
- Construction: H → CNOT → CNOT (simple extension of Bell pair)
- GHZ fragility: losing one qubit destroys all entanglement
- GHZ theorem: strongest form of quantum nonlocality — logical contradiction, not statistical
- Different types of multipartite entanglement exist (GHZ class, W class, etc.)
- Further reading: Original GHZ 1989 paper, Mermin's "Quantum Mysteries Revisited," Qiskit Textbook

### Missing capabilities needed
- **None critical** — H, X, CX, M on 3 qubits covers everything
- **Nice to have:** Ability to measure in X/Y bases directly (or rotation gates Rx, Ry) would make Step 7 more explicit. Currently we use H before M as a workaround for X-basis measurement, which works fine.

---

## Summary of Missing Capabilities (across all 4 lessons)

| Capability | Priority | Impact |
|-----------|----------|--------|
| Multi-shot histogram (run N times, show distribution) | HIGH | Lessons 6, 8 — Born rule and algorithm success visualization |
| Controlled-Z (CZ) gate | MEDIUM | Lesson 8 — alternative oracle, future lessons |
| Toffoli (CCX) gate | MEDIUM | Future lessons (Deutsch-Jozsa, error correction) |
| Rx/Ry/Rz rotation gates | LOW | Would enable arbitrary state prep, X/Y-basis measurement directly |

**Verdict:** All 4 lessons are fully implementable with current simulator capabilities. The multi-shot histogram would be the single highest-impact enhancement, particularly for Lesson 6 (measurement) where seeing statistical distributions would be far more convincing than single-shot runs.
