import { lesson1 } from './lesson1-classical-vs-quantum';
import { lesson2 } from './lesson2-hadamard-superposition';
import { lesson3 } from './lesson3-phase';
import { lesson4 } from './lesson4-entanglement';
import { lesson5 } from './lesson5-teleportation';
import type { Lesson, LessonSummary } from './types';

export const DEFAULT_LESSON_ID = 'lesson1';
export const DEFAULT_LESSON: Lesson = lesson1;

export const LESSON_CATALOG: LessonSummary[] = [
  {
    id: 'lesson1',
    title: 'Classical vs Quantum Bits',
    description: 'Understand the qubit, probability amplitudes, and your first quantum gate.',
    estimatedMinutes: 15,
    prerequisites: [],
    totalSteps: 10,
  },
  {
    id: 'lesson2',
    title: 'The Hadamard Gate and Superposition',
    description: 'Create genuine quantum superpositions and discover interference between probability amplitudes.',
    estimatedMinutes: 20,
    prerequisites: ['lesson1'],
    totalSteps: 11,
  },
  {
    id: 'lesson3',
    title: 'Phase and the Z Gate Family',
    description: 'Discover the hidden dimension of quantum amplitudes — phase — and learn why it drives all interference.',
    estimatedMinutes: 18,
    prerequisites: ['lesson2'],
    totalSteps: 9,
  },
  {
    id: 'lesson4',
    title: 'Two Qubits and Entanglement',
    description: 'Expand to two qubits, learn the CNOT gate, and create entangled Bell states.',
    estimatedMinutes: 25,
    prerequisites: ['lesson3'],
    totalSteps: 10,
  },
  {
    id: 'lesson5',
    title: 'Quantum Teleportation',
    description: 'Use entanglement and classical communication to transfer an unknown quantum state across any distance.',
    estimatedMinutes: 30,
    prerequisites: ['lesson4'],
    totalSteps: 12,
  },
];

export async function loadLessonById(id: string): Promise<Lesson | null> {
  const lessons: Record<string, Lesson> = {
    lesson1,
    lesson2,
    lesson3,
    lesson4,
    lesson5,
  };
  return lessons[id] ?? null;
}
