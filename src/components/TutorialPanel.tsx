import React, { useState, useEffect, useRef } from 'react';
import type { Lesson, LessonStep, LessonSummary } from '../lessons/types';

// ─── Props ────────────────────────────────────────────────────────────────────

interface TutorialPanelProps {
  lessonSummaries: LessonSummary[];
  currentLesson: Lesson | null;
  currentStepIndex: number;
  isLessonLoading?: boolean;
  lessonLoadError?: string | null;
  onRetryLessonLoad?: () => void;
  onStepComplete: () => void;
  onStepBack?: () => void;
  canAdvance?: boolean;
  onExitTutorial: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onSelectLesson?: (lessonId: string) => void;
}

// ─── Simple Markdown Renderer ────────────────────────────────────────────────
//
// Handles: h1–h3 (#/##/###), bold (**), italic (*), inline code (`), fenced
// code blocks (```), links ([text](url)), unordered lists (- item), horizontal
// rules (---), and paragraph breaks. No external dependencies.

function renderMarkdown(md: string): React.ReactNode[] {
  const lines = md.split('\n');
  const nodes: React.ReactNode[] = [];
  let i = 0;
  let keyCounter = 0;
  const key = () => keyCounter++;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (line.trimStart().startsWith('```')) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // consume closing ```
      nodes.push(
        <pre key={key()} style={{
          background: '#0d1117',
          border: '1px solid #1e2a3a',
          borderRadius: '6px',
          padding: '12px 14px',
          overflowX: 'auto',
          fontSize: '12px',
          lineHeight: 1.6,
          color: '#a8c0d0',
          fontFamily: 'var(--qf-font-mono)',
          margin: '10px 0',
          whiteSpace: 'pre',
        }}>
          <code>{codeLines.join('\n')}</code>
        </pre>
      );
      continue;
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      nodes.push(<hr key={key()} style={{ border: 'none', borderTop: '1px solid #1e2a3a', margin: '16px 0' }} />);
      i++;
      continue;
    }

    // Headings
    const h3 = line.match(/^### (.+)/);
    const h2 = line.match(/^## (.+)/);
    const h1 = line.match(/^# (.+)/);
    if (h1) {
      nodes.push(<h1 key={key()} style={{ fontSize: '18px', fontWeight: 700, color: '#e8f0fe', margin: '14px 0 8px' }}>{inlineMarkdown(h1[1])}</h1>);
      i++; continue;
    }
    if (h2) {
      nodes.push(<h2 key={key()} style={{ fontSize: '15px', fontWeight: 700, color: '#c8d8f0', margin: '14px 0 6px', letterSpacing: '0.01em' }}>{inlineMarkdown(h2[1])}</h2>);
      i++; continue;
    }
    if (h3) {
      nodes.push(<h3 key={key()} style={{ fontSize: '13px', fontWeight: 600, color: '#a8c0d8', margin: '10px 0 4px' }}>{inlineMarkdown(h3[1])}</h3>);
      i++; continue;
    }

    // Markdown table (| cell | cell |)
    if (line.trim().startsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      // Filter out separator rows (|---|---|)
      const dataRows = tableLines.filter(l => !/^\s*\|[\s\-|:]+\|\s*$/.test(l));
      const parsedRows = dataRows.map(l =>
        l.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim())
      );
      const [headerRow, ...bodyRows] = parsedRows;
      nodes.push(
        <table key={key()} style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px', margin: '10px 0' }}>
          {headerRow && (
            <thead>
              <tr>
                {headerRow.map((cell, ci) => (
                  <th key={ci} style={{ padding: '5px 8px', borderBottom: '1px solid #2a3a50', color: '#8899bb', textAlign: 'left', fontWeight: 600 }}>
                    {inlineMarkdown(cell)}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {bodyRows.map((row, ri) => (
              <tr key={ri} style={{ borderBottom: '1px solid #1a2538' }}>
                {row.map((cell, ci) => (
                  <td key={ci} style={{ padding: '5px 8px', color: '#a8bbd0', verticalAlign: 'top' }}>
                    {inlineMarkdown(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
      continue;
    }

    // Unordered list — collect consecutive list items
    if (/^[-*] /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*] /.test(lines[i])) {
        items.push(lines[i].replace(/^[-*] /, ''));
        i++;
      }
      nodes.push(
        <ul key={key()} style={{ margin: '6px 0', paddingLeft: '18px', color: '#b0c4d8' }}>
          {items.map((item, idx) => (
            <li key={idx} style={{ marginBottom: '4px', lineHeight: 1.55 }}>{inlineMarkdown(item)}</li>
          ))}
        </ul>
      );
      continue;
    }

    // Empty line — paragraph break (skip)
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Paragraph — collect lines that aren't special block-level markers.
    // Only exclude actual block markers (# heading, - list, * list, ``` fence),
    // NOT inline formatting like **bold** or *italic* at start of line.
    const paraLines: string[] = [];
    while (i < lines.length && lines[i].trim() !== '' && !lines[i].trim().startsWith('|')) {
      const l = lines[i];
      // Stop at headings, fenced code, horizontal rules
      if (/^#{1,3} /.test(l)) break;
      if (l.trimStart().startsWith('```')) break;
      if (/^---+$/.test(l.trim())) break;
      // Stop at list items (dash/asterisk followed by space)
      if (/^[-*] /.test(l)) break;
      paraLines.push(l);
      i++;
    }
    if (paraLines.length > 0) {
      nodes.push(
        <p key={key()} style={{ margin: '6px 0 10px', lineHeight: 1.65, color: '#c0d0e0' }}>
          {inlineMarkdown(paraLines.join(' '))}
        </p>
      );
    } else {
      // Safety: if no parser consumed this line, skip it to prevent infinite loop
      i++;
    }
  }

  return nodes;
}

// Renders inline markdown: bold, italic, inline code, links
function inlineMarkdown(text: string): React.ReactNode {
  // Split on inline patterns in order: links first, then code, then bold, then italic
  const parts: React.ReactNode[] = [];
  // Regex: match [text](url), `code`, **bold**, *italic*
  const pattern = /\[([^\]]+)\]\(([^)]+)\)|`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let partKey = 0;

  while ((match = pattern.exec(text)) !== null) {
    // Add plain text before this match
    if (match.index > last) {
      parts.push(<React.Fragment key={partKey++}>{text.slice(last, match.index)}</React.Fragment>);
    }
    if (match[1] !== undefined) {
      // Link
      parts.push(
        <a key={partKey++} href={match[2]} target="_blank" rel="noopener noreferrer" style={{ color: '#4FC3F7', textDecoration: 'none', borderBottom: '1px solid #4FC3F744' }}
          onMouseEnter={e => (e.currentTarget.style.borderBottomColor = '#4FC3F7')}
          onMouseLeave={e => (e.currentTarget.style.borderBottomColor = '#4FC3F744')}
        >{match[1]}</a>
      );
    } else if (match[3] !== undefined) {
      // Inline code
      parts.push(
        <code key={partKey++} style={{ background: '#0d1117', border: '1px solid #1e2a3a', borderRadius: '3px', padding: '1px 5px', fontSize: '11.5px', color: '#7dd3fc', fontFamily: 'var(--qf-font-mono)' }}>
          {match[3]}
        </code>
      );
    } else if (match[4] !== undefined) {
      // Bold
      parts.push(<strong key={partKey++} style={{ color: '#e0eeff', fontWeight: 600 }}>{match[4]}</strong>);
    } else if (match[5] !== undefined) {
      // Italic
      parts.push(<em key={partKey++} style={{ color: '#b8d0f0', fontStyle: 'italic' }}>{match[5]}</em>);
    }
    last = match.index + match[0].length;
  }

  if (last < text.length) {
    parts.push(<React.Fragment key={partKey++}>{text.slice(last)}</React.Fragment>);
  }

  return parts.length === 1 ? parts[0] : parts;
}

// ─── Action Box ───────────────────────────────────────────────────────────────

function ActionBox({ step }: { step: LessonStep }) {
  if (!step.action) return null;

  const actionTypeLabel: Record<string, string> = {
    'place-gate': 'Action Required',
    'click-play': 'Action Required',
    'click-step': 'Action Required',
    'click-reset': 'Action Required',
    'observe': 'Observe',
    'read': 'Continue When Ready',
  };

  const label = actionTypeLabel[step.action.type] ?? 'Action';
  const isPassive = step.action.type === 'read' || step.action.type === 'observe';

  return (
    <div style={{
      margin: '14px 0 4px',
      padding: '12px 14px',
      borderLeft: `3px solid #4FC3F7`,
      background: isPassive ? '#0d1a2e' : '#0a1e30',
      borderRadius: '0 6px 6px 0',
    }}>
      <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4FC3F7', marginBottom: '5px', fontFamily: 'var(--qf-font-mono)' }}>
        {label}
      </div>
      <div style={{ fontSize: '13px', color: '#d0e4f4', lineHeight: 1.5 }}>
        {step.action.description}
      </div>
    </div>
  );
}

// ─── Lesson Menu ─────────────────────────────────────────────────────────────

interface LessonMenuProps {
  lessonSummaries: LessonSummary[];
  currentLessonId: string | null;
  onSelect: (lessonId: string) => void;
  onClose: () => void;
}

function LessonMenu({ lessonSummaries, currentLessonId, onSelect, onClose }: LessonMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  return (
    <div ref={ref} style={{
      position: 'absolute',
      top: '40px',
      right: '8px',
      width: '280px',
      background: '#101e35',
      border: '1px solid #1e2a3a',
      borderRadius: '8px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
      zIndex: 100,
      overflow: 'hidden',
    }}>
      <div style={{ padding: '10px 14px 6px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4a6080', fontFamily: 'var(--qf-font-mono)' }}>
        Select a Lesson
      </div>
      {lessonSummaries.map((lesson, idx) => {
        const isActive = lesson.id === currentLessonId;
        return (
          <button
            key={lesson.id}
            onClick={() => { onSelect(lesson.id); onClose(); }}
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'left',
              background: isActive ? '#1a2e4a' : 'transparent',
              border: 'none',
              padding: '10px 14px',
              cursor: 'pointer',
              borderBottom: idx < lessonSummaries.length - 1 ? '1px solid #111d30' : 'none',
              transition: 'background 0.12s',
            }}
            onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = '#111d2e'; }}
            onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                background: isActive ? '#4FC3F7' : '#1e2a3a',
                color: isActive ? '#0d1117' : '#607090',
                fontSize: '11px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                {idx + 1}
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: isActive ? '#e0f0ff' : '#b0c4d8' }}>
                  {lesson.title}
                </div>
                <div style={{ fontSize: '10px', color: '#4a6080', marginTop: '1px' }}>
                  {lesson.estimatedMinutes} min
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ─── TutorialPanel ────────────────────────────────────────────────────────────

export default function TutorialPanel({
  lessonSummaries,
  currentLesson,
  currentStepIndex,
  isLessonLoading = false,
  lessonLoadError = null,
  onRetryLessonLoad,
  onStepComplete,
  onStepBack,
  canAdvance,
  onExitTutorial,
  isCollapsed,
  onToggleCollapse,
  onSelectLesson,
}: TutorialPanelProps) {
  const [showLessonMenu, setShowLessonMenu] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const step: LessonStep | null = currentLesson ? (currentLesson.steps[currentStepIndex] ?? null) : null;
  const totalSteps = currentLesson?.steps.length ?? 0;
  const isLastStep = currentStepIndex === totalSteps - 1;
  const fallbackCanAdvance = !step?.action || step.action.type === 'read' || step.action.type === 'observe';
  const canProceed = canAdvance ?? fallbackCanAdvance;

  // Scroll content to top whenever step changes
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [currentStepIndex, currentLesson?.id]);

  // ── Collapsed state ────────────────────────────────────────────────────────
  if (isCollapsed) {
    return (
      <div style={{
        width: '32px',
        flexShrink: 0,
        background: '#16213e',
        borderLeft: '1px solid #1e2a3a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '12px',
        gap: '12px',
        transition: 'width 0.25s ease',
      }}>
        <button
          onClick={onToggleCollapse}
          title="Expand Tutorial"
          style={{
            width: '24px',
            height: '24px',
            background: 'none',
            border: '1px solid #1e2a3a',
            borderRadius: '4px',
            color: '#4a6080',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
          }}
        >
          ‹
        </button>
        {currentLesson && (
          <div style={{
            writingMode: 'vertical-rl',
            fontSize: '10px',
            color: '#4a6080',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            marginTop: '8px',
            userSelect: 'none',
          }}>
            Tutorial
          </div>
        )}
      </div>
    );
  }

  // ── Expanded state ─────────────────────────────────────────────────────────
  return (
    <div style={{
      width: '320px',
      flexShrink: 0,
      background: '#16213e',
      borderLeft: '1px solid #1e2a3a',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      transition: 'width 0.25s ease',
      position: 'relative',
    }}>

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 12px',
        borderBottom: '1px solid #1e2a3a',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          {/* Collapse toggle */}
          <button
            onClick={onToggleCollapse}
            title="Collapse Tutorial"
            style={{
              width: '24px',
              height: '24px',
              background: 'none',
              border: '1px solid #1e2a3a',
              borderRadius: '4px',
              color: '#4a6080',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              flexShrink: 0,
            }}
          >
            ›
          </button>
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#5a7a98', letterSpacing: '0.12em', textTransform: 'uppercase', minWidth: 0, fontFamily: 'var(--qf-font-mono)' }}>
            {currentLesson ? 'Tutorial' : 'JokoQuantum'}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Lesson selector button */}
          <button
            onClick={() => setShowLessonMenu(v => !v)}
            title="Choose a lesson"
            style={{
              height: '26px',
              padding: '0 8px',
              background: showLessonMenu ? '#1a2e4a' : 'none',
              border: '1px solid #1e2a3a',
              borderRadius: '4px',
              color: '#607090',
              fontSize: '11px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            Lessons ▾
          </button>

          {/* Free Play */}
          <button
            onClick={onExitTutorial}
            title="Exit tutorial and free-play"
            style={{
              height: '26px',
              padding: '0 8px',
              background: 'none',
              border: '1px solid #1e2a3a',
              borderRadius: '4px',
              color: '#607090',
              fontSize: '11px',
            }}
          >
            Free Play
          </button>
        </div>
      </div>

      {/* Lesson menu dropdown */}
      {showLessonMenu && (
        <LessonMenu
          lessonSummaries={lessonSummaries}
          currentLessonId={currentLesson?.id ?? null}
          onSelect={(lessonId) => { onSelectLesson?.(lessonId); }}
          onClose={() => setShowLessonMenu(false)}
        />
      )}

      {/* No lesson selected — landing state */}
      {!currentLesson && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', gap: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '28px' }}>⚛</div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#c0d8f0', marginBottom: '8px' }}>Welcome to JokoQuantum</div>
            <div style={{ fontSize: '12px', color: '#607090', lineHeight: 1.6 }}>
              Choose a lesson to begin the guided tutorial, or click <strong style={{ color: '#a0b8d0' }}>Free Play</strong> to explore the circuit simulator on your own.
            </div>
          </div>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {isLessonLoading && (
              <div style={{
                background: '#0f1923',
                border: '1px solid #1e2a3a',
                borderRadius: '8px',
                padding: '10px 12px',
                textAlign: 'left',
              }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#4FC3F7', marginBottom: '4px' }}>
                  Loading lesson...
                </div>
                <div style={{ fontSize: '10px', color: '#607090' }}>
                  The first lesson is being prepared.
                </div>
              </div>
            )}
            {lessonLoadError && (
              <div style={{
                background: '#2a1114',
                border: '1px solid #66333a',
                borderRadius: '8px',
                padding: '10px 12px',
                textAlign: 'left',
              }}>
                <div style={{ fontSize: '11px', color: '#ff9aa6', marginBottom: '8px' }}>{lessonLoadError}</div>
                <button
                  onClick={() => onRetryLessonLoad?.()}
                  style={{
                    height: '26px',
                    padding: '0 10px',
                    background: '#3a1a20',
                    border: '1px solid #7a3a46',
                    borderRadius: '6px',
                    color: '#ffd5db',
                    fontSize: '11px',
                    cursor: 'pointer',
                  }}
                >
                  Retry loading
                </button>
              </div>
            )}
            <div style={{
              background: '#0f1923',
              border: '1px solid #1e2a3a',
              borderRadius: '8px',
              padding: '10px 12px',
              textAlign: 'left',
            }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#7dd3fc', marginBottom: '6px' }}>
                How to use this UI
              </div>
              <div style={{ fontSize: '10px', color: '#9ab3cc', lineHeight: 1.6 }}>
                1. Pick a lesson below.<br />
                2. Read the current step in this panel.<br />
                3. Perform the action in the Action Required box.<br />
                4. Use Step or Play at the bottom to run gates.<br />
                5. Click Next to continue.
              </div>
            </div>
            {lessonSummaries.map((lesson, idx) => (
              <button
                key={lesson.id}
                onClick={() => { onSelectLesson?.(lesson.id); }}
                disabled={isLessonLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: '#0f1923',
                  border: '1px solid #1e2a3a',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  cursor: isLessonLoading ? 'not-allowed' : 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.12s, border-color 0.12s',
                  opacity: isLessonLoading ? 0.65 : 1,
                }}
                onMouseEnter={e => {
                  if (isLessonLoading) return;
                  (e.currentTarget as HTMLButtonElement).style.background = '#121f32';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = '#2a3a50';
                }}
                onMouseLeave={e => {
                  if (isLessonLoading) return;
                  (e.currentTarget as HTMLButtonElement).style.background = '#0f1923';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = '#1e2a3a';
                }}
              >
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: '#1e2a3a',
                  color: '#4FC3F7',
                  fontSize: '12px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {idx + 1}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#b0c8e0' }}>{lesson.title}</div>
                  <div style={{ fontSize: '10px', color: '#4a6080', marginTop: '2px' }}>{lesson.estimatedMinutes} min · {lesson.totalSteps} steps</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active lesson content */}
      {currentLesson && step && (
        <>
          {/* Lesson title + progress bar */}
          <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid #1e2a3a', flexShrink: 0 }}>
            <div style={{ fontSize: '11px', color: '#4FC3F7', fontWeight: 600, marginBottom: '3px', letterSpacing: '0.02em' }}>
              {currentLesson.title}
            </div>
            <div style={{ fontSize: '10px', color: '#4a6080', marginBottom: '8px' }}>
              Step {currentStepIndex + 1} of {totalSteps}
            </div>
            {/* Progress bar */}
            <div style={{ height: '3px', background: '#0d1117', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${((currentStepIndex + 1) / totalSteps) * 100}%`,
                background: '#4FC3F7',
                borderRadius: '2px',
                transition: 'width 0.3s ease',
              }} />
            </div>
          </div>

          {/* Step title */}
          <div style={{ padding: '12px 14px 0', flexShrink: 0 }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#e0eeff', lineHeight: 1.3 }}>
              {step.title}
            </div>
            {!canProceed && step.action && (
              <div style={{
                marginTop: '8px',
                padding: '8px 10px',
                borderRadius: '6px',
                background: '#261a0d',
                border: '1px solid #5b3d18',
                fontSize: '11px',
                color: '#f7cd88',
                lineHeight: 1.5,
              }}>
                Waiting for action: {step.action.description}
              </div>
            )}
          </div>

          {/* Scrollable content area */}
          <div ref={contentRef} style={{ flex: 1, overflowY: 'auto', padding: '10px 14px 0' }}>
            {renderMarkdown(step.content)}
            <ActionBox step={step} />
            {/* Bottom padding */}
            <div style={{ height: '20px' }} />
          </div>

          {/* Footer: navigation buttons */}
          <div style={{
            padding: '10px 14px',
            borderTop: '1px solid #1e2a3a',
            display: 'flex',
            gap: '8px',
            flexShrink: 0,
          }}>
            {/* Back button */}
            <button
              onClick={() => onStepBack?.()}
              disabled={currentStepIndex === 0}
              style={{
                flex: 1,
                height: '34px',
                background: 'none',
                border: '1px solid #1e2a3a',
                borderRadius: '6px',
                color: currentStepIndex === 0 ? '#2a3a50' : '#607090',
                fontSize: '12px',
                fontWeight: 600,
                cursor: currentStepIndex === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              ← Back
            </button>

            {/* Next / Finish button */}
            <button
              onClick={onStepComplete}
              disabled={!canProceed}
              style={{
                flex: 2,
                height: '34px',
                background: canProceed ? '#4FC3F7' : '#1e2a3a',
                border: 'none',
                borderRadius: '6px',
                color: canProceed ? '#0d1117' : '#3a5070',
                fontSize: '12px',
                fontWeight: 700,
                cursor: canProceed ? 'pointer' : 'default',
                letterSpacing: '0.02em',
                transition: 'background 0.15s, color 0.15s',
              }}
              onMouseEnter={e => { if (canProceed) (e.currentTarget as HTMLButtonElement).style.background = '#7dd3fc'; }}
              onMouseLeave={e => { if (canProceed) (e.currentTarget as HTMLButtonElement).style.background = '#4FC3F7'; }}
            >
              {isLastStep ? 'Finish Lesson' : step.action && !canProceed ? 'Complete the action above' : 'Next →'}
            </button>
          </div>
        </>
      )}

      {/* Active lesson but step is out of bounds — shouldn't happen, but guard */}
      {currentLesson && !step && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center', color: '#4a6080', fontSize: '13px' }}>
          Lesson complete. Choose another lesson or click Free Play.
        </div>
      )}
    </div>
  );
}
