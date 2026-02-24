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
  borderRadius: '10px',
  cursor: 'pointer',
  fontFamily: 'inherit',
  fontWeight: 600,
  transition: 'background 0.15s, box-shadow 0.2s, transform 0.1s',
  outline: 'none',
};

/* Inline SVG icons */
function StopIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="6" width="12" height="12" rx="1.5" />
    </svg>
  );
}

function SkipBackIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <rect x="5" y="5" width="2.5" height="14" rx="0.75" />
      <path d="M19 5.5v13a1 1 0 0 1-1.54.84l-9.5-6.5a1 1 0 0 1 0-1.68l9.5-6.5A1 1 0 0 1 19 5.5z" />
    </svg>
  );
}

function PlayIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5.5v13a1 1 0 0 0 1.54.84l10-6.5a1 1 0 0 0 0-1.68l-10-6.5A1 1 0 0 0 8 5.5z" />
    </svg>
  );
}

function PauseIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  );
}

function SkipForwardIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <rect x="16.5" y="5" width="2.5" height="14" rx="0.75" />
      <path d="M5 5.5v13a1 1 0 0 0 1.54.84l9.5-6.5a1 1 0 0 0 0-1.68l-9.5-6.5A1 1 0 0 0 5 5.5z" />
    </svg>
  );
}

function IconBtn({
  label,
  icon,
  onClick,
  accent,
  size = 'md',
  disabled,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  accent?: boolean;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}) {
  const dim  = size === 'lg' ? 44 : size === 'md' ? 36 : 30;
  const bg   = accent
    ? 'linear-gradient(135deg, #2070d8 0%, #1558b8 100%)'
    : '#1a2540';
  const shadow = accent ? '0 0 16px #3a7bd550, 0 2px 8px #00000030' : 'none';

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
        background: disabled ? '#111820' : bg,
        color: disabled ? '#2a3a50' : '#e0e8f0',
        boxShadow: disabled ? 'none' : shadow,
        border: accent ? '1px solid #3a7bd560' : '1px solid #1e2a3a',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {icon}
    </button>
  );
}

function ProgressTimeline({ currentStep, totalSteps, isPlaying }: { currentStep: number; totalSteps: number; isPlaying: boolean }) {
  if (totalSteps === 0) return null;

  const progress = totalSteps > 0 ? Math.max(0, (currentStep + 1) / totalSteps) * 100 : 0;

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '2px',
      background: '#1e2a3a',
      overflow: 'hidden',
    }}>
      <div style={{
        height: '100%',
        width: `${progress}%`,
        background: isPlaying
          ? 'linear-gradient(90deg, #3a7bd5, #4FC3F7)'
          : '#3a7bd5',
        borderRadius: '0 1px 1px 0',
        transition: 'width 0.3s ease',
        boxShadow: progress > 0 ? '0 0 8px #4FC3F740' : 'none',
      }} />
      {/* Step markers */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '100%',
        display: 'flex',
      }}>
        {Array.from({ length: totalSteps }, (_, i) => (
          <div key={i} style={{
            flex: 1,
            borderRight: i < totalSteps - 1 ? '1px solid #0d111740' : 'none',
          }} />
        ))}
      </div>
    </div>
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
        height: '58px',
        background: 'linear-gradient(180deg, #182840 0%, #16213e 100%)',
        borderTop: '1px solid #1e2a3a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '0 24px',
        flexShrink: 0,
        position: 'relative',
        animation: 'slideInUp 0.4s ease-out',
      }}
    >
      <ProgressTimeline currentStep={currentStep} totalSteps={totalSteps} isPlaying={isPlaying} />

      {/* Left: step counter */}
      <div style={{
        position: 'absolute',
        left: '20px',
        fontSize: '11px',
        fontFamily: 'var(--qf-font-mono)',
        fontWeight: 500,
        color: '#3a5a78',
        minWidth: '80px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}>
        {totalSteps > 0 ? (
          <>
            <span style={{ color: '#5a8ab0' }}>{displayStep}</span>
            <span style={{ color: '#2a3a50' }}>/</span>
            <span>{displayTotal}</span>
          </>
        ) : (
          <span style={{ color: '#2a3a50', fontStyle: 'italic' }}>No steps</span>
        )}
      </div>

      {/* Centre: transport controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <IconBtn label="Reset" icon={<StopIcon size={16} />} onClick={onReset} disabled={atStart && !isPlaying} size="sm" />
        <IconBtn label="Step back" icon={<SkipBackIcon size={16} />} onClick={onStepBack} disabled={atStart} size="sm" />
        <IconBtn
          label={isPlaying ? 'Pause' : 'Play'}
          icon={isPlaying ? <PauseIcon size={22} /> : <PlayIcon size={22} />}
          onClick={onPlayPause}
          accent={!isPlaying}
          size="lg"
          disabled={totalSteps === 0}
        />
        <IconBtn label="Step forward" icon={<SkipForwardIcon size={16} />} onClick={onStep} disabled={atEnd} size="sm" />
      </div>

      {/* Right: speed control */}
      <div style={{
        position: 'absolute',
        right: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        <span style={{ fontSize: '10px', color: '#2a4060', fontWeight: 500, whiteSpace: 'nowrap', fontFamily: 'var(--qf-font-mono)' }}>
          SPEED
        </span>
        <input
          type="range"
          min={0.5}
          max={3}
          step={0.25}
          value={speed}
          onChange={e => onSpeedChange(Number(e.target.value))}
          style={{ width: '80px', accentColor: '#3a7bd5' }}
        />
        <span style={{
          fontSize: '11px',
          fontFamily: 'var(--qf-font-mono)',
          fontWeight: 600,
          color: '#4a7090',
          width: '36px',
          textAlign: 'right',
        }}>
          {speed.toFixed(2)}x
        </span>
      </div>
    </div>
  );
}
