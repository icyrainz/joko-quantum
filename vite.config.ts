import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    // Run tests in a Node-compatible environment (no browser needed for the
    // pure-math engine).
    environment: 'node',
    // Glob that picks up our test files.
    include: ['src/**/__tests__/**/*.test.ts'],
  },
})
