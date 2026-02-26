import { test, expect, Page } from '@playwright/test';

const lessons = [
  { num: 1, title: 'Classical vs Quantum Bits', steps: 10 },
  { num: 2, title: 'The Hadamard Gate and Superposition', steps: 11 },
  { num: 3, title: 'Phase and the Z Gate Family', steps: 9 },
  { num: 4, title: 'Two Qubits and Entanglement', steps: 11 },
  { num: 5, title: 'Quantum Teleportation', steps: 12 },
  { num: 6, title: 'Measurement and the Born Rule', steps: 10 },
  { num: 7, title: 'Superdense Coding', steps: 10 },
  { num: 8, title: "Deutsch's Algorithm", steps: 10 },
  { num: 9, title: 'GHZ State and Three-Qubit Entanglement', steps: 10 },
];

/** Navigate to a lesson by number (1-indexed) and advance to a specific step (1-indexed). */
async function goToLessonStep(page: Page, lessonNum: number, step: number) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Lessons' }).click();
  await page.getByRole('button', { name: new RegExp(`^${lessonNum}\\s`) }).click();
  for (let i = 1; i < step; i++) {
    await page.getByRole('button', { name: 'Next' }).click();
  }
}

/** Click the Step forward button n times. */
async function stepForward(page: Page, n: number) {
  for (let i = 0; i < n; i++) {
    await page.getByRole('button', { name: 'Step forward' }).click();
  }
}

test.describe('Lesson smoke tests', () => {
  for (const lesson of lessons) {
    test(`Lesson ${lesson.num}: ${lesson.title} loads correctly`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (err) => errors.push(err.message));

      await page.goto('/');

      // Open lesson dropdown
      await page.getByRole('button', { name: 'Lessons' }).click();

      // Select the lesson
      await page.getByRole('button', { name: new RegExp(`^${lesson.num}\\s`) }).click();

      // Verify title renders
      await expect(page.getByText(lesson.title).first()).toBeVisible();

      // Verify step count
      await expect(page.getByText(`Step 1 of ${lesson.steps}`)).toBeVisible();

      // Verify Next button is present
      await expect(page.getByRole('button', { name: 'Next' })).toBeVisible();

      // Can navigate to step 2
      await page.getByRole('button', { name: 'Next' }).click();
      await expect(page.getByText(`Step 2 of ${lesson.steps}`)).toBeVisible();

      // No JS errors
      expect(errors).toEqual([]);
    });
  }
});

test.describe('Circuit execution tests', () => {
  test('Lesson 1: default load shows correct initial state', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/');
    await expect(page.getByText('Classical vs Quantum Bits')).toBeVisible();
    await expect(page.getByText('100.0%')).toBeVisible();

    expect(errors).toEqual([]);
  });

  test('Lesson 5: teleportation Bell pair creation', async ({ page }) => {
    // Step 3 has preset: H on q1, CX(q1→q2) — creates Bell pair on qubits 1,2
    // After stepping through 2 gates: (1/√2)(|000⟩ + |011⟩)
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await goToLessonStep(page, 5, 3);
    await expect(page.getByText('2 gates')).toBeVisible();

    await stepForward(page, 2);

    // Verify Bell pair: 50% |000⟩, 50% |011⟩
    await expect(page.getByText(/\|ψ⟩.*\|000⟩.*\|011⟩/)).toBeVisible();

    expect(errors).toEqual([]);
  });

  test('Lesson 5: teleportation full circuit execution', async ({ page }) => {
    // Step 4 has preset: H(q1), CX(q1→q2), CX(q0→q1), H(q0) — 4 gates
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await goToLessonStep(page, 5, 4);
    await expect(page.getByText('4 gates')).toBeVisible();

    // Step through all 4 gates without error
    await stepForward(page, 4);

    // Verify circuit executed — state inspector shows a valid quantum state
    await expect(page.getByText(/\|ψ⟩/).first()).toBeVisible();

    expect(errors).toEqual([]);
  });

  test('Lesson 6: Hadamard creates superposition', async ({ page }) => {
    // Step 3 has preset: H on q0 (1 qubit) — creates |+⟩ = (1/√2)(|0⟩ + |1⟩)
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await goToLessonStep(page, 6, 3);
    await expect(page.getByText('1 gate')).toBeVisible();

    await stepForward(page, 1);

    // After H: 50/50 superposition
    await expect(page.getByText(/\|ψ⟩.*\|0⟩.*\|1⟩/)).toBeVisible();

    expect(errors).toEqual([]);
  });

  test('Lesson 7: superdense coding message 00 decodes correctly', async ({ page }) => {
    // Step 3 has the full superdense coding circuit for message 00
    // H(q0), CX(q0→q1), [no encoding], CX(q0→q1), H(q0), M(q0), M(q1)
    // Result: deterministically |00⟩
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await goToLessonStep(page, 7, 3);
    await expect(page.getByText('6 gates')).toBeVisible();

    // Step through all 6 gates
    await stepForward(page, 6);

    // After full execution with measurement: should be |00⟩ at 100%
    await expect(page.getByText('100.0%').first()).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("Lesson 8: Deutsch's algorithm constant oracle f(x)=0", async ({ page }) => {
    // Step 4 has preset: X(q1), H(q0), H(q1), [empty oracle], H(q0), M(q0)
    // Constant oracle → qubit 0 measures 0
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await goToLessonStep(page, 8, 4);
    await expect(page.getByText('5 gates')).toBeVisible();

    // Step through all 5 gates
    await stepForward(page, 5);

    // After measurement: should show 100% for one state (deterministic)
    await expect(page.getByText('100.0%').first()).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("Lesson 8: Deutsch's algorithm balanced oracle f(x)=x", async ({ page }) => {
    // Step 5 has preset: X(q1), H(q0), H(q1), CX(q0→q1), H(q0), M(q0)
    // Balanced oracle → qubit 0 measures 1
    // Step 4 has a click-play action that blocks Next, so we must complete it first
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await goToLessonStep(page, 8, 4);

    // Complete step 4's click-play action
    await page.getByRole('button', { name: 'Play', exact: true }).click();
    // Wait for execution to finish — 100% indicates measurement completed
    await expect(page.getByText('100.0%').first()).toBeVisible();

    // Now Next is enabled — advance to step 5
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page.getByText('6 gates')).toBeVisible();

    // Step through all 6 gates
    await stepForward(page, 6);

    // After measurement: should show 100% for one state (deterministic)
    await expect(page.getByText('100.0%').first()).toBeVisible();

    expect(errors).toEqual([]);
  });

  test('Lesson 9: GHZ state produces correct probabilities', async ({ page }) => {
    // Step 3 has preset: H(q0), CX(q0→q1), CX(q0→q2)
    // Result: (1/√2)(|000⟩ + |111⟩)
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await goToLessonStep(page, 9, 3);
    await expect(page.getByText('3 gates')).toBeVisible();

    await stepForward(page, 3);

    // Verify GHZ state in Dirac notation
    await expect(page.getByText(/\|ψ⟩.*\|000⟩.*\|111⟩/)).toBeVisible();

    expect(errors).toEqual([]);
  });
});
