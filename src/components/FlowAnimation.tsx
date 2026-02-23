import { useRef, useEffect, useCallback } from 'react';
import { Layer, Circle, Group } from 'react-konva';
import type Konva from 'konva';
import type { ExecutionStep } from '../types';
import { getQubitProbability } from '../engine';

// Layout constants — must match CircuitCanvas exactly
const WIRE_START_X = 60;
const COL_WIDTH    = 80;
const ROW_HEIGHT   = 80;
const TOP_PADDING  = 50;

// Animation timing (at 1x speed)
const TRAVEL_SPEED   = 400; // pixels per second
const GATE_PULSE_MS  = 300;
const POST_PAUSE_MS  = 150;

// Trail config
const TRAIL_COUNT    = 3;
const TRAIL_SAMPLE_MS = 30;

type AnimPhase = 'idle' | 'traveling' | 'gate_pulse' | 'pause' | 'done';

interface ParticleState {
  x: number;
  brightness: number;     // 0.3 .. 1.0
  prevBrightness: number;
  trailXs: number[];      // last N x-positions
  lastTrailSample: number; // timestamp of last trail sample
}

function wireY(qubit: number) {
  return TOP_PADDING + qubit * ROW_HEIGHT;
}

function colX(col: number) {
  return WIRE_START_X + col * COL_WIDTH + COL_WIDTH / 2;
}

interface FlowAnimationProps {
  numQubits: number;
  enabled: boolean;
  targetStep: number;            // -1 = idle/reset, 0..N = animate to this step
  executionSteps: ExecutionStep[];
  speed: number;                 // 0.5 .. 3
  onStepAnimationComplete?: () => void;
  onGatePulseStart?: (column: number) => void;
}

export default function FlowAnimation({
  numQubits,
  enabled,
  targetStep,
  executionSteps,
  speed,
  onStepAnimationComplete,
  onGatePulseStart,
}: FlowAnimationProps) {
  const layerRef = useRef<Konva.Layer | null>(null);
  const particleCoreRefs = useRef<(Konva.Circle | null)[]>([]);
  const particleGlowRefs = useRef<(Konva.Circle | null)[]>([]);
  const trailRefs = useRef<(Konva.Circle | null)[][]>([]);

  // Mutable animation state (not React state — no re-renders per frame)
  const animState = useRef<{
    phase: AnimPhase;
    particles: ParticleState[];
    targetX: number;
    startX: number;
    phaseStartTime: number;
    travelDuration: number;
    lastTargetStep: number;
  }>({
    phase: 'idle',
    particles: [],
    targetX: WIRE_START_X,
    startX: WIRE_START_X,
    phaseStartTime: 0,
    travelDuration: 0,
    lastTargetStep: -1,
  });

  const rafRef = useRef<number>(0);
  const callbackRefs = useRef({ onStepAnimationComplete, onGatePulseStart });
  callbackRefs.current = { onStepAnimationComplete, onGatePulseStart };

  // Initialize particle state when numQubits changes
  useEffect(() => {
    const particles: ParticleState[] = Array.from({ length: numQubits }, () => ({
      x: WIRE_START_X,
      brightness: 0.3,
      prevBrightness: 0.3,
      trailXs: [],
      lastTrailSample: 0,
    }));
    animState.current.particles = particles;
    animState.current.phase = 'idle';
    animState.current.lastTargetStep = -1;

    // Reset refs arrays
    particleCoreRefs.current = new Array(numQubits).fill(null);
    particleGlowRefs.current = new Array(numQubits).fill(null);
    trailRefs.current = Array.from({ length: numQubits }, () =>
      new Array(TRAIL_COUNT).fill(null),
    );

    // Sync visual positions
    syncVisuals();
  }, [numQubits]);

  // Sync Konva nodes to particle state
  const syncVisuals = useCallback(() => {
    const { particles } = animState.current;
    for (let qi = 0; qi < particles.length; qi++) {
      const p = particles[qi];
      const core = particleCoreRefs.current[qi];
      const glow = particleGlowRefs.current[qi];

      if (core) {
        core.x(p.x);
        core.opacity(p.brightness);
        core.radius(5 + p.brightness * 3); // 5px dim, 8px bright
      }
      if (glow) {
        glow.x(p.x);
        glow.opacity(p.brightness * 0.2);
      }

      // Update trails
      const trails = trailRefs.current[qi];
      if (trails) {
        for (let ti = 0; ti < TRAIL_COUNT; ti++) {
          const trailNode = trails[ti];
          if (trailNode) {
            const trailX = p.trailXs[p.trailXs.length - 1 - ti];
            if (trailX !== undefined && animState.current.phase === 'traveling') {
              trailNode.x(trailX);
              trailNode.opacity([0.15, 0.08, 0.03][ti] * p.brightness);
              trailNode.visible(true);
            } else {
              trailNode.visible(false);
            }
          }
        }
      }
    }
    layerRef.current?.batchDraw();
  }, []);

  // Main animation loop
  const animate = useCallback((timestamp: number) => {
    const state = animState.current;
    const { phase, particles } = state;

    if (phase === 'idle' || phase === 'done') {
      return; // no rAF loop needed
    }

    const elapsed = timestamp - state.phaseStartTime;
    const speedFactor = speed;

    if (phase === 'traveling') {
      const progress = Math.min(1, elapsed / state.travelDuration);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentX = state.startX + (state.targetX - state.startX) * eased;

      for (let qi = 0; qi < particles.length; qi++) {
        const p = particles[qi];
        p.x = currentX;

        // Sample trail positions
        if (timestamp - p.lastTrailSample > TRAIL_SAMPLE_MS) {
          p.trailXs.push(currentX);
          if (p.trailXs.length > TRAIL_COUNT + 2) {
            p.trailXs.shift();
          }
          p.lastTrailSample = timestamp;
        }
      }

      syncVisuals();

      if (progress >= 1) {
        // Arrived at gate — transition to gate_pulse
        state.phase = 'gate_pulse';
        state.phaseStartTime = timestamp;

        // Notify about gate pulse
        const stepIdx = state.lastTargetStep;
        if (stepIdx >= 0 && stepIdx < executionSteps.length) {
          callbackRefs.current.onGatePulseStart?.(executionSteps[stepIdx].column);

          // Compute new brightness from stateAfter
          const stateAfter = executionSteps[stepIdx].stateAfter;
          for (let qi = 0; qi < particles.length; qi++) {
            const p = particles[qi];
            p.prevBrightness = p.brightness;
            const prob1 = getQubitProbability(stateAfter, qi, numQubits);
            p.brightness = 0.3 + prob1 * 0.7;
          }
        }
      }
    } else if (phase === 'gate_pulse') {
      const pulseDuration = GATE_PULSE_MS / speedFactor;
      const progress = Math.min(1, elapsed / pulseDuration);

      // Interpolate brightness during pulse
      for (let qi = 0; qi < particles.length; qi++) {
        const p = particles[qi];
        const interpBrightness = p.prevBrightness + (p.brightness - p.prevBrightness) * progress;
        // Temporarily set brightness for visual update
        const targetBrightness = p.brightness;
        p.brightness = interpBrightness;
        syncVisuals();
        p.brightness = targetBrightness;
      }

      if (progress >= 1) {
        // Finalize brightness
        syncVisuals();
        state.phase = 'pause';
        state.phaseStartTime = timestamp;
      }
    } else if (phase === 'pause') {
      const pauseDuration = POST_PAUSE_MS / speedFactor;

      // Clear trails during pause
      for (const p of particles) {
        p.trailXs = [];
      }
      syncVisuals();

      if (elapsed >= pauseDuration) {
        state.phase = 'done';
        callbackRefs.current.onStepAnimationComplete?.();
        return;
      }
    }

    rafRef.current = requestAnimationFrame(animate);
  }, [speed, executionSteps, numQubits, syncVisuals]);

  // React to targetStep changes
  useEffect(() => {
    const state = animState.current;

    if (targetStep === state.lastTargetStep) return;

    // Cancel any running animation
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }

    if (targetStep < 0) {
      // Reset to idle
      state.phase = 'idle';
      state.lastTargetStep = -1;
      for (const p of state.particles) {
        p.x = WIRE_START_X;
        p.brightness = 0.3;
        p.prevBrightness = 0.3;
        p.trailXs = [];
      }
      syncVisuals();
      return;
    }

    if (targetStep >= executionSteps.length) return;

    const step = executionSteps[targetStep];
    const destX = colX(step.column);

    state.startX = state.particles[0]?.x ?? WIRE_START_X;
    state.targetX = destX;
    state.lastTargetStep = targetStep;

    const distance = Math.abs(destX - state.startX);
    state.travelDuration = Math.max(100, (distance / TRAVEL_SPEED) * 1000 / speed);
    state.phase = 'traveling';
    state.phaseStartTime = performance.now();

    rafRef.current = requestAnimationFrame(animate);
  }, [targetStep, executionSteps, speed, animate, syncVisuals]);

  // Cleanup rAF on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (!enabled) return null;

  return (
    <Layer ref={layerRef}>
      {Array.from({ length: numQubits }, (_, qi) => {
        const y = wireY(qi);
        return (
          <Group key={`particle-${qi}`}>
            {/* Trail circles */}
            {Array.from({ length: TRAIL_COUNT }, (__, ti) => (
              <Circle
                key={`trail-${qi}-${ti}`}
                ref={(node) => {
                  if (!trailRefs.current[qi]) {
                    trailRefs.current[qi] = new Array(TRAIL_COUNT).fill(null);
                  }
                  trailRefs.current[qi][ti] = node;
                }}
                x={WIRE_START_X}
                y={y}
                radius={[4, 3, 2][ti]}
                fill="#3a7bd5"
                opacity={0}
                visible={false}
              />
            ))}
            {/* Glow circle */}
            <Circle
              ref={(node) => { particleGlowRefs.current[qi] = node; }}
              x={WIRE_START_X}
              y={y}
              radius={14}
              fill="#3a7bd5"
              opacity={0.06}
            />
            {/* Core particle */}
            <Circle
              ref={(node) => { particleCoreRefs.current[qi] = node; }}
              x={WIRE_START_X}
              y={y}
              radius={6}
              fill="#3a7bd5"
              opacity={0.3}
              shadowColor="#3a7bd5"
              shadowBlur={12}
              shadowOpacity={0.8}
            />
          </Group>
        );
      })}
    </Layer>
  );
}
