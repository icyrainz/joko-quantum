import React from 'react';
import { GATE_CATALOG, type GateDefinition } from '../types';

interface GatePaletteProps {
  disabled?: boolean;
}

const MATRIX_TOOLTIPS: Record<string, string> = {
  H: 'H = (1/\u221A2)[[1,1],[1,-1]]',
  X: 'X = [[0,1],[1,0]]',
  Y: 'Y = [[0,-i],[i,0]]',
  Z: 'Z = [[1,0],[0,-1]]',
  S: 'S = [[1,0],[0,i]]',
  T: 'T = [[1,0],[0,e^(i\u03C0/4)]]',
  CNOT: 'CNOT maps |10\u27E9\u2194|11\u27E9',
  SWAP: 'SWAP exchanges |01\u27E9 and |10\u27E9',
  M: 'Collapses qubit to |0\u27E9 or |1\u27E9',
};

function GateCard({ gate, index }: { gate: GateDefinition; index: number }) {
  const tooltip = `${gate.description}\n${MATRIX_TOOLTIPS[gate.gateId] ?? ''}`.trim();

  function handleDragStart(e: React.DragEvent<HTMLDivElement>) {
    e.dataTransfer.setData('application/quantum-gate', JSON.stringify(gate));
    e.dataTransfer.effectAllowed = 'copy';
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      title={tooltip}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '7px 10px',
        marginBottom: '4px',
        borderRadius: '8px',
        background: '#0f1923',
        border: `1px solid ${gate.color}20`,
        cursor: 'grab',
        userSelect: 'none',
        transition: 'all 0.2s ease',
        animation: `slideInLeft 0.3s ease-out ${index * 0.04}s both`,
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.background = `${gate.color}12`;
        el.style.borderColor = gate.color + '55';
        el.style.transform = 'translateX(3px)';
        el.style.boxShadow = `0 0 12px ${gate.color}20, inset 0 0 20px ${gate.color}08`;
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.background = '#0f1923';
        el.style.borderColor = gate.color + '20';
        el.style.transform = 'translateX(0)';
        el.style.boxShadow = 'none';
      }}
    >
      {/* Symbol badge */}
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '6px',
          background: gate.color + '18',
          border: `1.5px solid ${gate.color}88`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontWeight: 700,
          fontSize: gate.symbol.length > 1 ? '10px' : '13px',
          color: gate.color,
          letterSpacing: '0px',
          fontFamily: 'var(--qf-font-mono)',
          boxShadow: `0 0 8px ${gate.color}15`,
        }}
      >
        {gate.gateId === 'M' ? (
          <svg viewBox="-19 -19 38 38" width="22" height="22" fill="none">
            <path d="M-11 7C-10 5.5-2-11 0-11C2-11 10 5.5 11 7" stroke={gate.color} strokeWidth="2" strokeLinecap="round" />
            <line x1="0" y1="7" x2="6" y2="-9" stroke={gate.color} strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        ) : (
          gate.symbol
        )}
      </div>

      {/* Text info */}
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: '#c8d4e8', lineHeight: 1.2 }}>
          {gate.name}
        </div>
        <div style={{ fontSize: '10px', color: '#506878', lineHeight: 1.3, marginTop: '1px' }}>
          {gate.description}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ children, delay }: { children: React.ReactNode; delay: string }) {
  return (
    <div
      style={{
        fontSize: '10px',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: '#3a5a78',
        marginBottom: '6px',
        marginTop: '4px',
        paddingBottom: '4px',
        borderBottom: '1px solid #1a2a3a',
        fontFamily: 'var(--qf-font-mono)',
        animation: `fadeIn 0.3s ease-out ${delay} both`,
      }}
    >
      {children}
    </div>
  );
}

export default function GatePalette({ disabled }: GatePaletteProps) {
  const single = GATE_CATALOG.filter(g => g.numQubits === 1 && g.gateId !== 'M');
  const multi  = GATE_CATALOG.filter(g => g.numQubits > 1);
  const ops    = GATE_CATALOG.filter(g => g.gateId === 'M');

  return (
    <div
      className="qf-dotgrid"
      style={{
        width: '180px',
        flexShrink: 0,
        background: '#16213e',
        borderRight: '1px solid #1e2a3a',
        padding: '12px 10px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        opacity: disabled ? 0.45 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
        transition: 'opacity 0.3s ease',
        animation: 'slideInLeft 0.35s ease-out',
      }}
    >
      <div style={{
        fontSize: '10px',
        fontWeight: 700,
        color: '#5a7a98',
        letterSpacing: '0.12em',
        marginBottom: '14px',
        fontFamily: 'var(--qf-font-mono)',
        animation: 'fadeIn 0.3s ease-out',
      }}>
        GATES
      </div>

      <SectionHeader delay="0.05s">Single-Qubit</SectionHeader>
      {single.map((g, i) => <GateCard key={g.gateId} gate={g} index={i} />)}

      <div style={{ marginTop: '10px' }} />
      <SectionHeader delay="0.2s">Multi-Qubit</SectionHeader>
      {multi.map((g, i) => <GateCard key={g.gateId} gate={g} index={i + single.length} />)}

      <div style={{ marginTop: '10px' }} />
      <SectionHeader delay="0.3s">Operations</SectionHeader>
      {ops.map((g, i) => <GateCard key={g.gateId} gate={g} index={i + single.length + multi.length} />)}

      <div style={{
        marginTop: 'auto',
        paddingTop: '16px',
        fontSize: '10px',
        color: '#283848',
        lineHeight: 1.5,
        fontStyle: 'italic',
      }}>
        Drag a gate onto the circuit to place it.
      </div>
    </div>
  );
}
