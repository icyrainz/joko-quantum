import React from 'react';
import { GATE_CATALOG, type GateDefinition } from '../types';

interface GatePaletteProps {
  disabled?: boolean;
}

const MATRIX_TOOLTIPS: Record<string, string> = {
  H: 'H = (1/√2)[[1,1],[1,-1]]',
  X: 'X = [[0,1],[1,0]]',
  Y: 'Y = [[0,-i],[i,0]]',
  Z: 'Z = [[1,0],[0,-1]]',
  S: 'S = [[1,0],[0,i]]',
  T: 'T = [[1,0],[0,e^(iπ/4)]]',
  CNOT: 'CNOT maps |10⟩↔|11⟩',
  SWAP: 'SWAP exchanges |01⟩ and |10⟩',
  M: 'Collapses qubit to |0⟩ or |1⟩',
};

function GateCard({ gate }: { gate: GateDefinition }) {
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
        marginBottom: '6px',
        borderRadius: '8px',
        background: '#0f1923',
        border: `1px solid ${gate.color}33`,
        cursor: 'grab',
        userSelect: 'none',
        transition: 'background 0.15s, border-color 0.15s, transform 0.1s',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.background = '#162030';
        (e.currentTarget as HTMLDivElement).style.borderColor = gate.color + '88';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateX(2px)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.background = '#0f1923';
        (e.currentTarget as HTMLDivElement).style.borderColor = gate.color + '33';
        (e.currentTarget as HTMLDivElement).style.transform = 'translateX(0)';
      }}
    >
      {/* Symbol badge */}
      <div
        style={{
          width: '34px',
          height: '34px',
          borderRadius: '6px',
          background: gate.color + '22',
          border: `1.5px solid ${gate.color}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontWeight: 700,
          fontSize: gate.symbol.length > 1 ? '11px' : '14px',
          color: gate.color,
          letterSpacing: '0px',
          fontFamily: 'monospace',
        }}
      >
        {gate.gateId === 'M' ? (
          <svg viewBox="-19 -19 38 38" width="24" height="24" fill="none">
            <path d="M-11 7C-10 5.5-2-11 0-11C2-11 10 5.5 11 7" stroke={gate.color} strokeWidth="2" strokeLinecap="round" />
            <line x1="0" y1="7" x2="6" y2="-9" stroke={gate.color} strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        ) : (
          gate.symbol
        )}
      </div>

      {/* Text info */}
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: '#d0d8e8', lineHeight: 1.2 }}>
          {gate.name}
        </div>
        <div style={{ fontSize: '10px', color: '#607080', lineHeight: 1.3, marginTop: '2px' }}>
          {gate.description}
        </div>
      </div>
    </div>
  );
}

export default function GatePalette({ disabled }: GatePaletteProps) {
  const single = GATE_CATALOG.filter(g => g.numQubits === 1 && g.gateId !== 'M');
  const multi  = GATE_CATALOG.filter(g => g.numQubits > 1);
  const ops    = GATE_CATALOG.filter(g => g.gateId === 'M');

  const sectionLabel: React.CSSProperties = {
    fontSize: '10px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: '#4a6080',
    marginBottom: '8px',
    marginTop: '4px',
  };

  return (
    <div
      style={{
        width: '180px',
        flexShrink: 0,
        background: '#16213e',
        borderRight: '1px solid #1e2a3a',
        padding: '12px 10px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
      }}
    >
      <div style={{ fontSize: '11px', fontWeight: 700, color: '#8899aa', letterSpacing: '0.05em', marginBottom: '14px' }}>
        GATE PALETTE
      </div>

      <div style={sectionLabel}>Single-Qubit</div>
      {single.map(g => <GateCard key={g.gateId} gate={g} />)}

      <div style={{ ...sectionLabel, marginTop: '14px' }}>Multi-Qubit</div>
      {multi.map(g => <GateCard key={g.gateId} gate={g} />)}

      <div style={{ ...sectionLabel, marginTop: '14px' }}>Operations</div>
      {ops.map(g => <GateCard key={g.gateId} gate={g} />)}

      <div style={{ marginTop: 'auto', paddingTop: '16px', fontSize: '10px', color: '#344050', lineHeight: 1.5 }}>
        Drag a gate onto the circuit canvas to place it.
      </div>
    </div>
  );
}
