# Flow Animation System — Design

**Date:** 2026-02-23
**Status:** Approved

## Goal

Implement the "redstone-inspired" particle flow animation described in the original design doc (Phase 4). Glowing particles travel along qubit wires, pause at gates which pulse/glow on activation, and encode qubit probability via brightness.

## Scope (v1)

**In scope:**
- Glowing particles flowing left-to-right along wires
- Gate activation animation (glow pulse + scale pulse)
- Brightness/opacity encoding of per-qubit |1> probability
- Trailing glow behind moving particles
- Speed-responsive animation timing

**Deferred (v2):**
- Superposition split-stream visuals
- Entanglement synced pulses + connecting arcs
- Phase color hue on particles

## Approach

Konva Animation Layer — a dedicated `<Layer>` on top of the existing circuit layer in `CircuitCanvas`. Particles are Konva `Circle` nodes animated via `requestAnimationFrame`. Gate activation uses Konva's `node.to()` tween.

## Animation State Machine

```
IDLE -> TRAVELING -> GATE_PULSE -> PAUSE -> (next column or DONE)
```

- **IDLE**: Particles at wire start. Waiting for Play/Step.
- **TRAVELING**: Particles move rightward to next gate column X. Duration scales with distance and speed.
- **GATE_PULSE**: Particles at gate. Gate glows/scales (~300ms). State vector updates.
- **PAUSE**: Brief hold (~150ms) before continuing.
- **DONE**: Particles at right edge. Playback stops.

Driven by `requestAnimationFrame`, coordinated with `currentStep`/`isPlaying` from App.

## Particle Rendering

One particle per qubit wire:
- **Shape**: Konva Circle, radius ~6px, with larger faint glow circle (~14px) behind
- **Color**: Wire color `#3a7bd5`
- **Brightness**: Encodes P(|1>) for that qubit. High probability = bright (opacity 1.0), low = dim (opacity 0.3)
- **Trail**: 2-3 previous positions at decreasing opacity
- **Position**: X travels from WIRE_START_X to colX(column) to wire end. Y fixed at wireY(qubit).

Brightness computed via `getQubitProbability()` from engine, interpolated during GATE_PULSE.

## Gate Activation Animation

On particle arrival at a gate column:
1. shadowBlur: current -> 20px -> current (300ms)
2. Scale: 1.0 -> 1.12 -> 1.0 (300ms)
3. Background fill opacity pulses brighter

Triggered via `gateActivating` prop on existing gate shape components, using Konva `node.to()`.

## Integration with App.tsx

New props on CircuitCanvas:
- `animationEnabled: boolean`
- `executionSteps: ExecutionStep[]`
- `speed: number`
- `onStepAnimationComplete?: () => void`

App playback changes:
- Instead of setInterval ticking currentStep directly, wait for onStepAnimationComplete before advancing
- StateInspector updates when gate pulse completes (in sync with particles)

## File Structure

New file:
- `src/components/FlowAnimation.tsx` — Particle layer component (Konva Layer), state machine, rAF loop, gate tween triggers

Modified files:
- `src/components/CircuitCanvas.tsx` — Add FlowAnimation layer, new props, gate activation prop
- `src/App.tsx` — Animation-aware playback, pass executionSteps/speed to canvas
