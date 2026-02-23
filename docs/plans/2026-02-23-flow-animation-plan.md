# Flow Animation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add particle flow animation to the circuit canvas — glowing particles travel along wires, gates pulse on activation, and particle brightness encodes qubit probability.

**Architecture:** A new `FlowAnimation` React component renders a Konva `<Layer>` on top of the existing circuit layer. It owns all animation state (particle positions, phase, trails) via `useRef` + `requestAnimationFrame`, avoiding React re-renders per frame. App.tsx drives playback by setting `targetStep`, and FlowAnimation calls back `onStepAnimationComplete` when the visual transition finishes.

**Tech Stack:** React 19, TypeScript 5.9, Konva 10 / react-konva 19, Vitest

---

### Task 1: Create FlowAnimation component with static particles

**Files:**
- Create: `src/components/FlowAnimation.tsx`
- Modify: `src/components/CircuitCanvas.tsx`

**Step 1: Create FlowAnimation with static particles at wire start**

Create `src/components/FlowAnimation.tsx`:

```tsx
import { useRef, useEffect } from 'react';
import { Layer, Circle, Group } from 'react-konva';

// Match CircuitCanvas layout constants
const WIRE_START_X = 60;
const COL_WIDTH = 80;
const ROW_HEIGHT = 80;
const TOP_PADDING = 50;

function wireY(qubit: number) {
  return TOP_PADDING + qubit * ROW_HEIGHT;
}

function colX(col: number) {
  return WIRE_START_X + col * COL_WIDTH + COL_WIDTH / 2;
}

interface FlowAnimationProps {
  numQubits: number;
  enabled: boolean;
}

export default function FlowAnimation({ numQubits, enabled }: FlowAnimationProps) {
  if (!enabled) return null;

  return (
    <Layer>
      {Array.from({ length: numQubits }, (_, qi) => (
        <Group key={qi}>
          {/* Glow circle */}
          <Circle
            x={WIRE_START_X}
            y={wireY(qi)}
            radius={14}
            fill="#3a7bd5"
            opacity={0.15}
          />
          {/* Core particle */}
          <Circle
            x={WIRE_START_X}
            y={wireY(qi)}
            radius={6}
            fill="#3a7bd5"
            opacity={0.7}
            shadowColor="#3a7bd5"
            shadowBlur={12}
            shadowOpacity={0.8}
          />
        </Group>
      ))}
    </Layer>
  );
}
```

**Step 2: Add FlowAnimation layer to CircuitCanvas**

In `src/components/CircuitCanvas.tsx`, import and render `FlowAnimation` as a second `<Layer>` inside the `<Stage>`:

- Add import: `import FlowAnimation from './FlowAnimation';`
- Add prop: `animationEnabled?: boolean` to `CircuitCanvasProps`
- After the closing `</Layer>` (the existing circuit layer), add:
  ```tsx
  <FlowAnimation numQubits={numQubits} enabled={animationEnabled ?? false} />
  ```

**Step 3: Wire up animationEnabled from App.tsx**

In `src/App.tsx`, pass `animationEnabled={true}` to `<CircuitCanvas>`.

**Step 4: Verify visually**

Run: `npm run dev`

Expected: Glowing blue dots appear at the left edge of each qubit wire.

**Step 5: Commit**

```
feat: add FlowAnimation component with static particles
```

---

### Task 2: Implement particle travel animation with requestAnimationFrame

**Files:**
- Modify: `src/components/FlowAnimation.tsx`

**Step 1: Add animation state and rAF loop**

Expand `FlowAnimationProps`:

```tsx
import type { ExecutionStep } from '../types';

interface FlowAnimationProps {
  numQubits: number;
  enabled: boolean;
  targetStep: number;          // -1 = idle, 0..N = animate to this step
  executionSteps: ExecutionStep[];
  speed: number;               // 0.5 to 3
  onStepAnimationComplete?: () => void;
}
```

Replace static particles with animated ones using `useRef` for mutable particle state and `requestAnimationFrame`:

- Track per-particle `{ x, targetX, opacity }` in a ref
- Animation phases: `'idle' | 'traveling' | 'gate_pulse' | 'pause' | 'done'`
- On `targetStep` change, compute the destination X from `executionSteps[targetStep].column` via `colX()`
- Each rAF frame: lerp particle X toward targetX. When arrived, transition to `gate_pulse` phase
- Use `Konva.Node` refs to update positions imperatively (avoid React re-render per frame)
- Use `layer.batchDraw()` to flush visual updates

Key timing constants (scaled by `1/speed`):
- Travel speed: ~400px/sec at 1x speed
- Gate pulse duration: 300ms at 1x speed
- Post-pulse pause: 150ms at 1x speed

**Step 2: Use Konva node refs for imperative updates**

Instead of React state, use refs to Konva Circle nodes and update their `x()` position each frame:

```tsx
const particleRefs = useRef<(Konva.Circle | null)[]>([]);
const glowRefs = useRef<(Konva.Circle | null)[]>([]);

// In rAF callback:
particleRefs.current[qi]?.x(newX);
glowRefs.current[qi]?.x(newX);
layerRef.current?.batchDraw();
```

Attach refs via the `ref` callback on each `<Circle>`.

**Step 3: Verify visually**

Run: `npm run dev`

Place an H gate on qubit 0, column 0. Click Step. Expected: particles travel rightward from wire start to the gate column, then stop.

**Step 4: Commit**

```
feat: animate particles traveling to gate columns
```

---

### Task 3: Add gate activation pulse animation

**Files:**
- Modify: `src/components/CircuitCanvas.tsx`
- Modify: `src/components/FlowAnimation.tsx`

**Step 1: Add activatingColumns prop to CircuitCanvas**

Add a new prop `activatingColumn: number` (column index currently being "pulsed", -1 = none).

In the gate rendering section, when `gate.column === activatingColumn`, apply a `gateActivating` flag. Use `useEffect` + Konva `node.to()` to animate:

- `shadowBlur`: current → 20 → current over 300ms
- `scaleX/scaleY`: 1.0 → 1.12 → 1.0 over 300ms

To do this, add `ref` callbacks to gate `<Group>` nodes and store them in a map keyed by column. When `activatingColumn` changes, call `.to()` on all gate groups in that column.

**Step 2: Trigger gate pulse from FlowAnimation**

When particles arrive at the gate column (travel complete), FlowAnimation:
1. Sets its phase to `gate_pulse`
2. Calls a new `onGatePulseStart?: (column: number) => void` prop
3. Waits 300ms (scaled by speed), then transitions to `pause`
4. After 150ms pause, calls `onStepAnimationComplete()`

CircuitCanvas manages `activatingColumn` state:
- `onGatePulseStart` sets it to the column
- After a timeout matching the pulse duration, resets it to -1

**Step 3: Verify visually**

Place H gate on qubit 0. Click Step. Expected: particle travels to gate, gate glows/scales up then back down, then particle stops.

**Step 4: Commit**

```
feat: add gate activation pulse animation
```

---

### Task 4: Add particle brightness encoding

**Files:**
- Modify: `src/components/FlowAnimation.tsx`

**Step 1: Compute per-qubit probability and map to brightness**

Import `getQubitProbability` from the engine:

```tsx
import { getQubitProbability } from '../engine';
```

After each step completes (during `gate_pulse` phase), compute brightness for each qubit:

```tsx
const prob1 = getQubitProbability(stateAfter, qubitIndex, numQubits);
const brightness = 0.3 + prob1 * 0.7; // 0.3 (dim) to 1.0 (bright)
```

During the gate_pulse phase, smoothly interpolate each particle's opacity from its previous brightness to the new brightness. Update the particle's `opacity` and the glow circle's `opacity` (at 0.2x the particle opacity) via the Konva node refs.

Also scale particle radius slightly: `radius = 5 + prob1 * 3` (5px when |0>, 8px when |1>).

**Step 2: Verify visually**

Place X gate on qubit 0 (flips to |1>). Step through. Expected: particle becomes visibly brighter after passing through the X gate.

Place H gate on qubit 0 (superposition). Step through. Expected: particle at medium brightness (~0.65 opacity).

**Step 3: Commit**

```
feat: encode qubit probability as particle brightness
```

---

### Task 5: Add particle trailing glow

**Files:**
- Modify: `src/components/FlowAnimation.tsx`

**Step 1: Track trail positions and render trail circles**

Add a trail buffer per particle (3 previous positions, sampled every ~30ms during travel):

```tsx
interface ParticleTrail {
  positions: number[]; // last 3 x-positions
}
```

Render trail as additional `<Circle>` nodes behind each particle with decreasing opacity (0.15, 0.08, 0.03) and decreasing radius (4, 3, 2).

During travel, push current X to the trail buffer every ~30ms. When particle stops, clear the trail (fade out over ~100ms).

Use refs for trail circles too, updating their positions imperatively in the rAF loop.

**Step 2: Verify visually**

Click Play with multiple gates. Expected: particles leave a short fading trail behind them as they travel.

**Step 3: Commit**

```
feat: add trailing glow to moving particles
```

---

### Task 6: Integrate animation-aware playback in App.tsx

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/CircuitCanvas.tsx`

**Step 1: Replace setInterval playback with animation-driven playback**

Current App.tsx playback uses `setInterval` to tick `currentStep`. Replace with:

1. App tracks `targetStep` (what step the animation should be showing)
2. When Play is clicked, set `targetStep = 0` (or `currentStep + 1` if resuming)
3. `CircuitCanvas` passes `targetStep` to `FlowAnimation`
4. When `FlowAnimation` calls `onStepAnimationComplete()`:
   - App updates `displayState` for the StateInspector
   - If still playing, App increments `targetStep`
   - If `targetStep >= executionSteps.length`, stop playback
5. Step button: set `targetStep = currentStep + 1`, don't auto-advance after completion
6. Step Back: instant (no animation), move particles back immediately
7. Reset: instant, particles snap back to wire start

**Step 2: Pass executionSteps and speed to CircuitCanvas → FlowAnimation**

Add to `CircuitCanvasProps`:
- `executionSteps: ExecutionStep[]`
- `speed: number`
- `onStepAnimationComplete?: () => void`

CircuitCanvas passes these through to `FlowAnimation`.

**Step 3: Delay StateInspector update until animation completes**

Currently `displayState` is computed immediately from `currentStep`. Change so that `displayState` updates only when `onStepAnimationComplete` fires (for animated playback). For non-animated actions (step back, reset, direct step changes), update immediately.

Add a `displayStep` state separate from `targetStep`:
- `targetStep`: where the animation is heading
- `displayStep`: what the StateInspector is showing (updated on animation complete)

**Step 4: Verify full flow**

1. Place H on q0 col 0, CNOT on q0-q1 col 1
2. Click Play
3. Expected: particles travel to col 0, H gate pulses, particles brighten (superposition), state inspector updates to show 50/50, particles travel to col 1, CNOT pulses, state inspector updates to show Bell state
4. Speed slider should affect animation speed

**Step 5: Commit**

```
feat: integrate animation-aware playback into App
```

---

### Task 7: Handle edge cases and polish

**Files:**
- Modify: `src/components/FlowAnimation.tsx`
- Modify: `src/components/CircuitCanvas.tsx`
- Modify: `src/App.tsx`

**Step 1: Handle qubit count changes during animation**

When `numQubits` changes:
- Stop any running animation
- Reset particles to wire start
- Resize particle arrays

**Step 2: Handle circuit changes during animation**

When gates are added/removed:
- Stop animation, reset to idle
- This already happens because `updateCircuit` calls `stopPlayback(true)`

**Step 3: Handle empty circuit**

If no gates, particles should not appear (or stay at wire start with no animation possible). The play button is already disabled when `totalSteps === 0`.

**Step 4: Handle non-contiguous columns**

ExecutionSteps may skip columns (e.g., gates at columns 0 and 3). Particles should travel the full distance to the correct column X, not just one column width.

**Step 5: Ensure animation disabled doesn't break existing behavior**

When `animationEnabled={false}` (or if we decide to always enable it), the old column-highlight behavior should still work as a fallback.

**Step 6: Verify all edge cases**

Run through each scenario above manually.

**Step 7: Commit**

```
fix: handle animation edge cases (qubit changes, empty circuits, gaps)
```

---

### Task 8: Run tests and final verification

**Files:**
- Test: `src/engine/__tests__/engine.test.ts`

**Step 1: Run existing tests to confirm no regressions**

Run: `npm run test`

Expected: All existing engine tests pass. The animation is purely UI-side and should not affect engine behavior.

**Step 2: Build check**

Run: `npm run build`

Expected: Clean build, no TypeScript errors.

**Step 3: Manual end-to-end verification**

1. Open dev server (`npm run dev`)
2. Place gates, click Play, verify particles animate
3. Verify Step/Step Back/Reset work correctly
4. Verify speed slider affects animation speed
5. Verify particle brightness changes after gates
6. Verify gate pulse animation
7. Verify trailing glow during travel
8. Change qubit count during playback — should reset cleanly
9. Clear circuit during playback — should reset cleanly

**Step 4: Commit**

```
chore: verify flow animation system complete
```
