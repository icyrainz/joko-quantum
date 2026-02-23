import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Stage, Layer, Line, Text, Rect, Circle, Group } from 'react-konva';
import type Konva from 'konva';
import { GATE_CATALOG, type Circuit, type CircuitGate, type ExecutionStep } from '../types';
import FlowAnimation from './FlowAnimation';

// Layout constants
const WIRE_START_X   = 60;   // x where wires begin (after labels)
const COL_WIDTH      = 80;   // horizontal spacing between gate columns
const ROW_HEIGHT     = 80;   // vertical spacing between qubit rows
const TOP_PADDING    = 50;   // top margin
const GATE_SIZE      = 38;   // gate box width/height
const MAX_COLS       = 12;   // maximum circuit columns

interface CircuitCanvasProps {
  circuit: Circuit;
  onCircuitChange: (circuit: Circuit) => void;
  currentStep: number;      // column index being highlighted (-1 = none)
  numQubits: number;
  disabled?: boolean;
  animationEnabled?: boolean;
  targetStep?: number;
  executionSteps?: ExecutionStep[];
  speed?: number;
  onStepAnimationComplete?: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function wireY(qubit: number) {
  return TOP_PADDING + qubit * ROW_HEIGHT;
}

function colX(col: number) {
  return WIRE_START_X + col * COL_WIDTH + COL_WIDTH / 2;
}

function snapToGrid(x: number, y: number, numQubits: number): { col: number; qubit: number } | null {
  const col   = Math.round((x - WIRE_START_X - COL_WIDTH / 2) / COL_WIDTH);
  const qubit = Math.round((y - TOP_PADDING) / ROW_HEIGHT);
  if (col < 0 || col >= MAX_COLS) return null;
  if (qubit < 0 || qubit >= numQubits) return null;
  return { col, qubit };
}

function normalizeGateId(gateId: string): string {
  if (gateId === 'CX') return 'CNOT';
  if (gateId === 'SW') return 'SWAP';
  return gateId;
}

function getGateDefinition(gateId: string) {
  const normalized = normalizeGateId(gateId);
  return GATE_CATALOG.find((gate) => gate.gateId === normalized)
    ?? GATE_CATALOG.find((gate) => gate.symbol === normalized);
}

function gateColor(gateId: string): string {
  return getGateDefinition(gateId)?.color ?? '#888';
}

function gateNumQubits(gateId: string): number {
  return getGateDefinition(gateId)?.numQubits ?? 1;
}

function gateDisplaySymbol(gateId: string): string {
  return getGateDefinition(gateId)?.symbol ?? gateId;
}

function hasOverlap(a: number[], b: number[]): boolean {
  return a.some((q) => b.includes(q));
}

function canPlaceGate(circuit: Circuit, candidateGate: CircuitGate): boolean {
  return !circuit.gates.some((gate) =>
    gate.column === candidateGate.column
    && hasOverlap(gate.targetQubits, candidateGate.targetQubits),
  );
}

// ---------------------------------------------------------------------------
// Sub-components rendered on the Konva layer
// ---------------------------------------------------------------------------

interface SingleGateShapeProps {
  x: number;
  y: number;
  symbol: string;
  color: string;
  selected: boolean;
  highlighted: boolean;
  onClick: () => void;
  onRemove: () => void;
}

function SingleGateShape({
  x,
  y,
  symbol,
  color,
  selected,
  highlighted,
  onClick,
  onRemove,
}: SingleGateShapeProps) {
  const hs = GATE_SIZE / 2;
  const borderColor = selected ? '#fff' : highlighted ? color : color + '99';
  const bgColor     = highlighted ? color + '40' : color + '1a';

  return (
    <Group
      x={x}
      y={y}
      onClick={onClick}
      onTap={onClick}
      onContextMenu={(event) => {
        event.evt.preventDefault();
        onRemove();
      }}
    >
      <Rect
        x={-hs}
        y={-hs}
        width={GATE_SIZE}
        height={GATE_SIZE}
        fill={bgColor}
        stroke={borderColor}
        strokeWidth={selected ? 2 : 1.5}
        cornerRadius={6}
        shadowColor={color}
        shadowBlur={selected || highlighted ? 10 : 0}
        shadowOpacity={0.6}
      />
      <Text
        x={-hs}
        y={-hs}
        width={GATE_SIZE}
        height={GATE_SIZE}
        text={symbol}
        fontSize={symbol.length > 1 ? 13 : 16}
        fontStyle="bold"
        fontFamily="monospace"
        fill="#ffffff"
        align="center"
        verticalAlign="middle"
      />
    </Group>
  );
}

interface CnotShapeProps {
  controlX: number;
  controlY: number;
  targetX: number;
  targetY: number;
  color: string;
  selected: boolean;
  highlighted: boolean;
  onClick: () => void;
  onRemove: () => void;
}

function CnotShape({
  controlX,
  controlY,
  targetX,
  targetY,
  color,
  selected,
  highlighted,
  onClick,
  onRemove,
}: CnotShapeProps) {
  const shadowBlur  = selected || highlighted ? 10 : 0;
  const strokeColor = selected ? '#fff' : highlighted ? color : color + 'cc';

  return (
    <Group
      onClick={onClick}
      onTap={onClick}
      onContextMenu={(event) => {
        event.evt.preventDefault();
        onRemove();
      }}
    >
      {/* Vertical connector line */}
      <Line
        points={[controlX, controlY, targetX, targetY]}
        stroke={strokeColor}
        strokeWidth={2}
        shadowColor={color}
        shadowBlur={shadowBlur}
        shadowOpacity={0.7}
      />
      {/* Control dot */}
      <Circle
        x={controlX}
        y={controlY}
        radius={7}
        fill={color}
        shadowColor={color}
        shadowBlur={shadowBlur}
        shadowOpacity={0.8}
      />
      {/* Target ⊕ circle */}
      <Circle
        x={targetX}
        y={targetY}
        radius={14}
        fill={color + '22'}
        stroke={strokeColor}
        strokeWidth={2}
        shadowColor={color}
        shadowBlur={shadowBlur}
        shadowOpacity={0.7}
      />
      <Line points={[targetX - 14, targetY, targetX + 14, targetY]} stroke={strokeColor} strokeWidth={2} />
      <Line points={[targetX, targetY - 14, targetX, targetY + 14]} stroke={strokeColor} strokeWidth={2} />
    </Group>
  );
}

interface SwapShapeProps {
  q0x: number; q0y: number;
  q1x: number; q1y: number;
  color: string;
  selected: boolean;
  highlighted: boolean;
  onClick: () => void;
  onRemove: () => void;
}

function SwapShape({
  q0x,
  q0y,
  q1x,
  q1y,
  color,
  selected,
  highlighted,
  onClick,
  onRemove,
}: SwapShapeProps) {
  const r           = 10;
  const shadowBlur  = selected || highlighted ? 10 : 0;
  const strokeColor = selected ? '#fff' : highlighted ? color : color + 'cc';

  function cross(cx: number, cy: number) {
    return (
      <Group>
        <Line points={[cx - r, cy - r, cx + r, cy + r]} stroke={strokeColor} strokeWidth={2.5} shadowColor={color} shadowBlur={shadowBlur} shadowOpacity={0.7} />
        <Line points={[cx + r, cy - r, cx - r, cy + r]} stroke={strokeColor} strokeWidth={2.5} shadowColor={color} shadowBlur={shadowBlur} shadowOpacity={0.7} />
      </Group>
    );
  }

  return (
    <Group
      onClick={onClick}
      onTap={onClick}
      onContextMenu={(event) => {
        event.evt.preventDefault();
        onRemove();
      }}
    >
      <Line points={[q0x, q0y, q1x, q1y]} stroke={strokeColor} strokeWidth={2} shadowColor={color} shadowBlur={shadowBlur} shadowOpacity={0.6} />
      {cross(q0x, q0y)}
      {cross(q1x, q1y)}
    </Group>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

let _gateCounter = 0;
function newGateId() {
  try { return crypto.randomUUID(); } catch { return `gate-${++_gateCounter}`; }
}

export default function CircuitCanvas({
  circuit,
  onCircuitChange,
  currentStep,
  numQubits,
  disabled = false,
  animationEnabled = false,
  targetStep = -1,
  executionSteps = [],
  speed = 1,
  onStepAnimationComplete,
}: CircuitCanvasProps) {
  const containerRef   = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activatingColumn, setActivatingColumn] = useState<number>(-1);

  // For 2-qubit gate placement: track the first click
  const [pendingGate, setPendingGate] = useState<{
    gateId: string;
    controlQubit: number;
    column: number;
  } | null>(null);

  // Drop highlight cell
  const [dropHighlight, setDropHighlight] = useState<{ col: number; qubit: number } | null>(null);

  // Resize observer
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      setDimensions({ width: rect.width, height: rect.height });
    };

    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver((entries) => {
        const { width, height } = entries[0].contentRect;
        setDimensions({ width, height });
      });
      ro.observe(el);
      return () => ro.disconnect();
    }

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Keyboard: delete selected gate
  useEffect(() => {
    if (disabled) return;

    function onKey(e: KeyboardEvent) {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        onCircuitChange({
          ...circuit,
          gates: circuit.gates.filter(g => g.id !== selectedId),
        });
        setSelectedId(null);
      }
      if (e.key === 'Escape') {
        setSelectedId(null);
        setPendingGate(null);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [disabled, selectedId, circuit, onCircuitChange]);

  // ---------------------------------------------------------------------------
  // Drag-and-drop from palette onto canvas div
  // ---------------------------------------------------------------------------

  function getCanvasPos(e: React.DragEvent) {
    const rect = containerRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (disabled) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    const pos  = getCanvasPos(e);
    const cell = snapToGrid(pos.x, pos.y, numQubits);
    setDropHighlight(cell);
  }, [disabled, numQubits]);

  const handleDragLeave = useCallback(() => {
    setDropHighlight(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    if (disabled) return;
    e.preventDefault();
    setDropHighlight(null);

    const raw = e.dataTransfer.getData('application/quantum-gate');
    if (!raw) return;

    const pos  = getCanvasPos(e);
    const cell = snapToGrid(pos.x, pos.y, numQubits);
    if (!cell) return;

    const gateDef = JSON.parse(raw) as {
      gateId?: string;
      symbol: string;
      numQubits: number;
    };
    const gateId = normalizeGateId(gateDef.gateId ?? gateDef.symbol);

    if (gateDef.numQubits === 1) {
      const newGate: CircuitGate = {
        id: newGateId(),
        gateId,
        targetQubits: [cell.qubit],
        column: cell.col,
      };
      if (!canPlaceGate(circuit, newGate)) return;
      onCircuitChange({ ...circuit, gates: [...circuit.gates, newGate] });
    } else {
      setPendingGate({ gateId, controlQubit: cell.qubit, column: cell.col });
    }
  }, [circuit, disabled, numQubits, onCircuitChange]);

  // ---------------------------------------------------------------------------
  // Canvas click for 2-qubit gate second placement
  // ---------------------------------------------------------------------------

  function handleStageClick(e: Konva.KonvaEventObject<MouseEvent>) {
    if (disabled) return;
    if (!pendingGate) return;
    const stage = e.target.getStage();
    if (!stage) return;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const cell = snapToGrid(pointer.x, pointer.y, numQubits);
    if (!cell) { setPendingGate(null); return; }
    if (cell.qubit === pendingGate.controlQubit) return; // same wire — ignore

    const newGate: CircuitGate = {
      id: newGateId(),
      gateId: pendingGate.gateId,
      targetQubits: [pendingGate.controlQubit, cell.qubit],
      column: pendingGate.column,
    };
    if (!canPlaceGate(circuit, newGate)) {
      setPendingGate(null);
      return;
    }
    onCircuitChange({ ...circuit, gates: [...circuit.gates, newGate] });
    setPendingGate(null);
  }

  // ---------------------------------------------------------------------------
  // Derived layout values
  // ---------------------------------------------------------------------------

  const canvasHeight = Math.max(dimensions.height, TOP_PADDING * 2 + numQubits * ROW_HEIGHT);
  const totalCols    = MAX_COLS;
  const canvasWidth  = Math.max(dimensions.width, WIRE_START_X + totalCols * COL_WIDTH + 40);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div
      ref={containerRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        flex: 1,
        background: '#0d1117',
        overflow: 'auto',
        position: 'relative',
        cursor: disabled ? 'not-allowed' : pendingGate ? 'crosshair' : 'default',
        opacity: disabled ? 0.7 : 1,
      }}
    >
      {/* Pending gate hint */}
      {pendingGate && (
        <div style={{
          position: 'absolute',
          top: 8,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          background: '#1e2a3a',
          border: `1px solid ${gateColor(pendingGate.gateId)}`,
          color: '#c8d8e8',
          fontSize: '12px',
          padding: '5px 14px',
          borderRadius: '20px',
          pointerEvents: 'none',
        }}>
          Click a second wire to place the {gateDisplaySymbol(pendingGate.gateId)} target - press Esc to cancel
        </div>
      )}

      <Stage
        width={canvasWidth}
        height={canvasHeight}
        onClick={handleStageClick}
      >
        <Layer>
          {/* ---- Background ---- */}
          <Rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill="#0d1117" />

          {/* ---- Grid vertical lines ---- */}
          {Array.from({ length: totalCols }, (_, ci) => {
            const x = colX(ci);
            return (
              <Line
                key={`grid-v-${ci}`}
                points={[x, 10, x, canvasHeight - 10]}
                stroke="#1e2a3a"
                strokeWidth={1}
                dash={[4, 6]}
              />
            );
          })}

          {/* ---- Column highlights (playback) ---- */}
          {currentStep >= 0 && circuit.gates.some(g => g.column === currentStep) && (
            <Rect
              x={colX(currentStep) - COL_WIDTH / 2}
              y={0}
              width={COL_WIDTH}
              height={canvasHeight}
              fill="#3a7bd520"
              cornerRadius={0}
            />
          )}

          {/* ---- Drop highlight ---- */}
          {dropHighlight && (
            <Rect
              x={colX(dropHighlight.col) - COL_WIDTH / 2 + 4}
              y={wireY(dropHighlight.qubit) - ROW_HEIGHT / 2 + 4}
              width={COL_WIDTH - 8}
              height={ROW_HEIGHT - 8}
              fill="#3a7bd510"
              stroke="#3a7bd5"
              strokeWidth={1.5}
              dash={[4, 4]}
              cornerRadius={6}
            />
          )}

          {/* ---- Pending gate control marker ---- */}
          {pendingGate && (
            <Circle
              x={colX(pendingGate.column)}
              y={wireY(pendingGate.controlQubit)}
              radius={8}
              fill={gateColor(pendingGate.gateId)}
              opacity={0.8}
              shadowColor={gateColor(pendingGate.gateId)}
              shadowBlur={12}
              shadowOpacity={0.8}
            />
          )}

          {/* ---- Qubit wires ---- */}
          {Array.from({ length: numQubits }, (_, qi) => {
            const y = wireY(qi);
            return (
              <React.Fragment key={`wire-${qi}`}>
                {/* Wire label */}
                <Text
                  x={4}
                  y={y - 10}
                  text={`|0⟩`}
                  fontSize={13}
                  fontFamily="monospace"
                  fill="#607090"
                  width={WIRE_START_X - 8}
                  align="right"
                />
                {/* Qubit index */}
                <Text
                  x={4}
                  y={y + 4}
                  text={`q${qi}`}
                  fontSize={9}
                  fontFamily="monospace"
                  fill="#3a5070"
                  width={WIRE_START_X - 8}
                  align="right"
                />
                {/* Wire line */}
                <Line
                  points={[WIRE_START_X, y, canvasWidth - 10, y]}
                  stroke="#3a7bd5"
                  strokeWidth={1.5}
                  opacity={0.4}
                  shadowColor="#3a7bd5"
                  shadowBlur={6}
                  shadowOpacity={0.3}
                />
              </React.Fragment>
            );
          })}

          {/* ---- Placed gates ---- */}
          {circuit.gates.map(gate => {
            const normalizedGateId = normalizeGateId(gate.gateId);
            const selected     = selectedId === gate.id;
            const highlighted  = gate.column === currentStep || gate.column === activatingColumn;
            const color        = gateColor(normalizedGateId);
            const numQ         = gateNumQubits(normalizedGateId);
            const x            = colX(gate.column);
            const removeGate   = () =>
              onCircuitChange({
                ...circuit,
                gates: circuit.gates.filter((g) => g.id !== gate.id),
              });

            if (numQ === 1) {
              const qubit = gate.targetQubits[0];
              return (
                <SingleGateShape
                  key={gate.id}
                  x={x}
                  y={wireY(qubit)}
                  symbol={gateDisplaySymbol(normalizedGateId)}
                  color={color}
                  selected={selected}
                  highlighted={highlighted}
                  onClick={() => {
                    if (!pendingGate && !disabled) {
                      setSelectedId(prev => prev === gate.id ? null : gate.id);
                    }
                  }}
                  onRemove={() => {
                    if (!disabled) removeGate();
                  }}
                />
              );
            }

            if (normalizedGateId === 'CNOT' && gate.targetQubits.length === 2) {
              const [ctrl, tgt] = gate.targetQubits;
              return (
                <CnotShape
                  key={gate.id}
                  controlX={x}
                  controlY={wireY(ctrl)}
                  targetX={x}
                  targetY={wireY(tgt)}
                  color={color}
                  selected={selected}
                  highlighted={highlighted}
                  onClick={() => {
                    if (!pendingGate && !disabled) {
                      setSelectedId(prev => prev === gate.id ? null : gate.id);
                    }
                  }}
                  onRemove={() => {
                    if (!disabled) removeGate();
                  }}
                />
              );
            }

            if (normalizedGateId === 'SWAP' && gate.targetQubits.length === 2) {
              const [q0, q1] = gate.targetQubits;
              return (
                <SwapShape
                  key={gate.id}
                  q0x={x} q0y={wireY(q0)}
                  q1x={x} q1y={wireY(q1)}
                  color={color}
                  selected={selected}
                  highlighted={highlighted}
                  onClick={() => {
                    if (!pendingGate && !disabled) {
                      setSelectedId(prev => prev === gate.id ? null : gate.id);
                    }
                  }}
                  onRemove={() => {
                    if (!disabled) removeGate();
                  }}
                />
              );
            }

            // Generic multi-qubit fallback
            return gate.targetQubits.map((q, idx) => (
              <SingleGateShape
                key={`${gate.id}-${idx}`}
                x={x}
                y={wireY(q)}
                symbol={gateDisplaySymbol(normalizedGateId)}
                color={color}
                selected={selected}
                highlighted={highlighted}
                onClick={() => {
                  if (!pendingGate && !disabled) {
                    setSelectedId(prev => prev === gate.id ? null : gate.id);
                  }
                }}
                onRemove={() => {
                  if (!disabled) removeGate();
                }}
              />
            ));
          })}

          {/* ---- Column index labels at top ---- */}
          {Array.from({ length: totalCols }, (_, ci) => (
            <Text
              key={`col-label-${ci}`}
              x={colX(ci) - COL_WIDTH / 2}
              y={12}
              width={COL_WIDTH}
              text={String(ci)}
              fontSize={9}
              fontFamily="monospace"
              fill="#2a3a50"
              align="center"
            />
          ))}
        </Layer>
        <FlowAnimation
          numQubits={numQubits}
          enabled={animationEnabled}
          targetStep={targetStep}
          executionSteps={executionSteps}
          speed={speed}
          onStepAnimationComplete={onStepAnimationComplete}
          onGatePulseStart={(col) => {
            setActivatingColumn(col);
            setTimeout(() => setActivatingColumn(-1), (300 / speed));
          }}
        />
      </Stage>

      {/* Selection hint */}
      {selectedId && !pendingGate && (
        <div style={{
          position: 'absolute',
          bottom: 10,
          right: 14,
          fontSize: '11px',
          color: '#4a6080',
          pointerEvents: 'none',
        }}>
          Press Delete / Backspace to remove selected gate
        </div>
      )}
    </div>
  );
}
