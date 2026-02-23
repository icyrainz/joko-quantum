import { useMemo, useState } from 'react';
import { Stage, Layer, Circle, Line, Text, Group } from 'react-konva';
import type { Complex } from '../types';

interface BlochSphereProps {
  state: Complex[];
  numQubits: number;
}

/**
 * Compute the Bloch vector (x, y, z) for a single-qubit state |ψ⟩ = α|0⟩ + β|1⟩.
 *
 * x = 2·Re(α·conj(β))
 * y = 2·Im(conj(α)·β)
 * z = |α|² - |β|²
 */
function stateToBlochVector(
  alpha: Complex,
  beta: Complex,
): { x: number; y: number; z: number } {
  // x = 2·Re(α · β*)  = 2·(α.re·β.re + α.im·β.im)
  const x = 2 * (alpha.re * beta.re + alpha.im * beta.im);
  // y = 2·Im(α* · β)  = 2·(alpha.re·β.im - alpha.im·β.re)
  const y = 2 * (alpha.re * beta.im - alpha.im * beta.re);
  // z = |α|² - |β|²
  const z = (alpha.re * alpha.re + alpha.im * alpha.im) -
            (beta.re * beta.re + beta.im * beta.im);
  return { x, y, z };
}

/**
 * Compute the reduced density matrix for a single qubit from a multi-qubit state,
 * then extract the Bloch vector.
 *
 * For qubit `qubitIndex` in an n-qubit system:
 *   ρ_reduced = Tr_rest(|ψ⟩⟨ψ|)
 *   x = 2·Re(ρ₀₁), y = 2·Im(ρ₁₀) = -2·Im(ρ₀₁), z = ρ₀₀ - ρ₁₁
 *
 * Wait — more precisely for the Bloch vector from reduced density matrix:
 *   x = 2·Re(ρ₀₁)  =  Tr(σ_x · ρ)
 *   y = 2·Im(ρ₁₀)  =  Tr(σ_y · ρ)  which equals -2·Im(ρ₀₁) since ρ₁₀ = conj(ρ₀₁)
 *                    Wait: y = Tr(σ_y · ρ) = -2·Im(ρ₀₁)
 *   z = ρ₀₀ - ρ₁₁  =  Tr(σ_z · ρ)
 *
 * Actually let me be more careful:
 *   σ_x = [[0,1],[1,0]]  → Tr(σ_x ρ) = ρ₀₁ + ρ₁₀ = 2·Re(ρ₀₁)
 *   σ_y = [[0,-i],[i,0]] → Tr(σ_y ρ) = -i·ρ₀₁ + i·ρ₁₀ = -i(ρ₀₁ - ρ₁₀)
 *        = -i(ρ₀₁ - conj(ρ₀₁)) = -i·2i·Im(ρ₀₁) = 2·Im(ρ₀₁)
 *   σ_z = [[1,0],[0,-1]] → Tr(σ_z ρ) = ρ₀₀ - ρ₁₁
 */
function reducedBlochVector(
  state: Complex[],
  qubitIndex: number,
  numQubits: number,
): { x: number; y: number; z: number } {
  const size = 1 << numQubits;
  const bitPos = numQubits - 1 - qubitIndex;

  // Compute reduced density matrix elements ρ₀₀, ρ₀₁, ρ₁₁
  let rho00 = 0;
  let rho01_re = 0;
  let rho01_im = 0;
  let rho11 = 0;

  for (let i = 0; i < size; i++) {
    const bit = (i >> bitPos) & 1;
    const amp_i = state[i];
    const mag2 = amp_i.re * amp_i.re + amp_i.im * amp_i.im;

    if (bit === 0) {
      rho00 += mag2;
      // Find the partner index where this qubit is 1 (flip the bit)
      const j = i | (1 << bitPos);
      const amp_j = state[j];
      // ρ₀₁ += amp_i · conj(amp_j)
      rho01_re += amp_i.re * amp_j.re + amp_i.im * amp_j.im;
      rho01_im += amp_i.im * amp_j.re - amp_i.re * amp_j.im;
    } else {
      rho11 += mag2;
    }
  }

  return {
    x: 2 * rho01_re,
    y: 2 * rho01_im,
    z: rho00 - rho11,
  };
}

/** Phase angle in radians → hue 0..360 (matching StateInspector) */
function phaseToHue(rad: number): number {
  return ((rad / Math.PI + 1) / 2) * 360;
}

/** Isometric-ish 2D projection: (x,y,z) → (px,py) screen coords */
function project(
  bx: number,
  by: number,
  bz: number,
  cx: number,
  cy: number,
  r: number,
): { px: number; py: number } {
  // Oblique projection: X goes right, Y goes into-screen (foreshortened at 45°), Z goes up
  const px = cx + r * (bx - by * 0.35);
  const py = cy - r * (bz + by * 0.35);
  return { px, py };
}

const SPHERE_SIZE = 240;
const SPHERE_R = 85;

export default function BlochSphere({ state, numQubits }: BlochSphereProps) {
  const [selectedQubit, setSelectedQubit] = useState(0);

  const bloch = useMemo(() => {
    if (numQubits === 1) {
      const alpha = state[0] ?? { re: 1, im: 0 };
      const beta = state[1] ?? { re: 0, im: 0 };
      return stateToBlochVector(alpha, beta);
    }
    const qi = Math.min(selectedQubit, numQubits - 1);
    return reducedBlochVector(state, qi, numQubits);
  }, [state, numQubits, selectedQubit]);

  const blochLength = Math.sqrt(bloch.x * bloch.x + bloch.y * bloch.y + bloch.z * bloch.z);
  const isPure = blochLength > 0.99;

  const cx = SPHERE_SIZE / 2;
  const cy = SPHERE_SIZE / 2;
  const r = SPHERE_R;

  // Project the Bloch vector endpoint
  const { px: vx, py: vy } = project(bloch.x, bloch.y, bloch.z, cx, cy, r);
  const { px: ox, py: oy } = project(0, 0, 0, cx, cy, r);

  // Phase for coloring
  const vecPhase = Math.atan2(bloch.y, bloch.x);
  const hue = phaseToHue(vecPhase);
  const dotColor = `hsl(${hue}, 70%, 55%)`;

  // Axis endpoints for labels
  const axes = [
    { label: '|0⟩', bx: 0, by: 0, bz: 1 },
    { label: '|1⟩', bx: 0, by: 0, bz: -1 },
    { label: '|+⟩', bx: 1, by: 0, bz: 0 },
    { label: '|−⟩', bx: -1, by: 0, bz: 0 },
    { label: '|i⟩', bx: 0, by: 1, bz: 0 },
    { label: '|−i⟩', bx: 0, by: -1, bz: 0 },
  ];

  return (
    <div>
      {/* Qubit selector for multi-qubit states */}
      {numQubits > 1 && (
        <div style={{
          display: 'flex',
          gap: '4px',
          marginBottom: '6px',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: '10px', color: '#4a6080', marginRight: '4px' }}>Qubit:</span>
          {Array.from({ length: numQubits }, (_, i) => (
            <button
              key={i}
              onClick={() => setSelectedQubit(i)}
              style={{
                width: '22px',
                height: '20px',
                borderRadius: '4px',
                border: i === selectedQubit ? '1px solid #4FC3F7' : '1px solid #1e2a3a',
                background: i === selectedQubit ? '#4FC3F720' : '#0d1117',
                color: i === selectedQubit ? '#4FC3F7' : '#607090',
                fontSize: '10px',
                fontWeight: 600,
                cursor: 'pointer',
                padding: 0,
              }}
            >
              {i}
            </button>
          ))}
          {!isPure && (
            <span style={{ fontSize: '9px', color: '#e8c84a', marginLeft: '4px' }}>mixed</span>
          )}
        </div>
      )}

      <Stage width={SPHERE_SIZE} height={SPHERE_SIZE}>
        <Layer>
          {/* Sphere outline */}
          <Circle
            x={cx}
            y={cy}
            radius={r}
            stroke="#2a3a50"
            strokeWidth={1}
            fill="#0d111780"
          />

          {/* Equator ellipse (foreshortened) */}
          <Line
            points={(() => {
              const pts: number[] = [];
              for (let a = 0; a <= 360; a += 5) {
                const rad = (a * Math.PI) / 180;
                const ex = Math.cos(rad);
                const ey = Math.sin(rad);
                const { px, py } = project(ex, ey, 0, cx, cy, r);
                pts.push(px, py);
              }
              return pts;
            })()}
            stroke="#2a3a5060"
            strokeWidth={0.8}
            dash={[3, 3]}
            closed
          />

          {/* Z axis (vertical) */}
          {(() => {
            const { px: x1, py: y1 } = project(0, 0, 1.15, cx, cy, r);
            const { px: x2, py: y2 } = project(0, 0, -1.15, cx, cy, r);
            return <Line points={[x1, y1, x2, y2]} stroke="#3a5070" strokeWidth={0.8} dash={[3, 3]} />;
          })()}

          {/* X axis */}
          {(() => {
            const { px: x1, py: y1 } = project(1.15, 0, 0, cx, cy, r);
            const { px: x2, py: y2 } = project(-1.15, 0, 0, cx, cy, r);
            return <Line points={[x1, y1, x2, y2]} stroke="#3a5070" strokeWidth={0.8} dash={[3, 3]} />;
          })()}

          {/* Y axis */}
          {(() => {
            const { px: x1, py: y1 } = project(0, 1.15, 0, cx, cy, r);
            const { px: x2, py: y2 } = project(0, -1.15, 0, cx, cy, r);
            return <Line points={[x1, y1, x2, y2]} stroke="#3a5070" strokeWidth={0.8} dash={[3, 3]} />;
          })()}

          {/* Axis labels */}
          {axes.map((a) => {
            const { px, py } = project(a.bx * 1.28, a.by * 1.28, a.bz * 1.28, cx, cy, r);
            return (
              <Text
                key={a.label}
                x={px - 14}
                y={py - 6}
                width={28}
                text={a.label}
                fontSize={9}
                fontFamily="monospace"
                fill="#607090"
                align="center"
              />
            );
          })}

          {/* Bloch vector line from origin to tip */}
          <Line
            points={[ox, oy, vx, vy]}
            stroke={dotColor}
            strokeWidth={2}
            lineCap="round"
            shadowColor={dotColor}
            shadowBlur={6}
            shadowOpacity={0.5}
          />

          {/* Bloch vector dot */}
          <Circle
            x={vx}
            y={vy}
            radius={5}
            fill={dotColor}
            shadowColor={dotColor}
            shadowBlur={10}
            shadowOpacity={0.8}
          />

          {/* Origin dot */}
          <Circle
            x={ox}
            y={oy}
            radius={2}
            fill="#607090"
          />

          {/* Coordinates label */}
          <Group>
            <Text
              x={4}
              y={SPHERE_SIZE - 14}
              text={`(${bloch.x.toFixed(2)}, ${bloch.y.toFixed(2)}, ${bloch.z.toFixed(2)})`}
              fontSize={9}
              fontFamily="monospace"
              fill="#4a6080"
            />
          </Group>
        </Layer>
      </Stage>
    </div>
  );
}
