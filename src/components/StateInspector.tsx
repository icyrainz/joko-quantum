import { useMemo, useState } from 'react';
import type { Complex } from '../types';
import BlochSphere from './BlochSphere';

interface StateInspectorProps {
  state: Complex[];
  numQubits: number;
  isAnimating: boolean;
  measurementResults?: Record<number, 0 | 1>;
}

function magnitude(c: Complex): number {
  return Math.sqrt(c.re * c.re + c.im * c.im);
}

function phase(c: Complex): number {
  return Math.atan2(c.im, c.re); // radians, -π..π
}

/** Format a basis index as a ket label: e.g. 3 qubits, index 5 → |101⟩ */
function ketLabel(index: number, numQubits: number): string {
  return `|${index.toString(2).padStart(numQubits, '0')}⟩`;
}

/** Phase in -π..π → hue in 0..360 */
function phaseToHue(rad: number): number {
  // Map -π → 0°, 0 → 180°, +π → 360°
  return ((rad / Math.PI + 1) / 2) * 360;
}

function formatComplex(c: Complex): string {
  const re   = c.re.toFixed(3);
  const sign = c.im >= 0 ? '+' : '-';
  const im   = Math.abs(c.im).toFixed(3);
  return `${re} ${sign} ${im}i`;
}

/** Build the ket-notation string, omitting near-zero amplitudes. */
function buildKetString(state: Complex[], numQubits: number): string {
  const terms: string[] = [];
  for (let i = 0; i < state.length; i++) {
    const mag = magnitude(state[i]);
    if (mag < 0.005) continue;
    const amp  = formatComplex(state[i]);
    const ket  = ketLabel(i, numQubits);
    terms.push(`(${amp})${ket}`);
  }
  if (terms.length === 0) return '0';
  return terms.join(' + ');
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: '10px',
      color: '#3a5a78',
      marginBottom: '8px',
      fontWeight: 600,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      fontFamily: 'var(--qf-font-mono)',
    }}>
      {children}
    </div>
  );
}

function BlochSphereSection({ state, numQubits }: { state: Complex[]; numQubits: number }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{ marginTop: '16px' }}>
      <div
        style={{
          fontSize: '10px',
          color: '#3a5a78',
          marginBottom: '6px',
          fontWeight: 600,
          cursor: 'pointer',
          userSelect: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          fontFamily: 'var(--qf-font-mono)',
        }}
        onClick={() => setCollapsed(c => !c)}
      >
        <span style={{
          fontSize: '8px',
          transition: 'transform 0.2s ease',
          display: 'inline-block',
          transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
        }}>
          ▼
        </span>
        Bloch Sphere
      </div>
      {!collapsed && <BlochSphere state={state} numQubits={numQubits} />}
    </div>
  );
}

export default function StateInspector({ state, numQubits, isAnimating, measurementResults }: StateInspectorProps) {
  const dim = 2 ** numQubits;

  // Ensure state vector has correct dimension (pad with zeros if needed)
  const paddedState = useMemo<Complex[]>(() => {
    if (state.length === dim) return state;
    const out: Complex[] = Array.from({ length: dim }, (_, i) =>
      i < state.length ? state[i] : { re: 0, im: 0 },
    );
    return out;
  }, [state, dim]);

  const maxProb = useMemo(
    () => Math.max(...paddedState.map(c => magnitude(c) ** 2), 0.001),
    [paddedState],
  );

  const ketString = useMemo(
    () => buildKetString(paddedState, numQubits),
    [paddedState, numQubits],
  );

  return (
    <div
      className="qf-dotgrid"
      style={{
        width: '280px',
        flexShrink: 0,
        background: '#16213e',
        borderLeft: '1px solid #1e2a3a',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'slideInRight 0.35s ease-out',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '10px 14px',
        borderBottom: '1px solid #1e2a3a',
        fontSize: '10px',
        fontWeight: 700,
        color: '#5a7a98',
        letterSpacing: '0.12em',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontFamily: 'var(--qf-font-mono)',
      }}>
        STATE INSPECTOR
        {isAnimating && (
          <span style={{
            fontSize: '9px',
            color: '#4FC3F7',
            background: '#4FC3F715',
            border: '1px solid #4FC3F730',
            borderRadius: '10px',
            padding: '1px 8px',
            fontWeight: 600,
            animation: 'livePulse 1.5s ease-in-out infinite',
          }}>
            LIVE
          </span>
        )}
      </div>

      {/* Measurement results banner */}
      {measurementResults && Object.keys(measurementResults).length > 0 && (
        <div style={{
          padding: '8px 14px',
          background: 'linear-gradient(90deg, #1a2940 0%, #1e2d45 100%)',
          borderBottom: '1px solid #1e2a3a',
          animation: 'fadeIn 0.3s ease-out',
        }}>
          {Object.entries(measurementResults).map(([qubit, result]) => (
            <div key={qubit} style={{
              fontSize: '11px',
              color: '#e8c84a',
              fontFamily: 'var(--qf-font-mono)',
              fontWeight: 600,
              padding: '2px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <span style={{
                display: 'inline-block',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#e8c84a',
                boxShadow: '0 0 6px #e8c84a60',
              }} />
              q{qubit} measured: |{result}⟩
            </div>
          ))}
        </div>
      )}

      {/* Bar chart */}
      <div style={{ padding: '14px', flex: 1, overflowY: 'auto' }}>
        <SectionLabel>Probability Amplitudes</SectionLabel>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {paddedState.map((amp, idx) => {
            const prob    = magnitude(amp) ** 2;
            const relH    = (prob / maxProb) * 100;
            const hue     = phaseToHue(phase(amp));
            const barColor = `hsl(${hue}, 65%, 52%)`;
            const label    = ketLabel(idx, numQubits);

            return (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Ket label */}
                <div style={{
                  width: '38px',
                  fontSize: '11px',
                  fontFamily: 'var(--qf-font-mono)',
                  fontWeight: 500,
                  color: '#6a8aaa',
                  flexShrink: 0,
                  textAlign: 'right',
                }}>
                  {label}
                </div>

                {/* Bar track */}
                <div style={{
                  flex: 1,
                  height: '16px',
                  background: '#0a0f18',
                  borderRadius: '4px',
                  border: '1px solid #152030',
                  overflow: 'hidden',
                  position: 'relative',
                }}>
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    height: '100%',
                    width: `${relH}%`,
                    background: `linear-gradient(90deg, ${barColor}cc, ${barColor})`,
                    borderRadius: '3px',
                    transition: isAnimating ? 'width 0.2s ease, background 0.2s ease' : 'none',
                    boxShadow: prob > 0.01 ? `0 0 8px ${barColor}44` : 'none',
                  }} />
                </div>

                {/* Probability value */}
                <div style={{
                  width: '38px',
                  fontSize: '10px',
                  fontFamily: 'var(--qf-font-mono)',
                  fontWeight: 500,
                  color: prob > 0.01 ? '#5a8aaa' : '#2a3a50',
                  flexShrink: 0,
                  textAlign: 'right',
                }}>
                  {(prob * 100).toFixed(1)}%
                </div>
              </div>
            );
          })}
        </div>

        {/* Phase legend */}
        <div style={{ marginTop: '16px' }}>
          <SectionLabel>Phase Colour Guide</SectionLabel>
          <div style={{
            height: '8px',
            borderRadius: '4px',
            background: 'linear-gradient(to right, hsl(0,65%,52%), hsl(90,65%,52%), hsl(180,65%,52%), hsl(270,65%,52%), hsl(360,65%,52%))',
            boxShadow: '0 0 8px #ffffff08',
          }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px' }}>
            {['-\u03C0', '-\u03C0/2', '0', '\u03C0/2', '\u03C0'].map(l => (
              <span key={l} style={{ fontSize: '9px', fontFamily: 'var(--qf-font-mono)', color: '#2a4060' }}>{l}</span>
            ))}
          </div>
        </div>

        {/* Bloch Sphere */}
        <BlochSphereSection state={paddedState} numQubits={numQubits} />

        {/* Divider */}
        <div style={{ borderTop: '1px solid #1a2a3a', margin: '16px 0' }} />

        {/* Ket notation */}
        <div>
          <SectionLabel>Dirac Notation</SectionLabel>
          <div style={{
            background: '#0a0f18',
            borderRadius: '6px',
            padding: '10px 12px',
            fontSize: '11px',
            fontFamily: 'var(--qf-font-mono)',
            fontWeight: 400,
            color: '#7ab0e0',
            wordBreak: 'break-all',
            lineHeight: 1.7,
            border: '1px solid #152030',
            whiteSpace: 'pre-wrap',
          }}>
            <span style={{ color: '#4a6a88' }}>|ψ⟩</span> = {ketString}
          </div>
        </div>

        {/* Raw amplitude table */}
        <div style={{ marginTop: '16px' }}>
          <SectionLabel>Amplitudes</SectionLabel>
          <div style={{
            background: '#0a0f18',
            borderRadius: '6px',
            border: '1px solid #152030',
            overflow: 'hidden',
          }}>
            {paddedState.map((amp, idx) => {
              const mag  = magnitude(amp);
              const prob = mag ** 2;
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '5px 10px',
                    borderBottom: idx < paddedState.length - 1 ? '1px solid #111a25' : 'none',
                    opacity: prob < 0.001 ? 0.3 : 1,
                    transition: 'opacity 0.2s ease',
                  }}
                >
                  <span style={{ fontSize: '10px', fontFamily: 'var(--qf-font-mono)', fontWeight: 500, color: '#5a7a98', width: '32px' }}>
                    {ketLabel(idx, numQubits)}
                  </span>
                  <span style={{ fontSize: '10px', fontFamily: 'var(--qf-font-mono)', color: '#3a6080', flex: 1, textAlign: 'center' }}>
                    {formatComplex(amp)}
                  </span>
                  <span style={{ fontSize: '10px', fontFamily: 'var(--qf-font-mono)', fontWeight: 500, color: '#2a5070', width: '36px', textAlign: 'right' }}>
                    {mag.toFixed(3)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
