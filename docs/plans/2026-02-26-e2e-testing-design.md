# E2E Testing with Playwright + GitHub Actions CI

## Goal

Automated UI verification for all 9 lessons — each lesson loads, renders content, circuits execute correctly, and no console errors occur. Runs on every push/PR to main.

## Architecture

### Test Framework: Playwright

- `@playwright/test` as the only new dependency
- `webServer` config auto-starts `npm run dev` before tests
- Chromium only in CI (fast, sufficient for smoke tests)
- Tests in `e2e/` directory, separate from Vitest unit tests in `src/`

### Test Structure

```
e2e/
  lessons.spec.ts      # Smoke tests for all 9 lessons
playwright.config.ts   # Playwright config
.github/
  workflows/
    ci.yml             # GitHub Actions workflow
```

### Test Coverage

1. **Lesson loading** (all 9): select lesson from dropdown, assert title and step count render
2. **Content rendering** (all 9): first step has expected heading text
3. **Circuit execution** (lessons with presets): step through circuit, assert state inspector probabilities
4. **Console errors**: assert zero JS errors across all tests

### CI Workflow

Single job on `ubuntu-latest`:
1. Checkout + Node 22 + `npm ci` (cached)
2. Install Playwright Chromium (cached)
3. Unit tests (`npm test`)
4. E2E tests (`npx playwright test`)
5. Upload HTML report as artifact on failure

Triggers: push to main, PRs to main.

### package.json Scripts

- `test:e2e` — `playwright test`
- `test:e2e:ui` — `playwright test --ui` (local debugging)
