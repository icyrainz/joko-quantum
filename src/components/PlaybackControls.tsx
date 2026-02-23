interface PlaybackControlsProps {
  isPlaying: boolean;
  currentStep: number;
  totalSteps: number;
  speed: number;
  onStep: () => void;
  onStepBack: () => void;
  onPlayPause: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
}

const BTN_BASE: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontFamily: 'inherit',
  fontWeight: 600,
  transition: 'background 0.15s, box-shadow 0.15s',
  outline: 'none',
};

function IconBtn({
  label,
  emoji,
  onClick,
  accent,
  size = 'md',
  disabled,
}: {
  label: string;
  emoji: string;
  onClick: () => void;
  accent?: boolean;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}) {
  const dim  = size === 'lg' ? 44 : size === 'md' ? 38 : 32;
  const fs   = size === 'lg' ? 20 : size === 'md' ? 17 : 14;
  const bg   = accent
    ? 'linear-gradient(135deg, #1a6adc 0%, #0f4ba0 100%)'
    : '#1a2540';
  const shadow = accent ? '0 0 14px #3a7bd560' : 'none';

  return (
    <button
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...BTN_BASE,
        width: dim,
        height: dim,
        fontSize: fs,
        background: disabled ? '#111820' : bg,
        color: disabled ? '#2a3a50' : '#e0e8f0',
        boxShadow: disabled ? 'none' : shadow,
        border: accent ? '1px solid #3a7bd570' : '1px solid #1e2a3a',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {emoji}
    </button>
  );
}

export default function PlaybackControls({
  isPlaying,
  currentStep,
  totalSteps,
  speed,
  onStep,
  onStepBack,
  onPlayPause,
  onReset,
  onSpeedChange,
}: PlaybackControlsProps) {
  const displayStep  = currentStep < 0 ? 0 : currentStep + 1;
  const displayTotal = totalSteps;
  const atStart      = currentStep <= -1;
  const atEnd        = totalSteps > 0 && currentStep >= totalSteps - 1;

  return (
    <div
      style={{
        height: '60px',
        background: '#16213e',
        borderTop: '1px solid #1e2a3a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        padding: '0 24px',
        flexShrink: 0,
        position: 'relative',
      }}
    >
      {/* Left: step counter */}
      <div style={{
        position: 'absolute',
        left: '20px',
        fontSize: '12px',
        fontFamily: 'monospace',
        color: '#4a6080',
        minWidth: '80px',
      }}>
        {totalSteps > 0
          ? `Step ${displayStep} / ${displayTotal}`
          : 'No steps'}
      </div>

      {/* Centre: transport controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <IconBtn label="Reset" emoji="⏹" onClick={onReset} disabled={atStart && !isPlaying} />
        <IconBtn label="Step back" emoji="⏮" onClick={onStepBack} disabled={atStart} />
        <IconBtn
          label={isPlaying ? 'Pause' : 'Play'}
          emoji={isPlaying ? '⏸' : '▶'}
          onClick={onPlayPause}
          accent={!isPlaying}
          size="lg"
          disabled={totalSteps === 0}
        />
        <IconBtn label="Step forward" emoji="⏭" onClick={onStep} disabled={atEnd} />
      </div>

      {/* Right: speed control */}
      <div style={{
        position: 'absolute',
        right: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        <span style={{ fontSize: '11px', color: '#3a5070', whiteSpace: 'nowrap' }}>
          Speed
        </span>
        <input
          type="range"
          min={0.5}
          max={3}
          step={0.25}
          value={speed}
          onChange={e => onSpeedChange(Number(e.target.value))}
          style={{ width: '90px', accentColor: '#3a7bd5' }}
        />
        <span style={{
          fontSize: '12px',
          fontFamily: 'monospace',
          color: '#5a7fa0',
          width: '32px',
          textAlign: 'right',
        }}>
          {speed.toFixed(2)}x
        </span>
      </div>
    </div>
  );
}
