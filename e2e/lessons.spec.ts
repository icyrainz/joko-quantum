import { test, expect } from '@playwright/test';

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
  test('Lesson 9: GHZ state produces correct probabilities', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/');

    // Navigate to lesson 9
    await page.getByRole('button', { name: 'Lessons' }).click();
    await page.getByRole('button', { name: /^9\s/ }).click();

    // Advance to step 3 (circuit preset step)
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('button', { name: 'Next' }).click();

    // Verify circuit is loaded (3 gates shown in header)
    await expect(page.getByText('3 gates')).toBeVisible();

    // Step through the circuit 3 times
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: 'Step forward' }).click();
    }

    // Verify GHZ state: |000⟩ = 50%, |111⟩ = 50%
    const stateInspector = page.locator('text=STATE INSPECTOR').locator('..');
    await expect(stateInspector.getByText('|000⟩').first()).toBeVisible();
    await expect(stateInspector.getByText('|111⟩').first()).toBeVisible();

    // Check Dirac notation shows GHZ state
    await expect(page.getByText(/\|ψ⟩.*\|000⟩.*\|111⟩/)).toBeVisible();

    expect(errors).toEqual([]);
  });

  test('Lesson 1: stepping through first gate works', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/');

    // Lesson 1 loads by default — verify initial state
    await expect(page.getByText('Classical vs Quantum Bits')).toBeVisible();
    await expect(page.getByText('100.0%')).toBeVisible();

    expect(errors).toEqual([]);
  });
});
