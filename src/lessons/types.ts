export interface LessonStep {
  title: string;
  content: string;         // markdown content for the tutorial panel
  action?: {               // what the user needs to do to advance
    type: 'place-gate' | 'click-play' | 'click-step' | 'click-reset' | 'observe' | 'read';
    gateId?: string;       // for place-gate actions
    targetQubit?: number;
    column?: number;
    description: string;   // shown as instruction, e.g. "Drag an H gate onto qubit 0"
  };
  highlightElements?: string[];  // IDs of UI elements to spotlight
  circuitPreset?: {        // optionally pre-load a circuit state
    numQubits: number;
    gates: { gateId: string; targetQubits: number[]; column: number }[];
  };
}

export interface Lesson {
  id: string;
  title: string;
  description: string;       // one-line summary
  estimatedMinutes: number;
  prerequisites: string[];   // lesson IDs
  steps: LessonStep[];
}

export interface LessonSummary {
  id: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  prerequisites: string[];
  totalSteps: number;
}
