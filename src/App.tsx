import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import GatePalette from './components/GatePalette';
import CircuitCanvas from './components/CircuitCanvas';
import StateInspector from './components/StateInspector';
import PlaybackControls from './components/PlaybackControls';
import TutorialPanel from './components/TutorialPanel';
import { executeCircuit } from './engine';
import { DEFAULT_LESSON, DEFAULT_LESSON_ID, LESSON_CATALOG, loadLessonById } from './lessons';
import type { Lesson, LessonStep } from './lessons';
import type { Circuit, CircuitGate, Complex } from './types';
import './App.css';

const LESSON_PROGRESS_KEY = 'qf.lessonProgress.v1';
const CIRCUIT_KEY = 'qf.circuit.v1';
const LESSON_COMPLETE_MARKER = 10_000;
const MAX_PERSISTED_GATES = 128;
const MAX_GATE_COLUMN = 64;

function newGateId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `gate-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
}

function normalizeGateId(gateId: string): string {
  if (gateId === 'CX') return 'CNOT';
  if (gateId === 'SW') return 'SWAP';
  return gateId;
}

function clampQubitCount(n: number): number {
  return Math.max(1, Math.min(3, n));
}

function sanitizeCircuit(circuit: Circuit): Circuit {
  const numQubits = clampQubitCount(circuit.numQubits);

  const gates = circuit.gates
    .map((gate) => ({
      ...gate,
      gateId: normalizeGateId(gate.gateId),
      targetQubits: gate.targetQubits.filter((q) => q >= 0 && q < numQubits),
      column: Math.max(0, Math.min(MAX_GATE_COLUMN, Math.floor(gate.column))),
    }))
    .filter((gate) => gate.targetQubits.length > 0);

  return { numQubits, gates: gates.slice(0, MAX_PERSISTED_GATES) };
}

function loadSavedCircuit(): Circuit {
  if (typeof window === 'undefined') {
    return { numQubits: 2, gates: [] };
  }

  try {
    const raw = window.localStorage.getItem(CIRCUIT_KEY);
    if (!raw) return { numQubits: 2, gates: [] };
    const parsed = JSON.parse(raw) as Circuit;
    if (!parsed || typeof parsed !== 'object') return { numQubits: 2, gates: [] };
    if (!Array.isArray(parsed.gates)) return { numQubits: 2, gates: [] };

    // Safety cap: guard against corrupted localStorage exploding startup work.
    const rawGates = parsed.gates.slice(0, MAX_PERSISTED_GATES);

    const gates: CircuitGate[] = rawGates.map((gate) => ({
      id: gate.id ?? newGateId(),
      gateId: normalizeGateId(gate.gateId),
      targetQubits: Array.isArray(gate.targetQubits) ? gate.targetQubits : [],
      column: Number.isFinite(gate.column) ? gate.column : 0,
    }));

    return sanitizeCircuit({
      numQubits: Number.isFinite(parsed.numQubits) ? parsed.numQubits : 2,
      gates,
    });
  } catch {
    return { numQubits: 2, gates: [] };
  }
}

function loadLessonProgress(): Record<string, number> {
  if (typeof window === 'undefined') return {};

  try {
    const raw = window.localStorage.getItem(LESSON_PROGRESS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, number>;
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed;
  } catch {
    return {};
  }
}

function groundState(numQubits: number): Complex[] {
  const dim = 2 ** numQubits;
  return Array.from({ length: dim }, (_, i) =>
    i === 0 ? { re: 1, im: 0 } : { re: 0, im: 0 },
  );
}

export default function App() {
  const [circuit, setCircuit] = useState<Circuit>(() => loadSavedCircuit());
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [targetStep, setTargetStep] = useState<number>(-1); // what animation is heading towards
  const [displayStep, setDisplayStep] = useState<number>(-1); // what StateInspector shows
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);

  const [currentLessonId, setCurrentLessonId] = useState<string | null>(DEFAULT_LESSON_ID);
  const [loadedLessons, setLoadedLessons] = useState<Record<string, Lesson>>({
    [DEFAULT_LESSON_ID]: DEFAULT_LESSON,
  });
  const [currentLessonStepIndex, setCurrentLessonStepIndex] = useState<number>(0);
  const [isTutorialCollapsed, setIsTutorialCollapsed] = useState<boolean>(false);
  const [lessonProgress, setLessonProgress] = useState<Record<string, number>>(
    () => loadLessonProgress(),
  );
  const [lessonLoadStatus, setLessonLoadStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [lessonLoadError, setLessonLoadError] = useState<string | null>(null);
  const [lessonLoadNonce, setLessonLoadNonce] = useState<number>(0);

  const [executionNonce, setExecutionNonce] = useState<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const numQubits = circuit.numQubits;

  const engineCircuit = useMemo(
    () => ({
      numQubits: circuit.numQubits,
      gates: circuit.gates.map(({ gateId, targetQubits, column }) => ({
        gateId: normalizeGateId(gateId),
        targetQubits: [...targetQubits],
        column,
      })),
    }),
    [circuit],
  );

  const hasMeasurement = engineCircuit.gates.some(g => g.gateId === 'M');

  const executionSteps = useMemo(
    () => executeCircuit(engineCircuit),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [engineCircuit, hasMeasurement ? executionNonce : 0],
  );

  const currentLesson: Lesson | null = currentLessonId
    ? loadedLessons[currentLessonId] ?? null
    : null;
  const currentLessonStep: LessonStep | null = currentLesson?.steps[currentLessonStepIndex] ?? null;

  useEffect(() => {
    try {
      window.localStorage.setItem(CIRCUIT_KEY, JSON.stringify(circuit));
    } catch {
      // Ignore storage write failures (private mode / blocked storage).
    }
  }, [circuit]);

  useEffect(() => {
    try {
      window.localStorage.setItem(LESSON_PROGRESS_KEY, JSON.stringify(lessonProgress));
    } catch {
      // Ignore storage write failures (private mode / blocked storage).
    }
  }, [lessonProgress]);

  const stopInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const stopPlayback = useCallback(
    (resetStep: boolean) => {
      setIsPlaying(false);
      stopInterval();
      if (resetStep) {
        setCurrentStep(-1);
        setTargetStep(-1);
        setDisplayStep(-1);
      }
    },
    [stopInterval],
  );

  const updateCircuit = useCallback(
    (update: Circuit | ((prev: Circuit) => Circuit)) => {
      stopPlayback(true);
      setCircuit((prev) => {
        const next = typeof update === 'function' ? update(prev) : update;
        return sanitizeCircuit(next);
      });
    },
    [stopPlayback],
  );

  const applyStepPreset = useCallback(
    (step: LessonStep | null) => {
      if (!step?.circuitPreset) return;
      const preset = step.circuitPreset;

      updateCircuit({
        numQubits: preset.numQubits,
        gates: preset.gates.map((gate) => ({
          id: newGateId(),
          gateId: normalizeGateId(gate.gateId),
          targetQubits: [...gate.targetQubits],
          column: gate.column,
        })),
      });
    },
    [updateCircuit],
  );

  useEffect(() => {
    let disposed = false;

    if (!currentLessonId) return () => { disposed = true; };

    if (loadedLessons[currentLessonId]) return () => { disposed = true; };

    loadLessonById(currentLessonId)
      .then((lesson) => {
        if (disposed) return;
        if (!lesson) {
          setLessonLoadStatus('error');
          setLessonLoadError('Lesson could not be loaded.');
          return;
        }
        setLoadedLessons((prev) => ({ ...prev, [lesson.id]: lesson }));
        setCurrentLessonStepIndex((prev) => {
          if (lesson.steps.length === 0) return 0;
          return Math.min(prev, lesson.steps.length - 1);
        });
        const initialStep = Math.min(currentLessonStepIndex, Math.max(0, lesson.steps.length - 1));
        applyStepPreset(lesson.steps[initialStep] ?? null);
        setLessonLoadStatus('idle');
      })
      .catch(() => {
        if (disposed) return;
        setLessonLoadStatus('error');
        setLessonLoadError('Failed to load lesson. Please retry.');
      });

    return () => {
      disposed = true;
    };
  }, [applyStepPreset, currentLessonId, currentLessonStepIndex, lessonLoadNonce, loadedLessons]);

  // Animation-driven playback: when a step animation completes, advance to next
  const handleStepAnimationComplete = useCallback(() => {
    setDisplayStep(targetStep); // sync inspector to completed step
    setCurrentStep(targetStep);

    if (!isPlaying) return;

    // Advance to next step
    setTargetStep((prev) => {
      const next = prev + 1;
      if (next >= executionSteps.length) {
        setIsPlaying(false);
        stopInterval();
        return prev; // stay at last step
      }
      return next;
    });
  }, [isPlaying, targetStep, executionSteps.length, stopInterval]);

  const displayState: Complex[] = (() => {
    if (executionSteps.length === 0) return groundState(numQubits);
    if (displayStep < 0) return executionSteps[0]?.stateBefore ?? groundState(numQubits);
    const step = executionSteps[displayStep];
    return step ? step.stateAfter : groundState(numQubits);
  })();

  const displayMeasurementResults = (() => {
    if (displayStep < 0 || displayStep >= executionSteps.length) return undefined;
    return executionSteps[displayStep]?.measurementResults;
  })();

  const canAdvanceTutorialStep = useMemo(() => {
    if (!currentLessonStep?.action) return true;

    const action = currentLessonStep.action;
    switch (action.type) {
      case 'read':
      case 'observe':
        return true;
      case 'place-gate': {
        const expectedGateId = normalizeGateId(action.gateId ?? '');
        return circuit.gates.some((gate) => {
          if (normalizeGateId(gate.gateId) !== expectedGateId) return false;
          if (action.column !== undefined && gate.column !== action.column) return false;
          if (
            action.targetQubit !== undefined &&
            !gate.targetQubits.includes(action.targetQubit)
          ) {
            return false;
          }
          return true;
        });
      }
      case 'click-step':
        return currentStep >= 0;
      case 'click-play':
        return isPlaying || currentStep >= 0;
      case 'click-reset':
        return currentStep === -1;
      default:
        return true;
    }
  }, [circuit.gates, currentLessonStep, currentStep, isPlaying]);

  const markLessonProgress = useCallback((lessonId: string, stepIndex: number) => {
    setLessonProgress((prev) => ({
      ...prev,
      [lessonId]: Math.max(
        prev[lessonId] ?? 0,
        Math.min(stepIndex, LESSON_COMPLETE_MARKER - 1),
      ),
    }));
  }, []);

  const handleLessonSelect = useCallback(
    (lessonId: string) => {
      setCurrentLessonId(lessonId);
      setCurrentLessonStepIndex(0);
      setLessonLoadError(null);
      const loadedLesson = loadedLessons[lessonId];
      if (loadedLesson) {
        setLessonLoadStatus('idle');
        applyStepPreset(loadedLesson.steps[0] ?? null);
      } else {
        setLessonLoadStatus('loading');
      }
    },
    [applyStepPreset, loadedLessons],
  );

  const handleLessonStepComplete = useCallback(() => {
    if (!currentLesson || !canAdvanceTutorialStep) return;

    const nextStepIndex = currentLessonStepIndex + 1;
    markLessonProgress(currentLesson.id, nextStepIndex);

    if (nextStepIndex >= currentLesson.steps.length) {
      setLessonProgress((prev) => ({
        ...prev,
        [currentLesson.id]: LESSON_COMPLETE_MARKER,
      }));
      setLessonLoadStatus('idle');
      setLessonLoadError(null);
      setCurrentLessonId(null);
      setCurrentLessonStepIndex(0);
      return;
    }

    setCurrentLessonStepIndex(nextStepIndex);
    applyStepPreset(currentLesson.steps[nextStepIndex] ?? null);
  }, [
    applyStepPreset,
    canAdvanceTutorialStep,
    currentLesson,
    currentLessonStepIndex,
    markLessonProgress,
  ]);

  const handleLessonStepBack = useCallback(() => {
    if (!currentLesson || currentLessonStepIndex <= 0) return;

    const previousStepIndex = currentLessonStepIndex - 1;
    setCurrentLessonStepIndex(previousStepIndex);
    applyStepPreset(currentLesson.steps[previousStepIndex] ?? null);
  }, [applyStepPreset, currentLesson, currentLessonStepIndex]);

  function handlePlayPause() {
    if (isPlaying) {
      setIsPlaying(false);
      stopInterval();
      return;
    }

    if (executionSteps.length === 0) return;

    if (currentStep >= executionSteps.length - 1) {
      // At end — restart from beginning
      setCurrentStep(-1);
      setDisplayStep(-1);
      setTargetStep(0);
    } else {
      // Start/resume from current position
      setTargetStep(currentStep + 1);
    }
    setIsPlaying(true);
  }

  function handleStep() {
    stopInterval();
    setIsPlaying(false);
    const nextStep = Math.min(currentStep + 1, executionSteps.length - 1);
    setTargetStep(nextStep);
  }

  function handleStepBack() {
    stopInterval();
    setIsPlaying(false);
    const prevStep = Math.max(currentStep - 1, -1);
    setCurrentStep(prevStep);
    setDisplayStep(prevStep);
    setTargetStep(prevStep);
  }

  function handleReset() {
    stopPlayback(true);
    setTargetStep(-1);
    setDisplayStep(-1);
    if (hasMeasurement) {
      setExecutionNonce(n => n + 1);
    }
  }

  function handleQubitCountChange(nextNumQubits: number) {
    updateCircuit((prev) => ({
      ...prev,
      numQubits: nextNumQubits,
      gates: prev.gates.filter((gate) => gate.targetQubits.every((q) => q < nextNumQubits)),
    }));
  }

  const highlightColumn = (() => {
    if (currentStep < 0 || currentStep >= executionSteps.length) return -1;
    return executionSteps[currentStep].column;
  })();

  const completedLessons = LESSON_CATALOG.filter(
    (lesson) => (lessonProgress[lesson.id] ?? 0) >= LESSON_COMPLETE_MARKER,
  ).length;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100vw',
        height: '100vh',
        background: '#1a1a2e',
        color: '#e0e0e0',
        overflow: 'hidden',
      }}
    >
      <header
        style={{
          height: '54px',
          flexShrink: 0,
          background: 'linear-gradient(180deg, #122448 0%, #0f3460 100%)',
          borderBottom: '1px solid #1e3a5a',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          gap: '20px',
          boxShadow: '0 2px 20px #00000050, inset 0 -1px 0 #4FC3F710',
          animation: 'fadeIn 0.4s ease-out',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src="/logo-header.png"
            alt="JokoQuantum logo"
            width={28}
            height={28}
            style={{
              borderRadius: '6px',
              animation: 'softGlow 3s ease-in-out infinite',
            }}
          />
          <span
            style={{
              fontSize: '18px',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              background: 'linear-gradient(90deg, #ffffff 0%, #b8e0ff 40%, #4FC3F7 100%)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            JokoQuantum
          </span>
        </div>

        <div style={{ width: '1px', height: '24px', background: '#1e4a7a' }} />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13px',
            color: '#8899bb',
          }}
        >
          <span>Qubits:</span>
          {[1, 2, 3].map((n) => (
            <button
              key={n}
              onClick={() => handleQubitCountChange(n)}
              style={{
                width: '30px',
                height: '28px',
                borderRadius: '6px',
                border:
                  n === numQubits ? '1.5px solid #4FC3F7' : '1px solid #1e3a5a',
                background: n === numQubits ? '#4FC3F720' : '#1a2540',
                color: n === numQubits ? '#4FC3F7' : '#607090',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                padding: 0,
                transition: 'all 0.15s',
                boxShadow: n === numQubits ? '0 0 8px #4FC3F740' : 'none',
              }}
            >
              {n}
            </button>
          ))}
          <button
            onClick={() =>
              updateCircuit({
                numQubits,
                gates: [],
              })
            }
            disabled={circuit.gates.length === 0}
            style={{
              padding: '5px 14px',
              borderRadius: '6px',
              border: '1px solid #1e3a5a',
              background: '#1a2540',
              color: circuit.gates.length > 0 ? '#8899bb' : '#2a3a50',
              fontSize: '12px',
              fontWeight: 600,
              cursor: circuit.gates.length > 0 ? 'pointer' : 'not-allowed',
              transition: 'all 0.15s',
            }}
          >
            Clear Circuit
          </button>
        </div>

        <div style={{ width: '1px', height: '24px', background: '#1e4a7a' }} />

        <div style={{ fontSize: '12px', color: '#3a6080', fontFamily: 'var(--qf-font-mono)', fontWeight: 500, letterSpacing: '-0.02em' }}>
          <span style={{ color: '#4a7090' }}>{circuit.gates.length}</span> gate{circuit.gates.length !== 1 ? 's' : ''}
          <span style={{ color: '#2a4a60', margin: '0 6px' }}>/</span>
          <span style={{ color: '#4a7090' }}>{executionSteps.length}</span> step{executionSteps.length !== 1 ? 's' : ''}
          <span style={{ color: '#2a4a60', margin: '0 6px' }}>/</span>
          <span style={{ color: '#4a7090' }}>{completedLessons}/{LESSON_CATALOG.length}</span> lessons
        </div>

        <div style={{ flex: 1 }} />

        <a
          href="https://github.com/icyrainz/joko-quantum"
          target="_blank"
          rel="noopener noreferrer"
          title="View on GitHub"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            border: '1px solid #1e3a5a',
            background: '#1a2540',
            color: '#8899bb',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#e0f0ff'; e.currentTarget.style.borderColor = '#4FC3F7'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#8899bb'; e.currentTarget.style.borderColor = '#1e3a5a'; }}
        >
          <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
        </a>

        <a
          href="https://ko-fi.com/tueakio"
          target="_blank"
          rel="noopener noreferrer"
          title="Tip on Ko-fi"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '0 10px',
            height: '32px',
            borderRadius: '6px',
            border: '1px solid #1e3a5a',
            background: '#1a2540',
            color: '#8899bb',
            fontSize: '12px',
            fontWeight: 600,
            textDecoration: 'none',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#e0f0ff'; e.currentTarget.style.borderColor = '#4FC3F7'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#8899bb'; e.currentTarget.style.borderColor = '#1e3a5a'; }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.351 2.715c-2.7 0-4.986.025-6.83.26C2.078 3.285 0 5.154 0 8.61c0 3.506.182 6.13 1.585 8.493 1.584 2.701 4.233 4.182 7.662 4.182h.83c4.209 0 6.494-2.234 7.637-4a9.5 9.5 0 0 0 1.091-2.338C21.792 14.688 24 12.22 24 9.208v-.415c0-3.247-2.13-5.507-5.792-5.87-1.558-.156-2.65-.208-6.857-.208m0 1.947c4.208 0 5.09.052 6.571.182 2.624.311 4.13 1.584 4.13 4v.39c0 2.156-1.792 3.844-3.87 3.844h-.935l-.156.649c-.208 1.013-.597 1.818-1.039 2.546-.909 1.428-2.545 3.064-5.922 3.064h-.805c-2.571 0-4.831-.883-6.078-3.195-1.09-2-1.298-4.155-1.298-7.506 0-2.181.857-3.402 3.012-3.714 1.533-.233 3.559-.26 6.39-.26m6.547 2.287c-.416 0-.65.234-.65.546v2.935c0 .311.234.545.65.545 1.324 0 2.051-.754 2.051-2s-.727-2.026-2.052-2.026m-10.39.182c-1.818 0-3.013 1.48-3.013 3.142 0 1.533.858 2.857 1.949 3.897.727.701 1.87 1.429 2.649 1.896a1.47 1.47 0 0 0 1.507 0c.78-.467 1.922-1.195 2.623-1.896 1.117-1.039 1.974-2.364 1.974-3.897 0-1.662-1.247-3.142-3.039-3.142-1.065 0-1.792.545-2.338 1.298-.493-.753-1.246-1.298-2.312-1.298" />
          </svg>
          Tip!
        </a>
      </header>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <GatePalette disabled={isPlaying} />

        <CircuitCanvas
          circuit={circuit}
          onCircuitChange={updateCircuit}
          currentStep={highlightColumn}
          numQubits={numQubits}
          disabled={isPlaying}
          animationEnabled={true}
          targetStep={targetStep}
          executionSteps={executionSteps}
          speed={speed}
          onStepAnimationComplete={handleStepAnimationComplete}
        />

        <StateInspector
          state={displayState}
          numQubits={numQubits}
          isAnimating={isPlaying}
          measurementResults={displayMeasurementResults}
        />

        <TutorialPanel
          lessonSummaries={LESSON_CATALOG}
          currentLesson={currentLesson}
          currentStepIndex={currentLessonStepIndex}
          isLessonLoading={lessonLoadStatus === 'loading'}
          lessonLoadError={lessonLoadError}
          onRetryLessonLoad={() => {
            setLessonLoadStatus('loading');
            setLessonLoadError(null);
            setLessonLoadNonce((n) => n + 1);
          }}
          onStepComplete={handleLessonStepComplete}
          onStepBack={handleLessonStepBack}
          canAdvance={canAdvanceTutorialStep}
          onExitTutorial={() => {
            setLessonLoadStatus('idle');
            setLessonLoadError(null);
            setCurrentLessonId(null);
            setCurrentLessonStepIndex(0);
          }}
          isCollapsed={isTutorialCollapsed}
          onToggleCollapse={() => setIsTutorialCollapsed((prev) => !prev)}
          onSelectLesson={handleLessonSelect}
        />
      </div>

      <PlaybackControls
        isPlaying={isPlaying}
        currentStep={currentStep}
        totalSteps={executionSteps.length}
        speed={speed}
        onStep={handleStep}
        onStepBack={handleStepBack}
        onPlayPause={handlePlayPause}
        onReset={handleReset}
        onSpeedChange={setSpeed}
      />
    </div>
  );
}
