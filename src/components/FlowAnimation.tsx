import { Layer, Circle, Group } from 'react-konva';

// Layout constants — must match CircuitCanvas exactly
const WIRE_START_X = 60;
const ROW_HEIGHT   = 80;
const TOP_PADDING  = 50;

function wireY(qubit: number) {
  return TOP_PADDING + qubit * ROW_HEIGHT;
}

interface FlowAnimationProps {
  numQubits: number;
  enabled: boolean;
}

export default function FlowAnimation({ numQubits, enabled }: FlowAnimationProps) {
  if (!enabled) return null;

  return (
    <Layer>
      {Array.from({ length: numQubits }, (_, qi) => {
        const x = WIRE_START_X;
        const y = wireY(qi);

        return (
          <Group key={`particle-${qi}`}>
            {/* Glow circle */}
            <Circle
              x={x}
              y={y}
              radius={14}
              fill="#3a7bd5"
              opacity={0.15}
            />
            {/* Core circle */}
            <Circle
              x={x}
              y={y}
              radius={6}
              fill="#3a7bd5"
              opacity={0.7}
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
